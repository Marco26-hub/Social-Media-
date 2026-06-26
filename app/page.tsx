import Link from 'next/link'
import { PLATFORM_LIST } from '@/lib/social-config'
import {
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle,
  Send,
  Zap,
  ShieldCheck,
  Bot,
  BarChart3,
  FileText,
  Settings,
  Target,
} from 'lucide-react'

const FEATURES = [
  { icon: Bot,         titolo: 'AI genera tutto',        desc: 'Claude scrive hook, caption, hashtag e CTA per ogni post' },
  { icon: Calendar,    titolo: 'Piano settimanale auto', desc: 'Ogni lunedì alle 8:00 genera contenuti per tutti i canali' },
  { icon: CheckCircle, titolo: '1-click approval',       desc: 'Approva o rifiuta i post direttamente dal pannello admin' },
  { icon: Send,        titolo: 'Pubblicazione auto',     desc: 'Blotato pubblica sui canali ogni 15 minuti' },
  { icon: ShieldCheck, titolo: '8 validazioni',          desc: 'Stock, media, link, promo, account, consenso, dry-run, retry' },
  { icon: Zap,         titolo: 'Realtime dashboard',     desc: 'Supabase realtime — vedi pubblicazioni e errori live' },
]

const SERVIZI = [
  { icon: Target, titolo: 'Piano editoriale', desc: 'Piani settimanali e mensili generati in automatico', href: '/dashboard/piano' },
  { icon: Sparkles, titolo: 'Generatori social', desc: 'Formati dedicati per ogni canale e obiettivo', href: '/dashboard' },
  { icon: CheckCircle, titolo: 'Approvazione contenuti', desc: 'Coda editoriale con revisione umana prima della pubblicazione', href: '/dashboard/calendario?filter=DA_APPROVARE' },
  { icon: ShieldCheck, titolo: 'Validazioni sicurezza', desc: 'Controlli su media, account, stock, promo, link e consenso', href: '/dashboard/calendario' },
  { icon: Send, titolo: 'Pubblicazione Blotato', desc: 'Invio automatico ai canali con retry e tracking UTM', href: '/dashboard/log' },
  { icon: BarChart3, titolo: 'Log e report', desc: 'Attivita, errori, report settimanali e storico pubblicazioni', href: '/dashboard/log' },
  { icon: FileText, titolo: 'Blog SEO + GEO', desc: 'Articoli lunghi con FAQ schema e ottimizzazione per AI search', href: '/dashboard/social/blog' },
  { icon: Settings, titolo: 'Impostazioni operative', desc: 'Clienti, prodotti, variabili e configurazione workflow', href: '/dashboard/settings' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Social Automation</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/servizi" className="btn-secondary hidden sm:inline-flex">
              Landing servizi
            </Link>
            <Link href="/dashboard" className="btn-primary">
              Vai al pannello
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Powered by Claude + Blotato + n8n
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Automazione social<br />
          <span className="text-brand-600">con tutti i servizi attivi</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          AI scrive i post, prepara il piano editoriale, valida i contenuti, pubblica sui canali e registra tutto nel pannello.
          La preview ora mostra l&apos;intero sistema.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-primary text-base px-6 py-3">
            Apri pannello admin
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard/calendario" className="btn-secondary text-base px-6 py-3">
            Vedi calendario
          </Link>
        </div>
      </section>

      {/* Piattaforme supportate */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{PLATFORM_LIST.length} canali e servizi contenuto</h2>
          <p className="text-gray-600">Crea e pubblica su tutti i canali principali da un unico pannello</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLATFORM_LIST.map(p => (
            <div key={p.nome} className="card p-6 group hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className={`w-14 h-14 rounded-2xl ${p.colorBg} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                {p.emoji}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{p.nome}</h3>
              <p className="text-sm text-gray-500 mb-4">{p.descrizione}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.formati.map(f => (
                  <span key={f.id} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                    {f.nome}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Servizi disponibili */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Tutti i servizi operativi</h2>
              <p className="text-gray-600">Dalla generazione alla pubblicazione, ogni modulo e raggiungibile dalla preview.</p>
            </div>
            <Link href="/dashboard" className="btn-primary w-fit">
              Apri dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVIZI.map(({ icon: Icon, titolo, desc, href }) => (
              <Link key={titolo} href={href} className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{titolo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Come funziona</h2>
            <p className="text-gray-600">Pipeline AI + workflow + approvazione umana</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, titolo, desc }) => (
              <div key={titolo} className="card p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{titolo}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow visivo */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Pipeline completa</h2>
        </div>

        <div className="space-y-3">
          {[
            { step: '1', titolo: 'AI genera piano',       desc: 'Lunedì 08:00 — Claude crea contenuti per social, YouTube Shorts e blog', color: 'bg-purple-100 text-purple-700' },
            { step: '2', titolo: 'AI scrive contenuti',   desc: 'Ogni 30min — hook, caption, hashtag, CTA per ogni riga IDEA',         color: 'bg-blue-100 text-blue-700' },
            { step: '3', titolo: 'Sistema valida media',  desc: 'HEAD check link Drive/CDN — media_validato = SI/NO',                  color: 'bg-cyan-100 text-cyan-700' },
            { step: '4', titolo: 'TU approvi',            desc: 'Pannello admin — 1 click Approva, oppure modifica + Approva',         color: 'bg-yellow-100 text-yellow-700' },
            { step: '5', titolo: 'Sistema valida tutto',  desc: 'Stock, promo, account social, consenso, formato canale — 8 controlli', color: 'bg-orange-100 text-orange-700' },
            { step: '6', titolo: 'Blotato pubblica',      desc: 'Ogni 15min — push automatico ai canali con UTM tracking',             color: 'bg-green-100 text-green-700' },
            { step: '7', titolo: 'Log + retry',           desc: 'Errore → retry x2 → notifica Telegram. Successo → blotato_post_id',  color: 'bg-emerald-100 text-emerald-700' },
          ].map(s => (
            <div key={s.step} className="card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                {s.step}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{s.titolo}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA finale */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto a partire?</h2>
        <p className="text-gray-600 mb-8">Apri il pannello admin e vedi i contenuti da approvare</p>
        <Link href="/dashboard" className="btn-primary text-base px-8 py-3">
          Apri pannello admin
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        Social Automation V2 · Next.js 15 · Supabase · n8n · Claude · Blotato
      </footer>
    </div>
  )
}
