'use client'
export const dynamic = 'force-dynamic'

import nextDynamic from 'next/dynamic'
import { Activity, BarChart3, FileText, Coins } from 'lucide-react'
import TabbedPage, { type TabDef } from '@/components/TabbedPage'

const Loading = () => <div className="p-8 text-sm text-gray-400">Caricamento…</div>

// Ex voci di menu separate: Analytics, Report, "Log + Report", Consumi Token.
// Erano quattro pagine per la stessa domanda ("com'è andata") con due etichette
// doppione → ora una sola voce "Risultati" con quattro tab.
const TABS: TabDef[] = [
  { key: 'performance', label: 'Performance', icon: Activity,
    Component: nextDynamic(() => import('./_tabs/PerformanceTab'), { loading: Loading }) },
  { key: 'report', label: 'Report', icon: BarChart3,
    Component: nextDynamic(() => import('./_tabs/ReportTab'), { loading: Loading }) },
  { key: 'log', label: 'Log pubblicazioni', icon: FileText, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/LogTab'), { loading: Loading }) },
  { key: 'consumi', label: 'Consumi AI', icon: Coins, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/ConsumiTab'), { loading: Loading }) },
]

export default function RisultatiPage() {
  return <TabbedPage tabs={TABS} />
}
