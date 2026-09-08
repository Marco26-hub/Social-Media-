'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { altraLingua } from '@/lib/lingue'
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
  { href: '/servizi/ricerca-clienti-b2b', label: 'Ricerca Clienti B2B' },
  { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
  { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda, clienti e WhatsApp' },
  { href: '/servizi/video-produzione', label: 'Riprese video in azienda' },
  { href: '/servizi/gestione-lavorazioni', label: 'Sito e gestione lavorazioni' },
  { href: '/servizi/automazione-gestionali', label: 'Automazione e gestionali' },
  { href: '/settori', label: 'Settori' },
  { href: '/metodo', label: 'Metodo' },
  { href: '/pacchetti', label: 'Pacchetti' },
  { href: '/consulenza', label: 'Consulenza legale AI' },
  { href: '/blog', label: 'SWA Journal' },
  { href: '/chi-siamo', label: 'Azienda' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contatti', label: 'Contatti' },
  { href: '/en', label: 'English' },
]

const MOBILE_LINKS_EN = [
  { href: '/en', label: 'Home' },
  { href: '/en/services', label: 'All services' },
  { href: '/en/method', label: 'Method' },
  { href: '/en/settori', label: 'Sectors' },
  { href: '/en/pricing', label: 'Packages' },
  { href: '/en/blog', label: 'SWA Journal' },
  { href: '/en/about', label: 'About' },
  { href: '/en/faq', label: 'FAQ' },
  { href: '/en/contact', label: 'Contact' },
  { href: '/', label: 'Italiano' },
]

export default function PublicHeader({ ctaHref, ctaLabel, locale = 'it' }: { ctaHref: string; ctaLabel: string; locale?: 'it' | 'en' }) {
  const isEnglish = locale === 'en'
  // Il cambio lingua porta alla stessa pagina nell'altra lingua quando la
  // traduzione esiste, non sempre alla home.
  const percorso = usePathname() || '/'
  const hrefLingua = altraLingua(percorso, isEnglish ? 'it' : 'en')

  return (
    <header className={styles.navbar}>
      <Link href={isEnglish ? '/en' : '/'} className={styles.brand} aria-label={`Social Web Automation, ${isEnglish ? 'English ' : ''}home`}>
        <span className={styles.logoShell}>
          <Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} priority />
        </span>
        <span>Social Web Automation</span>
      </Link>
      <DesktopMenu locale={locale} />
      <div className={styles.actions}>
        <Link href={hrefLingua} className={styles.language} lang={isEnglish ? 'it' : 'en'} aria-label={isEnglish ? 'Versione italiana' : 'English version'}>
          {isEnglish ? 'IT' : 'EN'}
        </Link>
        <ThemeToggle />
        <Link href="/login?cambia=1" className={styles.account}>
          <LogIn size={15} aria-hidden="true" /> {isEnglish ? 'Client area' : 'Area cliente'}
        </Link>
        <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={styles.cta}>
          {ctaLabel} <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
      <MobileMenu links={isEnglish ? MOBILE_LINKS_EN : MOBILE_LINKS} ctaHref={ctaHref} ctaLabel={ctaLabel} locale={locale} />
    </header>
  )
}
