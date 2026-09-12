import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Clock, MonitorPlay, ShieldCheck } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { anteprimaOg } from '@/lib/anteprima'
import { listCorsiPubblicati } from '@/lib/corsi-db'
import { euro } from '@/lib/euro'
import { SITE_URL } from '@/lib/site-config'
import base from '@/styles/content-page.module.css'
import styles from './corsi.module.css'

// Pagina server, non client come le altre landing: il catalogo viene dal
// database e deve finire nell'indice dei motori con i corsi veri dentro.
export const revalidate = 300

const title = 'Corsi online per imprese e professionisti | SWA'
const description =
  'Corsi online di Social Web Automation: videolezioni con accesso immediato dopo l’acquisto, area riservata e avanzamento salvato. Fatti da chi questi servizi li eroga ogni giorno.'

const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei informazioni sui corsi online di Social Web Automation.')}`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/corsi` },
  openGraph: { title, description, url: `${SITE_URL}/corsi`, images: anteprimaOg('/corsi'), type: 'website' },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg('/corsi') },
}

const comeFunziona = [
  {
    icona: MonitorPlay,
    titolo: 'Scegli il corso',
    testo: 'Il programma e le lezioni sono elencati prima dell’acquisto, con le anteprime gratuite da guardare subito.',
  },
  {
    icona: ShieldCheck,
    titolo: 'Paghi in sicurezza',
    testo: 'Pagamento con carta gestito da Stripe. L’account viene creato e attivato al momento: nessuna attesa di approvazione.',
  },
  {
    icona: BadgeCheck,
    titolo: 'Guardi quando vuoi',
    testo: 'Le lezioni restano nella tua area riservata e il punto in cui sei arrivato viene salvato, da computer o da telefono.',
  },
]

const faq = [
  {
    q: 'Quanto dura l’accesso al corso?',
    a: 'L’accesso non scade: una volta acquistato il corso resta nella tua area riservata e puoi riguardare le lezioni quante volte vuoi.',
  },
  {
    q: 'Posso scaricare i video?',
    a: 'No. Le lezioni si guardano dentro l’area riservata e sono personali: ogni video riporta i dati di chi lo sta guardando. È la condizione che ci permette di tenere i prezzi come sono.',
  },
  {
    q: 'I prezzi sono IVA inclusa?',
    a: 'I prezzi indicati sono IVA esclusa, come per gli altri servizi a listino.',
  },
  {
    q: 'Posso chiedere il rimborso?',
    a: 'Per i consumatori il diritto di recesso è di quattordici giorni, ma decade quando si chiede l’accesso immediato al contenuto digitale e lo si dichiara al momento dell’acquisto. La richiesta e la dichiarazione vengono raccolte in modo esplicito prima del pagamento.',
  },
  {
    q: 'Serve un account per acquistare?',
    a: 'Sì, e viene creato durante l’acquisto: serve a darti l’area riservata dove trovi le lezioni. È lo stesso accesso che usano i clienti dei nostri servizi.',
  },
]

