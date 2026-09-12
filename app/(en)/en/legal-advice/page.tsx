'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle2, Clock, FileCheck2, LockKeyhole, Scale, ShieldCheck } from 'lucide-react'
import styles from '@/styles/consulenza.module.css'
import { CONSULENZA_LEGALE, CONSULENZA_PREZZO } from '@/lib/consulenza-listino'

// La gemella inglese di /consulenza. Stessa pagina, stesso modulo, stessa
// rotta di pagamento: il modulo dichiara la lingua e Stripe rimanda qui, non
// sulla pagina italiana. I testi legali del sito restano in italiano dove
// sono atti; questa e' una pagina di servizio e si traduce per intero.

// Gli stessi contenuti della pagina italiana, tradotti. Il blocco del corso e
// uscito da qui come di la: i corsi hanno una pagina propria e sono in
// italiano, quindi da una pagina inglese non si rimanda a un'offerta che chi
// legge non potrebbe seguire.
const CASES = [
  {
    area: 'Italian Law 132/2025, art. 13',
    voice: 'I use AI in my professional work. Do I have to tell my clients?',
    answer:
      'If you practise a regulated profession in Italy, yes — in advance, in clear and complete terms. What changes from one firm to another is when the duty applies, in what form, and how you keep proof of it.',
  },
  {
    area: 'Contracts',
    voice: 'My supplier sent a contract full of AI clauses. What am I signing?',
    answer:
      'Who answers when the tool gets it wrong, what happens to the data you put in, and who owns what comes out. Three lines at the bottom of the contract decide who pays when something goes wrong.',
  },
  {
    area: 'GDPR',
    voice: 'My clients’ data ends up in a US tool. Is that a problem?',
    answer:
      'It depends on which data, on what legal basis, and with which transfer safeguards. The real question is not whether it is forbidden, but what you need in writing before you carry on doing it.',
  },
  {
    area: 'Copyright',
    voice: 'I publish content made with AI. Who owns it?',
    answer:
      'You, the system, or nobody. It decides whether you can stop someone copying it, and whether you are exposed when you use it in advertising.',
  },
  {
    area: 'AI Act, art. 4',
    voice: 'I am told I have to train my staff. How much training is enough?',
    answer:
      'Since July 2026 the rule asks for measures proportionate to roles and context, not one certificate for everyone. The work is deciding what is enough for your organisation, and how to show it.',
  },
  {
    area: 'Liability',
    voice: 'I delivered work with an error that came from the tool. Where do I stand?',
    answer:
      'Your liability towards the client stays yours: the system’s output is not a defence. We look at what can still be done now, and at what to put in writing so it does not happen again.',
  },
]

const STEPS = [
  {
    title: 'Book and pay',
    text:
      'Fill in the form and pay by card. In the «topic» field write two lines about your case: it saves the first minutes of the session from being spent on context.',
  },
  {
    title: 'Set the time',
    text:
      'Straight after payment you receive by email what you need to agree a day and time with the firm.',
  },
  {
    title: 'Talk to the lawyer',
    text:
      `${CONSULENZA_LEGALE.durataMinuti} minutes with Avv. Vincenzo Sapone, Supreme Court lawyer at Studio Legale BCS. In Italian or English, as you prefer.`,
  },
]

const DATES = [
  {
    when: '10 October 2025',
    what: 'Italian Law 132/2025 enters into force. Article 13 requires regulated professionals to inform their clients about the use of AI systems, in advance and in clear, plain and complete terms.',
  },
  {
    when: '27 July 2026',
    what: 'The Digital Omnibus (Regulation (EU) 2026/1744) recasts Article 4 of the AI Act: staff AI literacy becomes an obligation of means rather than of result. It does not disappear — it is measured differently.',
  },
  {
    when: '2 August 2026',
    what: 'The AI Act obligations that apply to organisations deploying AI, not only to those building it, become applicable.',
  },
]

