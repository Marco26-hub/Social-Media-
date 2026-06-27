'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import {
  Eye, Plus, Trash2, Sparkles, Loader2, TrendingUp, TrendingDown,
  Target, Hash, Lightbulb, Zap, BarChart3, AlertTriangle
} from 'lucide-react'
import { readAISettings } from '@/lib/ai-client'
import { useRuntimeDemo } from '@/lib/demo-client'
import { useActiveClienteId } from '@/lib/tenant/client'
import AIModelSelector from '@/components/AIModelSelector'
import OpenRouterKeyInput from '@/components/OpenRouterKeyInput'
import { useGeneration } from '@/components/GenerationProvider'

type CompetitorAnalysis = {
  competitor_nome: string
  data_analisi: string
  content_strategy: { tipo: string; temi: string[]; stile_visivo: string; tono_voce: string }
  frequenza: { instagram: string; facebook: string; tiktok: string; pinterest: string; migliori_ore: string[] }
  engagement: { rate_stimato: string; tipo_interazioni: string[]; crescita: string; note: string }
  hashtag_strategy: { principali: string[]; branded: string[]; note: string }
  punti_forti: string[]
  punti_deboli: string[]
  miglioramenti_per_cliente: { azione: string; impatto: string; effort: string; canale: string }[]
  score_competitor: number
  gap_analysis: string
  contenuti_suggeriti: { tema: string; formato: string; canale: string; perche: string }[]
}

