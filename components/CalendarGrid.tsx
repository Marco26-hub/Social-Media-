'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import type { Contenuto } from '@/lib/types'
import { preflightRow } from '@/lib/publish/preflight'

// Vista calendario a griglia mensile (stile Blotato), affiancata alla lista.
// Ogni giorno mostra i post programmati come mini-card (ora + canale + stato),
// con un'icona di avviso se il pre-flight Blotato segnala un problema di sync.

const CANALE_ICON: Record<string, string> = {
  instagram: '📸', facebook: '🔵', tiktok: '🎵', pinterest: '📌', linkedin: '💼',
  threads: '🧵', x: '✖️', youtube_shorts: '▶️', blog: '📝',
}

function statusDot(status: string): string {
  if (status === 'PUBBLICATO') return 'bg-green-500'
  if (status === 'APPROVATO' || status === 'IN_PUBBLICAZIONE') return 'bg-blue-500'
  if (status === 'ERRORE' || status === 'ERRORE_MANUALE') return 'bg-red-500'
  if (status === 'DA_APPROVARE') return 'bg-amber-500'
  if (status === 'NON_APPROVATO') return 'bg-rose-400'
  return 'bg-slate-400'
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

function pad(n: number): string { return String(n).padStart(2, '0') }

export default function CalendarGrid({ items, tz, onSelect }: {
  items: Contenuto[]
  tz: string
  onSelect: (c: Contenuto) => void
}) {
  // Mese iniziale: quello del primo contenuto con data, altrimenti il mese corrente.
  const firstDated = items.find(i => i.data_pubblicazione)?.data_pubblicazione
  const init = firstDated ? new Date(`${firstDated}T12:00:00`) : new Date()
  const [year, setYear] = useState(init.getFullYear())
  const [month, setMonth] = useState(init.getMonth()) // 0-based

  // Indicizza i contenuti per giorno (YYYY-MM-DD).
  const byDay = new Map<string, Contenuto[]>()
  for (const it of items) {
    const d = it.data_pubblicazione
    if (!d) continue
    const arr = byDay.get(d) || []
    arr.push(it)
    byDay.set(d, arr)
  }

  const firstOfMonth = new Date(year, month, 1)
  const offset = (firstOfMonth.getDay() + 6) % 7 // 0 = lunedì
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function shift(delta: number) {
    const m = month + delta
    const y = year + Math.floor(m / 12)
    const nm = ((m % 12) + 12) % 12
    setYear(y); setMonth(nm)
  }

  return (
    <div className="card p-3 md:p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => shift(-1)} className="btn-secondary py-1.5 px-2" aria-label="Mese precedente">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-bold text-gray-900">{MONTHS[month]} {year}</h3>
        <button onClick={() => shift(1)} className="btn-secondary py-1.5 px-2" aria-label="Mese successivo">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-[11px] font-semibold text-gray-400 uppercase text-center py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} className="min-h-[92px] rounded-lg bg-slate-50/50" />
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
              const dayItems = (byDay.get(dateStr) || []).slice().sort((a, b) => (a.ora_pubblicazione || '').localeCompare(b.ora_pubblicazione || ''))
              return (
                <div key={dateStr} className="min-h-[92px] rounded-lg border border-slate-200 bg-white p-1">
                  <div className="text-[11px] font-semibold text-gray-500 px-1">{day}</div>
                  <div className="space-y-1 mt-0.5">
                    {dayItems.map(it => {
                      const pf = preflightRow(it as unknown as Record<string, unknown>, tz)
                      return (
                        <button
                          key={it.id}
                          onClick={() => onSelect(it)}
                          title={pf.ok ? `${it.canale} · ${it.formato}` : `Blocca sync: ${pf.errors.map(e => e.message).join('; ')}`}
                          className="w-full flex items-center gap-1 rounded-md px-1 py-0.5 text-left text-[11px] bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(it.status)}`} />
                          <span className="shrink-0">{CANALE_ICON[it.canale] || '📄'}</span>
                          <span className="text-gray-600 shrink-0">{(it.ora_pubblicazione || '').slice(0, 5)}</span>
                          {!pf.ok && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
                          <span className="truncate text-gray-700">{it.hook || it.caption || it.formato}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Da approvare</span>
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Approvato</span>
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Pubblicato</span>
        <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> Problema sync Blotato</span>
      </div>
    </div>
  )
}
