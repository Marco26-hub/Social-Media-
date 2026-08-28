// Publish Bridge: invia contenuto a Blotato per pubblicazione social
// Chiamato quando status → APPROVATO. Supporta tutti i formati.

import { randomUUID } from 'node:crypto'
import { q } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { validateMediaUrls } from '@/lib/media-validate'
import { getBlotatoKey } from '@/lib/blotato-key'
import { getPinnedAccountId, getPinnedSubaccountId, resolveBlotatoTarget } from '@/lib/blotato-accounts'
import { CANALE_TO_BLOTATO, PLATFORM_REQUIREMENTS, formatoToMediaType, zonedToUtcIso, DEFAULT_TIMEZONE } from '@/lib/publish/blotato-map'
import { preflightRow } from '@/lib/publish/preflight'
import { hashtagCount, normalizeHashtagsForPublish, normalizeInstagramPublishPayload, stripHashtags } from '@/lib/hashtags'
import { remotionSourceHash, renderSwaSocialVideo } from '@/lib/remotion-renderer'

const BLOTATO_API_BASE = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'

// Kill-switch pubblicazione, DISACCOPPIATO dal demo mode.
// Permette di girare in produzione reale (registrazione/login/dati veri) SENZA
// pubblicare davvero sui social finché non si è pronti. Pubblica solo se
// PUBLISH_ENABLED === 'true'. Demo mode non pubblica mai, comunque.
export function isPublishingLive(): boolean {
  if (isDemo()) return false
  return process.env.PUBLISH_ENABLED === 'true'
}

// Legge il toggle dry_run per-cliente da settings. Combinato con isPublishingLive():
// entrambi devono essere OK per pubblicare davvero. Prima il toggle UI era ignorato
// e un cliente in "prova/dry_run" pubblicava comunque se PUBLISH_ENABLED era true.
async function isDryRunForCliente(clienteId: string): Promise<boolean> {
  try {
    const rows = await q(
      "SELECT valore FROM settings WHERE cliente_id = $1 AND chiave = 'dry_run' LIMIT 1",
      [clienteId],
    )
    const v = String((rows[0] as { valore?: string } | undefined)?.valore || '').trim().toUpperCase()
    // Default fail-safe: se il valore manca o non è esplicitamente FALSE, trattalo come dry_run.
    return v !== 'FALSE' && v !== '0' && v !== 'NO' && v !== 'OFF'
  } catch {
    // Su errore DB (es. schema non migrato) tratta come dry_run per evitare pubblicazioni sorpresa.
    return true
  }
}

type ContentRow = Record<string, unknown>

// Mapping canale/piattaforma e conversione fuso: source-of-truth in lib/publish/blotato-map.

// Esito esplicito della pubblicazione: NIENTE fallback silenzioso.
// Il chiamante sa sempre se ha davvero programmato, se è dry-run o se è stato saltato.
export type PublishOutcome =
  | { status: 'scheduled'; blotatoId: string }
  | { status: 'visual_pending'; visualId: string }
  | { status: 'visual_review'; visualId: string; mediaUrl: string }
  | { status: 'dry_run' }
  | { status: 'skipped'; reason: string }

const VIDEO_URL_RE = /\.(mp4|mov|webm|m4v)(\?|$)/i

function isVideoUrl(url: string): boolean {
  return VIDEO_URL_RE.test(url)
}

