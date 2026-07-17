import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'
import { getPublicBaseUrl } from '@/lib/base-url'
import { isStorageConfigured, uploadToStorage } from '@/lib/storage'
import { generateImageComfy, sizeForFormato, comfyReachable } from '@/lib/comfy'
import { generateImageAgnes, fetchAgnesImageBytes, agnesMediaKey } from '@/lib/agnes-media'
import { getTableColumns, mediaSlotColumns } from '@/lib/db-schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')

// Dimensioni Agnes (formato "WxH" stile OpenAI) coerenti con l'aspect del formato social.
function agnesSizeForFormato(formato: string): string {
  const f = formato.toLowerCase()
  if (['reel', 'story', 'video', 'short', 'tiktok'].includes(f)) return '1024x1792' // 9:16
  if (f === 'pin') return '1024x1536' // 2:3
  return '1024x1024' // post/carousel quadrato
}

// Genera un'immagine AI per un contenuto e la salva come media (primo slot
// link_media_* libero). Due motori:
// - ComfyUI LOCALE (gratis) quando raggiungibile (app in locale sul Mac);
// - Agnes AI (agnes-image-2.1-flash) come motore CLOUD — funziona anche su
//   Vercel, serve la key (env AGNES_API_KEY o body agnes_key dal client).
export async function POST(request: Request) {
  try {
    await requireAuth()
    if (!dbReady()) return NextResponse.json({ error: 'DB non disponibile' }, { status: 503 })
    const body = await request.json() as { cliente_id?: string; id_contenuto?: string; prompt?: string; agnes_key?: string; engine?: string }
    const cid = await requireClienteAccess(typeof body.cliente_id === 'string' ? body.cliente_id : undefined)
    const idContenuto = str(body.id_contenuto)
    if (!idContenuto) return NextResponse.json({ error: 'id_contenuto richiesto' }, { status: 400 })

    // Scelta motore: esplicita (body.engine) o automatica — Comfy se raggiungibile,
    // altrimenti Agnes se c'è una key. Nessuno dei due → errore azionabile.
    const comfyOk = await comfyReachable()
    const agnesOk = Boolean(agnesMediaKey(body.agnes_key))
    const engine = body.engine === 'agnes' ? 'agnes' : body.engine === 'comfy' ? 'comfy' : (comfyOk ? 'comfy' : agnesOk ? 'agnes' : '')
    if (!engine || (engine === 'comfy' && !comfyOk) || (engine === 'agnes' && !agnesOk)) {
      return NextResponse.json(
        { error: 'Nessun motore immagini disponibile: avvia ComfyUI sul Mac (porta 8188) oppure configura la key Agnes AI (env AGNES_API_KEY o dal selettore modelli).' },
        { status: 503 },
      )
    }

    const rows = await q(
      `SELECT * FROM calendario WHERE cliente_id = $1 AND id_contenuto = $2 LIMIT 1`,
      [cid, idContenuto],
    ) as Row[]
    const row = rows[0]
    if (!row) return NextResponse.json({ error: 'Contenuto non trovato' }, { status: 404 })

    // Prompt: esplicito se fornito, altrimenti costruito dal contenuto (hook/prodotto/tema).
    const brandRows = await q('SELECT brand_name, settore, tono_voce, colori_brand FROM brand WHERE cliente_id = $1 LIMIT 1', [cid]) as Row[]
    const brand = brandRows[0] || {}
    const prompt = str(body.prompt).trim() || buildPrompt(row, brand)

    let bytes: Buffer
    let mime: string
    if (engine === 'agnes') {
      const generated = await generateImageAgnes({ prompt, size: agnesSizeForFormato(str(row.formato)), apiKey: body.agnes_key })
      // Ri-hosting obbligatorio: l'URL di output Agnes può scadere, il media del
      // contenuto deve vivere sul nostro storage.
      const img = await fetchAgnesImageBytes(generated.url)
      bytes = img.bytes
      mime = img.mime
    } else {
      const { width, height } = sizeForFormato(str(row.formato))
      const comfy = await generateImageComfy({ prompt, width, height })
      bytes = comfy.bytes
      mime = comfy.mime
    }

    // Salva: storage persistente se configurato, altrimenti disco locale (dev).
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg'
    const filename = `${engine}-${idContenuto.toLowerCase()}-${randomUUID().slice(0, 8)}.${ext}`
    const proxyPath = `/api/assets/file/${encodeURIComponent(cid)}/${encodeURIComponent(filename)}`
    let url: string
    if (isStorageConfigured()) {
      const directUrl = await uploadToStorage(`uploads/${cid}/${filename}`, bytes, mime)
      url = directUrl || `${getPublicBaseUrl(request)}${proxyPath}`
    } else {
      const dir = path.join(process.cwd(), 'public', 'uploads', cid)
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, filename), bytes)
      url = `${getPublicBaseUrl(request)}${proxyPath}`
    }

    // Salva nel primo slot media libero (non sovrascrive foto già caricate).
    const calendarioColumns = await getTableColumns('calendario')
    const slots = mediaSlotColumns().filter(column => calendarioColumns.has(column))
    const freeSlot = slots.find(s => !str(row[s]))
    if (freeSlot) {
      await q(
        `UPDATE calendario SET ${freeSlot} = $1, fonte_media = COALESCE(fonte_media, $4) WHERE cliente_id = $2 AND id_contenuto = $3`,
        [url, cid, idContenuto, engine === 'agnes' ? 'agnes_ai' : 'comfy_ai'],
      )
    }

    return NextResponse.json({ ok: true, url, slot: freeSlot || null, prompt, engine })
  } catch (e) {
    return apiError(e)
  }
}

function buildPrompt(row: Row, brand: Row): string {
  const nome = str(row.nome_prodotto)
  const tema = str(row.tema)
  const hook = str(row.hook)
  const settore = str(brand.settore) || 'fashion'
  const colori = str(brand.colori_brand)
  const soggetto = nome || tema || hook || `prodotto ${settore}`
  return [
    `Fotografia editoriale professionale di ${soggetto}`,
    `stile ${settore}, luce naturale morbida, composizione pulita, alta qualità, dettagli nitidi`,
    colori ? `palette colori: ${colori}` : '',
    'sfondo lifestyle elegante, marketing premium, fotorealistico',
  ].filter(Boolean).join(', ')
}
