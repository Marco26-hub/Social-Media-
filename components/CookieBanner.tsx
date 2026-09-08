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
        {/* Il consenso non governa piu' dei cookie: la misurazione delle campagne
            avviene lato server, senza script di Meta nella pagina e senza cookie
            _fbp/_fbc. Dire «cookie di marketing» sarebbe scorretto — si chiede il
            si' a una cosa e se ne fa un'altra. */}
        {isEnglish
          ? 'Essential cookies are always active. With your consent we measure which campaigns bring a contact — from our server, without loading any Meta script or cookie.'
          : 'I cookie essenziali sono sempre attivi. Con il tuo consenso misuriamo quali campagne portano un contatto: lo facciamo dal nostro server, senza caricare script né cookie di Meta.'}{' '}
        <Link href="/cookie-policy">{isEnglish ? 'Cookie policy (Italian)' : 'Informativa cookie'}</Link>.
      </p>
      <div className={styles.actions}>
        <button className={styles.secondary} onClick={acceptEssential}>{isEnglish ? 'Essential only' : 'Solo essenziali'}</button>
        <button onClick={acceptMarketing}>{isEnglish ? 'Accept marketing' : 'Accetta marketing'}</button>
      </div>
    </div>
  )
}
