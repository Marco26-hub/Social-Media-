'use client'

import Image from 'next/image'
import Link from 'next/link'
import { TITOLARE } from '@/lib/legal-config'
import styles from './public-footer.module.css'

export default function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/" className={styles.brand} aria-label="Social Automation, home">
        <span><Image src="/brand/swa-logo-official.png" alt="SWA" width={74} height={34} /></span>
        Social Automation
      </Link>
      <nav aria-label="Link nel footer">
        <Link href="/servizi">Servizi</Link>
        <Link href="/metodo">Metodo</Link>
        <Link href="/pacchetti">Pacchetti</Link>
        <Link href="/blog">Journal</Link>
        <Link href="/chi-siamo">Azienda</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/termini">Termini</Link>
      </nav>
      <p>{TITOLARE.ragioneSociale}<br />P.IVA {TITOLARE.partitaIva} · Cermenate (CO)</p>
    </footer>
  )
}
