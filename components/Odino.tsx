'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { NODI, NODO_INIZIALE, cerca, nodo, settoreCitato, type Nodo } from '@/lib/odino/percorsi'
import { cercaDomande, type Domanda } from '@/lib/odino/domande'
import { ODINO_NOME, ODINO_PRESENTAZIONE } from '@/lib/odino/identita'
import { EVENTO_CONSENSO, leggiConsenso } from '@/lib/cookie-consent'
import { EVENTO_RIQUADRO, angoloLibero } from '@/lib/riquadri'
import OdinoFaccia from './OdinoFaccia'
import styles from './odino.module.css'

// ODINO, l'assistente del sito.
//
// Non e' collegato a nessun modello di AI ed e' una scelta, non un ripiego: le
// risposte vengono dalle stesse sorgenti che alimentano le pagine, quindi non
// puo' dire un prezzo diverso da quello scritto sul sito nemmeno volendo. Un
// assistente che parla di listini e contratti vale per quello che non puo'
// sbagliare, non per quanto sa conversare.
//
// Chi scrive a mano libera viene indirizzato per parole chiave. Se nessuna
// corrisponde, ODINO lo dice e offre le domande che sa trattare, invece di
// rispondere a caso.

export default function Odino() {
  const [aperto, setAperto] = useState(false)
  const [corrente, setCorrente] = useState<Nodo>(() => nodo(NODO_INIZIALE)!)
  const [scritto, setScritto] = useState('')
  const [nonCapito, setNonCapito] = useState<string | null>(null)
  const [settore, setSettore] = useState<{ slug: string; nome: string } | null>(null)
  // Il secondo livello: le duecento domande gia' scritte sul sito. Il percorso
  // curato risponde per primo perche' e' scritto per essere la prima cosa che
  // si legge; queste servono ad approfondire, e mostrano da quale pagina
  // vengono cosi' chi vuole il contesto sa dove andare.
  const [approfondimenti, setApprofondimenti] = useState<Domanda[]>([])
  const [aperta, setAperta] = useState<string | null>(null)
  const corpoRef = useRef<HTMLDivElement>(null)
  const chiudiRef = useRef<HTMLButtonElement>(null)
  // ODINO aspetta che il banner cookie abbia avuto risposta. Sono due pannelli
  // fissi nello stesso angolo, e quello che va risposto per primo e' il banner:
  // sovrapporgli un assistente significa mettere una richiesta commerciale
  // davanti a una scelta che la legge vuole libera.
  const [consensoDato, setConsensoDato] = useState(false)
  // L'angolo in basso a destra ha un padrone alla volta: se c'e' gia il popup
  // della segretaria, ODINO aspetta che chiuda invece di sovrapporsi.
  const [angoloDisponibile, setAngoloDisponibile] = useState(true)

  useEffect(() => {
    const leggi = () => setConsensoDato(leggiConsenso(document.cookie) !== null)
    const guarda = () => setAngoloDisponibile(angoloLibero())
    leggi()
    guarda()
    window.addEventListener(EVENTO_CONSENSO, leggi)
    window.addEventListener(EVENTO_RIQUADRO, guarda)
    return () => {
      window.removeEventListener(EVENTO_CONSENSO, leggi)
      window.removeEventListener(EVENTO_RIQUADRO, guarda)
    }
  }, [])

  // Chiusura da tastiera: un pannello che si apre sopra la pagina deve potersi
  // chiudere senza cercare la X col mouse.
  useEffect(() => {
    if (!aperto) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAperto(false) }
    window.addEventListener('keydown', esc)
    chiudiRef.current?.focus()
    return () => window.removeEventListener('keydown', esc)
  }, [aperto])

  useEffect(() => { corpoRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }, [corrente])

  const seguenti = useMemo(
    () => (corrente.risposta.poi ?? []).map(id => nodo(id)).filter((n): n is Nodo => Boolean(n)),
    [corrente],
  )

  function vai(n: Nodo, dalSito: Domanda[] = []) {
    setCorrente(n)
    setNonCapito(null)
    setApprofondimenti(dalSito)
    setAperta(null)
  }

  function invia(e: React.FormEvent) {
    e.preventDefault()
    const testo = scritto.trim()
    if (!testo) return
    setScritto('')
    const mestiere = settoreCitato(testo)
    if (mestiere) setSettore(mestiere)
    const dalSito = cercaDomande(testo, 3)
    const trovati = cerca(testo)
    if (trovati.length) { vai(trovati[0], dalSito); return }
    if (dalSito.length) {
      // Nessun percorso curato, ma il sito una risposta ce l'ha: si mostra
      // quella, con la pagina da cui viene.
      setCorrente(nodo('da-dove-parto')!)
      setNonCapito(null)
      setApprofondimenti(dalSito)
      setAperta(dalSito[0].q)
      return
    }
    if (mestiere) { vai(nodo('da-dove-parto')!); return }
    setNonCapito(testo)
    setApprofondimenti([])
  }

  // Aperto resta aperto: se una persona ha gia' cliccato, il popup non lo scaccia.
  if (!consensoDato || (!angoloDisponibile && !aperto)) return null

  if (!aperto) {
    return (
      <button type="button" className={styles.lancio} onClick={() => setAperto(true)}>
        <OdinoFaccia className={styles.faccia} intero />
        <span>Chiedi a {ODINO_NOME}</span>
      </button>
    )
  }

  return (
    <aside className={styles.pannello} role="dialog" aria-modal="false" aria-label={`${ODINO_NOME}, assistente di Social Web Automation`}>
      <header className={styles.testa}>
        <OdinoFaccia className={styles.faccia} />
        <div>
          <strong>{ODINO_NOME}</strong>
          <small>{ODINO_PRESENTAZIONE.replace('Sono ODINO, l’', 'L’')}</small>
        </div>
        <button ref={chiudiRef} type="button" className={styles.chiudi} onClick={() => setAperto(false)} aria-label="Chiudi">
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      <div className={styles.corpo} ref={corpoRef}>
        {nonCapito ? (
          <>
            <h2 className={styles.titolo}>Questa non la so.</h2>
            <p className={styles.testo}>
              Rispondo solo con quello che è scritto sul sito, e su «{nonCapito}» non ho niente di verificato.
              Preferisco dirtelo piuttosto che inventare. Queste invece le so trattare, oppure scrivi a una persona.
            </p>
          </>
        ) : (
          <>
            {settore && (
              <p className={styles.etichetta}>
                Per {settore.nome.toLowerCase()} c’è una pagina dedicata
              </p>
            )}
            {settore && (
              <p className={styles.link}>
                <Link href={`/settori/${settore.slug}`}>Apri la pagina {settore.nome}</Link>
              </p>
            )}
            <h2 className={styles.titolo}>{corrente.risposta.titolo}</h2>
            <p className={styles.testo}>{corrente.risposta.testo}</p>

            {corrente.risposta.cifre && corrente.risposta.cifre.length > 0 && (
              <div className={styles.cifre}>
                {corrente.risposta.cifre.map(c => (
                  <div className={styles.cifra} key={c.voce}>
                    <b>{c.voce}</b>
                    <span className={styles.valore}>{c.valore}</span>
                    {c.nota && <i>{c.nota}</i>}
                  </div>
                ))}
              </div>
            )}

            {corrente.risposta.link && corrente.risposta.link.length > 0 && (
              <p className={styles.link}>
                {corrente.risposta.link.slice(0, 6).map(l => (
                  <Link key={l.href + l.label} href={l.href}>{l.label}</Link>
                ))}
              </p>
            )}
          </>
        )}

        {approfondimenti.length > 0 && (
          <>
            <p className={styles.etichetta}>Risposte dal sito</p>
            <div className={styles.dalSito}>
              {approfondimenti.map(d => (
                <details key={d.q} open={aperta === d.q}>
                  <summary onClick={() => setAperta(aperta === d.q ? null : d.q)}>{d.q}</summary>
                  <p>{d.a}</p>
                  <Link href={d.fonte.href}>{d.fonte.label}</Link>
                </details>
              ))}
            </div>
          </>
        )}

        <p className={styles.etichetta}>{nonCapito ? 'Posso rispondere su' : 'Da qui'}</p>
        <ul className={styles.domande}>
          {(nonCapito ? NODI.slice(0, 6) : seguenti).map(n => (
            <li key={n.id}>
              <button type="button" onClick={() => vai(n)}>{n.domanda}</button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.piede}>
        <form onSubmit={invia}>
          <label htmlFor="odino-domanda" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            Scrivi la tua domanda
          </label>
          <input
            id="odino-domanda"
            value={scritto}
            onChange={e => setScritto(e.target.value)}
            placeholder="Oppure scrivi: «ho un centro estetico»"
            autoComplete="off"
          />
          <button type="submit">Chiedi</button>
        </form>
        <p className={styles.nota}>
          Sono un assistente automatico, non una persona. Le cifre che ti mostro sono quelle del listino
          pubblico: non le invento e non le tratto. Per un preventivo serve una persona.
        </p>
      </div>
    </aside>
  )
}
