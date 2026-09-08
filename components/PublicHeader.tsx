'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { altraLingua } from '@/lib/lingue'
import { SERVIZI_EN } from '@/lib/servizi.en'
import { SETTORI } from '@/lib/settori'
import { SETTORI_EN } from '@/lib/settori.en'
import { ArrowRight, LogIn } from 'lucide-react'
import DesktopMenu from './DesktopMenu'
import MobileMenu from './MobileMenu'
import ThemeToggle from './ThemeToggle'
import styles from './public-header.module.css'

// Il cambio lingua non sta in questo elenco: e' gia' nella testata, che resta
// visibile mentre il pannello e' aperto. Ripeterlo in fondo a ventun righe
// allungava il menu per dire una cosa che si vedeva due centimetri sopra.
const MOBILE_LINKS = [
  { href: '/', label: 'Home' },
  {
    href: '/servizi',
    label: 'Tutti i servizi',
    sotto: [
      { href: '/servizi/gestione-social-media', label: 'Gestione social' },
      { href: '/servizi/seo-geo', label: 'SEO + GEO' },
      { href: '/servizi/blog-seo', label: 'Blog SEO + GEO' },
      { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
      { href: '/servizi/ricerca-clienti-b2b', label: 'Ricerca Clienti B2B' },
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda, clienti e WhatsApp' },
      { href: '/servizi/video-produzione', label: 'Riprese video in azienda' },
      { href: '/servizi/gestione-lavorazioni', label: 'Rapportini di intervento' },
      { href: '/servizi/automazione-gestionali', label: 'Automazione e gestionali' },
    ],
  },
  {
    href: '/settori',
    label: 'Settori',
    sotto: SETTORI.map(x => ({ href: `/settori/${x.slug}`, label: x.nome })),
  },
  { href: '/metodo', label: 'Metodo' },
  { href: '/pacchetti', label: 'Pacchetti' },
  { href: '/consulenza', label: 'Consulenza legale AI' },
  { href: '/blog', label: 'SWA Journal' },
  { href: '/chi-siamo', label: 'Azienda' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contatti', label: 'Contatti' },
]

const MOBILE_LINKS_EN = [
  { href: '/en', label: 'Home' },
  {
    href: '/en/services',
    label: 'All services',
    sotto: [
      ...SERVIZI_EN.map(s => ({ href: `/en/services/${s.slug}`, label: s.config.serviceName })),
      { href: '/en/services/ai-phone-assistant', label: 'AI phone assistant' },
      { href: '/en/services/client-diary-whatsapp', label: 'Diary, clients and WhatsApp' },
    ],
  },
  { href: '/en/method', label: 'Method' },
  {
    href: '/en/settori',
    label: 'Sectors',
    sotto: SETTORI_EN.map(x => ({ href: `/en/settori/${x.slug}`, label: x.nome })),
  },
  { href: '/en/pricing', label: 'Packages' },
  { href: '/en/legal-advice', label: 'AI legal advice' },
  { href: '/en/blog', label: 'SWA Journal' },
  { href: '/en/about', label: 'About' },
  { href: '/en/faq', label: 'FAQ' },
  { href: '/en/contact', label: 'Contact' },
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
