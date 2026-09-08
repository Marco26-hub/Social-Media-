import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  Workflow,
  ClipboardCheck,
  CalendarClock,
  PhoneCall,
  Clapperboard,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
  FileCheck2,
  FileSearch,
  Globe2,
  Layers3,
  LockKeyhole,
  Megaphone,
  Newspaper,
  ScanSearch,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { PACCHETTI } from '@/lib/pacchetti'
import { PREZZO_INGRESSO } from '@/lib/prezzi-ingresso'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/site-config'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicHeader from '@/components/PublicHeader'
import SegretariaPopup from '@/components/SegretariaPopup'
import styles from './landing.module.css'
import { PREZZI } from '@/lib/prezzi-ingresso'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
    languages: { 'it-IT': SITE_URL, en: `${SITE_URL}/en`, 'x-default': SITE_URL },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
}

const WHATSAPP_NUMERO = '393477196603'
const TRIAL_MSG = 'Ciao! Vorrei richiedere un contenuto di prova gratuito di Social Web Automation.'
const CUSTOM_MSG = 'Ciao! Vorrei valutare una soluzione personalizzata per la mia azienda.'

function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(message)}`
}

const BENEFITS = [
  {
    icon: Target,
    title: 'Strategia prima dei contenuti',
    text: 'Ogni attività parte da obiettivi, pubblico e posizionamento. Il calendario editoriale segue una direzione precisa.',
  },
  {
    icon: CircleCheck,
    title: 'Controllo prima della pubblicazione',
    text: 'Verifichi i contenuti nel portale, richiedi le revisioni previste e approvi ciò che rappresenta il tuo brand.',
  },
  {
    icon: BarChart3,
    title: 'Miglioramento basato sui dati',
    text: 'Report leggibili trasformano le metriche in decisioni operative per il ciclo editoriale successivo.',
  },
]

// L'ordine in cui i servizi hanno senso, che non e' l'ordine del listino.
// Prima un posto dove far atterrare le persone, poi qualcosa che ce le porti,
// poi qualcuno che risponda quando arrivano, infine chi si ricorda di quelle
// che sono gia' passate. I prezzi vengono dalla fonte unica.
const PERCORSO = [
  {
    n: '01',
    titolo: 'Il sito, prima di tutto',
    perche:
      'Serve un posto dove far atterrare chi ti cerca, con i servizi scritti, i prezzi chiari e un modo per scriverti. Senza, ogni euro speso in contenuti porta traffico a niente. Dopo dodici mesi di canone il sito è tuo.',
    prezzo: PREZZO_INGRESSO.web,
    href: '/servizi/siti-e-commerce',
    cta: 'Come lavoriamo sui siti',
  },
  {
    n: '02',
    titolo: 'I contenuti che ci portano le persone',
    perche:
      'Un sito che nessuno visita non lavora. La gestione social è ciò che ogni settimana dà un motivo per arrivarci: piano, produzione, tua approvazione e pubblicazione su 2 canali a scelta.',
    prezzo: PREZZO_INGRESSO.social,
    href: '/servizi/gestione-social-media',
    cta: 'Come funziona la gestione social',
  },
  {
    n: '03',
    titolo: 'Qualcuno che risponde quando arrivano',
    perche:
      'Quando sito e social iniziano a portare richieste, la chiamata persa diventa lavoro perso. L’assistente risponde con il tuo listino e i tuoi orari, anche mentre hai le mani occupate, e fissa l’appuntamento.',
    prezzo: PREZZO_INGRESSO['segretaria-ai'],
    href: '/servizi/segretaria-telefonica-ai',
    cta: 'Come risponde al telefono',
  },
  {
    n: '04',
    titolo: 'Chi si ricorda di chi è già passato',
    perche:
      'Un cliente che hai già costa meno di uno nuovo. Ogni giorno il sistema legge agenda e storico, trova chi non torna da mesi e prepara il messaggio: parte solo dopo il tuo sì.',
    prezzo: PREZZO_INGRESSO['agenda-whatsapp'],
    href: '/servizi/agenda-clienti-whatsapp',
    cta: 'Come funziona l’agenda',
  },
] as const

const SERVICES = [
  {
    icon: Megaphone,
    href: '/servizi/gestione-social-media',
    title: 'Gestione social multicanale',
    text: 'Piano editoriale, contenuti, adattamento ai formati, approvazione e pubblicazione in un unico flusso.',
    items: ['Strategia e calendario mensile', 'Copy, grafiche, Reel e Short', 'Adattamento per ogni canale', 'Approvazione, pubblicazione e report'],
  },
  {
    icon: ScanSearch,
    href: '/servizi/seo-geo',
    title: 'Visibilità SEO + GEO',
    text: 'Audit, strategia, struttura e priorità per rendere sito e offerta comprensibili ai motori di ricerca e ai sistemi AI.',
    items: ['Controllo del sito e dei testi già online', 'Che cosa cercano davvero i tuoi clienti', 'Chi sei, scritto in modo che Google e le AI lo capiscano', 'Che cosa è cambiato, mese per mese'],
  },
  {
    icon: Newspaper,
    href: BLOG_SERVICE.path,
    title: BLOG_SERVICE.name,
    text: `${BLOG_SERVICE.articlesPerMonth} articoli al mese, pianificati e revisionati per costruire copertura organica con continuità.`,
    items: ['Piano editoriale mensile', 'SEO on-page, FAQ e dati strutturati', 'Controllo umano prima della pubblicazione', 'Pubblicazione collegata o consegna per CMS'],
  },
  {
    icon: Globe2,
    href: '/servizi/siti-e-commerce',
    title: 'Siti web e landing',
    text: 'Landing page semplici a partire da 19,90 € al mese. Siti più articolati ed e-commerce vengono quotati in base al progetto.',
    items: ['Architettura e messaggi di conversione', 'Sviluppo responsive e mobile-first', 'Moduli, analytics e tracciamento', 'Integrazione con social, ADS e contenuti'],
  },
  {
    icon: Clapperboard,
    href: '/servizi/video-produzione',
    title: 'Riprese video in azienda',
    text: 'Veniamo a girare dove lavori, con fotografo, luci e ottiche. Dalla stessa sessione escono video e foto.',
    items: ['Sopralluogo su spazi, luce e orari', 'Mezza giornata, materiale per settimane', 'Un volto davanti alla camera se serve', 'Scatti fotografici dalla stessa sessione'],
  },
  {
    icon: PhoneCall,
    href: '/servizi/segretaria-telefonica-ai',
    title: 'Il telefono che squilla mentre lavori',
    ancora: 'l’assistente telefonico',
    text: 'Risponde al posto tuo con il tuo listino, informa, fissa l’appuntamento e ti lascia la trascrizione.',
    items: ['Da 199 € al mese, 600 minuti inclusi', 'Dice solo cose che hai approvato', 'Passa a una persona quando serve', 'Registro delle chiamate con esito'],
  },
  {
    icon: CalendarClock,
    href: '/servizi/agenda-clienti-whatsapp',
    title: 'I clienti spariti da mesi',
    ancora: 'l’agenda e il recupero clienti',
    text: 'Ogni giorno trovi chi ricontattare, con il motivo e il messaggio già scritto. Parte solo se ci metti il sì.',
    items: ['Da 390 € al mese, 1000 invii inclusi', 'Legge agenda e storico ogni giorno', 'Messaggi pronti, mai inviati da soli', 'Spazi liberi proposti a chi è già cliente'],
  },
  {
    icon: ClipboardCheck,
    href: '/servizi/gestione-lavorazioni',
    title: 'Il lavoro che si chiude sul posto',
    ancora: 'i rapportini di lavoro',
    text: 'Per chi lavora fuori sede: checklist, foto e firma del cliente dal telefono, PDF prima di ripartire.',
    items: ['Checklist già pronta per tipo di lavoro', 'Firma dell’operatore e del cliente', 'Ore calcolate da entrata e uscita', 'Pannello con storico e approvazioni'],
  },
  {
    icon: Workflow,
    href: '/servizi/automazione-gestionali',
    title: 'Sistemi che si parlano',
    ancora: 'l’automazione dei gestionali',
    text: 'Gestionale, CRM, moduli e archivio smettono di richiedere lo stesso dato tre volte.',
    items: ['Analisi dei flussi prima del codice', 'Integrazioni sui sistemi esistenti', 'Registro delle esecuzioni e degli errori', 'Sviluppo su misura solo dove serve'],
  },
  {
    icon: Target,
    href: '/servizi/ricerca-clienti-b2b',
    title: 'Ricerca Clienti B2B',
    text: 'Un Pilot per definire il cliente ideale, analizzare fino a 30 aziende e ricevere una lista verificata e prioritaria.',
    items: ['Profilo ideale e criteri concordati', 'Fonti pubbliche tracciabili', 'Priorità motivata per ogni azienda', 'Nessun invio o cliente garantito'],
  },
]

const JOURNEY = [
  { number: '01', title: 'Farsi conoscere', text: 'Social e Blog costruiscono presenza, continuità e autorevolezza.', href: '/servizi/gestione-social-media' },
  { number: '02', title: 'Essere trovati', text: 'SEO + GEO organizza struttura, intenti, entità e priorità del sito.', href: '/servizi/seo-geo' },
  { number: '03', title: 'Convertire', text: 'Landing e siti web trasformano attenzione e traffico in azioni misurabili.', href: '/servizi/siti-e-commerce' },
  { number: '04', title: 'Trovare opportunità', text: 'Il Pilot B2B ricerca aziende in target, fonti e priorità commerciali.', href: '/servizi/ricerca-clienti-b2b' },
  { number: '05', title: 'Operare correttamente', text: 'AI Act, GDPR e controllo umano proteggono processo e responsabilità.', href: '/consulenza' },
  { number: '06', title: 'Misurare e migliorare', text: 'Report e risultati indicano cosa funziona e guidano le priorità del ciclo successivo.', href: '/metodo' },
]

const EVIDENCE = [
  { title: 'Processo social visibile', text: 'Piano, produzione, approvazione e pubblicazione sono descritti passaggio per passaggio.', href: '/metodo', label: 'Verifica il metodo' },
  { title: 'Journal pubblico', text: 'Articoli, struttura editoriale, FAQ e collegamenti mostrano concretamente l’approccio SEO + GEO.', href: '/blog', label: 'Apri il Journal' },
  { title: 'Portfolio Web reale', text: 'SILKinCOM, Studio Legale BCS e Borsieri Car Service sono progetti pubblici consultabili.', href: '/servizi/siti-e-commerce', label: 'Guarda i progetti' },
  { title: 'Pilot B2B delimitato', text: 'Che cosa ricevi, che cosa resta fuori e quanto costa: scritto prima di pagare, non dopo.', href: '/servizi/ricerca-clienti-b2b', label: 'Esamina il Pilot' },
]

const LEGAL_SERVICES = [
  {
    icon: Scale,
    title: 'Valutazione AI Act',
    text: 'Analisi del ruolo dell’azienda, delle finalità d’uso e del livello di rischio dei sistemi AI per individuare gli obblighi applicabili.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy e GDPR',
    text: 'Verifica dei flussi di dati, delle basi giuridiche, delle informative, dei fornitori e delle misure organizzative collegate all’AI.',
  },
  {
    icon: FileCheck2,
    title: 'Trasparenza dei contenuti',
    text: 'Criteri di revisione, responsabilità editoriale ed eventuale identificazione dei contenuti generati o manipolati artificialmente.',
  },
  {
    icon: LockKeyhole,
    title: 'Copyright e contratti',
    text: 'Valutazione di licenze, diritti di utilizzo, responsabilità e clausole contrattuali relative a modelli, piattaforme e contenuti.',
  },
]

const PROCESS = [
  ['01', 'Analizziamo', 'Definiamo brand, pubblico, obiettivi e canali prioritari.'],
  ['02', 'Produciamo', 'Prepariamo il piano e realizziamo contenuti coerenti per ogni piattaforma.'],
  ['03', 'Ottimizziamo', 'Dopo la tua approvazione pubblichiamo, misuriamo e miglioriamo.'],
]

const FAQ = [
  { q: 'Che cosa fate, in concreto?', a: 'Ci occupiamo del lavoro digitale che un’azienda non ha tempo di fare: i contenuti social e i video, il sito, la visibilità sui motori di ricerca, la ricerca di clienti B2B, il telefono che risponde quando sei occupato e i sistemi che tolgono passaggi manuali. Sono dieci aree: si attivano una alla volta oppure insieme, e ognuna ha il suo prezzo pubblico.' },
  { q: 'Chi ci lavora davvero?', a: 'Social Web Automation è la ditta individuale di Marco Dibenedetto, con sede a Cermenate in provincia di Como. Il lavoro è coordinato da una persona sola, con specialisti selezionati area per area: quando chiami risponde sempre la stessa persona, e quella persona conosce anche il tuo sito. Non è un centralino e non è un software da imparare.' },
  { q: 'Da quanto si parte?', a: `Il gradino più basso è il sito, ${PREZZI.web} per una landing semplice. Il blog costa ${PREZZI.blog} per dodici articoli, la ricerca clienti B2B ${PREZZI.b2b}, l’assistente telefonico ${PREZZI.voce} e la gestione social ${PREZZI.presenza}. Tutti i prezzi sono pubblici sulla pagina dei pacchetti, IVA esclusa.` },
  { q: 'In quanto tempo si vedono le prime cose?', a: 'I primi contenuti arrivano entro il primo mese di lavoro, e li vedi prima che escano. Quello che non si può promettere è quando arrivano i risultati commerciali: dipendono dal mercato, dai concorrenti e da quanto è già solida la tua presenza. Per questo garantiamo il processo e non il posizionamento.' },
  { q: 'E se non mi trovo bene?', a: 'Il rinnovo è mensile e non ci sono vincoli di durata nascosti: si disdice per il periodo successivo. I contenuti prodotti restano tuoi, gli account social sono sempre stati tuoi, e dopo dodici mesi di canone il sito diventa di tua proprietà. Perimetro, costi esclusi e modalità di uscita sono scritti prima della firma.' },
  { q: 'Posso vedere come lavorate prima di pagare?', a: 'Sì. Richiedi un contenuto di prova gratuito: lo produciamo sul tuo caso reale, così valuti tono, qualità e metodo su qualcosa che riguarda la tua attività invece che su un portfolio di altri. Da lì si decide se ha senso andare avanti.' },
]

// La home mostra sei domande: senza FAQPage restano testo qualsiasi per un
// motore di risposta, che e' il posto in cui oggi si viene citati.
const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [{
  '@type': 'WebPage',
  '@id': `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: SITE_TITLE,
  description: SITE_DESCRIPTION,
  inLanguage: 'it-IT',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  primaryImageOfPage: { '@id': `${SITE_URL}/#logo` },
  }, {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: FAQ.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }],
}

