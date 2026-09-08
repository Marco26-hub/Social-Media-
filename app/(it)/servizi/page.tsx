import { anteprimaOg } from '@/lib/anteprima'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Zap,
  Check,
  CircleCheck,
  FileCheck2,
  FileSearch,
  Globe2,
  Layers3,
  LockKeyhole,
  Megaphone,
  MessageCircle,
  Newspaper,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
} from 'lucide-react'
import { PACCHETTI } from '@/lib/pacchetti'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { TITOLARE } from '@/lib/legal-config'
import { prezzoIngresso } from '@/lib/prezzi-ingresso'
import { SITE_URL } from '@/lib/site-config'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicHeader from '@/components/PublicHeader'
import site from '@/styles/landing.module.css'
import styles from './servizi-v2.module.css'
import { PREZZI } from '@/lib/prezzi-ingresso'
import { metodoServizio } from '@/lib/metodo'

const META_TITLE = 'Servizi Digitali per PMI: Social, SEO, Web e Lead | SWA'
const META_DESCRIPTION =
  'Servizi digitali integrati per PMI: gestione social, strategia SEO + GEO, Blog con 12 articoli, siti, e-commerce, ricerca clienti B2B e compliance AI.'

const WHATSAPP_NUMERO = '393477196603'
const EMAIL_CONTATTO = 'swsdautomation@gmail.com'

function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(message)}`
}

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/servizi`,
    languages: { 'it-IT': `${SITE_URL}/servizi`, en: `${SITE_URL}/en/services`, 'x-default': `${SITE_URL}/servizi` },
  },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: `${SITE_URL}/servizi`,
  images: anteprimaOg('/servizi'),
   type: 'website',},
  twitter: {
    title: META_TITLE,
    description: META_DESCRIPTION,
  },
}

const FAQ = [
  { q: 'Da quale area conviene partire?', a: 'Dipende da dove perdi di più oggi. Se il telefono squilla a vuoto si parte da lì, perché una chiamata persa è lavoro perso subito. Se il problema è che nessuno ti trova, si parte da sito e visibilità. Se hai già clienti ma non tornano, dal recupero contatti. Durante la call guardiamo insieme quale buco costa di più e si comincia da quello.' },
  { q: 'Posso attivare un servizio solo?', a: 'Sì, ogni area funziona da sola e ha il suo prezzo d’ingresso. Metterle insieme conviene quando si alimentano a vicenda — le riprese danno materiale al piano social, il blog nutre la visibilità — ma nessuna richiede le altre per funzionare. Quando ne aggiungi una l’analisi non si rifà da capo: si estende quella già fatta.' },
  { q: 'Che differenza c’è fra SEO + GEO e il servizio Blog?', a: `SEO + GEO è il lavoro di analisi e struttura: audit, mappa degli intenti di ricerca, dati strutturati e priorità. Dice che cosa cambiare e in quale ordine. Il servizio Blog è la produzione continuativa: dodici articoli al mese a ${PREZZI.blog}, scritti e revisionati. Il primo decide la rotta, il secondo cammina.` },
  { q: 'Che differenza c’è fra segretaria telefonica e agenda WhatsApp?', a: 'Coprono due buchi diversi. La segretaria telefonica risponde a chi ti chiama e non trova nessuno, da 199 € al mese. Agenda e WhatsApp si occupa di chi non ti chiama più: legge lo storico, segnala chi ricontattare e prepara i messaggi, da 390 € al mese. Chi confonde i due problemi compra il servizio sbagliato.' },
  { q: 'Posso cambiare piano dopo?', a: 'Sì, e senza rifare la configurazione. Sui piani vocali si sale di scaglione quando i minuti non bastano più; sui piani social si passa da Presenza a Crescita mantenendo profilo, tono e materiali già impostati. Il cambio vale dal periodo di fatturazione successivo.' },
  { q: 'Quali aree non hanno un prezzo pubblico, e perché?', a: 'SEO + GEO, gestione lavorazioni e automazione dei gestionali sono su preventivo, perché il costo dipende da cose che cambiano molto: quanti sistemi vanno collegati, quanti operatori usano l’applicazione, quanto è grande il sito da rivedere. Le riprese video hanno invece quattro pacchetti a prezzo pubblico, da 590 a 1.790 €. Il preventivo arriva sempre prima di iniziare e nessuna lavorazione fuori piano genera un costo senza il tuo via libera.' },
]

const servicesPageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    {
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/servizi#webpage`,
      url: `${SITE_URL}/servizi`,
      name: META_TITLE,
      description: META_DESCRIPTION,
      inLanguage: 'it-IT',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      mainEntity: {
        '@type': 'ItemList',
        name: 'Servizi Social Web Automation',
        itemListElement: [
          { '@type': 'ListItem', position: 1, item: { '@id': `${SITE_URL}/#social-media-management` } },
          { '@type': 'ListItem', position: 2, item: { '@id': `${SITE_URL}/#digital-growth` } },
          { '@type': 'ListItem', position: 3, item: { '@id': `${SITE_URL}/#blog-service` } },
          { '@type': 'ListItem', position: 4, item: { '@id': `${SITE_URL}/#web-development` } },
          { '@type': 'ListItem', position: 5, item: { '@id': `${SITE_URL}/#lead-research-pilot` } },
          { '@type': 'ListItem', position: 6, item: { '@id': `${SITE_URL}/#legal-ai-consulting` } },
        ],
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Servizi', item: `${SITE_URL}/servizi` },
      ],
    },
  ],
}

const SERVICES = [
  {
    ...metodoServizio('gestione-social-media'),
    id: 'social',
    title: 'Una presenza costante, coordinata e sotto controllo.',
    description:
      'Gestiamo l’intero ciclo editoriale: dalla strategia alla produzione, fino all’approvazione e alla pubblicazione. Ogni canale mantiene il proprio linguaggio senza perdere coerenza con il brand.',
    included: [
      'Audit del brand, pubblico e posizionamento',
      'Piano editoriale mensile e rubriche',
      'Copy, caroselli, grafiche, Reel e Short',
      'Adattamento per ogni piattaforma',
      'Portale di approvazione e revisioni tracciate',
      'Programmazione, pubblicazione e report',
    ],
    strumento: { nome: 'Portale di approvazione', beneficio: 'Vedi i contenuti nel formato reale del canale e approvi dal telefono: niente file avanti e indietro via email.' },
    outcome: 'Meno attività operative interne e una comunicazione riconoscibile ogni settimana.',
  },
  {
    ...metodoServizio('seo-geo'),
    id: 'seo-geo',
    title: 'Contenuti progettati per essere trovati e compresi.',
    description:
      'Analizziamo e miglioriamo struttura tecnica, architettura informativa, intenti e segnali di autorevolezza. Qui si definisce la strategia organica; la produzione continuativa degli articoli appartiene al servizio Blog.',
    included: [
      'Audit tecnico ed editoriale del sito',
      'Architettura dei contenuti e keyword intent',
      'Priorità per pagine, FAQ e dati strutturati',
      'Entità, fonti e segnali di autorevolezza',
      'Analisi della citabilità nei sistemi AI',
      'Monitoraggio e priorità di miglioramento',
    ],
    strumento: { nome: 'Punteggio di citabilità', beneficio: 'Ogni blocco viene misurato su cinque criteri e torna con le correzioni già scritte, invece di un elenco di buoni consigli.' },
    outcome: 'Una base organica più solida, utile nel tempo e misurabile senza promesse di ranking.',
  },
  {
    ...metodoServizio('blog-seo'),
    id: 'blog-seo',
    title: 'Dodici articoli al mese, con una direzione editoriale precisa.',
    description:
      'Trasformiamo servizi, competenze e domande reali del pubblico in un calendario di articoli SEO + GEO, controllati prima della pubblicazione.',
    included: [
      '12 articoli completi ogni mese',
      'Piano editoriale basato sugli intenti di ricerca',
      'Title, meta description e collegamenti interni',
      'FAQ visibili e dati strutturati',
      'Revisione umana prima della pubblicazione',
      'Blog collegato o consegna pronta per CMS',
    ],
    strumento: { nome: 'Dodici articoli pronti', beneficio: 'Arrivano con title, meta description, FAQ e dati strutturati: si pubblicano sul blog collegato o si esportano per il CMS.' },
    outcome: 'Un patrimonio editoriale continuo che amplia copertura organica e autorevolezza.',
  },
  {
    ...metodoServizio('siti-e-commerce'),
    id: 'web',
    title: 'Un’esperienza digitale costruita per il contatto.',
    description:
      'Landing page semplici a partire da 19,90 € al mese. Siti più articolati ed e-commerce vengono quotati in base al progetto.',
    included: [
      'Architettura informativa e messaggi',
      'Design responsive e mobile-first',
      'Landing page e percorsi di conversione',
      'E-commerce su preventivo separato',
      'Analytics, eventi e tracciamento',
      'Integrazione con social, ADS e CRM',
    ],
    strumento: { nome: 'Il sito diventa tuo', beneficio: 'Dopo dodici mesi di canone la proprieta passa a te, con moduli e statistiche di percorso già collegati.' },
    outcome: 'Un punto di arrivo credibile per trasformare attenzione, traffico e campagne in richieste.',
  },
  {
    ...metodoServizio('video-produzione'),
    id: 'video-produzione',
    title: 'La materia prima girata dove lavori, non cercata negli archivi.',
    description:
      'Veniamo in sede con fotografo, luci, microfoni e ottiche e giriamo a blocchi: dalla stessa sessione escono il girato verticale per i social e gli scatti per sito e annunci.',
    included: [
      'Sopralluogo su spazi, luce e orari',
      'Riprese a blocchi, mezza giornata o giornata intera',
      'Un volto davanti alla camera, se serve',
      'Scatti fotografici dalla stessa sessione',
      'Montaggio e sottotitoli nel piano attivo',
      'Materiale riutilizzabile per settimane',
    ],
    strumento: { nome: 'Una sessione, settimane di uscite', beneficio: 'Mezza giornata di riprese alimenta il calendario per settimane: non si organizza un set per ogni contenuto.' },
    outcome: 'Contenuti girati dove lavori davvero, invece di materiale generico preso altrove.',
  },
  {
    ...metodoServizio('ricerca-clienti-b2b'),
    id: 'lead-b2b',
    title: 'Aziende in target, fonti verificabili e priorità operative.',
    description:
      'Definiamo il profilo cliente ideale, analizziamo fino a 30 aziende e consegniamo una lista qualificata. Il Pilot riguarda ricerca e verifica: non invia messaggi automatici e non promette appuntamenti.',
    included: [
      'Profilo cliente ideale e criteri di esclusione',
      'Ricerca fino a 30 aziende coerenti',
      'Fonti pubbliche tracciabili',
      'Motivazione e priorità per ogni azienda',
      'Pulizia di duplicati e profili fuori target',
      'Consegna strutturata per valutazione o CRM',
    ],
    strumento: { nome: 'Lista con la fonte a fianco', beneficio: 'Ogni azienda porta il motivo e la fonte pubblica da cui l’abbiamo presa: si controlla in un minuto invece di fidarsi.' },
    outcome: 'Una base commerciale ordinata per decidere chi approfondire, senza confondere una lista con una vendita garantita.',
  },
  {
    ...metodoServizio('segretaria-telefonica-ai'),
    id: 'segretaria-ai',
    title: 'Risponde al telefono, fissa appuntamenti e riempie l’agenda.',
    description:
      'Per le attività che lavorano su appuntamento. Risponde alle chiamate quando non puoi, prenota negli orari liberi e prepara i messaggi per recuperare chi non torna. I messaggi partono solo dopo la tua approvazione.',
    included: [
      'Risposta telefonica in italiano e inglese',
      'Informazioni, prezzi e regole definiti da te',
      'Prenotazioni, spostamenti e disdette',
      'Recupero clienti e orari rimasti liberi',
      'Messaggi WhatsApp in bozza, approvati prima dell’invio',
      'Consenso, opt-out e tracciamento delle risposte',
    ],
    strumento: { nome: 'Registro delle chiamate', beneficio: 'Trascrizione ed esito di ogni telefonata: si legge in trenta secondi invece di riascoltare la segreteria.' },
    outcome: 'Meno chiamate perse e meno orari vuoti, senza che nulla raggiunga un cliente senza il tuo controllo.',
  },
  {
    ...metodoServizio('agenda-clienti-whatsapp'),
    id: 'agenda-whatsapp',
    title: 'I clienti che non tornano non sono persi, sono da richiamare.',
    description:
      'Il sistema legge agenda e storico, trova chi manca da troppo tempo e chi può coprire un orario rimasto libero, e prepara il messaggio WhatsApp. Parte solo dopo la tua approvazione.',
    included: [
      'Controllo giornaliero di clienti, appuntamenti e spazi liberi',
      'Elenco delle priorità con il motivo di ogni proposta',
      'Messaggi personali pronti, approvati prima dell’invio',
      'Consenso e opt-out registrati',
      'Risposte e appuntamenti recuperati tracciati',
      '1000 invii inclusi al mese',
    ],
    strumento: { nome: 'Messaggi pronti in bozza', beneficio: 'Ogni giorno trovi chi ricontattare con il motivo, e il messaggio già scritto: resta solo da approvare.' },
    outcome: 'Il valore che hai già in archivio torna a produrre appuntamenti, senza che nulla parta alle tue spalle.',
  },
  {
    ...metodoServizio('gestione-lavorazioni'),
    id: 'gestione-lavorazioni',
    title: 'Il lavoro si chiude sul posto, l’ufficio approva.',
    description:
      'Per chi lavora fuori sede: il sito che porta le richieste, l’applicazione con cui la squadra chiude l’intervento sul telefono e il pannello da cui l’ufficio approva o contesta.',
    included: [
      'Checklist già pronta per tipo di intervento',
      'Foto e note sulle anomalie dal telefono',
      'Ore calcolate da entrata, uscita e pausa',
      'Firma dell’operatore e del cliente',
      'PDF inviato via email o Telegram',
      'Pannello con storico, filtri e approvazioni',
    ],
    strumento: { nome: 'Rapporto firmato sul posto', beneficio: 'Il cliente riceve il PDF prima che la squadra risalga in furgone: niente fogli da ricopiare in ufficio.' },
    outcome: 'Una contestazione si chiude con un documento, non con una telefonata da ricostruire.',
  },
  {
    ...metodoServizio('automazione-gestionali'),
    id: 'automazione',
    title: 'I sistemi che già usi, collegati e senza passaggi manuali.',
    description:
      'Gestionale, CRM, e-commerce, moduli e analytics spesso non si parlano. Colleghiamo quei sistemi e togliamo le operazioni che si ripetono. Quando lo strumento standard non basta, lo sviluppiamo su misura.',
    included: [
      'Analisi dei flussi e dei dati duplicati',
      'Integrazioni tra gestionale, CRM ed e-commerce',
      'Automazione delle operazioni ricorrenti',
      'Sviluppo su misura quando serve davvero',
      'Registro delle esecuzioni e degli errori',
      'Attività e costi definiti prima di partire',
    ],
    strumento: { nome: 'Registro delle esecuzioni', beneficio: 'Ogni passaggio automatico lascia traccia, errori compresi: un guasto notturno si rilancia dal punto che ha ceduto.' },
    outcome: 'Gli stessi dati smettono di essere reinseriti a mano, e ogni passaggio automatico resta tracciabile.',
  },
]

