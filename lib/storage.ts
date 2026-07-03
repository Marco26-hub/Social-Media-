import { AwsClient } from 'aws4fetch'

// Storage immagini PERSISTENTE via qualsiasi provider S3-compatible (Cloudflare R2,
// Backblaze B2, MinIO, ecc.). Senza queste env il sistema usa il disco locale
// (effimero, solo dev — sparisce a ogni deploy/restart su Render).
// Env richieste su Render:
//   STORAGE_ENDPOINT           — endpoint S3 del provider, es:
//                                R2:  https://<account_id>.r2.cloudflarestorage.com
//                                B2:  https://s3.<region>.backblazeb2.com
//   STORAGE_ACCESS_KEY_ID      — access key (R2 token id / B2 applicationKeyId)
//   STORAGE_SECRET_ACCESS_KEY  — secret key (R2 token secret / B2 applicationKey)
//   STORAGE_BUCKET             — nome bucket
//   STORAGE_PUBLIC_URL         — URL pubblico bucket (dominio custom o URL nativo provider)
//   STORAGE_REGION             — opzionale, default 'auto' (R2). B2 richiede la region esatta (es. us-west-004)
const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT?.trim().replace(/\/$/, '')
const STORAGE_ACCESS_KEY_ID = process.env.STORAGE_ACCESS_KEY_ID?.trim()
const STORAGE_SECRET_ACCESS_KEY = process.env.STORAGE_SECRET_ACCESS_KEY?.trim()
const STORAGE_BUCKET = process.env.STORAGE_BUCKET?.trim()
const STORAGE_PUBLIC_URL = process.env.STORAGE_PUBLIC_URL?.trim().replace(/\/$/, '')
const STORAGE_REGION = process.env.STORAGE_REGION?.trim() || 'auto'

export function isR2Configured(): boolean {
  return Boolean(
    STORAGE_ENDPOINT && STORAGE_ACCESS_KEY_ID && STORAGE_SECRET_ACCESS_KEY && STORAGE_BUCKET && STORAGE_PUBLIC_URL,
  )
}

/**
 * Carica i byte sul bucket S3-compatible configurato e ritorna l'URL pubblico permanente.
 * Lancia se lo storage non è configurato o l'upload fallisce.
 */
export async function uploadToR2(
  key: string,
  bytes: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  if (!isR2Configured()) throw new Error('Storage immagini non configurato')

  const client = new AwsClient({
    accessKeyId: STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: STORAGE_SECRET_ACCESS_KEY!,
    region: STORAGE_REGION,
    service: 's3',
  })

  const endpoint = `${STORAGE_ENDPOINT}/${STORAGE_BUCKET}/${key}`
  const res = await client.fetch(endpoint, {
    method: 'PUT',
    // Uint8Array è un BodyInit valido a runtime (undici); cast per i tipi DOM.
    body: new Uint8Array(bytes) as unknown as BodyInit,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upload storage fallito: ${res.status} ${text.slice(0, 200)}`)
  }

  return `${STORAGE_PUBLIC_URL}/${key}`
}
