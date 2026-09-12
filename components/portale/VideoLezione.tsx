'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './video-lezione.module.css'

// Player delle lezioni. Il file non arriva mai come URL diretto: la sorgente e
// /api/corsi/video/<lezione>, che verifica sessione e acquisto a ogni richiesta.
//
// Su questa pagina ci sono tre difese, in ordine di efficacia reale:
//
// 1. FILIGRANA con nome, email e azienda di chi sta guardando. E' l'unica che
//    conta davvero su un corso da migliaia di euro: non impedisce di registrare
//    lo schermo — niente lo impedisce, nemmeno il DRM dei grandi servizi di
//    streaming — ma finisce dentro la registrazione. Una copia che gira porta
//    scritto addosso chi l'ha fatta uscire, e chi guarda lo sa mentre guarda.
//    Si sposta ogni venti secondi: ritagliarla via significa ritagliare il video.
// 2. PAUSA quando la finestra perde il fuoco o la scheda va in secondo piano.
//    Rende scomodo lasciar girare la lezione mentre si registra facendo altro.
// 3. BLOCCHI del player: niente tasto scarica, niente menu col tasto destro,
//    niente picture-in-picture. Fermano chi ci proverebbe solo perche' e facile.
//
// Quello che NON facciamo e fingere di rilevare una registrazione in corso: dal
// browser non e possibile, e un avviso finto darebbe una falsa sicurezza.

type Props = {
  lezioneId: string
  titolo: string
  /** Chi sta guardando: finisce nella filigrana. */
  spettatore: { nome: string | null; email: string; azienda?: string | null }
  poster?: string | null
}

// Sei posizioni lungo i bordi: la filigrana non resta mai ferma dove si potrebbe
// ritagliare, e non copre mai il centro dell'immagine.
const POSIZIONI = [
  styles.altoSinistra,
  styles.altoDestra,
  styles.centroDestra,
  styles.bassoDestra,
  styles.bassoSinistra,
  styles.centroSinistra,
]

export function VideoLezione({ lezioneId, titolo, spettatore, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [posizione, setPosizione] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPosizione(p => (p + 1) % POSIZIONI.length)
    }, 20000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const metti = () => videoRef.current?.pause()
    const quandoNascosta = () => { if (document.hidden) metti() }

    window.addEventListener('blur', metti)
    document.addEventListener('visibilitychange', quandoNascosta)
    return () => {
      window.removeEventListener('blur', metti)
      document.removeEventListener('visibilitychange', quandoNascosta)
    }
  }, [])

  const etichetta = [spettatore.nome, spettatore.azienda, spettatore.email]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={styles.contenitore}>
      <video
        ref={videoRef}
        className={styles.video}
        src={`/api/corsi/video/${lezioneId}`}
        poster={poster || undefined}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        onContextMenu={e => e.preventDefault()}
        aria-label={titolo}
      />
      <span className={`${styles.filigrana} ${POSIZIONI[posizione]}`} aria-hidden="true">
        {etichetta}
      </span>
    </div>
  )
}
