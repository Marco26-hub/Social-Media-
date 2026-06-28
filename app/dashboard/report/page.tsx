'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Download, Loader2, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Target, Sparkles, ShieldCheck, Lightbulb } from 'lucide-react'
import { isDemo } from '@/lib/demo'
import { demoContenuti, demoLogs } from '@/lib/demo-data'
import { readApiError } from '@/lib/ai-client'

type ReportData = {
  periodo?: { da: string; a: string }
  stats?: Record<string, unknown>
  executive?: {
    cliente?: { nome?: string; piano?: string; brand?: string | null }
    executiveSummary?: string[]
    health?: { approvalRate?: number; errorRate?: number; premiumContentShare?: number; riskLevel?: string }
    bottlenecks?: string[]
    nextActions?: string[]
    highlights?: Array<Record<string, unknown>>
  }
  logs?: Array<Record<string, unknown>>
}

function countMap(value: unknown): Record<string, number> | null {
  return value && typeof value === 'object' ? value as Record<string, number> : null
}

function buildDemoReport(): ReportData {
  const stats = {
    totale: demoContenuti.length,
    daApprovare: demoContenuti.filter(c => c.status === 'DA_APPROVARE').length,
    approvati: demoContenuti.filter(c => c.status === 'APPROVATO').length,
    pubblicati: demoContenuti.filter(c => c.status === 'PUBBLICATO').length,
    errori: demoContenuti.filter(c => ['ERRORE', 'ERRORE_MANUALE'].includes(c.status)).length,
    bozze: demoContenuti.filter(c => c.status === 'BOZZA').length,
    perCanale: {} as Record<string, number>,
    perFormato: {} as Record<string, number>,
    perQualita: { medium: demoContenuti.length },
    perFunnel: { awareness: 3, consideration: 2, conversion: 2 },
  }
  demoContenuti.forEach(c => { stats.perCanale[c.canale] = (stats.perCanale[c.canale] || 0) + 1 })
  demoContenuti.forEach(c => { stats.perFormato[c.formato] = (stats.perFormato[c.formato] || 0) + 1 })
  return {
    periodo: {
      da: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      a: new Date().toISOString().split('T')[0],
    },
    stats,
    executive: {
      cliente: { nome: 'SILKinCOM Demo', piano: 'agency', brand: 'SILKinCOM' },
      executiveSummary: [
        `Nel periodo sono stati gestiti ${stats.totale} contenuti con pipeline attiva su più canali.`,
        'Instagram e TikTok sono i canali più adatti per scalare creatività verticali e proof visivi.',
        'La priorità è ridurre contenuti in attesa e trasformare i migliori concept in template riutilizzabili.',
      ],
      health: { approvalRate: 72, errorRate: 0, premiumContentShare: 68, riskLevel: 'basso' },
      bottlenecks: stats.daApprovare ? [`${stats.daApprovare} contenuti attendono approvazione`] : [],
      nextActions: ['Approvare batch settimanale', 'Produrre asset verticali 9:16', 'Creare 2 varianti High per i prodotti top'],
      highlights: demoContenuti.slice(0, 5).map(item => ({ id_contenuto: item.id_contenuto, canale: item.canale, formato: item.formato, hook: item.hook, quality_level: 'medium' })),
    },
    logs: demoLogs.slice(0, 10) as unknown as Array<Record<string, unknown>>,
  }
}

