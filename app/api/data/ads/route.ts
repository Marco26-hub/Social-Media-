import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'

export const dynamic = 'force-dynamic'

// Storico campagne Ads del cliente attivo (generate dall'agente AUTO o dal manuale).
export async function GET() {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) return NextResponse.json([])
    const cid = await requireClienteId()
    const rows = await q('SELECT * FROM ads_campaign WHERE cliente_id = $1 ORDER BY created_at DESC LIMIT 20', [cid])
    return NextResponse.json(rows)
  } catch (e) {
    return apiError(e)
  }
}
