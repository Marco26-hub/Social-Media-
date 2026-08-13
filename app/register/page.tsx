'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { PACCHETTI } from '@/lib/pacchetti'
import TurnstileWidget from '@/components/TurnstileWidget'
import styles from './register.module.css'

function RegisterBrand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Social Automation, home">
      <span className={styles.brandMark}>
        <Image src="/brand/swa-logo-official.png" alt="SWA" width={82} height={38} priority />
      </span>
      <span>Social Automation</span>
    </Link>
  )
}

function RegisterForm() {
  const params = useSearchParams()
  const initialPiano = (params.get('piano') || '').toLowerCase()

  const [pacchetto, setPacchetto] = useState(
    PACCHETTI.some(p => p.slug === initialPiano) ? initialPiano : 'crescita',
  )
  const [nome, setNome] = useState('')
  const [azienda, setAzienda] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [customerType, setCustomerType] = useState<'impresa_professionista' | 'consumatore'>('impresa_professionista')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [earlyPerformanceRequested, setEarlyPerformanceRequested] = useState(false)
  const [withdrawalLossAcknowledged, setWithdrawalLossAcknowledged] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  // Honeypot: campo nascosto che gli umani non vedono/compilano. Se un bot lo
  // riempie, il server scarta la richiesta. Anti-bot a zero dipendenze esterne.
  const [website, setWebsite] = useState('')
  // Timestamp di apertura form: submit in <2s = quasi certamente bot.
  const [formOpenedAt] = useState(() => Date.now())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, azienda, email, telefono, password, pacchetto,
          customer_type: customerType,
          terms_accepted: termsAccepted,
          early_performance_requested: earlyPerformanceRequested,
          withdrawal_loss_acknowledged: withdrawalLossAcknowledged,
          turnstile_token: turnstileToken, website, elapsed_ms: Date.now() - formOpenedAt,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registrazione non riuscita. Riprova.')
        setLoading(false)
        return
      }
      if (data.demo) {
        setError(data.message || 'Registrazione non disponibile in modalità demo.')
        setLoading(false)
        return
      }
      // Flow paga-prima: reindirizza a Stripe Checkout.
      if (data.checkout_url) {
        window.location.href = data.checkout_url
        return
      }
      setDone(true)
    } catch {
      setError('Errore di rete. Riprova.')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className={styles.card}>
        <RegisterBrand />
        <div className={styles.success}>
          <span className={styles.successIcon}><CheckCircle2 size={34} /></span>
          <h1>Richiesta ricevuta</h1>
          <p>Grazie! Abbiamo registrato la tua richiesta per il pacchetto <strong>{PACCHETTI.find(p => p.slug === pacchetto)?.nome}</strong>.</p>
          <p>Attiviamo il tuo account a breve e ti avvisiamo via email a <strong>{email}</strong>.</p>
          <Link href="/" className={styles.backBtn}><ArrowLeft size={16} /> Torna alla home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <RegisterBrand />

      <h1 className={styles.title}>Crea il tuo account</h1>
      <p className={styles.subtitle}>
        Scegli il pacchetto, registrati e attiviamo il tuo pannello. L&apos;approvazione è rapida.
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <span className={styles.label}>Pacchetto scelto</span>
        <div className={styles.pkgGrid}>
          {PACCHETTI.map(p => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setPacchetto(p.slug)}
              className={`${styles.pkg} ${pacchetto === p.slug ? styles.pkgActive : ''}`}
            >
              {p.consigliato && <span className={styles.pkgReco}>Consigliato</span>}
              <span className={styles.pkgName}>{p.nome}</span>
              <span className={styles.pkgPrice}>{p.prezzo}/mese</span>
            </button>
          ))}
        </div>

        <span className={styles.label}>Acquisti come</span>
        <div className={styles.customerType} role="group" aria-label="Categoria cliente">
          <button type="button" aria-pressed={customerType === 'impresa_professionista'} className={customerType === 'impresa_professionista' ? styles.customerTypeActive : ''} onClick={() => setCustomerType('impresa_professionista')}>Impresa o professionista</button>
          <button type="button" aria-pressed={customerType === 'consumatore'} className={customerType === 'consumatore' ? styles.customerTypeActive : ''} onClick={() => setCustomerType('consumatore')}>Consumatore</button>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Nome e cognome</span>
          <input className={styles.input} value={nome} onChange={e => setNome(e.target.value)} required autoComplete="name" placeholder="Mario Rossi" />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Azienda {customerType === 'consumatore' && '(opzionale)'}</span>
          <input className={styles.input} value={azienda} onChange={e => setAzienda(e.target.value)} required={customerType === 'impresa_professionista'} autoComplete="organization" placeholder={customerType === 'consumatore' ? 'Se applicabile' : 'La tua attività'} />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>Email</span>
            <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="tu@azienda.it" />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Telefono</span>
            <input className={styles.input} type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} autoComplete="tel" placeholder="+39 …" />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Password</span>
          <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" placeholder="Almeno 8 caratteri" />
        </div>

        {/* Honeypot: nascosto agli umani (off-screen + aria-hidden + tabIndex -1). */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
          <label>Se sei umano lascia vuoto questo campo
            <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
          </label>
        </div>

        <TurnstileWidget onToken={setTurnstileToken} />

        <label className={styles.consent}>
          <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} required />
          <span>Accetto i <Link href="/termini" target="_blank">Termini e Condizioni</Link> e dichiaro di aver letto la <Link href="/privacy" target="_blank">Privacy Policy</Link>.</span>
        </label>

        {customerType === 'consumatore' && (
          <div className={styles.consumerNotice}>
            <p>Per attivare il servizio senza attendere la fine dei 14 giorni:</p>
            <label className={styles.consent}>
              <input type="checkbox" checked={earlyPerformanceRequested} onChange={e => setEarlyPerformanceRequested(e.target.checked)} required />
              <span>Chiedo espressamente che l&apos;esecuzione del servizio inizi durante il periodo di recesso. In caso di recesso potra essere dovuto l&apos;importo proporzionale al servizio gia eseguito.</span>
            </label>
            <label className={styles.consent}>
              <input type="checkbox" checked={withdrawalLossAcknowledged} onChange={e => setWithdrawalLossAcknowledged(e.target.checked)} required />
              <span>Sono consapevole che, dopo la completa esecuzione del servizio, potro perdere il diritto di recesso nei casi previsti dall&apos;art. 59 del Codice del consumo.</span>
            </label>
          </div>
        )}

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Invio…' : <>Registrati <ArrowRight size={17} /></>}
        </button>

        <p className={styles.hint}>
          <ShieldCheck size={15} />
          Il pagamento avviene nella pagina Stripe successiva. Il budget ADS resta sempre separato.
        </p>
      </form>

      <p className={styles.footNote}>
        Hai già un account? <Link href="/login">Accedi</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <main className={styles.shell}>
      <Suspense fallback={<div className={styles.card}>Caricamento…</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  )
}
