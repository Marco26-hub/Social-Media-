import { randomUUID, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

// State anti-CSRF per il flow OAuth Meta.
//
// Prima lo `state` era `encodeURIComponent(clienteId)`: un valore stabile e
// indovinabile (il clienteId circola negli URL degli asset e lo conosce ogni
// co-tenant). Il callback è una GET, quindi con SameSite=Lax il cookie di
// sessione parte anche su navigazione cross-site: bastava indurre un admin a
// visitare /api/social/callback?code=<code_attaccante>&state=<clienteId_vittima>
// per collegare l'account Instagram dell'ATTACCANTE al workspace della vittima.
//
// Ora lo `state` è un nonce casuale monouso. Il clienteId non viaggia più
// nell'URL: sta nel cookie httpOnly, che solo il nostro server scrive.

export const OAUTH_STATE_COOKIE = 'meta_oauth_state'
const MAX_AGE_SECONDS = 600

function equals(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Genera il nonce, lo persiste insieme al clienteId in un cookie httpOnly e
 * restituisce il valore da mettere nel parametro `state`.
 */
export async function issueOAuthState(clienteId: string): Promise<string> {
  const nonce = randomUUID().replace(/-/g, '')
  const store = await cookies()
  store.set(OAUTH_STATE_COOKIE, `${nonce}:${clienteId}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/social',
    maxAge: MAX_AGE_SECONDS,
  })
  return nonce
}

/**
 * Verifica lo `state` ricevuto dal callback contro il cookie e restituisce il
 * clienteId che avevamo registrato all'avvio del flow. Il cookie viene sempre
 * consumato: il nonce è monouso anche in caso di errore.
 */
export async function consumeOAuthState(state: string): Promise<string> {
  const store = await cookies()
  const raw = store.get(OAUTH_STATE_COOKIE)?.value || ''
  store.delete(OAUTH_STATE_COOKIE)

  const separator = raw.indexOf(':')
  if (separator <= 0) throw new Error('Sessione di collegamento scaduta: riavvia il collegamento dal pannello.')

  const expectedNonce = raw.slice(0, separator)
  const clienteId = raw.slice(separator + 1)
  if (!clienteId || !equals(expectedNonce, state)) {
    throw new Error('Richiesta di collegamento non valida: riavvia il collegamento dal pannello.')
  }
  return clienteId
}
