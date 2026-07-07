'use client'

import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, CreditCard, ExternalLink, Filter, Loader2, RefreshCw, Search, ShieldCheck, X } from 'lucide-react'
import { readApiError } from '@/lib/ai-client'

type PaymentClient = {
  id: string
  nome: string
  email: string | null
  piano: string
  attivo: boolean
  pacchetto_slug: string
  pacchetto_nome: string
  canone: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  last_payment_status: string | null
  last_amount_paid: number | null
  last_payment_currency: string | null
  last_invoice_url: string | null
  last_invoice_pdf: string | null
  last_paid_at: string | null
}

type PaymentsPayload = {
  stripe_configured: boolean
  needs_migration: boolean
  error?: string
  clienti: PaymentClient[]
}

type ClientStatusFilter = 'all' | 'active' | 'inactive'
type SubscriptionFilter = 'all' | 'active' | 'missing' | 'attention'
type PaymentFilter = 'all' | 'paid' | 'unpaid' | 'attention'

function formatMoney(cents: number | null, currency = 'eur') {
  if (!cents) return '—'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

function formatDate(value: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return value
  }
}

function statusTone(status: string | null) {
  if (!status) return 'bg-gray-100 text-gray-600'
  if (['active', 'trialing', 'paid'].includes(status)) return 'bg-green-100 text-green-700'
  if (['past_due', 'open', 'uncollectible'].includes(status)) return 'bg-amber-100 text-amber-700'
  if (['canceled', 'incomplete_expired', 'void', 'failed'].includes(status)) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

function matchesSearch(cliente: PaymentClient, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    cliente.nome,
    cliente.email,
    cliente.piano,
    cliente.pacchetto_nome,
    cliente.pacchetto_slug,
    cliente.stripe_customer_id,
    cliente.stripe_subscription_id,
    cliente.subscription_status,
    cliente.last_payment_status,
  ].filter(Boolean).join(' ').toLowerCase()
  return haystack.includes(needle)
}

function matchesClientStatus(cliente: PaymentClient, filter: ClientStatusFilter) {
  if (filter === 'active') return cliente.attivo
  if (filter === 'inactive') return !cliente.attivo
  return true
}

function matchesSubscription(cliente: PaymentClient, filter: SubscriptionFilter) {
  const status = cliente.subscription_status
  if (filter === 'active') return status === 'active' || status === 'trialing'
  if (filter === 'missing') return !status
  if (filter === 'attention') return Boolean(status && !['active', 'trialing'].includes(status))
  return true
}

function matchesPayment(cliente: PaymentClient, filter: PaymentFilter) {
  const status = cliente.last_payment_status
  if (filter === 'paid') return status === 'paid'
  if (filter === 'unpaid') return !status
  if (filter === 'attention') return Boolean(status && !['paid'].includes(status))
  return true
}

