'use client'

import { useEffect, useState } from 'react'
import { Scale, Loader2, RefreshCw, AlertTriangle, Mail, Phone } from 'lucide-react'

type Consulenza = {
  id: string
  nome: string
  email: string
  telefono: string | null
  messaggio: string | null
  tipo: string
  importo_cents: number
  status: string
  paid_at: string | null
  created_at: string
}

type Payload = {
  needs_migration: boolean
  consulenze: Consulenza[]
  totals: { paid: number; pending: number; incasso_cents: number }
}

function money(cents: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format((cents || 0) / 100)
}
function date(v: string | null) {
  if (!v) return '—'
  try { return new Date(v).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return v }
}
function tone(status: string) {
  if (status === 'paid') return 'bg-green-100 text-green-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}
function label(status: string) {
  return status === 'paid' ? 'Pagata' : status === 'pending' ? 'In attesa' : status
}

export default function ConsulenzeAdmin() {
  const [data, setData] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/consulenze')
      if (!res.ok) throw new Error('Errore caricamento consulenze')
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div className="card mb-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Scale className="h-4.5 w-4.5" /></span>
          <div>
            <h2 className="font-semibold text-gray-900">Consulenze legali</h2>
            <p className="text-xs text-gray-500">Prenotazioni €150/30 min · pagamenti one-off</p>
          </div>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100">
          <RefreshCw className="h-3.5 w-3.5" /> Aggiorna
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></div>
      ) : error ? (
        <div className="p-6 text-center text-sm text-red-600">{error}</div>
      ) : data?.needs_migration ? (
        <div className="flex items-start gap-3 p-5 text-sm text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>Tabella <code>consulenze</code> non presente. Esegui <code>npm run migrate</code> (migration 027) sul database.</span>
        </div>
      ) : (
        <>
          <div className="grid gap-3 p-4 md:grid-cols-3">
            <div className="rounded-xl bg-green-50 p-3">
              <p className="text-xs font-semibold text-green-700">Incasso consulenze</p>
              <p className="text-xl font-bold text-green-900">{money(data?.totals.incasso_cents || 0)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-600">Pagate</p>
              <p className="text-xl font-bold text-gray-900">{data?.totals.paid || 0}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-700">In attesa</p>
              <p className="text-xl font-bold text-amber-900">{data?.totals.pending || 0}</p>
            </div>
          </div>

          {!data?.consulenze.length ? (
            <div className="p-8 text-center text-sm text-gray-400">Nessuna consulenza prenotata.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.consulenze.map(c => (
                <div key={c.id} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{c.nome}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone(c.status)}`}>{label(c.status)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-gray-800"><Mail className="h-3 w-3" /> {c.email}</a>
                      {c.telefono && <a href={`tel:${c.telefono}`} className="inline-flex items-center gap-1 hover:text-gray-800"><Phone className="h-3 w-3" /> {c.telefono}</a>}
                      <span>Prenotata: {date(c.created_at)}</span>
                      {c.paid_at && <span>Pagata: {date(c.paid_at)}</span>}
                    </div>
                    {c.messaggio && <p className="mt-1 truncate text-xs italic text-gray-400">&ldquo;{c.messaggio}&rdquo;</p>}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-gray-900">{money(c.importo_cents)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
