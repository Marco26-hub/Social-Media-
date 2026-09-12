'use client'
export const dynamic = 'force-dynamic'

import nextDynamic from 'next/dynamic'
import { GraduationCap, Receipt } from 'lucide-react'
import TabbedPage, { type TabDef } from '@/components/TabbedPage'

const Loading = () => <div className="p-8 text-sm text-gray-400">Caricamento…</div>

// Catalogo e vendite dei corsi. Il dettaglio di un corso sta su
// /dashboard/corsi/[id], come il dettaglio cliente sta fuori dal suo hub.
const TABS: TabDef[] = [
  { key: 'catalogo', label: 'Catalogo', icon: GraduationCap, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/CatalogoTab'), { loading: Loading }) },
  { key: 'vendite', label: 'Vendite', icon: Receipt, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/VenditeTab'), { loading: Loading }) },
]

export default function CorsiHubPage() {
  return <TabbedPage tabs={TABS} />
}
