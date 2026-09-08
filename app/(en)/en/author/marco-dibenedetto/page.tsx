import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail, MessageCircle } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import { SWA_BLOG_ARTICLES_EN } from '@/lib/swa-blog-content.en'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/styles/content-page.module.css'

// Pagina autore inglese.
//
// I sette articoli tradotti erano firmati «Marco Dibenedetto» senza che la
// persona esistesse come entita' sul lato inglese del sito: per un motore la
// firma restava una stringa. Qui la persona e' collegata all'impresa e agli
// articoli che firma, con lo stesso @id della versione italiana, cosi' le due
// pagine descrivono la stessa entita' invece di due omonimi.

const title = 'Marco Dibenedetto, owner of Social Web Automation | SWA'
const description =
  'Who signs the articles and the projects of Social Web Automation: Marco Dibenedetto, owner, based in Cermenate near Como, Italy. What he does, how he works and how to reach him.'

const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Hello Marco! I read your page on the site and I would like to talk about a project.')}`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/author/marco-dibenedetto`,
    languages: {
      'it-IT': `${SITE_URL}/autore/marco-dibenedetto`,
      en: `${SITE_URL}/en/author/marco-dibenedetto`,
      'x-default': `${SITE_URL}/autore/marco-dibenedetto`,
    },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/author/marco-dibenedetto`, type: 'profile', locale: 'en_US' , images: anteprimaOg('/en/author/marco-dibenedetto')},
  twitter: { card: 'summary_large_image', title, description },
}

const SKILLS = [
  { t: 'Managed social media for small businesses', d: 'Editorial plan, production, client approval and publishing on 2 channels, with the monthly cycle described in the method.' },
  { t: 'SEO and GEO', d: 'Structure, intents, entities and structured data, so that a page is understandable to a search engine and quotable by an AI answer system.' },
  { t: 'Phone assistants and client recovery', d: 'Configuring the phone answering and the WhatsApp recalls, with the rules written by the client before activation.' },
  { t: 'Process automation', d: 'Connecting management software, forms and existing records, to remove the steps where the same data is retyped several times.' },
  { t: 'Transparency in the use of AI', d: 'What is produced with AI assistance, who answers for the choices and what is never automated. Legal matters go through the qualified partner.' },
  { t: 'Websites and e-commerce', d: 'Landing pages, company websites and online shops, with the basic technical SEO and ownership passing to the client after 12 months of the fee.' },
]

const PROMISES = [
  { n: '01', t: '“I will get you to page one”', d: 'No supplier controls Google’s algorithm or that of an AI answer system. The work is on structure, quality and clarity: the position is decided by somebody else.' },
  { n: '02', t: '“I guarantee you X appointments”', d: 'Prospecting delivers verified companies with sources and priorities. The commercial contact is yours to make, and the market answers as it pleases.' },
  { n: '03', t: '“Artificial intelligence will handle it”', d: 'AI speeds up analysis and production. Direction, checking and approval before publication remain decisions made by a person.' },
  { n: '04', t: '“We will discuss the price later”', d: 'Entry prices are public on the services page. The areas without a published price are declared as “on request”, not left blank.' },
]

export default function EnglishAuthorPage() {
  const articoli = SWA_BLOG_ARTICLES_EN.filter(a => a.autore === 'Marco Dibenedetto')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/en/author/marco-dibenedetto#webpage`,
        url: `${SITE_URL}/en/author/marco-dibenedetto`,
        name: title,
        description,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${SITE_URL}/#marco-dibenedetto` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
          { '@type': 'ListItem', position: 2, name: 'Author', item: `${SITE_URL}/en/author/marco-dibenedetto` },
        ],
      },
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <section className={styles.hero}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/en">Home</Link><span>/</span><span>Author</span>
        </nav>
        <p className={styles.eyebrow}>Who signs this</p>
        <h1>Marco Dibenedetto, owner of Social Web Automation.</h1>
        <p className={styles.lead}>
          Social Web Automation is my sole trader business, based in Cermenate in the
          province of Como, Italy. I sign the Journal articles myself and I answer for the
          choices that end up in client projects: what gets produced, what stays out and
          what is never automated.
        </p>
        <div className={styles.heroActions}>
          <a className={styles.primary} href={wa} target="_blank" rel="noopener noreferrer">
            Message me on WhatsApp <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a className={styles.secondary} href={`mailto:${TITOLARE.email}`}>
            <Mail size={15} aria-hidden="true" /> Send me an email
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>How I work</p>
          <h2>One person in front of the client, specialists behind.</h2>
          <p>
            Strategy, direction and responsibility stay with me. Filming, development and
            legal matters go through selected professionals: the AI Act and GDPR consulting
            is delivered by Studio Legale BCS, with Avv. Vincenzo Sapone, a Cassation
            lawyer. What I write here does not replace legal advice.
          </p>
        </div>
        <div className={styles.stepGrid}>
          {SKILLS.map((c, i) => (
            <article key={c.t}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>What I do not promise</p>
          <h2>The four sentences you will never find here.</h2>
        </div>
        <div className={styles.stepGrid}>
          {PROMISES.map(p => (
            <article key={p.n}>
              <span>{p.n}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      {articoli.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Journal</p>
            <h2>The articles I have written.</h2>
            <p>{articoli.length} pieces published in English, all signed and dated.</p>
          </div>
          <div className={styles.stepGrid}>
            {articoli.map((a, i) => (
              <article key={a.slug}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3><Link href={`/en/blog/${a.slug}`}>{a.h1}</Link></h3>
                <p>
                  {a.data_pubblicazione && (
                    <time dateTime={a.data_pubblicazione}>
                      {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(a.data_pubblicazione))}
                    </time>
                  )}
                  {a.tempo_lettura_min ? ` · ${a.tempo_lettura_min} min read` : ''}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Company details</p>
          <h2>Who you sign the contract with.</h2>
        </div>
        <div className={styles.stepGrid}>
          <article>
            <span>Business</span>
            <h3>{TITOLARE.ragioneSociale}</h3>
            <p>Registered office: {TITOLARE.sedeLegale}, Italy</p>
          </article>
          <article>
            <span>VAT number</span>
            <h3>{TITOLARE.partitaIva}</h3>
            <p>
              It is the identifier that tells this business apart from others with a similar
              name. For formal communication there is the certified address: {TITOLARE.pec}.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>Let us talk</p>
          <h2>Tell me how you work today.</h2>
          <p>From there it becomes clear which area is worth touching first, and which ones you can leave alone.</p>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={17} aria-hidden="true" /> Message me on WhatsApp
        </a>
      </section>

      <FloatingNavigation />
    </main>
  )
}