const LEGAL_SERVICES = [
  {
    icon: Scale,
    title: 'Valutazione AI Act',
    text: 'Analisi di ruolo, finalità e rischio dei sistemi AI per individuare gli obblighi applicabili.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy e GDPR',
    text: 'Flussi di dati, basi giuridiche, informative, fornitori e misure organizzative.',
  },
  {
    icon: FileCheck2,
    title: 'Trasparenza AI',
    text: 'Revisione, responsabilità editoriale ed eventuale identificazione dei contenuti artificiali.',
  },
  {
    icon: LockKeyhole,
    title: 'Copyright e contratti',
    text: 'Licenze, diritti di utilizzo, responsabilità e clausole per modelli, contenuti e piattaforme.',
  },
]

const METHOD = [
  ['01', 'Analisi', 'Obiettivi, offerta, pubblico, canali e capacità operative.'],
  ['02', 'Direzione', 'Priorità, posizionamento, calendario e indicatori da misurare.'],
  ['03', 'Produzione', 'Contenuti, visual, pagine e campagne coordinati.'],
  ['04', 'Controllo', 'Approvazione, pubblicazione, report e ottimizzazione.'],
]


export default function ServiziPage() {
  return (
    <main id="main-content" className={`${site.page} ${styles.page}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesPageJsonLd).replace(/</g, '\\u003c') }}
      />
      <a className={site.skipLink} href="#main-content">Vai al contenuto</a>

      <PublicHeader
        ctaHref={waLink('Ciao! Vorrei capire quale servizio Social Web Automation è adatto alla mia azienda.')}
        ctaLabel="Richiedi una consulenza"
      />

      <section className={styles.hero} aria-labelledby="services-hero-title">
        <div className={styles.heroCopy}>
          <p className={site.kicker}><Sparkles size={16} aria-hidden="true" /> Servizi digitali integrati</p>
          <h1 id="services-hero-title">Social, SEO, siti e ricerca clienti in un’unica regia digitale.</h1>
          <p>
            Costruiamo attenzione con social e Blog, rendiamo l’azienda reperibile
            con SEO + GEO, convertiamo sul sito e qualifichiamo nuove opportunità
            B2B. Compliance e controllo umano proteggono l’intero processo.
          </p>
          <div className={site.heroActions}>
            <a
              href={waLink('Ciao! Vorrei una consulenza sui servizi Social Web Automation.')}
              target="_blank"
              rel="noopener noreferrer"
              className={site.primaryButton}
            >
              Parliamo del progetto <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href="#servizi" className={site.secondaryButton}>Esplora i servizi</a>
          </div>
          <ul className={styles.heroProof}>
            <li><Check size={16} aria-hidden="true" /> Servizio gestito</li>
            <li><Check size={16} aria-hidden="true" /> Approvazione umana</li>
            <li><Check size={16} aria-hidden="true" /> Attività e costi dichiarati</li>
          </ul>
        </div>

        <div className={styles.serviceMap} aria-label="Ecosistema dei servizi Social Web Automation">
          <div className={styles.mapCore}>
            <span>SWA</span>
            <strong>Regia digitale</strong>
            <small>Strategia e controllo</small>
          </div>
          <div className={`${styles.mapNode} ${styles.mapNodeSocial}`}>
            <Megaphone size={19} aria-hidden="true" />
            <span>Social</span>
          </div>
          <div className={`${styles.mapNode} ${styles.mapNodeSeo}`}>
            <FileSearch size={19} aria-hidden="true" />
            <span>SEO + GEO</span>
          </div>
          <div className={`${styles.mapNode} ${styles.mapNodeBlog}`}>
            <Newspaper size={19} aria-hidden="true" />
            <span>Blog</span>
          </div>
          <div className={`${styles.mapNode} ${styles.mapNodeWeb}`}>
            <ShoppingBag size={19} aria-hidden="true" />
            <span>Web + Shop</span>
          </div>
          <div className={`${styles.mapNode} ${styles.mapNodeLead}`}>
            <Target size={19} aria-hidden="true" />
            <span>Lead B2B</span>
          </div>
          <div className={styles.mapStatus}><i /> Sistema operativo mensile</div>
        </div>
      </section>

      <section className={styles.valueBand} aria-label="Valore del servizio">
        <span>Farsi conoscere</span>
        <span>Essere trovati</span>
        <span>Convertire</span>
        <span>Trovare opportunità</span>
        <span>Operare correttamente</span>
      </section>

      <section id="servizi" className={styles.servicesSection} aria-labelledby="services-title">
        <div className={styles.sectionHeading}>
          <p className={site.eyebrow}>Servizi</p>
          <h2 id="services-title">Competenze distinte, coordinate da un’unica regia.</h2>
          <p>Puoi attivare un’area specifica o costruire un sistema completo in base agli obiettivi.</p>
        </div>

        <div className={styles.serviceRows}>
          {SERVICES.map(({ id, href, icon: Icon, label, title, description, included, strumento, outcome }, i) => (
            <article key={id} id={id} className={styles.serviceRow}>
              <div className={styles.serviceIdentity}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <Icon size={25} aria-hidden="true" />
                <p>{label}</p>
                {/* Il prezzo d’ingresso sta sulla scheda: senza, la prima
                    domanda di ogni richiesta e' «quanto costa». Il valore
                    arriva dalle sorgenti uniche, non e' scritto qui. */}
                <p className={styles.serviceEntryPrice}>{prezzoIngresso(id)}</p>
              </div>
              <div className={styles.serviceBody}>
                <h3>{title}</h3>
                <p>{description}</p>
                <ul>
                  {included.map(item => <li key={item}><Check size={15} aria-hidden="true" /> {item}</li>)}
                </ul>
                <div className={styles.strumento}>
                  <Zap size={16} aria-hidden="true" />
                  <span><strong>{strumento.nome}:</strong> {strumento.beneficio}</span>
                </div>
                <div className={styles.outcome}><Target size={17} aria-hidden="true" /><span><strong>Risultato atteso:</strong> {outcome}</span></div>
                <div className={styles.serviceLinks}>
                  <Link href={href} className={site.outlineButton}>Come funziona: {label} <ArrowRight size={16} aria-hidden="true" /></Link>
                  <Link href="/pacchetti" className={styles.listinoLink}>Listino completo <ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="metodo" className={styles.methodSection} aria-labelledby="method-title">
        <div className={styles.sectionHeading}>
          <p className={site.eyebrow}>Metodo operativo</p>
          <h2 id="method-title">Un ciclo chiaro, ogni mese.</h2>
          <p>Le responsabilità restano definite e ogni passaggio produce un risultato verificabile.</p>
        </div>
        <ol className={styles.methodGrid}>
          {METHOD.map(([number, title, text]) => (
            <li key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <Link href="/metodo" className={site.outlineButton}>Approfondisci il metodo <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <section id="legale" className={styles.legalSection} aria-labelledby="legal-title">
        <div className={styles.legalIntro}>
          <div>
            <p className={site.eyebrow}>Consulenza legale AI &amp; Compliance</p>
            <h2 id="legal-title">Tecnologia e responsabilità nello stesso progetto.</h2>
          </div>
          <p>
            Le attività legali vengono svolte con professionisti abilitati e
            definite sul caso concreto. Affianchiamo l’adozione dell’AI senza
            trasformare la compliance in un documento generico.
          </p>
        </div>

        <div className={styles.legalGrid}>
          {LEGAL_SERVICES.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={21} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>

        <div className={styles.legalPartner}>
          <div className={styles.partnerMark} aria-hidden="true">BCS</div>
          <div>
            <span>Partner legale</span>
            <h3>Studio Legale BCS</h3>
            <p>Avv. Vincenzo Sapone, Cassazionista. Diritto delle nuove tecnologie, GDPR e AI Act.</p>
          </div>
          <div className={styles.legalPrice}>
            <span>Consulenza</span>
            <strong>€150<small>/30 min</small></strong>
          </div>
          <Link href="/consulenza" className={styles.partnerCta}>
            Prenota la consulenza <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <p className={styles.disclaimer}>Le informazioni pubblicate non sostituiscono una consulenza legale individuale.</p>
      </section>

      {/* Tabella riassuntiva.
          Su tutto il sito ne esisteva una sola, e i motori di risposta
          estraggono le tabelle piu' di qualsiasi altra struttura. Qui i dieci
          servizi stanno in una griglia leggibile a colpo d'occhio: che cosa
          esce, da quanto parte, dove si approfondisce. I prezzi vengono dalla
          fonte unica, non riscritti. */}
      <section id="riepilogo" className={styles.tableSection} aria-labelledby="table-title">
        <div className={styles.sectionHeading}>
          <p className={site.eyebrow}>Tutto in una tabella</p>
          <h2 id="table-title">Che cosa esce, e da quanto parte.</h2>
          <p>
            Dieci aree di lavoro, attivabili una alla volta o insieme. I prezzi sono
            d’ingresso e IVA esclusa: il preventivo cambia con il perimetro, e viene
            scritto prima di cominciare.
          </p>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.summaryTable}>
            <caption>Servizi di Social Web Automation: consegna mensile e prezzo d’ingresso</caption>
            <thead>
              <tr>
                <th scope="col">Servizio</th>
                <th scope="col">Che cosa consegniamo</th>
                <th scope="col">Da</th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map(service => (
                <tr key={service.id}>
                  <th scope="row"><Link href={service.href}>{service.label}</Link></th>
                  <td>{service.consegna}</td>
                  <td className={styles.tablePrice}>{prezzoIngresso(service.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="pacchetti" className={styles.pricingSection} aria-labelledby="pricing-title">
        <div className={styles.sectionHeading}>
          <p className={site.eyebrow}>Soluzioni mensili</p>
          <h2 id="pricing-title">Scegli il risultato. Il sistema è già completo.</h2>
          <p>Setup incluso in entrambi i piani. Sono piani di sola crescita organica: le campagne a pagamento rientrano nella configurazione personalizzata.</p>
        </div>
        <div className={styles.pricingGrid}>
          {PACCHETTI.map(plan => (
            <article key={plan.slug} className={`${styles.priceCard} ${plan.consigliato ? styles.featuredPlan : ''}`}>
              <div className={styles.priceHeader}>
                <div><span>{plan.eyebrow}</span><h3>{plan.nome}</h3></div>
                {plan.consigliato && <b>Più scelto</b>}
              </div>
              <p className={styles.planResult}>{plan.risultato}</p>
              <p className={styles.price}><strong>{plan.prezzo}</strong><span>/mese</span></p>
              <p className={styles.setup}>{plan.setup}</p>
              <p className={styles.planDescription}>{plan.inBreve}</p>
              <Link href={`/register?piano=${plan.slug}`} className={plan.consigliato ? site.primaryButton : site.outlineButton}>
                {plan.cta} <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <p className={styles.planDetailLink}>
                <Link href="/pacchetti">Confronta i due piani voce per voce</Link>
              </p>
              <small className={styles.ctaNote}>Setup incluso · IVA esclusa · rinnovo mensile</small>
            </article>
          ))}
        </div>
        <div className={styles.autonomousGrid}>
          <Link href={BLOG_SERVICE.path} className={styles.autonomousOffer}>
            <Newspaper size={21} aria-hidden="true" />
            <span><small>Servizio autonomo</small><strong>{BLOG_SERVICE.name}</strong><em>{BLOG_SERVICE.articlesPerMonth} articoli/mese</em></span>
            <b>{BLOG_SERVICE.displayPrice}<small>/mese</small></b>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link href="/servizi/siti-e-commerce" className={styles.autonomousOffer}>
            <Globe2 size={21} aria-hidden="true" />
            <span><small>Servizio autonomo</small><strong>Sito Web Base</strong><em>Landing semplice a partire da 19,90 €/mese</em></span>
            <b>€19,90<small>/mese</small></b>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link href="/servizi/ricerca-clienti-b2b" className={`${styles.autonomousOffer} ${styles.leadAutonomousOffer}`}>
            <Target size={21} aria-hidden="true" />
            <span><small>Pilot una tantum</small><strong>Ricerca Clienti B2B</strong><em>Fino a 30 aziende verificate</em></span>
            <b>€149<small>una tantum</small></b>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.pricingAssurance}>
          <div><CircleCheck size={18} aria-hidden="true" /><span><strong>Valuta prima di acquistare.</strong> Richiedi un contenuto di prova gratuito e verifica metodo e qualità.</span></div>
          <a
            href={waLink('Ciao! Vorrei ricevere un contenuto di prova gratuito di Social Web Automation.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Richiedi la prova <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <Link href="/pacchetti" className={site.outlineButton}>Apri il confronto completo <ArrowRight size={16} aria-hidden="true" /></Link>
        <div className={styles.customPlan}>
          <div><Layers3 size={24} aria-hidden="true" /><span><strong>Configurazione su misura</strong> per e-commerce, agenzie, più brand, automazioni e integrazioni.</span></div>
          <a
            href={waLink('Ciao! Vorrei progettare una configurazione Social Web Automation su misura.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Progettiamo la soluzione <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="faq" className={styles.faqSection} aria-labelledby="faq-title">
        <div className={styles.sectionHeading}>
          <p className={site.eyebrow}>Domande frequenti</p>
          <h2 id="faq-title">Chiarezza prima di iniziare.</h2>
        </div>
        <div className={styles.faqList}>
          {FAQ.map(item => (
            <details key={item.q}>
              <summary>{item.q}<span aria-hidden="true">+</span></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <Link href="/faq" className={site.outlineButton}>Tutte le domande frequenti <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={site.eyebrow}>Consulenza iniziale</p>
          <h2>Costruiamo il punto di partenza giusto per la tua azienda.</h2>
          <p>Partiamo da obiettivi, canali e capacità interne. Poi definiamo attività, responsabilità e costi.</p>
        </div>
        <div>
          <a
            href={waLink('Ciao! Vorrei una consulenza iniziale per Social Web Automation.')}
            target="_blank"
            rel="noopener noreferrer"
            className={site.lightButton}
          >
            <MessageCircle size={18} aria-hidden="true" /> Scrivici su WhatsApp
          </a>
          <a href={`mailto:${EMAIL_CONTATTO}?subject=Consulenza%20Social%20Automation`} className={styles.emailLink}>
            Oppure invia un’email
          </a>
        </div>
      </section>

      <footer className={site.footer}>
        <Link href="/" className={site.brand}>
          <Image className={site.brandLogo} src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} />
          <span>Social Web Automation</span>
        </Link>
        <div>
          <Link href="/servizi">Servizi</Link>
          <Link href="/chi-siamo">Chi siamo</Link>
          <Link href="/blog">Journal</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/termini">Termini</Link>
          <Link href="/cookie-policy">Cookie</Link>
          <Link href="/recesso">Recesso</Link>
          <Link href="/accessibilita">Accessibilità</Link>
          <Link href="/sicurezza">Sicurezza</Link>
          <Link href="/en" hrefLang="en">English</Link>
          <Link href="/login">Accesso</Link>
        </div>
        <p>
          © 2026 {TITOLARE.brand}<br />
          {TITOLARE.ragioneSociale} · P.IVA {TITOLARE.partitaIva}<br />
          Sede a Cermenate (CO) · Servizi in Italia e nel mondo
        </p>
      </footer>

      <a
        href={waLink('Ciao! Vorrei informazioni sui servizi Social Web Automation.')}
        target="_blank"
        rel="noopener noreferrer"
        className={site.mobileCta}
      >
        Richiedi una consulenza <ArrowRight size={17} aria-hidden="true" />
      </a>
      <FloatingNavigation />
    </main>
  )
}
