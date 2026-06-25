import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'

export async function GET() {
  try {
    await requireAuth()
    const cid = await requireClienteId()

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const [stats7gg, stats30gg, topCanali, topFormati, approvazioni, erroriRecenti] = await Promise.all([
      q(`SELECT status, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY status`, [cid, weekAgo]),
      q(`SELECT status, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2`, [cid, monthAgo]),
      q(`SELECT canale, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY canale ORDER BY cnt DESC`, [cid, monthAgo]),
      q(`SELECT formato, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY formato ORDER BY cnt DESC`, [cid, monthAgo]),
      q(`SELECT status_precedente, status_finale, count(*)::int as cnt FROM log_pubblicazioni WHERE cliente_id = $1 AND timestamp >= $2 GROUP BY status_precedente, status_finale`, [cid, monthAgo]),
      q(`SELECT id_contenuto, canale, errore FROM log_pubblicazioni WHERE cliente_id = $1 AND errore IS NOT NULL ORDER BY timestamp DESC LIMIT 10`, [cid]),
    ])

    return NextResponse.json({
      periodo: { da: monthAgo, a: new Date().toISOString().split('T')[0] },
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
