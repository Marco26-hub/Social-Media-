import { createClient } from '@/lib/supabase/server'
import { Calendar, CheckCircle, AlertCircle, Send, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 60

async function getStats() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const [
    { count: daApprovare },
    { count: pubblicati7g },
    { count: errori },
    { count: inCoda },
    { data: ultimi },
  ] = await Promise.all([
    supabase.from('calendario').select('*', { count: 'exact', head: true }).eq('status', 'DA_APPROVARE'),
    supabase.from('calendario').select('*', { count: 'exact', head: true }).eq('status', 'PUBBLICATO').gte('data_pubblicazione', weekAgo),
    supabase.from('calendario').select('*', { count: 'exact', head: true }).in('status', ['ERRORE', 'ERRORE_MANUALE']),
    supabase.from('calendario').select('*', { count: 'exact', head: true }).eq('status', 'APPROVATO'),
    supabase.from('log_pubblicazioni').select('*').order('timestamp', { ascending: false }).limit(5),
  ])

  return { daApprovare, pubblicati7g, errori, inCoda, ultimi: ultimi ?? [] }
}

export default async function DashboardPage() {
  const { daApprovare, pubblicati7g, errori, inCoda, ultimi } = await getStats()

  const stats = [
    { label: 'Da approvare',    value: daApprovare ?? 0, icon: Clock,         color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/dashboard/calendario?filter=DA_APPROVARE' },
    { label: 'Pubblicati 7gg',  value: pubblicati7g ?? 0,icon: TrendingUp,    color: 'text-green-600',  bg: 'bg-green-50',  href: '/dashboard/log' },
    { label: 'In coda',         value: inCoda ?? 0,      icon: Send,          color: 'text-blue-600',   bg: 'bg-blue-50',   href: '/dashboard/calendario?filter=APPROVATO' },
    { label: 'Errori attivi',   value: errori ?? 0,      icon: AlertCircle,   color: 'text-red-600',    bg: 'bg-red-50',    href: '/dashboard/calendario?filter=ERRORE' },
  ]

  const statusColor: Record<string, string> = {
    PUBBLICATO:       'text-green-700',
    ERRORE:           'text-red-700',
    ERRORE_MANUALE:   'text-red-700',
    DRY_RUN_OK:       'text-teal-700',
    ERRORE_WORKFLOW:  'text-orange-700',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Ultimi log + CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Ultime attività</h2>
            <Link href="/dashboard/log" className="text-sm text-brand-600 hover:underline">Vedi tutti →</Link>
          </div>
          {ultimi.length === 0 ? (
            <p className="text-sm text-gray-400">Nessuna attività ancora.</p>
          ) : (
            <div className="space-y-3">
              {ultimi.map((log: { id: string; timestamp: string; id_contenuto?: string; status_finale: string; canale?: string; messaggio?: string }) => (
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
