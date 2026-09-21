'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './ai-casa-landing.module.css'

/**
 * La scena luminosa della landing "AI a casa tua".
 *
 * Fa tre cose, tutte scrivendo variabili CSS: il resto del movimento e' nel
 * foglio di stile, dove il browser lo puo' comporre senza passare da React.
 *
 *  --apertura  0 -> 1   quanto e' aperto il coperchio del Mac, legato allo scorrimento
 *  --mx, --my  0 -> 1   dove sta il puntatore, per il bagliore che segue il mouse
 *  --vicino    0 -> 1   quanto la scena e' al centro dello schermo, per i riflessi
 *
 * Sullo schermo scorre una conversazione che si scrive da sola. Mostra il
 * risultato — una domanda in italiano e una risposta utile — e non il come:
 * niente comandi, niente log, niente nomi di modelli.
 *
 * Con prefers-reduced-motion non si aggancia nulla: il coperchio resta aperto,
 * il bagliore resta al centro e la conversazione compare gia' scritta.
 */

import type { BattutaTerminale } from '@/lib/ai-casa-contenuti'

type Battuta = BattutaTerminale

/** Quanto resta scritto prima di ricominciare, in millisecondi. */
const PAUSA_FINALE = 4200
const VELOCITA = 26

export default function AiCasaScena({
  intestazione,
  battute,
}: {
  intestazione: string
  battute: readonly Battuta[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scritte, setScritte] = useState<Battuta[]>([])
  const [inCorso, setInCorso] = useState('')
  const [chiScrive, setChiScrive] = useState<'tu' | 'ai'>('tu')
  const [fermo, setFermo] = useState(false)

  // Il movimento della macchina: coperchio, bagliore, riflessi.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    el.dataset.vivo = ''

    let frame = 0
    const aggiorna = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const h = window.innerHeight

      // Il coperchio si apre mentre la scena sale: chiuso quando il bordo alto
      // e' ancora in basso nello schermo, aperto quando ha percorso mezzo
      // schermo. Cosi l'apertura finisce prima che la scena esca di scena.
      const corsa = h * 0.62
      const apertura = Math.min(1, Math.max(0, (h - r.top) / corsa - 0.12))

      // Quanto il centro della scena e' vicino al centro dello schermo: regola
      // l'intensita' dei riflessi, che a bordo pagina darebbero solo rumore.
      const centro = r.top + r.height / 2
      const vicino = Math.min(1, Math.max(0, 1 - Math.abs(centro - h / 2) / (h * 0.75)))

      el.style.setProperty('--apertura', apertura.toFixed(3))
      el.style.setProperty('--vicino', vicino.toFixed(3))
    }

    const suScorrimento = () => {
      if (frame) return
      frame = requestAnimationFrame(aggiorna)
    }

    const suPuntatore = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width).toFixed(3))
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height).toFixed(3))
    }

    aggiorna()
    window.addEventListener('scroll', suScorrimento, { passive: true })
    window.addEventListener('resize', suScorrimento, { passive: true })
    el.addEventListener('pointermove', suPuntatore, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', suScorrimento)
      window.removeEventListener('resize', suScorrimento)
      el.removeEventListener('pointermove', suPuntatore)
    }
  }, [])

  // Il testo che si scrive da solo.
  //
  // Si ferma quando la scena non e' a schermo: questa e' una pagina di vendita,
  // non deve essere il motivo per cui il portatile del cliente scalda. Sulla
  // scheda in secondo piano non serve un controllo nostro, perche' il browser
  // rallenta da se' i timer delle schede nascoste.
  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScritte([...battute])
      setFermo(true)
      return
    }

    let visibile = false
    const osservatore = new IntersectionObserver(
      ([voce]) => { visibile = voce.isIntersecting },
      { threshold: 0.15 },
    )
    osservatore.observe(el)

    let annullato = false
    let attesa: ReturnType<typeof setTimeout> | undefined

    const dormi = (ms: number) =>
      new Promise<void>(risolvi => { attesa = setTimeout(risolvi, ms) })

    /** Aspetta che la scena sia a schermo. */
    const aspettaVisibile = async () => {
      while (!annullato && !visibile) await dormi(400)
    }

    const ciclo = async () => {
      while (!annullato) {
        setScritte([])
        for (const battuta of battute) {
          await aspettaVisibile()
          if (annullato) return
          setChiScrive(battuta.chi)
          for (let i = 1; i <= battuta.testo.length; i++) {
            if (annullato) return
            setInCorso(battuta.testo.slice(0, i))
            // La domanda del cliente si scrive piu' in fretta della risposta:
            // e' lui che digita, l'altra e' la macchina che ragiona.
            await dormi(battuta.chi === 'tu' ? VELOCITA * 0.7 : VELOCITA)
          }
          setScritte(precedenti => [...precedenti, battuta])
          setInCorso('')
          await dormi(battuta.chi === 'tu' ? 420 : 1100)
        }
        await dormi(PAUSA_FINALE)
      }
    }

    void ciclo()

    return () => {
      annullato = true
      if (attesa) clearTimeout(attesa)
      osservatore.disconnect()
    }
  }, [battute])

  return (
    <div ref={ref} className={styles.scena}>
      <div className={styles.alone} aria-hidden="true" />
      <div className={styles.griglia} aria-hidden="true" />

      <div className={styles.mac}>
        <div className={styles.coperchio}>
          <div className={styles.schermo}>
            <div className={styles.schermoLuce} aria-hidden="true" />

            {/* La conversazione e' decorativa: il testo vero della pagina sta
                nelle sezioni sotto, quindi qui non serve a chi usa uno
                screen reader e resta fuori dall'albero di accessibilita'. */}
            <div className={styles.terminale} aria-hidden="true">
              <p className={styles.terminaleTesta}>
                <span className={styles.uiPunto} />
                {intestazione}
              </p>

              <div className={styles.terminaleCorpo}>
                {scritte.map((battuta, i) => (
                  <p
                    key={`${i}-${battuta.testo}`}
                    className={battuta.chi === 'tu' ? styles.rigaTu : styles.rigaAi}
                  >
                    {battuta.testo}
                  </p>
                ))}

                {inCorso && (
                  <p className={chiScrive === 'tu' ? styles.rigaTu : styles.rigaAi}>
                    {inCorso}
                    <span className={styles.cursore} />
                  </p>
                )}

                {!inCorso && !fermo && <span className={styles.cursore} />}
              </div>
            </div>
          </div>
          <div className={styles.retroCoperchio} aria-hidden="true" />
        </div>

        <div className={styles.base} aria-hidden="true">
          <div className={styles.tastiera} />
          <div className={styles.trackpad} />
        </div>

        <div className={styles.riflesso} aria-hidden="true" />
      </div>

      <div className={styles.raggio} aria-hidden="true" />
    </div>
  )
}
