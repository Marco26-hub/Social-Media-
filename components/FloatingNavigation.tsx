'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUp } from 'lucide-react'
import styles from './floating-navigation.module.css'

export default function FloatingNavigation() {
  const router = useRouter()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 520)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  function goBack() {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push('/')
  }

  return (
    <nav className={styles.controls} aria-label="Navigazione rapida">
      <button type="button" onClick={goBack} aria-label="Torna indietro" data-tooltip="Torna indietro">
        <ArrowLeft size={19} aria-hidden="true" />
      </button>
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
