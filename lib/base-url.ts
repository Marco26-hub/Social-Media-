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

function hostOf(url: string | undefined | null): string {
  const clean = sanitize(url)
  if (!clean) return ''
  try {
    return new URL(clean).host.toLowerCase()
  } catch {
    return ''
  }
}

// Host accettabili in `x-forwarded-host`. Il commento sopra dice il vero SOLO
// finché davanti all'app c'è un proxy che riscrive gli header (Render, Vercel):
// basta interporre un CDN che li propaga perché un `x-forwarded-host: evil.com`
// finisca negli URL dei media SALVATI IN DB, riusati dallo scheduler giorni dopo.
// Allowlist: i domini configurati via env, i domini di preview delle piattaforme,
// localhost in sviluppo, più un eventuale elenco esplicito in ALLOWED_HOSTS.
function hostConsentito(host: string): boolean {
  const bare = host.toLowerCase().split(':')[0]
  if (!bare) return false

  const daEnv = [
    hostOf(process.env.NEXT_PUBLIC_SITE_URL),
    hostOf(process.env.NEXTAUTH_URL),
  ].filter(Boolean).map(h => h.split(':')[0])
  if (daEnv.includes(bare)) return true

  const extra = (process.env.ALLOWED_HOSTS || '')
    .split(',')
    .map(h => h.trim().toLowerCase().split(':')[0])
    .filter(Boolean)
  if (extra.includes(bare)) return true

  // Domini di preview/deploy delle piattaforme: sono sotto il nostro account e
  // sono il motivo per cui l'header ha priorità sulle env.
  if (/\.vercel\.app$/.test(bare) || /\.onrender\.com$/.test(bare)) return true

  if (process.env.NODE_ENV !== 'production' && (bare === 'localhost' || bare === '127.0.0.1')) return true

  return false
}

export function getPublicBaseUrl(request: Request): string {
  // 1. Host reale dietro proxy (validato + in allowlist) — il dominio che funziona
  //    davvero, senza però fidarsi di un header che il client può controllare.
  const fwdHost = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const fwdProto = request.headers.get('x-forwarded-proto') || 'https'
  if (fwdHost && /^[a-zA-Z0-9.-]+(:\d+)?$/.test(fwdHost) && hostConsentito(fwdHost)) {
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
