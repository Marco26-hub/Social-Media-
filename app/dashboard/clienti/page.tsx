'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CheckCircle2, Loader2, Plus, Users } from 'lucide-react'
import type { Cliente } from '@/lib/types'
import { isDemo } from '@/lib/demo'
import { readClienteId, writeClienteId } from '@/lib/use-data'
import { demoClienti } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function ClientiPage() {
  const router = useRouter()
  const demo = isDemo()
  const [clienti, setClienti] = useState<Cliente[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: '',
    settore: '',
    email: '',
    telefono: '',
    piano: 'pro',
  })

  const slug = useMemo(() => toSlug(form.nome), [form.nome])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (demo) {
      setClienti(demoClienti)
      setActiveId(demoClienti[0]?.id ?? null)
      setLoading(false)
      return
    }

    const res = await fetch('/api/data/clienti')
    if (res.status === 401) {
      // Sessione scaduta/assente (es. pagina in cache da sessione precedente):
      // manda al login invece di un errore muto.
      window.location.href = '/login'
      return
    }
    if (!res.ok) {
      setError('Errore nel caricamento clienti')
      setLoading(false)
      return
    }
    const rows = await res.json() as Cliente[]
    const cookieId = readClienteId()
    const nextId = cookieId && rows.some(row => row.id === cookieId) ? cookieId : rows[0]?.id ?? null

    if (nextId) writeClienteId(nextId)
    setClienti(rows)
    setActiveId(nextId)
    setLoading(false)
  }, [demo])

  useEffect(() => { load() }, [load])

  async function createCliente() {
    if (!form.nome.trim()) {
      setError('Inserisci il nome cliente')
      return
    }

    setSaving(true)
    setError(null)

    if (demo) {
      await new Promise(resolve => setTimeout(resolve, 700))
      setSaving(false)
      return
    }

    const res = await fetch('/api/data/clienti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome.trim(),
        slug: slug || toSlug(form.nome.trim()),
        settore: form.settore.trim() || null,
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
        piano: form.piano,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Errore sconosciuto' }))
      setError(err.error || 'Errore nella creazione')
      setSaving(false)
      return
    }

    const data = await res.json()
    if (data?.id) writeClienteId(String(data.id))
    setForm({ nome: '', settore: '', email: '', telefono: '', piano: 'pro' })
    await load()
    router.refresh()
    setSaving(false)
  }

  function selectCliente(clienteId: string) {
    writeClienteId(clienteId)
    setActiveId(clienteId)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Clienti</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">{clienti.length} brand gestiti</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="card p-10 text-center text-gray-400 md:col-span-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Caricamento clienti
            </div>
          ) : clienti.length === 0 ? (
            <div className="card p-10 text-center text-gray-400 md:col-span-2">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              Nessun cliente assegnato
            </div>
          ) : (
            clienti.map(cliente => (
              <button
                key={cliente.id}
                onClick={() => selectCliente(cliente.id)}
                className={`card p-5 text-left transition hover:shadow-md ${
                  activeId === cliente.id ? 'ring-2 ring-brand-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 truncate">{cliente.nome}</h3>
                {activeId === cliente.id && <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{cliente.settore ?? 'Settore non indicato'}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium uppercase">
                        {cliente.piano}
                      </span>
                    <span className={cliente.attivo ? 'text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium' : 'text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium'}>
                      {cliente.attivo ? 'Attivo' : 'Inattivo'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">
                      Apri workspace
                    </span>
                  </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="card p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Nuovo cliente</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Nome brand</label>
              <input
                value={form.nome}
                onChange={event => setForm(prev => ({ ...prev, nome: event.target.value }))}
                className="input"
                placeholder="Es. Nuovo Brand"
              />
              {slug && <p className="text-[11px] text-gray-400 mt-1">Slug: {slug}</p>}
            </div>
            <div>
              <label className="label">Settore</label>
              <input
                value={form.settore}
                onChange={event => setForm(prev => ({ ...prev, settore: event.target.value }))}
                className="input"
                placeholder="Es. Fashion"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
                className="input"
                placeholder="marketing@example.com"
              />
            </div>
            <div>
              <label className="label">Telefono</label>
              <input
                value={form.telefono}
                onChange={event => setForm(prev => ({ ...prev, telefono: event.target.value }))}
                className="input"
                placeholder="+39 ..."
              />
            </div>
            <div>
              <label className="label">Piano</label>
              <select
                value={form.piano}
                onChange={event => setForm(prev => ({ ...prev, piano: event.target.value }))}
                className="input"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="agency">Agency</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {error && <div className="text-xs rounded-lg bg-red-50 text-red-700 border border-red-100 p-2">{error}</div>}

            <button onClick={createCliente} disabled={saving} className="btn-primary w-full justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Creazione...' : 'Crea cliente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
