import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CircleCheck, Globe2, Newspaper, Target } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { PACCHETTI } from '@/lib/pacchetti'
import { SITE_URL } from '@/lib/site-config'
import base from '../content-page.module.css'
import styles from './pacchetti.module.css'

const title = 'Pacchetti Social, Blog, Web e Lead B2B | SWA'
const description = 'Confronta Presenza, Crescita, Blog SEO + GEO, Web & Commerce e Pilot Lead B2B: servizi gestiti per visibilità, conversione e opportunità.'
const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei capire quale pacchetto Social Web Automation è adatto alla mia azienda.')}`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/pacchetti`,
    languages: { 'it-IT': `${SITE_URL}/pacchetti`, en: `${SITE_URL}/en/pricing`, 'x-default': `${SITE_URL}/pacchetti` },
  },
  openGraph: { title, description, url: `${SITE_URL}/pacchetti` },
  twitter: { title, description },
}

const faq = [
  { q: 'I prezzi includono l’IVA?', a: 'No. I prezzi indicati sono mensili e IVA esclusa.' },
  { q: 'Il setup iniziale ha un costo?', a: 'Nei pacchetti social Presenza e Crescita il setup è incluso. Per Blog e Web eventuali integrazioni esterne vengono definite prima dell’avvio.' },
  { q: 'Il budget ADS e compreso nel piano Crescita?', a: 'La gestione di una campagna e inclusa; il budget versato alla piattaforma pubblicitaria e separato e resta sotto il controllo del cliente.' },
  { q: 'Blog SEO + GEO è incluso nei pacchetti social?', a: 'Crescita include un articolo al mese. Il servizio Blog autonomo comprende invece 12 articoli mensili e può essere combinato con qualsiasi piano.' },
  { q: 'Sito web ed e-commerce sono inclusi nei pacchetti social?', a: 'No. Web & Commerce è un servizio separato, combinabile con gli altri. Il canone parte da 19,90 euro al mese e dopo 12 mesi il sito diventa tuo.' },
  { q: 'Cosa comprende il Pilot Ricerca Clienti B2B?', a: 'È un servizio una tantum da 149 euro: definiamo il profilo ideale, analizziamo fino a 30 aziende e consegniamo una lista verificata e prioritaria. Non comprende invii automatici e non garantisce appuntamenti o vendite.' },
  { q: 'Qual è la differenza tra SEO + GEO e Blog SEO + GEO?', a: 'SEO + GEO definisce audit, struttura, intenti e priorità. Blog SEO + GEO produce con continuità il piano editoriale e 12 articoli al mese.' },
  { q: 'Posso richiedere una configurazione diversa?', a: 'Sì. Più brand, canali, volumi, video, automazioni e integrazioni vengono quotati dopo una valutazione iniziale.' },
]

const comparisonRows = [
  ['Canali social', '2', '3', '—', '—', '—'],
  ['Contenuti social mensili', '16', '24', '—', '—', '—'],
  ['Reel, Story o Short', '4', '6', '—', '—', '—'],
  ['Articoli SEO + GEO', '—', '1/mese', '12/mese', 'SEO tecnica', '—'],
  ['Gestione campagna ADS', '—', '1', '—', 'Tracking', '—'],
  ['Pubblicazione blog', '—', '1 articolo', 'Inclusa o export CMS', 'Integrazione', '—'],
  ['Sito / e-commerce', '—', '—', '—', 'Da €19,90/mese', '—'],
  ['Aziende B2B analizzate', '—', '—', '—', '—', 'Fino a 30'],
  ['Fonti e priorità', '—', '—', '—', '—', 'Incluse'],
  ['Proprietà dopo 12 mesi', '—', '—', '—', 'Sì', '—'],
]

