'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ShieldCheck, Check, LockKeyhole } from 'lucide-react'
import TurnstileWidget from '@/components/TurnstileWidget'
import { standaloneServiceBySlug, type StandaloneService } from '@/lib/standalone-services'
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

  const imponibile = service.amountCents + (service.setupCents ?? 0)

  // La catena di ternari finiva sulla segretaria telefonica per ogni slug non
  // previsto: i due servizi aggiunti dopo — sito impresa e apertura profili —
  // mandavano «Torna al servizio» su una pagina che non c'entrava. Una mappa
  // esplicita sbaglia in modo visibile invece che in silenzio.
  const servicePage = PAGINA_SERVIZIO[service.slug] ?? '/servizi'

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
        <Link href="/" aria-label="Social Web Automation, home">
          <Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} priority />
          <span>Social Web Automation</span>
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
          {/* Il primo addebito per intero, prima del modulo.
              Mostrare "349 €" e poi far scoprire 1.389,58 € sulla pagina di
              pagamento significa perdere la persona quando ha gia' investito
              tempo: chi si sente sorpreso sul prezzo non riapre la trattativa. */}
          <div className={styles.price}>{service.pricePrefix ? <em>{service.pricePrefix} </em> : null}<strong>{service.displayPrice}</strong><span>{service.cadenceLabel}</span></div>
          <div className={styles.totale}>
            <div><span>{service.billingMode === 'subscription' ? 'Canone mensile' : 'Importo'}</span><b>{euro(service.amountCents)}</b></div>
            {service.setupCents ? <div><span>Avvio una tantum</span><b>{euro(service.setupCents)}</b></div> : null}
            <div><span>IVA 22%</span><b>{euro(Math.round(imponibile * 0.22))}</b></div>
            <div className={styles.totaleRiga}><span>Primo addebito</span><b>{euro(Math.round(imponibile * 1.22))}</b></div>
            {service.billingMode === 'subscription' ? (
              <p>Poi {euro(Math.round(service.amountCents * 1.22))} al mese, IVA inclusa. Disdicibile per il periodo successivo.</p>
            ) : (
              <p>Pagamento unico. Nessun rinnovo automatico.</p>
            )}
          </div>
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
            {/* Detto accanto al pulsante, non sepolto nei termini: chi sta per
                pagare vuole sapere dove finisce la carta prima di cliccare, e
                sapere che non passa da noi vale piu' di un badge decorativo. */}
            <p className={styles.pagamentoSicuro}>
              <ShieldCheck size={15} aria-hidden="true" />
              <span>
                Il pagamento si apre su <strong>Stripe</strong>, su dominio Stripe. I dati della carta non passano dai nostri
                sistemi e non vengono conservati da noi. <a href="/sicurezza">Come proteggiamo i dati</a>.
              </span>
            </p>
          </form>
        </section>
      </div>
    </main>
  )
}

// Prezzi in centesimi: l'importo mostrato deve coincidere con quello addebitato.
const euro = (centesimi: number) =>
  (centesimi / 100).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })

const PAGINA_SERVIZIO: Partial<Record<StandaloneService['slug'], string>> = {
  'blog-seo': '/servizi/blog-seo',
  'web-commerce': '/servizi/siti-e-commerce',
  'web-impresa': '/servizi/siti-e-commerce',
  'profili-social-gbp': '/servizi/gestione-social-media',
  'lead-pilot': '/servizi/ricerca-clienti-b2b',
  'agenda-clienti': '/servizi/agenda-clienti-whatsapp',
  'tutto-in-uno': '/servizi/agenda-clienti-whatsapp',
  'voce-base': '/servizi/segretaria-telefonica-ai',
  'voce-attivita': '/servizi/segretaria-telefonica-ai',
  'voce-azienda': '/servizi/segretaria-telefonica-ai',
  'video-start': '/servizi/video-produzione',
  'video-silver': '/servizi/video-produzione',
  'video-gold': '/servizi/video-produzione',
  'video-platinum': '/servizi/video-produzione',
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className={styles.shell}><p>Caricamento checkout...</p></main>}><CheckoutForm /></Suspense>
}
