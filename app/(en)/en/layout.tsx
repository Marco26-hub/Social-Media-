import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import Odino from '@/components/Odino'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import styles from '@/styles/english.module.css'

const WA_URL = `https://wa.me/393477196603?text=${encodeURIComponent('Hello, I would like to discuss Social Web Automation services.')}`

export const metadata: Metadata = {
  keywords: [
    'managed social media for SMEs',
    'SEO and GEO strategy',
    'SEO blog writing service',
    'B2B lead research',
    'website and e-commerce services',
    'AI Act compliance',
  ],
  openGraph: {
    title: 'Social Web Automation',
    description: 'Managed social, SEO, websites, B2B lead research and AI compliance for SMEs.',
    type: 'website',
    siteName: 'Social Web Automation',
    locale: 'en_US',
  images: anteprimaOg('/en'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Web Automation',
    description: 'Managed social, SEO, websites, B2B lead research and AI compliance for SMEs.',
  },
}

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Il lang sta ora sull'elemento html del root layout inglese: qui non serve
  // piu' ne l'attributo sul contenitore ne lo script che lo correggeva.
  return (
    <div className={styles.shell}>
      <PublicHeader ctaHref={WA_URL} ctaLabel="Talk to us" locale="en" />
      {children}
      <PublicFooter lingua="en" />
      <FloatingNavigation />
      {/* ODINO viveva solo sulle pagine italiane: ventotto pagine inglesi
          spiegavano tutto e non avevano nessuno a cui chiedere. Parla inglese
          da se', la lingua la deduce dal percorso. */}
      <Odino />
    </div>
  )
}
