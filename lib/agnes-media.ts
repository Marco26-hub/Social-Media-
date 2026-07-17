// ─────────────────────────────────────────────────────────────────────────
// Agnes AI — generazione MEDIA (immagini e video) via apihub.agnes-ai.com.
// API OpenAI-compatible: /v1/images/generations (verificato: ritorna {data:[{url}]})
// e /v1/video/generations. Complementa ComfyUI locale: Agnes gira anche sul
// cloud (Vercel), dove ComfyUI non è raggiungibile.
// Key: BYO dal client (localStorage) o env AGNES_API_KEY.
// ─────────────────────────────────────────────────────────────────────────

const AGNES_BASE = (process.env.AGNES_API_BASE || 'https://apihub.agnes-ai.com').replace(/\/+$/, '')

export const AGNES_IMAGE_MODEL = 'agnes-image-2.1-flash'
export const AGNES_VIDEO_MODEL = 'agnes-video-v2.0'

export function agnesMediaKey(byoKey?: string): string {
  const byo = (byoKey || '').trim()
  const valid = /^sk-[A-Za-z0-9_-]{16,}$/.test(byo) ? byo : ''
  return (valid || process.env.AGNES_API_KEY || '').trim()
}

function shortError(status: number, body: string): string {
  let reason = ''
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } | string }
    reason = typeof parsed.error === 'string' ? parsed.error : (parsed.error?.message || '')
  } catch {
    reason = body
  }
  return `Agnes ${status} ${reason}`.trim().slice(0, 260)
}

// Genera UNA immagine e ritorna l'URL sull'output storage di Agnes. L'URL va
// poi ri-hostato sul nostro storage (il chiamante decide): gli output esterni
// possono scadere, il media del contenuto deve vivere sul nostro bucket.
export async function generateImageAgnes(opts: {
  prompt: string
  size?: string // "1024x1024" | "1024x1536" | ...
  model?: string
  apiKey?: string
  timeoutMs?: number
}): Promise<{ url: string }> {
  const key = agnesMediaKey(opts.apiKey)
  if (!key) throw new Error('Agnes AI: nessuna API key (env AGNES_API_KEY o key dal client)')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 120000)
  try {
    const res = await fetch(`${AGNES_BASE}/v1/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: opts.model || AGNES_IMAGE_MODEL,
        prompt: opts.prompt,
        n: 1,
        size: opts.size || '1024x1024',
      }),
    })
    if (!res.ok) throw new Error(shortError(res.status, await res.text().catch(() => '')))
    const data = await res.json() as { data?: Array<{ url?: string | null; b64_json?: string | null }> }
    const first = data.data?.[0]
    if (first?.url) return { url: first.url }
    // Alcuni modelli/config rispondono in base64: convertiamo in data URL solo se
    // c'è davvero (mai inventare un media).
    if (first?.b64_json) return { url: `data:image/png;base64,${first.b64_json}` }
    throw new Error('Agnes non ha restituito nessuna immagine (data[0] vuoto)')
  } finally {
    clearTimeout(timer)
  }
}

// Scarica l'immagine generata (per ri-hostarla sul nostro storage).
export async function fetchAgnesImageBytes(url: string, timeoutMs = 60000): Promise<{ bytes: Buffer; mime: string }> {
  if (url.startsWith('data:')) {
    const m = url.match(/^data:([^;]+);base64,(.+)$/)
    if (!m) throw new Error('Data URL immagine non valido')
    return { bytes: Buffer.from(m[2], 'base64'), mime: m[1] }
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Download immagine Agnes fallito: HTTP ${res.status}`)
    const mime = res.headers.get('content-type') || 'image/png'
    const bytes = Buffer.from(await res.arrayBuffer())
    if (!bytes.length) throw new Error('Immagine Agnes vuota (0 byte)')
    return { bytes, mime }
  } finally {
    clearTimeout(timer)
  }
}

// Generazione VIDEO. Endpoint verificato esistente (POST /v1/video/generations —
// risponde 400 "Model name not specified" a body vuoto). Il formato di risposta
// può essere sincrono ({data:[{url}]}) o asincrono ({id/task_id} da pollare):
// gestiamo entrambi e in caso di shape sconosciuto NON fingiamo un URL — errore
// esplicito con il payload ricevuto, così si adatta il parser una volta visto
// il formato reale del proprio account.
export async function generateVideoAgnes(opts: {
  prompt: string
  model?: string
  apiKey?: string
  timeoutMs?: number
}): Promise<{ url?: string; taskId?: string; raw?: unknown }> {
  const key = agnesMediaKey(opts.apiKey)
  if (!key) throw new Error('Agnes AI: nessuna API key (env AGNES_API_KEY o key dal client)')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 300000)
  try {
    const res = await fetch(`${AGNES_BASE}/v1/video/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      signal: controller.signal,
      body: JSON.stringify({ model: opts.model || AGNES_VIDEO_MODEL, prompt: opts.prompt }),
    })
    if (!res.ok) throw new Error(shortError(res.status, await res.text().catch(() => '')))
    const data = await res.json() as Record<string, unknown>
    const arr = Array.isArray(data.data) ? data.data as Array<Record<string, unknown>> : []
    const url = (arr[0]?.url as string) || (data.url as string) || ''
    const taskId = (data.id as string) || (data.task_id as string) || ''
    if (url) return { url }
    if (taskId) return { taskId, raw: data }
    throw new Error(`Agnes video: formato risposta inatteso — ${JSON.stringify(data).slice(0, 200)}`)
  } finally {
    clearTimeout(timer)
  }
}
