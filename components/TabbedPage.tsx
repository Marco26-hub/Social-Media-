'use client'
import { useEffect, useMemo, useState, type ComponentType, type ElementType } from 'react'
import { useSession } from 'next-auth/react'

export type TabDef = {
  key: string
  label: string
  icon?: ElementType
  Component: ComponentType
  adminOnly?: boolean
}

// Barra di tab riusabile per le pagine-contenitore della dashboard.
// Serve a togliere voci dal menu: pagine che erano voci separate diventano tab
// di una sola pagina (le vecchie URL restano vive via redirect stub).
// Il tab attivo sta in `?tab=` così deep-link e refresh sono stabili, e `key`
// rimonta pulito il contenuto a ogni cambio (stesso pattern di /dashboard/social).
export default function TabbedPage({ tabs }: { tabs: TabDef[] }) {
  const { data: session } = useSession()
  const isAdmin = ['admin', 'super_admin'].includes(session?.user?.ruolo ?? '')
  // Stessa regola `adminOnly` della sidebar: i tab riservati (es. Log, Consumi AI)
  // non compaiono ai clienti, che prima non avevano la voce di menu corrispondente.
  const visible = useMemo(() => tabs.filter(t => !t.adminOnly || isAdmin), [tabs, isAdmin])

  const [active, setActive] = useState(tabs[0].key)

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('tab')
    if (q && visible.some(t => t.key === q)) setActive(q)
  }, [visible])

  function choose(key: string) {
    setActive(key)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', key)
    window.history.replaceState(null, '', url.toString())
  }

  const current = visible.find(t => t.key === active) ?? visible[0]
  if (!current) return <div className="p-8 text-sm text-gray-400">Nessuna sezione disponibile.</div>
  const Active = current.Component

  return (
    <div>
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur px-4 md:px-8 pt-4 pb-2 border-b border-gray-100">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {visible.map(tab => {
            const isActive = tab.key === current.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => choose(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-700'
                }`}
              >
                {Icon ? <Icon className="w-3.5 h-3.5 flex-shrink-0" /> : null}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <Active key={current.key} />
    </div>
  )
}
