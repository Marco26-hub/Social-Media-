import type { Metadata } from 'next'
import AiCasaLanding from '@/components/AiCasaLanding'
import { anteprimaOg } from '@/lib/anteprima'
import { SITE_URL } from '@/lib/site-config'

const path = '/servizi/ai-a-casa-tua'
const title = 'AI a casa tua: Mac con intelligenza artificiale locale | SWA'
const description =
  'Mac e Mac mini consegnati con l’intelligenza artificiale già installata, tarata sulla macchina e collaudata. Funziona sul tuo computer, senza cloud e senza canone mensile.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website', images: anteprimaOg(path) },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg(path) },
}

export default function Page() {
  return <AiCasaLanding />
}
