'use client'
export const dynamic = 'force-dynamic'

import nextDynamic from 'next/dynamic'
import { Settings, Sparkles, Package, ShieldCheck } from 'lucide-react'
import TabbedPage, { type TabDef } from '@/components/TabbedPage'

const Loading = () => <div className="p-8 text-sm text-gray-400">Caricamento…</div>

// Hub configurazione: ex voci Impostazioni, Profilo Brand, Prodotti, Setup Produzione.
const TABS: TabDef[] = [
  { key: 'impostazioni', label: 'Impostazioni', icon: Settings,
    Component: nextDynamic(() => import('./_tabs/ImpostazioniTab'), { loading: Loading }) },
  { key: 'brand', label: 'Profilo Brand', icon: Sparkles,
    Component: nextDynamic(() => import('./_tabs/BrandTab'), { loading: Loading }) },
  { key: 'prodotti', label: 'Prodotti', icon: Package,
    Component: nextDynamic(() => import('./_tabs/ProdottiTab'), { loading: Loading }) },
  { key: 'setup', label: 'Setup Produzione', icon: ShieldCheck,
    Component: nextDynamic(() => import('./_tabs/SetupTab'), { loading: Loading }) },
]

export default function ConfigurazionePage() {
  return <TabbedPage tabs={TABS} />
}
