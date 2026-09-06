'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, PhoneCall, X } from 'lucide-react'
import { EVENTO_CONSENSO, leggiConsenso } from '@/lib/cookie-consent'
import styles from './segretaria-popup.module.css'

// Invito alla Segretaria telefonica AI, mostrato solo in home.
//
// Scelte volute: compare dopo qualche secondo (non all'ingresso, che infastidisce
// e viene chiuso senza leggere), sta in un angolo invece di coprire la pagina, e
// una volta chiuso non torna per un mese. Il layout riprende quello della landing
// AgendaPiena; cambiano solo i colori, che qui sono quelli del brand SWA.
const CHIAVE = 'swa_popup_segretaria'
const GIORNI_SILENZIO = 30
const RITARDO_MS = 7000

function giaVisto(): boolean {
  try {
    const salvato = window.localStorage.getItem(CHIAVE)
    if (!salvato) return false
    const scadenza = Number(salvato)
    if (!Number.isFinite(scadenza)) return false
    return Date.now() < scadenza
  } catch {
    // Storage negato (finestra anonima, cookie bloccati): meglio non mostrarlo
    // che mostrarlo a ogni caricamento.
    return true
  }
}

export default function SegretariaPopup() {
  const [visibile, setVisibile] = useState(false)
  const [uscita, setUscita] = useState(false)
  const chiudiRef = useRef<HTMLButtonElement>(null)

  const chiudi = useCallback(() => {
    setUscita(true)
    try {
      window.localStorage.setItem(CHIAVE, String(Date.now() + GIORNI_SILENZIO * 86400_000))
    } catch { /* senza storage il popup ricomparira: accettabile, non bloccante */ }
    window.setTimeout(() => setVisibile(false), 260)
  }, [])

  useEffect(() => {
    if (giaVisto()) return
    // Due riquadri sovrapposti in basso sono uno di troppo: si aspetta che il
    // banner cookie abbia avuto la sua risposta prima di chiedere altro.
    const avvia = () => {
      if (!leggiConsenso(document.cookie)) return false
      window.setTimeout(() => setVisibile(true), RITARDO_MS)
      return true
    }
    if (avvia()) return
    const alConsenso = () => { if (avvia()) window.removeEventListener(EVENTO_CONSENSO, alConsenso) }
    window.addEventListener(EVENTO_CONSENSO, alConsenso)
    return () => window.removeEventListener(EVENTO_CONSENSO, alConsenso)
  }, [])

  useEffect(() => {
    if (!visibile) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') chiudi() }
    window.addEventListener('keydown', esc)
    chiudiRef.current?.focus()
    return () => window.removeEventListener('keydown', esc)
  }, [visibile, chiudi])

  if (!visibile) return null

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="popup-segretaria-titolo"
      className={`${styles.popup} ${uscita ? styles.esce : ''}`}
    >
      <button ref={chiudiRef} onClick={chiudi} className={styles.chiudi} aria-label="Chiudi l’avviso">
        <X size={16} aria-hidden="true" />
      </button>

      <p className={styles.occhiello}><i className={styles.para} aria-hidden="true" />Novità</p>

      <h2 id="popup-segretaria-titolo" className={styles.titolo}>
        Quando il telefono squilla e tu non ci sei, risponde lei.
      </h2>

      <p className={styles.testo}>
        La segretaria telefonica AI risponde, fissa gli appuntamenti e riempie gli orari
        rimasti liberi. I messaggi ai clienti partono solo dopo la tua approvazione.
      </p>

      <div className={styles.azioni}>
        <Link href="/servizi/segretaria-ai" className={styles.cta} onClick={chiudi}>
          <PhoneCall size={16} aria-hidden="true" />
          Scopri come funziona
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <button onClick={chiudi} className={styles.dopo}>Non ora</button>
      </div>
    </aside>
  )
}