export default function PagamentiAdminPage() {
  const [data, setData] = useState<PaymentsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [clientStatusFilter, setClientStatusFilter] = useState<ClientStatusFilter>('all')
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/pagamenti')
      if (!res.ok) throw new Error(await readApiError(res, 'Impossibile caricare i pagamenti'))
      setData(await res.json() as PaymentsPayload)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
      setBusy(null)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function runAction(clienteId: string, action: 'checkout' | 'portal') {
    setBusy(`${clienteId}:${action}`)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/admin/pagamenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: clienteId, action }),
      })
      if (!res.ok) throw new Error(await readApiError(res, 'Azione Stripe fallita'))
      const out = await res.json() as { url?: string | null; demo?: boolean }
      if (out.url) window.open(out.url, '_blank', 'noopener,noreferrer')
      setMessage(out.demo ? 'Demo: azione simulata.' : 'Sessione Stripe creata. Completa il flusso nella nuova scheda.')
      await load()
    } catch (e) {
      setError((e as Error).message)
      setBusy(null)
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center p-8"><Loader2 className="h-7 w-7 animate-spin text-gray-400" /></div>
  }

  const clienti = data?.clienti || []
  const filteredClienti = clienti.filter(cliente =>
    matchesSearch(cliente, searchQuery) &&
    matchesClientStatus(cliente, clientStatusFilter) &&
    matchesSubscription(cliente, subscriptionFilter) &&
    matchesPayment(cliente, paymentFilter),
  )
  const hasFilters = Boolean(searchQuery.trim()) || clientStatusFilter !== 'all' || subscriptionFilter !== 'all' || paymentFilter !== 'all'
  const activeSubscriptions = clienti.filter(cliente => cliente.subscription_status === 'active' || cliente.subscription_status === 'trialing').length
  const paidInvoices = clienti.filter(cliente => cliente.last_payment_status === 'paid').length

  function resetFilters() {
    setSearchQuery('')
    setClientStatusFilter('all')
    setSubscriptionFilter('all')
    setPaymentFilter('all')
  }

  function handleClientStatusFilter(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as ClientStatusFilter
    setClientStatusFilter(value)
  }

  function handleSubscriptionFilter(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as SubscriptionFilter
    setSubscriptionFilter(value)
  }

  function handlePaymentFilter(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as PaymentFilter
    setPaymentFilter(value)
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">Pagamenti Stripe</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Gestisci checkout, customer portal, abbonamenti e storico fatture salvato nel DB.
          </p>
        </div>
        <button onClick={load} disabled={Boolean(busy)} className="btn-secondary w-full justify-center text-sm md:w-auto">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Aggiorna
        </button>
      </div>

      {(error || data?.error) && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-950">Pagamenti non disponibili</p>
            <p className="mt-1">{error || data?.error}</p>
          </div>
        </div>
      )}
      {message && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Stripe</p>
          <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${data?.stripe_configured ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {data?.stripe_configured ? 'Configurato' : 'Env mancanti'}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Schema DB</p>
          <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${data?.needs_migration ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {data?.needs_migration ? 'Migration richiesta' : 'Pronto'}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Abbonamenti attivi</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{activeSubscriptions}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ultime fatture pagate</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{paidInvoices}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Clienti e billing</h2>
              <p className="mt-1 text-xs text-gray-500">Checkout crea una subscription mensile basata sul canone del pacchetto; il webhook aggiorna stato e fatture.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
              <Filter className="h-3.5 w-3.5" />
              {filteredClienti.length}/{clienti.length} clienti
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.9fr_0.8fr_auto]">
            <label className="relative block">
              <span className="sr-only">Cerca cliente</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="input w-full pl-9 text-sm"
                placeholder="Cerca nome, email, piano o ID Stripe"
              />
            </label>

            <label>
              <span className="sr-only">Stato cliente</span>
              <select value={clientStatusFilter} onChange={handleClientStatusFilter} className="input w-full text-sm">
                <option value="all">Tutti i clienti</option>
                <option value="active">Solo attivi</option>
                <option value="inactive">Solo inattivi</option>
              </select>
            </label>

            <label>
              <span className="sr-only">Stato abbonamento</span>
              <select value={subscriptionFilter} onChange={handleSubscriptionFilter} className="input w-full text-sm">
                <option value="all">Tutti gli abbonamenti</option>
                <option value="active">Attivi / trial</option>
                <option value="missing">Non creati</option>
                <option value="attention">Da controllare</option>
              </select>
            </label>

            <label>
              <span className="sr-only">Stato pagamento</span>
              <select value={paymentFilter} onChange={handlePaymentFilter} className="input w-full text-sm">
                <option value="all">Tutti i pagamenti</option>
                <option value="paid">Pagati</option>
                <option value="unpaid">Nessun pagamento</option>
                <option value="attention">Da controllare</option>
              </select>
            </label>

            <button onClick={resetFilters} disabled={!hasFilters} className="btn-secondary justify-center text-sm disabled:opacity-50">
              <X className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {clienti.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">Nessun dato pagamento disponibile.</div>
        ) : filteredClienti.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">Nessun cliente corrisponde ai filtri.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredClienti.map(cliente => {
              const checkoutBusy = busy === `${cliente.id}:checkout`
              const portalBusy = busy === `${cliente.id}:portal`
              return (
                <div key={cliente.id} className="grid gap-4 p-4 lg:grid-cols-[1.15fr_0.8fr_0.9fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-gray-900">{cliente.nome}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cliente.attivo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cliente.attivo ? 'Attivo' : 'Inattivo'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{cliente.email || 'Email non indicata'}</p>
                    <p className="mt-2 text-sm text-gray-700">{cliente.pacchetto_nome} · {cliente.canone}/mese</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Subscription</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(cliente.subscription_status)}`}>
                      {cliente.subscription_status || 'non creata'}
                    </span>
                    <p className="mt-2 text-xs text-gray-500">Rinnovo: {formatDate(cliente.current_period_end)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Ultimo pagamento</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(cliente.last_payment_status)}`}>
                        {cliente.last_payment_status || 'nessuno'}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{formatMoney(cliente.last_amount_paid, cliente.last_payment_currency || 'eur')}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      {cliente.last_invoice_url && <a href={cliente.last_invoice_url} target="_blank" rel="noopener" className="text-brand-600 hover:underline">Fattura</a>}
                      {cliente.last_invoice_pdf && <a href={cliente.last_invoice_pdf} target="_blank" rel="noopener" className="text-brand-600 hover:underline">PDF</a>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    <button
                      onClick={() => runAction(cliente.id, 'checkout')}
                      disabled={Boolean(busy) || !data?.stripe_configured || data?.needs_migration}
                      className="btn-primary justify-center text-xs disabled:opacity-50"
                    >
                      {checkoutBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                      Checkout
                    </button>
                    <button
                      onClick={() => runAction(cliente.id, 'portal')}
                      disabled={Boolean(busy) || !cliente.stripe_customer_id || !data?.stripe_configured || data?.needs_migration}
                      className="btn-secondary justify-center text-xs disabled:opacity-50"
                    >
                      {portalBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                      Portal
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
