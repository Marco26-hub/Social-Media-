import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, LogIn } from 'lucide-react'
import MobileMenu from '@/components/MobileMenu'
import ThemeToggle from '@/components/ThemeToggle'
import { TITOLARE } from '@/lib/legal-config'
import styles from './blog.module.css'

const WHATSAPP_URL = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei capire quale servizio Social Automation è adatto alla mia azienda.')}`

export function BlogHeader() {
  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.brand} aria-label="Social Automation, home">
        <span className={styles.logoShell}>
          <Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} priority />
        </span>
        <span>Social Automation</span>
      </Link>
      <nav className={styles.desktopNav} aria-label="Navigazione principale">
        <Link href="/">Home</Link>
        <Link href="/servizi">Servizi</Link>
        <Link href="/blog" aria-current="page">Journal</Link>
        <Link href="/chi-siamo">Chi siamo</Link>
      </nav>
      <div className={styles.navActions}>
        <ThemeToggle />
        <Link href="/portale" className={styles.accountLink}><LogIn size={15} aria-hidden="true" /> Area cliente</Link>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={styles.navCta}>
          Parliamo del progetto <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
      <MobileMenu
        links={[
          { href: '/', label: 'Home' },
          { href: '/servizi', label: 'Servizi e pacchetti' },
          { href: '/blog', label: 'SWA Journal' },
          { href: '/chi-siamo', label: 'Chi siamo' },
        ]}
        ctaHref={WHATSAPP_URL}
        ctaLabel="Parliamo del progetto"
      />
    </header>
  )
}

export function BlogFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/" className={styles.brand} aria-label="Social Automation, home">
        <span className={styles.logoShell}>
          <Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} />
        </span>
        <span>Social Automation</span>
      </Link>
      <nav aria-label="Link nel footer">
        <Link href="/servizi">Servizi</Link>
        <Link href="/chi-siamo">Chi siamo</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/termini">Termini</Link>
        <Link href="/cookie-policy">Cookie</Link>
      </nav>
      <p>{TITOLARE.ragioneSociale}<br />P.IVA {TITOLARE.partitaIva} · Cermenate (CO)</p>
    </footer>
  )
}
