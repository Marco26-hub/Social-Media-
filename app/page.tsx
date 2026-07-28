import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
  FileSearch,
  Globe2,
  Layers3,
  LockKeyhole,
  Megaphone,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { PACCHETTI } from '@/lib/pacchetti'
import styles from './landing.module.css'

const WHATSAPP_NUMERO = '393477196603'
const TRIAL_MSG = 'Ciao! Vorrei richiedere un contenuto di prova gratuito di Social Automation.'
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
    title: 'Gestione social multicanale',
    text: 'Piano editoriale, contenuti, adattamento ai formati, approvazione e pubblicazione in un unico flusso.',
  },
  {
    icon: ScanSearch,
    title: 'Visibilità SEO + GEO',
    text: 'Contenuti strutturati per essere compresi dai motori di ricerca e dai sistemi di risposta basati sull’AI.',
  },
  {
    icon: Globe2,
    title: 'Siti ed e-commerce',
    text: 'Esperienze digitali orientate al contatto e alla vendita, integrate con contenuti, prodotti e campagne.',
  },
]

const PROCESS = [
  ['01', 'Analizziamo', 'Definiamo brand, pubblico, obiettivi e canali prioritari.'],
  ['02', 'Produciamo', 'Prepariamo il piano e realizziamo contenuti coerenti per ogni piattaforma.'],
  ['03', 'Ottimizziamo', 'Dopo la tua approvazione pubblichiamo, misuriamo e miglioriamo.'],
]

const FAQ = [
  {
    q: 'Devo imparare a utilizzare un nuovo software?',
    a: 'No. Social Automation è un servizio gestito. Il portale semplifica approvazioni e consultazione dei risultati; strategia, produzione e pubblicazione restano a nostro carico.',
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

export default function LandingPage() {
  return (
    <main id="main-content" className={styles.page}>
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>

      <header className={styles.navbar}>
        <Link href="/" className={styles.brand} aria-label="Social Automation, home">
          <span className={styles.brandMark}>SA</span>
          <span>Social Automation</span>
        </Link>
        <nav className={styles.navLinks} aria-label="Navigazione principale">
          <a href="#servizi">Servizi</a>
          <a href="#metodo">Metodo</a>
          <a href="#compliance">SEO, GEO &amp; Compliance</a>
          <a href="#prezzi">Soluzioni</a>
        </nav>
        <div className={styles.navActions}>
          <Link href="/portale" className={styles.loginLink}>Area cliente</Link>
          <a href={waLink(TRIAL_MSG)} target="_blank" rel="noopener noreferrer" className={styles.navCta}>
            Richiedi una prova
          </a>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><Sparkles size={16} aria-hidden="true" /> Servizio digitale gestito</p>
          <h1 id="hero-title">La tua presenza digitale, gestita con metodo.</h1>
          <p className={styles.heroLead}>
            Strategia, contenuti e pubblicazione multicanale in un unico servizio.
            L’intelligenza artificiale accelera la produzione; il controllo umano
            tutela qualità, coerenza e responsabilità.
          </p>
          <div className={styles.heroActions}>
            <a href={waLink(TRIAL_MSG)} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
              Richiedi un contenuto di prova <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href="#prezzi" className={styles.secondaryButton}>Esplora le soluzioni</a>
          </div>
          <p className={styles.microcopy}>Nessuna carta richiesta. Valuta concretamente qualità e processo.</p>
          <ul className={styles.trustList} aria-label="Caratteristiche principali">
            <li><Check size={16} aria-hidden="true" /> Approvazione prima della pubblicazione</li>
            <li><Check size={16} aria-hidden="true" /> Nessun software complesso da gestire</li>
            <li><Check size={16} aria-hidden="true" /> Budget ADS sempre separato</li>
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
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <article key={title} className={styles.service}>
              <span><Icon size={22} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href="/servizi">Approfondisci <ChevronRight size={16} aria-hidden="true" /></Link>
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
        </div>
      </section>

      <section id="compliance" className={styles.compliance} aria-labelledby="compliance-title">
        <div className={styles.complianceIntro}>
          <p className={styles.eyebrow}>SEO, GEO &amp; AI Compliance</p>
          <h2 id="compliance-title">Visibilità digitale e utilizzo responsabile dell’AI.</h2>
          <p>
            Rendiamo i contenuti più chiari per persone, motori di ricerca e sistemi
            di risposta AI. Quando il progetto lo richiede, integriamo controllo
            editoriale, tracciabilità e valutazione normativa con professionisti qualificati.
          </p>
        </div>
        <div className={styles.complianceItems}>
          <article><FileSearch size={21} aria-hidden="true" /><div><h3>SEO</h3><p>Struttura tecnica, contenuti e dati organizzati per favorire comprensione e indicizzazione.</p></div></article>
          <article><Layers3 size={21} aria-hidden="true" /><div><h3>GEO</h3><p>Fonti, FAQ ed entità chiare per aumentare l’utilizzabilità nei sistemi di risposta AI, senza promesse di citazione.</p></div></article>
          <article><ShieldCheck size={21} aria-hidden="true" /><div><h3>AI Compliance</h3><p>Processi di revisione, trasparenza e responsabilità definiti in base all’utilizzo concreto dell’intelligenza artificiale.</p></div></article>
        </div>
        <p className={styles.complianceNote}><LockKeyhole size={15} aria-hidden="true" /> La valutazione legale viene svolta, quando necessaria, con consulenti abilitati.</p>
      </section>

      <section id="prezzi" className={styles.pricingSection} aria-labelledby="pricing-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Soluzioni</p>
          <h2 id="pricing-title">Due livelli chiari. Un servizio che lavora ogni mese.</h2>
          <p>Prezzi mensili IVA esclusa. Il budget pubblicitario non è incluso.</p>
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
              <p className={styles.price}><strong>{plan.prezzo}</strong><span>/mese</span></p>
              <p className={styles.setup}>{plan.setup} una tantum</p>
              <p className={styles.planDescription}>{plan.sottotitolo}</p>
              {plan.includeDa && <p className={styles.includes}>Include tutto di {plan.includeDa}, più:</p>}
              <ul>
                {plan.features.map(feature => <li key={feature}><Check size={16} aria-hidden="true" /> {feature}</li>)}
              </ul>
              <Link href={`/register?piano=${plan.slug}`} className={plan.consigliato ? styles.primaryButton : styles.outlineButton}>
                {plan.consigliato ? 'Scegli Crescita' : 'Inizia con Presenza'} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
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
        <Link href="/" className={styles.brand}><span className={styles.brandMark}>SA</span><span>Social Automation</span></Link>
        <div><Link href="/privacy">Privacy</Link><Link href="/termini">Termini</Link><Link href="/login">Accesso</Link></div>
        <p>© 2026 Social Automation</p>
      </footer>

      <a href={waLink(TRIAL_MSG)} target="_blank" rel="noopener noreferrer" className={styles.mobileCta}>
        Richiedi una prova <ArrowRight size={17} aria-hidden="true" />
      </a>
    </main>
  )
}
