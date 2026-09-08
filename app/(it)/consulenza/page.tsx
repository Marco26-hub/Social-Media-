'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle2, Clock, FileCheck2, LockKeyhole, Scale, ShieldCheck, Sparkles } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import CorsoAiActForm from '@/components/CorsoAiActForm'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import styles from '@/styles/consulenza.module.css'
import { CONSULENZA_PREZZO } from '@/lib/consulenza-listino'

const WHATSAPP_URL = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei informazioni sulla consulenza legale AI e GDPR con Studio BCS.')}`

function ConsulenzaForm() {
  const params = useSearchParams()
  const esito = params.get('esito')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(''); setLoading(true)
    try {
      const response = await fetch('/api/consulenza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefono, messaggio }),
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Errore. Riprova.'); setLoading(false); return }
      if (data.checkout_url) { window.location.href = data.checkout_url; return }
      if (data.demo) { setError(data.message || 'Non disponibile in demo.'); setLoading(false); return }
      setPending(true)
    } catch {
      setError('Errore di rete. Riprova.')
      setLoading(false)
    }
  }

  if (esito === 'ok' || pending) {
    return (
      <div className={styles.formCard} id="prenota">
        <span className={styles.successIcon}><CheckCircle2 size={30} aria-hidden="true" /></span>
        <h2>{esito === 'ok' ? 'Pagamento ricevuto' : 'Richiesta registrata'}</h2>
        <p>{esito === 'ok' ? 'La consulenza è confermata. Riceverai le indicazioni per fissare l’appuntamento con il professionista dello Studio BCS.' : 'Ti contattiamo a breve per completare la prenotazione.'}</p>
        <Link href="/" className={styles.textLink}>Torna alla Home <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    )
  }

  return (
    <div className={styles.formCard} id="prenota">
      <p className={styles.formEyebrow}><Scale size={14} aria-hidden="true" /> Consulenza individuale</p>
      <h2>Prenota il confronto con il professionista.</h2>
      <div className={styles.price}><strong>€150</strong><span><Clock size={14} aria-hidden="true" /> 30 minuti</span></div>
      <ul className={styles.formProof}>
        <li><CheckCircle2 size={15} aria-hidden="true" /> Analisi del caso durante la call</li>
        <li><CheckCircle2 size={15} aria-hidden="true" /> Avvocato Cassazionista Studio BCS</li>
        <li><CheckCircle2 size={15} aria-hidden="true" /> Pagamento sicuro con Stripe</li>
      </ul>

      {esito === 'annullato' && <p className={styles.error}>Pagamento annullato. Puoi riprovare quando vuoi.</p>}
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={submit}>
        <label>Nome e cognome<input value={nome} onChange={event => setNome(event.target.value)} required autoComplete="name" placeholder="Mario Rossi" /></label>
        <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="mario@azienda.it" /></label>
        <label>Telefono <span>(opzionale)</span><input value={telefono} onChange={event => setTelefono(event.target.value)} autoComplete="tel" placeholder="+39 ..." /></label>
        <label>Argomento <span>(opzionale)</span><textarea value={messaggio} onChange={event => setMessaggio(event.target.value)} placeholder="Es. AI Act, privacy, contratti, copyright..." /></label>
        <button type="submit" disabled={loading}>{loading ? 'Attendi…' : <>Paga {CONSULENZA_PREZZO} e prenota <ArrowRight size={17} aria-hidden="true" /></>}</button>
      </form>
      <p className={styles.secure}><ShieldCheck size={14} aria-hidden="true" /> Pagamento gestito da Stripe. Consulenza erogata dallo Studio Legale BCS.</p>
    </div>
  )
}

