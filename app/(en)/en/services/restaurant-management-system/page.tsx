import type { Metadata } from 'next'
import RistorantiLanding from '@/components/RistorantiLanding'
import { anteprimaOg } from '@/lib/anteprima'
import { SITE_URL } from '@/lib/site-config'

const path = '/en/services/restaurant-management-system'
const title = 'Restaurant management system with QR ordering and payments | SWA'
const description = 'Restaurant management system for QR menus, table ordering and payments, bookings, split bills and live room operations, with no percentage retained from sales.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}${path}`,
    languages: {
      'it-IT': `${SITE_URL}/servizi/gestionale-ristoranti`,
      en: `${SITE_URL}${path}`,
      'x-default': `${SITE_URL}/servizi/gestionale-ristoranti`,
    },
  },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website', locale: 'en_US', images: anteprimaOg(path) },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg(path) },
}

export default function Page() {
  return <RistorantiLanding locale="en" />
}
