import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, BookOpen, Clock3, Search, Sparkles } from 'lucide-react'
import { SITE_URL } from '@/lib/site-config'
import { SWA_BLOG_ARTICLES_EN } from '@/lib/swa-blog-content.en'
import FloatingNavigation from '@/components/FloatingNavigation'
import styles from '@/styles/blog.module.css'

// Indice inglese del Journal.
//
// A differenza di quello italiano non passa dal database: gli articoli inglesi
// sono soltanto i nostri, non quelli dei clienti multi-tenant, quindi la pagina
// e' statica e non ha bisogno ne' di risolvere il dominio ne' di interrogare
// Postgres a ogni richiesta.

const META_TITLE = 'Guides on social media, SEO, GEO and AI for small businesses | SWA'
const META_DESCRIPTION =
  'SWA Journal: articles on managed social media, SEO and GEO, business video, B2B prospecting and the AI Act obligations that apply to small and medium companies.'

const ARTICOLI = [...SWA_BLOG_ARTICLES_EN].sort((a, b) =>
  String(b.data_pubblicazione ?? '').localeCompare(String(a.data_pubblicazione ?? '')),
)

function categoria(article: (typeof ARTICOLI)[number]) {
  return article.keywords_target?.[0] || 'Digital strategy'
}

function formatDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/en/blog`,
    languages: { 'it-IT': `${SITE_URL}/blog`, en: `${SITE_URL}/en/blog`, 'x-default': `${SITE_URL}/blog` },
  },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/en/blog`, type: 'website', locale: 'en_US', images: [`${SITE_URL}/og.png`] },
  twitter: { card: 'summary_large_image', title: META_TITLE, description: META_DESCRIPTION, images: [`${SITE_URL}/og.png`] },
}

export default function EnglishBlogIndex() {
  const [featured, ...articles] = ARTICOLI
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/en/blog#blog`,
    url: `${SITE_URL}/en/blog`,
    name: 'SWA Journal',
    description: META_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#organization` },
    blogPost: ARTICOLI.map(article => ({
      '@type': 'BlogPosting',
      headline: article.h1,
      url: `${SITE_URL}/en/blog/${article.slug}`,
      ...(article.data_pubblicazione ? { datePublished: article.data_pubblicazione } : {}),
    })),
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <section className={styles.hero} aria-labelledby="blog-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><Sparkles size={16} aria-hidden="true" /> SWA Journal</p>
          <h1 id="blog-title">Social, websites and AI: guides for your business.</h1>
          <p>
            What the services cost, what they cover and how to choose the ones that
            are useful to your business. With examples and answers to the questions
            clients actually ask.
          </p>
        </div>
        <div className={styles.topicRail} aria-label="Blog topics">
          <span>Social media</span>
          <span>SEO + GEO</span>
          <span>Responsible AI</span>
          <span>Web + e-commerce</span>
        </div>
      </section>

      <section className={styles.featuredSection} aria-labelledby="latest-title">
        <div className={styles.sectionLabel}>
          <span>Featured</span>
          <p>{ARTICOLI.length} {ARTICOLI.length === 1 ? 'article published' : 'articles published'}</p>
        </div>
        <Link href={`/en/blog/${featured.slug}`} className={styles.featuredCard}>
          <div className={styles.featuredVisual}>
            {featured.immagine_cover ? (
              <Image src={featured.immagine_cover} alt={featured.h1} fill sizes="(max-width: 900px) 100vw, 620px" style={{ objectFit: 'cover' }} priority />
            ) : (
              <div className={styles.coverFallback} aria-hidden="true">
                <Image src="/brand/swa-logo-official.png" alt="" width={180} height={82} />
                <span>Practical guide</span>
              </div>
            )}
          </div>
          <div className={styles.featuredCopy}>
            <span className={styles.category}>{categoria(featured)}</span>
            <h2 id="latest-title">{featured.h1}</h2>
            {featured.meta_description && <p>{featured.meta_description}</p>}
            <div className={styles.articleMeta}>
              {formatDate(featured.data_pubblicazione) && <span>{formatDate(featured.data_pubblicazione)}</span>}
              {featured.tempo_lettura_min && <span><Clock3 size={14} aria-hidden="true" /> {featured.tempo_lettura_min} min</span>}
              <b>Read the article <ArrowRight size={16} aria-hidden="true" /></b>
            </div>
          </div>
        </Link>
      </section>

      {articles.length > 0 && (
        <section className={styles.archive} aria-labelledby="archive-title">
          <div className={styles.archiveHeading}>
            <div>
              <p className={styles.kicker}>Archive</p>
              <h2 id="archive-title">Ideas to apply, not only to read.</h2>
            </div>
            <Search size={25} aria-hidden="true" />
          </div>
          <div className={styles.articleGrid}>
            {articles.map(article => (
              <Link key={article.slug} href={`/en/blog/${article.slug}`} className={styles.articleCard}>
                <div className={styles.cardVisual}>
                  {article.immagine_cover ? (
                    <Image src={article.immagine_cover} alt={article.h1} fill sizes="(max-width: 700px) 100vw, 352px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <BookOpen size={30} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.category}>{categoria(article)}</span>
                  <h3>{article.h1}</h3>
                  {article.meta_description && <p>{article.meta_description}</p>}
                  <div className={styles.articleMeta}>
                    {article.tempo_lettura_min && <span><Clock3 size={14} aria-hidden="true" /> {article.tempo_lettura_min} min</span>}
                    <b aria-hidden="true"><ArrowRight size={17} /></b>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.finalCta}>
        <div>
          <p className={styles.kicker}>From reading to doing</p>
          <h2>Need a direction for your digital presence?</h2>
          <p>We start from your real objectives, channels and resources. Then we define the activities, the responsibilities and the costs.</p>
        </div>
        <Link href="/en/pricing" className={styles.lightButton}>
          Compare the packages <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <FloatingNavigation />
    </main>
  )
}
