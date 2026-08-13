import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock3, FileCheck2, Scale, ShieldCheck } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import WithdrawalForm from '@/components/WithdrawalForm'
import { SITE_URL } from '@/lib/site-config'
import styles from './recesso.module.css'

const META_TITLE = 'Recedere dal contratto qui | Social Automation'
const META_DESCRIPTION = 'Funzione online per comunicare il recesso consumer o la disdetta contrattuale e ricevere una ricevuta con data e ora.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/recesso` },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/recesso` },
  robots: { index: true, follow: true },
}

const EMAIL_URL = 'mailto:swsdautomation@gmail.com?subject=Assistenza%20recesso%20contratto'

export default function RecessoPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: META_TITLE,
    description: META_DESCRIPTION,
    url: `${SITE_URL}/recesso`,
    isPartOf: { '@type': 'WebSite', name: 'Social Automation', url: SITE_URL },
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={EMAIL_URL} ctaLabel="Assistenza" />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <nav className={styles.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Recesso e disdetta</span></nav>
          <p className={styles.eyebrow}><Scale size={15} aria-hidden="true" /> Procedura online</p>
          <h1>Recedere dal contratto qui.</h1>
          <p className={styles.lead}>Invia una dichiarazione inequivocabile e ricevi subito una ricevuta con contenuto, data e ora della trasmissione.</p>
          <div className={styles.proofRow}>
            <span><FileCheck2 size={17} aria-hidden="true" /> Due passaggi chiari</span>
            <span><Clock3 size={17} aria-hidden="true" /> Data e ora registrate</span>
            <span><ShieldCheck size={17} aria-hidden="true" /> Ricevuta conservabile</span>
          </div>
        </div>
      </section>

      <section className={styles.contentBand}>
        <div className={styles.contentGrid}>
          <aside className={styles.scope} aria-labelledby="scope-title">
            <p className={styles.sectionLabel}>AMBITO DI APPLICAZIONE</p>
            <h2 id="scope-title">La procedura cambia in base a chi ha acquistato.</h2>
            <div className={styles.scopeItem}>
              <CheckCircle2 size={19} aria-hidden="true" />
              <div><strong>Consumatori</strong><p>Persone fisiche che hanno acquistato per scopi estranei alla propria attivita professionale. Per i contratti online il termine ordinario e di 14 giorni, salvo eccezioni o proroghe previste dalla legge.</p></div>
            </div>
            <div className={styles.scopeItem}>
              <CheckCircle2 size={19} aria-hidden="true" />
              <div><strong>Imprese e professionisti</strong><p>La disciplina consumer non si applica agli acquisti effettuati nell&apos;attivita d&apos;impresa o professionale. Il modulo registra una disdetta secondo il contratto.</p></div>
            </div>
            <div className={styles.legalNote}>
              <strong>Servizio gia iniziato?</strong>
              <p>Il recesso puo comportare il pagamento proporzionale di quanto gia eseguito se l&apos;avvio anticipato e stato richiesto espressamente. Per un servizio integralmente eseguito possono operare le eccezioni di legge, previa verifica dei consensi raccolti.</p>
            </div>
          </aside>

          <WithdrawalForm />
        </div>
      </section>

      <section className={styles.references} aria-labelledby="references-title">
        <div>
          <p className={styles.sectionLabel}>RIFERIMENTI</p>
          <h2 id="references-title">Una funzione distinta dalla normale disdetta.</h2>
        </div>
        <p>La funzione recepisce gli articoli 52 e 54-bis del Codice del consumo. Non limita gli altri modi consentiti per comunicare il recesso e non sostituisce la verifica del singolo contratto.</p>
        <div className={styles.referenceLinks}>
          <a href="https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticoloDefault/originario?atto.codiceRedazionale=26G00002&atto.dataPubblicazioneGazzetta=2026-01-08&atto.tipoProvvedimento=DECRETO+LEGISLATIVO" target="_blank" rel="noreferrer">Art. 54-bis, Gazzetta Ufficiale</a>
          <a href="https://www.mimit.gov.it/it/mercato-e-consumatori/tutela-del-consumatore/diritti-del-consumatore/vendita-a-distanza" target="_blank" rel="noreferrer">Contratti a distanza, MIMIT</a>
          <Link href="/termini">Termini e condizioni SWA</Link>
        </div>
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
