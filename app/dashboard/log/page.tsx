'use client'

import { useCallback, useEffect, useState } from 'react'
import StatusBadge from '@/components/StatusBadge'
import type { LogPubblicazione } from '@/lib/types'
import { demoLogs } from '@/lib/demo-data'
import { isDemo } from '@/lib/demo'

export const dynamic = 'force-dynamic'

export default function LogPage() {
  const demo = isDemo()
  const [logs, setLogs] = useState<LogPubblicazione[] | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (demo) {
      setLogs(demoLogs)
      setLoading(false)
      return
    }
    const res = await fetch('/api/data/log?limit=100')
    const data = res.ok ? await res.json() : null
    setLogs(data ?? [])
    setLoading(false)
  }, [demo])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-4 md:p-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Log pubblicazioni</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">Ultimi 100 eventi</p>
      </div>

      <div className="card overflow-x-auto">
        {loading && <div className="p-4 text-sm text-gray-400">Caricamento log...</div>}
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Timestamp</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ID Contenuto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Canale</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Messaggio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('it-IT', {
                    day: '2-digit', month: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                  })}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">
                  {log.id_contenuto ?? '\u2014'}
                </td>
                <td className="px-4 py-3 text-gray-600">{log.canale ?? '\u2014'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={log.status_finale} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                  {log.errore
                    ? <span className="text-red-600">{log.errore}</span>
                    : (log.messaggio ?? (log.blotato_post_id ? `post_id: ${log.blotato_post_id}` : '\u2014'))
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!logs || logs.length === 0) && (
          <div className="p-12 text-center text-gray-400">Nessun log ancora.</div>
        )}
      </div>
    </div>
  )
}
