import type { Metadata } from 'next'
import RistorantiLanding from '@/components/RistorantiLanding'
import { anteprimaOg } from '@/lib/anteprima'
import { SITE_URL } from '@/lib/site-config'

const path = '/servizi/gestionale-ristoranti'
const title = 'Gestionale ristoranti con menu QR, ordini e pagamenti | SWA'
const description = 'Gestionale per ristoranti, pizzerie e bar: menu QR, ordini e pagamenti al tavolo, prenotazioni, conto alla romana e pannello di sala. Senza percentuali sull’incassato.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}${path}`,
    languages: {
      'it-IT': `${SITE_URL}${path}`,
      en: `${SITE_URL}/en/services/restaurant-management-system`,
      'x-default': `${SITE_URL}${path}`,
    },
  },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website', images: anteprimaOg(path) },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg(path) },
}

export default function Page() {
  return <RistorantiLanding />
}
