import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Scale,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import { SITE_URL } from '@/lib/site-config'
import { TITOLARE } from '@/lib/legal-config'
import styles from './chi-siamo.module.css'

const META_TITLE = 'Chi siamo | Social Automation, Cermenate (Como)'
const META_DESCRIPTION =
  'Conosci Social Automation di Marco Dibenedetto: gestione social media, SEO, GEO e siti per PMI, da Cermenate (Como) in tutta Italia.'

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

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Chi siamo',
      item: `${SITE_URL}/chi-siamo`,
    },
  ],
}

export default function ChiSiamoPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Social Automation, home">
          <span className={styles.logoShell}>
            <Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} priority />
          </span>
          <span>Social Automation</span>
        </Link>
        <nav aria-label="Navigazione pagina">
          <Link href="/">Home</Link>
          <Link href="/servizi">Servizi e pacchetti</Link>
          <Link href="/blog">SWA Journal</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="about-title">
        <div>
          <p className={styles.eyebrow}><MapPin size={16} aria-hidden="true" /> Cermenate, provincia di Como</p>
          <h1 id="about-title">Una regia digitale concreta per PMI e professionisti.</h1>
          <p className={styles.lead}>
            Social Automation è il servizio di gestione social media fondato da
            Marco Dibenedetto. Da Cermenate lavoriamo con imprese e professionisti
            in tutta Italia, coordinando strategia, contenuti, pubblicazione, SEO,
            GEO, siti ed e-commerce.
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

        <div className={styles.identity} aria-label="Dati principali Social Automation">
          <Image src="/brand/swa-logo-official.png" alt="Logo SWA Social Automation" width={260} height={119} priority />
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
          <h2 id="method-title">Tecnologia dove accelera. Persone dove conta.</h2>
          <p>
            L’intelligenza artificiale supporta analisi e produzione, ma obiettivi,
            tono del brand e pubblicazione restano sotto controllo umano.
          </p>
        </div>
        <div className={styles.steps}>
          <article>
            <Workflow size={24} aria-hidden="true" />
            <h3>Processo gestito</h3>
            <p>Analisi, calendario, produzione, revisioni e pubblicazione seguono un flusso unico e verificabile.</p>
          </article>
          <article>
            <ShieldCheck size={24} aria-hidden="true" />
            <h3>Approvazione umana</h3>
            <p>Il cliente controlla i contenuti prima della pubblicazione e mantiene la responsabilità editoriale.</p>
          </article>
          <article>
            <MessageCircle size={24} aria-hidden="true" />
            <h3>Rapporto diretto</h3>
            <p>Pacchetti, attività incluse, revisioni e budget pubblicitari vengono dichiarati con chiarezza.</p>
          </article>
        </div>
      </section>

      <section className={styles.services} aria-labelledby="expertise-title">
        <div>
          <p className={styles.eyebrow}>Competenze coordinate</p>
          <h2 id="expertise-title">Dalla presenza social alla visibilità organica.</h2>
          <p>
            Non vendiamo un semplice strumento. Gestiamo attività operative che
            normalmente richiedono più fornitori e le colleghiamo a un’unica
            direzione commerciale.
          </p>
        </div>
        <ul>
          <li><CheckCircle2 size={18} aria-hidden="true" /> Gestione social media multicanale</li>
          <li><CheckCircle2 size={18} aria-hidden="true" /> Piano editoriale, copy, grafiche e video brevi</li>
          <li><CheckCircle2 size={18} aria-hidden="true" /> SEO e GEO per motori di ricerca e sistemi AI</li>
          <li><CheckCircle2 size={18} aria-hidden="true" /> Siti web, landing page ed e-commerce</li>
          <li><CheckCircle2 size={18} aria-hidden="true" /> Campagne ADS con budget separato</li>
          <li><CheckCircle2 size={18} aria-hidden="true" /> Report e confronto strategico periodico</li>
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

      <section className={styles.cta}>
        <h2>Valutiamo insieme il punto di partenza.</h2>
        <p>Raccontaci obiettivi, canali e attività già in corso. Ti indichiamo il perimetro più adatto senza promesse irrealistiche.</p>
        <Link href="/servizi#pacchetti" className={styles.primary}>
          Confronta i pacchetti <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <footer className={styles.footer}>
        <p>{TITOLARE.ragioneSociale} · P.IVA {TITOLARE.partitaIva} · Cermenate (CO)</p>
        <div><Link href="/blog">Journal</Link><Link href="/privacy">Privacy</Link><Link href="/termini">Termini</Link></div>
      </footer>
    </main>
  )
}
