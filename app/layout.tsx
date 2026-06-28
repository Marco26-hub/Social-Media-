import type { Metadata } from 'next'
import './globals.css'
import JsonLd from '@/components/JsonLd'

export const metadata: Metadata = {
  metadataBase: new URL('https://social-media-manager-zte4.onrender.com'),
  title: 'Social Automation | Social media AI per agenzie e PMI',
  description:
    'Servizio gestito di social media management con AI: contenuti, piano editoriale, audit SEO e GEO, pubblicazione con approvazione umana.',
  keywords: [
    'social media management',
    'social media AI',
    'gestione social con intelligenza artificiale',
    'automazione social',
    'piano editoriale',
    'creazione contenuti social',
    'audit SEO',
    'GEO',
    'lead generation',
    'agenzie',
    'PMI',
  ],
  authors: [{ name: 'Social Automation' }],
  openGraph: {
    title: 'Social Automation | Social media AI per agenzie e PMI',
    description:
      'Servizio gestito di social media management con AI: contenuti, piano editoriale, audit SEO e GEO, pubblicazione con approvazione umana.',
    type: 'website',
    url: 'https://social-media-manager-zte4.onrender.com',
    siteName: 'Social Automation',
    locale: 'it_IT',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Social Automation — social media management con AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Automation | Social media AI per agenzie e PMI',
    description:
      'Servizio gestito di social media management con AI: contenuti, piano editoriale, audit SEO e GEO, pubblicazione con approvazione umana.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://social-media-manager-zte4.onrender.com',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <JsonLd />
        {children}
      </body>
    </html>
  )
}
