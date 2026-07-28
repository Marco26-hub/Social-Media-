import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-config'

const META_TITLE = 'Consulenza AI Act e GDPR con Studio Legale BCS | SWA'
const META_DESCRIPTION =
  'Prenota una consulenza di 30 minuti con l’Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS, su AI Act, GDPR, privacy e contratti.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/consulenza` },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: `${SITE_URL}/consulenza`,
  },
  twitter: {
    title: META_TITLE,
    description: META_DESCRIPTION,
  },
}

export default function ConsulenzaLayout({ children }: { children: React.ReactNode }) {
  return children
}
