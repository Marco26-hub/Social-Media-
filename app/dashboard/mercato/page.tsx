'use client'
export const dynamic = 'force-dynamic'

import nextDynamic from 'next/dynamic'
import { Magnet, Eye } from 'lucide-react'
import TabbedPage, { type TabDef } from '@/components/TabbedPage'

const Loading = () => <div className="p-8 text-sm text-gray-400">Caricamento…</div>

// Ex voci di menu separate: Leads e Competitor — stessa famiglia (chi c'è fuori).
const TABS: TabDef[] = [
  { key: 'leads', label: 'Leads', icon: Magnet,
    Component: nextDynamic(() => import('./_tabs/LeadsTab'), { loading: Loading }) },
  { key: 'competitor', label: 'Competitor', icon: Eye,
    Component: nextDynamic(() => import('./_tabs/CompetitorTab'), { loading: Loading }) },
]

export default function MercatoPage() {
  return <TabbedPage tabs={TABS} />
}
