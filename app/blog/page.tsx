import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { ArrowRight, BookOpen, Clock3, Search, Sparkles } from 'lucide-react'
import { dbReady, q } from '@/lib/db'
import { resolveBlogClienteId } from '@/lib/blog-tenant'
import { SITE_URL } from '@/lib/site-config'
import { SWA_BLOG_ARTICLES } from '@/lib/swa-blog-content'
import { BlogFooter, BlogHeader } from './BlogChrome'
import styles from './blog.module.css'

export const dynamic = 'force-dynamic'

const META_TITLE = 'Guide su Social Media, SEO, GEO e AI per PMI | SWA'
const META_DESCRIPTION =
  'Guide pratiche per PMI su gestione social media, contenuti, SEO, GEO, siti web e uso responsabile dell’intelligenza artificiale.'

type Item = {
  slug: string
  h1: string
  meta_description: string | null
  tempo_lettura_min: number | null
  immagine_cover: string | null
  autore: string | null
  data_pubblicazione: string | null
  keywords_target: string[] | string | null
}

function normalizeHost(value: string | null) {
  return (value || '').split(':')[0].toLowerCase().trim()
}

function isSwaHost(host: string) {
  return host === 'socialautomation.app' || host === 'www.socialautomation.app' || host === 'localhost' || host === '127.0.0.1'
}

function articleCategory(article: Item) {
  const keywords = Array.isArray(article.keywords_target)
    ? article.keywords_target
    : typeof article.keywords_target === 'string'
      ? (() => {
          try {
            const parsed: unknown = JSON.parse(article.keywords_target)
            return Array.isArray(parsed) ? parsed.map(String) : []
          } catch {
            return []
          }
        })()
      : []
  return keywords[0] || 'Strategia digitale'
}

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

async function loadArticles(includeSwaArticles = false): Promise<{ items: Item[]; domainMapped: boolean }> {
  const staticItems = includeSwaArticles ? SWA_BLOG_ARTICLES as Item[] : []
  if (!dbReady()) return { items: staticItems, domainMapped: includeSwaArticles }
  const clienteId = await resolveBlogClienteId()
  if (!clienteId) return { items: staticItems, domainMapped: includeSwaArticles }
  try {
    const rows = await q(
      `SELECT slug, h1, meta_description, tempo_lettura_min, immagine_cover,
              autore, data_pubblicazione, keywords_target
       FROM blog_articoli
       WHERE status = 'PUBBLICATO' AND cliente_id = $1
       ORDER BY COALESCE(data_pubblicazione, updated_at) DESC
       LIMIT 50`,
      [clienteId],
    )
    const dynamicItems = rows as Item[]
    const dynamicSlugs = new Set(dynamicItems.map(item => item.slug))
    return {
      items: [...dynamicItems, ...staticItems.filter(item => !dynamicSlugs.has(item.slug))],
      domainMapped: true,
    }
  } catch {
    return { items: staticItems, domainMapped: true }
  }
}

async function requestContext() {
  const h = await headers()
  const host = normalizeHost(h.get('host'))
  const protocol = h.get('x-forwarded-proto') || (host === 'localhost' || host === '127.0.0.1' ? 'http' : 'https')
  return { host, base: host ? `${protocol}://${h.get('host')}` : SITE_URL, swa: isSwaHost(host) }
}

