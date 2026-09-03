'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './cookie-banner.module.css'
import { COOKIE_CONSENSO, EVENTO_CONSENSO, leggiConsenso, type Consenso } from '@/lib/cookie-consent'

function scriviConsenso(valore: Consenso) {
  const seiMesi = 60 * 60 * 24 * 182
  document.cookie = `${COOKIE_CONSENSO}=${valore}; Max-Age=${seiMesi}; Path=/; SameSite=Lax`
  window.dispatchEvent(new Event(EVENTO_CONSENSO))
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Chiede a chi non ha ancora risposto — inclusi i visitatori che avevano
    // accettato il banner precedente, a cui il marketing non era mai stato posto.
    if (!leggiConsenso(document.cookie)) setVisible(true)
  }, [])

  if (!visible) return null

  const acceptEssential = () => { scriviConsenso('essential'); setVisible(false) }
  const acceptMarketing = () => { scriviConsenso('marketing'); setVisible(false) }

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
