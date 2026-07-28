'use client'

import { useEffect, useState } from 'react'
import { CircleHelp, LayoutGrid, PackageCheck, Scale, Workflow, type LucideIcon } from 'lucide-react'
import styles from './desktop-menu.module.css'

type DesktopMenuLink = {
  href: string
  label: string
}

type DesktopMenuProps = {
  links: DesktopMenuLink[]
}

const MENU_ICONS: Record<string, LucideIcon> = {
  '#servizi': LayoutGrid,
  '#metodo': Workflow,
  '#prezzi': PackageCheck,
  '#pacchetti': PackageCheck,
  '#legale': Scale,
  '#faq': CircleHelp,
}

export default function DesktopMenu({ links }: DesktopMenuProps) {
  const [activeHref, setActiveHref] = useState('')

  useEffect(() => {
    let frame = 0

    const updateActiveLink = () => {
      frame = 0
      const activationLine = 150
      let current = ''
      let nearestTop = Number.NEGATIVE_INFINITY

      for (const link of links) {
        const section = document.querySelector<HTMLElement>(link.href)
        const sectionTop = section?.getBoundingClientRect().top
        if (sectionTop !== undefined && sectionTop <= activationLine && sectionTop > nearestTop) {
          current = link.href
          nearestTop = sectionTop
        }
      }

      setActiveHref(current)
    }

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveLink)
    }

    updateActiveLink()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('hashchange', scheduleUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('hashchange', scheduleUpdate)
    }
  }, [links])

  return (
    <nav className={styles.desktopMenu} aria-label="Navigazione principale">
      {links.map(link => {
        const active = activeHref === link.href
        const Icon = MENU_ICONS[link.href] || LayoutGrid
        return (
          <a
            key={link.href}
            href={link.href}
            className={active ? styles.active : undefined}
            aria-current={active ? 'location' : undefined}
            onClick={() => setActiveHref(link.href)}
          >
            <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
            {link.label}
          </a>
        )
      })}
    </nav>
  )
}