export default function CompetitorPage() {
  const demo = useRuntimeDemo()
  const { clienteId } = useActiveClienteId()
  const gen = useGeneration()
  const [competitorNome, setCompetitorNome] = useState('')
  const [competitorSito, setCompetitorSito] = useState('')
  const [competitorSocial, setCompetitorSocial] = useState<string[]>([''])
  const [analyses, setAnalyses] = useState<CompetitorAnalysis[]>([])
  const [selected, setSelected] = useState<CompetitorAnalysis | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  function updateSocial(i: number, val: string) {
    setCompetitorSocial(prev => prev.map((s, j) => j === i ? val : s))
  }
  function addSocialHandle() { setCompetitorSocial(prev => [...prev, '']) }
  function removeSocialHandle(i: number) { setCompetitorSocial(prev => prev.filter((_, j) => j !== i)) }

  const loading = gen.isRunning('competitor')

  async function runAnalysis() {
    if (!competitorNome.trim()) return
    setMsg(null)
    const aiSettings = readAISettings()

    const result = await gen.run<CompetitorAnalysis>({
      key: 'competitor',
      label: `Analisi ${competitorNome}`,
      url: '/api/generate/competitor-analysis',
      body: {
        cliente_id: clienteId,
        competitor_nome: competitorNome,
        competitor_sito: competitorSito || undefined,
        competitor_social: competitorSocial.filter(s => s.trim()),
        ...aiSettings,
      },
      estMs: 22000,
    })

    if (result.ok && result.data) {
      setAnalyses(prev => [result.data!, ...prev])
      setSelected(result.data!)
      setMsg({ type: 'ok', text: 'Analisi competitor completata.' })
    } else {
      setMsg({ type: 'err', text: result.error || 'Analisi competitor fallita' })
    }
  }

  const effortColor = (e: string) => e === 'Basso' ? 'bg-green-100 text-green-700' : e === 'Medio' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  const impactColor = (i: string) => i === 'Alto' ? 'bg-green-100 text-green-700' : i === 'Medio' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Competitor Tracking</h1>
      <p className="text-sm text-gray-500 mb-6">Analizza i social dei competitor e ottieni azioni per superarli</p>

      <AIModelSelector task="contenuti-social" />
      <OpenRouterKeyInput />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="card p-5 space-y-4 sticky top-20">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-brand-600" />
              <h2 className="font-bold text-gray-900">Nuova Analisi</h2>
            </div>
            <div>
              <label className="label mb-1">Nome competitor *</label>
              <input value={competitorNome} onChange={e => setCompetitorNome(e.target.value)} className="input" placeholder="es. Zara, H&M" />
            </div>
            <div>
              <label className="label mb-1">Sito web</label>
              <input value={competitorSito} onChange={e => setCompetitorSito(e.target.value)} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="label mb-1">Social handles</label>
              <div className="space-y-1.5">
                {competitorSocial.map((s, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input value={s} onChange={e => updateSocial(i, e.target.value)} className="input text-sm flex-1" placeholder="@handle su Instagram / TikTok / ..." />
                    {competitorSocial.length > 1 && (
                      <button onClick={() => removeSocialHandle(i)} className="text-red-400 hover:text-red-600 px-1"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={addSocialHandle} className="text-brand-600 text-xs flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Aggiungi handle</button>
              </div>
            </div>
            <button onClick={runAnalysis} disabled={loading || !competitorNome.trim()} className="btn-primary w-full justify-center py-2.5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Analisi AI in corso...' : 'Analizza competitor'}
            </button>

            {msg && (
              <div className={`p-3 rounded-lg text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {msg.text}
              </div>
            )}

            {/* History */}
            {analyses.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-400 font-medium mb-2">ANALISI PRECEDENTI</p>
                <div className="space-y-1">
                  {analyses.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(a)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selected?.competitor_nome === a.competitor_nome ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{a.competitor_nome}</span>
                        <span className="text-xs text-gray-400">{a.data_analisi}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="card p-12 text-center text-gray-400">
              <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg">Nessuna analisi</p>
              <p className="text-sm mt-1">Inserisci un competitor e avvia l&apos;analisi AI</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header + Score */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selected.competitor_nome}</h2>
                    <p className="text-xs text-gray-400">{selected.data_analisi}</p>
                  </div>
                  <div className={`text-center px-4 py-2 rounded-xl ${
                    selected.score_competitor >= 80 ? 'bg-red-100' :
                    selected.score_competitor >= 60 ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <p className={`text-2xl font-bold ${
                      selected.score_competitor >= 80 ? 'text-red-600' :
                      selected.score_competitor >= 60 ? 'text-yellow-600' : 'text-green-600'
                    }`}>{selected.score_competitor}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Score</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-brand-50 rounded-lg p-3">{selected.gap_analysis}</p>
              </div>

              {/* Content Strategy */}
              <div className="card p-5">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-brand-600" />Content Strategy</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l: 'Tipo', v: selected.content_strategy.tipo },
                    { l: 'Stile visivo', v: selected.content_strategy.stile_visivo },
                    { l: 'Tono di voce', v: selected.content_strategy.tono_voce },
                    { l: 'Temi', v: selected.content_strategy.temi?.join(', ') },
                  ].map(({ l, v }) => (
                    <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-gray-400 uppercase">{l}</p>
                      <p className="text-sm text-gray-700">{v || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequenza + Engagement */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-5">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-brand-600" />Frequenza</h3>
                  <div className="space-y-1.5">
                    {Object.entries(selected.frequenza || {}).filter(([k]) => k !== 'migliori_ore').map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{k}</span>
                        <span className="font-medium text-gray-700">{v as string}</span>
                      </div>
                    ))}
                    {selected.frequenza?.migliori_ore && (
                      <div className="pt-2 mt-2 border-t">
                        <p className="text-[10px] text-gray-400 mb-1">ORARI MIGLIORI</p>
                        <div className="flex gap-1 flex-wrap">
                          {selected.frequenza.migliori_ore.map(o => (
                            <span key={o} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded">{o}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-brand-600" />Engagement</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Rate stimato</p>
                      <p className="text-lg font-bold text-gray-800">{selected.engagement?.rate_stimato}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Crescita</p>
                      <p className="text-sm font-medium text-gray-700">{selected.engagement?.crescita}</p>
                    </div>
                    {selected.engagement?.tipo_interazioni && (
                      <div className="flex gap-1 flex-wrap">
                        {selected.engagement.tipo_interazioni.map(t => (
                          <span key={t} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hashtag strategy */}
              {selected.hashtag_strategy && (
                <div className="card p-5">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Hash className="w-4 h-4 text-brand-600" />Hashtag Strategy</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase mb-1">Principali</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.hashtag_strategy.principali?.map(h => (
                          <span key={h} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{h}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase mb-1">Branded</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.hashtag_strategy.branded?.map(h => (
                          <span key={h} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {selected.hashtag_strategy.note && (
                    <p className="text-xs text-gray-500 mt-2">{selected.hashtag_strategy.note}</p>
                  )}
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-5">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-green-600" />Punti di forza</h3>
                  <ul className="space-y-1.5">
                    {selected.punti_forti?.map((p, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-5">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><TrendingDown className="w-4 h-4 text-red-500" />Punti deboli</h3>
                  <ul className="space-y-1.5">
                    {selected.punti_deboli?.map((p, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Miglioramenti */}
              {selected.miglioramenti_per_cliente?.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-yellow-500" />Azioni per superare</h3>
                  <div className="space-y-2">
                    {selected.miglioramenti_per_cliente.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                        <span className="text-sm font-bold text-gray-400 mt-0.5">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{m.azione}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${impactColor(m.impatto)}`}>{m.impatto}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${effortColor(m.effort)}`}>{m.effort} effort</span>
                            <span className="text-[10px] text-gray-400">{m.canale}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contenuti suggeriti */}
              {selected.contenuti_suggeriti?.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-brand-600" />Contenuti suggeriti</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.contenuti_suggeriti.map((c, i) => (
                      <div key={i} className="bg-brand-50 border border-brand-100 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800">{c.tema}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-brand-600">{c.canale} · {c.formato}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{c.perche}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
