import type { Metadata } from 'next'
import './globals.css'
import JsonLd from '@/components/JsonLd'
import CookieBanner from '@/components/CookieBanner'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    'gestione social per PMI',
    'social media manager per aziende',
    'social media management',
    'gestione Instagram e Facebook',
    'piano editoriale',
    'creazione contenuti social',
    'SEO e GEO',
    'siti ed e-commerce',
    'consulenza AI Act',
  ],
  authors: [{ name: 'Social Automation' }],
  creator: 'Social Automation',
  publisher: 'Social Automation',
  applicationName: 'Social Automation',
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    siteName: 'Social Automation',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <JsonLd />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
