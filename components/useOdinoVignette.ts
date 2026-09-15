'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type VignettaOdino = {
  id: number
  text: string
  kind: 'saluto' | 'attesa'
}

export type OpzioniVignetteOdino = {
  enabled: boolean
  inglese: boolean
  invito: string
  pageKey: string
  reducedMotion: boolean
  /** True after the customer opens the chat; latched separately for each page. */
  interacted: boolean
}

type Pagina = { elapsed: number; nextPrompt: number; nextAt: number; interacted: boolean }
type VignettaAttiva = { pageKey: string; value: VignettaOdino; expiresAt: number; automatic: boolean }

const DURATA = 12_000
const COOLDOWN_SALUTO = 18_000
const SOGLIE = [45_000, 100_000, 165_000] as const
const SESSION_KEY = 'swa-odino-saluto'
let salutatoInMemoria = false

function giaSalutato() {
  if (salutatoInMemoria) return true
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}

function registraSaluto() {
  salutatoInMemoria = true
  try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* Memory covers unavailable storage. */ }
}

/** Timings count only time with this page enabled and the document visible. */
export function useOdinoVignette({
  enabled, inglese, invito, pageKey, reducedMotion, interacted,
}: OpzioniVignetteOdino): { vignetta: VignettaOdino | null; saluta: () => void } {
  const pagine = useRef(new Map<string, Pagina>())
  const attiva = useRef<VignettaAttiva | null>(null)
  const prossimoId = useRef(0)
  const ultimoSaluto = useRef(-Infinity)
  const controllo = useRef<(() => void) | null>(null)
  const [mostrata, setMostrata] = useState<VignettaAttiva | null>(null)

  useEffect(() => {
    let pagina = pagine.current.get(pageKey)
    if (!pagina) {
      pagina = { elapsed: 0, nextPrompt: 0, nextAt: SOGLIE[0], interacted: false }
      pagine.current.set(pageKey, pagina)
    }
    const progresso = pagina
    progresso.interacted ||= interacted
    let timer: number | undefined
    let ultimoTick: number | null = null
    let disposed = false

    const attivo = () => enabled && document.visibilityState === 'visible'
    const automatiche = () => !reducedMotion && !progresso.interacted

    function aggiornaTempo() {
      const adesso = performance.now()
      if (ultimoTick !== null) progresso.elapsed += Math.max(0, adesso - ultimoTick)
      ultimoTick = attivo() ? adesso : null
    }

    function nascondi() {
      attiva.current = null
      setMostrata(null)
    }

    function mostra(text: string, kind: VignettaOdino['kind'], automatic: boolean) {
      const nuova: VignettaAttiva = {
        pageKey,
        value: { id: ++prossimoId.current, text, kind },
        expiresAt: progresso.elapsed + DURATA,
        automatic,
      }
      attiva.current = nuova
      setMostrata(nuova)
      if (kind === 'saluto') ultimoSaluto.current = performance.now()
    }

    function programma() {
      window.clearTimeout(timer)
      timer = undefined
      if (!attivo() || disposed) return
      const scadenza = attiva.current?.expiresAt
        ?? (automatiche() && progresso.nextPrompt < SOGLIE.length ? progresso.nextAt : Infinity)
      if (Number.isFinite(scadenza)) {
        timer = window.setTimeout(avanza, Math.max(1, scadenza - progresso.elapsed))
      }
    }

    function avanza() {
      if (disposed) return
      aggiornaTempo()
      if (attiva.current && progresso.elapsed >= attiva.current.expiresAt) nascondi()
      if (attivo() && automatiche() && !attiva.current) {
        if (!giaSalutato()) {
          registraSaluto()
          mostra(invito, 'saluto', true)
        } else if (progresso.nextPrompt < SOGLIE.length && progresso.elapsed >= progresso.nextAt) {
          const testi = inglese
            ? ["Ugh, I'm bored…", "Aren't you going to ask me anything?", "Come on, don't be shy!"]
            : ['Uff, mi annoio…', 'Non mi chiedi niente?', 'Dai, non essere timido!']
          const indice = progresso.nextPrompt++
          mostra(testi[indice], 'attesa', true)
          // Late timers shift the next deadline, preserving the gap instead of catching up.
          if (progresso.nextPrompt < SOGLIE.length) {
            progresso.nextAt = progresso.elapsed + SOGLIE[progresso.nextPrompt] - SOGLIE[indice]
          }
        }
      }
      programma()
    }

    function salutaManualmente() {
      if (disposed || !attivo()) return
      aggiornaTempo()
      if (attiva.current && progresso.elapsed >= attiva.current.expiresAt) nascondi()
      if (attiva.current || performance.now() - ultimoSaluto.current < COOLDOWN_SALUTO) return
      registraSaluto()
      mostra(invito.trim() || (inglese ? 'Can I help you?' : 'Posso aiutarti?'), 'saluto', false)
      programma()
    }

    if (attiva.current && (
      attiva.current.pageKey !== pageKey || !enabled || (attiva.current.automatic && !automatiche())
    )) nascondi()

    controllo.current = salutaManualmente
    document.addEventListener('visibilitychange', avanza)
    avanza()

    return () => {
      aggiornaTempo()
      disposed = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', avanza)
      if (controllo.current === salutaManualmente) controllo.current = null
    }
  }, [enabled, inglese, invito, pageKey, reducedMotion, interacted])

  const saluta = useCallback(() => controllo.current?.(), [])
  return { vignetta: enabled && mostrata?.pageKey === pageKey ? mostrata.value : null, saluta }
}

export default useOdinoVignette
