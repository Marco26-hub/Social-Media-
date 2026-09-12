'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import styles from '@/app/(it)/portale/corsi/corsi-portale.module.css'

// Le due dichiarazioni sul recesso, chieste alla consegna.
//
// Chi ha comprato in prevendita non poteva rinunciare al recesso al momento
// dell'acquisto: l'esecuzione non era iniziata e una rinuncia firmata prima non
// avrebbe avuto effetto. Il diritto quindi e ancora suo. Oggi il corso e
// disponibile, e dargli accesso senza chiedergli niente significherebbe
// lasciargli guardare tutto e recedere lo stesso.
//
// Non e un passaggio da togliere di mezzo in fretta: e il momento in cui una
// persona rinuncia a un diritto, e deve capire cosa sta facendo. Per questo le
// caselle sono due e separate, come al primo acquisto, e si puo anche NON
// accettare — in quel caso il corso resta chiuso e i quattordici giorni
// restano.

type Props = {
  slug: string
  titolo: string
  /** Un'aula in diretta e una prestazione di servizi: cambia cosa si dichiara. */
  live: boolean
}

export default function ConsensoConsegna({ slug, titolo, live }: Props) {
  const router = useRouter()
  const [esecuzione, setEsecuzione] = useState(false)
  const [perdita, setPerdita] = useState(false)
  const [invio, setInvio] = useState(false)
  const [errore, setErrore] = useState('')

  async function conferma(evento: React.FormEvent) {
    evento.preventDefault()
    setErrore('')
    setInvio(true)
    try {
      const risposta = await fetch('/api/data/corsi/consenso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corso_slug: slug,
          early_performance_requested: esecuzione,
          withdrawal_loss_acknowledged: perdita,
        }),
      })
      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => ({}))
        setErrore(dati.error || 'Non siamo riusciti a registrare le dichiarazioni. Riprova.')
        setInvio(false)
        return
      }
      // Il contenuto arriva dal server: si ricarica la pagina invece di
      // sbloccarla nel browser, altrimenti le lezioni non ci sarebbero comunque.
      router.refresh()
    } catch {
      setErrore('Connessione non riuscita. Riprova.')
      setInvio(false)
    }
  }

  return (
    <form className={styles.palco} onSubmit={conferma} style={{ marginTop: 26, maxWidth: 720 }}>
      <span className={styles.tipo}><ShieldCheck size={14} aria-hidden="true" /> Prima di cominciare</span>
      <h2>{titolo} è pronto.</h2>
      <p className={styles.testoLezione}>
        Hai acquistato questo corso in prevendita, quando non era ancora disponibile:
        per questo non ti avevamo chiesto nulla sul diritto di recesso, che a quel
        momento restava intero. Ora il corso c’è, e per aprirlo servono due conferme.
      </p>

      <label className={styles.consenso} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.55 }}>
        <input type="checkbox" checked={esecuzione} onChange={e => setEsecuzione(e.target.checked)} required />
        <span>
          {live
            ? 'Chiedo che gli incontri comincino prima della scadenza dei quattordici giorni di recesso.'
            : 'Chiedo di accedere subito alle lezioni, senza aspettare i quattordici giorni di recesso.'}
        </span>
      </label>

      <label className={styles.consenso} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.55 }}>
        <input type="checkbox" checked={perdita} onChange={e => setPerdita(e.target.checked)} required />
        <span>
          {live
            ? 'So che, se recedo dopo l’inizio, mi sarà dovuto l’importo proporzionale agli incontri già svolti.'
            : 'So che, ottenendo l’accesso, perdo il diritto di recesso su questo contenuto digitale.'}
        </span>
      </label>

      {errore && <p className={styles.avviso} role="alert">{errore}</p>}

      <button type="submit" className={styles.segna} disabled={invio}>
        {invio ? 'Registrazione…' : 'Confermo e apro il corso'}
      </button>

      <p className={styles.avanzamento}>
        Se preferisci non confermare, il corso resta chiuso e mantieni i quattordici
        giorni per recedere. Puoi tornare qui quando vuoi, oppure{' '}
        <Link href="/recesso">esercitare il recesso</Link>.
      </p>
    </form>
  )
}
