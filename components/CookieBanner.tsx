'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './cookie-banner.module.css'
import { COOKIE_CONSENSO, EVENTO_CONSENSO, leggiConsenso, type Consenso } from '@/lib/cookie-consent'

function scriviConsenso(valore: Consenso) {
  const seiMesi = 60 * 60 * 24 * 182
  document.cookie = `${COOKIE_CONSENSO}=${valore}; Max-Age=${seiMesi}; Path=/; SameSite=Lax`
  window.dispatchEvent(new Event(EVENTO_CONSENSO))
}

export default function CookieBanner() {
  const isEnglish = usePathname()?.startsWith('/en') ?? false
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
    <div role="dialog" aria-label={isEnglish ? 'Cookie preferences' : 'Preferenze cookie'} className={styles.banner}>
      <p>
        {isEnglish ? 'Essential cookies are always active. With your consent, we also use Meta marketing cookies.' : 'I cookie essenziali sono sempre attivi. Con il tuo consenso usiamo anche cookie di marketing per Meta.'}{' '}
        <Link href="/cookie-policy">{isEnglish ? 'Cookie policy (Italian)' : 'Informativa cookie'}</Link>.
      </p>
      <div className={styles.actions}>
        <button className={styles.secondary} onClick={acceptEssential}>{isEnglish ? 'Essential only' : 'Solo essenziali'}</button>
        <button onClick={acceptMarketing}>{isEnglish ? 'Accept marketing' : 'Accetta marketing'}</button>
      </div>
    </div>
  )
}
