import { dbReady as isDbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import {
  Calendar, CheckCircle, AlertCircle, Send, Clock, TrendingUp, ChevronRight,
  Bot, Database, Rocket, ShieldCheck, Sparkles, Workflow, Package, ImagePlus,
  BarChart3, Megaphone
} from 'lucide-react'
import Link from 'next/link'
import { demoContenuti, demoLogs } from '@/lib/demo-data'
import { PLATFORM_LIST } from '@/lib/social-config'
import { isDemo } from '@/lib/demo'

export const dynamic = 'force-dynamic'

type DashboardLog = {
  id: string
  timestamp: string
  id_contenuto: string | null
  status_finale: string
  canale: string | null
  messaggio: string | null
}

async function getStats() {
  if (isDemo()) {
    return {
      brandConfigurato: true,
      prodotti: 3,
      daApprovare: demoContenuti.filter(c => c.status === 'DA_APPROVARE').length,
      pubblicati7g: demoContenuti.filter(c => c.status === 'PUBBLICATO').length,
      errori: demoContenuti.filter(c => c.status === 'ERRORE' || c.status === 'ERRORE_MANUALE').length,
      inCoda: demoContenuti.filter(c => c.status === 'APPROVATO').length,
      jobAttivi: 0,
      jobFalliti: 0,
      ultimi: demoLogs as DashboardLog[],
    }
  }
  const cid = await requireClienteId()
  await requireAuth()
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const [
    daRows,
    pubRows,
    errRows,
    codaRows,
    jobARows,
    jobFRows,
    ultimiRows,
    brandRows,
    productRows,
  ] = await Promise.all([
    q('SELECT count(*)::int as c FROM calendario WHERE cliente_id = $1 AND status = $2', [cid, 'DA_APPROVARE']),
    q('SELECT count(*)::int as c FROM calendario WHERE cliente_id = $1 AND status = $2 AND data_pubblicazione >= $3', [cid, 'PUBBLICATO', weekAgo]),
    q("SELECT count(*)::int as c FROM calendario WHERE cliente_id = $1 AND status IN ('ERRORE','ERRORE_MANUALE')", [cid]),
    q('SELECT count(*)::int as c FROM calendario WHERE cliente_id = $1 AND status = $2', [cid, 'APPROVATO']),
    q("SELECT count(*)::int as c FROM generation_jobs WHERE cliente_id = $1 AND status IN ('queued','running')", [cid]),
    q('SELECT count(*)::int as c FROM generation_jobs WHERE cliente_id = $1 AND status = $2', [cid, 'failed']),
    q('SELECT * FROM log_pubblicazioni WHERE cliente_id = $1 ORDER BY timestamp DESC LIMIT 5', [cid]),
    q('SELECT count(*)::int as c FROM brand WHERE cliente_id = $1', [cid]),
    q("SELECT count(*)::int as c FROM prodotti WHERE cliente_id = $1 AND prodotto_attivo = 'SI'", [cid]),
  ])

  return {
    brandConfigurato: ((brandRows[0] as { c: number } | undefined)?.c ?? 0) > 0,
    prodotti: (productRows[0] as { c: number } | undefined)?.c ?? 0,
    daApprovare: (daRows[0] as { c: number } | undefined)?.c ?? 0,
    pubblicati7g: (pubRows[0] as { c: number } | undefined)?.c ?? 0,
    errori: (errRows[0] as { c: number } | undefined)?.c ?? 0,
    inCoda: (codaRows[0] as { c: number } | undefined)?.c ?? 0,
    jobAttivi: (jobARows[0] as { c: number } | undefined)?.c ?? 0,
    jobFalliti: (jobFRows[0] as { c: number } | undefined)?.c ?? 0,
    ultimi: (ultimiRows ?? []) as DashboardLog[],
  }
}

function getSystemHealth() {
  const demo = isDemo()
  const databaseReady = demo || isDbReady()
  const authReady = Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
  const aiReady = Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY)
  const operationsReady = !demo

  return {
    demo,
    ready: databaseReady && authReady && aiReady,
    items: [
      {
        label: 'Archivio dati',
        value: databaseReady ? 'Connesso' : 'Da attivare',
        icon: Database,
        tone: databaseReady ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50',
      },
      {
        label: 'Accesso sicuro',
        value: authReady ? 'Attivo' : 'Da attivare',
        icon: ShieldCheck,
        tone: authReady ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50',
      },
      {
        label: 'Intelligenza AI',
        value: aiReady ? 'Pronta' : 'Da attivare',
        icon: Bot,
        tone: aiReady ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50',
      },
      {
        label: 'Sistema',
        value: operationsReady ? 'Pronto' : 'Modalità demo',
        icon: Workflow,
        tone: operationsReady ? 'text-blue-700 bg-blue-50' : 'text-slate-700 bg-slate-100',
      },
    ],
  }
}

