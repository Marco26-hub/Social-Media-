'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, ExternalLink, FileText, Globe2, Loader2, Newspaper, RefreshCw, Target } from 'lucide-react'

type Order = {
  id: string
  service_slug: 'blog-seo' | 'web-commerce' | 'lead-pilot'
  service_name: string
  amount_cents: number
  currency: string
  status: string
  nome: string
  azienda: string | null
  email: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  last_invoice_url: string | null
  last_invoice_pdf: string | null
  paid_at: string | null
  created_at: string
}

type Payload = { needs_migration: boolean; stripe_configured: boolean; orders: Order[]; error?: string }

function money(cents: number, currency = 'eur') {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}
function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}
function tone(status: string) {
  if (['paid', 'active', 'trialing'].includes(status)) return 'bg-green-100 text-green-700'
  if (['checkout_open', 'checkout_pending', 'checkout_complete'].includes(status)) return 'bg-amber-100 text-amber-700'
  if (['past_due', 'unpaid', 'checkout_failed'].includes(status)) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

export default function StandaloneServiceOrdersAdmin() {
  const [data, setData] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setError('')
    try {
      const response = await fetch('/api/admin/service-orders', { cache: 'no-store' })
      const payload = await response.json() as Payload
      if (!response.ok) throw new Error(payload.error || 'Ordini non disponibili')
      setData(payload)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Errore caricamento ordini') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  async function portal(orderId: string) {
    const popup = window.open('about:blank', '_blank')
    if (popup) popup.opener = null
    setBusy(orderId); setError('')
    try {
      const response = await fetch('/api/admin/service-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId }) })
      const payload = await response.json() as { url?: string; error?: string }
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Portal Stripe non disponibile')
      if (popup) popup.location.href = payload.url
      else window.location.assign(payload.url)
    } catch (cause) { popup?.close(); setError(cause instanceof Error ? cause.message : 'Errore Stripe') }
    finally { setBusy('') }
  }

  return (
    <section className="card mb-6 overflow-hidden">
      <header className="flex items-center justify-between border-b border-gray-100 p-4">
        <div><h2 className="font-semibold text-gray-900">Servizi Blog e Web</h2><p className="text-xs text-gray-500">Ordini ricorrenti separati dai pacchetti social</p></div>
        <button onClick={load} className="btn-secondary text-xs"><RefreshCw className="h-3.5 w-3.5" /> Aggiorna</button>
      </header>
      {loading ? <div className="p-9 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></div>
        : error ? <div className="flex gap-2 p-5 text-sm text-red-700"><AlertTriangle className="h-5 w-5" />{error}</div>
          : data?.needs_migration ? <div className="flex gap-2 p-5 text-sm text-amber-700"><AlertTriangle className="h-5 w-5" />Migrazione ordini servizi non applicata.</div>
            : !data?.orders.length ? <div className="p-8 text-center text-sm text-gray-400">Nessun ordine Blog o Web.</div>
              : <div className="divide-y divide-gray-100">{data.orders.map(order => {
                const Icon = order.service_slug === 'blog-seo' ? Newspaper : order.service_slug === 'web-commerce' ? Globe2 : Target
                return <article key={order.id} className="grid gap-3 p-4 md:grid-cols-[1.25fr_.7fr_.8fr_auto] md:items-center">
                  <div className="min-w-0"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-brand-600" /><strong className="truncate text-sm text-gray-900">{order.service_name}</strong><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone(order.status)}`}>{order.status}</span></div><p className="mt-1 text-xs text-gray-500">{order.azienda || order.nome} · <a href={`mailto:${order.email}`} className="hover:underline">{order.email}</a></p></div>
                  <div><p className="text-sm font-bold text-gray-900">{money(order.amount_cents, order.currency)}{order.service_slug === 'lead-pilot' ? '' : '/mese'}</p><p className="text-xs text-gray-500">Ordinato {date(order.created_at)}</p></div>
                  <div><p className="text-xs font-semibold text-gray-500">Rinnovo {date(order.current_period_end)}</p>{order.cancel_at_period_end && <p className="text-xs text-amber-700">Disdetta a fine periodo</p>}<div className="mt-1 flex gap-3 text-xs">{order.last_invoice_url && <a href={order.last_invoice_url} target="_blank" rel="noreferrer" className="inline-flex gap-1 text-brand-600"><FileText className="h-3 w-3" />Fattura</a>}{order.last_invoice_pdf && <a href={order.last_invoice_pdf} target="_blank" rel="noreferrer" className="text-brand-600">PDF</a>}</div></div>
                  <button onClick={() => portal(order.id)} disabled={!order.stripe_customer_id || busy === order.id || !data.stripe_configured} className="btn-secondary justify-center text-xs disabled:opacity-50">{busy === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}Portal</button>
                </article>
              })}</div>}
    </section>
  )
}
