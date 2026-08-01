import { logTokenUsage, tokenMetaStore, type TokenMeta } from '@/lib/token-usage'

// ─────────────────────────────────────────────────────────────────────────
// Bridge AI — SOLO OpenRouter. L'admin usa i modelli tramite la SUA OpenRouter
// API key (per-browser) o la key server OPENROUTER_API_KEY. Tutti i provider
// locali (Ollama) e non-OpenRouter (Anthropic/Gemini/OpenCode/Agnes) sono stati
// rimossi: OpenRouter instrada già Google/OpenAI/Anthropic/Meta/... da un'unica API.
// ─────────────────────────────────────────────────────────────────────────

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Modello testo di DEFAULT quando la route/il client non ne specifica uno.
// Free tier OpenRouter (nessun costo, richiede solo la key). L'admin può scegliere
// qualsiasi altro modello dalla lista del selettore.
export const DEFAULT_TEXT_MODEL = 'google/gemma-4-31b-it:free'

// Rete di sicurezza: se il modello scelto fallisce (rate-limit/errore), prova
// questi (free) prima di arrendersi. Cap basso per restare sotto il timeout gateway.
const FALLBACK_MODELS = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-20b:free',
]
const MAX_OPENROUTER_FALLBACKS = 2

// Modelli OpenRouter che VEDONO le immagini (vision). I text-only danno 404
// "No endpoints found that support image input" se ricevono un'immagine → con una
// foto caricata usiamo SOLO questi (a pagamento, richiedono credito sulla key).
const OPENROUTER_VISION_FALLBACKS = [
  'google/gemini-2.5-flash',
  'openai/gpt-4o-mini',
]

// Riconosce un modello capace di vision (per non mandargli immagini a vuoto).
function isVisionModel(model: string): boolean {
  return /gemini|gpt-4o|gpt-4-vision|claude-3|claude-sonnet|claude-opus|-vl\b|llava|vision|pixtral|llama-3\.2-\d+b-vision/i.test(model)
}

type AIAttempt = {
  provider: 'openrouter'
  model: string
  ok: boolean
  error?: string
}

function sanitizeAIError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || 'errore sconosciuto')
  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [redacted]')
    .replace(/sk-[A-Za-z0-9._-]{10,}/g, 'sk-[redacted]')
    // Non esporre identificatori/utente del provider nel messaggio al client.
    .replace(/"?user_id"?\s*:\s*"[^"]*"/gi, '')
    .slice(0, 300)
}

function isRateLimit(message?: string) {
  return /\b429\b|rate.?limit/i.test(message || '')
}

// Estrae un motivo BREVE e sicuro da una risposta HTTP, senza riversare il corpo
// JSON grezzo (che contiene user_id, metadata, ecc.).
function formatHttpError(status: number, body: string): string {
  if (status === 429) {
    const m = body.match(/retry_after_seconds"?\s*:\s*"?(\d+)/i)
      || body.match(/retry[- ]?after"?\s*:\s*"?(\d+)/i)
    return m ? `429 rate-limited (retry ${m[1]}s)` : '429 rate-limited'
  }
  let reason = ''
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } | string }
    reason = typeof parsed.error === 'string' ? parsed.error : (parsed.error?.message || '')
  } catch {
    reason = body
  }
  return `${status} ${reason}`.trim().slice(0, 260)
}

function recordAttempt(attempts: AIAttempt[], attempt: AIAttempt) {
  attempts.push(attempt)
  if (!attempt.ok) {
    console.warn('[AI fallback]', `${attempt.provider}(${attempt.model}): ${attempt.error}`)
  } else if (attempts.length > 1) {
    console.warn('[AI fallback ok]', `${attempt.provider}(${attempt.model}) dopo ${attempts.length - 1} fallback`)
  }
}

