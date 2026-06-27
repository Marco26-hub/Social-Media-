import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { demoSeoAudit } from '@/lib/demo-data'

export async function GET() {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) return NextResponse.json(demoSeoAudit)
    const cid = await requireClienteId()
    const rows = await q(
      'SELECT * FROM seo_audit WHERE cliente_id = $1 ORDER BY data_audit DESC LIMIT 10',
      [cid]
    )
    return NextResponse.json(rows)
  } catch (e) {
    return apiError(e)
  }
}
