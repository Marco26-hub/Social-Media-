import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Download, FileArchive, FileImage, FileText, FileType2 } from 'lucide-react'
import { listDownloads } from '@/lib/downloads'
import { SITE_URL } from '@/lib/site-config'
import styles from './download.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Risorse e download per social media, SEO e GEO | Social Automation',
  description: 'Guide, documenti e materiali condivisi da Social Automation per PMI e professionisti: social media, siti web, SEO e GEO.',
  alternates: { canonical: `${SITE_URL}/download` },
  openGraph: {
    title: 'Risorse e download | Social Automation',
    description: 'Materiali pratici su social media, siti, SEO e GEO per PMI e professionisti.',
    url: `${SITE_URL}/download`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Risorse e download | Social Automation',
    description: 'Materiali pratici su social media, siti, SEO e GEO per PMI e professionisti.',
  },
}

const siteLinks = [
  { href: '/', label: 'Home' },
  { href: '/servizi', label: 'Servizi' },
  { href: '/servizi/seo-geo', label: 'SEO & GEO' },
  { href: '/pacchetti', label: 'Pacchetti' },
]

const serviceCards = [
  {
    title: 'Gestione social media',
    text: 'Strategia, contenuti e pubblicazione per una presenza social costante.',
    href: '/servizi/gestione-social-media',
    cta: 'Scopri il servizio',
  },
  {
    title: 'SEO & GEO',
    text: 'Pagine trovabili da persone, motori di ricerca e assistenti AI.',
    href: '/servizi/seo-geo',
    cta: 'Scopri il servizio',
  },
  {
    title: 'Siti web & e-commerce',
    text: 'Un sito chiaro, veloce e pronto a trasformare visite in contatti.',
    href: '/servizi/siti-e-commerce',
    cta: 'Scopri il servizio',
  },
  {
    title: 'Valutazione AI Act',
    text: 'Ruoli, finalità e rischi dei sistemi AI usati nella tua attività.',
    href: '/consulenza',
    cta: 'Prenota consulenza',
  },
  {
    title: 'Privacy & GDPR',
    text: 'Dati, informative, fornitori e misure organizzative da verificare.',
    href: '/consulenza',
    cta: 'Prenota consulenza',
  },
  {
    title: 'Trasparenza AI',
    text: 'Processi e responsabilità per l’uso consapevole dei contenuti AI.',
    href: '/consulenza',
    cta: 'Prenota consulenza',
  },
  {
    title: 'Copyright & contratti',
    text: 'Licenze, diritti di utilizzo e clausole per contenuti e piattaforme.',
    href: '/consulenza',
    cta: 'Prenota consulenza',
  },
]

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1)
  return `${(bytes / 1024 ** (index + 1)).toLocaleString('it-IT', { maximumFractionDigits: 1 })} ${units[index]}`
}

function fileType(contentType: string, filename: string) {
  const extension = filename.split('.').pop()?.toUpperCase() || 'FILE'
  if (contentType === 'application/pdf' || extension === 'PDF') return { label: 'PDF', Icon: FileText }
  if (contentType.startsWith('image/')) return { label: extension, Icon: FileImage }
  if (/zip|rar|7z|tar/.test(contentType) || /ZIP|RAR|7Z/.test(extension)) return { label: extension, Icon: FileArchive }
  return { label: extension, Icon: FileType2 }
}

