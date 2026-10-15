import Link from 'next/link'
import { ArrowRight, FileArchive, FileImage, FileText, Film, Link2 } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { buildWhatsAppUrl, describeItem, type PageTexts } from '@/lib/download-area'
import type { DownloadItem } from '@/lib/download-area-db'
import type { InAppBrowser } from '@/lib/in-app-browser'
import { TITOLARE } from '@/lib/legal-config'
import { CASES } from '@/lib/prove'
import { SITE_URL } from '@/lib/site-config'
import { INSTAGRAM_HANDLE, instagramUrl } from '@/lib/social-links'
import pageStyles from '@/styles/content-page.module.css'
import { ABOUT_TEXT, BRIDGE_STEPS, BRIDGE_TEXT, CLOSING_TEXT, GIFT_FAQ, PUBLIC_PRICES } from './download-copy'
import InAppNotice from './InAppNotice'
import styles from './download.module.css'

// Spazi non separabili: il numero non si spezza a fine riga sul telefono.
const PHONE = TITOLARE.telefono.replace(/ /g, '\u{a0}')

// Il tipo salvato è quello canonico dell'estensione (vedi ALLOWED_FILE_TYPES).
function ItemIcon({ item }: { item: DownloadItem }) {
  const type = item.contentType || ''
  if (item.kind === 'link') return <Link2 size={22} aria-hidden="true" />
  if (type.startsWith('image/')) return <FileImage size={22} aria-hidden="true" />
  if (type.startsWith('video/')) return <Film size={22} aria-hidden="true" />
  if (type === 'application/zip') return <FileArchive size={22} aria-hidden="true" />
  return <FileText size={22} aria-hidden="true" />
}

type Props = {
  code: string
  items: DownloadItem[]
  texts: PageTexts
  inApp: InAppBrowser
}

// La pagina regali, solo presentazione: dati, codice e 404 li decide page.tsx. Prima i
// regali, poi una sola richiesta (il contenuto di prova su WhatsApp). Nessuno script
// di misura e nessuna richiesta di consenso: qui non parte niente che li richieda.
export default function GiftPage({ code, items, texts, inApp }: Props) {
  const waUrl = buildWhatsAppUrl(texts.whatsappText)
  const inAppBrowser = inApp.app !== null
  // Indirizzo pubblico della pagina, per «Apri in Chrome» e «Copia il link».
  const pageUrl = `${SITE_URL}/download/${code}`

  return (
    <main id="main-content" className={`${pageStyles.page} ${styles.page}`}>
      <a className={pageStyles.skipLink} href="#main-content">Vai al contenuto</a>

      <PublicHeader ctaHref={waUrl} ctaLabel="Richiedi una prova" />

      {/* Solo su iPhone e Android: fuori da lì non c'è un consiglio sicuro da dare. */}
      {inApp.app !== null && inApp.os !== 'other' ? (
        <InAppNotice app={inApp.app} os={inApp.os} pageUrl={pageUrl} />
      ) : null}

      <section className={`${pageStyles.hero} ${styles.compactHero}`} aria-labelledby="download-title">
        <p className={pageStyles.eyebrow}>{texts.eyebrow}</p>
        <h1 id="download-title">{texts.title}</h1>
        <p className={pageStyles.lead}>{texts.lead}</p>
      </section>

      <section className={`${pageStyles.section} ${styles.gifts}`} aria-labelledby="regali-title">
        <h2 id="regali-title" className={styles.giftsHeading}>
          I tuoi regali{items.length > 0 ? ` · ${items.length}` : ''}
        </h2>

        {items.length === 0 ? (
          <p className={styles.empty}>
            Il regalo sta arrivando. Intanto, se vuoi vedere cosa possiamo fare per te,{' '}
            <a href={waUrl} target="_blank" rel="noopener noreferrer">scrivici</a>.
          </p>
        ) : (
          <ul className={styles.grid}>
            {items.map(item => {
              const { actionLabel, href, meta, external, hint } = describeItem(item, { inApp: inAppBrowser })
              const hintId = `nota-${item.id}`
              return (
                <li key={item.id} className={styles.card}>
                  <div className={styles.body}>
                    <span className={styles.icon}><ItemIcon item={item} /></span>
                    <h3 className={styles.title}>{item.title}</h3>
                    {item.description ? <p className={styles.description}>{item.description}</p> : null}
                    {meta ? <p className={styles.meta}>{meta}</p> : null}
                  </div>
                  <a
                    className={styles.action}
                    href={href}
                    aria-label={`${actionLabel}: ${item.title}${external ? ' (si apre in una nuova scheda)' : ''}`}
                    aria-describedby={hint ? hintId : undefined}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                  >
                    {actionLabel}
                  </a>
                  {hint ? <p id={hintId} className={styles.hint}>{hint}</p> : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section id="prova" className={pageStyles.section} aria-labelledby="prova-title">
        <div className={pageStyles.sectionHeading}>
          <p className={pageStyles.eyebrow}>Il passo dopo, solo se ti serve</p>
          <h2 id="prova-title">Preferisci che lo facciamo noi?</h2>
          <p>{BRIDGE_TEXT}</p>
        </div>
        <div className={pageStyles.stepGrid}>
          {BRIDGE_STEPS.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
        <div className={pageStyles.heroActions}>
          <a className={pageStyles.primary} href={waUrl} target="_blank" rel="noopener noreferrer">
            Chiedi il contenuto di prova gratuito <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <p className={styles.phoneLine}>
          Si apre WhatsApp con il messaggio già scritto. Non si apre? Scrivi al {PHONE}.
        </p>
      </section>

      <section className={pageStyles.section} aria-labelledby="chi-title">
        <div className={pageStyles.sectionHeading}>
          <h2 id="chi-title">Chi ti fa questi regali</h2>
          <p>{ABOUT_TEXT}</p>
        </div>
        <div className={styles.proofGrid}>
          {CASES.map(item => (
            <Link key={item.title} href={item.href} className={styles.proofCard}>
              <span className={styles.proofMetric}>{item.metric}<small>{item.unit}</small></span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </Link>
          ))}
        </div>
        <p className={styles.priceLine}>
          <Link href="/pacchetti">Prezzi pubblici</Link>: {PUBLIC_PRICES}.
        </p>
      </section>

      <section className={`${pageStyles.section} ${pageStyles.faqLayout}`} aria-labelledby="faq-title">
        <div className={pageStyles.sectionHeading}>
          <h2 id="faq-title">Domande frequenti</h2>
        </div>
        <div className={pageStyles.faqList}>
          {GIFT_FAQ.map(item => (
            <details key={item.q}>
              <summary>{item.q}<span aria-hidden="true">+</span></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={pageStyles.finalCta} aria-labelledby="chiusura-title">
        <div>
          <p className={pageStyles.eyebrow}>Nessuna fretta</p>
          <h2 id="chiusura-title">I regali sono tuoi comunque.</h2>
          <p>{CLOSING_TEXT}</p>
        </div>
        {/* Pulsante e riga Instagram nella stessa colonna: sul telefono il pulsante resta subito dopo il testo. */}
        <div className={styles.finalActions}>
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            Scrivici su WhatsApp <ArrowRight size={17} aria-hidden="true" />
          </a>
          <p className={styles.finalNote}>
            I prossimi regali li annunciamo su Instagram: segui{' '}
            <a href={instagramUrl()} target="_blank" rel="noopener noreferrer">{INSTAGRAM_HANDLE}</a>.
          </p>
        </div>
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
