import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FileArchive, FileImage, FileText, Film, Link2 } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { describeItem, normalizeAccessCode } from '@/lib/download-area'
import { getActiveCode, listItems, type DownloadItem } from '@/lib/download-area-db'
import pageStyles from '@/styles/content-page.module.css'
import styles from './download.module.css'

// Il codice nell'URL decide cosa si vede: niente cache, la pagina si calcola a ogni richiesta.
export const dynamic = 'force-dynamic'

const WHATSAPP_URL = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei conoscere meglio Social Web Automation e valutare un progetto.')}`

// Pagina riservata a chi ha il link: fuori da motori di ricerca, cache e archivi.
export const metadata: Metadata = {
  title: 'Materiali riservati | Social Web Automation',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

// Il tipo salvato è quello canonico dell'estensione (vedi ALLOWED_FILE_TYPES).
function ItemIcon({ item }: { item: DownloadItem }) {
  const type = item.contentType || ''
  if (item.kind === 'link') return <Link2 size={22} aria-hidden="true" />
  if (type.startsWith('image/')) return <FileImage size={22} aria-hidden="true" />
  if (type.startsWith('video/')) return <Film size={22} aria-hidden="true" />
  if (type === 'application/zip') return <FileArchive size={22} aria-hidden="true" />
  return <FileText size={22} aria-hidden="true" />
}

// Qualunque motivo per cui le schede non si possono mostrare (codice sbagliato,
// schema mancante, database spento) restituisce null: la pagina risponde 404 e
// non rivela che esiste.
async function loadItems(code: string): Promise<DownloadItem[] | null> {
  try {
    if ((await getActiveCode()) !== code) return null
    return await listItems({ includeHidden: false })
  } catch (e) {
    console.error('[download-area] lettura della pagina pubblica non riuscita:', e instanceof Error ? e.message : e)
    return null
  }
}

export default async function DownloadPage({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params
  // Formato errato: 404 subito, senza toccare il database.
  const code = normalizeAccessCode(codice)
  if (!code) notFound()

  const items = await loadItems(code)
  if (!items) notFound()

  return (
    <main id="main-content" className={pageStyles.page}>
      <a className={pageStyles.skipLink} href="#main-content">Vai al contenuto</a>

      <PublicHeader ctaHref={WHATSAPP_URL} ctaLabel="Conosciamoci" />

      <section className={pageStyles.hero} aria-labelledby="download-title">
        <p className={pageStyles.eyebrow}>Riservato a chi ha il link</p>
        <h1 id="download-title">I tuoi materiali SWA.</h1>
        <p className={pageStyles.lead}>
          Guide, strumenti e link preparati per te. Scarica quello che ti serve: non chiediamo registrazione né email.
        </p>
      </section>

      <section className={pageStyles.section} aria-labelledby="materiali-title">
        <div className={pageStyles.sectionHeading}>
          <h2 id="materiali-title">Materiali disponibili</h2>
        </div>

        {items.length === 0 ? (
          <p className={styles.empty}>Stiamo preparando i materiali, torna a trovarci presto.</p>
        ) : (
          <ul className={styles.grid}>
            {items.map(item => {
              const { actionLabel, href, meta, external } = describeItem(item)
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
                    aria-label={`${actionLabel} ${item.title}${external ? ' (si apre in una nuova scheda)' : ''}`}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                  >
                    {actionLabel}
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
