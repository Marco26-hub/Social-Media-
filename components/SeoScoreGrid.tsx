'use client'

import { BarChart3 } from 'lucide-react'

type Props = {
  result: Record<string, unknown> | null
  includeGeo?: boolean
}

export default function SeoScoreGrid({ result, includeGeo }: Props) {
  if (!result) return null

  const scores = [
    { key: 'score_globale', label: 'Globale' },
    { key: 'score_seo_tecnico', label: 'Tecnico' },
    { key: 'score_seo_contenuti', label: 'Contenuti' },
    { key: 'score_geo_ai_search', label: 'GEO/AI' },
    { key: 'score_social_coerenza', label: 'Social' },
    { key: 'score_eeat', label: 'E-E-A-T' },
  ]

  const riepilogo = typeof result.riepilogo === 'string' ? result.riepilogo : null
  const puntiForti = Array.isArray(result.punti_forti) ? result.punti_forti as string[] : []
  const puntiCritici = Array.isArray(result.punti_critici) ? result.punti_critici as string[] : []

  return (
    <div className="card p-5 mb-6 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border-teal-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">SEO + GEO Audit</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Analisi completata in parallelo con la brand discovery.
            {includeGeo && ' Include GEO (AI citability + llms.txt).'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
        {scores.map(({ key, label }) => {
          const raw = result[key]
          const val = typeof raw === 'number' ? raw : 0
          const color = val >= 80
            ? 'text-green-700 bg-green-50 border-green-200'
            : val >= 60
            ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
            : 'text-red-700 bg-red-50 border-red-200'
          return (
            <div key={key} className={`rounded-lg border p-2 text-center ${color}`}>
              <p className="text-[10px] uppercase opacity-70">{label}</p>
              <p className="text-lg font-bold">{val}</p>
            </div>
          )
        })}
      </div>

      {riepilogo && (
        <p className="text-xs text-gray-600 mb-2">{riepilogo}</p>
      )}

      {puntiForti.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] uppercase text-green-600 font-bold mb-1">Punti forti</p>
          <div className="flex flex-wrap gap-1">
            {puntiForti.map((p, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{p}</span>
            ))}
          </div>
        </div>
      )}

      {puntiCritici.length > 0 && (
        <div>
          <p className="text-[10px] uppercase text-red-500 font-bold mb-1">Da migliorare</p>
          <div className="flex flex-wrap gap-1">
            {puntiCritici.map((p, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{p}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
