import { NextResponse } from 'next/server'
import { addDownload, isDownloadPathname, listDownloads, removeDownload, replaceDownload, updateDownload } from '@/lib/downloads'
import { requireAdmin } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Operazione non riuscita'
  const status = /non autenticato|riservata ad admin/i.test(message) ? 401 : 400
  return NextResponse.json({ error: message }, { status })
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} obbligatorio`)
  return value.trim()
}

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json({ items: await listDownloads(true) })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const blob = body?.blob
    if (!blob || typeof blob !== 'object') throw new Error('File caricato non valido')
    const size = Number(body.size)
    if (!Number.isFinite(size) || size < 0) throw new Error('Dimensione file non valida')

    const pathname = requiredString(blob.pathname, 'Percorso file')
    if (!isDownloadPathname(pathname)) throw new Error('Percorso file non consentito')
    const item = await addDownload({
      title: requiredString(body.title, 'Titolo'),
      description: typeof body.description === 'string' ? body.description : '',
      originalName: requiredString(body.originalName, 'Nome file'),
      blob: {
        pathname,
        url: requiredString(blob.url, 'URL file'),
        downloadUrl: requiredString(blob.downloadUrl, 'URL download'),
        contentType: requiredString(blob.contentType, 'Tipo file'),
      },
      size,
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const id = requiredString(body.id, 'ID')
    const action = requiredString(body.action, 'Azione')

    if (action === 'metadata') {
      const item = await updateDownload(id, {
        title: requiredString(body.title, 'Titolo'),
        description: typeof body.description === 'string' ? body.description : '',
        isPublished: Boolean(body.isPublished),
      })
      return NextResponse.json({ item })
    }

    if (action === 'replace') {
      const blob = body?.blob
      if (!blob || typeof blob !== 'object') throw new Error('File sostitutivo non valido')
      const size = Number(body.size)
      if (!Number.isFinite(size) || size < 0) throw new Error('Dimensione file non valida')
      const pathname = requiredString(blob.pathname, 'Percorso file')
      if (!isDownloadPathname(pathname)) throw new Error('Percorso file non consentito')
      const item = await replaceDownload(id, {
        originalName: requiredString(body.originalName, 'Nome file'),
        blob: {
          pathname,
          url: requiredString(blob.url, 'URL file'),
          downloadUrl: requiredString(blob.downloadUrl, 'URL download'),
          contentType: requiredString(blob.contentType, 'Tipo file'),
        },
        size,
      })
      return NextResponse.json({ item })
    }

    throw new Error('Azione non supportata')
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const { id } = await request.json()
    await removeDownload(requiredString(id, 'ID'))
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
