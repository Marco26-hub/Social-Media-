import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { apiError } from '@/lib/api-error'
import { ALLOWED_FILE_TYPES, isDownloadBlobPathname, MAX_FILE_BYTES } from '@/lib/download-area'
import { requireDownloadAdmin } from '@/lib/download-area-guard'

export const dynamic = 'force-dynamic'

class InvalidUploadPathError extends Error {}

// Rilascia al browser il token per caricare un file direttamente su Blob (niente
// limite di 4,5 MB delle funzioni). Il token vale solo per un pathname sotto
// `swa-download/files/`, per i tipi ammessi e fino a MAX_FILE_BYTES.
//
// Niente `onUploadCompleted` né `callbackUrl`: il webhook di Vercel arriverebbe
// senza sessione e il middleware lo bloccherebbe. La scheda la crea il POST del
// client su /api/admin/downloads dopo il caricamento.
export async function POST(request: Request) {
  try {
    // Prima di tutto la sessione: un chiamante non autorizzato non deve sapere nulla
    // dello storage (503) né del corpo della richiesta (400). Il controllo resta anche
    // in onBeforeGenerateToken, dove è l'ultimo prima di rilasciare il token.
    await requireDownloadAdmin()
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Storage dei file non configurato.' }, { status: 503 })
    }
    const body: unknown = await request.json()
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
    }

    const result = await handleUpload({
      request,
      body: body as HandleUploadBody,
      onBeforeGenerateToken: async pathname => {
        await requireDownloadAdmin()
        if (!isDownloadBlobPathname(pathname)) throw new InvalidUploadPathError()
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_FILE_BYTES,
          allowedContentTypes: Object.values(ALLOWED_FILE_TYPES),
        }
      },
    })
    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof InvalidUploadPathError) {
      return NextResponse.json({ error: 'Percorso del file non valido.' }, { status: 400 })
    }
    return apiError(e)
  }
}
