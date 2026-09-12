'use client'

import { useMemo, useState } from 'react'
import { Check, Circle, FileText, PlayCircle } from 'lucide-react'
import { VideoLezione } from '@/components/portale/VideoLezione'
import styles from '@/app/(it)/portale/corsi/corsi-portale.module.css'

// Lettore del corso: indice a destra, lezione a sinistra.
//
// Tutto il contenuto arriva gia filtrato dal server — se una lezione e qui
// dentro, e perche il corso e stato pagato. Il componente non decide nessun
// accesso: se lo facesse, basterebbe cambiare una variabile nel browser.

type Lezione = {
  id: string
  titolo: string
  tipo: 'video' | 'testo'
  durata_min: number | null
  video_url: string | null
  video_protetto: boolean
  contenuto: string | null
  completata?: boolean
}

type Modulo = { id: string; titolo: string; lezioni: Lezione[] }

type Props = {
  moduli: Modulo[]
  spettatore: { nome: string | null; email: string; azienda?: string | null }
}

export default function CorsoStudente({ moduli, spettatore }: Props) {
  const tutte = useMemo(() => moduli.flatMap(m => m.lezioni), [moduli])
  const [fatte, setFatte] = useState<Record<string, boolean>>(
    () => Object.fromEntries(tutte.map(l => [l.id, Boolean(l.completata)])),
  )
  // Si riparte dalla prima lezione non completata: chi torna dopo una settimana
  // riprende dove era rimasto invece di ricominciare dall'inizio.
  const [correnteId, setCorrenteId] = useState<string | null>(
    () => (tutte.find(l => !l.completata) ?? tutte[0])?.id ?? null,
  )
  const [salvataggio, setSalvataggio] = useState(false)
  const [errore, setErrore] = useState('')

  const corrente = tutte.find(l => l.id === correnteId) ?? null

  async function cambiaStato(lezione: Lezione) {
    const nuovo = !fatte[lezione.id]
    setSalvataggio(true)
    setErrore('')
    // Ottimistico: la spunta si muove subito e torna indietro se il salvataggio
    // non riesce. Segnare una lezione non e un'operazione che valga un'attesa.
    setFatte(stato => ({ ...stato, [lezione.id]: nuovo }))
    try {
      const risposta = await fetch('/api/data/corsi/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lezione_id: lezione.id, completata: nuovo }),
      })
      if (!risposta.ok) throw new Error('salvataggio non riuscito')
    } catch {
      setFatte(stato => ({ ...stato, [lezione.id]: !nuovo }))
      setErrore('Non siamo riusciti a salvare. Riprova fra poco.')
    } finally {
      setSalvataggio(false)
    }
  }

  if (!corrente) return null

  return (
    <div className={styles.lettore}>
      <section className={styles.palco}>
        <h2>{corrente.titolo}</h2>

        {corrente.tipo === 'video' && corrente.video_protetto && (
          <VideoLezione lezioneId={corrente.id} titolo={corrente.titolo} spettatore={spettatore} />
        )}

        {corrente.tipo === 'video' && !corrente.video_protetto && corrente.video_url && (
          <div className={styles.avviso}>
            Questa lezione è ospitata su un servizio esterno:{' '}
            <a href={corrente.video_url} target="_blank" rel="noreferrer noopener">aprila qui</a>.
          </div>
        )}

        {corrente.tipo === 'video' && !corrente.video_protetto && !corrente.video_url && (
          <p className={styles.avviso}>Il video di questa lezione non è ancora stato caricato.</p>
        )}

        {corrente.contenuto && <p className={styles.testoLezione}>{corrente.contenuto}</p>}

        {errore && <p className={styles.avviso} role="alert">{errore}</p>}

        <button
          type="button"
          className={`${styles.segna} ${fatte[corrente.id] ? styles.segnaFatta : ''}`}
          onClick={() => cambiaStato(corrente)}
          disabled={salvataggio}
        >
          {fatte[corrente.id]
            ? <><Check size={16} aria-hidden="true" /> Lezione completata</>
            : <><Circle size={16} aria-hidden="true" /> Segna come completata</>}
        </button>
      </section>

      <nav className={styles.indice} aria-label="Lezioni del corso">
        {moduli.map((modulo, indice) => (
          <div key={modulo.id}>
            <h3>Modulo {indice + 1} · {modulo.titolo}</h3>
            <ol>
              {modulo.lezioni.map(lezione => (
                <li key={lezione.id}>
                  <button
                    type="button"
                    className={[
                      styles.voce,
                      lezione.id === correnteId ? styles.voceAttiva : '',
                      fatte[lezione.id] ? styles.voceFatta : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setCorrenteId(lezione.id)}
                    aria-current={lezione.id === correnteId ? 'true' : undefined}
                  >
                    {fatte[lezione.id]
                      ? <Check size={15} aria-hidden="true" />
                      : lezione.tipo === 'video'
                        ? <PlayCircle size={15} aria-hidden="true" />
                        : <FileText size={15} aria-hidden="true" />}
                    <span>{lezione.titolo}</span>
                    {lezione.durata_min ? <small>{lezione.durata_min}′</small> : null}
                  </button>
                </li>
              ))}
              {modulo.lezioni.length === 0 && (
                <li><span className={styles.voce}>Lezioni in preparazione</span></li>
              )}
            </ol>
          </div>
        ))}
      </nav>
    </div>
  )
}
