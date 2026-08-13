'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Mail, RefreshCw, Undo2 } from 'lucide-react'

type Recesso = {
  id: string
  reference_code: string
  request_type: string
  full_name: string
  email: string
  contract_reference: string
  contract_category: string
  contract_date: string
  timeliness: string
  status: string
  receipt_status: string
  submitted_at: string
}

type Payload = {
  needs_migration: boolean
  recessi: Recesso[]
  totals: { aperte: number; consumer: number; email_fallite: number }
}

const statusLabels: Record<string, string> = {
  ricevuta: 'Ricevuta',
  in_verifica: 'In verifica',
  elaborata: 'Elaborata',
  non_applicabile: 'Non applicabile',
}

const categoryLabels: Record<string, string> = {
  servizi_digitali: 'Servizi digitali',
  sito_ecommerce: 'Sito / e-commerce',
  consulenza_legale: 'Consulenza legale',
  altro: 'Altro',
}

function dateTime(value: string) {
  try { return new Date(value).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return value }
}

function tone(status: string) {
  if (status === 'elaborata') return 'bg-green-100 text-green-700'
  if (status === 'in_verifica') return 'bg-blue-100 text-blue-700'
  if (status === 'non_applicabile') return 'bg-gray-100 text-gray-600'
  return 'bg-amber-100 text-amber-700'
}

export default function RecessiAdmin() {
  const [data, setData] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const response = await fetch('/api/admin/recessi')
      if (!response.ok) throw new Error('Impossibile caricare recessi e disdette.')
      setData(await response.json() as Payload)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Errore di caricamento.')
    } finally {
      setLoading(false)
      setBusy('')
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(item: Recesso, status: string) {
    setBusy(item.id)
    setError('')
    try {
      const response = await fetch('/api/admin/recessi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status }),
      })
      if (!response.ok) throw new Error('Aggiornamento pratica non riuscito.')
      await load()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Errore di aggiornamento.')
      setBusy('')
    }
  }

  return (
    <div className="card mb-6 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700"><Undo2 className="h-4.5 w-4.5" /></span>
          <div>
            <h2 className="font-semibold text-gray-900">Recessi e disdette</h2>
            <p className="text-xs text-gray-500">Dichiarazioni trasmesse dalla funzione pubblica e ricevute email</p>
          </div>
        </div>
        <button onClick={load} disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100">
          <RefreshCw className="h-3.5 w-3.5" /> Aggiorna
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></div>
      ) : error ? (
        <div className="p-5 text-sm text-red-600">{error}</div>
      ) : data?.needs_migration ? (
        <div className="flex items-start gap-3 p-5 text-sm text-amber-700"><AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>Applica la migration <code>040_recessi.sql</code> con <code>npm run migrate</code>.</span></div>
      ) : (
        <>
          <div className="grid gap-3 p-4 md:grid-cols-3">
            <div className="rounded-xl bg-amber-50 p-3"><p className="text-xs font-semibold text-amber-700">Pratiche aperte</p><p className="text-xl font-bold text-amber-900">{data?.totals.aperte || 0}</p></div>
            <div className="rounded-xl bg-green-50 p-3"><p className="text-xs font-semibold text-green-700">Recessi consumer</p><p className="text-xl font-bold text-green-900">{data?.totals.consumer || 0}</p></div>
            <div className="rounded-xl bg-red-50 p-3"><p className="text-xs font-semibold text-red-700">Ricevute email da reinviare</p><p className="text-xl font-bold text-red-900">{data?.totals.email_fallite || 0}</p></div>
          </div>

          {!data?.recessi.length ? (
            <div className="p-8 text-center text-sm text-gray-400">Nessuna dichiarazione ricevuta.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recessi.map(item => (
                <div key={item.id} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{item.full_name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone(item.status)}`}>{statusLabels[item.status] || item.status}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">{item.request_type === 'recesso_consumatore' ? 'Consumer' : 'Professionale'}</span>
                      {item.timeliness === 'verifica_necessaria' && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">Termine da verificare</span>}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-gray-700">{item.reference_code} · {categoryLabels[item.contract_category] || item.contract_category} · contratto {item.contract_reference}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 hover:text-gray-800"><Mail className="h-3 w-3" /> {item.email}</a>
                      <span>Ricevuta: {dateTime(item.submitted_at)}</span>
                      <span className={item.receipt_status === 'sent' ? 'text-green-700' : 'text-red-600'}>Email {item.receipt_status === 'sent' ? 'inviata' : 'non inviata'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {busy === item.id ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : item.status === 'elaborata' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : null}
                    <select value={item.status} onChange={event => updateStatus(item, event.target.value)} disabled={busy === item.id} className="input min-w-[150px] text-xs">
                      <option value="ricevuta">Ricevuta</option>
                      <option value="in_verifica">In verifica</option>
                      <option value="elaborata">Elaborata</option>
                      <option value="non_applicabile">Non applicabile</option>
                    </select>
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
