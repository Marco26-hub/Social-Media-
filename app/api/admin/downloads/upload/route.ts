import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { isDownloadPathname, isDownloadStorageConfigured } from '@/lib/downloads'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!isDownloadStorageConfigured()) {
      return NextResponse.json(
        { error: 'Lo storage download non è momentaneamente disponibile. Riprova tra poco.' },
        { status: 503 },
      )
    }
    const body = await request.json() as HandleUploadBody
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        await requireAdmin()
        if (!isDownloadPathname(pathname)) throw new Error('Percorso upload non consentito')
        return {
          addRandomSuffix: false,
          maximumSizeInBytes: 250 * 1024 * 1024,
          tokenPayload: JSON.stringify({ purpose: 'swa-download' }),
        }
      },
      onUploadCompleted: async () => {
        // Il browser registra il file nel catalogo solo dopo l'upload riuscito.
      },
    })
    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload non riuscito'
    return NextResponse.json({ error: message }, { status: /non autenticato|riservata ad admin/i.test(message) ? 401 : 400 })
  }
}
