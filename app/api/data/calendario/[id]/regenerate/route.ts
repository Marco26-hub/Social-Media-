import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { buildBrandContext } from '@/lib/brand-context'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { callAI, extractJSON } from '@/lib/ai'
import { jsonbParam, pickJson, pickText } from '@/lib/content-quality'
import { apiError } from '@/lib/api-error'
import { evaluateNarrativeContract } from '@/lib/format-narrative'
import { toYmd } from '@/lib/publish/blotato-map'
import { readGateReason, readGenerationGate } from '@/lib/generation-gates'

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
    const body = await request.json().catch(() => ({})) as { model?: string; openrouter_key?: string }

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
    const gate = readGenerationGate(row.status, row.note)
    if (!gate) {
      return NextResponse.json({
        error: 'Questo contenuto non e stato fermato dalla generazione. Per gli errori di pubblicazione usa Riprova pubblicazione.',
      }, { status: 409 })
    }
    const gateReason = readGateReason(row.note)

    const [brandRows, productRows] = await Promise.all([
      q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [cid]),
      row.product_id
        ? q('SELECT * FROM prodotti WHERE cliente_id = $1 AND product_id = $2 LIMIT 1', [cid, row.product_id])
        : Promise.resolve([]),
    ])
    const brand = (brandRows[0] || null) as Record<string, unknown> | null
    const product = (productRows[0] || null) as Record<string, unknown> | null
    const urls = mediaUrls(row)
    const channel = String(row.canale || 'instagram')
    const format = String(row.formato || 'post')
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

Rigenera UN SOLO contenuto rimasto incompleto nel piano editoriale.
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
${storyRule}
Per Instagram usa al massimo 5 hashtag totali. Scrivi in italiano corretto, concreto e coerente con il formato.

Output JSON:
{"hook":"","caption":"","hashtag":"","cta":"","tema":"","primary_message":"","scenes":[],"slides":[],"overlay_text":"","alt_text":"","tags":[],"idea_visual":"","voiceover_script":"","music_mood":""}`,
    })

    const parsed = extractJSON(response) as Record<string, unknown>
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
    const primaryMessage = pickText(parsed, ['primary_message', 'messaggio_chiave', 'messaggio_principale'])
    const rigenerato = { ...parsed, formato: format, hook, caption, cta: pickText(parsed, ['cta']), primary_message: primaryMessage }
    const issues = String(row.quality_level || '') === 'high' ? evaluateNarrativeContract(rigenerato) : []
    const motivo = issues.map(issue => issue.message).join('; ')
    const nuovoStato = motivo ? 'ERRORE_MANUALE' : 'DA_APPROVARE'
    const nuovaNota = motivo ? `[NARRATIVE_GATE] ${motivo}` : null
    const nuovoErrore = motivo ? `Struttura narrativa da completare: ${motivo}` : null
    const updated = await q(
      `UPDATE calendario SET
        hook = $3, caption = $4, hashtag = $5, cta = $6,
        tema = COALESCE(NULLIF($7, ''), tema), scenes_json = $8,
        slides_json = $9, overlay_text = $10, alt_text = $11,
        tags = $12, idea_visual = $13, voiceover_script = $14,
        music_mood = $15, status = $16, note = $17,
        errore_tecnico = $18,
        primary_message = COALESCE(NULLIF($19, ''), primary_message),
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
        nuovoStato, nuovaNota, nuovoErrore, primaryMessage,
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
