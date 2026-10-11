import { NextResponse } from 'next/server'
import { BlobNotFoundError, head } from '@vercel/blob'
import { apiError } from '@/lib/api-error'
import { parseCreateItemBody, validateFileMeta } from '@/lib/download-area'
import { createItem, getActiveCode, isMissingDownloadSchema, listItems } from '@/lib/download-area-db'
import { requireDownloadAdmin } from '@/lib/download-area-guard'

export const dynamic = 'force-dynamic'

const BLOB_NOT_FOUND = 'File non trovato nello storage'

// Elenco completo (schede nascoste incluse) più il codice attivo, per il pannello admin.
export async function GET() {
  try {
    await requireDownloadAdmin()
    try {
      const [items, code] = await Promise.all([listItems({ includeHidden: true }), getActiveCode()])
      return NextResponse.json({ items, code, needs_migration: false })
    } catch (e) {
      // Migrazione 052 non ancora applicata: il pannello mostra l'avviso invece di un 500.
      if (isMissingDownloadSchema(e)) return NextResponse.json({ items: [], code: null, needs_migration: true })
      throw e
    }
  } catch (e) {
    return apiError(e)
  }
}

// Crea una scheda. Per un file il browser ha già caricato il blob (vedi /upload):
// qui si verifica che esista davvero e si salvano i dati letti dallo storage.
export async function POST(request: Request) {
  try {
    await requireDownloadAdmin()
    const parsed = parseCreateItemBody(await request.json())
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const { value } = parsed

    if (value.kind === 'link') {
      const item = await createItem({
        kind: 'link',
        title: value.title,
        description: value.description,
        url: value.url,
        downloadUrl: null,
        blobPathname: null,
        fileName: null,
        contentType: null,
        sizeBytes: null,
      })
      return NextResponse.json({ item }, { status: 201 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Storage dei file non configurato.' }, { status: 503 })
    }

    const { blob } = value
    let stored
    try {
      stored = await head(blob.url)
    } catch (e) {
      if (e instanceof BlobNotFoundError) return NextResponse.json({ error: BLOB_NOT_FOUND }, { status: 400 })
      throw e
    }
    // L'URL deve essere proprio il blob del pathname dichiarato (già verificato nel prefisso).
    if (stored.pathname !== blob.pathname) return NextResponse.json({ error: BLOB_NOT_FOUND }, { status: 400 })

    // Dimensione e indirizzi si prendono dallo storage, non dal client; il tipo
    // salvato resta quello canonico dell'estensione.
    const meta = validateFileMeta({ name: blob.fileName, size: stored.size, contentType: stored.contentType })
    if (!meta.ok) return NextResponse.json({ error: meta.error }, { status: 400 })

    const item = await createItem({
      kind: 'file',
      title: value.title,
      description: value.description,
      url: stored.url,
      downloadUrl: stored.downloadUrl,
      blobPathname: stored.pathname,
      fileName: blob.fileName,
      contentType: meta.contentType,
      sizeBytes: stored.size,
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
