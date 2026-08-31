import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { buildBrandContext } from '@/lib/brand-context'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { callAI, extractJSON } from '@/lib/ai'
import { jsonbParam, pickJson, pickText } from '@/lib/content-quality'
import { apiError } from '@/lib/api-error'
import { CAPTION_VIDEO_MAX } from '@/lib/caption-limits'
import { deriveSequenceFromMedia } from '@/lib/derive-sequence'
import {
  findCreativeNearDuplicate,
  findCrossPlatformCopyDuplicate,
  findRepeatedHashtagBlock,
  isCoordinatedCrossPlatformVariant,
  type CreativeRecord,
} from '@/lib/editorial-variation'
import { evaluateNarrativeContract } from '@/lib/format-narrative'
import { toYmd } from '@/lib/publish/blotato-map'
import { readGateReason, readGenerationGate } from '@/lib/generation-gates'
import { buildBusinessCategoryContext, resolveBusinessCategory } from '@/lib/business-categories'
import { buildStrategyProfileContext, resolveStrategyProfile } from '@/lib/strategy-profiles'
import {
  applyEditorialContentDirection,
  buildEditorialDirectionsContext,
  createEditorialContentDirections,
  editorialDirectionNotes,
} from '@/lib/editorial-content-direction'

export const dynamic = 'force-dynamic'
// Un solo contenuto: se non ce la fa in due minuti non ce la fa proprio.
export const maxDuration = 120

// Scadenza dell'intera cascata AI. Senza, i 70s valgono per OGNI modello
// (scelto + 2 fallback) e rigenerare UNO slot poteva tenere l'interfaccia
// appesa oltre tre minuti: il client qui non ha nemmeno un abort, aspetta
// finche il server non risponde.
const REGEN_BUDGET_MS = 95000

function mediaUrls(row: Record<string, unknown>): string[] {
  return Array.from({ length: 10 }, (_, i) => String(row[`link_media_${i + 1}`] || '').trim())
    .filter(Boolean)
}

function isVideoUrl(url: string): boolean {
  return url.split('?')[0].toLowerCase().endsWith('.mp4')
}