export default function PacchettiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: `${SITE_URL}/pacchetti`, name: title, description, inLanguage: 'it-IT' },
      {
        '@type': 'OfferCatalog',
        name: 'Pacchetti Social Web Automation',
        itemListElement: [
          ...PACCHETTI.map(plan => ({
            '@type': 'Offer', name: plan.nome, price: plan.prezzo.replace(/[^0-9]/g, ''), priceCurrency: 'EUR',
            url: `${SITE_URL}/register?piano=${plan.slug}`, description: plan.sottotitolo,
          })),
          {
            '@type': 'Offer', name: BLOG_SERVICE.name, price: BLOG_SERVICE.price, priceCurrency: 'EUR',
            url: `${SITE_URL}${BLOG_SERVICE.path}`, description: `${BLOG_SERVICE.articlesPerMonth} articoli SEO e GEO al mese.`,
          },
          {
            '@type': 'Offer', name: 'Web & Commerce', price: '19.90', priceCurrency: 'EUR',
            url: `${SITE_URL}/servizi/siti-e-commerce`, description: 'Siti ed e-commerce mobile-first. Dopo 12 mesi di canone il sito diventa del cliente.',
          },
          {
            '@type': 'Offer', name: 'Pilot Ricerca Clienti B2B', price: '149', priceCurrency: 'EUR',
            url: `${SITE_URL}/servizi/ricerca-clienti-b2b`, description: 'Profilo ideale, ricerca fino a 30 aziende, fonti verificabili e lista prioritaria.',
          },
        ],
      },
      { '@type': 'FAQPage', mainEntity: faq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Pacchetti', item: `${SITE_URL}/pacchetti` }] },
    ],
  }

  return (
    <main id="main-content" className={base.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={base.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={wa} ctaLabel="Scegli il piano" />

      <section className={base.hero}>
        <nav className={base.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Pacchetti</span></nav>
        <p className={base.eyebrow}>Soluzioni e prezzi trasparenti</p>
        <h1>Cinque soluzioni chiare. Una configurazione su misura quando serve.</h1>
        <p className={base.lead}>Presenza e Crescita gestiscono i social. Blog costruisce copertura organica, Web realizza il punto di conversione e il Pilot B2B qualifica nuove aziende in target.</p>
        <div className={base.heroActions}>
          <a href="#confronto" className={base.primary}>Confronta le soluzioni <ArrowRight size={17} /></a>
          <a href={wa} target="_blank" rel="noopener noreferrer" className={base.secondary}>Aiutami a scegliere</a>
        </div>
      </section>

      <section id="confronto" className={styles.pricing}>
        <div className={base.sectionHeading}>
          <p className={base.eyebrow}>Social, contenuti, Web o opportunità B2B</p>
          <h2>Scegli in base al risultato, non al numero di funzioni.</h2>
          <p>Blog, Web e Pilot B2B possono essere attivati da soli oppure affiancati a Presenza e Crescita.</p>
        </div>

        <div className={styles.grid}>
          {PACCHETTI.map(plan => (
            <article key={plan.slug} className={`${styles.card} ${plan.consigliato ? styles.featured : ''}`}>
              <div className={styles.top}><div><span className={styles.audience}>{plan.eyebrow}</span><h2>{plan.nome}</h2></div>{plan.consigliato && <span className={styles.badge}>Più scelto</span>}</div>
              <p className={styles.result}>{plan.risultato}</p>
              <p className={styles.price}><strong>{plan.prezzo}</strong><span>/mese</span></p>
              <p className={styles.setup}>{plan.setup}</p>
              <p className={styles.description}>{plan.sottotitolo}</p>
              <div className={styles.fit}><strong>E adatto a te se</strong><p>{plan.idealePer}</p></div>
              {plan.includeDa && <p className={styles.includes}>Include tutto di {plan.includeDa}, piu:</p>}
              <p className={styles.listLabel}>Nel canone trovi</p>
              <ul>{plan.features.map(feature => <li key={feature}><CircleCheck size={15} />{feature}</li>)}</ul>
              <Link href={`/register?piano=${plan.slug}`}>{plan.cta}<ArrowRight size={16} /></Link>
              <p className={styles.note}>Setup incluso · IVA esclusa · rinnovo mensile</p>
            </article>
          ))}

          <article className={`${styles.card} ${styles.blogCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Aziende che vogliono traffico organico</span><h2>{BLOG_SERVICE.name}</h2></div><span className={styles.badge}>{BLOG_SERVICE.trialDays} giorni</span></div>
            <p className={styles.result}>{BLOG_SERVICE.articlesPerMonth} articoli al mese, pianificati e controllati.</p>
            <p className={styles.price}><strong>{BLOG_SERVICE.displayPrice}</strong><span>/mese</span></p>
            <p className={styles.setup}>Servizio autonomo, combinabile con i piani social</p>
            <p className={styles.description}>Piano editoriale SEO + GEO con pubblicazione sul blog collegato o consegna pronta per CMS.</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Vuoi rispondere alle ricerche dei clienti con continuità, senza gestire internamente il calendario editoriale.</p></div>
            <p className={styles.listLabel}>Nel canone trovi</p>
            <ul>{BLOG_SERVICE.features.map(feature => <li key={feature}><CircleCheck size={15} />{feature}</li>)}</ul>
            <Link href="/acquista?servizio=blog-seo"><Newspaper size={16} /> Attiva Blog <ArrowRight size={16} /></Link>
            <p className={styles.note}>IVA esclusa · rinnovo mensile</p>
          </article>

          <article className={`${styles.card} ${styles.webCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Professionisti, PMI e negozi</span><h2>Web &amp; Commerce</h2></div><span className={styles.badge}>Sito tuo</span></div>
            <p className={styles.result}>Un sito credibile che trasforma visite in contatti o vendite.</p>
            <p className={styles.price}><span>da</span><strong>€19,90</strong><span>/mese</span></p>
            <p className={styles.setup}>Dopo 12 mesi di canone, il sito è tuo</p>
            <p className={styles.description}>Canone tecnologico di partenza. Progettazione, configurazione e funzioni vengono quotate prima dell’avvio.</p>
            <div className={styles.fit}><strong>E adatto a te se</strong><p>Ti serve una landing, un sito aziendale o un e-commerce collegato a campagne, contenuti e analytics.</p></div>
            <p className={styles.listLabel}>Nel progetto trovi</p>
            <ul>{['Architettura, UX e design responsive', 'Landing page, sito o catalogo e-commerce', 'SEO tecnica, sitemap e dati strutturati', 'Moduli, checkout, analytics e integrazioni', 'Collegamento a social e campagne', 'Proprietà del sito dopo 12 mesi'].map(feature => <li key={feature}><CircleCheck size={15} />{feature}</li>)}</ul>
            <Link href="/acquista?servizio=web-commerce"><Globe2 size={16} /> Attiva Web &amp; Commerce <ArrowRight size={16} /></Link>
            <p className={styles.note}>IVA esclusa · dominio e servizi esterni separati</p>
          </article>

          <article className={`${styles.card} ${styles.leadCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Imprese che cercano aziende in target</span><h2>Pilot Ricerca Clienti B2B</h2></div><span className={styles.badge}>Una tantum</span></div>
            <p className={styles.result}>Una lista verificata per decidere chi approfondire.</p>
            <p className={styles.price}><strong>€149</strong><span>una tantum</span></p>
            <p className={styles.setup}>Fino a 30 aziende analizzate</p>
            <p className={styles.description}>Ricerca e qualificazione con fonti pubbliche tracciabili. Nessun invio automatico e nessuna promessa di appuntamenti o vendite.</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Hai un’offerta B2B chiara e vuoi una base commerciale ordinata prima di investire tempo nel contatto.</p></div>
            <p className={styles.listLabel}>Nel Pilot trovi</p>
            <ul>{['Profilo cliente ideale e criteri di esclusione', 'Ricerca fino a 30 aziende coerenti', 'Fonti pubbliche consultabili', 'Priorità e motivazione per ogni azienda', 'Rimozione di duplicati e profili fuori target', 'Consegna strutturata per valutazione o CRM'].map(feature => <li key={feature}><CircleCheck size={15} />{feature}</li>)}</ul>
            <Link href="/acquista?servizio=lead-pilot"><Target size={16} /> Attiva il Pilot B2B <ArrowRight size={16} /></Link>
            <p className={styles.note}>IVA esclusa · servizio una tantum</p>
          </article>
        </div>

        <div className={styles.comparison}>
          <table>
            <caption>Confronto rapido</caption>
            <thead><tr><th>Servizio</th><th>Presenza</th><th>Crescita</th><th>Blog SEO + GEO</th><th>Web &amp; Commerce</th><th>Pilot B2B</th></tr></thead>
            <tbody>{comparisonRows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <td key={cell}>{cell}</td> : <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className={styles.custom}>
        <div><span>Configurazione personalizzata</span><h2>Più brand, volumi elevati o integrazioni.</h2><p>Costruiamo un perimetro dedicato quando le cinque soluzioni standard non rappresentano il processo reale dell’azienda.</p></div>
        <a href={wa} target="_blank" rel="noopener noreferrer">Progettiamo la soluzione <ArrowRight size={17} /></a>
      </section>
      <section className={`${base.section} ${base.faqLayout}`}><div className={base.sectionHeading}><p className={base.eyebrow}>FAQ pacchetti</p><h2>Costi e condizioni in chiaro.</h2></div><div className={base.faqList}>{faq.map(item => <details key={item.q}><summary>{item.q}<span>+</span></summary><p>{item.a}</p></details>)}</div></section>
      <section className={base.finalCta}><div><p className={base.eyebrow}>Prima di scegliere</p><h2>Valutiamo insieme canali e obiettivi.</h2><p>Ti indichiamo la soluzione sostenibile o il perimetro personalizzato necessario.</p></div><a href={wa} target="_blank" rel="noopener noreferrer">Richiedi una valutazione <ArrowRight size={17} /></a></section>
      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
