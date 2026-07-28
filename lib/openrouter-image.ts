import { logTokenUsage } from '@/lib/token-usage'

// ─────────────────────────────────────────────────────────────────────────
// Generazione IMMAGINI via OpenRouter — endpoint dedicato /api/v1/images (stile
// OpenAI images). Supporta text→image e image→image (input_references = URL della
// foto prodotto, così l'immagine generata resta on-brand). Usa la stessa key
// OpenRouter del testo (BYO dal client o OPENROUTER_API_KEY server). I modelli
// immagine sono a pagamento: la key deve avere credito.
// ─────────────────────────────────────────────────────────────────────────

const OPENROUTER_IMAGES_URL = 'https://openrouter.ai/api/v1/images'

// Default: Gemini 2.5 Flash Image ("nano banana"), buon rapporto qualità/prezzo e
// supporta image-to-image. L'admin può scegliere altri modelli-immagine dalla lista.
export const DEFAULT_IMAGE_MODEL = 'google/gemini-2.5-flash-image'

function resolveKey(byo?: string): string {
  const k = (byo || '').trim()
  const valid = /^sk-or-v1-[A-Za-z0-9_-]{20,}$/.test(k) ? k : ''
  return (valid || process.env.OPENROUTER_API_KEY || '').trim()
}

export function openrouterImageConfigured(byo?: string): boolean {
  return Boolean(resolveKey(byo))
}

// Aspect ratio per formato social (Shorts/Reel verticali, Pin 2:3, resto quadrato).
export function aspectForFormato(formato: string): string {
  const f = (formato || '').toLowerCase()
  if (['reel', 'story', 'video', 'short', 'tiktok'].includes(f)) return '9:16'
  if (f === 'pin') return '2:3'
  return '1:1'
}

function shortErr(status: number, body: string): string {
  try {
    const j = JSON.parse(body) as { error?: { message?: string } | string }
    const reason = typeof j.error === 'string' ? j.error : (j.error?.message || '')
    if (reason) return `OpenRouter immagini ${status}: ${reason}`.slice(0, 260)
  } catch { /* non-JSON */ }
  return `OpenRouter immagini HTTP ${status}: ${body.slice(0, 200)}`
}

export type ImageGenOpts = {
  prompt: string
  model?: string
  openrouterKey?: string
  inputImageUrls?: string[] // image-to-image (foto prodotto, URL pubblici)
  aspectRatio?: string
  timeoutMs?: number
}

// Genera UNA immagine e ritorna i byte (il chiamante li re-hosta su Supabase).
export async function generateImageOpenRouter(opts: ImageGenOpts): Promise<{ bytes: Buffer; mime: string; model: string }> {
  const key = resolveKey(opts.openrouterKey)
  if (!key) throw new Error('Nessuna API key OpenRouter per la generazione immagini (serve credito).')
  const model = opts.model || DEFAULT_IMAGE_MODEL

  const body: Record<string, unknown> = { model, prompt: opts.prompt.slice(0, 4000), n: 1 }
  if (opts.aspectRatio) body.aspect_ratio = opts.aspectRatio
  const refs = (opts.inputImageUrls || []).filter(u => /^https?:\/\//.test(u)).slice(0, 4)
  if (refs.length) body.input_references = refs

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 120000)
  try {
    const res = await fetch(OPENROUTER_IMAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    })
    const text = await res.text().catch(() => '')
    if (!res.ok) throw new Error(shortErr(res.status, text))

    let data: { data?: Array<{ b64_json?: string; media_type?: string; url?: string }>; usage?: { completion_tokens?: number; total_tokens?: number } }
    try { data = JSON.parse(text) } catch { throw new Error('OpenRouter immagini: risposta non-JSON') }
    void logTokenUsage({ provider: 'openrouter', model, usage: data.usage })

    const first = data.data?.[0]
    if (first?.b64_json) {
      return { bytes: Buffer.from(first.b64_json, 'base64'), mime: first.media_type || 'image/png', model }
    }
    // Alcuni modelli possono restituire un URL invece del base64: scarichiamo i byte.
    if (first?.url) {
      const imgRes = await fetch(first.url)
      if (!imgRes.ok) throw new Error(`Download immagine OpenRouter fallito: HTTP ${imgRes.status}`)
      const mime = imgRes.headers.get('content-type') || 'image/png'
      const bytes = Buffer.from(await imgRes.arrayBuffer())
      if (!bytes.length) throw new Error('Immagine OpenRouter vuota')
      return { bytes, mime, model }
    }
    throw new Error('OpenRouter non ha restituito nessuna immagine')
  } finally {
    clearTimeout(timer)
  }
}
