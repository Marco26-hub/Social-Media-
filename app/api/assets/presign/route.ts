import path from 'path'
import { NextResponse } from 'next/server'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'
import { isStorageConfigured, presignPutUrl, publicUrlForKey } from '@/lib/storage'
import { safeFilename } from '@/lib/asset-name'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Stesse regole della upload multipart (app/api/assets/upload). La validazione qui
// è sulla size DICHIARATA dal client (il byte-stream non passa da noi): è una
// guardia UX, non una barriera di sicurezza — l'utente è admin/cliente che carica
// media propri sul proprio bucket.
const MAX_FILES = 14
const MAX_IMAGE_FILE_SIZE = 8 * 1024 * 1024
const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const ALLOWED_VIDEO_MIME = new Set(['video/mp4'])

function mediaKind(mime: string): 'video' | 'image' | null {
  if (ALLOWED_VIDEO_MIME.has(mime)) return 'video'
  if (ALLOWED_IMAGE_MIME.has(mime)) return 'image'
  return null
}

type InFile = { name?: unknown; mime?: unknown; size?: unknown }
type OutItem =
  | { name: string; ok: true; uploadUrl: string; url: string; path: string; key: string; mime: string; kind: 'video' | 'image' }
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
      if (kind === 'video' && path.extname(name).toLowerCase() !== '.mp4') {
        items.push({ name, ok: false, motivo: 'video: supportato solo .mp4' })
        continue
      }
      const maxSize = kind === 'video' ? MAX_VIDEO_FILE_SIZE : MAX_IMAGE_FILE_SIZE
      if (size > maxSize) {
        items.push({ name, ok: false, motivo: `supera ${Math.round(maxSize / 1024 / 1024)}MB` })
        continue
      }

      const filename = safeFilename(name)
      const key = `uploads/${clienteId}/${filename}`
      const uploadUrl = await presignPutUrl(key)
      // Bucket pubblico → URL diretto; privato → proxy same-origin /api/assets/file.
      const url = publicUrlForKey(key) || `/api/assets/file/${encodeURIComponent(clienteId)}/${encodeURIComponent(filename)}`
      items.push({ name, ok: true, uploadUrl, url, path: url, key, mime, kind })
    }

    return NextResponse.json({ ok: true, storage: 'storage', items })
  } catch (e) {
    return apiError(e)
  }
}
