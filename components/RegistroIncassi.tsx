'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { intervalloPeriodo, periodiRecenti } from '@/lib/periodi'

// Registro incassi per il commercialista, in cima al tab Pagamenti.
//
// Si sceglie il periodo come lo chiede il commercialista — un mese o un
// trimestre — e prima di scaricare si vede cosa ci sara dentro, fonte per fonte.
// Se una fonte manca lo si vede qui, prima che se ne accorga lui.

type Riepilogo = {
  periodo: { da: string; a: string; etichetta: string } | null
  vendite: number
  incassato_cents: number
  rimborsato_cents: number
  per_fonte: { fonte: string; vendite: number; incassato_cents: number; rimborsato_cents: number }[]
  avvisi: string[]
}

const soldi = (cents: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100)

function oggiRoma(): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Rome' }).format(new Date())
}

export default function RegistroIncassi() {
  const { mesi, trimestri } = useMemo(() => periodiRecenti(oggiRoma()), [])
  // Si parte dal mese scorso: e quello che il commercialista chiede di solito
  // all'inizio del mese, a periodo chiuso.
  const [periodo, setPeriodo] = useState(mesi[1] ?? mesi[0])
  const [dati, setDati] = useState<Riepilogo | null>(null)
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState('')

  useEffect(() => {
    let vivo = true
    setCaricamento(true)
    setErrore('')
    fetch(`/api/admin/incassi?periodo=${encodeURIComponent(periodo)}`, { cache: 'no-store' })
      .then(async r => {
        const corpo = await r.json().catch(() => ({}))
        if (!vivo) return
        if (!r.ok) { setErrore(corpo.error || 'Riepilogo non disponibile.'); return }
        setDati(corpo)
      })
      .catch(() => { if (vivo) setErrore('Errore di rete.') })
      .finally(() => { if (vivo) setCaricamento(false) })
    return () => { vivo = false }
  }, [periodo])

  const etichetta = (p: string) => intervalloPeriodo(p)?.etichetta ?? p

  return (
    <section className="card mb-6 overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-brand-600" />
          <div>
            <h2 className="font-semibold text-gray-900">Registro incassi per il commercialista</h2>
            <p className="text-xs text-gray-500">Pacchetti, servizi, consulenze e corsi in un file solo</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="input w-auto" aria-label="Periodo">
            <optgroup label="Mese">
              {mesi.map(m => <option key={m} value={m}>{etichetta(m)}</option>)}
            </optgroup>
            <optgroup label="Trimestre">
              {trimestri.map(t => <option key={t} value={t}>{etichetta(t)}</option>)}
            </optgroup>
          </select>
          <a href={`/api/admin/incassi/export?periodo=${encodeURIComponent(periodo)}`} className="btn-primary text-xs">
            <Download className="h-3.5 w-3.5" /> Scarica CSV
          </a>
        </div>
      </header>

      {caricamento ? (
        <div className="p-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" /></div>
      ) : errore ? (
        <div className="flex gap-2 p-5 text-sm text-red-700"><AlertTriangle className="h-5 w-5" />{errore}</div>
      ) : dati && (
        <div className="p-4">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <p className="text-2xl font-bold text-gray-900">{soldi(dati.incassato_cents)}</p>
            <p className="text-sm text-gray-500">
              {dati.vendite} {dati.vendite === 1 ? 'incasso' : 'incassi'} · {dati.periodo?.etichetta}
              {dati.rimborsato_cents > 0 && <> · rimborsati {soldi(dati.rimborsato_cents)}</>}
            </p>
          </div>

          {dati.per_fonte.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4 text-right">Incassi</th>
                    <th className="py-2 pr-4 text-right">Importo</th>
                    <th className="py-2 text-right">Rimborsato</th>
                  </tr>
                </thead>
                <tbody>
                  {dati.per_fonte.map(f => (
                    <tr key={f.fonte} className="border-t border-gray-100">
                      <td className="py-2 pr-4 text-gray-900">{f.fonte}</td>
                      <td className="py-2 pr-4 text-right text-gray-600">{f.vendite}</td>
                      <td className="py-2 pr-4 text-right font-semibold text-gray-900">{soldi(f.incassato_cents)}</td>
                      <td className="py-2 text-right text-gray-600">{f.rimborsato_cents ? soldi(f.rimborsato_cents) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-400">Nessun incasso in questo periodo.</p>
          )}

          {dati.avvisi.map(a => (
            <p key={a} className="mt-3 flex gap-2 text-xs text-amber-700"><AlertTriangle className="h-4 w-4 flex-none" />{a}</p>
          ))}

          <p className="mt-4 text-xs text-gray-500">
            Gli importi sono quelli incassati da Stripe, senza scorporo dell’IVA: come vanno trattati
            dipende dal regime fiscale e lo stabilisce il commercialista. I rimborsi sono registrati
            solo per i corsi.
          </p>
        </div>
      )}
    </section>
  )
}
