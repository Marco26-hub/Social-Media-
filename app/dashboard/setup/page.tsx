'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Database, KeyRound, Loader2, RefreshCw, Rocket, ShieldCheck, Sparkles, UploadCloud, XCircle } from 'lucide-react'

type HealthResponse = {
  status: 'ready' | 'needs_setup'
  mode: 'demo' | 'production'
  database: string
  checked_at: string
  checks: Record<string, boolean>
  database_details?: {
    migrationCount?: number
    error?: string | null
  }
  next_actions?: string[]
}

type CheckItem = {
  key: string
  label: string
  desc: string
  ok: boolean
  required: boolean
  action?: string
}

const EXPECTED_MIGRATIONS = 13

function statusClass(ok: boolean, required: boolean) {
  if (ok) return 'bg-green-50 text-green-700 border-green-200'
  if (required) return 'bg-red-50 text-red-700 border-red-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

function StatusIcon({ ok, required }: { ok: boolean; required: boolean }) {
  if (ok) return <CheckCircle2 className="w-4 h-4 text-green-600" />
  if (required) return <XCircle className="w-4 h-4 text-red-600" />
  return <AlertTriangle className="w-4 h-4 text-amber-600" />
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 90 ? 'bg-green-500' : value >= 65 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function buildChecks(health: HealthResponse | null): CheckItem[] {
  const checks = health?.checks ?? {}
  const migrationCount = health?.database_details?.migrationCount ?? 0
  return [
    {
      key: 'databaseUrl',
      label: 'DATABASE_URL Neon',
      desc: 'Stringa database configurata in Render Environment.',
      ok: Boolean(checks.databaseUrl),
      required: true,
      action: 'Render → Environment → DATABASE_URL',
    },
    {
      key: 'dbConnection',
      label: 'Connessione DB',
      desc: 'La app riesce a connettersi a Neon/Postgres.',
      ok: Boolean(checks.dbConnection),
      required: true,
      action: 'Verifica password/SSL nella stringa Neon.',
    },
    {
      key: 'migrations',
      label: 'Migrations applicate',
      desc: `${migrationCount}/${EXPECTED_MIGRATIONS} migrations registrate nel DB.`,
      ok: Boolean(checks.migrationsTable && migrationCount >= EXPECTED_MIGRATIONS),
      required: true,
      action: 'Render Shell → npm run migrate',
    },
    {
      key: 'profilesTable',
      label: 'Tabella utenti',
      desc: 'Tabella profiles presente per NextAuth credentials.',
      ok: Boolean(checks.profilesTable),
      required: true,
      action: 'Render Shell → npm run migrate',
    },
    {
      key: 'adminUser',
      label: 'Admin creato',
      desc: 'Utente admin / 1234567 presente nel DB.',
      ok: Boolean(checks.adminUser),
      required: true,
      action: 'Render Shell → npm run migrate -- --file 011_admin_user.sql',
    },
    {
      key: 'authSecret',
      label: 'AUTH_SECRET',
      desc: 'Secret sessioni configurato.',
      ok: Boolean(checks.authSecret),
      required: true,
      action: 'Render → Environment → AUTH_SECRET',
    },
    {
      key: 'nextauthUrl',
      label: 'NEXTAUTH_URL',
      desc: 'URL canonico login/sessione NextAuth.',
      ok: Boolean(checks.nextauthUrl),
      required: true,
      action: 'Deve essere https://social-media-manager-zte4.onrender.com o dominio custom.',
    },
    {
      key: 'siteUrl',
      label: 'NEXT_PUBLIC_SITE_URL',
      desc: 'URL pubblico usato per link, callback e referrer AI.',
      ok: Boolean(checks.siteUrl),
      required: true,
      action: 'Render → Environment → NEXT_PUBLIC_SITE_URL',
    },
    {
      key: 'ai',
      label: 'AI Provider',
      desc: 'Almeno una chiave tra OpenRouter e Anthropic.',
      ok: Boolean(checks.openrouter || checks.anthropic),
      required: true,
      action: 'Configura OPENROUTER_API_KEY o ANTHROPIC_API_KEY.',
    },
    {
      key: 'blotatoApiKey',
      label: 'Blotato API Key',
      desc: 'Necessaria per pubblicazione automatica reale.',
      ok: Boolean(checks.blotatoApiKey),
      required: false,
      action: 'Render → Environment → BLOTATO_API_KEY',
    },
    {
      key: 'blotatoWebhookSecret',
      label: 'Blotato Webhook Secret',
      desc: 'Firma callback pubblicazione Blotato.',
      ok: Boolean(checks.blotatoWebhookSecret),
      required: false,
      action: 'Render → Environment → BLOTATO_WEBHOOK_SECRET',
    },
  ]
}

export default function ProductionSetupPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadHealth() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/system/health', { cache: 'no-store' })
      if (!response.ok) throw new Error(`Health HTTP ${response.status}`)
      setHealth(await response.json() as HealthResponse)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Errore health')
    }
    setLoading(false)
  }

  useEffect(() => { loadHealth() }, [])

  const checks = useMemo(() => buildChecks(health), [health])
  const required = checks.filter(item => item.required)
  const optional = checks.filter(item => !item.required)
  const requiredOk = required.filter(item => item.ok).length
  const optionalOk = optional.filter(item => item.ok).length
  const readiness = checks.length ? Math.round(((requiredOk * 1.4) + optionalOk) / ((required.length * 1.4) + optional.length) * 100) : 0
  const ready = health?.status === 'ready'
  const migrationCount = health?.database_details?.migrationCount ?? 0

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-600 font-bold">Production Readiness</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Setup Produzione</h1>
          <p className="text-sm text-gray-500 mt-1">Controllo live di database, auth, AI, Blotato e readiness vendita.</p>
        </div>
        <button onClick={loadHealth} disabled={loading} className="btn-secondary justify-center py-2 px-4">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Aggiorna
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Health check fallito: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-emerald-300" />
                <h2 className="font-bold">Stato piattaforma</h2>
              </div>
              <p className="text-sm text-slate-300">
                {ready ? 'La piattaforma è pronta per uso operativo.' : 'Mancano ancora controlli prima della produzione completa.'}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${ready ? 'bg-green-400/20 text-green-200' : 'bg-amber-400/20 text-amber-200'}`}>
              {health?.status || 'loading'}
            </span>
          </div>
          <ProgressBar value={readiness} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Readiness', value: `${readiness}%` },
              { label: 'Mode', value: health?.mode || 'n/d' },
              { label: 'Migrations', value: `${migrationCount}/${EXPECTED_MIGRATIONS}` },
              { label: 'DB', value: health?.database || 'n/d' },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-white/10 p-3">
                <p className="text-[10px] uppercase text-slate-400 font-bold">{item.label}</p>
                <p className="text-lg font-bold text-white mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-violet-600" />
            <h2 className="font-bold text-gray-900">Accesso Admin</h2>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 mb-3">
            <p className="text-xs text-gray-500">URL</p>
            <p className="text-xs font-mono text-gray-900 break-all">/login</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Utente</p>
              <p className="font-mono font-bold text-gray-900">admin</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Password</p>
              <p className="font-mono font-bold text-gray-900">1234567</p>
            </div>
          </div>
          <Link href="/login" className="btn-primary w-full justify-center mt-3 text-sm py-2">Apri login</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-gray-900">Checklist obbligatoria</h2>
          </div>
          <div className="space-y-2">
            {required.map(item => (
              <div key={item.key} className={`rounded-xl border p-3 ${statusClass(item.ok, item.required)}`}>
                <div className="flex items-start gap-2">
                  <StatusIcon ok={item.ok} required={item.required} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-xs opacity-80 mt-0.5">{item.desc}</p>
                    {!item.ok && item.action && <p className="text-xs font-mono mt-2 bg-white/60 rounded px-2 py-1">{item.action}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <UploadCloud className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-gray-900">Pubblicazione automatica</h2>
          </div>
          <div className="space-y-2">
            {optional.map(item => (
              <div key={item.key} className={`rounded-xl border p-3 ${statusClass(item.ok, item.required)}`}>
                <div className="flex items-start gap-2">
                  <StatusIcon ok={item.ok} required={item.required} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-xs opacity-80 mt-0.5">{item.desc}</p>
                    {!item.ok && item.action && <p className="text-xs font-mono mt-2 bg-white/60 rounded px-2 py-1">{item.action}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">Nota: senza Blotato puoi vendere generazione, calendario, approvazione e report; non promettere autopublishing end-to-end.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-5 h-5 text-gray-700" />
            <h2 className="font-bold text-gray-900">Comandi rapidi Render Shell</h2>
          </div>
          <div className="space-y-2">
            {[
              'npm run migrate',
              'npm run migrate -- --file 011_admin_user.sql',
              'npm run prod:check',
            ].map(command => (
              <div key={command} className="rounded-lg bg-gray-950 text-green-300 font-mono text-xs px-3 py-2">{command}</div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h2 className="font-bold text-gray-900">Azioni suggerite</h2>
          </div>
          <ul className="space-y-2">
            {(health?.next_actions?.length ? health.next_actions : ['Tutto pronto: genera contenuto test e approva dal calendario.']).map((action, index) => (
              <li key={index} className="text-sm text-gray-700 flex gap-2">
                <span className="text-violet-500 font-bold">{index + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
