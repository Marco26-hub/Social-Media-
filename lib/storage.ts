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
 * dritto su S3/Storage.
 *
 * SICUREZZA — `contentType` entra negli SignedHeaders: lo storage rifiuta il PUT
 * se il browser manda un Content-Type diverso da quello che abbiamo autorizzato.
 * Senza questo vincolo il client poteva dichiarare `image/png` al presign e poi
 * caricare `text/html`, ottenendo HTML servito dalla nostra origine (stored XSS).
 * `expiresIn` in secondi (default 10 min).
 */
export async function presignPutUrl(key: string, contentType: string, expiresIn = 600): Promise<string> {
  if (!isStorageConfigured()) throw new Error('Storage non configurato')
  if (!contentType) throw new Error('Content-Type richiesto per il presign')
  const url = new URL(`${STORAGE_ENDPOINT}/${STORAGE_BUCKET}/${key}`)
  url.searchParams.set('X-Amz-Expires', String(expiresIn))
  const signed = await storageClient().sign(url.toString(), {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    aws: { signQuery: true, allHeaders: true },
  })
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
/**
 * GET con header Range inoltrato allo storage: restituisce SOLO i byte chiesti.
 * Serve al proxy /api/assets/file, che prima scaricava l'oggetto intero e poi ne
 * affettava una porzione: su un MP4 da 60MB, i ~20 Range che fa un player (o
 * Blotato) significavano oltre 1GB scaricato e allocato in heap per un singolo
 * video. `status` è 206 con contenuto parziale, 416 se il range non è valido.
 */
export async function downloadRangeFromStorage(
  key: string,
  range: string,
): Promise<{ bytes: Buffer; contentType: string; contentRange: string | null; status: number } | null> {
  if (!isStorageConfigured()) return null
  try {
    const endpoint = `${STORAGE_ENDPOINT}/${STORAGE_BUCKET}/${key}`
    const res = await storageClient().fetch(endpoint, { method: 'GET', headers: { Range: range } })
    if (res.status === 416) {
      return { bytes: Buffer.alloc(0), contentType: '', contentRange: res.headers.get('content-range'), status: 416 }
    }
    if (!res.ok) return null
    return {
      bytes: Buffer.from(await res.arrayBuffer()),
      contentType: res.headers.get('content-type') || 'application/octet-stream',
      contentRange: res.headers.get('content-range'),
      status: res.status,
    }
  } catch {
    return null
  }
}

/**
 * Elimina un oggetto dallo storage. Usata dalla retention dei contenuti
 * pubblicati: i media sono la parte che occupa davvero spazio.
 * Ritorna true se lo storage ha confermato la rimozione.
 */
/**
 * Elenca gli oggetti sotto un prefisso, con paginazione. Serve a ritrovare i
 * media gia caricati per un cliente: la pagina Piano li teneva solo nello stato
 * React, quindi cambiando schermata sparivano e bisognava ricaricare la cartella
 * — duplicando ogni volta centinaia di MB nello storage.
 */
export async function listFromStorage(prefix: string): Promise<{ key: string; size: number; updatedAt: string }[]> {
  if (!isStorageConfigured()) return []
  const out: { key: string; size: number; updatedAt: string }[] = []
  let token = ''
  // Tetto difensivo: 20 pagine da 1000 = 20k oggetti, ben oltre il caso reale.
  for (let pagina = 0; pagina < 20; pagina++) {
    const url = new URL(`${STORAGE_ENDPOINT}/${STORAGE_BUCKET}`)
    url.searchParams.set('list-type', '2')
    url.searchParams.set('prefix', prefix)
    url.searchParams.set('max-keys', '1000')
    if (token) url.searchParams.set('continuation-token', token)

    const res = await storageClient().fetch(url.toString(), { method: 'GET' })
    if (!res.ok) break
    const xml = await res.text()

    for (const blocco of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const key = (blocco[1].match(/<Key>([\s\S]*?)<\/Key>/) || [])[1]
      if (!key) continue
      out.push({
        key,
        size: Number((blocco[1].match(/<Size>(\d+)<\/Size>/) || [])[1] || 0),
        updatedAt: (blocco[1].match(/<LastModified>([\s\S]*?)<\/LastModified>/) || [])[1] || '',
      })
    }

    const troncato = /<IsTruncated>true<\/IsTruncated>/.test(xml)
    token = (xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/) || [])[1] || ''
    if (!troncato || !token) break
  }
  return out
}

export async function deleteFromStorage(key: string): Promise<boolean> {
  if (!isStorageConfigured()) return false
  try {
    const endpoint = `${STORAGE_ENDPOINT}/${STORAGE_BUCKET}/${key}`
    const res = await storageClient().fetch(endpoint, { method: 'DELETE' })
    // S3 risponde 204 anche se la chiave non esisteva: va bene, l'esito voluto e
    // "non c'e piu".
    return res.ok || res.status === 404
  } catch {
    return false
  }
}

/**
 * Dalla URL di un media risale alla chiave nello storage.
 * Copre le due forme che il progetto produce: URL pubblica diretta
 * (STORAGE_PUBLIC_URL/uploads/...) e proxy same-origin
 * /api/assets/file/<clienteId>/<filename>. Null se non e un nostro media.
 */
export function storageKeyFromUrl(url: string): string | null {
  const clean = String(url || '').trim()
  if (!clean) return null

  const viaProxy = clean.match(/\/api\/assets\/file\/([^/?#]+)\/([^/?#]+)/)
  if (viaProxy) {
    return `uploads/${decodeURIComponent(viaProxy[1])}/${decodeURIComponent(viaProxy[2])}`
  }

  const indice = clean.indexOf('/uploads/')
  if (indice >= 0) {
    return clean.slice(indice + 1).split('?')[0]
  }

  return null
}

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
