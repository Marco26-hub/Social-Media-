import { AwsClient } from 'aws4fetch'

// Storage immagini PERSISTENTE via qualsiasi provider S3-compatible (Cloudflare R2,
// Backblaze B2, MinIO, ecc.). Senza queste env il sistema usa il disco locale
// (effimero, solo dev — sparisce a ogni deploy/restart su Render).
//
// DUE MODALITÀ, decise dalla presenza di STORAGE_PUBLIC_URL:
//  - Bucket PUBBLICO  → STORAGE_PUBLIC_URL impostato → l'upload ritorna l'URL diretto
//    del bucket (il browser scarica dal provider, zero banda sul nostro server).
//  - Bucket PRIVATO   → STORAGE_PUBLIC_URL NON impostato → l'upload ritorna un URL al
//    nostro proxy (/api/assets/file/...), che legge il file da S3 con le credenziali e
//    lo streama. Serve per i provider dove il bucket pubblico richiede carta (es. B2).
//
// Env richieste su Render:
//   STORAGE_ENDPOINT           — endpoint S3, es. B2: https://s3.<region>.backblazeb2.com
//   STORAGE_ACCESS_KEY_ID      — access key (R2 token id / B2 applicationKeyId)
//   STORAGE_SECRET_ACCESS_KEY  — secret key (R2 token secret / B2 applicationKey)
//   STORAGE_BUCKET             — nome bucket
//   STORAGE_REGION             — region esatta (B2: es. us-west-004; R2: 'auto')
//   STORAGE_PUBLIC_URL         — OPZIONALE: URL pubblico bucket. Se assente → proxy privato.
const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT?.trim().replace(/\/$/, '')
const STORAGE_ACCESS_KEY_ID = process.env.STORAGE_ACCESS_KEY_ID?.trim()
const STORAGE_SECRET_ACCESS_KEY = process.env.STORAGE_SECRET_ACCESS_KEY?.trim()
const STORAGE_BUCKET = process.env.STORAGE_BUCKET?.trim()
const STORAGE_PUBLIC_URL = process.env.STORAGE_PUBLIC_URL?.trim().replace(/\/$/, '')
const STORAGE_REGION = process.env.STORAGE_REGION?.trim() || 'auto'

// Configurato = abbiamo il minimo per upload/download (endpoint+credenziali+bucket).
// L'URL pubblico è opzionale (decide solo public-direct vs proxy-privato).
export function isStorageConfigured(): boolean {
  return Boolean(STORAGE_ENDPOINT && STORAGE_ACCESS_KEY_ID && STORAGE_SECRET_ACCESS_KEY && STORAGE_BUCKET)
}

// Alias storico (health/upload lo importano ancora con questo nome).
export const isR2Configured = isStorageConfigured

// true = bucket pubblico con URL diretto; false = bucket privato via proxy app.
export function hasPublicStorageUrl(): boolean {
  return Boolean(STORAGE_PUBLIC_URL)
}

function storageClient(): AwsClient {
  return new AwsClient({
    accessKeyId: STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: STORAGE_SECRET_ACCESS_KEY!,
    region: STORAGE_REGION,
    service: 's3',
  })
}

/**
 * Carica i byte sul bucket. Ritorna l'URL pubblico diretto se il bucket è pubblico
 * (STORAGE_PUBLIC_URL impostato), altrimenti null (il chiamante userà il proxy).
 * Lancia se lo storage non è configurato o l'upload fallisce.
 */
export async function uploadToStorage(
  key: string,
  bytes: Buffer | Uint8Array,
  contentType: string,
): Promise<string | null> {
  if (!isStorageConfigured()) throw new Error('Storage immagini non configurato')

  const endpoint = `${STORAGE_ENDPOINT}/${STORAGE_BUCKET}/${key}`
  const res = await storageClient().fetch(endpoint, {
    method: 'PUT',
    // Uint8Array è un BodyInit valido a runtime (undici); cast per i tipi DOM.
    body: new Uint8Array(bytes) as unknown as BodyInit,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      // Backblaze B2 lo richiede esplicito (rifiuta con 411 MissingContentLength
      // senza) — R2 lo calcola da solo, ma impostarlo sempre è innocuo e più corretto.
      'Content-Length': String(bytes.length),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upload storage fallito: ${res.status} ${text.slice(0, 200)}`)
  }

  return STORAGE_PUBLIC_URL ? `${STORAGE_PUBLIC_URL}/${key}` : null
}

/**
 * Genera un URL PRESIGNED per un PUT diretto dal browser sul bucket (SigV4 in
 * query string). Serve per aggirare il limite ~4.5MB del body delle serverless
 * function di Vercel: il file NON passa dal nostro server, il browser lo carica
 * dritto su S3/Storage. Firma solo host+metodo+path+query (Content-Type resta
 * header non firmato: il browser lo manda comunque e lo storage lo memorizza).
 * `expiresIn` in secondi (default 10 min).
 */
export async function presignPutUrl(key: string, expiresIn = 600): Promise<string> {
  if (!isStorageConfigured()) throw new Error('Storage non configurato')
  const url = new URL(`${STORAGE_ENDPOINT}/${STORAGE_BUCKET}/${key}`)
  url.searchParams.set('X-Amz-Expires', String(expiresIn))
  const signed = await storageClient().sign(url.toString(), { method: 'PUT', aws: { signQuery: true } })
  return signed.url
}

/**
 * URL pubblico diretto di una key se il bucket è pubblico (STORAGE_PUBLIC_URL),
 * altrimenti null (il chiamante userà il proxy /api/assets/file).
 */
export function publicUrlForKey(key: string): string | null {
  return STORAGE_PUBLIC_URL ? `${STORAGE_PUBLIC_URL}/${key}` : null
}

/**
 * Scarica un oggetto dal bucket privato (per il proxy /api/assets/file).
 * Ritorna byte + content-type, o null se non trovato/errore.
 */
export async function downloadFromStorage(
  key: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!isStorageConfigured()) return null
  try {
    const endpoint = `${STORAGE_ENDPOINT}/${STORAGE_BUCKET}/${key}`
    const res = await storageClient().fetch(endpoint, { method: 'GET' })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const bytes = Buffer.from(await res.arrayBuffer())
    return { bytes, contentType }
  } catch {
    return null
  }
}
