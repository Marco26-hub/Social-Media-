'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { UserCheck, Check, X, Mail, Phone, Building2, Package, Clock, Inbox } from 'lucide-react'

type Registrazione = {
  id: string
  nome: string
  email: string
  azienda: string | null
  telefono: string | null
  pacchetto: string | null
  created_at: string
}

const PACCHETTO_LABEL: Record<string, string> = {
  starter: 'Starter', presenza: 'Presenza', crescita: 'Crescita', ecommerce: 'E-commerce', dominio: 'Dominio',
}

export default function RegistrazioniPage() {
  const [items, setItems] = useState<Registrazione[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/registrazioni')
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Impossibile caricare le registrazioni.')
        setItems([])
      } else {
        setItems(await res.json())
      }
    } catch {
      setError('Errore di rete.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function act(id: string, action: 'activate' | 'reject') {
    setBusy(id)
    try {
      const res = await fetch('/api/admin/registrazioni', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      })
      if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
    } finally {
      setBusy(null)
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    } catch { return iso }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Registrazioni</h1>
        {!loading && items.length > 0 && (
          <span className="ml-1 px-2.5 py-1 rounded-full bg-brand-600 text-white text-xs font-semibold">{items.length} in attesa</span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">Richieste di attivazione dalla landing. Attiva l&apos;account per dare accesso al pannello.</p>

      {error && <div className="card p-4 mb-4 text-sm text-red-700 bg-red-50 border-red-200">{error}</div>}

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Caricamento…</div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nessuna registrazione in attesa</p>
          <p className="text-sm text-gray-400 mt-1">Le nuove richieste dalla landing compaiono qui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(r => (
            <div key={r.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{r.nome}</h3>
                  {r.pacchetto && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
                      <Package className="w-3 h-3" /> {PACCHETTO_LABEL[r.pacchetto] || r.pacchetto}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  {r.azienda && <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {r.azienda}</span>}
                  <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {r.email}</span>
                  {r.telefono && <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {r.telefono}</span>}
                  <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(r.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => act(r.id, 'activate')}
                  disabled={busy === r.id}
                  className="btn-primary disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Attiva
                </button>
                <button
                  onClick={() => act(r.id, 'reject')}
                  disabled={busy === r.id}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Rifiuta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