function normalizeInstagramHashtags(value: string): string {
  const tags = value.match(/#[\p{L}\p{N}_]+/gu) || []
  return [...new Set(tags)].slice(0, 5).join(' ')
}

// Rigenera SOLO uno slot creato dal fallback del piano. La riga, la data, il
// canale, il formato e i media restano gli stessi: cambia esclusivamente il
// contenuto editoriale che l'AI non era riuscita a completare.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cid = await requireClienteId()
    const body = await request.json().catch(() => ({})) as { model?: string; openrouter_key?: string; differenzia?: boolean }

    if (isDemo() || !dbReady()) {
      return NextResponse.json({
        ok: true,
        demo: true,
        content: {
          id,
          hook: 'Un nuovo punto di vista, pronto per il tuo pubblico.',
          caption: 'Contenuto rigenerato e pronto per la revisione.',
          hashtag: '#socialmedia #contenuti',
          cta: 'Scopri di piu',
          status: 'DA_APPROVARE',
          note: null,
          errore_tecnico: null,
        },
      })
    }

    const rows = await q('SELECT * FROM calendario WHERE id = $1 AND cliente_id = $2 LIMIT 1', [id, cid]) as Record<string, unknown>[]
    if (!rows.length) return NextResponse.json({ error: 'Contenuto non trovato' }, { status: 404 })

    const row = rows[0]
    // Rigenerabile ogni contenuto fermato dalla GENERAZIONE, non solo lo slot
    // vuoto: anche quelli bloccati dal cancello narrativo (Reel senza le 5 scene)
    // o dal cancello novità. Prima solo [GENERATION_FALLBACK] passava di qui, e
    // gli altri due restavano senza alcuna azione possibile nell'interfaccia:
    // solo "Riprova pubblicazione" (che tenterebbe di pubblicare un Reel senza
    // copione) o "Elimina". Un vicolo cieco su 20 contenuti su 24.
    // `differenzia` = richiesta esplicita dall'interfaccia ("Rigenera diverso")
    // su un contenuto sano: si riscrive per cambiarlo, non per ripararlo.
    const differenzia = body.differenzia === true
    const gate = readGenerationGate(row.status, row.note)
    if (!gate && !differenzia) {
      return NextResponse.json({
        error: 'Questo contenuto non e stato fermato dalla generazione. Per gli errori di pubblicazione usa Riprova pubblicazione.',
      }, { status: 409 })
    }
    // Un contenuto gia in mano a Blotato non si riscrive da qui: la copia che
    // uscira e la loro, e cambiarla solo da noi produrrebbe un calendario che
    // mente su cosa e stato pubblicato.
    if (row.blotato_post_id || String(row.status || '').toUpperCase() === 'PUBBLICATO') {
      return NextResponse.json({
        error: 'Contenuto gia inviato a Blotato o pubblicato: rimettilo in coda prima di riscriverlo.',
      }, { status: 409 })
    }
    const gateReason = readGateReason(row.note)

    // Gli altri contenuti del cliente: servono al modello per NON riscrivere un
    // hook che esiste gia. La rigenerazione non aveva alcun controllo anti-clone
    // e ha prodotto due volte lo stesso hook su concept diversi — il piano quel
    // controllo ce l'ha, questo percorso no, e riscrive proprio il campo su cui
    // il controllo si basa.
    const [brandRows, productRows, altriRows, clientRows] = await Promise.all([
      q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [cid]),
      row.product_id
        ? q('SELECT * FROM prodotti WHERE cliente_id = $1 AND product_id = $2 LIMIT 1', [cid, row.product_id])
        : Promise.resolve([]),
      q(`SELECT hook, caption, hashtag, tema, angle, primary_message, idea_visual, canale, campaign_content_key FROM calendario
          WHERE cliente_id = $1 AND id <> $2 AND coalesce(hook,'') <> ''
          ORDER BY data_pubblicazione DESC LIMIT 96`, [cid, id]),
      q('SELECT * FROM clienti WHERE id = $1 LIMIT 1', [cid]),
    ])
    const altri = (altriRows || []) as CreativeRecord[]
    const brand = (brandRows[0] || null) as Record<string, unknown> | null
    const client = (clientRows[0] || null) as Record<string, unknown> | null
    const product = (productRows[0] || null) as Record<string, unknown> | null
    const urls = mediaUrls(row)
    const channel = String(row.canale || 'instagram')
    const format = String(row.formato || 'post')
    const activeCategory = resolveBusinessCategory(row.business_category, {
      sector: brand?.settore || client?.settore,
      brandName: brand?.brand_name,
      clientName: client?.nome,
    })
    const activeProfile = resolveStrategyProfile(row.strategy_profile, {
      sector: brand?.settore || client?.settore,
      brandName: brand?.brand_name,
      clientName: client?.nome,
      campaignContext: JSON.stringify(row.campaign_source_paths || ''),
    })
    const creativeCode = /MONTHLY_DNA:\s*([^\n]+)/i.exec(String(row.production_notes || ''))?.[1]?.trim() || 'SWA-REGEN'
    const [editorialDirection] = createEditorialContentDirections({
      creativeCode,
      category: activeCategory,
      profile: activeProfile,
      slots: [{
        contentKey: String(row.campaign_content_key || row.id_contenuto || id),
        channel,
        format,
        week: Number(row.campaign_week) || null,
      }],
    })
    const storyRule = format === 'story'
      ? 'Per una Story non generare commenti o first_comment; hashtag vuoto.'
      : ''
    // La struttura che il formato PRETENDE, scritta nero su bianco: e la stessa
    // che evaluateNarrativeContract verifica subito dopo. Chiedere "rigenera" e
    // poi bocciare per una regola mai comunicata al modello e come rigenerare a
    // vuoto: il contenuto tornerebbe fermo esattamente com'era.
    const strutturaRichiesta = format === 'reel' || format === 'short' || format === 'video'
      ? 'STRUTTURA OBBLIGATORIA: "scenes" con ESATTAMENTE 5 elementi distinti, ruoli in ordine hook, tensione, prova, payoff, cta_loop. Ogni scena: numero, ruolo, secondi, descrizione, overlay_testo, visual, movimento, transizione. Le scene devono raccontare i media gia assegnati, in ordine.'
      : format === 'carousel'
        ? 'STRUTTURA OBBLIGATORIA: "slides" con 5-10 elementi distinti e progressivi (cover, problema, sviluppo/prova, payoff, CTA), uno per ogni immagine gia assegnata.'
        : format === 'story'
          ? 'STRUTTURA OBBLIGATORIA: "scenes" con ESATTAMENTE 3 frame distinti: apertura, sviluppo, risoluzione/CTA. Il terzo chiude la tensione aperta dal primo.'
          : 'Compila anche primary_message oltre a hook, caption e CTA.'

    const response = await callAI({
      model: body.model || 'google/gemma-4-31b-it:free',
      openrouterKey: body.openrouter_key,
      images: urls.filter(url => !isVideoUrl(url)),
      maxTokens: 7000,
      timeoutMs: 70000,
      deadlineAt: Date.now() + REGEN_BUDGET_MS,
      systemPrompt: 'Sei un senior social media strategist italiano. Rispondi solo con un singolo oggetto JSON valido. Non inventare prezzi, dati o claim non forniti.',
      userPrompt: `${buildBrandContext(brand)}

${buildBusinessCategoryContext(activeCategory)}

${buildStrategyProfileContext(activeProfile)}

${buildEditorialDirectionsContext([editorialDirection])}

${differenzia
  ? 'Riscrivi COMPLETAMENTE questo contenuto: deve dire la stessa cosa in modo diverso. Cambia apertura, angolo, esempio e ritmo; mantieni prodotto, obiettivo e formato. Se il testo attuale usa una domanda, non aprire con una domanda.'
  : 'Rigenera UN SOLO contenuto rimasto incompleto nel piano editoriale.'}
${differenzia ? `TESTO ATTUALE da NON ripetere: "${String(row.hook || '').slice(0, 120)}"` : ''}
${altri.length ? `HOOK GIA USATI in questo calendario — il tuo deve essere DIVERSO da tutti questi, per apertura, immagine e parole:\n${altri.slice(0, 40).map(r => `- ${String(r.hook || '').slice(0, 90)}`).join('\n')}` : ''}
${gateReason ? `MOTIVO DEL BLOCCO da risolvere in questa rigenerazione: ${gateReason}` : ''}
${strutturaRichiesta}
${gate === 'novelty' ? 'Il contenuto era troppo simile a un altro gia in calendario: cambia angolo, apertura e esempio, mantenendo prodotto e obiettivo.' : ''}
Vincoli immutabili:
- data: ${String(row.data_pubblicazione || '')}
- ora: ${String(row.ora_pubblicazione || '')}
- canale: ${channel}
- formato: ${format}
- obiettivo: ${String(row.obiettivo || 'mix')}
- tema: ${String(row.tema || 'contenuto brand')}
- prodotto: ${JSON.stringify(product || { product_id: row.product_id, nome_prodotto: row.nome_prodotto })}
- i ${urls.length} media gia assegnati devono guidare copy e struttura
- GUARDA il testo impresso sulle immagini: e la promessa gia stampata sul contenuto. Hook e caption devono proseguirla con le sue stesse parole chiave, non proporre un'idea vicina ma diversa.
${storyRule}
Per Instagram usa al massimo 5 hashtag totali. Gli hashtag stanno SOLO nel campo hashtag, mai in coda alla caption, e ognuno e' una parola breve e leggibile: vietati gli hashtag-frase che inghiottono un concetto.
${['reel','short','video','story'].includes(format) ? `La caption di questo formato non deve superare ${CAPTION_VIDEO_MAX} caratteri e deve chiudersi con una frase completa: oltre quel limite viene accorciata prima di pubblicare.` : ''}
Scrivi in italiano corretto, concreto e coerente con il formato.

Output JSON:
{"hook":"","caption":"","hashtag":"","cta":"","tema":"","primary_message":"","scenes":[],"slides":[],"overlay_text":"","alt_text":"","tags":[],"idea_visual":"","voiceover_script":"","music_mood":""}`,
    })

    const parsedRaw = extractJSON(response) as Record<string, unknown>
    const parsed = applyEditorialContentDirection(parsedRaw, editorialDirection)
    const hook = pickText(parsed, ['hook', 'titolo'])
    const caption = pickText(parsed, ['caption', 'copy', 'testo'])
    if (!hook && !caption) {
      return NextResponse.json({ error: 'La rigenerazione non ha prodotto hook o caption. Lo slot resta disponibile per un nuovo tentativo.' }, { status: 502 })
    }

    const hashtagsRaw = format === 'story' ? '' : pickText(parsed, ['hashtag', 'hashtags'])
    const hashtags = channel === 'instagram' ? normalizeInstagramHashtags(hashtagsRaw) : hashtagsRaw

    // Ricontrollo lo stesso cancello che aveva fermato il contenuto. Senza,
    // rigenerare sarebbe un lavaggio: un Reel ancora senza le 5 scene tornerebbe
    // "Da approvare" e finirebbe in pubblicazione come montaggio vuoto.
    // `primary_message` NON era ne' nello schema di risposta ne' salvato: un post
    // fermato per "messaggio principale non definito" tornava fermo dopo ogni
    // rigenerazione, all'infinito, perche il campo che gli mancava non veniva mai
    // chiesto al modello ne' scritto a DB.
    // Stessa regola del piano: se il contenuto ha gia i suoi media finali e il
    // modello non ha dichiarato la sequenza, la sequenza si deriva dai file
    // invece di lasciare il contenuto bloccato per una descrizione mancante.
    const chiaveSequenza = /carousel|carosello/i.test(format) ? 'slides' : 'scenes'
    const sequenzaModello = parsed[chiaveSequenza]
    if (!Array.isArray(sequenzaModello) || !sequenzaModello.length) {
      const derivata = deriveSequenceFromMedia(format, urls)
      if (derivata.length) parsed[chiaveSequenza] = derivata
    }

    const primaryMessage = pickText(parsed, ['primary_message', 'messaggio_chiave', 'messaggio_principale'])
    const rigenerato = { ...parsed, formato: format, hook, caption, cta: pickText(parsed, ['cta']), primary_message: primaryMessage }
    const issues = String(row.quality_level || '') === 'high' ? evaluateNarrativeContract(rigenerato) : []
    // Stesso cancello del piano: un hook identico a uno gia in calendario non
    // passa. Le varianti coordinate dello stesso concept sui due social restano
    // esenti, come nella generazione.
    const confrontabili = altri.filter(a => !isCoordinatedCrossPlatformVariant(rigenerato as CreativeRecord, a))
    const clone = findCreativeNearDuplicate(rigenerato as CreativeRecord, confrontabili)
    const platformCopy = findCrossPlatformCopyDuplicate(rigenerato as CreativeRecord, altri)
    const hashtagCopy = findRepeatedHashtagBlock(rigenerato as CreativeRecord, altri)
    const motivo = [
      ...issues.map(issue => issue.message),
      platformCopy ? `Adattamento ${channel} copiato da ${platformCopy.channel}: ${platformCopy.fields.join(', ')} identici` : '',
      hashtagCopy ? `Blocco hashtag gia usato con "${hashtagCopy.hook || 'un altro contenuto'}"` : '',
      clone ? `Somiglianza creativa ${Math.round(clone.score * 100)}% con "${clone.hook || 'un altro contenuto'}"` : '',
    ].filter(Boolean).join('; ')
    const nuovoStato = motivo ? 'ERRORE_MANUALE' : 'DA_APPROVARE'
    const nuovaNota = motivo ? `[${issues.length ? 'NARRATIVE_GATE' : 'NOVELTY_GATE'}] ${motivo}` : null
    const nuovoErrore = motivo ? `${issues.length ? 'Struttura narrativa da completare' : 'Contenuto da differenziare'}: ${motivo}` : null
    const productionNotes = [
      String(row.production_notes || '')
        .split('\n')
        .filter(line => !/^\s*(EDITORIAL_SLOT|EDITORIAL_CONCEPT|STRATEGY_PROFILE|VISUAL_SIGNATURE|CHANNEL_ADAPTATION):/i.test(line))
        .join('\n'),
      ...editorialDirectionNotes(editorialDirection),
    ].filter(Boolean).join('\n')
    const updated = await q(
      `UPDATE calendario SET
        hook = $3, caption = $4, hashtag = $5, cta = $6,
        tema = COALESCE(NULLIF($7, ''), tema), scenes_json = $8,
        slides_json = $9, overlay_text = $10, alt_text = $11,
        tags = $12, idea_visual = $13, voiceover_script = $14,
        music_mood = $15, status = $16, note = $17,
        errore_tecnico = $18,
        primary_message = COALESCE(NULLIF($19, ''), primary_message),
        production_notes = $20,
        retry_count = 0, publish_lock_id = NULL,
        updated_at = now()
       WHERE id = $1 AND cliente_id = $2
       RETURNING *`,
      [
        id, cid, hook || null, caption || null, hashtags || null,
        pickText(parsed, ['cta']) || null, pickText(parsed, ['tema']) || null,
        jsonbParam(pickJson(parsed, ['scenes', 'scene', 'frames'])),
        jsonbParam(pickJson(parsed, ['slides', 'immagini'])),
        pickText(parsed, ['overlay_text', 'overlay_testo']) || null,
        pickText(parsed, ['alt_text', 'alt']) || null,
        jsonbParam(pickJson(parsed, ['tags', 'keywords_target'])),
        pickText(parsed, ['idea_visual', 'visual']) || null,
        pickText(parsed, ['voiceover_script', 'voiceover']) || null,
        pickText(parsed, ['music_mood', 'musica_mood']) || null,
        nuovoStato, nuovaNota, nuovoErrore, primaryMessage, productionNotes,
      ],
    ) as Record<string, unknown>[]

    return NextResponse.json({
      ok: true,
      // `RETURNING *` restituisce data_pubblicazione come Date (il driver pg
      // converte le colonne `date`), che in JSON diventa "2026-09-08T00:00:00.000Z".
      // Il client fonde questa riga nel proprio stato, quindi quel valore
      // sostituiva la stringa 'YYYY-MM-DD' e l'intestazione del giorno mostrava
      // l'ISO grezzo finche non si ricaricava la pagina. La GET del calendario
      // normalizza gia con toYmd: qui mancava. E l'unica colonna `date` della
      // tabella, quindi basta lei.
      content: { ...updated[0], data_pubblicazione: toYmd(updated[0]?.data_pubblicazione) },
      // Il client mostrava sempre "rigenerato": ora sa se e davvero risolto.
      risolto: !motivo,
      motivo_residuo: motivo || null,
    })
  } catch (error) {
    return apiError(error)
  }
}