export async function scheduleOnBlotato(
  clienteId: string,
  row: ContentRow,
  timezone: string = DEFAULT_TIMEZONE,
): Promise<PublishOutcome> {
  // Guardia pubblicazione: se non live (demo o PUBLISH_ENABLED != true) → dry-run.
  // Il contenuto resta APPROVATO senza blotato_post_id: verrà pubblicato quando
  // si abilita PUBLISH_ENABLED e si rilancia la sincronizzazione Blotato.
  if (!isPublishingLive()) {
    console.warn('[Blotato] pubblicazione disabilitata (PUBLISH_ENABLED != true o demo) → dry-run, nessun post reale.')
    return { status: 'dry_run' }
  }

  // Doppia guardia: kill-switch PER-CLIENTE via settings.dry_run. Anche con
  // PUBLISH_ENABLED=true su Render, il singolo cliente resta in dry-run finché
  // non toglie manualmente il flag. Evita che un cliente in prova/onboarding
  // pubblichi per errore su account social reali.
  if (await isDryRunForCliente(clienteId)) {
    console.warn(`[Blotato] cliente ${clienteId} in dry_run (settings) → nessun post reale.`)
    return { status: 'dry_run' }
  }

  const blotatoKey = await getBlotatoKey(clienteId)
  if (!blotatoKey) {
    console.warn('[Blotato] key non configurata (né per cliente né env)')
    return { status: 'skipped', reason: 'Blotato API key non configurata' }
  }

  const canale = row.canale as string
  const formato = row.formato as string
  const isStory = formato.toLowerCase() === 'story'
  const attachedAudioUrl = String(row.reel_audio_url || '').trim()

  // 'blog' non è una piattaforma Blotato: va pubblicato altrove (CMS), non qui.
  const platform = CANALE_TO_BLOTATO[canale]
  if (!platform) {
    console.warn(`[Blotato] canale '${canale}' non pubblicabile via Blotato (es. blog) — saltato`)
    return { status: 'skipped', reason: `Canale '${canale}' non pubblicabile via Blotato` }
  }

  // accountId è OBBLIGATORIO per Blotato: identifica SU QUALE account social pubblicare.
  // Lo risolviamo dagli account collegati in Blotato (resolveBlotatoTarget), che
  // fornisce anche i campi target per-piattaforma (Facebook pageId, Pinterest boardId…).
  // Un platform_account_id già salvato sulla riga fa da override manuale (pin).
  const manualAccountId = (row.platform_account_id as string | null)?.trim() || ''
  let accountId = manualAccountId
  let target: Record<string, unknown> = { targetType: platform }
  // Quale account, tra i più account della stessa piattaforma che convivono nel workspace
  // Blotato (clienti diversi), è quello di QUESTO post: prima il pin sulla riga, poi la
  // scelta salvata per il cliente. Senza, il resolver fallisce chiuso invece di indovinare.
  const pinnedAccountId = manualAccountId || await getPinnedAccountId(clienteId, canale)
  const pinnedSubaccountId = await getPinnedSubaccountId(clienteId, canale)
  // Anche quando la riga ha gia platform_account_id dobbiamo risolvere il target
  // completo. Facebook richiede pageId: proseguire col solo accountId produce un
  // invio accettato inizialmente ma destinato a fallire lato Meta.
  const resolved = await resolveBlotatoTarget(blotatoKey, canale, row, pinnedAccountId, pinnedSubaccountId)
  target = resolved.target
  accountId = resolved.accountId
  if (!accountId) {
    throw new Error(`Account Blotato non collegato per il canale '${canale}': collega l'account nel workspace Blotato`)
  }

  const requiredTargetFields = PLATFORM_REQUIREMENTS[platform]?.targetRequired || []
  const missingTargetFields = requiredTargetFields.filter(field => !String(target[field] || '').trim())
  if (missingTargetFields.length) {
    throw new Error(`${platform}: destinazione Blotato incompleta (${missingTargetFields.join(', ')} mancante). Seleziona account e Page corretti nella scheda cliente.`)
  }

  // Campi target dipendenti dal FORMATO (non dall'account, quindi qui e non nel resolver):
  // - mediaType per IG/FB: senza, un post-immagine finisce reel di default → sbagliato.
  // - firstComment IG: gli hashtag Instagram vanno nel primo commento, tranne nelle
  //   story che non supportano commenti nel payload Blotato.
  // - link FB: anteprima link per i post Facebook.
  // Un file audio separato puo diventare pubblicabile solo se incorporato in un
  // video. I formati statici con audio sono quindi adattamenti video espliciti:
  // IG Story resta Story video; Post/Carosello e Facebook Story diventano Reel.
  const staticAudioVideo = Boolean(attachedAudioUrl) && ['post', 'pin', 'carousel'].includes(formato.toLowerCase())
  const facebookAudioStory = Boolean(attachedAudioUrl) && platform === 'facebook' && isStory
  const effectiveFormato = staticAudioVideo || facebookAudioStory ? 'reel' : formato
  const mediaType = formatoToMediaType(effectiveFormato, platform)
  if (mediaType && (platform === 'instagram' || platform === 'facebook')) target.mediaType = mediaType
  const linkProdottoFinale = String(row.link_prodotto_finale || row.link_prodotto || '').trim()
  if (platform === 'facebook' && linkProdottoFinale && !isStory) target.link = linkProdottoFinale

  // Costruisci il contenuto testuale completo per la piattaforma (hook+caption+cta+hashtag).
  let text = buildPlatformContent(canale, formato, row)

  if (platform === 'instagram') {
    // Il resolver non dovrebbe aggiungerlo, ma cancellarlo sempre evita che un
    // target riutilizzato o una futura modifica rimetta un commento non valido.
    delete target.firstComment

    if (isStory) {
      // Le story non supportano firstComment. Ripuliamo anche gli hashtag dal
      // testo tecnico, che non viene mostrato come caption nelle story.
      text = stripHashtags(text)
    } else {
      const normalized = normalizeInstagramPublishPayload(text, String(row.hashtag || ''))
      text = normalized.text
      if (normalized.firstComment) target.firstComment = normalized.firstComment
    }
  }

  // Raccogli media disponibili (fino a 10 = max carosello Instagram)
  let mediaUrls = [
    row.link_media_1, row.link_media_2, row.link_media_3, row.link_media_4, row.link_media_5,
    row.link_media_6, row.link_media_7, row.link_media_8, row.link_media_9, row.link_media_10,
  ].filter((u): u is string => typeof u === 'string' && u.length > 0)

  // Validate media URLs before sending to Blotato
  if (mediaUrls.length > 0) {
    const validation = await validateMediaUrls(mediaUrls)
    if (!validation.ok) {
      const invalid = validation.errors.map(e => `[media_${e.index}] ${e.url}: ${e.reason}`).join('; ')
      throw new Error(`Media validation failed before Blotato: ${invalid}`)
    }
  }

  const scheduledTime = zonedToUtcIso(row.data_pubblicazione, row.ora_pubblicazione, timezone)

  // PRE-FLIGHT: "avvisa + blocca solo il sync". Se la riga non è pubblicabile su
  // Blotato (es. data nel passato, media mancanti, carosello fuori 2–10), NON tentiamo
  // il POST che fallirebbe: scriviamo il motivo e usciamo come skipped.
  const pf = preflightRow(effectiveFormato === formato ? row : { ...row, formato: effectiveFormato }, timezone)
  if (!pf.ok) {
    const reason = pf.errors.map(e => e.message).join('; ')
    if (row.id) {
      await q(
        `UPDATE calendario SET blotato_status = 'failed', errore_tecnico = $1, blotato_sync_at = now(), updated_at = now()
         WHERE id = $2 AND cliente_id = $3`,
        [`Pre-flight Blotato: ${reason.slice(0, 500)}`, row.id, clienteId],
      ).catch(() => {})
    }
    console.warn(`[Blotato] pre-flight KO per ${String(row.id || '')}: ${reason}`)
    return { status: 'skipped', reason }
  }

  // Lock di pubblicazione atomico: prima di POST /v2/posts marchiamo la riga con
  // publish_lock_id. Se un altro processo l'ha già lockata (retry concorrente,
  // click multiplo sul tasto Sincronizza) l'UPDATE non trova la riga e saltiamo.
  // Elimina i post duplicati su Blotato.
  const rowId = row.id ? String(row.id) : ''
  let lockId: string | null = null
  if (rowId) {
    lockId = randomUUID()
    const locked = await q(
      `UPDATE calendario
         SET publish_lock_id = $1, updated_at = now()
       WHERE id = $2 AND cliente_id = $3
         AND (publish_lock_id IS NULL OR updated_at < now() - interval '15 minutes')
         AND blotato_post_id IS NULL
       RETURNING id`,
      [lockId, rowId, clienteId],
    )
    if (!locked.length) {
      console.warn(`[Blotato] publish lock non acquisito per ${rowId}: post già in fly o completato.`)
      return { status: 'skipped', reason: 'Publish lock non acquisito (post già in fly).' }
    }
  }

  try {
  const isVideoFormat = ['reel', 'short', 'video'].includes(formato.toLowerCase())
  const isInstagramAudioStory = platform === 'instagram' && isStory && Boolean(attachedAudioUrl)
  const needsVideoRender = isVideoFormat || isInstagramAudioStory || staticAudioVideo || facebookAudioStory
  if (needsVideoRender) {
    const uploadedVideo = mediaUrls.find(isVideoUrl)
    const sourceImages = mediaUrls.filter(url => !isVideoUrl(url)).slice(0, 10)
    const renderSources = uploadedVideo ? [uploadedVideo] : sourceImages
    const hasAudio = Boolean(attachedAudioUrl)
    // Una traccia caricata dall'utente e la colonna sonora finale: tenere anche
    // l'audio del filmato crea due piste concorrenti e risultati imprevedibili.
    const keepOriginalAudio = !hasAudio
    const requestedPreset = String(row.visual_preset || '').trim().toLowerCase()
    const motionPreset = ['trending', 'premium', 'minimal', 'classico'].includes(requestedPreset)
      ? requestedPreset as 'trending' | 'premium' | 'minimal' | 'classico'
      : row.use_trending_effects === true || String(row.use_trending_effects).toLowerCase() === 'true'
        ? 'trending' as const
        : 'premium' as const

    if (uploadedVideo && !hasAudio) {
      mediaUrls = [uploadedVideo]
    } else {
      if (!renderSources.length) throw new Error('Contenuto video senza sorgenti: carica un MP4 oppure 1-10 immagini')

      const sourceHash = remotionSourceHash({
        mediaUrls: renderSources,
        audioUrl: attachedAudioUrl || undefined,
        keepOriginalAudio,
        motionPreset,
        hook: String(row.hook || '').trim() || undefined,
        cta: String(row.cta || '').trim() || undefined,
      })
      const storedSourceHash = String(row.blotato_visual_source_hash || '').trim()
      const storedVisualId = String((hasAudio ? row.blotato_audio_visual_id : row.blotato_visual_id) || '').trim()
      const storedVisualStatus = String((hasAudio ? row.blotato_audio_visual_status : row.blotato_visual_status) || '').trim().toLowerCase()
      const storedVisualUrl = String((hasAudio ? row.blotato_audio_visual_media_url : row.blotato_visual_media_url) || '').trim()
      const storedMatches = storedSourceHash === sourceHash

      if (storedMatches && storedVisualUrl && storedVisualStatus === 'approved') {
        mediaUrls = [storedVisualUrl]
      } else if (storedMatches && storedVisualUrl) {
        if (rowId) {
          if (hasAudio) {
            await q(
              `UPDATE calendario
                 SET status = 'DA_APPROVARE', blotato_status = 'visual_review',
                     blotato_audio_visual_status = 'ready_for_review', publish_lock_id = NULL,
                     errore_tecnico = NULL, blotato_audio_visual_updated_at = now(), updated_at = now()
               WHERE id = $1 AND cliente_id = $2 AND publish_lock_id = $3`,
              [rowId, clienteId, lockId],
            )
          } else {
            await q(
              `UPDATE calendario
                 SET status = 'DA_APPROVARE', blotato_status = 'visual_review',
                     blotato_visual_status = 'ready_for_review', publish_lock_id = NULL,
                     errore_tecnico = NULL, blotato_visual_updated_at = now(), updated_at = now()
               WHERE id = $1 AND cliente_id = $2 AND publish_lock_id = $3`,
              [rowId, clienteId, lockId],
            )
          }
        }
        return { status: 'visual_review', visualId: storedVisualId, mediaUrl: storedVisualUrl }
      } else {
        let reusableId = ''
        let reusableUrl = ''
        if (rowId) {
          const reusable = await q(
            hasAudio
              ? `SELECT blotato_audio_visual_id AS visual_id, blotato_audio_visual_media_url AS media_url
                   FROM calendario
                  WHERE cliente_id = $1 AND blotato_visual_source_hash = $2
                    AND id <> $3 AND blotato_audio_visual_media_url IS NOT NULL
                  ORDER BY blotato_audio_visual_updated_at DESC NULLS LAST LIMIT 1`
              : `SELECT blotato_visual_id AS visual_id, blotato_visual_media_url AS media_url
                   FROM calendario
                  WHERE cliente_id = $1 AND blotato_visual_source_hash = $2
                    AND id <> $3 AND blotato_visual_media_url IS NOT NULL
                  ORDER BY blotato_visual_updated_at DESC NULLS LAST LIMIT 1`,
            [clienteId, sourceHash, rowId],
          ) as Record<string, unknown>[]
          reusableId = String(reusable[0]?.visual_id || '').trim()
          reusableUrl = String(reusable[0]?.media_url || '').trim()
        }

        const rendered = reusableUrl
          ? { id: reusableId || `remotion:${sourceHash}`, mediaUrl: reusableUrl, sourceHash }
          : await renderSwaSocialVideo({
            clienteId,
            mediaUrls: renderSources,
            audioUrl: attachedAudioUrl || undefined,
            keepOriginalAudio,
            motionPreset,
            hook: String(row.hook || '').trim() || undefined,
            cta: String(row.cta || '').trim() || undefined,
          })

        if (rowId) {
          // Il render può durare più dei 15 minuti di scadenza del lock (vedi
          // acquisizione sopra): in quel caso un altro processo lo ha già rubato e
          // questo UPDATE non tocca nessuna riga. Senza controllare il rowcount
          // ritornavamo 'visual_review' come se fosse riuscito, lasciando l'MP4
          // orfano sullo storage e la riga in DA_APPROVARE senza visual da approvare.
          const saved = hasAudio
            ? await q(
              `UPDATE calendario
                 SET status = 'DA_APPROVARE', blotato_status = 'visual_review',
                     blotato_audio_visual_id = $1, blotato_audio_visual_status = 'ready_for_review',
                     blotato_audio_visual_media_url = $2, blotato_visual_source_hash = $3,
                     blotato_audio_visual_updated_at = now(), publish_lock_id = NULL,
                     errore_tecnico = NULL, updated_at = now()
               WHERE id = $4 AND cliente_id = $5 AND publish_lock_id = $6
               RETURNING id`,
              [rendered.id, rendered.mediaUrl, rendered.sourceHash, rowId, clienteId, lockId],
            )
            : await q(
              `UPDATE calendario
                 SET status = 'DA_APPROVARE', blotato_status = 'visual_review',
                     blotato_visual_id = $1, blotato_visual_status = 'ready_for_review',
                     blotato_visual_media_url = $2, blotato_visual_source_hash = $3,
                     blotato_visual_updated_at = now(), publish_lock_id = NULL,
                     errore_tecnico = NULL, updated_at = now()
               WHERE id = $4 AND cliente_id = $5 AND publish_lock_id = $6
               RETURNING id`,
              [rendered.id, rendered.mediaUrl, rendered.sourceHash, rowId, clienteId, lockId],
            )

          if (!saved.length) {
            console.warn(`[Blotato] lock perso durante il render di ${rowId}: montaggio ${rendered.id} non salvato (un altro processo ha ripreso la riga).`)
            return { status: 'skipped', reason: 'Lock di pubblicazione perso durante il montaggio: il contenuto verrà ripreso al prossimo tentativo.' }
          }
        }
        return { status: 'visual_review', visualId: rendered.id, mediaUrl: rendered.mediaUrl }
      }
    }
  }

  // Con un montaggio già approvato validiamo anche l'URL MP4 finale, non solo
  // le foto sorgente controllate prima del render.
  if (needsVideoRender && mediaUrls.length) {
    const validation = await validateMediaUrls(mediaUrls)
    if (!validation.ok) {
      const invalid = validation.errors.map(e => `[video] ${e.url}: ${e.reason}`).join('; ')
      throw new Error(`Video Reel non accessibile prima del publish: ${invalid}`)
    }
  }

  // Payload contratto Blotato v2 (POST /v2/posts): post{ accountId, target, content } + scheduledTime.
  // Campi confermati dallo schema MCP blotato_create_post: accountId, platform, text, mediaUrls, scheduledTime.
  const payload: Record<string, unknown> = {
    post: {
      accountId,
      target,
      content: {
        platform,
        text,
        mediaUrls,
      },
    },
    scheduledTime,
  }

  if (platform === 'instagram') {
    const finalHashtagCount = hashtagCount(`${text}\n${String(target.firstComment || '')}`)
    if (finalHashtagCount > 5) {
      throw new Error(`Guardia payload Instagram: ${finalHashtagCount} hashtag totali (massimo 5)`)
    }
    if (isStory && target.firstComment) {
      throw new Error('Guardia payload Instagram Story: firstComment non consentito')
    }
  }

  const targetLabel = platform === 'facebook' ? ` page=${String(target.pageId)}` : ''
  const mediaTypeLabel = target.mediaType ? ` mediaType=${String(target.mediaType)}` : ''
  console.log(`[Blotato] Sending ${canale}→${platform} account=${accountId}${targetLabel}${mediaTypeLabel} scheduled at ${scheduledTime}`)

  const res = await fetch(`${BLOTATO_API_BASE}/v2/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${blotatoKey}`,
      'blotato-api-key': blotatoKey,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text().catch(() => 'Unknown error')
    throw new Error(`Blotato ${res.status}: ${error.slice(0, 200)}`)
  }

  const result = await res.json()
  // Blotato in versioni diverse restituisce l'id in campi diversi. Allarghiamo il
  // fallback su tutte le forme viste (postSubmissionId, submissionId, scheduled_id,
  // data.id, post.id, item.id). Se davvero manca sempre → throw esplicito invece
  // di skipped silenzioso: il contratto è rotto e va investigato subito.
  const asStr = (v: unknown) => (typeof v === 'string' && v) || (typeof v === 'number' ? String(v) : '')
  const data = (result && typeof result === 'object' ? (result as Record<string, unknown>) : {}) as Record<string, unknown>
  const nested = (data.data || data.post || data.item || {}) as Record<string, unknown>
  const blotatoId = asStr(data.id)
    || asStr(data.postSubmissionId)
    || asStr(data.submissionId)
    || asStr(data.scheduled_id)
    || asStr(data.postId)
    || asStr(nested.id)
    || asStr(nested.postId)
    || asStr(nested.submissionId)

  if (!blotatoId) {
    throw new Error(`Blotato 2xx senza id post: contratto rotto. Body: ${JSON.stringify(result).slice(0, 200)}`)
  }

  // Aggiorna status locale. Persiste anche l'accountId risolto se la riga non
  // l'aveva (così i sync successivi e la UI lo mostrano senza ririsolvere).
  if (row.id) {
    if (!manualAccountId && accountId) {
      await q(
        `UPDATE calendario
         SET blotato_post_id = $1, blotato_status = 'scheduled', blotato_scheduled_at = $2,
             blotato_sync_at = now(), publish_lock_id = NULL, errore_tecnico = NULL, platform_account_id = $5
         WHERE id = $3 AND cliente_id = $4`,
        [String(blotatoId), scheduledTime, row.id, clienteId, accountId],
      )
    } else {
      await q(
        `UPDATE calendario
         SET blotato_post_id = $1, blotato_status = 'scheduled', blotato_scheduled_at = $2,
             blotato_sync_at = now(), publish_lock_id = NULL, errore_tecnico = NULL
         WHERE id = $3 AND cliente_id = $4`,
        [String(blotatoId), scheduledTime, row.id, clienteId],
      )
    }
  }

  return { status: 'scheduled', blotatoId: String(blotatoId) }
  } catch (error) {
    if (rowId && lockId) {
      const message = error instanceof Error ? error.message : 'Errore Blotato sconosciuto'
      try {
        await q(
          `UPDATE calendario
           SET publish_lock_id = NULL, blotato_status = 'failed',
               errore_tecnico = $1, blotato_sync_at = now(), updated_at = now()
           WHERE id = $2 AND cliente_id = $3 AND publish_lock_id = $4`,
          [`Pipeline pubblicazione: ${message.slice(0, 500)}`, rowId, clienteId, lockId],
        )
      } catch (persistError) {
        console.warn('[Blotato] rilascio publish_lock fallito:', (persistError as Error).message.slice(0, 160))
      }
    }
    throw error
  }
}

