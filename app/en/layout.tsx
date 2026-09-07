import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import styles from './english.module.css'

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Web Automation',
    description: 'Managed social, SEO, websites, B2B lead research and AI compliance for SMEs.',
  },
}

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.shell} lang="en">
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang='en'` }} />
      <PublicHeader ctaHref={WA_URL} ctaLabel="Talk to us" locale="en" />
      {children}
      <footer className={styles.footer}>
        <div>
          <strong>Social Web Automation</strong>
          <p>Managed digital operations for SMEs and professionals.</p>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/en/services">All services</Link>
          <Link href="/en/method">Method</Link>
          <Link href="/en/settori">Sectors</Link>
          <Link href="/en/pricing">Packages</Link>
          <Link href="/en/about">About</Link>
          <Link href="/en/faq">FAQ</Link>
          <Link href="/en/contact">Contact</Link>
          <a href="https://www.instagram.com/socialwebautomation/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=61592835840985" target="_blank" rel="noopener noreferrer">Facebook</a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/" lang="it">Italiano</Link>
        </div>
        <p className={styles.legal}>Social Web Automation di Marco Dibenedetto · VAT IT03786790133 · Cermenate (CO), Italy</p>
      </footer>
    </div>
  )
}
