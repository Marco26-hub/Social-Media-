import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { demoProdotti } from '@/lib/demo-data'

const PRODOTTO_UPDATE_COLUMNS = new Set([
  'nome_prodotto', 'categoria', 'collezione', 'prezzo', 'prezzo_promo',
  'link_prodotto', 'link_img_1', 'link_img_2', 'link_img_3',
  'colori', 'taglie', 'mood', 'target', 'priorita',
  'prodotto_attivo', 'stock_status', 'stock_quantity', 'note',
])

export async function GET() {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) return NextResponse.json(demoProdotti)
    const cid = await requireClienteId()
    const rows = await q('SELECT * FROM prodotti WHERE cliente_id = $1 ORDER BY nome_prodotto', [cid])
    return NextResponse.json(rows)
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { nome_prodotto, categoria, prezzo, link_prodotto, link_img_1, note } = await request.json()
    if (!nome_prodotto) return NextResponse.json({ error: 'nome_prodotto richiesto' }, { status: 400 })
    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, id: `demo-${Date.now().toString(36)}`, product_id: `P${Date.now().toString(36).toUpperCase()}`, demo: true })
    const cid = await requireClienteId()
    const pid = `P${Date.now().toString(36).toUpperCase()}`
    const rows = await q(
      `INSERT INTO prodotti (cliente_id, product_id, nome_prodotto, categoria, prezzo, link_prodotto, link_img_1, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [cid, pid, nome_prodotto, categoria || null, parseFloat(prezzo) || null, link_prodotto || null, link_img_1 || null, note || null],
    )
    return NextResponse.json({ ok: true, id: (rows[0] as { id: string }).id, product_id: pid })
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth()
    const body = await request.json() as Record<string, unknown>
    const id = String(body.id || '')
    if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })
    const cid = await requireClienteId()

    const fields: string[] = []
    const params: unknown[] = []
    for (const [key, val] of Object.entries(body)) {
      if (!PRODOTTO_UPDATE_COLUMNS.has(key)) continue
      params.push(val === '' ? null : val)
      fields.push(`${key} = $${params.length}`)
    }
    if (!fields.length) return NextResponse.json({ error: 'niente da aggiornare' }, { status: 400 })

    params.push(id, cid)
    await q(
      `UPDATE prodotti SET ${fields.join(', ')}, updated_at = now() WHERE id = $${params.length - 1} AND cliente_id = $${params.length}`,
      params,
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
