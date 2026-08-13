'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './cookie-banner.module.css'

// Banner cookie leggero. Il sito usa SOLO cookie tecnici (nessuna profilazione),
// quindi la legge non impone il consenso preventivo: il banner INFORMA e permette
// di prendere atto. Se in futuro si aggiungono cookie di terze parti (analytics,
// pixel), il banner va esteso con accetta/rifiuta granulare PRIMA di installarli.
const CONSENT_KEY = 'cookie_consent'

function readConsent(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

function writeConsent(value: string) {
  const sixMonths = 60 * 60 * 24 * 182
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(value)}; Max-Age=${sixMonths}; Path=/; SameSite=Lax`
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readConsent()) setVisible(true)
  }, [])

  if (!visible) return null

  const accept = () => { writeConsent('technical'); setVisible(false) }

  return (
    <div role="dialog" aria-label="Informativa cookie" className={styles.banner}>
      <p>
        Usiamo <strong>solo cookie tecnici</strong> necessari al funzionamento del sito (nessuna
        profilazione). Continuando, ne prendi atto. Dettagli nella{' '}
        <Link href="/cookie-policy">Cookie Policy</Link>.
      </p>
      <button onClick={accept}>Ho capito</button>
    </div>
  )
}