function buildPlatformContent(canale: string, formato: string, row: ContentRow): string {
  // Il chiamante calcola `isStory` con toLowerCase(); qui i confronti erano sul
  // valore grezzo. Con un `formato` scritto 'Story' (possibile via PATCH manuale)
  // il payload veniva trattato come story ma il testo riceveva CTA e link, che
  // nelle story non sono cliccabili. Una sola normalizzazione per entrambi.
  const formatoNorm = formato.trim().toLowerCase()
  const hook = (row.hook || '') as string
  const caption = (row.caption || '') as string
  const cta = (row.cta || '') as string
  const hashtag = normalizeHashtagsForPublish(canale, (row.hashtag || '') as string)
  const nomeProdotto = (row.nome_prodotto || '') as string
  const linkProdotto = ((row.link_prodotto_finale || row.link_prodotto || '') as string).trim()

  const parts: string[] = []

  if (hook) parts.push(hook)

  if (caption && caption !== hook) {
    // Per reel/short/story: caption breve
    if (['reel', 'short', 'story'].includes(formatoNorm)) {
      parts.push(caption.slice(0, 300))
    } else {
      parts.push(caption)
    }
  }

  if (cta && formatoNorm !== 'story') {
    parts.push(`\n${cta}`)
  }

  // Link prodotto: la story lo passa come sticker link (payload separato), non nel testo.
  // Tutti gli altri formati lo appendono in fondo così è cliccabile su ogni canale
  // (Instagram post/carousel non ha link cliccabile in caption, ma resta visibile).
  if (linkProdotto && formatoNorm !== 'story' && !parts.some(p => p.includes(linkProdotto))) {
    parts.push(`\n👉 ${linkProdotto}`)
  }

  if (hashtag) {
    // Instagram: hashtag nel primo commento (metadata.first_comment)
    // Facebook/TikTok/Pinterest/LinkedIn/Threads/X: hashtag nella caption
    // (per X/Threads l'AI ne genera già pochi/mirati, vedi PLATFORM_RULES)
    if (['facebook', 'tiktok', 'pinterest', 'linkedin', 'threads', 'x'].includes(canale)) {
      parts.push(`\n${hashtag}`)
    }
  }

  if (nomeProdotto && !parts.some(p => p.includes(nomeProdotto))) {
    parts.push(`\n📦 ${nomeProdotto}`)
  }

  const content = parts.join('\n\n').trim()
  return content || hook || caption || ''
}
