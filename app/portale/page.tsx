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
import styles from './portale.module.css'

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
function statusClass(s: string | null | undefined) {
  if (['active', 'trialing', 'paid'].includes(s || '')) return styles.badgeOk
  if (['past_due', 'unpaid', 'open'].includes(s || '')) return styles.badgeWarn
  if (['canceled', 'failed'].includes(s || '')) return styles.badgeBad
  return styles.badgeOk
}

function VizList({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map(i => i.value))
  return (
    <div className={styles.vizCard}>
      <p className={styles.vizTitle}>{title}</p>
      {items.length === 0 ? (
        <p className={styles.empty}>Nessun dato ancora</p>
      ) : (
        <div className={styles.rows}>
          {items.map(i => (
            <div key={i.label}>
              <div className={styles.rowTop}><span>{i.label}</span><b>{i.value}</b></div>
              <div className={styles.rowBar}><div className={styles.rowBarFill} style={{ width: `${(i.value / max) * 100}%` }} /></div>
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
    return <div className={styles.loading}><Loader2 className="h-7 w-7 animate-spin" style={{ color: 'rgba(16,18,14,0.35)' }} /></div>
  }
  if (error || !plan) {
    return (
      <div className={styles.err}>
        <AlertTriangle size={20} />
        <div><b>Spazio non disponibile</b><p>{error || 'Dati mancanti'}</p></div>
      </div>
    )
  }

  const p = plan
  const pay = p.pagamenti
  const stats = report?.stats || {}
  const inLavorazione = (stats.daApprovare || 0) + (stats.approvati || 0)
  const canali = Object.entries(stats.perCanale || {}).map(([label, value]) => ({ label, value }))
  const formati = Object.entries(stats.perFormato || {}).map(([label, value]) => ({ label, value }))
  // Sintesi client-facing: fuori le righe tecniche grezze (es. "funnel non_classificato").
  const summary = (report?.executive?.executiveSummary || []).filter(s => !/non[_ ]?classificato/i.test(s))
  const payStatus = pay.subscription_status || pay.stato

  return (
    <div>
      <h1 className={`${styles.display} ${styles.hello}`}>Ciao, {p.cliente.nome} 👋</h1>
      <p className={styles.helloSub}>Qui trovi i risultati, il tuo piano e i pagamenti. Ai contenuti pensiamo noi.</p>

      <div className={styles.grid2}>
        {/* Piano */}
        <section className={styles.card}>
          <span className={styles.cardLabel}><PackageCheck size={18} /> Il tuo piano</span>
          <div className={styles.planTop}>
            <h2 className={`${styles.display} ${styles.planName}`}>{p.pacchetto.nome}</h2>
            <p className={`${styles.display} ${styles.planPrice}`}>{p.pacchetto.prezzo}<small>/mese</small></p>
          </div>
          <p className={styles.planSub}>{p.pacchetto.sottotitolo}</p>
          <div className={styles.featGrid}>
            {p.pacchetto.features.map(f => (
              <span key={f} className={styles.feat}><CheckCircle2 size={16} /> {f}</span>
            ))}
          </div>
        </section>

        {/* Quota */}
        <section className={styles.card}>
          <span className={styles.cardLabel}><CalendarDays size={18} /> Contenuti del mese</span>
          <p className={`${styles.display} ${styles.quotaNum}`}>{p.quota.usati}<small>/{p.quota.inclusi}</small></p>
          <p className={styles.quotaMeta}>{p.quota.rimanenti} ancora inclusi in {p.mese.label}</p>
          <div className={styles.bar}><div className={styles.barFill} style={{ width: `${p.quota.percentuale}%` }} /></div>
        </section>
      </div>

      {/* Abbonamento */}
      <section className={styles.card} style={{ marginTop: 18 }}>
        <div className={styles.subCard}>
          <div>
            <span className={styles.cardLabel}><CreditCard size={18} /> Abbonamento</span>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span className={`${styles.badge} ${statusClass(payStatus)}`}>{statusLabel(payStatus)}</span>
              {pay.cancel_at_period_end && <span className={`${styles.badge} ${styles.badgeWarn}`}>Disdetta a fine periodo</span>}
            </div>
            <div className={styles.subMeta}>
              <span>Prossimo rinnovo: <strong>{formatDate(pay.current_period_end)}</strong></span>
              {pay.ultimo_pagamento && <span>Ultimo pagamento: <strong>{formatMoney(pay.ultimo_pagamento.amount_paid, pay.ultimo_pagamento.currency)}</strong></span>}
            </div>
            <p className={styles.subNote}>Il canone si rinnova ogni mese in automatico. Da qui puoi aggiornare la carta, scaricare le fatture o disdire.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <button onClick={openPortal} disabled={portalLoading} className={styles.payBtn}>
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink size={16} />}
              Paga e gestisci
            </button>
            {portalError && <p className={styles.payErr}>{portalError}</p>}
          </div>
        </div>
      </section>

      {/* Risultati */}
      <div className={styles.sectionHead}>
        <span className={styles.cardLabel}><BarChart3 size={18} /> I tuoi risultati</span>
        <button onClick={load} className={styles.refresh}><RefreshCw size={14} /> Aggiorna</button>
      </div>
      <div className={styles.tiles}>
        <div className={styles.tile}>
          <p className={styles.tileLabel}>Pubblicati</p>
          <p className={`${styles.display} ${styles.tileVal} ${styles.tileValForest}`}>{stats.pubblicati || 0}</p>
        </div>
        <div className={styles.tile}>
          <p className={styles.tileLabel}>In lavorazione</p>
          <p className={`${styles.display} ${styles.tileVal} ${styles.tileValGold}`}>{inLavorazione}</p>
        </div>
        <div className={styles.tile}>
          <p className={styles.tileLabel}>Totale nel mese</p>
          <p className={`${styles.display} ${styles.tileVal}`}>{stats.totale || 0}</p>
        </div>
      </div>
      <div className={styles.viz}>
        <VizList title="Canali principali" items={canali} />
        <VizList title="Formati principali" items={formati} />
        <div className={styles.vizCard}>
          <p className={styles.vizTitle}>In sintesi</p>
          <div className={styles.summary}>
            {(summary.length ? summary : ['Appena pubblichiamo i primi contenuti troverai qui la sintesi dei risultati.']).slice(0, 4).map(s => (
              <p key={s}>{s}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
