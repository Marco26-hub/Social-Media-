import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'

export async function GET() {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const row = await q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [cid])
    return NextResponse.json(row[0] || null)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
