import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react'
import { articoloPerServizio, settoriPerServizio } from '@/lib/collegamenti'
import { SITE_URL } from '@/lib/site-config'
import FloatingNavigation from './FloatingNavigation'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import styles from './marketing-detail.module.css'

type TextBlock = { title: string; text: string }
type ProcessBlock = TextBlock & { number: string }
type FaqBlock = { q: string; a: string }
type PortfolioBlock = {
  name: string
  type: string
  text: string
  href: string
  image: string
  alt: string
}

export type MarketingDetailConfig = {
  path: string
  locale?: 'it' | 'en'
  /** Livello intermedio della briciola. Serve alle pagine che non stanno
   *  sotto /servizi, come le landing di settore. */
  breadcrumbParent?: { label: string; href: string }
  eyebrow: string
  title: string
  lead: string
  serviceName: string
  /** Nome breve usato dentro i titoli. Su una pagina di settore serviceName
   *  e' una frase descrittiva («Marketing e agenda per parrucchieri»), che
   *  dentro un H2 diventa illeggibile. */
  entityName?: string
  serviceType: string
  promise: string
  startingPrice?: string
  /** Posizione nel percorso in quattro passi — sito, social, telefono,
   *  agenda. Serve a far vedere al cliente che i servizi non sono un
   *  catalogo ma una sequenza, e dove si trova adesso. */
  passo?: { n: number; titolo: string; primaHref?: string; primaLabel?: string; poiHref?: string; poiLabel?: string }
  /** Tabella facoltativa: i motori di risposta estraggono le tabelle piu'
   *  volentieri di qualsiasi altra struttura, e su una pagina servizio il
   *  metodo si legge meglio in griglia che in prosa. */
  tabella?: { occhiello: string; h2: string; intro?: string; caption: string; colonne: string[]; righe: string[][] }
  priceNote?: string
  offerHighlight?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  icon: LucideIcon
  signals: string[]
  outcomes: TextBlock[]
  deliverablesTitle: string
  deliverablesIntro: string
  deliverables: TextBlock[]
  process: ProcessBlock[]
  faq: FaqBlock[]
  related: { href: string; label: string }[]
  portfolio?: PortfolioBlock[]
}

const WHATSAPP_NUMBER = '393477196603'

/** Il nome del servizio dentro una frase vuole l'iniziale minuscola, salvo
 *  quando e' una sigla o un nome proprio (SEO, GEO, WhatsApp, AI). */
function minuscolo(nome: string): string {
  const prima = nome.split(' ')[0]
  if (prima.length <= 4 && prima === prima.toUpperCase()) return nome
  return nome.charAt(0).toLowerCase() + nome.slice(1)
}

