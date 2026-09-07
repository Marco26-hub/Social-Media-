import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MessageCircle,
  Scale,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import { PREZZO_INGRESSO } from '@/lib/prezzi-ingresso'
import { SETTORI } from '@/lib/settori'
import { SITE_URL } from '@/lib/site-config'
import { TITOLARE } from '@/lib/legal-config'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import styles from './chi-siamo.module.css'

const META_TITLE = 'Chi siamo: agenzia digitale per PMI a Como e Milano | SWA'
const META_DESCRIPTION =
  'Social Web Automation è la ditta individuale di Marco Dibenedetto, a Cermenate (CO): dieci aree di servizio, undici settori, la tua approvazione prima di ogni uscita.'
// Elenco e conteggi arrivano dai dati, non da una lista scritta a mano: una
// pagina "chi siamo" che dichiara sei aree mentre il sito ne vende dieci e' la
// prima cosa che un cliente nota, e l'ultima che qualcuno si ricorda di aggiornare.
const AREE = [
  'Gestione social media su due canali',
  'Riprese video e foto in azienda',
  'Blog SEO + GEO, dodici articoli al mese',
  'Siti web e landing page',
  'Visibilità su motori di ricerca e sistemi AI',
  'Ricerca clienti B2B verificata',
  'Segretaria telefonica AI e agenda',
  'Sito e gestione lavorazioni con rapportini',
  'Automazione e collegamento dei gestionali',
  'Consulenza legale su AI Act e GDPR',
]
const NUMERO_SERVIZI = AREE.length
const PREZZO_MINIMO = PREZZO_INGRESSO.web.replace('a partire da ', '').replace(' al mese', '')

const FAQ = [
  {
    q: 'Chi è Social Web Automation?',
    a: `Social Web Automation è la ditta individuale di Marco Dibenedetto, con sede a Cermenate in provincia di Como e partita IVA 03786790133. Segue ${NUMERO_SERVIZI} aree di servizio — contenuti, sito, visibilità, ricerca clienti, risposta telefonica e sistemi gestionali — per piccole e medie imprese e professionisti in Italia. Non è un software da imparare: quello che compri è il lavoro, e il pannello serve solo ad approvare e a seguire il mese.`,
  },
  {
    q: 'Con quali settori lavorate?',
    a: `Seguiamo ${SETTORI.length} categorie con un percorso costruito su misura per ognuna: ${SETTORI.slice(0, 5).map(s => s.nome.toLowerCase()).join(', ')} e altre. Ogni settore ha una pagina che dice quali servizi servono davvero in quel mestiere e quali no, perché un salone e un'impresa di pulizia hanno buchi diversi e comprare la stessa cosa non ha senso.`,
  },
  {
    q: 'Usate l’intelligenza artificiale per scrivere i contenuti?',
    a: 'Sì, dentro un processo supervisionato e dichiarato. L’AI accelera analisi e produzione, mentre obiettivi, tono del brand e via libera alla pubblicazione restano di persone: nessun contenuto raggiunge un canale senza un’approvazione, e i contenuti generati che potrebbero sembrare autentici vengono etichettati come previsto dall’AI Act.',
  },
  {
    q: 'Quanto costa iniziare?',
    a: `Si parte da ${PREZZO_MINIMO} al mese per il sito base, ${PREZZO_INGRESSO['blog-seo']} per dodici articoli e ${PREZZO_INGRESSO.social} per la gestione social su due canali. Ogni area ha il suo prezzo d'ingresso pubblico sulla pagina dei servizi, e le aree senza listino sono dichiarate come "su preventivo" invece di essere lasciate in bianco. IVA esclusa.`,
  },
  {
    q: 'Garantite risultati di posizionamento o di vendita?',
    a: 'No, e lo mettiamo per iscritto. Nessuno può garantire una posizione su Google, una citazione dai sistemi AI o un numero di clienti: chi lo promette sta vendendo una cosa che non controlla. Garantiamo il processo — che cosa produciamo, con che frequenza, chi approva e che cosa resta tuo — e i limiti sono scritti nei termini prima della firma.',
  },
  {
    q: 'Chi si occupa della parte legale su AI Act e GDPR?',
    a: 'Le valutazioni legali sono svolte dall’Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS, un professionista abilitato esterno. La consulenza è separata dai servizi di marketing e costa 150 € per 30 minuti: le informazioni pubblicate sul sito hanno finalità informativa e non sostituiscono un parere sul caso specifico.',
  },
]

const WHATSAPP_URL = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei conoscere meglio Social Web Automation e valutare un progetto.')}`

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/chi-siamo` },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: `${SITE_URL}/chi-siamo`,
  },
  twitter: {
    title: META_TITLE,
    description: META_DESCRIPTION,
  },
}

const pageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${SITE_URL}/chi-siamo#webpage`,
      url: `${SITE_URL}/chi-siamo`,
      name: META_TITLE,
      description: META_DESCRIPTION,
      inLanguage: 'it-IT',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/chi-siamo#faq`,
      mainEntity: FAQ.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Chi siamo', item: `${SITE_URL}/chi-siamo` },
      ],
    },
  ],
}

