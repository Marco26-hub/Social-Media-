import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from './english.module.css'

const WA_URL = `https://wa.me/393477196603?text=${encodeURIComponent('Hello, I would like to discuss Social Web Automation services.')}`

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/en" className={styles.brand} aria-label="Social Web Automation, English home">
          <span className={styles.logo}><Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} priority /></span>
          <span>Social Web Automation</span>
        </Link>
        <nav className={styles.nav} aria-label="English navigation">
          <Link href="/en">Home</Link>
          <Link href="/en/services">Services</Link>
          <Link href="/en/pricing">Pricing</Link>
          <Link href="/" lang="it">Italiano</Link>
        </nav>
        <a className={styles.headerCta} href={WA_URL} target="_blank" rel="noopener noreferrer">
          Talk to us <ArrowRight size={15} />
        </a>
      </header>
      {children}
      <footer className={styles.footer}>
        <div>
          <strong>Social Web Automation</strong>
          <p>Managed digital operations for SMEs and professionals.</p>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/en/services">Services</Link>
          <Link href="/en/pricing">Pricing</Link>
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
