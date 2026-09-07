import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SETTORI_EN } from '@/lib/settori.en'
import { SITE_URL } from '@/lib/site-config'
import styles from '../../content-page.module.css'

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
  openGraph: { title, description, url: `${SITE_URL}/en/settori`, type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image', title, description },
}

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
          These English pages focus on sectors where an international customer or owner is realistic:
          housekeeping, restaurants and real estate.
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