export async function generateMetadata(): Promise<Metadata> {
  const context = await requestContext()
  const { items, domainMapped } = await loadArticles(context.swa)
  const hasPublishedArticles = domainMapped && items.length > 0

  return {
    title: META_TITLE,
    description: META_DESCRIPTION,
    alternates: {
      canonical: `${context.base}/blog`,
      types: {
        'application/rss+xml': `${context.base}/blog/feed.xml`,
      },
    },
    openGraph: {
      title: META_TITLE,
      description: META_DESCRIPTION,
      url: `${context.base}/blog`,
      type: 'website',
      images: [`${context.base}/og.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title: META_TITLE,
      description: META_DESCRIPTION,
      images: [`${context.base}/og.png`],
    },
    robots: hasPublishedArticles
      ? { index: true, follow: true }
      : { index: false, follow: true, noarchive: true },
  }
}

function TenantBlog({ items, domainMapped }: { items: Item[]; domainMapped: boolean }) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-500 mb-8">Guide e approfondimenti.</p>
      {!domainMapped ? (
        <p className="text-gray-400">Blog non configurato per questo dominio.</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400">Nessun articolo pubblicato al momento.</p>
      ) : (
        <div className="space-y-4">
          {items.map(article => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="block card p-4 md:p-5 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-gray-900 leading-snug mb-1">{article.h1}</h2>
              {article.meta_description && <p className="text-sm text-gray-600">{article.meta_description}</p>}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default async function BlogIndexPage() {
  const context = await requestContext()
  const { items, domainMapped } = await loadArticles(context.swa)

  if (!context.swa) return <TenantBlog items={items} domainMapped={domainMapped} />

  const [featured, ...articles] = items
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${context.base}/blog#blog`,
    url: `${context.base}/blog`,
    name: 'SWA Journal',
    description: META_DESCRIPTION,
    inLanguage: 'it-IT',
    publisher: { '@id': `${SITE_URL}/#organization` },
    blogPost: items.map(article => ({
      '@type': 'BlogPosting',
      headline: article.h1,
      url: `${context.base}/blog/${article.slug}`,
      ...(article.data_pubblicazione ? { datePublished: article.data_pubblicazione } : {}),
    })),
  }

  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd).replace(/</g, '\\u003c') }}
      />
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
      <BlogHeader />

      <section className={styles.hero} aria-labelledby="blog-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><Sparkles size={16} aria-hidden="true" /> SWA Journal</p>
          <h1 id="blog-title">Strategia digitale, spiegata per decidere meglio.</h1>
          <p>
            Guide concrete per gestire social, contenuti, visibilità organica e
            intelligenza artificiale con più metodo e meno rumore.
          </p>
        </div>
        <div className={styles.topicRail} aria-label="Argomenti del blog">
          <span>Social media</span>
          <span>SEO + GEO</span>
          <span>AI responsabile</span>
          <span>Web + e-commerce</span>
        </div>
      </section>

      {featured ? (
        <>
          <section className={styles.featuredSection} aria-labelledby="latest-title">
            <div className={styles.sectionLabel}>
              <span>In evidenza</span>
              <p>{items.length} {items.length === 1 ? 'approfondimento pubblicato' : 'approfondimenti pubblicati'}</p>
            </div>
            <Link href={`/blog/${featured.slug}`} className={styles.featuredCard}>
              <div className={styles.featuredVisual}>
                {featured.immagine_cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.immagine_cover} alt={featured.h1} />
                ) : (
                  <div className={styles.coverFallback} aria-hidden="true">
                    <Image src="/brand/swa-logo-official.png" alt="" width={180} height={82} />
                    <span>Insight operativo</span>
                  </div>
                )}
              </div>
              <div className={styles.featuredCopy}>
                <span className={styles.category}>{articleCategory(featured)}</span>
                <h2 id="latest-title">{featured.h1}</h2>
                {featured.meta_description && <p>{featured.meta_description}</p>}
                <div className={styles.articleMeta}>
                  {formatDate(featured.data_pubblicazione) && <span>{formatDate(featured.data_pubblicazione)}</span>}
                  {featured.tempo_lettura_min && <span><Clock3 size={14} aria-hidden="true" /> {featured.tempo_lettura_min} min</span>}
                  <b>Leggi l’articolo <ArrowRight size={16} aria-hidden="true" /></b>
                </div>
              </div>
            </Link>
          </section>

          {articles.length > 0 && (
            <section className={styles.archive} aria-labelledby="archive-title">
              <div className={styles.archiveHeading}>
                <div>
                  <p className={styles.kicker}>Archivio</p>
                  <h2 id="archive-title">Idee da applicare, non solo da leggere.</h2>
                </div>
                <Search size={25} aria-hidden="true" />
              </div>
              <div className={styles.articleGrid}>
                {articles.map(article => (
                  <Link key={article.slug} href={`/blog/${article.slug}`} className={styles.articleCard}>
                    <div className={styles.cardVisual}>
                      {article.immagine_cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={article.immagine_cover} alt={article.h1} />
                      ) : (
                        <BookOpen size={30} aria-hidden="true" />
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <span className={styles.category}>{articleCategory(article)}</span>
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
        </>
      ) : (
        <section className={styles.emptyState} aria-labelledby="empty-title">
          <div className={styles.emptyIcon}><BookOpen size={30} aria-hidden="true" /></div>
          <p className={styles.kicker}>Editoriale in preparazione</p>
          <h2 id="empty-title">Il primo approfondimento sta prendendo forma.</h2>
          <p>
            Qui pubblicheremo guide operative su gestione social, SEO, GEO,
            automazione e responsabilità nell’uso dell’AI. Niente riempitivi:
            ogni articolo dovrà aiutare una PMI a prendere una decisione concreta.
          </p>
          <Link href="/servizi" className={styles.primaryButton}>
            Nel frattempo, scopri i servizi <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      )}

      <section className={styles.finalCta}>
        <div>
          <p className={styles.kicker}>Dalla lettura all’azione</p>
          <h2>Serve una direzione per la tua presenza digitale?</h2>
          <p>Partiamo da obiettivi, canali e risorse reali. Poi definiamo attività, responsabilità e costi.</p>
        </div>
        <Link href="/servizi#pacchetti" className={styles.lightButton}>
          Confronta i pacchetti <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <BlogFooter />
    </main>
  )
}
