'use client'
import { Suspense, useMemo, type ComponentType, type ElementType } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
//
// `useSearchParams()` (non `window.location.search` letto una volta al mount)
// perché un <Link> verso la stessa pathname con un `?tab=` diverso (es. il
// pulsante "Configura questo cliente" dopo un'attivazione registrazione) è una
// navigazione soft: il componente non viene rimontato, quindi un effect legato
// al mount non vede mai il nuovo valore e il tab restava bloccato su quello di
// partenza pur cambiando l'URL. useSearchParams() si aggiorna anche sulla
// navigazione client-side, quindi qui `active` è derivato ad ogni render invece
// di vivere in uno state locale che può disallinearsi dall'URL.
function TabbedPageInner({ tabs }: { tabs: TabDef[] }) {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdmin = ['admin', 'super_admin'].includes(session?.user?.ruolo ?? '')
  // Stessa regola `adminOnly` della sidebar: i tab riservati (es. Log, Consumi AI)
  // non compaiono ai clienti, che prima non avevano la voce di menu corrispondente.
  const visible = useMemo(() => tabs.filter(t => !t.adminOnly || isAdmin), [tabs, isAdmin])

  const tabParam = searchParams.get('tab')
  const active = tabParam && visible.some(t => t.key === tabParam) ? tabParam : (visible[0]?.key ?? tabs[0].key)

  function choose(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', key)
    // router.replace (non window.history) perché useSearchParams si aggiorna
    // solo sulla navigazione del router Next, non su una history API grezza.
    router.replace(`?${params.toString()}`, { scroll: false })
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

export default function TabbedPage({ tabs }: { tabs: TabDef[] }) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">Caricamento…</div>}>
      <TabbedPageInner tabs={tabs} />
    </Suspense>
  )
}
