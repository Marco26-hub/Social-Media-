import type { Metadata } from 'next'
import { Suspense } from 'react'
import Uscita from './Uscita'
import styles from './logout.module.css'

// Pagina di uscita.
//
// NextAuth ne ha una sua su /api/auth/signout: fondo bianco, link blu, nessun
// riferimento al marchio. Non si vede quasi mai, perche il pulsante «Esci»
// chiama signOut() e reindirizza da solo, ma l'indirizzo resta raggiungibile e
// chi ci arriva vede una pagina che non sembra questo sito. `pages.signOut` in
// lib/auth.ts la sostituisce con questa.
//
// Componente server solo per poter dichiarare il titolo: la parte interattiva
// sta in Uscita.tsx.

export const metadata: Metadata = {
  title: 'Esci | Social Web Automation',
  robots: { index: false, follow: false },
}

export default function LogoutPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={null}>
        <Uscita />
      </Suspense>
    </main>
  )
}
