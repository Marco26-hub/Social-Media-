import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'
import { dbReady, q } from '@/lib/db'
import { normalizeArticle, buildJsonLd, type BlogArticleData } from '@/lib/blog-render'
import { resolveBlogClienteId } from '@/lib/blog-tenant'
import { SITE_URL } from '@/lib/site-config'
import { getSwaBlogArticle } from '@/lib/swa-blog-content'
import { BLOG_COVER_DESCRIPTIONS } from '@/lib/blog-covers'
import FloatingNavigation from '@/components/FloatingNavigation'
import { BlogFooter, BlogHeader } from '../BlogChrome'
import styles from '../blog.module.css'

export const dynamic = 'force-dynamic'

async function loadArticle(slug: string, includeSwaArticles = false): Promise<BlogArticleData | null> {
  const staticArticle = includeSwaArticles ? getSwaBlogArticle(slug) : null
  if (!dbReady()) return staticArticle
  const clienteId = await resolveBlogClienteId()
  if (!clienteId) return staticArticle
  try {
    const rows = await q(
      `SELECT * FROM blog_articoli
       WHERE slug = $1 AND status = 'PUBBLICATO' AND cliente_id = $2
       LIMIT 1`,
      [slug, clienteId],
    )
    return rows[0] ? normalizeArticle(rows[0]) : staticArticle
  } catch {
    return staticArticle
  }
}

