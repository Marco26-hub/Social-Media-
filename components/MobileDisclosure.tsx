'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import styles from './mobile-disclosure.module.css'

/** Expanded on desktop and without JavaScript; optional details on mobile. */
export default function MobileDisclosure({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)')
    const sync = () => {
      const element = ref.current
      if (!element) return
      if (media.matches && element.contains(document.activeElement)) {
        element.querySelector('summary')?.focus()
      }
      element.open = !media.matches
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return (
    <details ref={ref} open className={styles.disclosure} data-mobile-disclosure>
      <summary>{label}<span aria-hidden="true">+</span></summary>
      <div className={styles.body}>{children}</div>
    </details>
  )
}
