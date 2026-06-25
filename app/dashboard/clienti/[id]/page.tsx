'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { isDemo } from '@/lib/demo'
import type { Contenuto, Cliente } from '@/lib/types'
import {
  Building2, Calendar, BarChart3, Target, ShoppingBag, FileText,
  TrendingUp, AlertTriangle, CheckCircle, Clock, ArrowLeft,
  Loader2, ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { demoContenuti, demoClienti, demoLogs } from '@/lib/demo-data'
import StatusBadge from '@/components/StatusBadge'

const CANALE_ICON: Record<string, string> = {
  instagram: '📸', facebook: '🔵', tiktok: '🎵', pinterest: '📌', youtube_shorts: '▶️', linkedin: '💼',
}

export default function ClienteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [contenuti, setContenuti] = useState<Contenuto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (isDemo()) {
        const c = demoClienti.find(x => x.id === id || x.slug === id)
        if (c) {
          setCliente(c)
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
        if (c) setCliente(c)
        setContenuti((Array.isArray(calRes) ? calRes : []).slice(0, 10))
      } catch {}
      setLoading(false)
    }
    load()
  }, [id])

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
          { href: '/dashboard/brand', label: 'Profilo Brand', icon: Building2, color: 'bg-violet-500' },
          { href: '/dashboard/calendario', label: 'Calendario', icon: Calendar, color: 'bg-blue-500' },
          { href: '/dashboard/piano', label: 'Piano editoriale', icon: Target, color: 'bg-purple-500' },
          { href: '/dashboard/ads', label: 'Campagne Ads', icon: TrendingUp, color: 'bg-orange-500' },
          { href: '/dashboard/seo', label: 'SEO + GEO', icon: FileText, color: 'bg-teal-500' },
          { href: '/dashboard/report', label: 'Report', icon: BarChart3, color: 'bg-emerald-500' },
          { href: '/dashboard/prodotti', label: 'Prodotti', icon: ShoppingBag, color: 'bg-pink-500' },
          { href: '/dashboard/log', label: 'Log attività', icon: Clock, color: 'bg-gray-500' },
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
