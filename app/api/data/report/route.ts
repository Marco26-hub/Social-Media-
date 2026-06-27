import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
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
    perQualita: {} as Record<string, number>,
    perFunnel: {} as Record<string, number>,
  }
  rows.forEach((item) => {
    const canale = String(item.canale || 'altro')
    const formato = String(item.formato || 'altro')
    const quality = String(item.quality_level || 'non_classificata')
    const funnel = String(item.funnel_stage || 'non_classificato')
    stats.perCanale[canale] = (stats.perCanale[canale] || 0) + 1
    stats.perFormato[formato] = (stats.perFormato[formato] || 0) + 1
    stats.perQualita[quality] = (stats.perQualita[quality] || 0) + 1
    stats.perFunnel[funnel] = (stats.perFunnel[funnel] || 0) + 1
  })
  return stats
}

function topEntry(items: Record<string, number>): { name: string; count: number } | null {
  const sorted = Object.entries(items).sort((a, b) => b[1] - a[1])
  if (!sorted.length) return null
  return { name: sorted[0][0], count: sorted[0][1] }
}

function pct(value: number, total: number): number {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

function buildExecutiveReport(args: {
  rows: Array<Record<string, unknown>>
  stats: ReturnType<typeof buildStats>
  brand?: Record<string, unknown> | null
  cliente?: Record<string, unknown> | null
  erroriRecenti?: Array<Record<string, unknown>>
}) {
  const topCanale = topEntry(args.stats.perCanale)
  const topFormato = topEntry(args.stats.perFormato)
  const topFunnel = topEntry(args.stats.perFunnel)
  const approvedRate = pct(args.stats.approvati + args.stats.pubblicati, args.stats.totale)
  const errorRate = pct(args.stats.errori, args.stats.totale)
  const qualityHigh = args.stats.perQualita.high || 0
  const qualityMedium = args.stats.perQualita.medium || 0
  const premiumShare = pct(qualityHigh + qualityMedium, args.stats.totale)

  const bottlenecks: string[] = []
  if (args.stats.daApprovare > 0) bottlenecks.push(`${args.stats.daApprovare} contenuti attendono approvazione cliente`)
  if (args.stats.errori > 0) bottlenecks.push(`${args.stats.errori} contenuti hanno errori tecnici/pubblicazione`)
  if (!qualityHigh && args.stats.totale > 5) bottlenecks.push('Nessun contenuto High/Elite nel periodo: opportunità upsell qualità')
  if (!Object.keys(args.stats.perFunnel).some(key => key === 'conversion')) bottlenecks.push('Funnel conversion poco presidiato: aggiungere contenuti orientati a lead/vendita')

  const nextActions = [
    args.stats.daApprovare > 0 ? 'Sbloccare approvazioni entro 24 ore per non perdere slot editoriali' : 'Mantenere ritmo approvazioni e preparare batch successivo',
    args.stats.errori > 0 ? 'Correggere errori media/link prima della prossima schedulazione' : 'Continuare controllo pre-pubblicazione media/link',
    premiumShare < 50 ? 'Aumentare contenuti Medium/High per asset riutilizzabili e migliore controllo qualità' : 'Riutilizzare i migliori contenuti High come template per il mese prossimo',
    topCanale ? `Raddoppiare sui format che funzionano su ${topCanale.name}` : 'Generare almeno 7 contenuti per ottenere pattern leggibili',
  ]

  return {
    cliente: {
      nome: args.cliente?.nome || args.brand?.brand_name || 'Cliente',
      piano: args.cliente?.piano || 'n/d',
      brand: args.brand?.brand_name || null,
    },
    executiveSummary: [
      `Nel periodo sono stati gestiti ${args.stats.totale} contenuti, con ${approvedRate}% tra approvati e pubblicati.`,
      topCanale ? `Il canale più presidiato è ${topCanale.name} (${topCanale.count} contenuti).` : 'Non ci sono ancora abbastanza contenuti per un canale dominante.',
      topFormato ? `Il formato principale è ${topFormato.name}, utile come base per il prossimo sprint creativo.` : 'Serve più volume per identificare il formato dominante.',
      topFunnel ? `La fase funnel più coperta è ${topFunnel.name}.` : 'Funnel non ancora classificato nei contenuti.',
    ],
    health: {
      approvalRate: approvedRate,
      errorRate,
      premiumContentShare: premiumShare,
      riskLevel: errorRate > 20 || args.stats.errori > 2 ? 'alto' : args.stats.daApprovare > 5 ? 'medio' : 'basso',
    },
    bottlenecks,
    nextActions,
    highlights: args.rows
      .filter(row => row.hook || row.angle || row.kpi_target)
      .slice(0, 5)
      .map(row => ({
        id_contenuto: row.id_contenuto,
        canale: row.canale,
        formato: row.formato,
        hook: row.hook,
        angle: row.angle,
        kpi_target: row.kpi_target,
        quality_level: row.quality_level,
      })),
  }
}

export async function GET() {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) {
      const today = new Date().toISOString().split('T')[0]
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      const stats = buildStats(demoContenuti as unknown as Array<Record<string, unknown>>)
      const executive = buildExecutiveReport({
        rows: demoContenuti as unknown as Array<Record<string, unknown>>,
        stats,
        brand: { brand_name: 'SILKinCOM' },
        cliente: { nome: 'SILKinCOM Demo', piano: 'agency' },
        erroriRecenti: demoLogs.filter(log => log.errore).slice(0, 5) as unknown as Array<Record<string, unknown>>,
      })
      return NextResponse.json({
        periodo: { da: monthAgo, a: today },
        stats,
        executive,
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

    const [contenuti, stats7gg, stats30gg, topCanali, topFormati, approvazioni, erroriRecenti, recentLogs, brandRows, clienteRows] = await Promise.all([
      q(`SELECT * FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2`, [cid, monthAgo]),
      q(`SELECT status, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY status`, [cid, weekAgo]),
      q(`SELECT status, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY status`, [cid, monthAgo]),
      q(`SELECT canale, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY canale ORDER BY cnt DESC`, [cid, monthAgo]),
      q(`SELECT formato, count(*)::int as cnt FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2 GROUP BY formato ORDER BY cnt DESC`, [cid, monthAgo]),
      q(`SELECT status_precedente, status_finale, count(*)::int as cnt FROM log_pubblicazioni WHERE cliente_id = $1 AND timestamp >= $2 GROUP BY status_precedente, status_finale`, [cid, monthAgo]),
      q(`SELECT id_contenuto, canale, errore FROM log_pubblicazioni WHERE cliente_id = $1 AND errore IS NOT NULL ORDER BY timestamp DESC LIMIT 10`, [cid]),
      q(`SELECT * FROM log_pubblicazioni WHERE cliente_id = $1 ORDER BY timestamp DESC LIMIT 10`, [cid]),
      q(`SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1`, [cid]),
      q(`SELECT * FROM clienti WHERE id = $1 LIMIT 1`, [cid]),
    ])
    const stats = buildStats(contenuti)
    const executive = buildExecutiveReport({
      rows: contenuti,
      stats,
      brand: (brandRows[0] ?? null) as Record<string, unknown> | null,
      cliente: (clienteRows[0] ?? null) as Record<string, unknown> | null,
      erroriRecenti,
    })

    return NextResponse.json({
      periodo: { da: monthAgo, a: new Date().toISOString().split('T')[0] },
      stats,
      executive,
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
    return apiError(e)
  }
}
