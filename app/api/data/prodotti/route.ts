import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'

export async function GET() {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const rows = await q('SELECT * FROM prodotti WHERE cliente_id = $1 ORDER BY nome_prodotto', [cid])
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const { nome_prodotto, categoria, prezzo, link_prodotto, link_img_1, note } = await request.json()
    if (!nome_prodotto) return NextResponse.json({ error: 'nome_prodotto richiesto' }, { status: 400 })
    const pid = `P${Date.now().toString(36).toUpperCase()}`
    const rows = await q(
      `INSERT INTO prodotti (cliente_id, product_id, nome_prodotto, categoria, prezzo, link_prodotto, link_img_1, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [cid, pid, nome_prodotto, categoria || null, parseFloat(prezzo) || null, link_prodotto || null, link_img_1 || null, note || null],
    )
    return NextResponse.json({ ok: true, id: (rows[0] as { id: string }).id, product_id: pid })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