export default function LandingPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>

      <PublicHeader ctaHref={waLink(TRIAL_MSG)} ctaLabel="Richiedi una prova" />

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><Sparkles size={16} aria-hidden="true" /> Servizi digitali integrati per PMI</p>
          <h1 id="hero-title">Tutto il digitale della tua azienda, un interlocutore solo.</h1>
          <p className={styles.heroLead}>
            Ci occupiamo di quello che oggi affideresti a tre o quattro fornitori diversi:
            i contenuti, il sito, la visibilità sui motori, il telefono che risponde quando
            sei occupato. Tu approvi prima che esca qualcosa, e quando serve una risposta
            sai già chi chiamare.
          </p>
          <div className={styles.heroActions}>
            <Link href="/servizi" className={styles.primaryButton}>
              Trova la soluzione <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a href={waLink(TRIAL_MSG)} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>Richiedi una prova social</a>
          </div>
          <p className={styles.microcopy}>Servizi autonomi o coordinati. Perimetro, costi e responsabilità dichiarati prima dell’avvio.</p>
          <ul className={styles.trustList} aria-label="Caratteristiche principali">
            <li><Check size={16} aria-hidden="true" /> Approvazione prima della pubblicazione</li>
            <li><Check size={16} aria-hidden="true" /> Nessun software complesso da gestire</li>
            <li><Check size={16} aria-hidden="true" /> In Brianza di persona, in Italia da remoto</li>
          </ul>
        </div>

        <div className={styles.productVisual} aria-label="Anteprima del flusso di approvazione">
          <div className={styles.visualTop}>
            <div>
              <span className={styles.visualLabel}>Piano editoriale</span>
              <strong>Luglio 2026</strong>
            </div>
            <span className={styles.liveStatus}><i /> Operativo</span>
          </div>
          <div className={styles.visualStats}>
            <div><span>Contenuti</span><strong>32</strong><small>questo mese</small></div>
            <div><span>Da approvare</span><strong>4</strong><small>entro venerdì</small></div>
            <div><span>Canali</span><strong>2</strong><small>coordinati</small></div>
          </div>
          <div className={styles.contentPreview}>
            <div className={styles.previewMedia}>
              <Bot size={28} aria-hidden="true" />
              <span>Visual coordinato</span>
            </div>
            <div className={styles.previewCopy}>
              <span className={styles.channelBadge}>Instagram · Carosello</span>
              <strong>Una comunicazione coerente, dal primo contatto.</strong>
              <p>Testo adattato al tono del brand, con obiettivo e invito all’azione definiti.</p>
              <div className={styles.previewActions}>
                <span>Richiedi modifica</span>
                <b><CircleCheck size={15} aria-hidden="true" /> Approva</b>
              </div>
            </div>
          </div>
          <div className={styles.visualFlow} aria-hidden="true">
            <span className={styles.flowDone}>Strategia</span>
            <span className={styles.flowDone}>Produzione</span>
            <span className={styles.flowActive}>Approvazione</span>
            <span>Pubblicazione</span>
          </div>
        </div>
      </section>

      <section className={styles.journeySection} aria-labelledby="journey-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Dal primo contatto alla vendita</p>
          <h2 id="journey-title">Come una richiesta diventa un cliente</h2>
          <p>Ogni servizio ha un compito preciso. Puoi attivarlo da solo oppure inserirlo in un sistema coordinato.</p>
        </div>
        <ol className={styles.journeyGrid}>
          {JOURNEY.map(item => (
            <li key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link href={item.href} aria-label={`Approfondisci: ${item.title}`}><ChevronRight size={17} aria-hidden="true" /></Link>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.signalBand} aria-label="Posizionamento del servizio">
        <p>Un partner operativo per PMI, attività locali e professionisti.</p>
        <div>
          <span>Strategia</span><span>Produzione</span><span>Controllo</span><span>Misurazione</span>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="benefit-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Il lavoro di ogni mese</p>
          <h2 id="benefit-title">Che cosa esce ogni mese, e chi lo decide</h2>
        </div>
        <div className={styles.benefitGrid}>
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <article key={title} className={styles.benefit}>
              <Icon size={23} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Il percorso.
          Il sito elencava dieci servizi in fila, senza dire da dove si parte
          ne' perche' una cosa venga prima di un'altra. Un titolare che arriva
          qui non deve scegliere fra dieci voci: deve capire il primo passo. */}
      <section id="percorso" className={styles.section} aria-labelledby="percorso-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Da dove si parte</p>
          <h2 id="percorso-title">Quattro passi, in quest’ordine.</h2>
          <p>
            Non serve attivare tutto insieme. Ogni passo ha senso perché regge quello
            dopo, e si può fermare dove serve: nessun vincolo di durata oltre a quello
            scritto nel piano.
          </p>
        </div>
        <ol className={styles.percorso}>
          {PERCORSO.map(({ n, titolo, perche, prezzo, href, cta }) => (
            <li key={n}>
              <span className={styles.percorsoNumero}>{n}</span>
              <h3>{titolo}</h3>
              <p>{perche}</p>
              <p className={styles.percorsoPrezzo}>{prezzo}</p>
              <Link href={href}>{cta} <ChevronRight size={15} aria-hidden="true" /></Link>
            </li>
          ))}
        </ol>
      </section>

      <section id="servizi" className={`${styles.section} ${styles.sectionTint}`} aria-labelledby="services-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Che cosa facciamo</p>
          <h2 id="services-title">Tutto quello che possiamo aggiungere dopo</h2>
          <p>Riduciamo frammentazione, passaggi tra fornitori e attività operative interne.</p>
        </div>
        <div className={styles.serviceGrid}>
          {SERVICES.map(({ icon: Icon, href, title, text, items, ancora }) => (
            <article key={title} className={styles.service}>
              <span><Icon size={22} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <ul className={styles.serviceList}>
                {items.map(item => <li key={item}><Check size={15} aria-hidden="true" /> {item}</li>)}
              </ul>
              <Link href={href}>Come funziona: {ancora ?? title} <ChevronRight size={16} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section id="metodo" className={styles.section} aria-labelledby="process-title">
        <div className={styles.processLayout}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Come lavoriamo</p>
            <h2 id="process-title">Come lavoriamo, passo per passo</h2>
            <p>Un ciclo mensile trasparente mantiene il lavoro ordinato e rende ogni decisione verificabile.</p>
          </div>
          <ol className={styles.processList}>
            {PROCESS.map(([number, title, text]) => (
              <li key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </li>
            ))}
          </ol>
          <Link href="/metodo" className={styles.outlineButton}>Scopri il metodo completo <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.evidenceSection}`} aria-labelledby="evidence-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Prove verificabili</p>
          <h2 id="evidence-title">Controlla il lavoro prima di credere alle promesse.</h2>
          <p>Niente percentuali senza fonte: mostriamo processi, contenuti, progetti pubblici e limiti dell’offerta.</p>
        </div>
        <div className={styles.evidenceGrid}>
          {EVIDENCE.map(item => (
            <article key={item.title}>
              <CircleCheck size={21} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link href={item.href}>{item.label} <ArrowRight size={15} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section id="compliance" className={styles.compliance} aria-labelledby="compliance-title">
        <div className={styles.complianceIntro}>
          <p className={styles.eyebrow}>SEO &amp; GEO</p>
          <h2 id="compliance-title">Farsi trovare su Google e dentro le risposte AI</h2>
          <p>
            Rendiamo i contenuti più chiari per persone, motori di ricerca e sistemi
            di risposta AI, intervenendo su struttura, autorevolezza, fonti e qualità
            editoriale. L’obiettivo è costruire visibilità organica duratura e misurabile.
          </p>
        </div>
        <div className={styles.complianceItems}>
          <article><FileSearch size={21} aria-hidden="true" /><div><h3>SEO</h3><p>Struttura tecnica, contenuti e dati organizzati per favorire comprensione e indicizzazione.</p></div></article>
          <article><Layers3 size={21} aria-hidden="true" /><div><h3>GEO</h3><p>Fonti, FAQ ed entità chiare per aumentare l’utilizzabilità nei sistemi di risposta AI, senza promesse di citazione.</p></div></article>
          <article><BarChart3 size={21} aria-hidden="true" /><div><h3>Monitoraggio</h3><p>Analisi periodica di copertura, contenuti, query e opportunità per definire le priorità successive.</p></div></article>
        </div>
        <p className={styles.complianceNote}><FileSearch size={15} aria-hidden="true" /> SEO e GEO migliorano comprensione e reperibilità, senza garantire ranking o citazioni.</p>
      </section>

      <section id="legale" className={styles.legalSection} aria-labelledby="legal-title">
        <div className={styles.legalHeading}>
          <div>
            <p className={styles.eyebrow}>Consulenza legale AI &amp; Compliance</p>
            <h2 id="legal-title">AI Act e GDPR: chi risponde di che cosa</h2>
          </div>
          <div>
            <p>
              Affianchiamo imprese e professionisti nell’adozione responsabile
              dell’intelligenza artificiale. Le attività legali vengono svolte
              con professionisti abilitati e definite in base al caso concreto.
            </p>
          </div>
        </div>
        <div className={styles.legalGrid}>
          {LEGAL_SERVICES.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={22} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className={styles.legalPartner}>
          <div className={styles.legalPartnerMark} aria-hidden="true">BCS</div>
          <div className={styles.legalPartnerCopy}>
            <span>Partner legale</span>
            <h3>Studio Legale BCS</h3>
            <p>Avv. Vincenzo Sapone, Cassazionista · Diritto delle nuove tecnologie, GDPR e AI Act</p>
            <ul>
              <li><Check size={14} aria-hidden="true" /> Analisi del caso durante la call</li>
            </ul>
          </div>
          <div className={styles.legalPrice}>
            <span>Consulenza individuale</span>
            <strong>€150<small>/30 min</small></strong>
          </div>
          <Link href="/consulenza" className={styles.legalPartnerCta}>
            Prenota la consulenza <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <p className={styles.legalDisclaimer}>
          La sezione ha finalità informativa e non sostituisce una consulenza legale.
          Ambito, documenti e adempimenti vengono definiti dopo una valutazione professionale.
        </p>
      </section>

      <section id="prezzi" className={styles.pricingSection} aria-labelledby="pricing-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Soluzioni</p>
          <h2 id="pricing-title">Quanto costa iniziare</h2>
          <p>Due pacchetti social e tre servizi autonomi: Blog SEO + GEO, Sito Web Base e Ricerca Clienti B2B.</p>
        </div>
        <div className={styles.pricingGrid}>
          {PACCHETTI.map(plan => (
            <article key={plan.slug} className={`${styles.priceCard} ${plan.consigliato ? styles.featuredPlan : ''}`}>
              <div className={styles.priceTop}>
                <div>
                  <span className={styles.planAudience}>{plan.eyebrow}</span>
                  <h3>{plan.nome}</h3>
                </div>
                {plan.consigliato && <span className={styles.planBadge}>Più scelto</span>}
              </div>
              <p className={styles.planResult}>{plan.risultato}</p>
              <p className={styles.price}><strong>{plan.prezzo}</strong><span>/mese</span></p>
              <p className={styles.setup}>{plan.setup === 'Setup incluso' ? plan.setup : `${plan.setup} una tantum`}</p>
              <p className={styles.listLabel}>In sintesi</p>
              <ul>
                {plan.sintesi.map(voce => <li key={voce}><Check size={16} aria-hidden="true" /> {voce}</li>)}
              </ul>
              <Link href={`/register?piano=${plan.slug}`} className={plan.consigliato ? styles.primaryButton : styles.outlineButton}>
                {plan.cta} <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <p className={styles.planDetailLink}>
                <Link href="/pacchetti">Voce per voce, che cosa comprende</Link>
              </p>
              <small className={styles.ctaNote}>Setup incluso · IVA esclusa · rinnovo mensile</small>
            </article>
          ))}
        </div>
        <div className={styles.standaloneGrid} aria-label="Servizi autonomi">
          <article className={styles.standaloneOffer}>
            <div className={styles.standaloneIcon}><Newspaper size={22} aria-hidden="true" /></div>
            <div className={styles.standaloneCopy}>
              <span>Contenuti organici</span>
              <h3>{BLOG_SERVICE.name}</h3>
              <p>{BLOG_SERVICE.articlesPerMonth} articoli al mese con piano editoriale, SEO, GEO, FAQ e controllo umano.</p>
              <ul>
                <li><Check size={15} aria-hidden="true" /> {BLOG_SERVICE.trialDays} giorni per valutare il servizio</li>
                <li><Check size={15} aria-hidden="true" /> Pubblicazione sul blog collegato o consegna per CMS</li>
              </ul>
            </div>
            <div className={styles.standaloneAction}>
              <p><strong>{BLOG_SERVICE.displayPrice}</strong><span>/mese</span></p>
              <Link href={BLOG_SERVICE.path}>Scopri Blog <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
          <article className={`${styles.standaloneOffer} ${styles.webOffer}`}>
            <div className={styles.standaloneIcon}><Globe2 size={22} aria-hidden="true" /></div>
            <div className={styles.standaloneCopy}>
              <span>Presenza proprietaria</span>
              <h3>Sito Web Base</h3>
              <p>Landing page o sito aziendale mobile-first collegato a contenuti, campagne e analytics. E-commerce su preventivo.</p>
              <ul>
                <li><Check size={15} aria-hidden="true" /> Architettura, design responsive e SEO tecnica</li>
                <li><Check size={15} aria-hidden="true" /> Dopo 12 mesi di canone, il sito è tuo</li>
                <li><Check size={15} aria-hidden="true" /> Il prezzo base riguarda una landing semplice</li>
              </ul>
            </div>
            <div className={styles.standaloneAction}>
              <p><small>a partire da</small><strong>€19,90</strong><span>/mese</span></p>
              <Link href="/servizi/siti-e-commerce">Scopri Web <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
          <article className={`${styles.standaloneOffer} ${styles.leadOffer}`}>
            <div className={styles.standaloneIcon}><Target size={22} aria-hidden="true" /></div>
            <div className={styles.standaloneCopy}>
              <span>Ricerca commerciale assistita</span>
              <h3>Ricerca Clienti B2B</h3>
              <p>Un Pilot per definire il cliente ideale, analizzare fino a 30 aziende e ricevere una lista verificata e prioritaria.</p>
              <ul>
                <li><Check size={15} aria-hidden="true" /> Fonti pubbliche tracciabili e criteri concordati</li>
                <li><Check size={15} aria-hidden="true" /> Nessun invio automatico o risultato commerciale garantito</li>
              </ul>
            </div>
            <div className={styles.standaloneAction}>
              <p><strong>€149</strong><span>una tantum</span></p>
              <Link href="/servizi/ricerca-clienti-b2b">Scopri il Pilot <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
        </div>
        <div className={styles.pricingAssurance}>
          <div><CircleCheck size={18} aria-hidden="true" /><span><strong>Prima vuoi verificare la qualità?</strong> Richiedi un contenuto di prova gratuito.</span></div>
          <a href={waLink(TRIAL_MSG)} target="_blank" rel="noopener noreferrer">Richiedi la prova <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        <Link href="/pacchetti" className={styles.outlineButton}>Confronto completo dei pacchetti <ArrowRight size={16} aria-hidden="true" /></Link>
        <div className={styles.customPlan}>
          <div>
            <span className={styles.planAudience}>E-commerce, agenzie e organizzazioni</span>
            <h3>Una configurazione costruita sui tuoi processi.</h3>
            <p>Più brand, volumi elevati, ADS, video, e-commerce, automazioni, integrazioni e supporto dedicato.</p>
          </div>
          <a href={waLink(CUSTOM_MSG)} target="_blank" rel="noopener noreferrer" className={styles.darkButton}>
            Progettiamo la soluzione <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="faq" className={styles.faqSection} aria-labelledby="faq-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Domande frequenti</p>
          <h2 id="faq-title">Le domande che ci fanno prima di firmare</h2>
        </div>
        <div className={styles.faqList}>
          {FAQ.map(item => (
            <details key={item.q}>
              <summary>{item.q}<span aria-hidden="true">+</span></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <Link href="/faq" className={styles.outlineButton}>Consulta tutte le domande frequenti <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-title">
        <p className={styles.eyebrow}>Valuta il metodo</p>
        <h2 id="final-title">Inizia da un contenuto, non da una promessa.</h2>
        <p>Condividi il tuo brand e ricevi una prova concreta del nostro approccio editoriale.</p>
        <a href={waLink(TRIAL_MSG)} target="_blank" rel="noopener noreferrer" className={styles.lightButton}>
          Richiedi il contenuto di prova <ArrowRight size={18} aria-hidden="true" />
        </a>
      </section>

      <footer className={styles.footer}>
        <Link href="/" className={styles.brand}>
          <Image className={styles.brandLogo} src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} />
          <span>Social Web Automation</span>
        </Link>
        <div>
          <Link href="/servizi">Servizi</Link>
          <Link href="/chi-siamo">Chi siamo</Link>
          <Link href="/blog">Journal</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/termini">Termini</Link>
          <Link href="/login">Accesso</Link>
        </div>
        <p>
          © 2026 {TITOLARE.brand}<br />
          {TITOLARE.ragioneSociale} · P.IVA {TITOLARE.partitaIva}<br />
          Sede a Cermenate (CO) · Servizi in Italia e nel mondo
        </p>
      </footer>

      <a href={waLink(TRIAL_MSG)} target="_blank" rel="noopener noreferrer" className={styles.mobileCta}>
        Richiedi una prova <ArrowRight size={17} aria-hidden="true" />
      </a>
      <FloatingNavigation />
      <SegretariaPopup />
    </main>
  )
}
