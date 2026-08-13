import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { buildBrandContext } from '@/lib/brand-context'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { callAI, extractJSON } from '@/lib/ai'
import { jsonbParam, pickJson, pickText } from '@/lib/content-quality'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

const FALLBACK_PREFIX = '[GENERATION_FALLBACK]'

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
    const isFallback = row.status === 'ERRORE_MANUALE' && String(row.note || '').startsWith(FALLBACK_PREFIX)
    if (!isFallback) {
      return NextResponse.json({
        error: 'Questo contenuto non e uno slot di generazione incompleto. Per gli errori di pubblicazione usa Riprova pubblicazione.',
      }, { status: 409 })
    }

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

    const response = await callAI({
      model: body.model || 'google/gemma-4-31b-it:free',
      openrouterKey: body.openrouter_key,
      images: urls.filter(url => !isVideoUrl(url)),
      maxTokens: 7000,
      timeoutMs: 70000,
      systemPrompt: 'Sei un senior social media strategist italiano. Rispondi solo con un singolo oggetto JSON valido. Non inventare prezzi, dati o claim non forniti.',
      userPrompt: `${buildBrandContext(brand)}

Rigenera UN SOLO contenuto rimasto incompleto nel piano editoriale.
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
{"hook":"","caption":"","hashtag":"","cta":"","tema":"","scenes":[],"slides":[],"overlay_text":"","alt_text":"","tags":[],"idea_visual":"","voiceover_script":"","music_mood":""}`,
    })

    const parsed = extractJSON(response) as Record<string, unknown>
    const hook = pickText(parsed, ['hook', 'titolo'])
    const caption = pickText(parsed, ['caption', 'copy', 'testo'])
    if (!hook && !caption) {
      return NextResponse.json({ error: 'La rigenerazione non ha prodotto hook o caption. Lo slot resta disponibile per un nuovo tentativo.' }, { status: 502 })
    }

    const hashtagsRaw = format === 'story' ? '' : pickText(parsed, ['hashtag', 'hashtags'])
    const hashtags = channel === 'instagram' ? normalizeInstagramHashtags(hashtagsRaw) : hashtagsRaw
    const updated = await q(
      `UPDATE calendario SET
        hook = $3, caption = $4, hashtag = $5, cta = $6,
        tema = COALESCE(NULLIF($7, ''), tema), scenes_json = $8,
        slides_json = $9, overlay_text = $10, alt_text = $11,
        tags = $12, idea_visual = $13, voiceover_script = $14,
        music_mood = $15, status = 'DA_APPROVARE', note = NULL,
        errore_tecnico = NULL, retry_count = 0, publish_lock_id = NULL,
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
      ],
    ) as Record<string, unknown>[]

    return NextResponse.json({ ok: true, content: updated[0] })
  } catch (error) {
    return apiError(error)
  }
}
