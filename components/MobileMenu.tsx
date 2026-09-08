'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ChevronRight,
  Building2,
  CircleHelp,
  Home,
  LayoutGrid,
  Menu,
  Newspaper,
  PackageCheck,
  Scale,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import styles from './mobile-menu.module.css'

type MobileMenuLink = {
  href: string
  label: string
  /** Le voci di un gruppo stanno chiuse finche' non le apri. */
  sotto?: MobileMenuLink[]
}

type MobileMenuProps = {
  links: MobileMenuLink[]
  ctaHref: string
  ctaLabel: string
  locale?: 'it' | 'en'
}

const MENU_ICONS: Record<string, LucideIcon> = {
  '/': Home,
  '/servizi': LayoutGrid,
  '/servizi/gestione-social-media': LayoutGrid,
  '/servizi/seo-geo': LayoutGrid,
  '/servizi/blog-seo': Newspaper,
  '/servizi/siti-e-commerce': LayoutGrid,
  '/metodo': Workflow,
  '/pacchetti': PackageCheck,
  '/consulenza': Scale,
  '/blog': Newspaper,
  '/chi-siamo': Building2,
  '/en': Home,
  '/en/services': LayoutGrid,
  '/en/method': Workflow,
  '/en/settori': LayoutGrid,
  '/en/pricing': PackageCheck,
  '/en/about': Building2,
  '/en/faq': CircleHelp,
  '/en/contact': CircleHelp,
  '#servizi': LayoutGrid,
  '#metodo': Workflow,
  '#prezzi': PackageCheck,
  '#pacchetti': PackageCheck,
  '#legale': Scale,
  '#faq': CircleHelp,
}

export default function MobileMenu({ links, ctaHref, ctaLabel, locale = 'it' }: MobileMenuProps) {
  const isEnglish = locale === 'en'
  const [open, setOpen] = useState(false)
  const menuRootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const previousOverscroll = document.body.style.overscrollBehavior
    const desktopQuery = window.matchMedia('(min-width: 1281px)')

    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }

    const keepFocusInsideMenu = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const focusable = menuRootRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    window.addEventListener('keydown', keepFocusInsideMenu)
    desktopQuery.addEventListener('change', closeOnDesktop)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.overscrollBehavior = previousOverscroll
      window.removeEventListener('keydown', keepFocusInsideMenu)
      desktopQuery.removeEventListener('change', closeOnDesktop)
    }
  }, [open])

  return (
    <div ref={menuRootRef} className={styles.mobileMenu}>
      <button
        type="button"
        className={styles.toggle}
        aria-label={open ? (isEnglish ? 'Close menu' : 'Chiudi menu') : (isEnglish ? 'Open menu' : 'Apri menu')}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-haspopup="true"
        onClick={() => setOpen(value => !value)}
      >
        {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>

      {open && (
        <>
          <nav id="mobile-navigation" className={styles.panel} aria-label={isEnglish ? 'Mobile navigation' : 'Navigazione mobile'}>
            <div className={styles.links}>
              {links.map(link => {
                const url = new URL(link.href, 'https://socialautomation.app')
                const Icon = MENU_ICONS[url.hash || url.pathname] || LayoutGrid
                // I dieci servizi occupavano meta' menu. Chiusi in un gruppo il
                // menu si legge in una schermata, e chi cerca un servizio lo
                // apre con un tocco invece di scorrere fino in fondo.
                if (link.sotto?.length) {
                  return (
                    <details key={link.href} className={styles.gruppo}>
                      <summary>
                        <span className={styles.linkIcon}><Icon size={17} strokeWidth={1.9} aria-hidden="true" /></span>
                        <span>{link.label}</span>
                        <ChevronRight size={17} aria-hidden="true" />
                      </summary>
                      <a href={link.href} onClick={() => setOpen(false)}>
                        <span className={styles.linkIcon}><LayoutGrid size={17} strokeWidth={1.9} aria-hidden="true" /></span>
                        <span>{isEnglish ? 'Overview' : 'Panoramica'}</span>
                        <ChevronRight size={17} aria-hidden="true" />
                      </a>
                      {link.sotto.map(s => {
                        const u = new URL(s.href, 'https://socialautomation.app')
                        const I = MENU_ICONS[u.hash || u.pathname] || LayoutGrid
                        return (
                          <a key={s.href} href={s.href} onClick={() => setOpen(false)}>
                            <span className={styles.linkIcon}><I size={17} strokeWidth={1.9} aria-hidden="true" /></span>
                            <span>{s.label}</span>
                            <ChevronRight size={17} aria-hidden="true" />
                          </a>
                        )
                      })}
                    </details>
                  )
                }
                return (
                  <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                    <span className={styles.linkIcon}><Icon size={17} strokeWidth={1.9} aria-hidden="true" /></span>
                    <span>{link.label}</span>
                    <ChevronRight size={17} aria-hidden="true" />
                  </a>
                )
              })}
            </div>
            <div className={styles.actions}>
              <ThemeToggle showLabel />
              <a href="/login?cambia=1" className={styles.account} onClick={() => setOpen(false)}>{isEnglish ? 'Client area' : 'Area cliente'}</a>
              <a
                href={ctaHref}
                className={styles.cta}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                {ctaLabel}
              </a>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
