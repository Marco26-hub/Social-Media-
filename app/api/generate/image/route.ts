import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'
import { getPublicBaseUrl } from '@/lib/base-url'
import { isStorageConfigured, uploadToStorage } from '@/lib/storage'
import { generateImageOpenRouter, openrouterImageConfigured, aspectForFormato } from '@/lib/openrouter-image'
import { getTableColumns, mediaSlotColumns } from '@/lib/db-schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')

// Genera un'immagine AI per un contenuto tramite OPENROUTER (/api/v1/images) e la
// salva nel primo slot media libero. Se il contenuto ha già una foto prodotto
// (link_media_1), la usa come riferimento image-to-image così l'immagine generata
// resta coerente col prodotto reale. Usa la key OpenRouter (BYO dal client o env).
export async function POST(request: Request) {
  try {
    await requireAuth()
    if (!dbReady()) return NextResponse.json({ error: 'DB non disponibile' }, { status: 503 })
    const body = await request.json() as { cliente_id?: string; id_contenuto?: string; prompt?: string; model?: string; openrouter_key?: string; use_product_photo?: boolean }
    const cid = await requireClienteAccess(typeof body.cliente_id === 'string' ? body.cliente_id : undefined)
    const idContenuto = str(body.id_contenuto)
    if (!idContenuto) return NextResponse.json({ error: 'id_contenuto richiesto' }, { status: 400 })

    if (!openrouterImageConfigured(body.openrouter_key)) {
      return NextResponse.json(
        { error: 'Generazione immagini non disponibile: serve una API key OpenRouter con credito (i modelli-immagine sono a pagamento). Impostala nel pannello modello.' },
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

    // Image-to-image opzionale: se il contenuto ha già una foto (slot 1) e non è
    // stato disattivato, la passiamo come riferimento per restare on-brand.
    const existingPhoto = str(row.link_media_1)
    const inputImageUrls = body.use_product_photo !== false && /^https?:\/\//.test(existingPhoto) ? [existingPhoto] : []

    const { bytes, mime, model } = await generateImageOpenRouter({
      prompt,
      model: body.model,
      openrouterKey: body.openrouter_key,
      aspectRatio: aspectForFormato(str(row.formato)),
      inputImageUrls,
    })

    // Salva: storage persistente se configurato, altrimenti disco locale (dev).
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg'
    const filename = `openrouter-${idContenuto.toLowerCase()}-${randomUUID().slice(0, 8)}.${ext}`
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

    // Salva nel primo slot media libero (non sovrascrive foto già presenti).
    const calendarioColumns = await getTableColumns('calendario')
    const slots = mediaSlotColumns().filter(column => calendarioColumns.has(column))
    const freeSlot = slots.find(s => !str(row[s]))
    if (freeSlot) {
      await q(
        `UPDATE calendario SET ${freeSlot} = $1, fonte_media = COALESCE(fonte_media, 'openrouter_ai') WHERE cliente_id = $2 AND id_contenuto = $3`,
        [url, cid, idContenuto],
      )
    }

    return NextResponse.json({ ok: true, url, slot: freeSlot || null, prompt, model })
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
