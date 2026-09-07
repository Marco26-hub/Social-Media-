import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail, MessageCircle } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { SWA_BLOG_ARTICLES } from '@/lib/swa-blog-content'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '../../content-page.module.css'

// Pagina autore.
//
// Sette articoli erano firmati «Marco Dibenedetto» e puntavano a /chi-siamo,
// che descrive l'impresa e non la persona. Per un motore l'autore era una
// stringa: nessun @id, nessun sameAs, nessuna competenza dichiarata. Qui la
// persona diventa un'entita' collegata all'impresa e agli articoli che firma.

const title = 'Marco Dibenedetto, titolare di Social Web Automation | SWA'
const description =
  'Chi firma gli articoli e i progetti di Social Web Automation: Marco Dibenedetto, titolare, Cermenate (CO). Di che cosa si occupa, come lavora e come raggiungerlo.'

const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao Marco! Ho letto la tua pagina sul sito e vorrei parlarti di un progetto.')}`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/autore/marco-dibenedetto` },
  openGraph: { title, description, url: `${SITE_URL}/autore/marco-dibenedetto`, type: 'profile' },
  twitter: { card: 'summary_large_image', title, description },
}

const COMPETENZE = [
  { t: 'Gestione social per PMI', d: 'Piano editoriale, produzione, approvazione del cliente e pubblicazione su 2 canali, con il ciclo mensile descritto nel metodo.' },
  { t: 'SEO e GEO', d: 'Struttura, intenti, entita e dati strutturati, perche una pagina sia comprensibile a un motore di ricerca e citabile da un sistema di risposta AI.' },
  { t: 'Assistenti telefonici e recupero clienti', d: 'Configurazione della risposta al telefono e dei richiami su WhatsApp, con le regole scritte dal cliente prima dell’attivazione.' },
  { t: 'Automazione dei processi', d: 'Collegamento fra gestionali, moduli e archivi esistenti, per togliere i passaggi in cui lo stesso dato viene riscritto piu volte.' },
  { t: 'Trasparenza nell’uso dell’AI', d: 'Che cosa viene prodotto con assistenza AI, chi risponde delle scelte e che cosa non viene mai automatizzato. Le questioni legali passano dal partner abilitato.' },
  { t: 'Siti e e-commerce', d: 'Landing page, siti aziendali e negozi online, con la SEO tecnica di base e il passaggio di proprieta dopo 12 mesi di canone.' },
]

export default function AutorePage() {
  const articoli = SWA_BLOG_ARTICLES.filter(a => a.autore === 'Marco Dibenedetto')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/autore/marco-dibenedetto#webpage`,
        url: `${SITE_URL}/autore/marco-dibenedetto`,
        name: title,
        description,
        inLanguage: 'it-IT',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${SITE_URL}/#marco-dibenedetto` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Autore', item: `${SITE_URL}/autore/marco-dibenedetto` },
        ],
      },
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={wa} ctaLabel="Scrivimi su WhatsApp" />

      <section className={styles.hero}>
        <nav className={styles.breadcrumbs} aria-label="Percorso">
          <Link href="/">Home</Link><span>/</span><span>Autore</span>
        </nav>
        <p className={styles.eyebrow}>Chi firma</p>
        <h1>Marco Dibenedetto, titolare di Social Web Automation.</h1>
        <p className={styles.lead}>
          Social Web Automation è la mia ditta individuale, con sede a Cermenate in provincia
          di Como. Firmo io gli articoli del Journal e rispondo io delle scelte che finiscono
          nei progetti dei clienti: che cosa viene prodotto, che cosa resta fuori e che cosa
          non viene mai automatizzato.
        </p>
        <div className={styles.heroActions}>
          <a className={styles.primary} href={wa} target="_blank" rel="noopener noreferrer">
            Scrivimi su WhatsApp <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a className={styles.secondary} href={`mailto:${TITOLARE.email}`}>
            <Mail size={15} aria-hidden="true" /> Scrivimi una email
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Come lavoro</p>
          <h2>Una persona sola davanti al cliente, specialisti dietro.</h2>
          <p>
            Strategia, direzione e responsabilità restano mie. Riprese, sviluppo e le
            questioni legali passano da professionisti selezionati: le consulenze su AI Act
            e GDPR le eroga lo Studio Legale BCS, con l’Avv. Vincenzo Sapone, cassazionista.
            Quello che scrivo qui non sostituisce un parere legale.
          </p>
        </div>
        <div className={styles.stepGrid}>
          {COMPETENZE.map((c, i) => (
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
          <p className={styles.eyebrow}>Che cosa non prometto</p>
          <h2>Le tre frasi che non troverete mai qui.</h2>
        </div>
        <div className={styles.stepGrid}>
          <article>
            <span>01</span>
            <h3>«Ti porto in prima pagina»</h3>
            <p>
              Nessun fornitore controlla l’algoritmo di Google né quello di un sistema di
              risposta AI. Si lavora su struttura, qualità e chiarezza: la posizione la
              decidono altri.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>«Ti garantisco X appuntamenti»</h3>
            <p>
              La ricerca clienti consegna aziende verificate con fonti e priorità. Il
              contatto commerciale lo fai tu, e il mercato risponde come vuole.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>«Ci pensa l’intelligenza artificiale»</h3>
            <p>
              L’AI accelera analisi e produzione. La direzione, la verifica e l’approvazione
              prima della pubblicazione restano decisioni di una persona.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>«Il prezzo lo vediamo dopo»</h3>
            <p>
              I prezzi d’ingresso sono pubblici sulla pagina dei servizi. Le aree senza
              listino sono dichiarate come «su preventivo», non lasciate in bianco.
            </p>
          </article>
        </div>
      </section>

      {articoli.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Journal</p>
            <h2>Gli articoli che ho scritto.</h2>
            <p>{articoli.length} approfondimenti pubblicati, tutti firmati e datati.</p>
          </div>
          <div className={styles.stepGrid}>
            {articoli.map((a, i) => (
              <article key={a.slug}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3><Link href={`/blog/${a.slug}`}>{a.h1}</Link></h3>
                <p>{a.meta_description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Dati dell’impresa</p>
          <h2>Con chi firmi il contratto.</h2>
        </div>
        <div className={styles.stepGrid}>
          <article>
            <span>Impresa</span>
            <h3>{TITOLARE.ragioneSociale}</h3>
            <p>Sede legale: {TITOLARE.sedeLegale}</p>
          </article>
          <article>
            <span>Partita IVA</span>
            <h3>{TITOLARE.partitaIva}</h3>
            <p>
              È l’identificativo che distingue questa impresa da altre di nome simile.
              Per le comunicazioni formali c’è la PEC: {TITOLARE.pec}.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>Parliamone</p>
          <h2>Raccontami come lavori oggi.</h2>
          <p>Da lì si capisce quale area conviene toccare per prima, e quali puoi lasciare stare.</p>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={17} aria-hidden="true" /> Scrivimi su WhatsApp
        </a>
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
