'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowLeft, ArrowUp } from 'lucide-react'
import styles from './floating-navigation.module.css'

export default function FloatingNavigation() {
  const pathname = usePathname()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 520)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <nav className={styles.controls} aria-label="Navigazione rapida">
      {pathname !== '/' && (
        <button
          type="button"
          onClick={() => {
            const referrerIsInternal = document.referrer.startsWith(window.location.origin)
            if (referrerIsInternal && window.history.length > 1) window.history.back()
            else window.location.assign('/')
          }}
          aria-label="Torna indietro"
          data-tooltip="Torna indietro"
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={showTop ? styles.visible : styles.hidden}
        aria-label="Torna su"
        data-tooltip="Torna su"
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp size={19} aria-hidden="true" />
      </button>
    </nav>
  )
}
