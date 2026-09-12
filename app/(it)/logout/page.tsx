'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ArrowLeft, LogOut } from 'lucide-react'
import styles from '../login/login.module.css'

// Pagina di uscita.
//
// NextAuth ne ha una propria, servita su /api/auth/signout: fondo bianco,
// link blu, nessun riferimento al marchio. Non si vede quasi mai, perche il
// pulsante «Esci» chiama signOut() e reindirizza da solo — ma quell'indirizzo
// resta raggiungibile, e chi ci finisce vede una pagina che non sembra questo
// sito. `pages.signOut` in lib/auth.ts la sostituisce con questa.
//
// Riusa i fogli di stile della pagina di accesso: sono le due facce della
// stessa porta e devono somigliarsi.

/**
 * Dove tornare dopo l'uscita. Si accettano solo percorsi interni che iniziano
 * con una sola barra: un indirizzo assoluto qui sarebbe un redirect aperto,
 * cioe un link del nostro dominio che porta altrove.
 */
function destinazioneSicura(valore: string | null): string {
  if (!valore) return '/'
  if (!valore.startsWith('/') || valore.startsWith('//')) return '/'
  return valore
}

function Uscita() {
  const parametri = useSearchParams()
  const destinazione = destinazioneSicura(parametri.get('callbackUrl'))
  const [inCorso, setInCorso] = useState(false)

  return (
    <div className={styles.formPanel}>
      <Link href="/" className={styles.brand} aria-label="Social Web Automation, home">
        <span className={styles.logoShell}>
          <Image src="/brand/swa-logo-official.png" alt="SWA" width={118} height={55} priority />
        </span>
      </Link>

      <p className={styles.eyebrow}><LogOut size={14} aria-hidden="true" /> Uscita</p>
      <h1 className={styles.formHeading}>Vuoi uscire dall’area riservata?</h1>
      <p className={styles.intro}>
        I tuoi corsi e i tuoi dati restano dove sono: al prossimo accesso li ritrovi
        com’erano.
      </p>

      <button
        type="button"
        className={styles.submit}
        disabled={inCorso}
        onClick={() => { setInCorso(true); signOut({ callbackUrl: destinazione }) }}
      >
        {inCorso ? 'Uscita in corso…' : <>Esci <LogOut size={17} aria-hidden="true" /></>}
      </button>

      <p className={styles.support}>
        <Link href="/portale"><ArrowLeft size={14} aria-hidden="true" /> Torna all’area riservata</Link>
      </p>
    </div>
  )
}

export default function LogoutPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<div className={styles.formPanel}>Caricamento…</div>}>
        <Uscita />
      </Suspense>
    </main>
  )
}
