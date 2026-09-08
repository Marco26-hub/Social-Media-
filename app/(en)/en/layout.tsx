import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import Link from 'next/link'
import Odino from '@/components/Odino'
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
      <footer className={styles.footer}>
        <div>
          <strong>Social Web Automation</strong>
          <p>Managed digital operations for SMEs and professionals.</p>
        </div>
        {/* Due righe, non una: le pagine del sito e gli atti. Diciotto link in
            fila si leggevano come una sola riga di rumore. */}
        <div className={styles.footerLinks}>
          <nav aria-label="Site">
            <Link href="/en/services">All services</Link>
            <Link href="/en/settori">Sectors</Link>
            <Link href="/en/method">Method</Link>
            <Link href="/en/pricing">Packages</Link>
            <Link href="/en/blog">Journal</Link>
            <Link href="/en/about">About</Link>
            <Link href="/en/author/marco-dibenedetto">Author</Link>
            <Link href="/en/faq">FAQ</Link>
            <Link href="/en/contact">Contact</Link>
            <a href="https://www.instagram.com/socialwebautomation/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/profile.php?id=61592835840985" target="_blank" rel="noopener noreferrer">Facebook</a>
            <Link href="/" lang="it">Italiano</Link>
          </nav>
          <nav aria-label="Legal">
            <Link href="/en/privacy">Privacy</Link>
            <Link href="/en/terms">Terms</Link>
            <Link href="/en/cookie-policy">Cookie</Link>
            <Link href="/en/withdrawal">Withdrawal</Link>
            <Link href="/en/accessibility">Accessibility</Link>
            <Link href="/en/security">Security</Link>
          </nav>
        </div>
        <p className={styles.legal}>Social Web Automation di Marco Dibenedetto · VAT IT03786790133 · Cermenate (CO), Italy</p>
      </footer>
      {/* ODINO viveva solo sulle pagine italiane: ventotto pagine inglesi
          spiegavano tutto e non avevano nessuno a cui chiedere. Parla inglese
          da se', la lingua la deduce dal percorso. */}
      <Odino />
    </div>
  )
}