export default function ChiSiamoPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replace(/</g, '\\u003c') }}
      />

      <PublicHeader ctaHref={WHATSAPP_URL} ctaLabel="Conosciamoci" />

      <section className={styles.hero} aria-labelledby="about-title">
        <div>
          <p className={styles.eyebrow}><Building2 size={16} aria-hidden="true" /> Chi siamo</p>
          <h1 id="about-title">Un fornitore solo, per il lavoro che oggi ne richiede quattro.</h1>
          <p className={styles.lead}>
            Social Web Automation è la ditta individuale di Marco Dibenedetto, con sede a
            Cermenate, in provincia di Como. Seguiamo {NUMERO_SERVIZI} aree di servizio e {SETTORI.length} settori:
            contenuti social, sito, visibilità sui motori e dentro le risposte AI, ricerca clienti,
            risposta telefonica e i sistemi con cui un’azienda chiude il proprio lavoro. Chi cura i
            social parla con chi ha fatto il sito, perché è la stessa squadra.
          </p>
          <div className={styles.actions}>
            <Link href="/servizi" className={styles.primary}>
              Scopri servizi e prezzi <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a href={`mailto:${TITOLARE.email}`} className={styles.secondary}>
              Contattaci
            </a>
          </div>
        </div>

        <div className={styles.identity} aria-label="Dati principali Social Web Automation">
          <Image src="/brand/swa-logo-official.png" alt="Logo SWA Social Web Automation" width={260} height={119} priority />
          <dl>
            <div><dt>Impresa</dt><dd>{TITOLARE.ragioneSociale}</dd></div>
            <div><dt>Fondatore</dt><dd>Marco Dibenedetto</dd></div>
            <div><dt>Sede</dt><dd>Cermenate (CO), Italia</dd></div>
            <div><dt>P.IVA</dt><dd>{TITOLARE.partitaIva}</dd></div>
          </dl>
        </div>
      </section>

      <section className={styles.method} aria-labelledby="method-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Il nostro approccio</p>
          <h2 id="method-title">Come lavoriamo con l’AI, e dove ci fermiamo</h2>
          <p>
            L’intelligenza artificiale accelera analisi e produzione dentro un processo
            supervisionato, e non decide nulla: obiettivi, tono del brand e via libera alla
            pubblicazione restano di persone. Otto passaggi della nostra catena si fermano
            finché qualcuno non guarda e approva.
          </p>
        </div>
        <div className={styles.steps}>
          <article>
            <Workflow size={24} aria-hidden="true" />
            <h3>Che cosa comprende il processo</h3>
            <p>Il ciclo è uno solo, in cinque fasi e diciannove passaggi: analisi, piano, produzione, approvazione e pubblicazione, con traccia di ogni passo.</p>
          </article>
          <article>
            <ShieldCheck size={24} aria-hidden="true" />
            <h3>Chi decide che cosa esce</h3>
            <p>Decidi tu: ogni contenuto passa da un’approvazione prima di raggiungere un canale, e approvare non è pubblicare — l’invio è un secondo comando, esplicito.</p>
          </article>
          <article>
            <MessageCircle size={24} aria-hidden="true" />
            <h3>Chi risponde quando qualcosa non va</h3>
            <p>Una persona con nome, cognome e partita IVA, non un centralino. Perimetro, attività incluse, revisioni e budget pubblicitari sono dichiarati prima di partire.</p>
          </article>
        </div>
      </section>

      <section className={styles.services} aria-labelledby="expertise-title">
        <div>
          <p className={styles.eyebrow}>Competenze coordinate</p>
          <h2 id="expertise-title">Quali aree seguiamo davvero</h2>
          <p>
            Le aree sono {NUMERO_SERVIZI} e si attivano una alla volta o insieme, a partire da {PREZZO_MINIMO} al mese.
            Sono attività che di solito richiedono tre o quattro fornitori diversi: qui hanno una
            direzione sola, e quando ne aggiungi una l’analisi non si rifà da capo.
          </p>
        </div>
        <ul>
          {AREE.map(area => (
            <li key={area}><CheckCircle2 size={18} aria-hidden="true" /> {area}</li>
          ))}
        </ul>
      </section>

      <section className={styles.legal} aria-labelledby="legal-title">
        <Scale size={30} aria-hidden="true" />
        <div>
          <p className={styles.eyebrow}>Partner specialistico</p>
          <h2 id="legal-title">Consulenza AI Act e GDPR con Studio Legale BCS.</h2>
          <p>
            Per le valutazioni legali collaboriamo con l’Avv. Vincenzo Sapone,
            Cassazionista dello Studio Legale BCS. La consulenza è separata dai
            servizi di marketing e viene svolta da un professionista abilitato.
          </p>
        </div>
        <Link href="/consulenza" className={styles.secondary}>Approfondisci la consulenza</Link>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Domande frequenti</p>
          <h2 id="faq-title">Quello che chiedono prima di iniziare</h2>
        </div>
        <div className={styles.faqList}>
          {FAQ.map(item => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Valutiamo insieme il punto di partenza.</h2>
        <p>Raccontaci obiettivi, canali e attività già in corso. Ti indichiamo il perimetro più adatto senza promesse irrealistiche.</p>
        <Link href="/pacchetti" className={styles.primary}>
          Confronta i pacchetti <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
