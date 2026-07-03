import { readFile, stat } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { isStorageConfigured, hasPublicStorageUrl, downloadFromStorage } from '@/lib/storage'

export const runtime = 'nodejs'

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
}

function safeSegment(value: string) {
  return /^[a-zA-Z0-9._-]+$/.test(value) ? value : ''
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clienteId: string; filename: string }> },
) {
  const { clienteId, filename } = await params
  const safeClienteId = safeSegment(clienteId)
  const safeFilename = safeSegment(filename)
  if (!safeClienteId || !safeFilename) {
    return NextResponse.json({ error: 'asset non valido' }, { status: 400 })
  }

  const ext = path.extname(safeFilename).toLowerCase()

  // Bucket PRIVATO (storage configurato senza URL pubblico): scarica da S3 e streama.
  // Se il bucket è pubblico gli URL puntano già al provider e questo proxy non è usato.
  if (isStorageConfigured() && !hasPublicStorageUrl()) {
    const key = `uploads/${safeClienteId}/${safeFilename}`
    const obj = await downloadFromStorage(key)
    if (obj) {
      return new NextResponse(obj.bytes as unknown as BodyInit, {
        headers: {
          'Content-Type': MIME_BY_EXT[ext] || obj.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }
    return NextResponse.json({ error: 'asset non trovato' }, { status: 404 })
  }

  // Disco locale (dev).
  const filePath = path.join(process.cwd(), 'public', 'uploads', safeClienteId, safeFilename)
  try {
    const info = await stat(filePath)
    if (!info.isFile()) return NextResponse.json({ error: 'asset non trovato' }, { status: 404 })
    const bytes = await readFile(filePath)
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': MIME_BY_EXT[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'asset non trovato' }, { status: 404 })
  }
}
