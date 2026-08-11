import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-config'

const title = 'Consulenza Legale AI Act e GDPR con Studio BCS | SWA'
const description = 'Prenota una consulenza individuale su AI Act, GDPR, privacy, copyright e contratti digitali con l’Avv. Vincenzo Sapone dello Studio Legale BCS.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/consulenza` },
  openGraph: { title, description, url: `${SITE_URL}/consulenza` },
  twitter: { title, description },
}

export default function ConsulenzaLayout({ children }: { children: React.ReactNode }) { return children }
