'use client'

import { useState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import styles from './corso-ai-act.module.css'

// Preiscrizione ai video corsi AI Act. Chiede poco — nome, email e, se vuole,
// azienda e ruolo — perche a un corso che non e ancora uscito ci si iscrive per
// curiosita, e ogni campo in piu e una persona in meno che completa.

type Esito = { tipo: 'ok' | 'errore'; testo: string } | null

export default function CorsoAiActForm({ locale = 'it' }: { locale?: 'it' | 'en' }) {
  const en = locale === 'en'
  // Le stringhe della versione inglese. Il messaggio di conferma del server e'
  // italiano e resta tale: in inglese si usa il proprio, non si mostra una
  // riga in un'altra lingua dentro un modulo appena compilato.
  const t = en
    ? { nonAndata: 'That did not go through. Try again in a moment.', rete: 'Connection failed. Try again in a moment.', fatto: 'You are in.',
        noNewsletter: 'No newsletter and no commitment: we write only when the first module is online.',
        nome: 'Full name', nomePh: 'Your name', email: 'Email', emailPh: 'where we notify you',
        azienda: 'Company', ruolo: 'Role', ruoloPh: 'Owner, manager, consultant…', facoltativo: 'optional',
        aziendaPh: 'Business name', note: 'What do you need to know?', notePh: 'The doubt you would like solved first',
        consenso: 'I agree to be notified by email when the modules are released. No other use, unsubscribe with one click.',
        attimo: 'One moment…', prenota: 'Reserve a place', nota: 'No payment today: the reservation does not commit you and gives you priority on places.' }
    : { nonAndata: 'Non è andata. Riprova fra poco.', rete: 'Connessione non riuscita. Riprova fra poco.', fatto: 'Ci sei.',
        noNewsletter: 'Nessuna newsletter e nessun impegno: ti scriviamo solo quando il primo modulo è online.',
        nome: 'Nome e cognome', nomePh: 'Come ti chiami', email: 'Email', emailPh: 'dove ti avvisiamo',
        azienda: 'Azienda', ruolo: 'Ruolo', ruoloPh: 'Titolare, responsabile, consulente…', facoltativo: 'facoltativo',
        aziendaPh: 'Nome dell’attività', note: 'Che cosa ti serve sapere?', notePh: 'Il dubbio che vorresti risolto per primo',
        consenso: 'Acconsento a essere avvisato via email quando i moduli escono. Nessun altro uso, disiscrizione con un click.',
        attimo: 'Un attimo…', prenota: 'Prenota il posto', nota: 'Nessun pagamento oggi: la prenotazione non impegna e ti dà la precedenza sui posti.' }
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
        setEsito({ tipo: 'errore', testo: en ? t.nonAndata : (data.error || data.message || t.nonAndata) })
        return
      }
      setEsito({ tipo: 'ok', testo: en ? t.fatto : (data.message || t.fatto) })
      form.reset()
    } catch {
      setEsito({ tipo: 'errore', testo: t.rete })
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
          <p>{t.noNewsletter}</p>
        </div>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={invia} noValidate>
      <div className={styles.riga}>
        <label>
          <span>{t.nome}</span>
          <input name="nome" type="text" required autoComplete="name" placeholder={t.nomePh} />
        </label>
        <label>
          <span>{t.email}</span>
          <input name="email" type="email" required autoComplete="email" placeholder={t.emailPh} />
        </label>
      </div>
      <div className={styles.riga}>
        <label>
          <span>{t.azienda} <i>{t.facoltativo}</i></span>
          <input name="azienda" type="text" autoComplete="organization" placeholder={t.aziendaPh} />
        </label>
        <label>
          <span>{t.ruolo} <i>{t.facoltativo}</i></span>
          <input name="ruolo" type="text" placeholder={t.ruoloPh} />
        </label>
      </div>
      <label className={styles.pieno}>
        <span>{t.note} <i>{t.facoltativo}</i></span>
        <textarea name="note" rows={2} placeholder={t.notePh} />
      </label>

      <label className={styles.consenso}>
        <input name="consenso" type="checkbox" required />
        <span>{t.consenso}</span>
      </label>

      {esito?.tipo === 'errore' && <p className={styles.errore} role="alert">{esito.testo}</p>}

      <button type="submit" className={styles.invia} disabled={invio}>
        {invio ? <Loader2 size={17} className={styles.gira} aria-hidden="true" /> : null}
        {invio ? t.attimo : t.prenota}
        {!invio && <ArrowRight size={16} aria-hidden="true" />}
      </button>
      <p className={styles.nota}>{t.nota}</p>
    </form>
  )
}
