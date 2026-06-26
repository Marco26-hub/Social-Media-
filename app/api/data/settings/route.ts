import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'

export async function GET() {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const rows = await q('SELECT * FROM settings WHERE cliente_id = $1 ORDER BY chiave', [cid])
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const { id, valore } = await request.json()
    if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
    await q('UPDATE settings SET valore = $1 WHERE id = $2 AND cliente_id = $3', [valore, id, cid])
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
