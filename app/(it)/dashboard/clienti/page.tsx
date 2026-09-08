'use client'
export const dynamic = 'force-dynamic'

import nextDynamic from 'next/dynamic'
import { Users, UserCheck, CreditCard, UserPlus } from 'lucide-react'
import TabbedPage, { type TabDef } from '@/components/TabbedPage'

const Loading = () => <div className="p-8 text-sm text-gray-400">Caricamento…</div>

// Hub area agenzia: ex voci Clienti, Registrazioni, Pagamenti, Onboarding.
// Il dettaglio singolo cliente resta su /dashboard/clienti/[id].
const TABS: TabDef[] = [
  { key: 'clienti', label: 'Clienti', icon: Users,
    Component: nextDynamic(() => import('./_tabs/ClientiTab'), { loading: Loading }) },
  { key: 'registrazioni', label: 'Registrazioni', icon: UserCheck,
    Component: nextDynamic(() => import('./_tabs/RegistrazioniTab'), { loading: Loading }) },
  { key: 'pagamenti', label: 'Pagamenti', icon: CreditCard,
    Component: nextDynamic(() => import('./_tabs/PagamentiTab'), { loading: Loading }) },
  { key: 'onboarding', label: 'Onboarding', icon: UserPlus,
    Component: nextDynamic(() => import('./_tabs/OnboardingTab'), { loading: Loading }) },
]

export default function ClientiHubPage() {
  return <TabbedPage tabs={TABS} />
}
