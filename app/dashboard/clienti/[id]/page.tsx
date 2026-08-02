'use client'
export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { isDemo } from '@/lib/demo'
import type { Contenuto, Cliente } from '@/lib/types'
import type { Destination } from '@/lib/blotato-accounts'
import { PACKAGE_LIST } from '@/lib/packages'
import {
  Building2, Calendar, BarChart3, Target, ShoppingBag, FileText,
  TrendingUp, AlertTriangle, CheckCircle, Clock, ArrowLeft,
  Loader2, Globe, Check, X, Send,
} from 'lucide-react'
import Link from 'next/link'
import { demoContenuti, demoClienti } from '@/lib/demo-data'
import StatusBadge from '@/components/StatusBadge'

const CANALE_ICON: Record<string, string> = {
  instagram: '📸', facebook: '🔵', tiktok: '🎵', pinterest: '📌', youtube_shorts: '▶️', linkedin: '💼',
  threads: '🧵', x: '✖️',
}

const CANALE_NOME: Record<string, string> = {
  instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', pinterest: 'Pinterest',
  youtube_shorts: 'YouTube Shorts', linkedin: 'LinkedIn', threads: 'Threads', x: 'X',
}

// Prova a vuoto: legge la destinazione REALE di ogni canale senza pubblicare niente.
// Serve perché il workspace Blotato contiene account di più clienti: senza questa
// verifica il primo post live potrebbe finire sull'account di qualcun altro.
async function caricaDestinazioni(clienteId: string): Promise<Destination[]> {
  const res = await fetch(`/api/data/blotato-accounts?cliente_id=${encodeURIComponent(clienteId)}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Lettura account Blotato fallita')
  return Array.isArray(data.destinations) ? data.destinations as Destination[] : []
}

export default function ClienteDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [contenuti, setContenuti] = useState<Contenuto[]>([])
  const [loading, setLoading] = useState(true)
  const [blogDomain, setBlogDomain] = useState('')
  const [savingDomain, setSavingDomain] = useState(false)
  const [domainMsg, setDomainMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pacchetto, setPacchetto] = useState('')
  const [contenutiMese, setContenutiMese] = useState('')
  const [savingQuota, setSavingQuota] = useState(false)
  const [quotaMsg, setQuotaMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [savingPkg, setSavingPkg] = useState(false)
  const [pkgMsg, setPkgMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [timezone, setTimezone] = useState('Europe/Rome')
  const [savingTz, setSavingTz] = useState(false)
  const [tzMsg, setTzMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [destinazioni, setDestinazioni] = useState<Destination[]>([])
  const [destLoading, setDestLoading] = useState(true)
  const [destAvviso, setDestAvviso] = useState('')
  const [savingCanale, setSavingCanale] = useState('')
  const [destMsg, setDestMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      if (isDemo()) {
        const c = demoClienti.find(x => x.id === id || x.slug === id)
        if (c) {
          setCliente(c)
          setPacchetto(c.pacchetto || '')
          setContenutiMese(String(c.contenuti_mese ?? ''))
          setTimezone(c.timezone || 'Europe/Rome')
          setContenuti(demoContenuti.filter(x => x.cliente_id === c.id).slice(0, 10))
        }
        setLoading(false)
        return
      }
      try {
        const [cRes, calRes] = await Promise.all([
          fetch('/api/data/clienti').then(r => r.ok ? r.json() : []),
          fetch(`/api/data/calendario`).then(r => r.ok ? r.json() : []),
        ])
        const clienti = Array.isArray(cRes) ? cRes as Cliente[] : []
        const c = clienti.find(x => x.id === id || x.slug === id)
        if (c) { setCliente(c); setBlogDomain(c.blog_domain || ''); setPacchetto(c.pacchetto || ''); setContenutiMese(String(c.contenuti_mese ?? '')); setTimezone(c.timezone || 'Europe/Rome') }
        setContenuti((Array.isArray(calRes) ? calRes : []).slice(0, 10))
      } catch {}
      setLoading(false)
    }
    load()
  }, [id])

  async function saveBlogDomain() {
    if (!cliente) return
    setSavingDomain(true)
    setDomainMsg(null)
    try {
      const res = await fetch('/api/data/clienti', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cliente.id, blog_domain: blogDomain.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Salvataggio fallito')
      setCliente(prev => prev ? { ...prev, blog_domain: blogDomain.trim() || null } : prev)
      setDomainMsg({ type: 'ok', text: 'Dominio salvato.' })
    } catch (e) {
      setDomainMsg({ type: 'err', text: (e as Error).message })
    } finally {
      setSavingDomain(false)
    }
  }

  // Anteprima delle destinazioni: sola lettura, non invia nulla a Blotato.
  const ricaricaDestinazioni = useCallback(async () => {
    if (!id || isDemo()) { setDestLoading(false); return }
    setDestLoading(true)
    setDestAvviso('')
    try {
      setDestinazioni(await caricaDestinazioni(String(id)))
    } catch (e) {
      setDestinazioni([])
      setDestAvviso((e as Error).message)
    } finally {
      setDestLoading(false)
    }
  }, [id])

  useEffect(() => { ricaricaDestinazioni() }, [ricaricaDestinazioni])

  // Fissa account (e pagina/bacheca) per un canale, poi ricarica per mostrare la
  // destinazione reale risultante invece di fidarsi di quella ottimistica.
  async function salvaDestinazione(canale: string, accountId: string, subaccountId = '') {
    if (!cliente) return
    setSavingCanale(canale)
    setDestMsg(null)
    try {
      const res = await fetch('/api/data/blotato-accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: cliente.id, canale, account_id: accountId, subaccount_id: subaccountId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Salvataggio fallito')
      setDestMsg({ type: 'ok', text: 'Destinazione aggiornata.' })
      await ricaricaDestinazioni()
    } catch (e) {
      setDestMsg({ type: 'err', text: (e as Error).message })
    } finally {
      setSavingCanale('')
    }
  }

  // Quota mensile: override manuale del numero che segue il pacchetto.
  async function saveContenutiMese() {
    if (!cliente) return
    const n = Number(contenutiMese)
    if (!Number.isFinite(n) || n < 0 || n > 200) {
      setQuotaMsg({ type: 'err', text: 'Inserisci un numero tra 0 e 200.' })
      return
    }
    setSavingQuota(true)
    setQuotaMsg(null)
    try {
      const res = await fetch('/api/data/clienti', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cliente.id, contenuti_mese: n }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Salvataggio fallito')
      setCliente(prev => prev ? { ...prev, contenuti_mese: n } : prev)
      setQuotaMsg({ type: 'ok', text: `Quota aggiornata: ${n} contenuti al mese.` })
    } catch (e) {
      setQuotaMsg({ type: 'err', text: (e as Error).message })
    } finally {
      setSavingQuota(false)
    }
  }

  // Pacchetto acquistato dal cliente (upgrade/downgrade). '' = nessun pacchetto → null.
  async function savePacchetto() {
    if (!cliente) return
    setSavingPkg(true)
    setPkgMsg(null)
    try {
      const res = await fetch('/api/data/clienti', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cliente.id, pacchetto }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Salvataggio fallito')
      const nuovo = (pacchetto === 'presenza' || pacchetto === 'crescita') ? pacchetto : null
      setCliente(prev => prev ? { ...prev, pacchetto: nuovo } : prev)
      setPkgMsg({ type: 'ok', text: 'Pacchetto aggiornato.' })
    } catch (e) {
      setPkgMsg({ type: 'err', text: (e as Error).message })
    } finally {
      setSavingPkg(false)
    }
  }

  // Fuso orario del cliente: interpreta le ore del piano e converte in UTC per Blotato.
  async function saveTimezone() {
    if (!cliente) return
    setSavingTz(true)
    setTzMsg(null)
    try {
      const res = await fetch('/api/data/clienti', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cliente.id, timezone }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Salvataggio fallito')
      setCliente(prev => prev ? { ...prev, timezone } : prev)
      setTzMsg({ type: 'ok', text: 'Fuso orario aggiornato.' })
    } catch (e) {
      setTzMsg({ type: 'err', text: (e as Error).message })
    } finally {
      setSavingTz(false)
    }
  }

  if (loading) return <div className="p-8 flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
  if (!cliente) return (
    <div className="p-8 text-center"><h1 className="text-xl font-bold text-gray-900 mb-2">Cliente non trovato</h1>
      <Link href="/dashboard/clienti" className="btn-primary">Torna ai clienti</Link>
    </div>
  )

  const stats = {
    totale: contenuti.length,
    daApprovare: contenuti.filter(c => c.status === 'DA_APPROVARE').length,
    approvati: contenuti.filter(c => c.status === 'APPROVATO').length,
    pubblicati: contenuti.filter(c => c.status === 'PUBBLICATO').length,
    errori: contenuti.filter(c => ['ERRORE', 'ERRORE_MANUALE'].includes(c.status)).length,
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/clienti" className="btn-secondary py-1.5 px-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">{cliente.nome}</h1>
          <p className="text-sm text-gray-500">{cliente.settore || 'Settore non specificato'} · piano {cliente.piano} · {cliente.email && <a href={`mailto:${cliente.email}`} className="hover:underline">{cliente.email}</a>}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${cliente.attivo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {cliente.attivo ? 'Attivo' : 'Inattivo'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Totali', value: stats.totale, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
          { label: 'Da approvare', value: stats.daApprovare, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Approvati', value: stats.approvati, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Pubblicati', value: stats.pubblicati, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Errori', value: stats.errori, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-3 md:p-4 text-center">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-1.5`}><Icon className="w-4 h-4 md:w-5 md:h-5" /></div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-[10px] md:text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: '/dashboard/settings?tab=brand', label: 'Profilo Brand', icon: Building2, color: 'bg-violet-500' },
          { href: '/dashboard/calendario', label: 'Calendario', icon: Calendar, color: 'bg-blue-500' },
          { href: '/dashboard/piano', label: 'Piano editoriale', icon: Target, color: 'bg-purple-500' },
          { href: '/dashboard/marketing?tab=ads', label: 'Campagne Ads', icon: TrendingUp, color: 'bg-orange-500' },
          { href: '/dashboard/marketing?tab=seo', label: 'SEO + GEO', icon: FileText, color: 'bg-teal-500' },
          { href: '/dashboard/marketing?tab=report', label: 'Report', icon: BarChart3, color: 'bg-emerald-500' },
          { href: '/dashboard/settings?tab=prodotti', label: 'Prodotti', icon: ShoppingBag, color: 'bg-pink-500' },
          { href: '/dashboard/marketing?tab=log', label: 'Log attività', icon: Clock, color: 'bg-gray-500' },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href} className="card p-3 md:p-4 hover:shadow-md transition-all flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-[10px] text-gray-400 group-hover:text-gray-600">Apri &rarr;</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Blog pubblico — dominio dedicato (multi-tenant: ogni cliente il suo) */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-sky-600" />
          <h2 className="font-bold text-gray-900">Blog pubblico</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Dominio/sottodominio dedicato per il blog pubblico di questo cliente (es. <span className="font-mono">blog.{cliente.slug}.com</span>). Configura anche il DNS e il dominio custom su Render perché funzioni.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={blogDomain}
            onChange={e => setBlogDomain(e.target.value)}
            placeholder="blog.tuodominio.com"
            className="input flex-1 font-mono text-sm"
          />
          <button onClick={saveBlogDomain} disabled={savingDomain} className="btn-primary py-2 px-4 justify-center whitespace-nowrap">
            {savingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva dominio'}
          </button>
        </div>
        {domainMsg && (
          <div className={`mt-2 text-xs flex items-center gap-1.5 ${domainMsg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
            {domainMsg.type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {domainMsg.text}
          </div>
        )}
        {cliente.blog_domain && (
          <p className="text-xs text-gray-400 mt-2">
            Attivo su: <a href={`https://${cliente.blog_domain}/blog`} target="_blank" rel="noopener" className="text-brand-600 hover:underline">{cliente.blog_domain}/blog</a>
          </p>
        )}
      </div>

      {/* Pacchetto acquistato — guida il "piano del pacchetto" nella pagina Piano */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-4 h-4 text-violet-600" />
          <h2 className="font-bold text-gray-900">Pacchetto acquistato</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Il pacchetto del cliente. Il &quot;piano del pacchetto&quot; genera in automatico i contenuti compresi (numero, mix formati, social, qualità). Cambialo qui in caso di upgrade.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={pacchetto}
            onChange={e => setPacchetto(e.target.value)}
            className="input flex-1 text-sm"
          >
            <option value="">Nessun pacchetto (solo piano libero)</option>
            {PACKAGE_LIST.map(p => (
              <option key={p.id} value={p.id}>{p.nome} — €{p.prezzoMese}/mese · {p.contenutiMese} contenuti</option>
            ))}
          </select>
          <button onClick={savePacchetto} disabled={savingPkg} className="btn-primary py-2 px-4 justify-center whitespace-nowrap">
            {savingPkg ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva pacchetto'}
          </button>
        </div>

        {/* Quota effettiva: normalmente segue il pacchetto, ma resta modificabile
            per gli accordi fuori listino (es. contenuti extra concordati). È il
            numero che il cliente vede in "Il mio piano" come contenuti del mese. */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="text-xs font-medium text-gray-700">Contenuti inclusi al mese</label>
          <p className="text-[11px] text-gray-500 mt-0.5 mb-2">
            Si allinea da solo al pacchetto scelto. Modificalo solo per accordi fuori listino: è la quota che il cliente vede nella sua area.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              min={0}
              max={200}
              value={contenutiMese}
              onChange={e => setContenutiMese(e.target.value)}
              className="input flex-1 text-sm"
              placeholder="16"
            />
            <button onClick={saveContenutiMese} disabled={savingQuota} className="btn-secondary py-2 px-4 justify-center whitespace-nowrap">
              {savingQuota ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva quota'}
            </button>
          </div>
          {quotaMsg && (
            <p className={`text-xs mt-2 ${quotaMsg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>{quotaMsg.text}</p>
          )}
        </div>
        {pkgMsg && (
          <div className={`mt-2 text-xs flex items-center gap-1.5 ${pkgMsg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
            {pkgMsg.type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {pkgMsg.text}
          </div>
        )}
      </div>

      {/* Fuso orario — usato per programmare i post su Blotato all'ora giusta */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-teal-600" />
          <h2 className="font-bold text-gray-900">Fuso orario</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Le ore del piano (es. 10:00) sono interpretate in questo fuso e convertite per la pubblicazione. Imposta il fuso del cliente.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={timezone} onChange={e => setTimezone(e.target.value)} className="input flex-1 text-sm">
            {['Europe/Rome', 'Europe/London', 'Europe/Paris', 'Europe/Madrid', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'Asia/Dubai'].map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          <button onClick={saveTimezone} disabled={savingTz} className="btn-primary py-2 px-4 justify-center whitespace-nowrap">
            {savingTz ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva fuso'}
          </button>
        </div>
        {tzMsg && (
          <div className={`mt-2 text-xs flex items-center gap-1.5 ${tzMsg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
            {tzMsg.type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {tzMsg.text}
          </div>
        )}
      </div>

      {/* Account Blotato: dove finiranno davvero i post di QUESTO cliente.
          Il workspace Blotato è condiviso tra più clienti, quindi qui si guarda la
          destinazione reale prima di pubblicare, e si fissa quando è ambigua. */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-brand-600" />
          Account Blotato — dove verranno pubblicati i contenuti
        </h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          Questa è la destinazione reale che verrebbe usata alla pubblicazione. Da qui non viene inviato nulla.
          Se per un canale ci sono più account collegati, la pubblicazione resta bloccata finché non scegli quello giusto.
        </p>

        {destLoading ? (
          <p className="text-sm text-gray-400">Lettura account da Blotato…</p>
        ) : destAvviso ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{destAvviso}</p>
        ) : destinazioni.length === 0 ? (
          <p className="text-sm text-gray-400">Nessun canale da configurare per questo cliente.</p>
        ) : (
          <div className="space-y-2">
            {destinazioni.map(d => (
              <div
                key={d.canale}
                className={`rounded-lg border p-3 ${
                  d.stato === 'ok' ? 'border-gray-200 bg-white'
                    : d.stato === 'da_scegliere' ? 'border-amber-300 bg-amber-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">
                    {CANALE_ICON[d.canale] || '📄'} {CANALE_NOME[d.canale] || d.canale}
                  </span>
                  {d.stato === 'ok' ? (
                    <span className="text-sm text-green-700">→ {d.label}</span>
                  ) : (
                    <span className="text-xs text-amber-800">{d.motivo}</span>
                  )}
                </div>

                {d.opzioni.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      value={d.accountId}
                      disabled={savingCanale === d.canale}
                      onChange={e => salvaDestinazione(d.canale, e.target.value)}
                      className="input text-sm max-w-xs"
                    >
                      <option value="">— scegli l&apos;account —</option>
                      {d.opzioni.map(o => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </select>

                    {/* Un account può contenere più Pages/board: va scelta anche quella */}
                    {d.sottoOpzioni && d.sottoOpzioni.length > 0 && (
                      <select
                        defaultValue=""
                        disabled={savingCanale === d.canale || !d.accountId}
                        onChange={e => salvaDestinazione(d.canale, d.accountId, e.target.value)}
                        className="input text-sm max-w-xs"
                      >
                        <option value="">— scegli pagina/bacheca —</option>
                        {d.sottoOpzioni.map(o => (
                          <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            ))}
            {destMsg && (
              <p className={`text-xs ${destMsg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>{destMsg.text}</p>
            )}
          </div>
        )}
      </div>

      {/* Recent content */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Contenuti recenti</h2>
          <Link href="/dashboard/calendario" className="text-xs text-brand-600 hover:underline">Vedi tutti</Link>
        </div>
        {contenuti.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nessun contenuto ancora. Crea il primo piano editoriale.</p>
        ) : (
          <div className="space-y-2">
            {contenuti.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-lg">{CANALE_ICON[c.canale] || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.hook || c.caption || c.id_contenuto}</p>
                  <p className="text-[10px] text-gray-400">{c.canale} · {c.formato} · {c.data_pubblicazione} {c.ora_pubblicazione?.slice(0, 5)}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
