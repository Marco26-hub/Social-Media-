import path from 'path'
import { NextResponse } from 'next/server'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'
import { isStorageConfigured, listFromStorage, presignPutUrl, publicUrlForKey } from '@/lib/storage'
import { safeFilename } from '@/lib/asset-name'
import { bytesToMb, storageQuotaBytes, storageQuotaMb } from '@/lib/storage-quota'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Stesse regole della upload multipart (app/api/assets/upload). La validazione qui
// è sulla size DICHIARATA dal client (il byte-stream non passa da noi): è una
// guardia UX, non una barriera di sicurezza — l'utente è admin/cliente che carica
// media propri sul proprio bucket.
const MAX_FILES = 14
const MAX_IMAGE_FILE_SIZE = 8 * 1024 * 1024
const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024
const MAX_AUDIO_FILE_SIZE = 25 * 1024 * 1024
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const ALLOWED_VIDEO_MIME = new Set(['video/mp4'])
const ALLOWED_AUDIO_MIME = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg'])

function mediaKind(mime: string): 'video' | 'image' | 'audio' | null {
  if (ALLOWED_VIDEO_MIME.has(mime)) return 'video'
  if (ALLOWED_IMAGE_MIME.has(mime)) return 'image'
  if (ALLOWED_AUDIO_MIME.has(mime)) return 'audio'
  return null
}

// SICUREZZA — l'estensione finisce nella key e quindi nell'URL servito da
// /api/assets/file, che sceglie il Content-Type in base ad essa. Un'estensione
// fuori da questa mappa (.html, .svg, .xhtml) diventerebbe contenuto attivo
// servito dalla nostra origine. La mappa è allineata a MIME_BY_EXT del proxy:
// tenerle in sync.
const ALLOWED_EXT_BY_KIND: Record<'image' | 'video' | 'audio', Set<string>> = {
  image: new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']),
  video: new Set(['.mp4']),
  audio: new Set(['.mp3', '.wav', '.m4a', '.ogg']),
}

type InFile = { name?: unknown; mime?: unknown; size?: unknown }
type OutItem =
  | { name: string; ok: true; uploadUrl: string; url: string; path: string; key: string; mime: string; kind: 'video' | 'image' | 'audio' }
  | { name: string; ok: false; motivo: string }

// Restituisce presigned PUT URL per ogni file valido. Il browser carica poi
// direttamente su Storage (vedi lib/asset-upload.ts). Se lo storage NON è
// configurato (dev locale senza S3) → { fallback: true }: il client ripiega
// sull'upload multipart classico che scrive su disco.
export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json().catch(() => ({}))
    const clienteId = String(body?.cliente_id || '')
    if (!clienteId) return NextResponse.json({ error: 'cliente_id richiesto' }, { status: 400 })
    await requireClienteAccess(clienteId)

    if (!isStorageConfigured()) {
      return NextResponse.json({ fallback: true, reason: 'Storage non configurato: usa upload classico.' })
    }

    const files: InFile[] = Array.isArray(body?.files) ? body.files : []
    if (!files.length) return NextResponse.json({ error: 'Nessun file' }, { status: 400 })
    if (files.length > MAX_FILES) return NextResponse.json({ error: `Massimo ${MAX_FILES} media per contenuto` }, { status: 400 })

    const storageObjects = await listFromStorage(`uploads/${clienteId}/`)
    let projectedBytes = storageObjects.reduce((total, object) => total + (object.size || 0), 0)
    const quotaBytes = storageQuotaBytes()
    const items: OutItem[] = []
    for (const f of files) {
      const name = String(f?.name || 'asset')
      const mime = String(f?.mime || '')
      const size = Number(f?.size || 0)
      const kind = mediaKind(mime)
      if (!kind) {
        const isHeic = /heic|heif/i.test(`${mime} ${name}`)
        items.push({ name, ok: false, motivo: isHeic ? 'formato HEIC iPhone non supportato — converti in JPG' : `formato non supportato (${mime || 'sconosciuto'})` })
        continue
      }
      // L'estensione va validata per OGNI kind, immagini incluse: è lei a
      // determinare il Content-Type con cui il proxy servirà il file.
      const ext = path.extname(name).toLowerCase()
      if (!ALLOWED_EXT_BY_KIND[kind].has(ext)) {
        const attese = [...ALLOWED_EXT_BY_KIND[kind]].join(', ')
        items.push({ name, ok: false, motivo: `estensione ${ext || 'assente'} non ammessa per ${kind}: usa ${attese}` })
        continue
      }
      const maxSize = kind === 'video' ? MAX_VIDEO_FILE_SIZE : kind === 'audio' ? MAX_AUDIO_FILE_SIZE : MAX_IMAGE_FILE_SIZE
      if (size > maxSize) {
        items.push({ name, ok: false, motivo: `supera ${Math.round(maxSize / 1024 / 1024)}MB` })
        continue
      }
      if (projectedBytes + size > quotaBytes) {
        items.push({
          name,
          ok: false,
          motivo: `supera la capienza storage del cliente (${bytesToMb(projectedBytes)} MB di ${storageQuotaMb()} MB già occupati)`,
        })
        continue
      }

      const filename = safeFilename(name)
      const key = `uploads/${clienteId}/${filename}`
      // Il Content-Type entra nella firma: il browser DEVE mandare esattamente
      // questo `mime` nel PUT, altrimenti lo storage rifiuta.
      const uploadUrl = await presignPutUrl(key, mime)
      // Bucket pubblico → URL diretto; privato → proxy same-origin /api/assets/file.
      const url = publicUrlForKey(key) || `/api/assets/file/${encodeURIComponent(clienteId)}/${encodeURIComponent(filename)}`
      items.push({ name, ok: true, uploadUrl, url, path: url, key, mime, kind })
      projectedBytes += size
    }

    return NextResponse.json({
      ok: true,
      storage: 'storage',
      items,
      storage_bytes: projectedBytes,
      storage_mb: bytesToMb(projectedBytes),
      storage_limit_mb: storageQuotaMb(),
    })
  } catch (e) {
    return apiError(e)
  }
}
