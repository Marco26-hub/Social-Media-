import type { Metadata } from 'next'
import MarketplacePage from '@/components/ecosystem/MarketplacePage'
import { SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Marketplace SWA — Strumenti digitali per aziende',
  description: 'Scopri gli strumenti digitali SWA per creare contenuti, organizzare il lavoro e automatizzare attività concrete.',
  alternates: { canonical: `${SITE_URL}/marketplace` },
}
export default MarketplacePage