function DistributionCard({ title, data, color }: { title: string; data: Record<string, number> | null; color: string }) {
  if (!data) return null
  const total = Object.values(data).reduce((sum, value) => sum + value, 0) || 1
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([label, count]) => {
          const pct = Math.round((count / total) * 100)
          return (
            <div key={label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700 font-medium capitalize">{label.replace('_', ' ')}</span>
                <span className="text-gray-500">{count} ({pct}%)</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const demo = isDemo()

  useEffect(() => {
    async function load() {
      if (demo) {
        setData(buildDemoReport())
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/data/report')
        if (!res.ok) throw new Error(await readApiError(res, 'Impossibile caricare il report'))
        setData(await res.json() as ReportData)
      } catch (e) {
        setError((e as Error).message)
      }
      setLoading(false)
    }
    load()
  }, [demo])

  if (loading) return <div className="p-8 flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>

  if (error) return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="card p-6 border-red-200 bg-red-50 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">Report non disponibile</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button onClick={() => location.reload()} className="btn-secondary text-xs mt-3">Riprova</button>
        </div>
      </div>
    </div>
  )

  const stats = data?.stats
  const executive = data?.executive
  const total = typeof stats?.totale === 'number' ? stats.totale : 0
  const daApprovare = typeof stats?.daApprovare === 'number' ? stats.daApprovare : 0
  const approvati = typeof stats?.approvati === 'number' ? stats.approvati : 0
  const pubblicati = typeof stats?.pubblicati === 'number' ? stats.pubblicati : 0
  const errori = typeof stats?.errori === 'number' ? stats.errori : 0
  const perCanale = countMap(stats?.perCanale)
  const perFormato = countMap(stats?.perFormato)
  const perQualita = countMap(stats?.perQualita)
  const perFunnel = countMap(stats?.perFunnel)
  const logs = Array.isArray(data?.logs) ? data.logs : []
  const summary = executive?.executiveSummary ?? []
  const bottlenecks = executive?.bottlenecks ?? []
  const nextActions = executive?.nextActions ?? []
  const highlights = executive?.highlights ?? []
  const riskLevel = executive?.health?.riskLevel ?? 'n/d'

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto print:bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-600 font-bold">Executive Client Report</p>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Report {executive?.cliente?.nome || 'Cliente'}</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Periodo {data?.periodo?.da || 'n/d'} → {data?.periodo?.a || 'n/d'} · Piano {executive?.cliente?.piano || 'n/d'}
          </p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary text-sm py-2 px-4 print:hidden">
          <Download className="w-4 h-4" /> Scarica PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h2 className="font-bold">Sintesi direzionale</h2>
          </div>
          <ul className="space-y-2">
            {summary.length ? summary.map((item, index) => (
              <li key={index} className="text-sm text-slate-100 flex gap-2">
                <span className="text-emerald-300">✓</span>{item}
              </li>
            )) : <li className="text-sm text-slate-300">Genera contenuti per produrre una sintesi cliente.</li>}
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-violet-600" />
            <h2 className="font-bold text-gray-900">Stato servizio</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Approval rate', value: `${executive?.health?.approvalRate ?? 0}%` },
              { label: 'Error rate', value: `${executive?.health?.errorRate ?? 0}%` },
              { label: 'Premium content', value: `${executive?.health?.premiumContentShare ?? 0}%` },
              { label: 'Rischio', value: riskLevel.toUpperCase() },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Totali', value: total, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
          { label: 'Da approvare', value: daApprovare, icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Approvati', value: approvati, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Pubblicati', value: pubblicati, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Errori', value: errori, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-2`}><Icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DistributionCard title="Contenuti per canale" data={perCanale} color="bg-brand-500" />
        <DistributionCard title="Contenuti per formato" data={perFormato} color="bg-teal-500" />
        <DistributionCard title="Qualità generazione" data={perQualita} color="bg-violet-500" />
        <DistributionCard title="Copertura funnel" data={perFunnel} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5 border-amber-100 bg-amber-50/60">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-950">Blocchi e rischi</h3>
          </div>
          <ul className="space-y-2">
            {bottlenecks.length ? bottlenecks.map((item, index) => (
              <li key={index} className="text-sm text-amber-900 flex gap-2"><span>•</span>{item}</li>
            )) : <li className="text-sm text-amber-900">Nessun blocco critico rilevato nel periodo.</li>}
          </ul>
        </div>

        <div className="card p-5 border-emerald-100 bg-emerald-50/60">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-emerald-950">Prossime azioni</h3>
          </div>
          <ul className="space-y-2">
            {nextActions.map((item, index) => (
              <li key={index} className="text-sm text-emerald-900 flex gap-2"><span>{index + 1}.</span>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {highlights.length > 0 && (
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-gray-900">Contenuti da valorizzare</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highlights.map((item, index) => (
              <div key={index} className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-gray-400">{String(item.id_contenuto || '')}</span>
                  {Boolean(item.quality_level) && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 uppercase">{String(item.quality_level)}</span>}
                </div>
                <p className="text-xs text-gray-500 capitalize">{String(item.canale || '')} · {String(item.formato || '')}</p>
                <p className="text-sm text-gray-900 font-medium mt-1 line-clamp-2">{String(item.hook || item.angle || 'Contenuto operativo')}</p>
                {Boolean(item.kpi_target) && <p className="text-xs text-brand-600 mt-1">KPI: {String(item.kpi_target)}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Attività recenti</h3>
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center gap-3 text-xs py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-400 font-mono">{log.timestamp ? new Date(log.timestamp as string).toLocaleDateString('it-IT') : 'n/d'}</span>
                <span className="font-medium text-gray-800">{String(log.id_contenuto || '')}</span>
                <span className="text-gray-400">{String(log.canale || '')}</span>
                <span className={`ml-auto font-medium ${log.errore ? 'text-red-600' : 'text-green-600'}`}>{String(log.status_finale || '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data && (
        <div className="card p-8 text-center text-gray-400">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>Nessun dato disponibile. Genera contenuti per vedere il report.</p>
        </div>
      )}
    </div>
  )
}
