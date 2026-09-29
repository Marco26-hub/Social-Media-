import type { Metadata } from 'next'
import AiCasaLanding from '@/components/AiCasaLanding'
import { AI_CASA_EN } from '@/lib/ai-casa-contenuti'
import { anteprimaOg } from '@/lib/anteprima'
import { SITE_URL } from '@/lib/site-config'

// La gemella inglese di «AI a casa tua».
//
// Usa la stessa landing dell'italiana con l'altro contenuto: intestazione e
// piè di pagina non si montano qui perché il layout di /en li mette già.

const path = AI_CASA_EN.path
const title = 'Local AI on your Mac: installed, tuned and tested | SWA'
const description =
  'Macs and Mac minis handed over with local AI already installed, tuned to the machine and tested. It runs on your own computer: no cloud, no monthly fee, works offline.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'local AI',
    'on-premise AI',
    'private LLM',
    'AI on Mac mini',
    'AI without cloud',
    'document privacy AI',
  ],
  alternates: {
    canonical: `${SITE_URL}${path}`,
    languages: {
      'it-IT': `${SITE_URL}${AI_CASA_EN.pathGemello}`,
      en: `${SITE_URL}${path}`,
      'x-default': `${SITE_URL}${AI_CASA_EN.pathGemello}`,
    },
  },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website', locale: 'en_US', images: anteprimaOg(path) },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg(path) },
}

export default function Page() {
  return <AiCasaLanding contenuto={AI_CASA_EN} />
}
