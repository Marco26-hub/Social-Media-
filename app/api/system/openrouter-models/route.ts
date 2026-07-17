import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// Proxy verso il catalogo modelli OpenRouter (GET /api/v1/models, endpoint
// pubblico, nessuna key richiesta). Il selettore UI mostra così i modelli
// REALMENTE disponibili via API invece di una lista hardcoded che invecchia.
// Cache in-memory 1h: il catalogo cambia raramente e il proxy non deve
// martellare OpenRouter a ogni apertura della dropdown.

export type ORModel = {
  id: string
  name: string
  context: string
  free: boolean
  vision: boolean
  created: number
}

let cache: { at: number; models: ORModel[] } | null = null
const TTL_MS = 60 * 60 * 1000

function fmtContext(n: unknown): string {
  const x = typeof n === 'number' && Number.isFinite(n) ? n : 0
  if (x >= 1_000_000) return `${Math.round(x / 1_000_000)}M`
  if (x >= 1_000) return `${Math.round(x / 1_000)}K`
  return x > 0 ? String(x) : 'n/d'
}

export async function GET() {
  // Auth fuori dal try: un utente non autenticato deve ricevere 401 (via apiError),
  // non un 502 "OpenRouter giù" che maschererebbe il vero motivo.
  try {
    await requireAuth()
  } catch (e) {
    return apiError(e)
  }
  try {
    if (cache && Date.now() - cache.at < TTL_MS) {
      return NextResponse.json({ ok: true, cached: true, models: cache.models })
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    let raw: Response
    try {
      raw = await fetch('https://openrouter.ai/api/v1/models', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
    } finally {
      clearTimeout(timer)
    }
    if (!raw.ok) {
      // Niente lista finta: la UI ha il suo fallback curato, qui segnaliamo il buco.
      return NextResponse.json({ ok: false, error: `OpenRouter ha risposto HTTP ${raw.status}` }, { status: 502 })
    }
    const data = await raw.json() as { data?: Array<Record<string, unknown>> }
    const list = Array.isArray(data?.data) ? data.data : []

    const models: ORModel[] = list
      .map(m => {
        const id = String(m.id || '')
        const pricing = (m.pricing || {}) as Record<string, unknown>
        const arch = (m.architecture || {}) as Record<string, unknown>
        const modalities = Array.isArray(arch.input_modalities) ? (arch.input_modalities as string[]) : []
        // "free" affidabile: prompt E completion a costo zero (il suffisso :free da
        // solo non basta, alcuni free non lo portano).
        const free = Number(pricing.prompt ?? 1) === 0 && Number(pricing.completion ?? 1) === 0
        return {
          id,
          name: String(m.name || id),
          context: fmtContext(m.context_length),
          free,
          vision: modalities.includes('image'),
          created: typeof m.created === 'number' ? m.created : 0,
        }
      })
      .filter(m => m.id)
      // Più recenti prima dentro ogni gruppo; il gruppo free viene ordinato in UI.
      .sort((a, b) => b.created - a.created)

    if (!models.length) {
      return NextResponse.json({ ok: false, error: 'Catalogo OpenRouter vuoto o formato inatteso' }, { status: 502 })
    }

    cache = { at: Date.now(), models }
    return NextResponse.json({ ok: true, cached: false, models })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore catalogo OpenRouter'
    return NextResponse.json({ ok: false, error: msg }, { status: 502 })
  }
}
