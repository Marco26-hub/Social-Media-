import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { NextRequest } from 'next/server'
import { isDemo } from '@/lib/demo'
import { demoLogs } from '@/lib/demo-data'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    if (isDemo() || !dbReady()) return NextResponse.json(demoLogs.slice(0, limit))
    const cid = await requireClienteId()
    const rows = await q(
      'SELECT * FROM log_pubblicazioni WHERE cliente_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [cid, limit]
    )
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
