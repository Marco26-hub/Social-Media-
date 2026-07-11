'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Coins, RefreshCw, Cpu, Bot, Gauge } from 'lucide-react'

type Agg = { total_tokens: number; chiamate: number }
type Data = {
  totale: { prompt_tokens: number; completion_tokens: number; total_tokens: number; chiamate: number }
  per_provider: ({ provider: string } & Agg)[]
  per_model: ({ model: string } & Agg)[]
  per_agente: ({ agent_name: string | null } & Agg)[]
  per_giorno: { giorno: string; total_tokens: number }[]
  demo?: boolean
}

const fmt = (n: number) => new Intl.NumberFormat('it-IT').format(Math.round(n || 0))

export default function ConsumiPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/data/token-usage')
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const maxProv = Math.max(1, ...(data?.per_provider || []).map(p => p.total_tokens))
  const maxDay = Math.max(1, ...(data?.per_giorno || []).map(d => d.total_tokens))

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Coins className="w-5 h-5 text-brand-600" />
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Consumi Token</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">Token AI consumati negli ultimi 30 giorni (generazione manuale + agenti). Ollama locale escluso (gratuito).</p>

      {loading ? (
        <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 text-gray-400 animate-spin" /></div>
      ) : !data ? (
        <p className="text-sm text-gray-500">Nessun dato disponibile.</p>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {data.demo && <p className="text-xs text-amber-600">Dati dimostrativi (demo).</p>}

          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: 'Token totali', v: data.totale.total_tokens, icon: Gauge },
              { l: 'Prompt (input)', v: data.totale.prompt_tokens, icon: Cpu },
              { l: 'Output', v: data.totale.completion_tokens, icon: Cpu },
              { l: 'Chiamate AI', v: data.totale.chiamate, icon: Bot },
            ].map(k => (
              <div key={k.l} className="card p-4">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">{k.l}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(k.v)}</p>
              </div>
            ))}
          </div>

          {/* Per provider */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Per provider</h2>
            {data.per_provider.length === 0 ? <p className="text-sm text-gray-400">Nessun consumo registrato.</p> : (
              <div className="space-y-2">
                {data.per_provider.map(p => (
                  <div key={p.provider}>
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="text-gray-700 capitalize">{p.provider}</span>
                      <span className="text-gray-500">{fmt(p.total_tokens)} token · {fmt(p.chiamate)} chiamate</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(p.total_tokens / maxProv) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Per modello */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Per modello</h2>
              {data.per_model.length === 0 ? <p className="text-sm text-gray-400">—</p> : (
                <div className="space-y-1.5">
                  {data.per_model.map(m => (
                    <div key={m.model} className="flex justify-between text-sm gap-2">
                      <span className="text-gray-600 truncate" title={m.model}>{m.model || '—'}</span>
                      <span className="text-gray-500 flex-shrink-0">{fmt(m.total_tokens)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Per agente / manuale */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Manuale vs agenti</h2>
              {data.per_agente.length === 0 ? <p className="text-sm text-gray-400">—</p> : (
                <div className="space-y-1.5">
                  {data.per_agente.map((a, i) => (
                    <div key={i} className="flex justify-between text-sm gap-2">
                      <span className="text-gray-600 truncate">{a.agent_name ? `Agente: ${a.agent_name}` : 'Generazione manuale'}</span>
                      <span className="text-gray-500 flex-shrink-0">{fmt(a.total_tokens)} · {fmt(a.chiamate)}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trend giornaliero */}
          {data.per_giorno.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Andamento giornaliero</h2>
              <div className="flex items-end gap-1 h-32">
                {data.per_giorno.map(d => (
                  <div key={d.giorno} className="flex-1 flex flex-col items-center justify-end" title={`${d.giorno}: ${fmt(d.total_tokens)} token`}>
                    <div className="w-full bg-brand-400 rounded-t" style={{ height: `${(d.total_tokens / maxDay) * 100}%` }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