function buildFailureMessage(attempts: AIAttempt[]) {
  if (!attempts.length) {
    return 'Nessuna API key OpenRouter configurata. Incolla la tua OpenRouter API Key nel pannello modello (o imposta OPENROUTER_API_KEY sul server).'
  }
  const failed = attempts.filter(a => !a.ok)
  if (failed.length && failed.every(a => isRateLimit(a.error))) {
    const retry = failed.map(a => a.error?.match(/retry (\d+)s/)?.[1]).find(Boolean)
    const wait = retry ? ` Riprova tra ~${retry}s` : ' Riprova tra qualche secondo'
    return `Modelli AI temporaneamente sovraccarichi (rate limit).${wait}, oppure scegli un modello a pagamento con credito sulla tua key OpenRouter.`
  }
  const summary = attempts
    .map((attempt, index) => `${index + 1}. ${attempt.model}: ${attempt.ok ? 'ok' : attempt.error || 'errore'}`)
    .join(' | ')
  return `Generazione AI fallita dopo ${attempts.length} tentativo/i: ${summary}`
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Attesa massima prima del ritentativo, per restare sotto il timeout del client.
const MAX_RETRY_WAIT_MS = 28000
function rateLimitWaitMs(failures: AIAttempt[]): number {
  const secs = failures
    .map(a => Number(a.error?.match(/retry (\d+)s/)?.[1] || 0))
    .filter(n => n > 0)
  const max = secs.length ? Math.max(...secs) : 8
  return Math.min(max * 1000 + 500, MAX_RETRY_WAIT_MS)
}

async function tryOpenRouterModel(
  model: string,
  systemPrompt: string | undefined,
  userPrompt: string,
  key: string,
  maxTokens: number,
  attempts: AIAttempt[],
  images: string[] = [],
  timeoutMs = 30000,
): Promise<string | null> {
  try {
    const res = await callOpenRouter(model, systemPrompt, userPrompt, key, maxTokens, timeoutMs, images)
    if (!res.trim()) throw new Error('Risposta AI vuota')
    recordAttempt(attempts, { provider: 'openrouter', model, ok: true })
    return res
  } catch (e) {
    recordAttempt(attempts, { provider: 'openrouter', model, ok: false, error: sanitizeAIError(e) })
    return null
  }
}

export async function callAI(params: Parameters<typeof callAIImpl>[0]): Promise<string> {
  // Avvolge l'esecuzione nel contesto meta: i log token (in callOpenRouter) sanno a
  // chi/cosa attribuire i token senza threading di parametri.
  return tokenMetaStore.run(params.meta ?? {}, () => callAIImpl(params))
}

async function callAIImpl(params: {
  model: string
  systemPrompt?: string
  userPrompt: string
  openrouterKey?: string
  maxTokens?: number
  silentFallback?: boolean
  images?: string[]
  timeoutMs?: number
  meta?: TokenMeta
}): Promise<string> {
  const { model, systemPrompt, userPrompt, maxTokens = 4000, silentFallback = true, images = [], timeoutMs = 30000 } = params
  // SICUREZZA: la key BYO arriva dal client (localStorage). Accettala solo col
  // formato atteso, altrimenti ignorala e usa quella server.
  const byoKey = (params.openrouterKey || '').trim()
  const validByoKey = /^sk-or-v1-[A-Za-z0-9_-]{20,}$/.test(byoKey) ? byoKey : ''
  const orKey = (validByoKey || process.env.OPENROUTER_API_KEY || '').trim()

  const attempts: AIAttempt[] = []

  if (byoKey && !validByoKey && !process.env.OPENROUTER_API_KEY?.trim()) {
    recordAttempt(attempts, { provider: 'openrouter', model, ok: false, error: 'Key OpenRouter non valida: deve iniziare con "sk-or-v1-"' })
  }
  if (!orKey) {
    throw new Error('Nessuna API key OpenRouter. Incolla la tua OpenRouter API Key nel pannello modello (o imposta OPENROUTER_API_KEY sul server).')
  }

  const needsVision = images.length > 0
  let orModels: string[] = [model]
  if (silentFallback) {
    const pool = needsVision ? OPENROUTER_VISION_FALLBACKS : FALLBACK_MODELS
    let n = 0
    for (const fb of pool) {
      if (fb === model) continue
      if (n >= MAX_OPENROUTER_FALLBACKS) break
      n++
      orModels.push(fb)
    }
  }
  // Con un'immagine caricata: SOLO modelli vision (i text-only danno 404 su image input).
  if (needsVision) orModels = orModels.filter(isVisionModel)
  orModels = [...new Set(orModels)]

  // Immagine caricata ma nessun modello vision disponibile: messaggio azionabile.
  if (needsVision && !orModels.length) {
    throw new Error(
      'Hai caricato un\'immagine ma il modello selezionato non la "vede". Scegli un modello vision ' +
      '(es. google/gemini-2.5-flash o openai/gpt-4o-mini) con credito sulla tua key OpenRouter, oppure genera senza immagine.',
    )
  }

  // Ondata 1: modello scelto + fallback.
  for (const m of orModels) {
    const res = await tryOpenRouterModel(m, systemPrompt, userPrompt, orKey, maxTokens, attempts, images, timeoutMs)
    if (res) return res
  }

  // Ondata 2: se TUTTO è rate-limited, attende il Retry-After e ritenta una volta
  // (le code free upstream si liberano in ~20-30s).
  const orFailures = attempts.filter(a => !a.ok)
  if (orModels.length && orFailures.length && orFailures.every(a => isRateLimit(a.error))) {
    const waitMs = rateLimitWaitMs(orFailures)
    if (waitMs > 0) {
      console.warn('[AI bridge]', `modelli rate-limited, attendo ${Math.round(waitMs / 1000)}s e ritento`)
      await sleep(waitMs)
      const res = await tryOpenRouterModel(orModels[0], systemPrompt, userPrompt, orKey, maxTokens, attempts, images, timeoutMs)
      if (res) return res
    }
  }

  // Immagine + nessun modello ha accettato l'input immagine: messaggio vision chiaro.
  if (needsVision && attempts.some(a => /image input|vision|support image/i.test(a.error || ''))) {
    throw new Error(
      'Hai caricato un\'immagine ma il modello non la "vede" (serve un modello vision). Scegli un modello vision ' +
      '(es. google/gemini-2.5-flash) con credito OpenRouter, oppure genera senza immagine.',
    )
  }
  throw new Error(buildFailureMessage(attempts))
}

// Contenuto messaggio user per API OpenAI-compatibile: stringa se niente immagini,
// array multimodale text+image_url se ci sono (URL pubblici; la vision legge il prodotto).
// Cap a 10 immagini (= limite carosello Instagram): copre un intero blocco del piano
// (IMAGES_PER_CHUNK=7) e un carosello pieno. Prima erano solo 4 → con più foto la vision
// "vedeva" solo le prime 4 e assegnava/descriveva male le altre. I modelli vision usati
// (gemini-2.5-flash, gpt-4o-mini) accettano tranquillamente 10 immagini per messaggio.
const MAX_VISION_IMAGES = 10
function buildOpenAIUserContent(userPrompt: string, images: string[]): unknown {
  if (!images.length) return userPrompt
  return [
    { type: 'text', text: userPrompt },
    ...images.slice(0, MAX_VISION_IMAGES).map((url) => ({ type: 'image_url', image_url: { url } })),
  ]
}

async function callOpenRouter(
  model: string,
  systemPrompt: string | undefined,
  userPrompt: string,
  key: string,
  maxTokens: number,
  timeout = 30000,
  images: string[] = [],
): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  const messages: { role: string; content: unknown }[] = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: buildOpenAIUserContent(userPrompt, images) })

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      signal: controller.signal,
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.85 }),
    })
    if (res.ok) {
      const data = await res.json()
      void logTokenUsage({ provider: 'openrouter', model, usage: data.usage })
      return data.choices?.[0]?.message?.content || ''
    }

    // Bridge 402 "fewer max_tokens": credito insufficiente per i max_tokens richiesti,
    // ma OpenRouter dice quanti può permettersi. Riprova con quel valore.
    const rawBody = await res.text().catch(() => '')
    if (res.status === 402 && /fewer max_tokens|can only afford/i.test(rawBody)) {
      const afforded = Number(rawBody.match(/can only afford (\d+)/i)?.[1] || 0)
      const reducedTokens = afforded ? Math.max(afforded - 200, 1000) : Math.min(maxTokens, 8000)
      if (reducedTokens < maxTokens) {
        clearTimeout(timer)
        console.warn('[AI bridge]', `402 credito insufficiente per ${maxTokens} token, ritento con ${reducedTokens}`)
        return callOpenRouter(model, systemPrompt, userPrompt, key, reducedTokens, timeout, images)
      }
    }

    throw new Error(formatHttpError(res.status, rawBody))
  } finally {
    clearTimeout(timer)
  }
}