export default async function CorsiPage() {
  const corsi = await listCorsiPubblicati()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: `${SITE_URL}/corsi`, name: title, description, inLanguage: 'it-IT' },
      ...(corsi.length
        ? [{
            '@type': 'ItemList',
            name: 'Corsi online Social Web Automation',
            itemListElement: corsi.map((corso, indice) => ({
              '@type': 'ListItem',
              position: indice + 1,
              item: {
                '@type': 'Course',
                name: corso.titolo,
                description: corso.sottotitolo || corso.descrizione.slice(0, 200),
                url: `${SITE_URL}/corsi/${corso.slug}`,
                provider: { '@type': 'Organization', name: 'Social Web Automation', url: SITE_URL },
                offers: {
                  '@type': 'Offer',
                  price: (corso.prezzo_cents / 100).toFixed(2),
                  priceCurrency: corso.currency.toUpperCase(),
                  category: 'Paid',
                  url: `${SITE_URL}/corsi/${corso.slug}`,
                },
              },
            })),
          }]
        : []),
      { '@type': 'FAQPage', mainEntity: faq.map(v => ({ '@type': 'Question', name: v.q, acceptedAnswer: { '@type': 'Answer', text: v.a } })) },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Corsi', item: `${SITE_URL}/corsi` },
        ],
      },
    ],
  }

  return (
    <main id="main-content" className={base.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={base.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={wa} ctaLabel="Parla con noi" />

      <section className={base.hero}>
        <nav className={base.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Corsi</span></nav>
        <p className={base.eyebrow}>Formazione per imprese e professionisti</p>
        <h1>Impara a fare quello che facciamo, con chi lo fa ogni giorno.</h1>
        <p className={base.lead}>
          Videolezioni pratiche su social, visibilità e adempimenti, nate dal lavoro che
          svolgiamo per le aziende. Accesso immediato dopo l’acquisto, area riservata
          personale e avanzamento salvato.
        </p>
        <div className={base.heroActions}>
          <a href="#catalogo" className={base.primary}>Vedi i corsi <ArrowRight size={17} aria-hidden="true" /></a>
          <a href="#come-funziona" className={base.secondary}>Come funziona</a>
        </div>
      </section>

      <section id="catalogo" className={base.section}>
        <div className={base.sectionHeading}>
          <h2>I corsi disponibili</h2>
          <p>Ogni corso mostra il programma completo prima dell’acquisto.</p>
        </div>

        {corsi.length === 0 ? (
          <p className={styles.vuoto}>
            Stiamo preparando i primi corsi. Se vuoi essere avvisato quando escono,{' '}
            <Link href="/contatti">scrivici</Link>.
          </p>
        ) : (
          <ul className={styles.griglia}>
            {corsi.map(corso => (
              <li key={corso.id} className={styles.scheda}>
                <Link href={`/corsi/${corso.slug}`} className={styles.schedaLink}>
                  <span className={styles.badge}>
                    <span className={styles.livello}>{corso.livello}</span>
                    {corso.in_prevendita && <span className={styles.prevenditaTag}>prevendita</span>}
                  </span>
                  <h3>{corso.titolo}</h3>
                  {corso.sottotitolo && <p className={styles.sottotitolo}>{corso.sottotitolo}</p>}
                  <p className={styles.meta}>
                    <MonitorPlay size={15} aria-hidden="true" />
                    {corso.lezioni_totali} {corso.lezioni_totali === 1 ? 'lezione' : 'lezioni'}
                    {corso.durata_totale_min > 0 && (
                      <>
                        <Clock size={15} aria-hidden="true" />
                        {corso.durata_totale_min} min
                      </>
                    )}
                  </p>
                  <span className={styles.prezzo}>
                    {euro(corso.prezzo_cents / 100)}
                    <small>IVA esclusa</small>
                  </span>
                  <span className={styles.vai}>Scopri il corso <ArrowRight size={16} aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="come-funziona" className={base.section}>
        <div className={base.sectionHeading}>
          <h2>Come funziona</h2>
          <p>Dall’acquisto alla prima lezione senza passaggi intermedi.</p>
        </div>
        <div className={base.stepGrid}>
          {comeFunziona.map(passo => (
            <article key={passo.titolo}>
              <passo.icona size={22} aria-hidden="true" />
              <h3>{passo.titolo}</h3>
              <p>{passo.testo}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={base.section}>
        <div className={base.sectionHeading}>
          <h2>Domande frequenti</h2>
        </div>
        <div className={base.faqList}>
          {faq.map(voce => (
            <details key={voce.q}>
              <summary>{voce.q}</summary>
              <p>{voce.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={base.finalCta}>
        <h2>Non sai quale corso fa per te?</h2>
        <p>Scrivici il tuo caso: ti diciamo se un corso ti basta o se serve altro.</p>
        <div className={base.heroActions}>
          <Link href="/contatti" className={base.primary}>Contattaci <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>

      <FloatingNavigation />
      <PublicFooter />
    </main>
  )
}
