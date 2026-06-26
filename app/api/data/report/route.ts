import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { demoContenuti, demoLogs } from '@/lib/demo-data'

function buildStats(rows: Array<Record<string, unknown>>) {
  const stats = {
    totale: rows.length,
    daApprovare: rows.filter(c => c.status === 'DA_APPROVARE').length,
    approvati: rows.filter(c => c.status === 'APPROVATO').length,
    pubblicati: rows.filter(c => c.status === 'PUBBLICATO').length,
    errori: rows.filter(c => c.status === 'ERRORE' || c.status === 'ERRORE_MANUALE').length,
    bozze: rows.filter(c => c.status === 'BOZZA').length,
    perCanale: {} as Record<string, number>,
    perFormato: {} as Record<string, number>,
  }
  rows.forEach((item) => {
    const canale = String(item.canale || 'altro')
    const formato = String(item.formato || 'altro')
    stats.perCanale[canale] = (stats.perCanale[canale] || 0) + 1
    stats.perFormato[formato] = (stats.perFormato[formato] || 0) + 1
  })
  return stats
}

export async function GET() {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) {
      const today = new Date().toISOString().split('T')[0]
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      const stats = buildStats(demoContenuti as unknown as Array<Record<string, unknown>>)
      return NextResponse.json({
        periodo: { da: monthAgo, a: today },
        stats,
        logs: demoLogs.slice(0, 10),
        stats7gg: {},
        stats30gg: {},
        topCanali: Object.entries(stats.perCanale).map(([canale, cnt]) => ({ canale, cnt })),
        topFormati: Object.entries(stats.perFormato).map(([formato, cnt]) => ({ formato, cnt })),
        approvazioni: [],
        erroriRecenti: demoLogs.filter(log => log.errore).slice(0, 5),
      })
    }

    const cid = await requireClienteId()

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const [contenuti, stats7gg, stats30gg, topCanali, topFormati, approvazioni, erroriRecenti, recentLogs] = await Promise.all([
      q(`SELECT * FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2`, [cid, monthAgo]),
      q(`SELECT status, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY status`, [cid, weekAgo]),
      q(`SELECT status, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY status`, [cid, monthAgo]),
      q(`SELECT canale, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY canale ORDER BY cnt DESC`, [cid, monthAgo]),
      q(`SELECT formato, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY formato ORDER BY cnt DESC`, [cid, monthAgo]),
      q(`SELECT status_precedente, status_finale, count(*)::int as cnt FROM log_pubblicazioni WHERE cliente_id = $1 AND timestamp >= $2 GROUP BY status_precedente, status_finale`, [cid, monthAgo]),
      q(`SELECT id_contenuto, canale, errore FROM log_pubblicazioni WHERE cliente_id = $1 AND errore IS NOT NULL ORDER BY timestamp DESC LIMIT 10`, [cid]),
      q(`SELECT * FROM log_pubblicazioni WHERE cliente_id = $1 ORDER BY timestamp DESC LIMIT 10`, [cid]),
    ])

    return NextResponse.json({
      periodo: { da: monthAgo, a: new Date().toISOString().split('T')[0] },
      stats: buildStats(contenuti),
      logs: recentLogs,
      stats7gg: (stats7gg as Array<Record<string, unknown>>).reduce((acc, r) => {
        const key = (r as Record<string, unknown>).status as string
        const val = (r as Record<string, unknown>).cnt as number
        return { ...acc, [key]: val }
      }, {} as Record<string, number>),
      stats30gg: (stats30gg as Array<Record<string, unknown>>).reduce((acc, r) => {
        const key = (r as Record<string, unknown>).status as string
        const val = (r as Record<string, unknown>).cnt as number
        return { ...acc, [key]: val }
      }, {} as Record<string, number>),
      topCanali: topCanali,
      topFormati: topFormati,
      approvazioni: approvazioni,
      erroriRecenti: erroriRecenti.slice(0, 5),
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
