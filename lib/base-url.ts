// Deriva la base URL pubblica dalla request reale (host che il client ha
// raggiunto), così i link generati (approvazione, asset) restano validi anche
// se NEXTAUTH_URL/NEXT_PUBLIC_SITE_URL su Render puntano a un dominio sbagliato.
// Fallback: env var, poi origin della request, poi localhost.

function sanitize(url: string | undefined | null): string | null {
  if (!url) return null
  const trimmed = url.trim().replace(/\/$/, '')
  if (!/^https?:\/\//.test(trimmed)) return null
  return trimmed
}

export function getPublicBaseUrl(request: Request): string {
  // 1. Host reale dietro proxy Render (x-forwarded-*)
  const fwdHost = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const fwdProto = request.headers.get('x-forwarded-proto') || 'https'
  if (fwdHost) {
    return `${fwdProto}://${fwdHost}`.replace(/\/$/, '')
  }

  // 2. Env esplicita (se valida)
  const fromEnv = sanitize(process.env.NEXT_PUBLIC_SITE_URL) || sanitize(process.env.NEXTAUTH_URL)
  if (fromEnv) return fromEnv

  // 3. Origin della request URL
  try {
    return new URL(request.url).origin
  } catch {
    return 'http://localhost:3000'
  }
}
