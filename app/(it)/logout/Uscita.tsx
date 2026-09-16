'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ArrowLeft, LogOut } from 'lucide-react'
import styles from './logout.module.css'

/**
 * Dove tornare dopo l'uscita. Solo percorsi interni che iniziano con una sola
 * barra: un indirizzo assoluto qui sarebbe un redirect aperto, cioe un link del
 * nostro dominio che porta altrove.
 */
function destinazioneSicura(valore: string | null): string {
  if (!valore) return '/'
  if (!valore.startsWith('/') || valore.startsWith('//')) return '/'
  return valore
}

export default function Uscita() {
  const parametri = useSearchParams()
  const destinazione = destinazioneSicura(parametri.get('callbackUrl'))
  const [inCorso, setInCorso] = useState(false)

  return (
    <div className={styles.scheda}>
      <Link href="/" className={styles.marchio} aria-label="Social Web Automation, home">
        <Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} priority />
      </Link>

      <div>
        <p className={styles.occhiello}><LogOut size={13} aria-hidden="true" /> Uscita</p>
        <h1>Vuoi uscire dall’area riservata?</h1>
      </div>

      <p className={styles.testo}>
        I tuoi corsi e i tuoi dati restano dove sono: al prossimo accesso li ritrovi
        com’erano.
      </p>

      <div className={styles.azioni}>
        <button
          type="button"
          className={styles.esci}
          disabled={inCorso}
          onClick={() => { setInCorso(true); signOut({ callbackUrl: destinazione }) }}
        >
          {inCorso ? 'Uscita in corso…' : <>Esci <LogOut size={16} aria-hidden="true" /></>}
        </button>
        <Link href="/portale" className={styles.resta}>
          <ArrowLeft size={15} aria-hidden="true" /> Resta nell’area riservata
        </Link>
      </div>
    </div>
  )
}
