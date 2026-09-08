import { anteprimaOg } from '@/lib/anteprima'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'
import { buildJsonLd } from '@/lib/blog-render'
import { SITE_URL } from '@/lib/site-config'
import { SWA_BLOG_ARTICLES_EN, getSwaBlogArticleEn } from '@/lib/swa-blog-content.en'
import FloatingNavigation from '@/components/FloatingNavigation'
import styles from '@/styles/blog.module.css'

// Articolo inglese: solo contenuto statico, nessun accesso al database. La
// versione italiana serve anche i blog dei clienti multi-tenant, questa no.

export function generateStaticParams() {
  return SWA_BLOG_ARTICLES_EN.map(article => ({ slug: article.slug }))
}

function formatDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = getSwaBlogArticleEn(slug)
  if (!article) return { title: 'Article not found', robots: { index: false, follow: true } }

  const url = `${SITE_URL}/en/blog/${article.slug}`
  const title = article.meta_title || article.h1
  const description = article.meta_description || article.intro || ''

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'it-IT': `${SITE_URL}/blog/${article.slugIt}`,
        en: url,
        'x-default': `${SITE_URL}/blog/${article.slugIt}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      locale: 'en_US',
      images: article.immagine_cover ? [`${SITE_URL}${article.immagine_cover}`] : anteprimaOg('/en/blog'),
      ...(article.data_pubblicazione ? { publishedTime: article.data_pubblicazione } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function EnglishArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getSwaBlogArticleEn(slug)
  if (!article) notFound()

  const articleUrl = `${SITE_URL}/en/blog/${article.slug}`
  // url_pubblicato dell'articolo inglese punta gia' a /en/blog/<slug>, quindi
  // buildJsonLd usa quello e non ricostruisce il percorso italiano.
  const articleJsonLd = buildJsonLd(article, SITE_URL, 'en')
  const breadcrumbJsonLd = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
      { '@type': 'ListItem', position: 2, name: 'SWA Journal', item: `${SITE_URL}/en/blog` },
      { '@type': 'ListItem', position: 3, name: article.h1, item: articleUrl },
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([...articleJsonLd, breadcrumbJsonLd]).replace(/</g, '\\u003c') }}
      />
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <article>
        <header className={styles.articleHero}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/en">Home</Link><span>/</span><Link href="/en/blog">SWA Journal</Link><span>/</span><span>Article</span>
          </nav>
          {article.keywords_target?.[0] && <span className={styles.category}>{article.keywords_target[0]}</span>}
          <h1>{article.h1}</h1>
          {article.intro && <p className={styles.articleLead}>{article.intro}</p>}
          <div className={styles.articleMeta}>
            {/* La firma linkata come nella versione italiana: senza, la
                pagina autore inglese restava orfana e la persona non era
                collegata agli articoli che firma. */}
            <span><Link href="/en/author/marco-dibenedetto" rel="author">{article.autore}</Link></span>
            {article.data_pubblicazione && formatDate(article.data_pubblicazione) && (
              <time dateTime={article.data_pubblicazione}>{formatDate(article.data_pubblicazione)}</time>
            )}
            {article.tempo_lettura_min && <span><Clock3 size={14} aria-hidden="true" /> {article.tempo_lettura_min} min read</span>}
          </div>
        </header>

        {article.immagine_cover && (
          <figure className={styles.articleCover}>
            <Image
              src={article.immagine_cover}
              // Le descrizioni delle copertine sono in italiano: su una pagina
              // inglese l'alternativa testuale deve essere il titolo inglese.
              alt={article.h1}
              width={1200}
              height={675}
              sizes="(max-width: 1060px) 100vw, 1012px"
              priority
            />
            <figcaption>Illustrative image generated with AI.</figcaption>
          </figure>
        )}

        <div className={styles.articleLayout}>
          <div className={styles.articleBody}>
            {article.sezioni.map((section, index) => (
              <section key={index}>
                <h2>{section.h2}</h2>
                {section.paragrafi.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                {section.lista_punti && section.lista_punti.length > 0 && (
                  <ul>{section.lista_punti.map((item, i) => <li key={i}>{item}</li>)}</ul>
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
                <h2>Frequently asked questions</h2>
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
                <h2>This is how we work on it</h2>
                <ul>
                  {article.collegamenti.map(c => (
                    <li key={`${c.href}-${c.label}`}>
                      <Link href={c.href}>{c.label}</Link>
                      <span>{c.nota}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {article.fonti && article.fonti.length > 0 && (
              <section className={styles.articleFonti}>
                <h2>Sources</h2>
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
            <Link href="/en/pricing" className={styles.primaryButton}>
              See the packages and entry prices <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <br />
            <Link href="/en/blog" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> Back to SWA Journal</Link>
          </div>
        </div>
      </article>

      <FloatingNavigation />
    </main>
  )
}
