import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import JsonLd from '@/components/JsonLd'
import CookieBanner from '@/components/CookieBanner'
import MetaPixel from '@/components/MetaPixel'
import { SITE_URL } from '@/lib/site-config'

// Root layout inglese.
//
// Esiste per una ragione sola: l'attributo lang. Il layout radice era unico e
// dichiarava lang="it" anche sotto /en, e le ventotto pagine inglesi servivano
// contenuto inglese marcato come italiano — in contraddizione con hreflang,
// og:locale e Content-Language della stessa pagina. Si correggeva con uno script
// client, che pero' non aiuta i crawler che non eseguono JS: e proprio quelli
// sono i sistemi di risposta AI per cui il sito e' costruito.
//
// In App Router due <html> diversi per sottoalbero si ottengono solo con due
// root layout in gruppi di rotte. L'alternativa era leggere il percorso con
// headers(), che avrebbe reso dinamiche tutte e centoquarantaquattro le pagine:
// un prezzo troppo alto per un attributo.
//
// Da qui in poi: i metadati condivisi restano nel layout italiano perche' quello
// e' il default del sito; qui si dichiara solo cio' che cambia con la lingua.

const TITLE = 'Social Web Automation — managed social, websites and AI for SMEs'
const DESCRIPTION =
  'Managed social media, SEO and GEO, websites, business video, B2B prospecting and AI phone answering for small and medium companies. Public prices.'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fffaf0' },
    { media: '(prefers-color-scheme: dark)', color: '#10120e' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s' },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    siteName: 'Social Web Automation',
    locale: 'en_US',
    images: ['/og.png'],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og.png'] },
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

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
