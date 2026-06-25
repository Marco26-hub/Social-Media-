'use client'

import { Target } from 'lucide-react'

type Props = {
  result: Record<string, unknown> | null
}

export default function ClientsCard({ result }: Props) {
  if (!result) return null

  const icp = typeof result.icp === 'string' ? result.icp : null
  const salePitch = typeof result.sales_pitch === 'string' ? result.sales_pitch : null
  const personas = Array.isArray(result.buyer_personas) ? result.buyer_personas as Array<Record<string, string>> : []
  const mercato = result.mercato_target as Record<string, string> | null
  const competitor = Array.isArray(result.competitor) ? result.competitor as Array<Record<string, string>> : []
  const oppVendita = Array.isArray(result.opportunita_vendita) ? result.opportunita_vendita as string[] : []
  const canali = Array.isArray(result.canali_acquisizione) ? result.canali_acquisizione as string[] : []
  const leadMagnet = Array.isArray(result.lead_magnet) ? result.lead_magnet as string[] : []
  const obiezioni = Array.isArray(result.obiezioni) ? result.obiezioni as Array<Record<string, string>> : []
  const kpi = Array.isArray(result.kpi_suggeriti) ? result.kpi_suggeriti as string[] : []

  return (
    <div className="card p-5 mb-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Clienti & Marketing</h2>
          <p className="text-xs text-gray-500 mt-0.5">ICP, buyer personas, competitor, opportunità di vendita</p>
        </div>
      </div>

      <div className="space-y-3">
        {icp && (
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <p className="text-[10px] uppercase text-orange-600 font-bold mb-1">Cliente Ideale (ICP)</p>
            <p className="text-xs text-gray-700">{icp}</p>
          </div>
        )}

        {salePitch && (
          <div className="bg-white rounded-lg p-3 border border-amber-200">
            <p className="text-[10px] uppercase text-amber-600 font-bold mb-1">Elevator Pitch</p>
            <p className="text-xs text-gray-700 italic">&ldquo;{salePitch}&rdquo;</p>
          </div>
        )}

        {personas.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase text-orange-600 font-bold">Buyer Personas</p>
            {personas.map((bp, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-orange-100">
                <p className="text-sm font-semibold text-gray-900">{bp.nome} · {bp.eta} · {bp.ruolo}</p>
                <p className="text-[11px] text-gray-500 mt-1"><b>Goal:</b> {bp.obiettivi}</p>
                <p className="text-[11px] text-gray-500"><b>Pain:</b> {bp.pain_point}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Canali: {bp.canali}</p>
                {bp.citazione && <p className="text-[10px] text-amber-600 italic mt-1">&ldquo;{bp.citazione}&rdquo;</p>}
              </div>
            ))}
          </div>
        )}

        {mercato && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Mercato Target</p>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p>📊 Dimensione: {mercato.dimensione}</p>
              <p>📈 Trend: {mercato.trend}</p>
              <p>📅 Stagionalità: {mercato.stagionalita}</p>
            </div>
          </div>
        )}

        {competitor.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-red-100">
            <p className="text-[10px] uppercase text-red-500 font-bold mb-1.5">Competitor</p>
            <div className="space-y-1.5">
              {competitor.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-red-400 mt-0.5">•</span>
                  <div>
                    <span className="font-medium text-gray-800">{c.nome}</span>
                    <span className="text-gray-400 ml-1">({c.sito})</span>
                    {c.punto_forte && <p className="text-[10px] text-green-600">✓ {c.punto_forte}</p>}
                    {c.punto_debole && <p className="text-[10px] text-red-500">✗ {c.punto_debole}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {oppVendita.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <p className="text-[10px] uppercase text-green-600 font-bold mb-1.5">Opportunità di Vendita</p>
            <div className="flex flex-wrap gap-1">
              {oppVendita.map((o, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{o}</span>
              ))}
            </div>
          </div>
        )}

        {canali.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="text-[10px] uppercase text-blue-600 font-bold mb-1.5">Canali Acquisizione</p>
            <div className="flex flex-wrap gap-1">
              {canali.map((c, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        )}

        {leadMagnet.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-[10px] uppercase text-purple-600 font-bold mb-1.5">Lead Magnet</p>
            <div className="flex flex-wrap gap-1">
              {leadMagnet.map((lm, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{lm}</span>
              ))}
            </div>
          </div>
        )}

        {obiezioni.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1.5">Obiezioni & Risposte</p>
            <div className="space-y-1">
              {obiezioni.map((o, i) => (
                <div key={i} className="text-xs">
                  <p className="text-red-600">❓ {o.obiezione}</p>
                  <p className="text-green-700 ml-3">💡 {o.risposta}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {kpi.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1.5">KPI Suggeriti</p>
            <div className="flex flex-wrap gap-1">
              {kpi.map((k, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-mono">{k}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
