'use client'

import { useState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import styles from './corso-ai-act.module.css'

// Preiscrizione ai video corsi AI Act. Chiede poco — nome, email e, se vuole,
// azienda e ruolo — perche a un corso che non e ancora uscito ci si iscrive per
// curiosita, e ogni campo in piu e una persona in meno che completa.

type Esito = { tipo: 'ok' | 'errore'; testo: string } | null

export default function CorsoAiActForm() {
  const [invio, setInvio] = useState(false)
  const [esito, setEsito] = useState<Esito>(null)

  async function invia(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (invio) return
    const form = e.currentTarget
    const dati = new FormData(form)
    setInvio(true)
    setEsito(null)
    try {
      const res = await fetch('/api/corso-ai-act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: dati.get('nome'),
          email: dati.get('email'),
          azienda: dati.get('azienda'),
          ruolo: dati.get('ruolo'),
          note: dati.get('note'),
          consenso: dati.get('consenso') === 'on',
        }),
      })
      const data = await res.json() as { ok?: boolean; message?: string; error?: string }
      if (!res.ok || !data.ok) {
        setEsito({ tipo: 'errore', testo: data.error || data.message || 'Non è andata. Riprova fra poco.' })
        return
      }
      setEsito({ tipo: 'ok', testo: data.message || 'Ci sei.' })
      form.reset()
    } catch {
      setEsito({ tipo: 'errore', testo: 'Connessione non riuscita. Riprova fra poco.' })
    } finally {
      setInvio(false)
    }
  }

  if (esito?.tipo === 'ok') {
    return (
      <div className={styles.fatto} role="status">
        <Check size={20} aria-hidden="true" />
        <div>
          <strong>{esito.testo}</strong>
          <p>Nessuna newsletter e nessun impegno: ti scriviamo solo quando il primo modulo è online.</p>
        </div>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={invia} noValidate>
      <div className={styles.riga}>
        <label>
          <span>Nome e cognome</span>
          <input name="nome" type="text" required autoComplete="name" placeholder="Come ti chiami" />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="dove ti avvisiamo" />
        </label>
      </div>
      <div className={styles.riga}>
        <label>
          <span>Azienda <i>facoltativo</i></span>
          <input name="azienda" type="text" autoComplete="organization" placeholder="Nome dell’attività" />
        </label>
        <label>
          <span>Ruolo <i>facoltativo</i></span>
          <input name="ruolo" type="text" placeholder="Titolare, responsabile, consulente…" />
        </label>
      </div>
      <label className={styles.pieno}>
        <span>Che cosa ti serve sapere? <i>facoltativo</i></span>
        <textarea name="note" rows={2} placeholder="Il dubbio che vorresti risolto per primo" />
      </label>

      <label className={styles.consenso}>
        <input name="consenso" type="checkbox" required />
        <span>
          Acconsento a essere avvisato via email quando i moduli escono. Nessun altro uso,
          disiscrizione con un click.
        </span>
      </label>

      {esito?.tipo === 'errore' && <p className={styles.errore} role="alert">{esito.testo}</p>}

      <button type="submit" className={styles.invia} disabled={invio}>
        {invio ? <Loader2 size={17} className={styles.gira} aria-hidden="true" /> : null}
        {invio ? 'Un attimo…' : 'Prenota il posto'}
        {!invio && <ArrowRight size={16} aria-hidden="true" />}
      </button>
      <p className={styles.nota}>Nessun pagamento oggi: la prenotazione non impegna e ti dà la precedenza sui posti.</p>
    </form>
  )
}
