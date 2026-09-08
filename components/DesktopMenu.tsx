'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Building2,
  CalendarClock,
  Clapperboard,
  ChevronDown,
  ClipboardCheck,
  ChevronRight,
  Globe2,
  BookOpenText,
  Layers3,
  Megaphone,
  Newspaper,
  PackageCheck,
  Scale,
  ScanSearch,
  Store,
  Target,
  Workflow,
  PhoneCall,
  type LucideIcon,
} from 'lucide-react'
import styles from './desktop-menu.module.css'

type SolutionLink = {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

const SOLUTIONS: SolutionLink[] = [
  {
    href: '/servizi/gestione-social-media',
    label: 'Gestione social',
    description: 'Strategia, contenuti e pubblicazione.',
    icon: Megaphone,
  },
  {
    href: '/servizi/seo-geo',
    label: 'SEO + GEO',
    description: 'Visibilità su ricerca e sistemi AI.',
    icon: ScanSearch,
  },
  {
    href: '/servizi/blog-seo',
    label: 'Blog SEO + GEO',
    description: '12 articoli al mese, pronti per il sito.',
    icon: BookOpenText,
  },
  {
    href: '/servizi/siti-e-commerce',
    label: 'Siti ed e-commerce',
    description: 'Esperienze pensate per convertire.',
    icon: Globe2,
  },
  {
    href: '/servizi/ricerca-clienti-b2b',
    label: 'Ricerca Clienti B2B',
    description: 'Aziende in target, verificate e prioritarie.',
    icon: Target,
  },
  {
    href: '/servizi/segretaria-telefonica-ai',
    label: 'Segretaria telefonica AI',
    description: 'Risponde al telefono e fissa appuntamenti.',
    icon: PhoneCall,
  },
  {
    href: '/servizi/agenda-clienti-whatsapp',
    label: 'Agenda, clienti e WhatsApp',
    description: 'Recupera chi non torna, riempie l’agenda.',
    icon: CalendarClock,
  },
  {
    href: '/servizi/video-produzione',
    label: 'Riprese video in azienda',
    description: 'Fotografo, luci e un volto se serve.',
    icon: Clapperboard,
  },
  {
    href: '/servizi/gestione-lavorazioni',
    label: 'Sito e gestione lavorazioni',
    description: 'Rapportini firmati sul posto, ufficio che approva.',
    icon: ClipboardCheck,
  },
  {
    href: '/servizi/automazione-gestionali',
    label: 'Automazione e gestionali',
    description: 'Sistemi collegati, meno lavoro manuale.',
    icon: Workflow,
  },
  {
    href: '/consulenza',
    label: 'Consulenza legale AI',
    description: 'Privacy, AI Act e trasparenza.',
    icon: Scale,
  },
]

export default function DesktopMenu({ locale = 'it' }: { locale?: 'it' | 'en' }) {
  const pathname = usePathname()
  const isEnglish = locale === 'en'
  const menuRef = useRef<HTMLDivElement>(null)
  const [solutionsOpen, setSolutionsOpen] = useState(false)

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setSolutionsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSolutionsOpen(false)
    }

    document.addEventListener('pointerdown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const solutionIsActive = isEnglish ? pathname === '/en/services' : pathname === '/servizi' || SOLUTIONS.some(link => pathname === link.href)

  const englishSolutions: SolutionLink[] = [
    { href: '/en/services#social', label: 'Managed social media', description: 'Strategy, content and publishing.', icon: Megaphone },
    { href: '/en/services#seo', label: 'SEO + GEO', description: 'Visibility across search and AI systems.', icon: ScanSearch },
    { href: '/en/services#blog', label: 'SEO + GEO Blog', description: 'Reviewed content ready for your website.', icon: BookOpenText },
    { href: '/en/services#web', label: 'Websites and e-commerce', description: 'Digital experiences built to convert.', icon: Globe2 },
    { href: '/en/services#video', label: 'Video shot on site', description: 'A half day of filming, weeks of content.', icon: Clapperboard },
    { href: '/en/services#leads', label: 'B2B lead research', description: 'Verified and prioritised target companies.', icon: Target },
    { href: '/en/services#phone', label: 'AI phone assistant', description: 'Answers while you are working.', icon: PhoneCall },
    { href: '/en/services#agenda', label: 'Diary and client recall', description: 'Dormant clients come back into view.', icon: CalendarClock },
    { href: '/en/services#jobs', label: 'Job reports and site', description: 'Signed on site, with photos and PDF.', icon: ClipboardCheck },
    { href: '/en/services#systems', label: 'Systems automation', description: 'The tools you already use, connected.', icon: Workflow },
    { href: '/en/services#compliance', label: 'AI and data compliance', description: 'Privacy, AI Act and transparency.', icon: Scale },
  ]
  const solutions = isEnglish ? englishSolutions : SOLUTIONS

  return (
    <nav className={styles.desktopMenu} aria-label={isEnglish ? 'Main navigation' : 'Navigazione principale'}>
      <Link className={`${styles.menuLink} ${pathname === (isEnglish ? '/en' : '/') ? styles.active : ''}`} href={isEnglish ? '/en' : '/'}>
        Home
      </Link>
      <div className={styles.solutionRoot} ref={menuRef}>
        <button
          type="button"
          className={`${styles.menuLink} ${styles.menuTrigger} ${solutionIsActive ? styles.active : ''}`}
          aria-expanded={solutionsOpen}
          aria-controls="desktop-solutions-menu"
          onClick={() => setSolutionsOpen(open => !open)}
        >
          <Layers3 size={15} strokeWidth={1.9} aria-hidden="true" />
          {isEnglish ? 'Solutions' : 'Soluzioni'}
          <ChevronDown className={solutionsOpen ? styles.chevronOpen : ''} size={14} aria-hidden="true" />
        </button>

        {solutionsOpen && (
          <div id="desktop-solutions-menu" className={styles.flyout}>
            <div className={styles.flyoutHeading}>
              <div>
                <span>{isEnglish ? 'SWA ecosystem' : 'Ecosistema SWA'}</span>
                <strong>{isEnglish ? 'A clear scope for every capability.' : 'Una pagina per ogni competenza.'}</strong>
              </div>
              <Link href={isEnglish ? '/en/services' : '/servizi'} onClick={() => setSolutionsOpen(false)}>
                {isEnglish ? 'Overview' : 'Panoramica'} <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.solutionGrid}>
              {solutions.map(({ href, label, description, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setSolutionsOpen(false)}>
                  <span className={styles.solutionIcon}><Icon size={18} aria-hidden="true" /></span>
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                  <ChevronRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link className={`${styles.menuLink} ${pathname.startsWith(isEnglish ? '/en/settori' : '/settori') ? styles.active : ''}`} href={isEnglish ? '/en/settori' : '/settori'}>
        <Store size={15} strokeWidth={1.9} aria-hidden="true" /> {isEnglish ? 'Sectors' : 'Settori'}
      </Link>
      <Link className={`${styles.menuLink} ${pathname === (isEnglish ? '/en/method' : '/metodo') ? styles.active : ''}`} href={isEnglish ? '/en/method' : '/metodo'}>
        <Workflow size={15} strokeWidth={1.9} aria-hidden="true" /> {isEnglish ? 'Method' : 'Metodo'}
      </Link>
      <Link className={`${styles.menuLink} ${pathname === (isEnglish ? '/en/pricing' : '/pacchetti') ? styles.active : ''}`} href={isEnglish ? '/en/pricing' : '/pacchetti'}>
        <PackageCheck size={15} strokeWidth={1.9} aria-hidden="true" /> {isEnglish ? 'Packages' : 'Pacchetti'}
      </Link>
      {/* Il Journal era nascosto in inglese perche' il blog inglese non esisteva.
          Ora esiste, con i sette articoli tradotti: il menu inglese aveva una
          voce in meno di quello italiano senza piu' una ragione. */}
      <Link
        className={`${styles.menuLink} ${pathname.startsWith(isEnglish ? '/en/blog' : '/blog') ? styles.active : ''}`}
        href={isEnglish ? '/en/blog' : '/blog'}
      >
        <Newspaper size={15} strokeWidth={1.9} aria-hidden="true" /> Journal
      </Link>
      <Link className={`${styles.menuLink} ${pathname === (isEnglish ? '/en/about' : '/chi-siamo') ? styles.active : ''}`} href={isEnglish ? '/en/about' : '/chi-siamo'}>
        <Building2 size={15} strokeWidth={1.9} aria-hidden="true" /> {isEnglish ? 'About' : 'Azienda'}
      </Link>
    </nav>
  )
}
