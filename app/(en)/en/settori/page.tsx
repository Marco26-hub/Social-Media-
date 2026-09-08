import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SETTORI } from '@/lib/settori'
import { SETTORI_EN } from '@/lib/settori.en'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/styles/content-page.module.css'

const title = 'Sectors: digital operations by trade | SWA'
const description =
  'English sector pages for cleaning and housekeeping companies, restaurants and real estate agencies working with Italian and international customers.'
const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Hello, I would like to discuss the right SWA setup for my sector.')}`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/settori`,
    languages: { 'it-IT': `${SITE_URL}/settori`, en: `${SITE_URL}/en/settori`, 'x-default': `${SITE_URL}/settori` },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/settori`, type: 'website', locale: 'en_US' , images: anteprimaOg('/en/settori')},
  twitter: { card: 'summary_large_image', title, description },
}

// I due conteggi sono calcolati: aggiungere un settore inglese non deve
// lasciare a testo un numero che diventa falso.
const SOLO_ITALIANI = SETTORI.filter(settore => !SETTORI_EN.some(en => en.slug === settore.slug))
const NUMERI = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'] as const
const parola = (n: number) => NUMERI[n] ?? String(n)

export default function EnglishSettoriPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: `${SITE_URL}/en/settori`, name: title, description, inLanguage: 'en' },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
          { '@type': 'ListItem', position: 2, name: 'Sectors', item: `${SITE_URL}/en/settori` },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Sectors served by Social Web Automation in English',
        itemListElement: SETTORI_EN.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.nome,
          url: `${SITE_URL}/en/settori/${s.slug}`,
        })),
      },
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <section className={styles.hero}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/en">Home</Link><span>/</span><span>Sectors</span>
        </nav>
        <p className={styles.eyebrow}>By trade</p>
        <h1>The same operating method, written for the way your business works.</h1>
        <p className={styles.lead}>
          {SOLO_ITALIANI.length === 0 ? (
            <>
              Every sector we serve is written in English, with the same prices, the same
              thresholds and the same rules as the Italian pages. Nothing is summarised for
              the translation.
            </>
          ) : (
            <>
              {parola(SETTORI_EN.length).replace(/^./, c => c.toUpperCase())} sectors are written in
              English, because those are the trades where an international owner, tenant or guest is
              realistic. The other {parola(SOLO_ITALIANI.length)} exist in Italian and are listed
              further down.
            </>
          )}
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Sectors</p>
          <h2>Choose your sector.</h2>
          <p>Each page explains what is worth building for that trade, and what should stay separate.</p>
        </div>
        <div className={styles.stepGrid}>
          {SETTORI_EN.map((settore, i) => (
            <article key={settore.slug}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{settore.nome}</h3>
              <p>{settore.sommario}</p>
              <p style={{ marginTop: 18 }}>
                <Link href={`/en/settori/${settore.slug}`} className={styles.primary}>
                  Open page <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </p>
            </article>
          ))}
        </div>
      </section>


      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>What is identical everywhere</p>
          <h2>The trade changes the output, not the method.</h2>
          <p>
            Whatever the sector, the cycle is the same one described on the method page:
            a monthly plan, production, your approval before anything is published, then
            measurement that sets the next priorities.
          </p>
        </div>
        <div className={styles.stepGrid}>
          <article>
            <span>01</span>
            <h3>What we ask you first</h3>
            <p>
              How a request reaches you today, who answers it, and where it stops. That
              conversation decides the starting point, not a package chosen in advance.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>What changes by sector</h3>
            <p>
              The deliverables. A cleaning company needs signed job reports; a restaurant
              needs table bookings; an agency needs listings kept current. The plan around
              them is built the same way.
            </p>
          </article>
        </div>
      </section>

      {/* Sezione che esiste solo finche' esiste un settore non tradotto: a zero
          restavano un titolo che diceva «Zero more trades» e una griglia vuota. */}
      {SOLO_ITALIANI.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Written in Italian only</p>
            <h2>{parola(SOLO_ITALIANI.length).replace(/^./, c => c.toUpperCase())} more trades, on the Italian site.</h2>
            <p>
              These pages exist and are kept current, but they are written for an Italian
              reader and have not been translated. If one of them is your trade, write to us
              in English and we will answer in English.
            </p>
          </div>
          <div className={styles.stepGrid}>
            {SOLO_ITALIANI.map((settore, i) => (
              <article key={settore.slug}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>
                  <Link href={`/settori/${settore.slug}`} hrefLang="it" lang="it">{settore.nome}</Link>
                </h3>
                <p lang="it">{settore.sommario}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>Your sector is missing?</p>
          <h2>We start from the real bottleneck, not from a generic package.</h2>
          <p>Tell us how the work happens today and we will clarify what is useful to handle first.</p>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer">
          Talk on WhatsApp <ArrowRight size={17} aria-hidden="true" />
        </a>
      </section>
    </main>
  )
}
