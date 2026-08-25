'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Globe2,
  BookOpenText,
  Layers3,
  Megaphone,
  Newspaper,
  PackageCheck,
  Scale,
  ScanSearch,
  Target,
  Workflow,
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
    href: '/consulenza',
    label: 'Consulenza legale AI',
    description: 'Privacy, AI Act e trasparenza.',
    icon: Scale,
  },
]

export default function DesktopMenu() {
  const pathname = usePathname()
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

  const solutionIsActive = pathname === '/servizi' || SOLUTIONS.some(link => pathname === link.href)

  return (
    <nav className={styles.desktopMenu} aria-label="Navigazione principale">
      <Link className={`${styles.menuLink} ${pathname === '/' ? styles.active : ''}`} href="/">
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
          Soluzioni
          <ChevronDown className={solutionsOpen ? styles.chevronOpen : ''} size={14} aria-hidden="true" />
        </button>

        {solutionsOpen && (
          <div id="desktop-solutions-menu" className={styles.flyout}>
            <div className={styles.flyoutHeading}>
              <div>
                <span>Ecosistema SWA</span>
                <strong>Una pagina per ogni competenza.</strong>
              </div>
              <Link href="/servizi" onClick={() => setSolutionsOpen(false)}>
                Panoramica <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.solutionGrid}>
              {SOLUTIONS.map(({ href, label, description, icon: Icon }) => (
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

      <Link className={`${styles.menuLink} ${pathname === '/metodo' ? styles.active : ''}`} href="/metodo">
        <Workflow size={15} strokeWidth={1.9} aria-hidden="true" /> Metodo
      </Link>
      <Link className={`${styles.menuLink} ${pathname === '/pacchetti' ? styles.active : ''}`} href="/pacchetti">
        <PackageCheck size={15} strokeWidth={1.9} aria-hidden="true" /> Pacchetti
      </Link>
      <Link className={`${styles.menuLink} ${pathname.startsWith('/blog') ? styles.active : ''}`} href="/blog">
        <Newspaper size={15} strokeWidth={1.9} aria-hidden="true" /> Journal
      </Link>
      <Link className={`${styles.menuLink} ${pathname === '/chi-siamo' ? styles.active : ''}`} href="/chi-siamo">
        <Building2 size={15} strokeWidth={1.9} aria-hidden="true" /> Azienda
      </Link>
    </nav>
  )
}
