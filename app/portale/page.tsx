'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  PackageCheck,
  RefreshCw,
} from 'lucide-react'
import { readApiError } from '@/lib/ai-client'

type PlanData = {
  cliente: { nome: string; attivo: boolean }
  pacchetto: { nome: string; prezzo: string; sottotitolo: string; includeDa: string | null; features: string[] }
  quota: { inclusi: number; usati: number; rimanenti: number; percentuale: number }
  mese: { inizio: string; fine: string; label: string }
  pagamenti: {
    enabled: boolean
    stato: string
    needs_migration?: boolean
    subscription_status?: string | null
    current_period_end?: string | null
    cancel_at_period_end?: boolean | null
    ultimo_pagamento?: { amount_paid: number; currency: string; paid_at: string | null } | null
  }
}

type ReportData = {
  stats?: { totale?: number; daApprovare?: number; approvati?: number; pubblicati?: number; perCanale?: Record<string, number>; perFormato?: Record<string, number> }
  executive?: { executiveSummary?: string[] }
}

function formatMoney(cents: number | null | undefined, currency = 'eur') {
  if (!cents) return '—'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}
function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return value
  }
}
function statusLabel(s: string | null | undefined) {
  const map: Record<string, string> = { active: 'Attivo', trialing: 'In prova', paid: 'Pagato', past_due: 'Pagamento in sospeso', canceled: 'Disdetto', unpaid: 'Non saldato' }
  return (s && map[s]) || s || 'In arrivo'
}
function statusTone(s: string | null | undefined) {
  if (['active', 'trialing', 'paid'].includes(s || '')) return 'bg-green-100 text-green-700'
  if (['past_due', 'unpaid', 'open'].includes(s || '')) return 'bg-amber-100 text-amber-800'
  if (['canceled', 'failed'].includes(s || '')) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

function ResultTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function TopList({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map(i => i.value))
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">Nessun dato ancora</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map(i => (
            <div key={i.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate capitalize text-gray-700">{i.label}</span>
                <span className="font-semibold text-gray-900">{i.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${(i.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PortaleClientePage() {
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [planRes, reportRes] = await Promise.all([fetch('/api/data/il-mio-piano'), fetch('/api/data/report')])
      if (!planRes.ok) throw new Error(await readApiError(planRes, 'Impossibile caricare il tuo piano'))
      const planJson = await planRes.json() as PlanData
      const reportJson = reportRes.ok ? (await reportRes.json() as ReportData) : {}
      setPlan(planJson)
      setReport(reportJson)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function openPortal() {
    setPortalError(null)
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Impossibile aprire il portale pagamenti')
      window.location.href = data.url as string
    } catch (e) {
      setPortalError((e as Error).message)
      setPortalLoading(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-gray-400" /></div>
  }
  if (error || !plan) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-950">Spazio non disponibile</p>
            <p className="mt-1 text-sm text-red-700">{error || 'Dati mancanti'}</p>
          </div>
        </div>
      </div>
    )
  }

  const p = plan
  const pay = p.pagamenti
  const stats = report?.stats || {}
  const inLavorazione = (stats.daApprovare || 0) + (stats.approvati || 0)
  const canali = Object.entries(stats.perCanale || {}).map(([label, value]) => ({ label, value }))
  const formati = Object.entries(stats.perFormato || {}).map(([label, value]) => ({ label, value }))
  const summary = report?.executive?.executiveSummary || []
  const payStatus = pay.subscription_status || pay.stato

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ciao, {p.cliente.nome} 👋</h1>
        <p className="mt-1 text-sm text-gray-500">Qui trovi i risultati, il tuo piano e i pagamenti. Ai contenuti pensiamo noi.</p>
      </div>

      {/* Piano + quota */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
            <PackageCheck className="h-5 w-5" /> Il tuo piano
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-3xl font-bold">{p.pacchetto.nome}</h2>
            <p className="whitespace-nowrap text-2xl font-bold">{p.pacchetto.prezzo}<span className="text-base font-medium text-gray-500">/mese</span></p>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">{p.pacchetto.sottotitolo}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {p.pacchetto.features.map(f => (
              <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" /><span>{f}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
            <CalendarDays className="h-5 w-5" /> Contenuti del mese
          </div>
          <h2 className="mt-3 text-3xl font-bold">{p.quota.usati}<span className="text-xl text-gray-400">/{p.quota.inclusi}</span></h2>
          <p className="text-sm text-gray-500">{p.quota.rimanenti} ancora inclusi in {p.mese.label}</p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${p.quota.percentuale}%` }} />
          </div>
        </section>
      </div>

      {/* Abbonamento + pagamento */}
      <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <CreditCard className="h-5 w-5" /> Abbonamento
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusTone(payStatus)}`}>{statusLabel(payStatus)}</span>
              {pay.cancel_at_period_end && <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">Disdetta a fine periodo</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600">
              <span>Prossimo rinnovo: <strong className="text-gray-900">{formatDate(pay.current_period_end)}</strong></span>
              {pay.ultimo_pagamento && <span>Ultimo pagamento: <strong className="text-gray-900">{formatMoney(pay.ultimo_pagamento.amount_paid, pay.ultimo_pagamento.currency)}</strong></span>}
            </div>
            <p className="mt-2 text-xs text-gray-500">Il canone si rinnova ogni mese in automatico. Da qui puoi aggiornare la carta, scaricare le fatture o disdire.</p>
          </div>
          <div className="flex flex-col items-stretch gap-2">
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
            >
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Paga e gestisci
            </button>
            {portalError && <p className="max-w-[220px] text-right text-xs text-red-600">{portalError}</p>}
          </div>
        </div>
      </section>

      {/* Risultati */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
            <BarChart3 className="h-5 w-5" /> I tuoi risultati
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <RefreshCw className="h-3.5 w-3.5" /> Aggiorna
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ResultTile label="Pubblicati" value={stats.pubblicati || 0} />
          <ResultTile label="In lavorazione" value={inLavorazione} />
          <ResultTile label="Totale nel mese" value={stats.totale || 0} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_1.3fr]">
          <TopList title="Canali principali" items={canali} />
          <TopList title="Formati principali" items={formati} />
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">In sintesi</p>
            <div className="mt-3 space-y-2">
              {(summary.length ? summary : ['Appena pubblichiamo i primi contenuti troverai qui la sintesi dei risultati.']).slice(0, 4).map(s => (
                <p key={s} className="text-sm leading-relaxed text-gray-600">{s}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
