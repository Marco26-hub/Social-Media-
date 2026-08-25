import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
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
import { BLOG_SERVICE } from '@/lib/blog-service'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/site-config'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicHeader from '@/components/PublicHeader'
import styles from './landing.module.css'

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
    items: ['Audit tecnico ed editoriale', 'Architettura, intenti e priorità', 'Entità, fonti e dati strutturati', 'Monitoraggio e piano di miglioramento'],
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
    title: 'Siti ed e-commerce',
    text: 'Soluzioni da 19,90 € al mese, orientate al contatto e alla vendita. Dopo 12 mesi di canone, il sito è tuo.',
    items: ['Architettura e messaggi di conversione', 'Sviluppo responsive e mobile-first', 'Catalogo, pagamenti e tracciamento', 'Integrazione con social, ADS e contenuti'],
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
  { number: '03', title: 'Convertire', text: 'Siti ed e-commerce trasformano attenzione e traffico in azioni misurabili.', href: '/servizi/siti-e-commerce' },
  { number: '04', title: 'Trovare opportunità', text: 'Il Pilot B2B ricerca aziende in target, fonti e priorità commerciali.', href: '/servizi/ricerca-clienti-b2b' },
  { number: '05', title: 'Operare correttamente', text: 'AI Act, GDPR e controllo umano proteggono processo e responsabilità.', href: '/consulenza' },
]

