import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import styles from './legal.module.css'
import { TITOLARE } from '@/lib/legal-config'

// Layout condiviso per le pagine legali (Privacy, Cookie, Termini, Trasparenza AI,
// Recesso, Sicurezza, Accessibilita).
// Header sticky con navigazione, titolo, data di aggiornamento e documenti correlati.
export const DOCUMENTI_LEGALI = {
  it: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/termini', label: 'Termini e Condizioni' },
    { href: '/trasparenza-ai', label: 'Trasparenza AI' },
    { href: '/recesso', label: 'Recesso e disdetta' },
    { href: '/sicurezza', label: 'Sicurezza' },
    { href: '/accessibilita', label: 'Accessibilità' },
  ],
  en: [
    { href: '/en/privacy', label: 'Privacy Policy' },
    { href: '/en/cookie-policy', label: 'Cookie Policy' },
    { href: '/en/terms', label: 'Terms and Conditions' },
    { href: '/en/ai-transparency', label: 'AI Transparency' },
    { href: '/en/withdrawal', label: 'Withdrawal and cancellation' },
    { href: '/en/security', label: 'Security' },
    { href: '/en/accessibility', label: 'Accessibility' },
  ],
} as const

export default function LegalShell({
  eyebrow,
  title,
  children,
  currentPath,
  locale = 'it',
  altraLinguaHref,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
  currentPath: string
  locale?: 'it' | 'en'
  /** La gemella nell'altra lingua. Senza, si torna alla radice dell'altra lingua. */
  altraLinguaHref?: string
}) {
  const inglese = locale === 'en'
  const t = inglese
    ? { salta: 'Skip to content', indietro: 'Back to the site', aggiornato: 'Last updated', titolare: 'Data controller', contatti: 'Contact', altra: 'Versione italiana', altraTitolo: 'Vai alla versione italiana di questo documento' }
    : { salta: 'Vai al contenuto', indietro: 'Torna al sito', aggiornato: 'Ultimo aggiornamento', titolare: 'Titolare', contatti: 'Contatti', altra: altraLinguaHref ? 'English' : 'English site', altraTitolo: altraLinguaHref ? 'Read this document in English' : 'Go to the English site — this document is published in Italian only' }
  const home = inglese ? '/en' : '/'
  const altra = altraLinguaHref ?? (inglese ? '/' : '/en')
  const related = DOCUMENTI_LEGALI[inglese ? 'en' : 'it'].filter(r => r.href !== currentPath)

  // Chi arriva qui dal sito inglese resta senza via d'uscita: queste pagine non
  // hanno una gemella tradotta — sono atti che vincolano e vanno riviste da chi
  // ne risponde — ma il ritorno all'inglese deve esistere lo stesso.
  //
  // Il collegamento diceva «English» e portava alla home inglese: accanto a un
  // documento legale italiano si legge come «questo documento in inglese», e
  // invece porta altrove. Ora dice dove va davvero.
  return (
    <div className={styles.page}>
      {/* Landmark e salto al contenuto: mancavano su tutte e sette le pagine
          legali, e /accessibilita e' la pagina che dichiara di averli. Il
          documento e' il contenuto principale, quindi <main> sta sul .doc. */}
      <a className={styles.skipLink} href="#main-content">{t.salta}</a>
      <header className={styles.header}>
        <Link href={home} className={styles.back}><ArrowLeft size={16} /> {t.indietro}</Link>
        <Link
          href={altra}
          className={styles.altraLingua}
          hrefLang={inglese ? 'it' : 'en'}
          lang={inglese ? 'it' : 'en'}
          title={t.altraTitolo}
        >
          {t.altra}
        </Link>
        <Link href={home} className={styles.headerBrand} aria-label={`${TITOLARE.brand}, home`}>
          <span className={styles.headerMark}>
            <Image src="/brand/swa-logo-official.png" alt="SWA" width={68} height={30} priority />
          </span>
          {TITOLARE.brand}
        </Link>
      </header>

      <main id="main-content" className={styles.doc}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>{t.aggiornato}: {TITOLARE.ultimoAggiornamento}</p>

        <div className={styles.body}>{children}</div>

        <div className={styles.footerNote}>
          <p>
            {t.titolare}: {TITOLARE.ragioneSociale} · {TITOLARE.brand} · {t.contatti}: <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>
          </p>
          <div className={styles.relatedLinks}>
            {related.map(r => <Link key={r.href} href={r.href}>{r.label}</Link>)}
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper per evidenziare i placeholder da compilare.
export function PH({ children }: { children: React.ReactNode }) {
  return <span className={styles.placeholder}>{children}</span>
}
