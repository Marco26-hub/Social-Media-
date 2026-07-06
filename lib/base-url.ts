// Deriva la base URL pubblica per i link generati (approvazione, asset, OAuth
// redirect_uri).
//
// PRIORITÀ ALL'HOST REALE della richiesta (x-forwarded-host che Render imposta):
// è SEMPRE il dominio con cui il client ha raggiunto l'app, quindi gli asset/link
// FUNZIONANO anche se NEXTAUTH_URL/NEXT_PUBLIC_SITE_URL sono configurati su un
// dominio sbagliato/morto (caso reale: social-automation.onrender.com → 404 →
// le immagini non venivano scaricate dall'AI). L'header è VALIDATO (solo
// hostname[:porta]); dietro il proxy Render non è manipolabile dal client, quindi
// il rischio host-injection è trascurabile. Env solo come fallback.

function sanitize(url: string | undefined | null): string | null {
  if (!url) return null
  const trimmed = url.trim().replace(/\/$/, '')
  if (!/^https?:\/\//.test(trimmed)) return null
  return trimmed
}

export function getPublicBaseUrl(request: Request): string {
  // 1. Host reale dietro proxy (validato) — è il dominio che funziona davvero.
  const fwdHost = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const fwdProto = request.headers.get('x-forwarded-proto') || 'https'
  if (fwdHost && /^[a-zA-Z0-9.-]+(:\d+)?$/.test(fwdHost)) {
    return `${fwdProto}://${fwdHost}`
  }

  // 2. Env esplicita (fallback per contesti senza request host valido)
  const fromEnv = sanitize(process.env.NEXT_PUBLIC_SITE_URL) || sanitize(process.env.NEXTAUTH_URL)
  if (fromEnv) return fromEnv

  // 3. Origin della request URL
  try {
    return new URL(request.url).origin
  } catch {
    return 'http://localhost:3000'
  }
}
