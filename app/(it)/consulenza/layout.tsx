import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-config'

const title = 'Consulenza Legale AI Act e GDPR con Studio BCS | SWA'
const description = 'Prenota una consulenza individuale su AI Act, GDPR, privacy, copyright e contratti digitali con l’Avv. Vincenzo Sapone dello Studio Legale BCS.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/consulenza` },
  openGraph: { title, description, url: `${SITE_URL}/consulenza` , images: anteprimaOg('/consulenza'), type: 'website',},
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg('/consulenza') },
}

export default function ConsulenzaLayout({ children }: { children: React.ReactNode }) { return children }
