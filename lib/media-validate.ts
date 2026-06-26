type MediaCheck = {
  url: string
  index: number
  reachable: boolean
  contentType: string | null
  error: string | null
}

export type MediaValidationResult = {
  ok: boolean
  checks: MediaCheck[]
  errors: { index: number; url: string; reason: string }[]
}

const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']

export async function validateMediaUrls(urls: (string | null | undefined)[], timeoutMs = 5000): Promise<MediaValidationResult> {
  const validUrls = urls
    .map((u, i) => ({ url: u, index: i + 1 }))
    .filter((e): e is { url: string; index: number } => typeof e.url === 'string' && e.url.trim().length > 0)

  if (validUrls.length === 0) return { ok: true, checks: [], errors: [] }

  const checks = await Promise.all(
    validUrls.map(async ({ url, index }): Promise<MediaCheck> => {
      try {
        const parsed = new URL(url)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return { url, index, reachable: false, contentType: null, error: `Protocollo non supportato: ${parsed.protocol}` }
        }
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
        clearTimeout(timer)

        if (!res.ok) {
          return { url, index, reachable: false, contentType: null, error: `HTTP ${res.status} ${res.statusText}` }
        }

        const ct = res.headers.get('content-type')
        if (ct && !ALLOWED_IMAGE.includes(ct) && !ALLOWED_VIDEO.includes(ct)) {
          return { url, index, reachable: true, contentType: ct, error: `Content-Type non supportato: ${ct}` }
        }

        return { url, index, reachable: true, contentType: ct, error: null }
      } catch (e) {
        const reason = e instanceof Error ? e.message : 'Errore sconosciuto'
        return { url, index, reachable: false, contentType: null, error: reason }
      }
    }),
  )

  const errors = checks.filter(c => !c.reachable || c.error).map(c => ({
    index: c.index,
    url: c.url,
    reason: c.error || 'Non raggiungibile',
  }))

  return { ok: errors.length === 0, checks, errors }
}

export function formatMediaError(errors: { index: number; url: string; reason: string }[]): string {
  return errors.map(e => `media KO code=${e.reason.includes('404') ? '404' : 'ERR'} — link_media_${e.index} non raggiungibile (${e.reason.slice(0, 80)})`).join('; ')
}
