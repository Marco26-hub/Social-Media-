import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  ArrowRight,
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
  ScanSearch,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
} from 'lucide-react'
import { PACCHETTI } from '@/lib/pacchetti'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicHeader from '@/components/PublicHeader'
import site from '../landing.module.css'
import styles from './servizi-v2.module.css'

const META_TITLE = 'Social Media, Blog SEO e Siti per PMI | SWA'
const META_DESCRIPTION =
  'Scopri i servizi SWA: gestione social, Blog SEO + GEO con 12 articoli al mese, siti, e-commerce e consulenza AI compliance.'

const WHATSAPP_NUMERO = '393477196603'
const EMAIL_CONTATTO = 'swsdautomation@gmail.com'

function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(message)}`
}

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/servizi` },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: `${SITE_URL}/servizi`,
  },
  twitter: {
    title: META_TITLE,
    description: META_DESCRIPTION,
  },
}

const servicesPageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
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
          { '@type': 'ListItem', position: 5, item: { '@id': `${SITE_URL}/#legal-ai-consulting` } },
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
    id: 'social',
    href: '/servizi/gestione-social-media',
    number: '01',
    icon: Megaphone,
    label: 'Gestione social multicanale',
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
    outcome: 'Meno attività operative interne e una comunicazione riconoscibile ogni settimana.',
  },
  {
    id: 'seo-geo',
    href: '/servizi/seo-geo',
    number: '02',
    icon: ScanSearch,
    label: 'SEO e GEO',
    title: 'Contenuti progettati per essere trovati e compresi.',
    description:
      'Miglioriamo struttura, contenuti e segnali di autorevolezza per aiutare motori di ricerca e sistemi di risposta AI a comprendere correttamente azienda, servizi e competenze.',
    included: [
      'Audit tecnico ed editoriale del sito',
      'Architettura dei contenuti e keyword intent',
      'Articoli, FAQ e dati strutturati',
      'Entità, fonti e segnali di autorevolezza',
      'Analisi della citabilità nei sistemi AI',
      'Monitoraggio e priorità di miglioramento',
    ],
    outcome: 'Una base organica più solida, utile nel tempo e misurabile senza promesse di ranking.',
  },
  {
    id: 'blog-seo',
    href: BLOG_SERVICE.path,
    number: '03',
    icon: Newspaper,
    label: BLOG_SERVICE.name,
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
    outcome: 'Un patrimonio editoriale continuo che amplia copertura organica e autorevolezza.',
  },
  {
    id: 'web',
    href: '/servizi/siti-e-commerce',
    number: '04',
    icon: Globe2,
    label: 'Siti ed e-commerce',
    title: 'Un’esperienza digitale costruita per il contatto e la vendita.',
    description:
      'Soluzioni web da 19,90 € al mese. Dopo 12 mesi di canone, il sito è tuo: progettato mobile-first e collegato a campagne e contenuti social.',
    included: [
      'Architettura informativa e messaggi',
      'Design responsive e mobile-first',
      'Landing page e percorsi di conversione',
      'Catalogo, prodotti, pagamenti e ordini',
      'Analytics, eventi e tracciamento',
      'Integrazione con social, ADS e CRM',
    ],
    outcome: 'Un punto di arrivo credibile per trasformare attenzione, traffico e campagne in opportunità.',
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

const FAQ = [
  {
    q: 'Quanto costa affidare la gestione dei social a Social Web Automation?',
    a: 'Il piano Presenza costa 390 € al mese per 2 social e 16 contenuti. Il piano Crescita costa 790 € al mese per 3 social e 24 contenuti, con articolo SEO + GEO e gestione di una campagna ADS. IVA e budget pubblicitario sono esclusi.',
  },
  {
    q: 'Il cliente deve gestire il software?',
    a: 'No. Acquisti un servizio gestito. Il portale serve a rendere semplici approvazioni e risultati; il lavoro operativo resta a nostro carico.',
  },
  {
    q: 'I contenuti vengono pubblicati senza controllo?',
    a: 'No. Il flusso prevede approvazione e revisioni tracciate prima della pubblicazione, secondo il perimetro del pacchetto.',
  },
  {
    q: 'Il budget pubblicitario è compreso?',
    a: 'No. La gestione prevista dal piano è inclusa, mentre il budget versato alle piattaforme pubblicitarie resta separato.',
  },
  {
    q: 'SEO e GEO garantiscono risultati o citazioni?',
    a: 'No. Miglioriamo struttura, qualità e reperibilità, ma nessun fornitore può garantire ranking o citazioni da parte dei sistemi AI.',
  },
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
          <h1 id="services-hero-title">Gestione social, SEO e siti in un’unica regia digitale.</h1>
          <p>
            Social, contenuti organici, sito ed e-commerce lavorano nello stesso
            sistema. Coordiniamo strategia, produzione e misurazione, così ogni
            punto di contatto sostiene lo stesso obiettivo.
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
            <li><Check size={16} aria-hidden="true" /> Perimetro e costi dichiarati</li>
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
          <div className={styles.mapStatus}><i /> Sistema operativo mensile</div>
        </div>
      </section>

      <section className={styles.valueBand} aria-label="Valore del servizio">
        <span>Strategia condivisa</span>
        <span>Produzione coordinata</span>
        <span>Controllo centralizzato</span>
        <span>Risultati leggibili</span>
      </section>

      <section id="servizi" className={styles.servicesSection} aria-labelledby="services-title">
        <div className={styles.sectionHeading}>
          <p className={site.eyebrow}>Servizi</p>
          <h2 id="services-title">Competenze distinte, coordinate da un’unica regia.</h2>
          <p>Puoi attivare un’area specifica o costruire un sistema completo in base agli obiettivi.</p>
        </div>

        <div className={styles.serviceRows}>
          {SERVICES.map(({ id, href, number, icon: Icon, label, title, description, included, outcome }) => (
            <article key={id} id={id} className={styles.serviceRow}>
              <div className={styles.serviceIdentity}>
                <span>{number}</span>
                <Icon size={25} aria-hidden="true" />
                <p>{label}</p>
              </div>
              <div className={styles.serviceBody}>
                <h3>{title}</h3>
                <p>{description}</p>
                <ul>
                  {included.map(item => <li key={item}><Check size={15} aria-hidden="true" /> {item}</li>)}
                </ul>
                <div className={styles.outcome}><Target size={17} aria-hidden="true" /><span><strong>Risultato atteso:</strong> {outcome}</span></div>
                <Link href={href} className={site.outlineButton}>Pagina del servizio <ArrowRight size={16} aria-hidden="true" /></Link>
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

      <section id="pacchetti" className={styles.pricingSection} aria-labelledby="pricing-title">
        <div className={styles.sectionHeading}>
          <p className={site.eyebrow}>Soluzioni mensili</p>
          <h2 id="pricing-title">Scegli il risultato. Il sistema è già completo.</h2>
          <p>Setup incluso in entrambi i piani. Il budget pubblicitario versato alle piattaforme resta separato e sotto il tuo controllo.</p>
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
              <p className={styles.planDescription}>{plan.sottotitolo}</p>
              <div className={styles.planFit}>
                <strong>È adatto a te se</strong>
                <p>{plan.idealePer}</p>
              </div>
              {plan.includeDa && <p className={styles.includes}>Include tutto di {plan.includeDa}, più:</p>}
              <p className={styles.listLabel}>Nel canone trovi</p>
                  <ul>
                {plan.features.map(feature => <li key={feature}><CircleCheck size={16} aria-hidden="true" /> {feature}</li>)}
              </ul>
              <Link href={`/register?piano=${plan.slug}`} className={plan.consigliato ? site.primaryButton : site.outlineButton}>
                {plan.cta} <ArrowRight size={17} aria-hidden="true" />
              </Link>
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
            <span><small>Servizio autonomo</small><strong>Web &amp; Commerce</strong><em>Sito tuo dopo 12 mesi</em></span>
            <b>€19,90<small>/mese</small></b>
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
          <h2>Costruiamo il perimetro giusto per la tua azienda.</h2>
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
