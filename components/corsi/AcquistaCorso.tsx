'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './acquista-corso.module.css'

// Riquadro d'acquisto del corso. Raccoglie i consensi e apre Stripe.
//
// I nomi dei campi sono gli stessi degli ordini servizi (customer_type,
// terms_accepted, early_performance_requested, withdrawal_loss_acknowledged):
// finiscono nelle stesse colonne e devono restare confrontabili.
//
// Il testo pero cambia: un corso e contenuto digitale, non una prestazione.
// Per il consumatore il recesso decade quando l'esecuzione INIZIA, cioe appena
// l'accesso viene dato, non a esecuzione completata. Va chiesto prima del
// pagamento e in modo esplicito, altrimenti restano quattordici giorni per
// chiedere il rimborso anche dopo aver visto tutte le lezioni.

type Props = {
  slug: string
  titolo: string
  autenticato: boolean
  /** Il corso si compra ora ma le lezioni arrivano piu avanti. */
  inPrevendita?: boolean
}

export default function AcquistaCorso({ slug, titolo, autenticato, inPrevendita = false }: Props) {
  const [tipo, setTipo] = useState<'impresa_professionista' | 'consumatore'>('impresa_professionista')
  const [termini, setTermini] = useState(false)
  const [esecuzioneImmediata, setEsecuzioneImmediata] = useState(false)
  const [perditaRecesso, setPerditaRecesso] = useState(false)
  const [invio, setInvio] = useState(false)
  const [errore, setErrore] = useState('')

  if (!autenticato) {
    return (
      <div className={styles.riquadro}>
        <p className={styles.avviso}>
          Per acquistare serve un account: è dove troverai le lezioni dopo il pagamento.
          Lo crei durante l’acquisto, non c’è nessuna attesa di approvazione.
        </p>
        <Link className={styles.principale} href={`/corsi/${slug}/acquista`}>
          {inPrevendita ? 'Acquista in prevendita' : 'Acquista il corso'}
        </Link>
        <Link className={styles.secondario} href={`/login?callbackUrl=${encodeURIComponent(`/corsi/${slug}`)}`}>
          Ho già un account
        </Link>
      </div>
    )
  }

  async function acquista(evento: React.FormEvent) {
    evento.preventDefault()
    setErrore('')
    setInvio(true)
    try {
      const risposta = await fetch('/api/checkout/corso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corso_slug: slug,
          customer_type: tipo,
          terms_accepted: termini,
          early_performance_requested: esecuzioneImmediata,
          withdrawal_loss_acknowledged: perditaRecesso,
        }),
      })
      const dati = await risposta.json()
      if (!risposta.ok) {
        setErrore(dati.error || 'Non riusciamo ad avviare il pagamento. Riprova fra poco.')
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
    <form className={styles.riquadro} onSubmit={acquista}>
      <div className={styles.tipo} role="group" aria-label="Acquisti come">
        <button
          type="button"
          aria-pressed={tipo === 'impresa_professionista'}
          onClick={() => setTipo('impresa_professionista')}
        >
          Impresa o professionista
        </button>
        <button
          type="button"
          aria-pressed={tipo === 'consumatore'}
          onClick={() => setTipo('consumatore')}
        >
          Privato
        </button>
      </div>

      <label className={styles.consenso}>
        <input type="checkbox" checked={termini} onChange={e => setTermini(e.target.checked)} required />
        <span>Ho letto e accetto i <Link href="/termini">termini</Link> e la <Link href="/privacy">privacy</Link>.</span>
      </label>

      {/* In prevendita la rinuncia al recesso non si puo chiedere: il diritto
          decade quando l'esecuzione inizia, e qui l'accesso non e ancora stato
          dato. Chiederla comunque non proteggerebbe da nulla e sarebbe una
          clausola nulla. */}
      {tipo === 'consumatore' && inPrevendita && (
        <p className={styles.nota}>
          Comprando in prevendita mantieni i quattordici giorni di recesso: il termine
          decorre da quando ti diamo accesso alle lezioni.
        </p>
      )}

      {tipo === 'consumatore' && !inPrevendita && (
        <>
          <label className={styles.consenso}>
            <input
              type="checkbox"
              checked={esecuzioneImmediata}
              onChange={e => setEsecuzioneImmediata(e.target.checked)}
              required
            />
            <span>Chiedo di accedere subito alle lezioni, senza aspettare i quattordici giorni di recesso.</span>
          </label>
          <label className={styles.consenso}>
            <input
              type="checkbox"
              checked={perditaRecesso}
              onChange={e => setPerditaRecesso(e.target.checked)}
              required
            />
            <span>So che, dandomi l’accesso immediato, perdo il diritto di recesso su questo contenuto digitale.</span>
          </label>
        </>
      )}

      {errore && <p className={styles.errore} role="alert">{errore}</p>}

      <button
        type="submit"
        className={styles.principale}
        disabled={invio}
        aria-label={`${inPrevendita ? 'Acquista in prevendita' : 'Acquista'} il corso ${titolo}`}
      >
        {invio ? 'Apertura pagamento…' : inPrevendita ? 'Acquista in prevendita' : 'Acquista il corso'}
      </button>

      <p className={styles.nota}>
        Pagamento con carta gestito da Stripe. Non conserviamo i dati della tua carta.
      </p>
    </form>
  )
}