export default function ConsulenzaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: 'Consulenza legale AI Act e GDPR', serviceType: 'Consulenza legale', provider: { '@type': 'LegalService', name: 'Studio Legale BCS' }, areaServed: 'Italia', offers: { '@type': 'Offer', price: '150', priceCurrency: 'EUR' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.socialautomation.app' }, { '@type': 'ListItem', position: 2, name: 'Consulenza legale AI', item: 'https://www.socialautomation.app/consulenza' }] },
      // Il corso e' pubblicato con un prezzo e un modulo di prenotazione e non
      // era marcato. Non e' un Event: la pagina dice «in arrivo» e non esistono
      // data ne' luogo, che per Event sono obbligatori — inventarli sarebbe un
      // dato falso. Course con disponibilita' in preordine descrive lo stato
      // reale: si prenota, non si paga adesso.
      {
        '@type': 'Course',
        '@id': 'https://www.socialautomation.app/consulenza#corso-ai-act',
        name: 'Video corsi AI Act per piccole e medie imprese',
        description:
          'Serie di moduli video sugli obblighi dell’AI Act per le PMI: quale ruolo ha l’azienda fra fornitore e utilizzatore, quali obblighi scattano e da quando, che cosa scrivere nei contratti con chi fornisce AI, quando informare le persone, che cosa tenere agli atti e come impostare la formazione del personale.',
        url: 'https://www.socialautomation.app/consulenza#corso-ai-act',
        inLanguage: 'it-IT',
        provider: { '@id': 'https://www.socialautomation.app/#organization' },
        teaches: [
          'Ruolo di fornitore e di utilizzatore ai sensi del regolamento (UE) 2024/1689',
          'Calendario degli obblighi e delle scadenze applicative',
          'Clausole contrattuali con i fornitori di sistemi AI',
          'Obblighi di trasparenza verso le persone',
          'Documentazione da conservare',
          'Alfabetizzazione AI del personale',
        ],
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
        offers: {
          '@type': 'Offer',
          price: '2000',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/PreOrder',
          url: 'https://www.socialautomation.app/consulenza#corso-ai-act',
          seller: { '@id': 'https://www.socialautomation.app/#organization' },
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: '2000',
            priceCurrency: 'EUR',
            valueAddedTaxIncluded: false,
          },
        },
      },
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={WHATSAPP_URL} ctaLabel="Chiedi informazioni" />
      <section className={styles.hero}>
        <div className={styles.copy}>
          <nav className={styles.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Consulenza legale AI</span></nav>
          <p className={styles.eyebrow}>Studio Legale BCS × Social Web Automation</p>
          <h1>Consulenza legale su AI Act, GDPR e tecnologie digitali.</h1>
          <p className={styles.lead}>Un confronto individuale per inquadrare obblighi, rischi e prossimi passi. L’attività legale è svolta dall’Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS.</p>
          <div className={styles.areas}>
            <article><ShieldCheck size={20} aria-hidden="true" /><div><h2>AI Act e GDPR</h2><p>Ruoli, rischio, basi giuridiche e flussi di dati.</p></div></article>
            <article><FileCheck2 size={20} aria-hidden="true" /><div><h2>Trasparenza AI</h2><p>Processi, responsabilità e documentazione.</p></div></article>
            <article><LockKeyhole size={20} aria-hidden="true" /><div><h2>Copyright e contratti</h2><p>Licenze, utilizzi, clausole e responsabilità.</p></div></article>
          </div>
          <p className={styles.disclaimer}>Le informazioni del sito hanno finalità informative e non sostituiscono il parere sul caso concreto.</p>
        </div>
        <Suspense fallback={<div className={styles.formCard}>Caricamento…</div>}><ConsulenzaForm /></Suspense>
      </section>
      <section className={styles.corso} id="corso-ai-act" aria-labelledby="corso-ai-act-titolo">
        <div className={styles.corsoCopy}>
          <p className={styles.corsoEyebrow}><Sparkles size={14} aria-hidden="true" /> In arrivo</p>
          <h2 id="corso-ai-act-titolo">Video corsi AI Act, spiegati da chi li applica.</h2>
          <p>
            L’AI Act è già in vigore e gli obblighi arrivano a scaglioni. Stiamo preparando una serie
            di video corsi con l’Avv. Vincenzo Sapone: brevi, in italiano, pensati per chi l’azienda
            la manda avanti e non ha tempo di leggere un regolamento europeo.
          </p>
          <ul className={styles.corsoPunti}>
            <li>Che ruolo hai davvero: fornitore, utilizzatore o nessuno dei due</li>
            <li>Quali obblighi scattano per te, e da quando</li>
            <li>Che cosa scrivere nei contratti con chi ti fornisce AI</li>
            <li>Informare le persone: quando serve e come si fa</li>
            <li>Che cosa tenere agli atti se qualcuno te lo chiede</li>
            <li>Come impostare la formazione del personale prevista dal regolamento</li>
          </ul>
          <p className={styles.disclaimer}>
            I contenuti hanno finalità formativa e non sostituiscono il parere sul caso concreto.
          </p>
        </div>
        <div className={styles.corsoForm}>
          <p className={styles.corsoPrezzo}><strong>2.000 €</strong><span>a persona, IVA esclusa</span></p>
          <p className={styles.corsoFormTitolo}>Prenota il tuo posto</p>
          <p className={styles.corsoFormSub}>Nessun pagamento adesso: la prenotazione ti dà la precedenza e ti avvisiamo appena esce il primo modulo.</p>
          <CorsoAiActForm />
        </div>
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
