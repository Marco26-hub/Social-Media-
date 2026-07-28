import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import styles from './legal.module.css'
import { TITOLARE } from '@/lib/legal-config'

// Layout condiviso per le pagine legali (Privacy, Cookie, Termini, Trasparenza AI).
// Header sticky con navigazione, titolo, data di aggiornamento e documenti correlati.
export default function LegalShell({
  eyebrow,
  title,
  children,
  currentPath,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
  currentPath: string
}) {
  const related = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/termini', label: 'Termini e Condizioni' },
    { href: '/trasparenza-ai', label: 'Trasparenza AI' },
  ].filter(r => r.href !== currentPath)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}><ArrowLeft size={16} /> Torna al sito</Link>
        <Link href="/" className={styles.headerBrand} aria-label={`${TITOLARE.brand}, home`}>
          <span className={styles.headerMark}>
            <Image src="/brand/swa-logo-official.png" alt="SWA" width={68} height={30} priority />
          </span>
          {TITOLARE.brand}
        </Link>
      </header>

      <div className={styles.doc}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Ultimo aggiornamento: {TITOLARE.ultimoAggiornamento}</p>

        <div className={styles.body}>{children}</div>

        <div className={styles.footerNote}>
          <p>
            Titolare: {TITOLARE.ragioneSociale} · {TITOLARE.brand} · Contatti: <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>
          </p>
          <div className={styles.relatedLinks}>
            {related.map(r => <Link key={r.href} href={r.href}>{r.label}</Link>)}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper per evidenziare i placeholder da compilare.
export function PH({ children }: { children: React.ReactNode }) {
  return <span className={styles.placeholder}>{children}</span>
}
