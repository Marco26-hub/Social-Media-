import type { Metadata } from 'next'
import { anteprimaOg } from '@/lib/anteprima'
import { SITE_URL } from '@/lib/site-config'

// I metadata stanno qui perche' la pagina e' un componente client, che non
// puo' esportarli: stessa scelta della versione italiana.

const title = 'AI Act and GDPR legal advice with Studio BCS | SWA'
const description = 'Book a one-to-one consultation on the AI Act, GDPR, privacy, copyright and digital contracts with Avv. Vincenzo Sapone of Studio Legale BCS. €150 for 30 minutes.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/legal-advice`,
    languages: {
      'it-IT': `${SITE_URL}/consulenza`,
      en: `${SITE_URL}/en/legal-advice`,
      'x-default': `${SITE_URL}/consulenza`,
    },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/legal-advice`, images: anteprimaOg('/en/legal-advice'), type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg('/en/legal-advice') },
}

export default function LegalAdviceLayout({ children }: { children: React.ReactNode }) { return children }
