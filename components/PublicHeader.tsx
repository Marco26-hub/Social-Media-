'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, LogIn } from 'lucide-react'
import DesktopMenu from './DesktopMenu'
import MobileMenu from './MobileMenu'
import ThemeToggle from './ThemeToggle'
import styles from './public-header.module.css'

const MOBILE_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/servizi', label: 'Tutti i servizi' },
  { href: '/servizi/gestione-social-media', label: 'Gestione social' },
  { href: '/servizi/seo-geo', label: 'SEO + GEO' },
  { href: '/servizi/blog-seo', label: 'Blog SEO + GEO' },
  { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
  { href: '/metodo', label: 'Metodo' },
  { href: '/pacchetti', label: 'Pacchetti' },
  { href: '/consulenza', label: 'Consulenza legale AI' },
  { href: '/blog', label: 'SWA Journal' },
  { href: '/chi-siamo', label: 'Azienda' },
  { href: '/faq', label: 'FAQ' },
]

export default function PublicHeader({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.brand} aria-label="Social Automation, home">
        <span className={styles.logoShell}>
          <Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} priority />
        </span>
        <span>Social Automation</span>
      </Link>
      <DesktopMenu />
      <div className={styles.actions}>
        <ThemeToggle />
        <Link href="/portale" className={styles.account}>
          <LogIn size={15} aria-hidden="true" /> Area cliente
        </Link>
        <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={styles.cta}>
          {ctaLabel} <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
      <MobileMenu links={MOBILE_LINKS} ctaHref={ctaHref} ctaLabel={ctaLabel} />
    </header>
  )
}