const QUESTIONS = [
  {
    q: 'Who gives the advice?',
    a: 'Avv. Vincenzo Sapone, Supreme Court lawyer at Studio Legale BCS. The legal work belongs to the firm: Social Web Automation handles the technology and the booking.',
  },
  {
    q: 'What does it cost and what is included?',
    a: `${CONSULENZA_PREZZO} excluding VAT for ${CONSULENZA_LEGALE.durataMinuti} minutes on your case. If wider work comes out of it — a written opinion, a contract review, a compliance project — it is quoted separately and it is your call.`,
  },
  {
    q: 'Which law are we talking about?',
    a: 'Italian and European law. Studio Legale BCS practises in Italy: if your situation is governed by another jurisdiction, the session can still frame the European side of it, and that will be said plainly.',
  },
  {
    q: 'Which language is the session held in?',
    a: 'Italian or English, whichever you prefer. Say so in the topic field when you book.',
  },
  {
    q: 'Do you also run training?',
    a: 'Yes, and it is a different thing from this. The courses are delivered in Italian and have their own page on the Italian site.',
  },
  {
    q: 'Does this page count as legal advice?',
    a: 'No. It is here to help you get your bearings. Advice concerns your specific case and is given during the session, once your documents have been seen.',
  },
]

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
      <div className={styles.price}><strong>{CONSULENZA_PREZZO}</strong><span><Clock size={14} aria-hidden="true" /> {CONSULENZA_LEGALE.durataMinuti} minutes</span></div>
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
        <button type="submit" disabled={loading}>{loading ? 'Please wait…' : <>Pay {CONSULENZA_PREZZO} and book <ArrowRight size={17} aria-hidden="true" /></>}</button>
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
      {
        '@type': 'FAQPage',
        inLanguage: 'en',
        mainEntity: QUESTIONS.map(voce => ({
          '@type': 'Question',
          name: voce.q,
          acceptedAnswer: { '@type': 'Answer', text: voce.a },
        })),
      },
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
      <section className={styles.sezione} id="when-it-helps" aria-labelledby="when-it-helps-title">
        <div className={styles.intestazione}>
          <h2 id="when-it-helps-title">The questions people call about.</h2>
          <p>
            They arrive worded more or less like this. If you recognise one, half an hour
            with a lawyer beats another month of searching online.
          </p>
        </div>
        <ul className={styles.casi}>
          {CASES.map(caso => (
            <li key={caso.voice}>
              <span className={styles.casoNorma}>{caso.area}</span>
              <p className={styles.casoVoce}>«{caso.voice}»</p>
              <p className={styles.casoRisposta}>{caso.answer}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.sezione} id="how-it-works" aria-labelledby="how-it-works-title">
        <div className={styles.intestazione}>
          <h2 id="how-it-works-title">How the session runs.</h2>
          <p>One to one, not a webinar. We talk about your case and about what to do on Monday morning.</p>
        </div>
        <ol className={styles.passi}>
          {STEPS.map(passo => (
            <li key={passo.title}>
              <h3>{passo.title}</h3>
              <p>{passo.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.sezione} id="dates" aria-labelledby="dates-title">
        <div className={styles.intestazione}>
          <h2 id="dates-title">The dates that have already passed.</h2>
          <p>
            This is not a framework that is coming: it is in force. Anyone using AI tools at
            work is already inside these obligations.
          </p>
        </div>
        <ul className={styles.scadenze}>
          {DATES.map(voce => (
            <li key={voce.when}>
              <p className={styles.scadenzaQuando}>{voce.when}</p>
              <p className={styles.scadenzaCosa}>{voce.what}</p>
            </li>
          ))}
        </ul>
        <p className={styles.disclaimer}>
          These references are here to help you get your bearings. Which obligation actually
          falls on your organisation depends on what you do and with which tools — which is
          exactly what the session establishes.
        </p>
      </section>

      <section className={styles.sezione} aria-labelledby="questions-title">
        <div className={styles.intestazione}>
          <h2 id="questions-title">Before you book.</h2>
        </div>
        <div className={styles.domande}>
          {QUESTIONS.map(voce => (
            <details key={voce.q}>
              <summary>{voce.q}</summary>
              <p>{voce.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.chiusura}>
        <h2>Half an hour spent well costs less than a year spent hoping.</h2>
        <p>
          {CONSULENZA_PREZZO} excluding VAT, with Avv. Vincenzo Sapone. If more work is
          needed after the session he will tell you — and he will also tell you when it is not.
        </p>
        <div className={styles.chiusuraAzioni}>
          <a className={styles.chiusuraPrimaria} href="#book">
            Book the session <ArrowRight size={16} aria-hidden="true" />
          </a>
          <Link className={styles.chiusuraSecondaria} href="/en/contact">Ask a question first</Link>
        </div>
      </section>

    </main>
  )
}
