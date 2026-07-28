'use client'

import { useEffect, useState } from 'react'
import {
  ChevronRight,
  CircleHelp,
  LayoutGrid,
  Menu,
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
  '#servizi': LayoutGrid,
  '#metodo': Workflow,
  '#prezzi': PackageCheck,
  '#pacchetti': PackageCheck,
  '#legale': Scale,
  '#faq': CircleHelp,
}

export default function MobileMenu({ links, ctaHref, ctaLabel }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className={styles.mobileMenu}>
      <button
        type="button"
        className={styles.toggle}
        aria-label={open ? 'Chiudi menu' : 'Apri menu'}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(value => !value)}
      >
        {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>

      {open && (
        <>
          <nav id="mobile-navigation" className={styles.panel} aria-label="Navigazione mobile">
            <div className={styles.links}>
              {links.map(link => {
                const Icon = MENU_ICONS[link.href] || LayoutGrid
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
