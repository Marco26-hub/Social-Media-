import type { Metadata } from 'next'
import AiCasaLanding from '@/components/AiCasaLanding'
import { AI_CASA_IT } from '@/lib/ai-casa-contenuti'
import { anteprimaOg } from '@/lib/anteprima'
import { SITE_URL } from '@/lib/site-config'

const path = AI_CASA_IT.path
const title = 'AI a casa tua: Mac con intelligenza artificiale locale | SWA'
const description =
  'Mac e Mac mini consegnati con l’intelligenza artificiale già installata, tarata sulla macchina e collaudata. Funziona sul tuo computer, senza cloud e senza canone mensile.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'intelligenza artificiale locale',
    'AI in locale',
    'AI senza cloud',
    'Mac mini intelligenza artificiale',
    'LLM locale aziende',
    'privacy documenti AI',
  ],
  alternates: {
    canonical: `${SITE_URL}${path}`,
    languages: {
      'it-IT': `${SITE_URL}${path}`,
      en: `${SITE_URL}${AI_CASA_IT.pathGemello}`,
      'x-default': `${SITE_URL}${path}`,
    },
  },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website', locale: 'it_IT', images: anteprimaOg(path) },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg(path) },
}

export default function Page() {
  return <AiCasaLanding contenuto={AI_CASA_IT} />
}
