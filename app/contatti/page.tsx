import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '../content-page.module.css'

// Pagina contatti.
//
// Mancava, ed era il bersaglio di due chiamate all’azione che finivano su un
// 404. Serve anche a un secondo scopo: dichiarare dove lavoriamo davvero.
// Esiste un’agenzia omonima in un’altra provincia, e i territori nominati sono
// il segnale che distingue le due imprese agli occhi di un motore.

const title = 'Contatti: dove siamo e come raggiungerci | SWA'
const description =
  'Social Web Automation, Cermenate (CO): telefono, WhatsApp, email e PEC. Lavoriamo con imprese di Como, Milano, Monza e Brianza, Varese e in tutta Italia.'

const AREE = [
  'Provincia di Como',
  'Città metropolitana di Milano',
  'Monza e Brianza',
  'Provincia di Varese',
  'Resto d’Italia, da remoto',
]

const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei parlare di un progetto con Social Web Automation.')}`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/contatti`, languages: { 'it-IT': `${SITE_URL}/contatti`, en: `${SITE_URL}/en/contact`, 'x-default': `${SITE_URL}/contatti` } },
  openGraph: { title, description, url: `${SITE_URL}/contatti`, type: 'website' , images: ['/og.png']},
  twitter: { card: 'summary_large_image', title, description },
}

export default function ContattiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${SITE_URL}/contatti#webpage`,
        url: `${SITE_URL}/contatti`,
        name: title,
        description,
        inLanguage: 'it-IT',
        about: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Contatti', item: `${SITE_URL}/contatti` },
        ],
      },
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={wa} ctaLabel="Scrivici su WhatsApp" />

      <section className={styles.hero}>
        <nav className={styles.breadcrumbs} aria-label="Percorso">
          <Link href="/">Home</Link><span>/</span><span>Contatti</span>
        </nav>
        <p className={styles.eyebrow}>Contatti</p>
        <h1>Risponde una persona, non un centralino.</h1>
        <p className={styles.lead}>
          Social Web Automation è la ditta individuale di Marco Dibenedetto, con sede a Cermenate
          in provincia di Como. Il modo più veloce per iniziare è raccontare come lavori oggi:
          ti diciamo quali aree hanno senso per te e quali puoi lasciare stare.
        </p>
        <div className={styles.heroActions}>
          <a className={styles.primary} href={wa} target="_blank" rel="noopener noreferrer">
            Scrivici su WhatsApp <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a className={styles.secondary} href={`mailto:${TITOLARE.email}`}>Scrivi una email</a>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Come raggiungerci</p>
          <h2>Quattro modi, nessun modulo obbligatorio</h2>
          <p>Scegli quello che ti è più comodo. Per le comunicazioni formali c’è la PEC.</p>
        </div>
        <div className={styles.stepGrid}>
          <article>
            <span><MessageCircle size={15} aria-hidden="true" /> WhatsApp</span>
            <h3><a href={wa} target="_blank" rel="noopener noreferrer">{TITOLARE.telefono}</a></h3>
            <p>
              Il canale più rapido: scrivi che cosa fai e che problema vuoi risolvere.
              Rispondiamo negli orari di lavoro, in italiano.
            </p>
          </article>
          <article>
            <span><Phone size={15} aria-hidden="true" /> Telefono</span>
            <h3><a href={`tel:${TITOLARE.telefono.replace(/\s/g, '')}`}>{TITOLARE.telefono}</a></h3>
            <p>
              Stesso numero. Se stiamo lavorando con un cliente non sempre rispondiamo
              al primo squillo: lascia un messaggio e richiamiamo.
            </p>
          </article>
          <article>
            <span><Mail size={15} aria-hidden="true" /> Email</span>
            <h3><a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a></h3>
            <p>
              Per preventivi, materiali e domande che richiedono allegati.
              È l’indirizzo a cui arrivano anche le richieste dal sito.
            </p>
          </article>
          <article>
            <span><Mail size={15} aria-hidden="true" /> PEC</span>
            <h3><a href={`mailto:${TITOLARE.pec}`}>{TITOLARE.pec}</a></h3>
            <p>
              Per le comunicazioni formali: contratti, recessi, contestazioni.
              Fa fede la data di consegna della posta certificata.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Dove lavoriamo</p>
          <h2>In Brianza di persona, nel resto d’Italia da remoto</h2>
          <p>
            Le riprese in azienda e i sopralluoghi si fanno sul posto, quindi la vicinanza conta.
            Tutto il resto — contenuti, sito, assistente telefonico, sistemi — funziona uguale
            a qualsiasi distanza.
          </p>
        </div>
        <div className={styles.stepGrid}>
          {AREE.map((area, i) => (
            <article key={area}>
              <span><MapPin size={15} aria-hidden="true" /> {String(i + 1).padStart(2, '0')}</span>
              <h3>{area}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Dati dell’impresa</p>
          <h2>Chi firma i contratti</h2>
        </div>
        <div className={styles.stepGrid}>
          <article>
            <span>Impresa</span>
            <h3>{TITOLARE.ragioneSociale}</h3>
            <p>Sede legale: {TITOLARE.sedeLegale}</p>
          </article>
          <article>
            <span>Identificativi</span>
            <h3>P.IVA {TITOLARE.partitaIva}</h3>
            <p>Codice fiscale {TITOLARE.codiceFiscale}.</p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Se preferisci partire dal tuo mestiere</p>
          <h2>Undici settori, con la loro pagina</h2>
          <p>
            Ognuna dice quali servizi servono davvero in quella categoria e quali no.
            {' '}<Link href="/settori">Vedi tutti i settori</Link>.
          </p>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>Prima di chiamare</p>
          <h2>Non serve sapere già che cosa ti serve.</h2>
          <p>Raccontaci com’è organizzata la tua giornata: da lì si capisce quale area conviene toccare per prima.</p>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer">
          Scrivici su WhatsApp <ArrowRight size={17} aria-hidden="true" />
        </a>
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
