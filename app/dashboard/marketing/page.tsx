'use client'
export const dynamic = 'force-dynamic'

import nextDynamic from 'next/dynamic'
import { PenLine, TrendingUp, Search, Magnet, Eye, Activity, BarChart3, FileText, Coins } from 'lucide-react'
import TabbedPage, { type TabDef } from '@/components/TabbedPage'

const Loading = () => <div className="p-8 text-sm text-gray-400">Caricamento…</div>

// Voce unica di menu al posto di cinque: Blog SEO, Campagne Ads, SEO + GEO,
// Leads e Competitor, Risultati. Prima i tab per promuovere, poi quelli per
// misurare. Performance e Report restano visibili anche ai clienti (come le
// vecchie voci Analytics/Report); il resto è riservato agli admin.
const TABS: TabDef[] = [
  { key: 'blog', label: 'Blog SEO', icon: PenLine, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/BlogTab'), { loading: Loading }) },
  { key: 'ads', label: 'Campagne Ads', icon: TrendingUp, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/AdsTab'), { loading: Loading }) },
  { key: 'seo', label: 'SEO + GEO', icon: Search, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/SeoTab'), { loading: Loading }) },
  { key: 'leads', label: 'Leads', icon: Magnet, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/LeadsTab'), { loading: Loading }) },
  { key: 'competitor', label: 'Competitor', icon: Eye, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/CompetitorTab'), { loading: Loading }) },
  { key: 'performance', label: 'Performance', icon: Activity,
    Component: nextDynamic(() => import('./_tabs/PerformanceTab'), { loading: Loading }) },
  { key: 'report', label: 'Report', icon: BarChart3,
    Component: nextDynamic(() => import('./_tabs/ReportTab'), { loading: Loading }) },
  { key: 'log', label: 'Log pubblicazioni', icon: FileText, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/LogTab'), { loading: Loading }) },
  { key: 'consumi', label: 'Consumi AI', icon: Coins, adminOnly: true,
    Component: nextDynamic(() => import('./_tabs/ConsumiTab'), { loading: Loading }) },
]

export default function MarketingPage() {
  return <TabbedPage tabs={TABS} />
}