export default function MarketingDetailPage({ config }: { config: MarketingDetailConfig }) {
  const Icon = config.icon
  const isEnglish = config.locale === 'en'
  const parent = config.breadcrumbParent ?? { label: 'Servizi', href: '/servizi' }
  // I settori che dichiarano questo servizio, e l’articolo che lo approfondisce:
  // senza, le verticali e il Journal restano raggiungibili solo dal menu.
  const settori = settoriPerServizio(config.path)
  const articolo = articoloPerServizio(config.path)
  const pageUrl = `${SITE_URL}${config.path}`
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(isEnglish ? `Hello, I would like to discuss ${config.serviceName} by Social Web Automation.` : `Ciao! Vorrei approfondire il servizio ${config.serviceName} di Social Web Automation.`)}`
  const priceCadence = isEnglish ? '/month' : '/mese'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: config.title,
        description: config.lead,
        inLanguage: isEnglish ? 'en' : 'it-IT',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        // Indica quali blocchi sono adatti a essere letti ad alta voce da un
        // assistente: il titolo, l'attacco e le risposte delle domande
        // frequenti, che sono gia' scritte per stare in piedi da sole.
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '[class*="lead"]', '[class*="faq"] summary', '[class*="faq"] p'],
        },
        about: { '@id': `${pageUrl}#service` },
      },
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: config.serviceName,
        serviceType: config.serviceType,
        description: config.lead,
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: { '@type': 'Country', name: isEnglish ? 'Italy' : 'Italia' },
        url: pageUrl,
        ...(config.startingPrice ? {
          offers: {
            '@type': 'Offer',
            price: config.startingPrice,
            priceCurrency: 'EUR',
            description: [config.offerHighlight, config.priceNote].filter(Boolean).join(' '),
            url: pageUrl,
          },
        } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          // Su una pagina inglese la radice del percorso e' /en, non la home
          // italiana: prima le briciole inglesi rimandavano tutte al sito IT.
          { '@type': 'ListItem', position: 1, name: 'Home', item: isEnglish ? `${SITE_URL}/en` : SITE_URL },
          { '@type': 'ListItem', position: 2, name: parent.label, item: `${SITE_URL}${parent.href}` },
          { '@type': 'ListItem', position: 3, name: config.serviceName, item: pageUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: config.faq.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      ...(config.portfolio?.length ? [{
        '@type': 'ItemList',
        name: 'Lavori web realizzati da Social Web Automation',
        itemListElement: config.portfolio.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'WebSite',
            name: item.name,
            url: item.href,
            image: `${SITE_URL}${item.image}`,
            description: item.text,
            creator: { '@id': `${SITE_URL}/#organization` },
          },
        })),
      }] : []),
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">{isEnglish ? 'Skip to content' : 'Vai al contenuto'}</a>
      {!isEnglish && <PublicHeader ctaHref={whatsappUrl} ctaLabel="Parliamo del progetto" />}

      <section className={styles.hero} aria-labelledby="detail-title">
        <div className={styles.heroCopy}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link><span>/</span><Link href={parent.href}>{parent.label}</Link><span>/</span><span>{config.serviceName}</span>
          </nav>
          {/* L'occhiello sta dentro l'H1, non sopra.
              Il titolo di queste pagine e' una frase d'effetto che spesso non
              nomina il mestiere: «Chi non trova risposta prova il salone dopo»
              non contiene ne' «parrucchieri» ne' «barberie». Quando un motore
              estrae un passaggio si porta dietro l'H1 come ancora, e un H1
              senza l'entita' lascia la risposta senza referente. Portando
              l'occhiello dentro l'H1 il nome del settore entra nel titolo
              senza cambiare una virgola del testo ne' l'aspetto della pagina. */}
          <h1 id="detail-title">
            <span className={styles.eyebrow}>{config.eyebrow}</span>
            {config.title}
          </h1>
          <p className={styles.lead}>{config.lead}</p>
          <div className={styles.actions}>
            {config.primaryCtaHref ? (
              <Link href={config.primaryCtaHref} className={styles.primary}>
                {config.primaryCtaLabel ?? 'Richiedi una valutazione'} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ) : (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.primary}>
                {config.primaryCtaLabel ?? 'Richiedi una valutazione'} <ArrowRight size={17} aria-hidden="true" />
              </a>
            )}
            <Link href={isEnglish ? '/en/pricing' : '/pacchetti'} className={styles.secondary}>{isEnglish ? 'Compare offers' : 'Confronta i pacchetti'}</Link>
          </div>
        </div>
        <aside className={styles.signalPanel} aria-label={`Sintesi ${config.serviceName}`}>
          <div className={styles.signalHeading}>
            <span><Icon size={24} aria-hidden="true" /></span>
            <div><small>{isEnglish ? 'Managed service' : 'Servizio gestito'}</small><strong>{config.serviceName}</strong></div>
          </div>
          {config.startingPrice && (
            <div className={styles.startingPrice}>
              <span>{isEnglish ? 'Starting from' : 'A partire da'}</span>
              <strong>€{config.startingPrice.replace('.', ',')}<small>{priceCadence}</small></strong>
              {config.offerHighlight && <b>{config.offerHighlight}</b>}
              {config.priceNote && <p>{config.priceNote}</p>}
            </div>
          )}
          <p>{config.promise}</p>
          <ul>{config.signals.map(signal => <li key={signal}><CircleCheck size={16} aria-hidden="true" /> {signal}</li>)}</ul>
        </aside>
      </section>

      <section className={styles.outcomeBand} aria-label="Risultati del servizio">
        {config.outcomes.map(outcome => <article key={outcome.title}><strong>{outcome.title}</strong><span>{outcome.text}</span></article>)}
      </section>

      <section className={styles.deliverables} aria-labelledby="deliverables-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isEnglish ? 'Included work' : 'Cosa comprende'}</p>
          <h2 id="deliverables-title">{config.deliverablesTitle}</h2>
          <p>{config.deliverablesIntro}</p>
        </div>
        <div className={styles.deliverableGrid}>
          {config.deliverables.map((item, index) => (
            <article key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
              <Check size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      {config.portfolio?.length ? (
        <section className={styles.portfolio} aria-labelledby="portfolio-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{isEnglish ? 'Delivered work' : 'Lavori realizzati'}</p>
            <h2 id="portfolio-title">{isEnglish ? 'Live projects, not abstract promises.' : 'Progetti online, non semplici promesse.'}</h2>
            <p>{isEnglish ? 'Different identities and goals, turned into digital experiences built for their real audience.' : 'Tre identità e tre obiettivi diversi, trasformati in esperienze digitali progettate per il pubblico reale.'}</p>
          </div>
          <div className={styles.portfolioGrid}>
            {config.portfolio.map(item => (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={styles.portfolioCard}>
                <span className={styles.portfolioVisual}>
                  <Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw" />
                </span>
                <span className={styles.portfolioCopy}>
                  <small>{item.type}</small>
                  <strong>{item.name}</strong>
                  <span>{item.text}</span>
                  <b>{isEnglish ? 'Visit project' : 'Visita il progetto'} <ExternalLink size={15} aria-hidden="true" /></b>
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.process} aria-labelledby="process-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isEnglish ? 'Method' : 'Metodo'}</p>
          {/* Questi tre titoli erano identici su 19 pagine. Un titolo ripetuto
              non ancora nulla: quando un motore estrae un blocco si porta
              dietro il titolo, e diciannove volte lo stesso non distingue una
              pagina dall'altra. Ora nominano il servizio della pagina. */}
          <h2 id="process-title">{isEnglish ? (config.entityName ? `How it works for ${minuscolo(config.entityName)}, step by step` : `How ${config.serviceName} works, step by step`) : (config.entityName ? `Come lavoriamo per ${minuscolo(config.entityName)}, passo per passo` : `Come funziona ${minuscolo(config.serviceName)}, passo per passo`)}</h2>
        </div>
        <ol>
          {config.process.map(step => (
            <li key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <Link href={isEnglish ? '/en/services' : '/metodo'} className={styles.textLink}>{isEnglish ? 'Explore the service map' : 'Scopri il metodo completo'} <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isEnglish ? 'FAQ' : 'Domande frequenti'}</p>
          <h2 id="faq-title">{isEnglish ? `${config.entityName ?? config.serviceName}: the questions we get before we start` : `${config.entityName ?? config.serviceName}: le domande che ci fanno prima di iniziare`}</h2>
        </div>
        <div>
          {config.faq.map(item => (
            <details key={item.q}>
              <summary>{item.q}<span aria-hidden="true">+</span></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        {!isEnglish && <Link href="/faq" className={styles.textLink}>Consulta tutte le FAQ <ArrowRight size={16} aria-hidden="true" /></Link>}
      </section>

      {settori.length > 0 && (
        <section className={styles.settoriBand} aria-labelledby="settori-title">
          <div>
            <p className={styles.eyebrow}>{isEnglish ? 'Where it matters' : 'Dove serve di più'}</p>
            {/* Con un solo settore usciva «Questo servizio in 1 settori». */}
            <h2 id="settori-title">{settori.length === 1
              ? (isEnglish ? 'Where this service is used' : 'Dove si usa questo servizio')
              : (isEnglish ? `This service in ${settori.length} sectors` : `Questo servizio in ${settori.length} settori`)}</h2>
            <p>{isEnglish ? 'Each page explains what actually matters in that trade, and what can be left alone.' : 'Ogni pagina dice quali attività servono davvero in quel mestiere, e quali si possono lasciare stare.'}</p>
          </div>
          <ul>
            {settori.map((s, index) => (
              <li key={`${s.href}-${index}`}>
                <Link href={s.href}>{s.label}<ChevronRight size={15} aria-hidden="true" /></Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {articolo && (
        <aside className={styles.approfondimento}>
          <span>{isEnglish ? 'From the Journal' : 'Dal Journal'}</span>
          <Link href={articolo.href}>{articolo.label}<ArrowRight size={16} aria-hidden="true" /></Link>
        </aside>
      )}

      <nav className={styles.related} aria-label="Servizi correlati">
        <span>{isEnglish ? 'Explore also' : 'Esplora anche'}</span>
        {config.related.map((item, index) => <Link key={`${item.href}-${index}`} href={item.href}>{item.label}<ChevronRight size={15} aria-hidden="true" /></Link>)}
      </nav>

      {config.passo && (
        <nav className={styles.passo} aria-label="Percorso in quattro passi">
          <span className={styles.passoEtichetta}>
            Passo {config.passo.n} di 4 · {config.passo.titolo}
          </span>
          <span className={styles.passoLink}>
            {config.passo.primaHref && config.passo.primaLabel && (
              <Link href={config.passo.primaHref}>← Prima: {config.passo.primaLabel}</Link>
            )}
            {config.passo.poiHref && config.passo.poiLabel && (
              <Link href={config.passo.poiHref}>Poi: {config.passo.poiLabel} →</Link>
            )}
            <Link href="/#percorso">Vedi tutto il percorso</Link>
          </span>
        </nav>
      )}

      {config.tabella && (
        <section className={styles.section} aria-labelledby="tabella-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{config.tabella.occhiello}</p>
            <h2 id="tabella-title">{config.tabella.h2}</h2>
            {config.tabella.intro && <p>{config.tabella.intro}</p>}
          </div>
          <div className={styles.tabellaWrap}>
            <table className={styles.tabella}>
              <caption>{config.tabella.caption}</caption>
              <thead>
                <tr>{config.tabella.colonne.map(c => <th scope="col" key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {config.tabella.righe.map((riga, r) => (
                  <tr key={r}>
                    {riga.map((cella, c) => c === 0
                      ? <th scope="row" key={c}>{cella}</th>
                      : <td key={c}>{cella}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className={styles.finalCta}>
        <div><p className={styles.eyebrow}>{isEnglish ? 'Next step' : 'Prossimo passo'}</p><h2>{isEnglish ? (config.entityName ? `Is this the right fit for ${minuscolo(config.entityName)}?` : `Is ${minuscolo(config.serviceName)} right for you?`) : (config.entityName ? `Fa al caso tuo, se lavori con ${minuscolo(config.entityName)}?` : `${config.serviceName} fa al caso tuo?`)}</h2><p>{isEnglish ? 'A first assessment clarifies priorities, activities, responsibilities and costs.' : 'Una prima valutazione chiarisce priorità, attività, responsabilità e costi.'}</p></div>
        {/* Due azioni, non una.
            Su tutto il sito l'invito era «parliamone»: 64 richiami al contatto
            contro 20 all'acquisto. Ma parlare con un fornitore e' il passo piu'
            impegnativo, e fra il leggere e il telefonare non c'era nulla. La
            prova gratuita esisteva, citata una volta sola dentro una fascia
            della pagina servizi: qui diventa la seconda azione, perche' e'
            l'unico modo di giudicare il lavoro senza impegnarsi. */}
        <div className={styles.finalCtaAzioni}>
          {config.primaryCtaHref ? (
            <Link href={config.primaryCtaHref}>{config.primaryCtaLabel ?? 'Attiva il servizio'} <ArrowRight size={17} aria-hidden="true" /></Link>
          ) : (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">{isEnglish ? 'Talk to us' : 'Parliamo del progetto'} <ArrowRight size={17} aria-hidden="true" /></a>
          )}
          <a
            className={styles.finalCtaProva}
            href={`https://wa.me/393477196603?text=${encodeURIComponent(isEnglish
              ? `Hello! Before deciding, I would like a free sample piece about ${config.serviceName.toLowerCase()}.`
              : `Ciao! Prima di decidere vorrei un contenuto di prova gratuito su ${config.serviceName.toLowerCase()}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isEnglish ? 'Or ask for a free sample first' : 'Oppure chiedi prima un contenuto di prova'}
          </a>
        </div>
      </section>

      {!isEnglish && <PublicFooter />}
      {!isEnglish && <FloatingNavigation />}
    </main>
  )
}