export default async function DashboardPage() {
  const { brandConfigurato, prodotti, daApprovare, pubblicati7g, errori, inCoda, ultimi } = await getStats()
  const systemHealth = getSystemHealth()

  const stats = [
    { label: 'Da approvare',          value: daApprovare ?? 0, icon: Clock,         color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/dashboard/calendario?filter=DA_APPROVARE' },
    { label: 'Pubblicati (7 giorni)', value: pubblicati7g ?? 0,icon: TrendingUp,    color: 'text-green-600',  bg: 'bg-green-50',  href: '/dashboard/log' },
    { label: 'Pronti da pubblicare',  value: inCoda ?? 0,      icon: Send,          color: 'text-blue-600',   bg: 'bg-blue-50',   href: '/dashboard/calendario?filter=APPROVATO' },
    { label: 'Da sistemare',          value: errori ?? 0,      icon: AlertCircle,   color: 'text-red-600',    bg: 'bg-red-50',    href: '/dashboard/calendario?filter=ERRORE' },
  ]

  const statusColor: Record<string, string> = {
    PUBBLICATO:       'text-green-700',
    ERRORE:           'text-red-700',
    ERRORE_MANUALE:   'text-red-700',
    DRY_RUN_OK:       'text-teal-700',
    ERRORE_WORKFLOW:  'text-orange-700',
  }

  const productionFlow = [
    {
      step: '01',
      title: '1. Piano del mese',
      input: 'Cosa vuoi ottenere e su quali social',
      output: 'Un calendario di contenuti pronto',
      href: '/dashboard/piano',
      icon: Workflow,
      done: daApprovare + inCoda + pubblicati7g > 0,
      cta: 'Crea il piano',
    },
    {
      step: '02',
      title: '2. Brand e stile',
      input: 'Sito, stile e tono della tua attività',
      output: 'Le regole che l\'AI seguirà sempre',
      href: '/dashboard/brand',
      icon: Sparkles,
      done: brandConfigurato,
      cta: brandConfigurato ? 'Rivedi brand' : 'Completa brand',
    },
    {
      step: '03',
      title: '3. Prodotti e foto',
      input: 'Foto e info dei tuoi prodotti',
      output: 'Materiale pronto per i contenuti',
      href: '/dashboard/prodotti',
      icon: Package,
      done: prodotti > 0,
      cta: prodotti > 0 ? `${prodotti} prodotti` : 'Carica prodotti',
    },
    {
      step: '04',
      title: '4. Crea contenuti',
      input: 'Le scelte fatte nei passi prima',
      output: 'Post, reel, storie e articoli scritti',
      href: '/dashboard/social/instagram',
      icon: ImagePlus,
      done: daApprovare > 0 || inCoda > 0 || pubblicati7g > 0,
      cta: 'Crea contenuti',
    },
    {
      step: '05',
      title: '5. Approva',
      input: 'I contenuti appena creati',
      output: 'Contenuti approvati o da sistemare',
      href: '/dashboard/calendario?filter=DA_APPROVARE',
      icon: ShieldCheck,
      done: daApprovare === 0 && (inCoda > 0 || pubblicati7g > 0),
      attention: daApprovare > 0,
      cta: daApprovare > 0 ? `${daApprovare} da approvare` : 'Tutto approvato',
    },
    {
      step: '06',
      title: '6. Pubblica',
      input: 'I contenuti approvati',
      output: 'Post pubblicati sui social',
      href: '/dashboard/log',
      icon: Megaphone,
      done: pubblicati7g > 0,
      attention: errori > 0,
      cta: errori > 0 ? `${errori} da sistemare` : 'Vedi pubblicati',
    },
    {
      step: '07',
      title: '7. Report cliente',
      input: 'I risultati del mese',
      output: 'Un report chiaro da consegnare',
      href: '/dashboard/report',
      icon: BarChart3,
      done: pubblicati7g > 0,
      cta: 'Crea report',
    },
  ]

  const nextStep = productionFlow.find(step => step.attention || !step.done) || productionFlow[productionFlow.length - 1]

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 md:p-8 mb-6 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.28),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_30%)]" />
        <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              La tua bacheca · {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              Dal piano alla pubblicazione,<br className="hidden md:block" /> tutto in un unico posto.
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-3 max-w-2xl">
              Un solo posto per pianificare, produrre con l&apos;AI, far approvare e pubblicare. Segui il prossimo step suggerito e il sistema fa il resto.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href={nextStep.href} className="btn-primary">
                <Rocket className="w-4 h-4" />
                Da fare adesso: {nextStep.cta}
              </Link>
              <Link href="/dashboard/calendario?filter=DA_APPROVARE" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/15 transition-colors">
                <ShieldCheck className="w-4 h-4" />
                Approva contenuti
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold">Stato sistema</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${systemHealth.ready ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/20 text-amber-100'}`}>
                {systemHealth.ready ? 'Ready' : 'Setup'}
              </span>
            </div>
            <div className="space-y-2">
              {systemHealth.items.map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-white/90 p-3 text-slate-900">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg p-2 ${tone}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <span className="text-xs text-slate-500">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link href={href} key={label} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Ciclo produzione collegato */}
      <div className="card p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Il tuo flusso di lavoro</h2>
            <p className="text-sm text-gray-500 mt-1">
              7 step collegati: ogni passo usa l&apos;output del precedente. Le card in giallo richiedono la tua azione.
            </p>
          </div>
          <Link href="/dashboard/setup" className="btn-secondary text-xs py-2 px-3 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4" />
            Setup produzione
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
          {productionFlow.map(({ step, title, input, output, href, icon: Icon, done, attention, cta }, index) => (
            <Link
              key={step}
              href={href}
              className={`relative rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                attention
                  ? 'border-amber-200 bg-amber-50'
                  : done
                    ? 'border-emerald-100 bg-emerald-50/60'
                    : 'border-gray-100 bg-white'
              }`}
            >
              {index < productionFlow.length - 1 && (
                <ChevronRight className="hidden xl:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 bg-white rounded-full" />
              )}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold text-gray-400">{step}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  attention
                    ? 'bg-amber-100 text-amber-700'
                    : done
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {attention ? 'da fare ora' : done ? 'fatto' : 'da fare'}
                </span>
              </div>
              <Icon className={`w-5 h-5 mb-3 ${attention ? 'text-amber-600' : done ? 'text-emerald-600' : 'text-brand-600'}`} />
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              <p className="text-[11px] text-gray-500 mt-2">
                <span className="font-semibold text-gray-700">Ti serve:</span> {input}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                <span className="font-semibold text-gray-700">Ottieni:</span> {output}
              </p>
              <p className="text-xs font-semibold text-brand-600 mt-3">{cta} →</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Grid social — entry-point per ogni piattaforma */}
      <div className="mb-6 mt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Crea contenuto</h2>
          <Link href="/dashboard/piano" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            Piano editoriale <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {PLATFORM_LIST.map(p => (
            <Link
              key={p.key}
              href={`/dashboard/social/${p.key}`}
              className="card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-center group"
            >
              <div className={`w-12 h-12 mx-auto rounded-2xl ${p.colorBg} flex items-center justify-center text-2xl mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                {p.emoji}
              </div>
              <p className="font-semibold text-sm text-gray-900">{p.nome}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{p.formati.length} {p.formati.length === 1 ? 'formato' : 'formati'}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Ultimi log + CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Ultime attività</h2>
            <Link href="/dashboard/log" className="text-sm text-brand-600 hover:underline">Vedi tutti →</Link>
          </div>
          {ultimi.length === 0 ? (
            <p className="text-sm text-gray-400">Nessuna attività ancora.</p>
          ) : (
            <div className="space-y-3">
              {ultimi.map((log: DashboardLog) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800">{log.id_contenuto ?? '—'}</span>
                    {log.canale && <span className="text-gray-400 ml-1">· {log.canale}</span>}
                    <span className={`ml-2 font-medium ${statusColor[log.status_finale] ?? 'text-gray-600'}`}>
                      {log.status_finale}
                    </span>
                    {log.messaggio && <p className="text-gray-400 truncate">{log.messaggio}</p>}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Azioni rapide */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Azioni rapide</h2>
          <div className="space-y-2">
            <Link href="/dashboard/calendario?filter=DA_APPROVARE" className="btn-secondary w-full justify-start">
              <CheckCircle className="w-4 h-4 text-yellow-500" />
              Approva contenuti
            </Link>
            <Link href="/dashboard/calendario?filter=ERRORE" className="btn-secondary w-full justify-start">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Gestisci errori
            </Link>
            <Link href="/dashboard/calendario" className="btn-secondary w-full justify-start">
              <Calendar className="w-4 h-4 text-blue-500" />
              Vedi calendario
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
