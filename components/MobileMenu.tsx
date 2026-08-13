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
}

type MobileMenuProps = {
  links: MobileMenuLink[]
  ctaHref: string
  ctaLabel: string
}

const MENU_ICONS: Record<string, LucideIcon> = {
  '/': Home,
  '/servizi': LayoutGrid,
  '/servizi/gestione-social-media': LayoutGrid,
  '/servizi/seo-geo': LayoutGrid,
  '/servizi/siti-e-commerce': LayoutGrid,
  '/metodo': Workflow,
  '/pacchetti': PackageCheck,
  '/consulenza': Scale,
  '/blog': Newspaper,
  '/chi-siamo': Building2,
  '#servizi': LayoutGrid,
  '#metodo': Workflow,
  '#prezzi': PackageCheck,
  '#pacchetti': PackageCheck,
  '#legale': Scale,
  '#faq': CircleHelp,
}

export default function MobileMenu({ links, ctaHref, ctaLabel }: MobileMenuProps) {
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
        aria-label={open ? 'Chiudi menu' : 'Apri menu'}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-haspopup="true"
        onClick={() => setOpen(value => !value)}
      >
        {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>

      {open && (
        <>
          <nav id="mobile-navigation" className={styles.panel} aria-label="Navigazione mobile">
            <div className={styles.links}>
              {links.map(link => {
                const url = new URL(link.href, 'https://socialautomation.app')
                const Icon = MENU_ICONS[url.hash || url.pathname] || LayoutGrid
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
              <a href="/portale" className={styles.account} onClick={() => setOpen(false)}>Area cliente</a>
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
