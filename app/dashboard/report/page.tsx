'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Download, Loader2, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Calendar, Smartphone, Image, Film } from 'lucide-react'
import { isDemo } from '@/lib/demo'
import { demoContenuti, demoLogs } from '@/lib/demo-data'

export default function ReportPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const demo = isDemo()

  useEffect(() => {
    async function load() {
      if (demo) {
        const contenuti = demoContenuti
        const stats = {
          totale: contenuti.length,
          daApprovare: contenuti.filter(c => c.status === 'DA_APPROVARE').length,
          approvati: contenuti.filter(c => c.status === 'APPROVATO').length,
          pubblicati: contenuti.filter(c => c.status === 'PUBBLICATO').length,
          errori: contenuti.filter(c => ['ERRORE', 'ERRORE_MANUALE'].includes(c.status)).length,
          bozze: contenuti.filter(c => c.status === 'BOZZA').length,
          perCanale: {} as Record<string, number>,
          perFormato: {} as Record<string, number>,
        }
        contenuti.forEach(c => { stats.perCanale[c.canale] = (stats.perCanale[c.canale] || 0) + 1 })
        contenuti.forEach(c => { stats.perFormato[c.formato] = (stats.perFormato[c.formato] || 0) + 1 })
        setData({ stats, logs: demoLogs.slice(0, 10) })
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/data/report')
        if (res.ok) setData(await res.json())
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [demo])

  if (loading) return <div className="p-8 flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>

  const r = data?.stats as Record<string, unknown> | undefined
  const rTotale = typeof r?.totale === 'number' ? r.totale : 0
  const rDaApprovare = typeof r?.daApprovare === 'number' ? r.daApprovare : 0
  const rApprovati = typeof r?.approvati === 'number' ? r.approvati : 0
  const rPubblicati = typeof r?.pubblicati === 'number' ? r.pubblicati : 0
  const rErrori = typeof r?.errori === 'number' ? r.errori : 0
  const rPerCanale = r?.perCanale && typeof r.perCanale === 'object' ? r.perCanale as Record<string, number> : null
  const rPerFormato = r?.perFormato && typeof r.perFormato === 'object' ? r.perFormato as Record<string, number> : null
  const logs = Array.isArray(data?.logs) ? data?.logs as Array<Record<string, unknown>> : []

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Report</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Analisi contenuti, performance e risultati</p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary text-sm py-2 px-4">
          <Download className="w-4 h-4" /> Scarica PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Totali', value: rTotale, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
          { label: 'Da approvare', value: rDaApprovare, icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Approvati', value: rApprovati, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Pubblicati', value: rPubblicati, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Errori', value: rErrori, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-2`}><Icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Per canale */}
        {rPerCanale && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Contenuti per Canale</h3>
            <div className="space-y-2">
              {Object.entries(rPerCanale).map(([canale, cnt]) => {
                const total = rTotale || 1
                const pct = Math.round((cnt / total) * 100)
                return (
                  <div key={canale}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium capitalize">{canale}</span>
                      <span className="text-gray-500">{cnt} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Per formato */}
        {rPerFormato && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Contenuti per Formato</h3>
            <div className="space-y-2">
              {Object.entries(rPerFormato).map(([formato, cnt]) => {
                const total = rTotale || 1
                const pct = Math.round((cnt / total) * 100)
                return (
                  <div key={formato}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium capitalize">{formato}</span>
                      <span className="text-gray-500">{cnt} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Log recenti */}
      {logs.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Attività Recenti</h3>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-xs py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-400 font-mono">{new Date(log.timestamp as string).toLocaleDateString('it-IT')}</span>
                <span className="font-medium text-gray-800">{log.id_contenuto as string}</span>
                <span className="text-gray-400">{log.canale as string}</span>
                <span className={`ml-auto font-medium ${log.errore ? 'text-red-600' : 'text-green-600'}`}>
                  {log.status_finale as string}
                </span>
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