export default async function DownloadPage() {
  let items = [] as Awaited<ReturnType<typeof listDownloads>>
  let unavailable = false
  try {
    items = await listDownloads()
  } catch (error) {
    // Non trasformare un problema di connessione in un catalogo "vuoto": il
    // cliente riceve un messaggio chiaro, mentre il dettaglio resta nei log.
    console.error('[download page] public catalog unavailable:', error)
    unavailable = true
  }

  const downloadUrl = `${SITE_URL}/download`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': downloadUrl,
        url: downloadUrl,
        name: 'Risorse e download | Social Automation',
        description: 'Guide, documenti e materiali condivisi da Social Automation per PMI e professionisti.',
        inLanguage: 'it-IT',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Risorse e download', item: downloadUrl },
        ],
      },
      ...(items.length ? [{
        '@type': 'ItemList',
        name: 'Materiali disponibili per il download',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'MediaObject',
            name: item.title,
            description: item.description || `Materiale da scaricare: ${item.originalName}`,
            contentUrl: item.url,
            encodingFormat: item.contentType,
          },
        })),
      }] : []),
    ],
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
        <header className={styles.header}>
          <Link className={styles.brand} href="/" aria-label="Social Automation, torna alla home">
            <span className={styles.brandMark}><Image src="/brand/swa-logo-official.png" alt="Social Automation" width={118} height={55} priority /></span>
          </Link>
          <nav className={styles.siteNav} aria-label="Esplora il sito Social Automation">
            {siteLinks.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
        </header>

        <section className={styles.hero} aria-labelledby="download-title">
          <div>
            <p className={styles.eyebrow}>Area download</p>
            <h1 id="download-title">Materiali pronti per te.</h1>
            <p className={styles.intro}>Scarica qui documenti, immagini e file condivisi dal team SWA.</p>
          </div>
          <p className={styles.count}>{unavailable ? 'Servizio temporaneamente non disponibile' : items.length === 1 ? '1 materiale disponibile' : `${items.length} materiali disponibili`}</p>
        </section>

        {unavailable ? (
          <section className={`${styles.empty} ${styles.unavailable}`} role="alert">
            <strong>I materiali non sono momentaneamente disponibili.</strong>
            Riprova tra poco oppure contattaci se ti serve un file con urgenza.
          </section>
        ) : items.length ? (
          <section className={styles.grid} aria-label="Materiali disponibili">
            {items.map(item => {
              const { label, Icon } = fileType(item.contentType, item.originalName)
              return (
                <article className={styles.card} key={item.id}>
                  <div className={styles.cardTop}>
                    <span className={styles.fileIcon}><Icon size={21} aria-hidden="true" /></span>
                    <span className={styles.type}>{label}</span>
                  </div>
                  <h2>{item.title}</h2>
                  {item.description && <p className={styles.description}>{item.description}</p>}
                  {!item.description && <div className={styles.description} />}
                  <div className={styles.meta}><span>{item.originalName}</span><span>·</span><span>{formatFileSize(item.size)}</span></div>
                  <a className={styles.download} href={item.downloadUrl}>
                    <Download size={17} aria-hidden="true" /> Scarica file
                  </a>
                </article>
              )
            })}
          </section>
        ) : (
          <section className={styles.empty}>
            <strong>Nessun materiale disponibile al momento.</strong>
            Torna presto oppure contattaci se aspettavi un file specifico.
          </section>
        )}

        <section className={styles.explore} aria-labelledby="discover-swa-title">
          <div>
            <p className={styles.eyebrow}>Oltre il download</p>
            <h2 id="discover-swa-title">Trasforma le risorse in risultati concreti.</h2>
            <p>Social Automation affianca PMI e professionisti con strategia social, siti web, contenuti e ottimizzazione SEO e GEO. Esplora i servizi per capire quale percorso è adatto alla tua attività.</p>
          </div>
          <div className={styles.exploreLinks}>
            <Link href="/servizi/seo-geo">Scopri SEO & GEO <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link href="/servizi">Vedi tutti i servizi <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>

        <section className={styles.services} aria-labelledby="services-title">
          <div className={styles.servicesHeading}>
            <div>
              <p className={styles.eyebrow}>Soluzioni SWA</p>
              <h2 id="services-title">Ti serve più di un file?</h2>
            </div>
            <Link href="/pacchetti">Scopri pacchetti e prezzi <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.serviceGrid}>
            {serviceCards.map(service => (
              <article className={styles.serviceCard} key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <Link href={service.href}>{service.cta} <ArrowUpRight size={15} aria-hidden="true" /></Link>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} Social Web Automation</p>
          <nav aria-label="Link al sito Social Automation">
            {siteLinks.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
            <Link href="/consulenza">Contatti</Link>
          </nav>
        </footer>
      </div>
    </main>
  )
}
