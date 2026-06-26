import { readFile, stat } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

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

  const filePath = path.join(process.cwd(), 'public', 'uploads', safeClienteId, safeFilename)
  try {
    const info = await stat(filePath)
    if (!info.isFile()) return NextResponse.json({ error: 'asset non trovato' }, { status: 404 })
    const bytes = await readFile(filePath)
    const ext = path.extname(safeFilename).toLowerCase()
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
