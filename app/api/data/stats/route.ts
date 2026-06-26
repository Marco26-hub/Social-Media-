import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { demoContenuti, demoLogs } from '@/lib/demo-data'

export async function GET() {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) {
      return NextResponse.json({
        daApprovare: demoContenuti.filter(c => c.status === 'DA_APPROVARE').length,
        pubblicati7g: demoContenuti.filter(c => c.status === 'PUBBLICATO').length,
        errori: demoContenuti.filter(c => c.status === 'ERRORE' || c.status === 'ERRORE_MANUALE').length,
        inCoda: demoContenuti.filter(c => c.status === 'APPROVATO').length,
        ultimi: demoLogs.slice(0, 5),
      })
    }
    const cid = await requireClienteId()
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

    const [daApprovare, pubblicati7g, errori, inCoda, ultimi] = await Promise.all([
      q('SELECT count(*)::int as c FROM calendario WHERE cliente_id = $1 AND status = $2', [cid, 'DA_APPROVARE']),
      q('SELECT count(*)::int as c FROM calendario WHERE cliente_id = $1 AND status = $2 AND data_pubblicazione >= $3', [cid, 'PUBBLICATO', weekAgo]),
      q("SELECT count(*)::int as c FROM calendario WHERE cliente_id = $1 AND status IN ('ERRORE','ERRORE_MANUALE')", [cid]),
      q('SELECT count(*)::int as c FROM calendario WHERE cliente_id = $1 AND status = $2', [cid, 'APPROVATO']),
      q('SELECT * FROM log_pubblicazioni WHERE cliente_id = $1 ORDER BY timestamp DESC LIMIT 5', [cid]),
    ])

    return NextResponse.json({
      daApprovare: (daApprovare[0] as { c: number })?.c ?? 0,
      pubblicati7g: (pubblicati7g[0] as { c: number })?.c ?? 0,
      errori: (errori[0] as { c: number })?.c ?? 0,
      inCoda: (inCoda[0] as { c: number })?.c ?? 0,
      ultimi,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
