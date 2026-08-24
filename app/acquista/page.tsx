'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from 'lucide-react'
import TurnstileWidget from '@/components/TurnstileWidget'
import { standaloneServiceBySlug } from '@/lib/standalone-services'
import styles from './acquista.module.css'

function CheckoutForm() {
  const params = useSearchParams()
  const service = useMemo(() => standaloneServiceBySlug(params.get('servizio')), [params])
  const [nome, setNome] = useState('')
  const [azienda, setAzienda] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [customerType, setCustomerType] = useState<'impresa_professionista' | 'consumatore'>('impresa_professionista')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [earlyPerformanceRequested, setEarlyPerformanceRequested] = useState(false)
  const [withdrawalLossAcknowledged, setWithdrawalLossAcknowledged] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [website, setWebsite] = useState('')
  const [openedAt] = useState(() => Date.now())
  const [error, setError] = useState(params.get('annullato') ? 'Pagamento annullato. Nessun addebito e stato effettuato.' : '')
  const [loading, setLoading] = useState(false)

  if (!service) {
    return (
      <main className={styles.shell}>
        <section className={styles.invalid}>
          <h1>Servizio non riconosciuto</h1>
          <p>Scegli il servizio dalla pagina ufficiale prima di procedere al pagamento.</p>
          <Link href="/servizi"><ArrowLeft size={17} /> Torna ai servizi</Link>
        </section>
      </main>
    )
  }

  const servicePage = service.slug === 'blog-seo'
    ? '/servizi/blog-seo'
    : service.slug === 'web-commerce'
      ? '/servizi/siti-e-commerce'
      : '/servizi/ricerca-clienti-b2b'

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/checkout/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_slug: service?.slug,
          nome,
          azienda,
          email,
          telefono,
          customer_type: customerType,
          terms_accepted: termsAccepted,
          early_performance_requested: earlyPerformanceRequested,
          withdrawal_loss_acknowledged: withdrawalLossAcknowledged,
          turnstile_token: turnstileToken,
          website,
          elapsed_ms: Date.now() - openedAt,
        }),
      })
      const data = await response.json() as { error?: string; checkout_url?: string }
      if (!response.ok || !data.checkout_url) {
        setError(data.error || 'Pagamento non disponibile. Riprova tra poco.')
        setLoading(false)
        return
      }
      window.location.assign(data.checkout_url)
    } catch {
      setError('Connessione non disponibile. Riprova tra poco.')
      setLoading(false)
    }
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" aria-label="Social Automation, home">
          <Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} priority />
          <span>Social Automation</span>
        </Link>
        <span><LockKeyhole size={15} /> Checkout protetto da Stripe</span>
      </header>

      <div className={styles.layout}>
        <aside className={styles.summary}>
          <Link href={servicePage} className={styles.back}>
            <ArrowLeft size={16} /> Torna al servizio
          </Link>
          <p className={styles.eyebrow}>Riepilogo ordine</p>
          <h1>{service.shortName}</h1>
          <p>{service.description}</p>
          <div className={styles.price}><strong>{service.displayPrice}</strong><span>{service.cadenceLabel}</span></div>
          <ul>{service.features.map(feature => <li key={feature}><Check size={17} />{feature}</li>)}</ul>
          <div className={styles.onboarding}><strong>Dopo il pagamento</strong><p>{service.onboarding}</p></div>
          <p className={styles.renewal}>{service.billingMode === 'subscription'
            ? <>Rinnovo mensile. Puoi disdire per il periodo successivo dalla funzione <Link href="/recesso">Recesso e disdetta</Link>.</>
            : 'Pagamento unico per il perimetro del Pilot indicato. Nessun rinnovo automatico.'}</p>
        </aside>

        <section className={styles.formPanel}>
          <p className={styles.eyebrow}>Dati di fatturazione</p>
          <h2>Completa l’ordine</h2>
          <p>Inserisci i dati corretti. Il pagamento avverra nella pagina Stripe successiva.</p>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <form onSubmit={submit}>
            <span className={styles.label}>Acquisti come</span>
            <div className={styles.segmented}>
              <button type="button" aria-pressed={customerType === 'impresa_professionista'} onClick={() => setCustomerType('impresa_professionista')}>Impresa o professionista</button>
              <button type="button" aria-pressed={customerType === 'consumatore'} onClick={() => setCustomerType('consumatore')}>Consumatore</button>
            </div>
            <label>Nome e cognome<input value={nome} onChange={event => setNome(event.target.value)} autoComplete="name" required /></label>
            <label>Azienda {customerType === 'consumatore' && <span>(opzionale)</span>}<input value={azienda} onChange={event => setAzienda(event.target.value)} autoComplete="organization" required={customerType === 'impresa_professionista'} /></label>
            <div className={styles.fieldsRow}>
              <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
              <label>Telefono <span>(opzionale)</span><input type="tel" value={telefono} onChange={event => setTelefono(event.target.value)} autoComplete="tel" /></label>
            </div>
            <div aria-hidden="true" className={styles.honeypot}><input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
            <TurnstileWidget onToken={setTurnstileToken} />
            <label className={styles.consent}><input type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} required /><span>Accetto i <Link href="/termini" target="_blank">Termini e Condizioni</Link> e dichiaro di aver letto la <Link href="/privacy" target="_blank">Privacy Policy</Link>.</span></label>
            {customerType === 'consumatore' && (
              <div className={styles.consumer}>
                <p>Per avviare il servizio prima della fine dei 14 giorni:</p>
                <label className={styles.consent}><input type="checkbox" checked={earlyPerformanceRequested} onChange={event => setEarlyPerformanceRequested(event.target.checked)} required /><span>Chiedo che l’esecuzione inizi durante il periodo di recesso e accetto l’eventuale importo proporzionale al lavoro gia svolto.</span></label>
                <label className={styles.consent}><input type="checkbox" checked={withdrawalLossAcknowledged} onChange={event => setWithdrawalLossAcknowledged(event.target.checked)} required /><span>Sono consapevole della possibile perdita del diritto di recesso dopo la completa esecuzione, nei casi previsti dalla legge.</span></label>
              </div>
            )}
            <button type="submit" className={styles.submit} disabled={loading}>{loading ? 'Apertura pagamento...' : <>Vai al pagamento <ArrowRight size={17} /></>}</button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className={styles.shell}><p>Caricamento checkout...</p></main>}><CheckoutForm /></Suspense>
}