async function requestContext() {
  const h = await headers()
  const host = (h.get('host') || '').split(':')[0].toLowerCase().trim()
  const protocol = h.get('x-forwarded-proto') || (host === 'localhost' || host === '127.0.0.1' ? 'http' : 'https')
  return {
    base: host ? `${protocol}://${h.get('host')}` : SITE_URL,
    swa: host === 'socialautomation.app' || host === 'www.socialautomation.app' || host === 'localhost' || host === '127.0.0.1',
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const context = await requestContext()
  const article = await loadArticle(slug, context.swa)
  if (!article) return { title: 'Articolo non trovato', robots: { index: false, follow: true } }

  const url = `${context.base}/blog/${article.slug}`
  return {
    title: article.meta_title,
    description: article.meta_description || undefined,
    keywords: article.keywords_target,
    authors: [{ name: article.autore }],
    alternates: { canonical: url },
    openGraph: {
      title: article.meta_title,
      description: article.meta_description || undefined,
      type: 'article',
      url,
      siteName: 'Social Web Automation',
      locale: 'it_IT',
      publishedTime: article.data_pubblicazione || undefined,
      authors: [article.autore],
      ...(article.immagine_cover ? { images: [{ url: article.immagine_cover, alt: article.h1 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.meta_title,
      description: article.meta_description || undefined,
      ...(article.immagine_cover ? { images: [article.immagine_cover] } : {}),
    },
    robots: { index: true, follow: true },
  }
}

function TenantArticle({ article, jsonLd }: { article: BlogArticleData; jsonLd: object[] }) {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <article className="prose prose-gray max-w-none">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">{article.h1}</h1>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
          <span>{article.autore}</span>
          {article.tempo_lettura_min ? <span>· {article.tempo_lettura_min} min</span> : null}
        </div>
        {article.immagine_cover && (
          <Image
            src={article.immagine_cover}
            alt={article.h1}
            width={1200}
            height={675}
            sizes="(max-width: 800px) 100vw, 760px"
            className="w-full h-auto rounded-xl mb-6"
          />
        )}
        {article.intro && <p className="text-lg text-gray-700 leading-relaxed mb-6">{article.intro}</p>}
        {article.sezioni.map((section, index) => (
          <section key={index} className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{section.h2}</h2>
            {section.paragrafi.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
          </section>
        ))}
      </article>
    </main>
  )
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const context = await requestContext()
  const article = await loadArticle(slug, context.swa)
  if (!article) notFound()

  const articleUrl = `${context.base}/blog/${article.slug}`
  const articleJsonLd = buildJsonLd({ ...article, url_pubblicato: articleUrl }, context.base)
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: context.base },
      { '@type': 'ListItem', position: 2, name: 'SWA Journal', item: `${context.base}/blog` },
      { '@type': 'ListItem', position: 3, name: article.h1, item: articleUrl },
    ],
  }

  if (!context.swa) return <TenantArticle article={article} jsonLd={articleJsonLd} />

  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([...articleJsonLd, breadcrumbJsonLd]).replace(/</g, '\\u003c') }}
      />
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
      <BlogHeader />

      <article>
        <header className={styles.articleHero}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link><span>/</span><Link href="/blog">SWA Journal</Link><span>/</span><span>Articolo</span>
          </nav>
          {article.keywords_target[0] && <span className={styles.category}>{article.keywords_target[0]}</span>}
          <h1>{article.h1}</h1>
          {article.intro && <p className={styles.articleLead}>{article.intro}</p>}
          <div className={styles.articleMeta}>
            {/* La firma porta alla pagina dell'autore, e le date sono elementi
                <time>: prima erano testo semplice, che un motore non riconosce
                come data di pubblicazione o di revisione. */}
            <span>
              <Link href="/autore/marco-dibenedetto" rel="author">{article.autore}</Link>
            </span>
            {article.data_pubblicazione && formatDate(article.data_pubblicazione) && (
              <time dateTime={article.data_pubblicazione}>{formatDate(article.data_pubblicazione)}</time>
            )}
            {article.updated_at
              && article.updated_at !== article.data_pubblicazione
              && formatDate(article.updated_at) && (
              <time dateTime={article.updated_at}>Aggiornato il {formatDate(article.updated_at)}</time>
            )}
            {article.tempo_lettura_min && <span><Clock3 size={14} aria-hidden="true" /> {article.tempo_lettura_min} min di lettura</span>}
          </div>
        </header>

        {article.immagine_cover && (
          <figure className={styles.articleCover}>
            <Image
              src={article.immagine_cover}
              alt={BLOG_COVER_DESCRIPTIONS[article.immagine_cover] || article.h1}
              width={1200}
              height={675}
              sizes="(max-width: 1060px) 100vw, 1012px"
              priority
            />
            {BLOG_COVER_DESCRIPTIONS[article.immagine_cover] && <figcaption>Immagine illustrativa generata con AI.</figcaption>}
          </figure>
        )}

        <div className={styles.articleLayout}>
          <div className={styles.articleBody}>
            {article.sezioni.map((section, index) => (
              <section key={index}>
                <h2>{section.h2}</h2>
                {section.paragrafi.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                {section.lista_punti && section.lista_punti.length > 0 && (
                  <ul>{section.lista_punti.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>
                )}
                {section.tabella && (
                  <div className={styles.tableWrap}>
                    <table className={styles.articleTable}>
                      <caption>{section.tabella.caption}</caption>
                      <thead>
                        <tr>{section.tabella.colonne.map(c => <th scope="col" key={c}>{c}</th>)}</tr>
                      </thead>
                      <tbody>
                        {section.tabella.righe.map((riga, r) => (
                          <tr key={r}>
                            {riga.map((cella, c) => c === 0
                              ? <th scope="row" key={c}>{cella}</th>
                              : <td key={c}>{cella}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            {article.faq.length > 0 && (
              <section className={styles.articleFaq}>
                <h2>Domande frequenti</h2>
                {article.faq.map((item, index) => (
                  <details key={index}>
                    <summary>{item.domanda}<span aria-hidden="true">+</span></summary>
                    <p>{item.risposta}</p>
                  </details>
                ))}
              </section>
            )}

            {article.collegamenti && article.collegamenti.length > 0 && (
              <section className={styles.articleCollegamenti}>
                <h2>Su questo lavoriamo così</h2>
                <ul>
                  {article.collegamenti.map(c => (
                    <li key={c.href}>
                      <Link href={c.href}>{c.label}</Link>
                      <span>{c.nota}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {article.fonti && article.fonti.length > 0 && (
              <section className={styles.articleFonti}>
                <h2>Fonti</h2>
                <ul>
                  {article.fonti.map(f => (
                    <li key={f.url}>
                      <a href={f.url} target="_blank" rel="noopener noreferrer">{f.titolo}</a>
                      {f.nota && <span> — {f.nota}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {article.cta_finale && <div className={styles.articleCta}>{article.cta_finale}</div>}
            <Link href="/pacchetti" className={styles.primaryButton}>
              Vedi i pacchetti e i prezzi d’ingresso <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <br />
            <Link href="/blog" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> Torna a SWA Journal</Link>
          </div>
        </div>
      </article>

      <BlogFooter />
      <FloatingNavigation />
    </main>
  )
}