const EVIDENCE = [
  { title: 'Processo social visibile', text: 'Piano, produzione, approvazione e pubblicazione sono descritti passaggio per passaggio.', href: '/metodo', label: 'Verifica il metodo' },
  { title: 'Journal pubblico', text: 'Articoli, struttura editoriale, FAQ e collegamenti mostrano concretamente l’approccio SEO + GEO.', href: '/blog', label: 'Apri il Journal' },
  { title: 'Portfolio Web reale', text: 'SILKinCOM, Studio Legale BCS e Borsieri Car Service sono progetti pubblici consultabili.', href: '/servizi/siti-e-commerce', label: 'Guarda i progetti' },
  { title: 'Pilot B2B delimitato', text: 'Deliverable, limiti, prezzo e checkout sono dichiarati prima dell’acquisto.', href: '/servizi/ricerca-clienti-b2b', label: 'Esamina il Pilot' },
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
  {
    q: 'Quanto costa la gestione social media per una PMI?',
    a: 'Il piano Presenza costa 390 € al mese e comprende 16 contenuti su 2 social. Il piano Crescita costa 790 € al mese e comprende 24 contenuti su 3 social, un articolo SEO + GEO e la gestione di una campagna ADS. IVA e budget pubblicitario sono esclusi.',
  },
  {
    q: 'Devo imparare a utilizzare un nuovo software?',
    a: 'No. Social Web Automation è un servizio gestito. Il portale semplifica approvazioni e consultazione dei risultati; strategia, produzione e pubblicazione restano a nostro carico.',
  },
  {
    q: 'Posso approvare i contenuti prima della pubblicazione?',
    a: 'Sì. Il processo prevede controllo e approvazione prima della pubblicazione, nel rispetto del numero di revisioni incluso nel pacchetto.',
  },
  {
    q: 'SEO e GEO garantiscono il posizionamento?',
    a: 'No. Applichiamo buone pratiche tecniche ed editoriali per migliorare comprensione, indicizzazione e citabilità, ma nessun operatore può garantire posizioni o citazioni da parte di motori e assistenti AI.',
  },
  {
    q: 'Il budget pubblicitario è incluso?',
    a: 'No. Il budget destinato alle piattaforme pubblicitarie resta separato dal canone e viene definito in base agli obiettivi e alla sostenibilità della campagna.',
  },
  {
    q: 'Cosa comprende la soluzione personalizzata?',
    a: 'Può includere più brand e canali, e-commerce, campagne ADS, produzione video, automazioni, lead generation, integrazioni e supporto dedicato. La configurazione viene definita dopo un’analisi iniziale.',
  },
]

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: SITE_TITLE,
  description: SITE_DESCRIPTION,
  inLanguage: 'it-IT',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  primaryImageOfPage: { '@id': `${SITE_URL}/#logo` },
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
          <h1 id="hero-title">Social, SEO, siti e ricerca clienti per PMI.</h1>
          <p className={styles.heroLead}>
            Un’unica regia collega contenuti social, visibilità organica, Blog,
            presenza Web e ricerca di opportunità B2B. L’intelligenza artificiale
            accelera il lavoro; specialisti e controllo umano proteggono qualità e responsabilità.
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
            <li><Check size={16} aria-hidden="true" /> Servizi disponibili in Italia e all’estero</li>
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
            <div><span>Contenuti</span><strong>20</strong><small>questo mese</small></div>
            <div><span>Da approvare</span><strong>4</strong><small>entro venerdì</small></div>
            <div><span>Canali</span><strong>3</strong><small>coordinati</small></div>
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
          <p className={styles.eyebrow}>Un percorso commerciale unico</p>
          <h2 id="journey-title">Dalla visibilità all’opportunità, senza pezzi scollegati.</h2>
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
          <p className={styles.eyebrow}>Un processo completo</p>
          <h2 id="benefit-title">Non solo contenuti. Una regia continuativa.</h2>
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

      <section id="servizi" className={`${styles.section} ${styles.sectionTint}`} aria-labelledby="services-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Competenze integrate</p>
          <h2 id="services-title">Un’unica direzione per tutti i punti di contatto.</h2>
          <p>Riduciamo frammentazione, passaggi tra fornitori e attività operative interne.</p>
        </div>
        <div className={styles.serviceGrid}>
          {SERVICES.map(({ icon: Icon, href, title, text, items }) => (
            <article key={title} className={styles.service}>
              <span><Icon size={22} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <ul className={styles.serviceList}>
                {items.map(item => <li key={item}><Check size={15} aria-hidden="true" /> {item}</li>)}
              </ul>
              <Link href={href}>Approfondisci <ChevronRight size={16} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section id="metodo" className={styles.section} aria-labelledby="process-title">
        <div className={styles.processLayout}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Metodo operativo</p>
            <h2 id="process-title">Dalla strategia alla pubblicazione, senza dispersioni.</h2>
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
          <h2 id="compliance-title">Contenuti progettati per essere trovati e compresi.</h2>
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
            <h2 id="legal-title">Innovare con regole, responsabilità e processi chiari.</h2>
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
          <h2 id="pricing-title">Scegli il risultato. Al resto pensiamo noi.</h2>
          <p>Due pacchetti social e tre servizi autonomi: Blog SEO + GEO, Web & Commerce e Ricerca Clienti B2B.</p>
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
              <p className={styles.planDescription}>{plan.sottotitolo}</p>
              <div className={styles.planFit}>
                <strong>È adatto a te se</strong>
                <p>{plan.idealePer}</p>
              </div>
              {plan.includeDa && <p className={styles.includes}>Include tutto di {plan.includeDa}, più:</p>}
              <p className={styles.listLabel}>Nel canone trovi</p>
              <ul>
                {plan.features.map(feature => <li key={feature}><Check size={16} aria-hidden="true" /> {feature}</li>)}
              </ul>
              <Link href={`/register?piano=${plan.slug}`} className={plan.consigliato ? styles.primaryButton : styles.outlineButton}>
                {plan.cta} <ArrowRight size={17} aria-hidden="true" />
              </Link>
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
              <h3>Web &amp; Commerce</h3>
              <p>Landing page, sito aziendale o e-commerce mobile-first collegato a contenuti, campagne e analytics.</p>
              <ul>
                <li><Check size={15} aria-hidden="true" /> Architettura, design responsive e SEO tecnica</li>
                <li><Check size={15} aria-hidden="true" /> Dopo 12 mesi di canone, il sito è tuo</li>
              </ul>
            </div>
            <div className={styles.standaloneAction}>
              <p><small>da</small><strong>€19,90</strong><span>/mese</span></p>
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
          <h2 id="faq-title">Tutto ciò che serve per decidere con chiarezza.</h2>
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
    </main>
  )
}
