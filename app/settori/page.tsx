import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { SETTORI } from '@/lib/settori'
import { SITE_URL } from '@/lib/site-config'
import styles from '../content-page.module.css'

// Indice dei settori: serve alle persone che si riconoscono in una categoria
// prima che in un servizio, e ai motori come pagina padre delle verticali.

const title = 'Settori: come lavoriamo per la tua categoria | SWA'
const description =
  'Autosaloni, parrucchieri, agenzie immobiliari e imprese di pulizia: che cosa produciamo, che cosa consegniamo e da dove parte il prezzo, settore per settore.'
const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei capire come lavorate nel mio settore.')}`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/settori`, languages: { 'it-IT': `${SITE_URL}/settori`, en: `${SITE_URL}/en/settori`, 'x-default': `${SITE_URL}/settori` } },
  openGraph: { title, description, url: `${SITE_URL}/settori`, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
}

export default function SettoriPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: `${SITE_URL}/settori`, name: title, description, inLanguage: 'it-IT' },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Settori', item: `${SITE_URL}/settori` },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Settori seguiti da Social Web Automation',
        itemListElement: SETTORI.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.nome,
          url: `${SITE_URL}/settori/${s.slug}`,
        })),
      },
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={wa} ctaLabel="Richiedi una call" />

      <section className={styles.hero}>
        <nav className={styles.breadcrumbs} aria-label="Percorso">
          <Link href="/">Home</Link><span>/</span><span>Settori</span>
        </nav>
        <p className={styles.eyebrow}>Per categoria</p>
        <h1>Lo stesso lavoro, raccontato dal tuo problema.</h1>
        <p className={styles.lead}>
          Un salone non ha lo stesso buco di un’impresa di pulizia. Qui trovi che cosa produciamo,
          che cosa consegniamo e da dove parte il prezzo per la tua categoria, senza passare
          dall’elenco dei servizi.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Settori</p>
          <h2>Scegli la tua categoria.</h2>
          <p>Ogni pagina dice quali servizi servono davvero in quel settore, e quali no.</p>
        </div>
        <div className={styles.stepGrid}>
          {SETTORI.map((settore, i) => (
            <article key={settore.slug}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{settore.nome}</h3>
              <p>{settore.sommario}</p>
              <p style={{ marginTop: 18 }}>
                <Link href={`/settori/${settore.slug}`} className={styles.primary}>
                  Apri la pagina <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>Il tuo settore non c’è?</p>
          <h2>Il metodo è lo stesso, cambia che cosa si produce.</h2>
          <p>Raccontaci come lavori: ti diciamo quali aree hanno senso per te e quali puoi lasciare stare.</p>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer">
          Scrivici su WhatsApp <ArrowRight size={17} aria-hidden="true" />
        </a>
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
