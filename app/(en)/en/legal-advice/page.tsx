'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle2, Clock, FileCheck2, LockKeyhole, Scale, ShieldCheck, Sparkles } from 'lucide-react'
import CorsoAiActForm from '@/components/CorsoAiActForm'
import FloatingNavigation from '@/components/FloatingNavigation'
import styles from '@/styles/consulenza.module.css'

// La gemella inglese di /consulenza. Stessa pagina, stesso modulo, stessa
// rotta di pagamento: il modulo dichiara la lingua e Stripe rimanda qui, non
// sulla pagina italiana. I testi legali del sito restano in italiano dove
// sono atti; questa e' una pagina di servizio e si traduce per intero.

function AdviceForm() {
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
        body: JSON.stringify({ nome, email, telefono, messaggio, lingua: 'en' }),
      })
      const data = await response.json()
      if (!response.ok) { setError('Something went wrong. Please try again.'); setLoading(false); return }
      if (data.checkout_url) { window.location.href = data.checkout_url; return }
      if (data.demo) { setError('Not available in the demo environment.'); setLoading(false); return }
      setPending(true)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  if (esito === 'ok' || pending) {
    return (
      <div className={styles.formCard} id="book">
        <span className={styles.successIcon}><CheckCircle2 size={30} aria-hidden="true" /></span>
        <h2>{esito === 'ok' ? 'Payment received' : 'Request recorded'}</h2>
        <p>{esito === 'ok' ? 'The consultation is confirmed. You will receive instructions to arrange the appointment with the Studio BCS lawyer.' : 'We will contact you shortly to complete the booking.'}</p>
        <Link href="/en" className={styles.textLink}>Back to the home page <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    )
  }

  return (
    <div className={styles.formCard} id="book">
      <p className={styles.formEyebrow}><Scale size={14} aria-hidden="true" /> One-to-one consultation</p>
      <h2>Book a session with the lawyer.</h2>
      <div className={styles.price}><strong>€150</strong><span><Clock size={14} aria-hidden="true" /> 30 minutes</span></div>
      <ul className={styles.formProof}>
        <li><CheckCircle2 size={15} aria-hidden="true" /> Your case reviewed during the call</li>
        <li><CheckCircle2 size={15} aria-hidden="true" /> Supreme Court lawyer, Studio BCS</li>
        <li><CheckCircle2 size={15} aria-hidden="true" /> Secure payment with Stripe</li>
      </ul>

      {esito === 'annullato' && <p className={styles.error}>Payment cancelled. You can try again whenever you like.</p>}
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={submit}>
        <label>Full name<input value={nome} onChange={event => setNome(event.target.value)} required autoComplete="name" placeholder="Jane Smith" /></label>
        <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="jane@company.com" /></label>
        <label>Phone <span>(optional)</span><input value={telefono} onChange={event => setTelefono(event.target.value)} autoComplete="tel" placeholder="+44 ..." /></label>
        <label>Topic <span>(optional)</span><textarea value={messaggio} onChange={event => setMessaggio(event.target.value)} placeholder="E.g. AI Act, privacy, contracts, copyright..." /></label>
        <button type="submit" disabled={loading}>{loading ? 'Please wait…' : <>Pay €150 and book <ArrowRight size={17} aria-hidden="true" /></>}</button>
      </form>
      <p className={styles.secure}><ShieldCheck size={14} aria-hidden="true" /> Payment handled by Stripe. Advice delivered by Studio Legale BCS. The consultation is held in Italian or English, as you prefer.</p>
    </div>
  )
}

export default function LegalAdvicePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: 'AI Act and GDPR legal advice', serviceType: 'Legal advice', provider: { '@type': 'LegalService', name: 'Studio Legale BCS' }, areaServed: 'Italy', inLanguage: 'en', offers: { '@type': 'Offer', price: '150', priceCurrency: 'EUR' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.socialautomation.app/en' }, { '@type': 'ListItem', position: 2, name: 'AI legal advice', item: 'https://www.socialautomation.app/en/legal-advice' }] },
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}>
        <div className={styles.copy}>
          <nav className={styles.breadcrumbs}><Link href="/en">Home</Link><span>/</span><span>AI legal advice</span></nav>
          <p className={styles.eyebrow}>Studio Legale BCS × Social Web Automation</p>
          <h1>Legal advice on the AI Act, GDPR and digital technology.</h1>
          <p className={styles.lead}>A one-to-one session to frame your obligations, risks and next steps. The legal work is carried out by Avv. Vincenzo Sapone, Supreme Court lawyer at Studio Legale BCS.</p>
          <div className={styles.areas}>
            <article><ShieldCheck size={20} aria-hidden="true" /><div><h2>AI Act and GDPR</h2><p>Roles, risk, legal bases and data flows.</p></div></article>
            <article><FileCheck2 size={20} aria-hidden="true" /><div><h2>AI transparency</h2><p>Processes, responsibilities and documentation.</p></div></article>
            <article><LockKeyhole size={20} aria-hidden="true" /><div><h2>Copyright and contracts</h2><p>Licences, permitted uses, clauses and liability.</p></div></article>
          </div>
          <p className={styles.disclaimer}>The information on this site is for general guidance and does not replace advice on your specific case.</p>
        </div>
        <Suspense fallback={<div className={styles.formCard}>Loading…</div>}><AdviceForm /></Suspense>
      </section>
      <section className={styles.corso} id="ai-act-course" aria-labelledby="ai-act-course-title">
        <div className={styles.corsoCopy}>
          <p className={styles.corsoEyebrow}><Sparkles size={14} aria-hidden="true" /> Coming soon</p>
          <h2 id="ai-act-course-title">AI Act video courses, explained by someone who applies it.</h2>
          <p>
            The AI Act is already in force and its obligations arrive in stages. We are preparing a series of
            video courses with Avv. Vincenzo Sapone: short, in Italian, made for the people who actually run a
            business and have no time to read a European regulation.
          </p>
          <ul className={styles.corsoPunti}>
            <li>Which role you really have: provider, deployer, or neither</li>
            <li>Which obligations apply to you, and from when</li>
            <li>What to write in contracts with whoever supplies your AI</li>
            <li>Informing people: when it is required and how it is done</li>
            <li>What to keep on file in case someone asks</li>
            <li>How to set up the staff training the regulation requires</li>
          </ul>
          <p className={styles.disclaimer}>
            The courses are delivered in Italian. The content is for training purposes and does not replace advice on your specific case.
          </p>
        </div>
        <div className={styles.corsoForm}>
          <p className={styles.corsoPrezzo}><strong>€2,000</strong><span>per person, VAT excluded</span></p>
          <p className={styles.corsoFormTitolo}>Reserve your place</p>
          <p className={styles.corsoFormSub}>No payment now: the reservation gives you priority, and we notify you as soon as the first module is out.</p>
          <CorsoAiActForm locale="en" />
        </div>
      </section>
      <FloatingNavigation />
    </main>
  )
}
