'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import TurnstileWidget from '@/components/TurnstileWidget'
import styles from './registrati-acquista.module.css'

// Registrazione che porta dritta al pagamento del corso.
//
// E lo stesso percorso dei pacchetti (`/register`): si compila, si paga, e il
// pagamento attiva l'account. Non c'e attesa di approvazione, perche un corso
// non richiede che qualcuno prepari un workspace: basta che il pagamento sia
// arrivato. Chi ha gia un account riceve 409 e viene mandato al login.
//
// Non riusa la pagina `/register` perche quella e costruita attorno alla scelta
// del pacchetto social: mostrare un selettore di piani a chi sta comprando un
// corso confonderebbe l'acquisto e sporcherebbe la colonna `pacchetto`.

type Props = {
  slug: string
  titolo: string
  /** Le lezioni arrivano piu avanti: cambia i consensi da raccogliere. */
  inPrevendita: boolean
}

export default function RegistratiEAcquista({ slug, titolo, inPrevendita }: Props) {
  const [tipo, setTipo] = useState<'impresa_professionista' | 'consumatore'>('impresa_professionista')
  const [nome, setNome] = useState('')
  const [azienda, setAzienda] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [termini, setTermini] = useState(false)
  const [esecuzioneImmediata, setEsecuzioneImmediata] = useState(false)
  const [perditaRecesso, setPerditaRecesso] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [website, setWebsite] = useState('')
  const [apertoIl] = useState(() => Date.now())
  const [invio, setInvio] = useState(false)
  const [errore, setErrore] = useState('')
  const [giaRegistrato, setGiaRegistrato] = useState(false)

  async function invia(evento: React.FormEvent) {
    evento.preventDefault()
    setErrore('')
    setGiaRegistrato(false)
    setInvio(true)
    try {
      const risposta = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corso_slug: slug,
          nome, azienda, email, telefono, password,
          customer_type: tipo,
          terms_accepted: termini,
          early_performance_requested: esecuzioneImmediata,
          withdrawal_loss_acknowledged: perditaRecesso,
          turnstile_token: turnstileToken,
          website,
          elapsed_ms: Date.now() - apertoIl,
        }),
      })
      const dati = await risposta.json()

      if (risposta.status === 409) {
        setGiaRegistrato(true)
        setErrore(dati.error || 'Esiste già un account con questa email.')
        setInvio(false)
        return
      }
      if (!risposta.ok) {
        setErrore(dati.error || 'Registrazione non riuscita. Riprova.')
        setInvio(false)
        return
      }
      if (dati.demo) {
        setErrore(dati.message || 'Acquisto non disponibile in modalità demo.')
        setInvio(false)
        return
      }
      if (dati.checkout_url) {
        window.location.href = dati.checkout_url
        return
      }
      setErrore('Risposta inattesa dal sistema di pagamento. Riprova fra poco.')
      setInvio(false)
    } catch {
      setErrore('Connessione non riuscita. Controlla la rete e riprova.')
      setInvio(false)
    }
  }

  return (
    <form className={styles.modulo} onSubmit={invia}>
      <span className={styles.etichetta}>Acquisti come</span>
      <div className={styles.tipo} role="group" aria-label="Acquisti come">
        <button type="button" aria-pressed={tipo === 'impresa_professionista'} onClick={() => setTipo('impresa_professionista')}>
          Impresa o professionista
        </button>
        <button type="button" aria-pressed={tipo === 'consumatore'} onClick={() => setTipo('consumatore')}>
          Privato
        </button>
      </div>

      <label className={styles.campo}>
        <span className={styles.etichetta}>Nome e cognome</span>
        <input value={nome} onChange={e => setNome(e.target.value)} required autoComplete="name" placeholder="Mario Rossi" />
      </label>

      <label className={styles.campo}>
        <span className={styles.etichetta}>
          Azienda{tipo === 'consumatore' ? ' (facoltativo)' : ''}
        </span>
        <input
          value={azienda}
          onChange={e => setAzienda(e.target.value)}
          required={tipo === 'impresa_professionista'}
          autoComplete="organization"
          placeholder={tipo === 'consumatore' ? 'Se serve in fattura' : 'La tua attività'}
        />
      </label>

      <div className={styles.riga}>
        <label className={styles.campo}>
          <span className={styles.etichetta}>Email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="tu@azienda.it" />
        </label>
        <label className={styles.campo}>
          <span className={styles.etichetta}>Telefono</span>
          <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} autoComplete="tel" placeholder="+39 …" />
        </label>
      </div>

      <label className={styles.campo}>
        <span className={styles.etichetta}>Password</span>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" placeholder="Almeno 8 caratteri" />
        <small>Ti servirà per rientrare nella tua area e riguardare le lezioni.</small>
      </label>

      {/* Honeypot: fuori schermo e fuori dal giro dei tab, lo compilano solo i bot. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Se sei umano lascia vuoto questo campo
          <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
        </label>
      </div>

      <TurnstileWidget onToken={setTurnstileToken} />

      <label className={styles.consenso}>
        <input type="checkbox" checked={termini} onChange={e => setTermini(e.target.checked)} required />
        <span>
          Accetto i <Link href="/termini" target="_blank">termini</Link> e ho letto la{' '}
          <Link href="/privacy" target="_blank">privacy</Link>.
        </span>
      </label>

      {/* In prevendita la rinuncia al recesso sarebbe una clausola senza effetto:
          il termine decorre dalla consegna, e qui la consegna non c'e ancora. */}
      {tipo === 'consumatore' && inPrevendita && (
        <p className={styles.nota}>
          Comprando in prevendita mantieni i quattordici giorni di recesso: il termine
          decorre da quando ti diamo accesso alle lezioni.
        </p>
      )}

      {tipo === 'consumatore' && !inPrevendita && (
        <div className={styles.consumatore}>
          <p>Per entrare subito nelle lezioni, senza aspettare i quattordici giorni:</p>
          <label className={styles.consenso}>
            <input type="checkbox" checked={esecuzioneImmediata} onChange={e => setEsecuzioneImmediata(e.target.checked)} required />
            <span>Chiedo di accedere subito al corso, durante il periodo di recesso.</span>
          </label>
          <label className={styles.consenso}>
            <input type="checkbox" checked={perditaRecesso} onChange={e => setPerditaRecesso(e.target.checked)} required />
            <span>So che, avendo l’accesso immediato, perdo il diritto di recesso su questo contenuto digitale.</span>
          </label>
        </div>
      )}

      {errore && (
        <p className={styles.errore} role="alert">
          {errore}{' '}
          {giaRegistrato && (
            <Link href={`/login?callbackUrl=${encodeURIComponent(`/corsi/${slug}`)}`}>Accedi e completa l’acquisto</Link>
          )}
        </p>
      )}

      <button type="submit" className={styles.principale} disabled={invio} aria-label={`Registrati e acquista ${titolo}`}>
        {invio ? 'Apertura pagamento…' : <>Registrati e paga <ArrowRight size={17} aria-hidden="true" /></>}
      </button>

      <p className={styles.nota}>
        Pagamento con carta gestito da Stripe: non conserviamo i dati della tua carta.
        L’account viene attivato appena il pagamento è confermato.
      </p>

      <p className={styles.nota}>
        Hai già un account? <Link href={`/login?callbackUrl=${encodeURIComponent(`/corsi/${slug}`)}`}>Accedi</Link>.
      </p>
    </form>
  )
}
