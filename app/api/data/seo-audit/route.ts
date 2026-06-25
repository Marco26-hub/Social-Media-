import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'

export async function GET() {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const rows = await q(
      'SELECT * FROM seo_audit WHERE cliente_id = $1 ORDER BY data_audit DESC LIMIT 10',
      [cid]
    )
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
