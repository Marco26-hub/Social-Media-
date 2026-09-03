import type { Metadata } from 'next'
import './globals.css'
import JsonLd from '@/components/JsonLd'
import CookieBanner from '@/components/CookieBanner'
import MetaPixel from '@/components/MetaPixel'
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
  authors: [{ name: 'Social Web Automation' }],
  creator: 'Social Web Automation',
  publisher: 'Social Web Automation',
  applicationName: 'Social Web Automation',
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': [process.env.BING_SITE_VERIFICATION] }
      : undefined,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    siteName: 'Social Web Automation',
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
    <html lang="it" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('swa-theme');var t=s==='dark'||s==='light'?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <JsonLd />
        <MetaPixel />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
