'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './cookie-banner.module.css'

const CONSENT_KEY = 'cookie_consent'

function readConsent(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

function writeConsent(value: string) {
  const sixMonths = 60 * 60 * 24 * 182
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(value)}; Max-Age=${sixMonths}; Path=/; SameSite=Lax`
  window.dispatchEvent(new Event('swa-cookie-consent'))
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readConsent()) setVisible(true)
  }, [])

  if (!visible) return null

  const acceptEssential = () => { writeConsent('essential'); setVisible(false) }
  const acceptMarketing = () => { writeConsent('marketing'); setVisible(false) }

  return (
    <div role="dialog" aria-label="Informativa cookie" className={styles.banner}>
      <p>
        Usiamo cookie tecnici necessari e, solo con il tuo consenso, cookie marketing
        per misurare le campagne Meta. Dettagli nella{' '}
        <Link href="/cookie-policy">Cookie Policy</Link>.
      </p>
      <div className={styles.actions}>
        <button className={styles.secondary} onClick={acceptEssential}>Solo essenziali</button>
        <button onClick={acceptMarketing}>Accetta marketing</button>
      </div>
    </div>
  )
}
