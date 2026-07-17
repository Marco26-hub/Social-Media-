import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'
import { isStorageConfigured, uploadToStorage } from '@/lib/storage'
import { generateVideoAgnes, agnesMediaKey, AGNES_VIDEO_MODEL } from '@/lib/agnes-media'
import { getTableColumns, mediaSlotColumns } from '@/lib/db-schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// La generazione video può richiedere minuti (Vercel Pro consente 300s).
export const maxDuration = 300

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')

// Genera un VIDEO con Agnes AI (agnes-video-v2.0) per un contenuto del calendario
// e lo salva nel primo slot media libero. Se Agnes risponde in modo asincrono
// (task id invece di URL), il task id viene restituito così com'è — nessun video
// finto: l'utente riprova più tardi o scarica dall'account Agnes.
export async function POST(request: Request) {
  try {
    await requireAuth()
    if (!dbReady()) return NextResponse.json({ error: 'DB non disponibile' }, { status: 503 })
    const body = await request.json() as { cliente_id?: string; id_contenuto?: string; prompt?: string; agnes_key?: string }
    const cid = await requireClienteAccess(typeof body.cliente_id === 'string' ? body.cliente_id : undefined)
    const idContenuto = str(body.id_contenuto)
    if (!idContenuto) return NextResponse.json({ error: 'id_contenuto richiesto' }, { status: 400 })
    if (!agnesMediaKey(body.agnes_key)) {
      return NextResponse.json({ error: 'Key Agnes AI mancante: configurala dal selettore modelli o come env AGNES_API_KEY.' }, { status: 503 })
    }

    const rows = await q(
      `SELECT * FROM calendario WHERE cliente_id = $1 AND id_contenuto = $2 LIMIT 1`,
      [cid, idContenuto],
    ) as Row[]
    const row = rows[0]
    if (!row) return NextResponse.json({ error: 'Contenuto non trovato' }, { status: 404 })

    // Prompt video: esplicito, o costruito da voiceover/scene/hook del contenuto.
    const prompt = str(body.prompt).trim() || [
      `Video verticale 9:16 per social media: ${str(row.hook) || str(row.tema) || str(row.nome_prodotto)}`,
      str(row.idea_visual),
      'stile professionale, luce naturale, movimento fluido, qualità premium',
    ].filter(Boolean).join('. ')

    const result = await generateVideoAgnes({ prompt, apiKey: body.agnes_key })

    // Risposta asincrona: niente URL ancora — restituiamo il task id, onestamente.
    if (!result.url) {
      return NextResponse.json({
        ok: true,
        pending: true,
        task_id: result.taskId,
        model: AGNES_VIDEO_MODEL,
        message: 'Generazione video avviata su Agnes (asincrona): il video sarà disponibile nel tuo account Agnes a breve.',
      })
    }

    // Ri-hosting sul nostro storage (gli output esterni possono scadere).
    let url = result.url
    if (isStorageConfigured()) {
      try {
        const res = await fetch(result.url)
        if (res.ok) {
          const bytes = Buffer.from(await res.arrayBuffer())
          const mime = res.headers.get('content-type') || 'video/mp4'
          const ext = mime.includes('webm') ? 'webm' : 'mp4'
          const filename = `agnes-${idContenuto.toLowerCase()}-${randomUUID().slice(0, 8)}.${ext}`
          const hosted = await uploadToStorage(`uploads/${cid}/${filename}`, bytes, mime)
          if (hosted) url = hosted
        }
      } catch {
        // Download/upload fallito: si usa l'URL Agnes originale (funziona, ma può scadere).
      }
    }

    const calendarioColumns = await getTableColumns('calendario')
    const slots = mediaSlotColumns().filter(column => calendarioColumns.has(column))
    const freeSlot = slots.find(s => !str(row[s]))
    if (freeSlot) {
      await q(
        `UPDATE calendario SET ${freeSlot} = $1, fonte_media = COALESCE(fonte_media, 'agnes_ai'), media_type = 'video' WHERE cliente_id = $2 AND id_contenuto = $3`,
        [url, cid, idContenuto],
      )
    }

    return NextResponse.json({ ok: true, url, slot: freeSlot || null, prompt, model: AGNES_VIDEO_MODEL })
  } catch (e) {
    return apiError(e)
  }
}
