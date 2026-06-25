'use client'

import { MessageCircle } from 'lucide-react'

type Props = {
  result: Record<string, unknown> | null
  url: string
}

export default function LeadsCard({ result, url }: Props) {
  if (!result) return null

  const email = Array.isArray(result.email) ? result.email as string[] : []
  const whatsapp = Array.isArray(result.whatsapp) ? result.whatsapp as Array<Record<string, string>> : []
  const telegram = Array.isArray(result.telegram) ? result.telegram as Array<Record<string, string>> : []
  const telefono = Array.isArray(result.telefono) ? result.telefono as string[] : []
  const social = Array.isArray(result.social) ? result.social as Array<Record<string, string>> : []
  const indirizzo = typeof result.indirizzo === 'string' ? result.indirizzo : null
  const orari = typeof result.orari === 'string' ? result.orari : null
  const piva = typeof result.piva === 'string' ? result.piva : null
  const formUrl = typeof result.form_contatti_url === 'string' ? result.form_contatti_url : null
  const note = typeof result.note_scraping === 'string' ? result.note_scraping : null

  return (
    <div className="card p-5 mb-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Contatti Trovati</h2>
          <p className="text-xs text-gray-500 mt-0.5">Lead estratti da {url}</p>
        </div>
      </div>

      <div className="space-y-3">
        {email.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <p className="text-[10px] uppercase text-green-600 font-bold mb-1.5">Email</p>
            <div className="flex flex-wrap gap-1.5">
              {email.map((e, i) => (
                <a key={i} href={`mailto:${e}`} className="text-xs px-2.5 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200">{e}</a>
              ))}
            </div>
          </div>
        )}

        {whatsapp.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-[10px] uppercase text-emerald-600 font-bold mb-1.5">WhatsApp</p>
            <div className="space-y-1">
              {whatsapp.map((w, i) => (
                <a key={i} href={w.link || ''} target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-emerald-800 hover:underline">
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">WA</span>
                  {w.numero}{w.note ? <span className="text-gray-400">· {w.note}</span> : null}
                </a>
              ))}
            </div>
          </div>
        )}

        {telegram.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="text-[10px] uppercase text-blue-600 font-bold mb-1.5">Telegram</p>
            <div className="space-y-1">
              {telegram.map((t, i) => (
                <a key={i} href={t.link || ''} target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-blue-800 hover:underline">
                  <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">TG</span>
                  {t.username}{t.tipo ? <span className="text-gray-400">· {t.tipo}</span> : null}
                </a>
              ))}
            </div>
          </div>
        )}

        {telefono.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1.5">Telefono</p>
            <div className="flex flex-wrap gap-1.5">
              {telefono.map((t, i) => <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">{t}</span>)}
            </div>
          </div>
        )}

        {social.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-[10px] uppercase text-purple-600 font-bold mb-1.5">Social</p>
            <div className="flex flex-wrap gap-1.5">
              {social.map((s, i) => (
                <a key={i} href={s.url || ''} target="_blank" rel="noopener" className="text-xs px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200">{s.piattaforma}</a>
              ))}
            </div>
          </div>
        )}

        {(indirizzo || orari || piva || formUrl) && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1.5">Altre info</p>
            <div className="text-xs text-gray-600 space-y-1">
              {indirizzo && <p>📍 {indirizzo}</p>}
              {orari && <p>🕐 {orari}</p>}
              {piva && <p>🧾 Partita IVA: {piva}</p>}
              {formUrl && <a href={formUrl} target="_blank" rel="noopener" className="text-brand-600 hover:underline block">📝 Form contatti → {formUrl}</a>}
            </div>
          </div>
        )}

        {note && <p className="text-[10px] text-gray-400">{note}</p>}
      </div>
    </div>
  )
}