// Estrae il JSON e segnala se la risposta era TRONCATA (graffe non chiuse, ricostruite
// a forza). Il chiamante può usare `truncated` per ritentare con più token / modello
// con output maggiore invece di salvare un oggetto potenzialmente incompleto.
export function extractJSONChecked(text: string): { data: unknown; truncated: boolean } {
  let t = text.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()

  const start = t.indexOf('{')
  if (start === -1) throw new Error('No JSON object found in AI response')

  let depth = 0, end = -1, inStr = false, esc = false
  for (let i = start; i < t.length; i++) {
    const c = t[i]
    if (esc) { esc = false; continue }
    if (c === '\\') { esc = true; continue }
    if (c === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (c === '{') depth++
    else if (c === '}' && --depth === 0) { end = i; break }
  }

  const candidate = end !== -1 ? t.slice(start, end + 1) : t.slice(start)
  try {
    return { data: JSON.parse(candidate), truncated: false }
  } catch {
    if (end === -1 && depth > 0) {
      try {
        return { data: JSON.parse(candidate + '}'.repeat(depth)), truncated: true }
      } catch { /* cade sotto */ }
    }
    throw new Error(`Malformed JSON in AI response: ${candidate.slice(0, 300)}`)
  }
}

export function extractJSON(text: string): unknown {
  return extractJSONChecked(text).data
}

export function extractJSONArray(text: string): unknown[] {
  let t = text.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()

  const start = t.indexOf('[')
  if (start === -1) throw new Error('No JSON array found in AI response')

  let depth = 0, end = -1, inStr = false, esc = false
  for (let i = start; i < t.length; i++) {
    const c = t[i]
    if (esc) { esc = false; continue }
    if (c === '\\') { esc = true; continue }
    if (c === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (c === '[') depth++
    else if (c === ']' && --depth === 0) { end = i; break }
  }

  const candidate = end !== -1 ? t.slice(start, end + 1) : t.slice(start)
  try {
    return JSON.parse(candidate)
  } catch {
    if (end === -1 && depth > 0) {
      try { return JSON.parse(candidate + ']'.repeat(depth)) } catch { /* cade sotto */ }
    }
    throw new Error(`Malformed JSON array in AI response: ${candidate.slice(0, 300)}`)
  }
}
