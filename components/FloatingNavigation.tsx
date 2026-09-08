'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowLeft, ArrowUp } from 'lucide-react'
import { EVENTO_RIQUADRO, chiOccupa, mascotteVisibile } from '@/lib/riquadri'
import styles from './floating-navigation.module.css'

export default function FloatingNavigation() {
  const pathname = usePathname()
  const [showTop, setShowTop] = useState(false)
  // Le etichette accessibili e i tooltip erano in italiano anche sulle 28
  // pagine inglesi: uno screen reader annunciava «Torna indietro» in mezzo a
  // una pagina in inglese. La lingua si deduce dal percorso, come altrove.
  const inglese = pathname === '/en' || pathname.startsWith('/en/')
  const t = inglese
    ? { nav: 'Quick navigation', indietro: 'Go back', su: 'Back to top' }
    : { nav: 'Navigazione rapida', indietro: 'Torna indietro', su: 'Torna su' }

  // I due pulsanti stanno nello stesso angolo di ODINO e del popup. Prima ci
  // finivano sotto: il pannello aperto li copriva del tutto e la mascotte
  // chiusa li nascondeva a meta'. Ora seguono chi c'e': con un pannello aperto
  // spariscono — l'angolo e' suo e sarebbero comunque irraggiungibili — e con
  // la sola mascotte salgono sopra di lei.
  const [angolo, setAngolo] = useState<{ pannello: boolean; mascotte: boolean }>({ pannello: false, mascotte: false })

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 520)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const leggi = () => setAngolo({ pannello: chiOccupa() !== null, mascotte: mascotteVisibile() })
    leggi()
    window.addEventListener(EVENTO_RIQUADRO, leggi)
    return () => window.removeEventListener(EVENTO_RIQUADRO, leggi)
  }, [])

  if (angolo.pannello) return null

  return (
    <nav
      className={`${styles.controls} ${angolo.mascotte ? styles.sopraMascotte : ''}`}
      aria-label={t.nav}
    >
      {pathname !== '/' && pathname !== '/en' && (
        <button
          type="button"
          onClick={() => {
            const referrerIsInternal = document.referrer.startsWith(window.location.origin)
            if (referrerIsInternal && window.history.length > 1) window.history.back()
            else window.location.assign(inglese ? '/en' : '/')
          }}
          aria-label={t.indietro}
          data-tooltip={t.indietro}
        >
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={showTop ? styles.visible : styles.hidden}
        aria-label={t.su}
        data-tooltip={t.su}
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </nav>
  )
}
