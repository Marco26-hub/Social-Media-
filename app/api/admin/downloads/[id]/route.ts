import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { apiError } from '@/lib/api-error'
import { parseUpdateItemBody } from '@/lib/download-area'
import { deleteItem, updateItem } from '@/lib/download-area-db'
import { requireDownloadAdmin } from '@/lib/download-area-guard'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

// Le query del DB confrontano l'id come testo: un id in maiuscolo o malformato
// non troverebbe nulla. Si normalizza qui, e ciò che non è un UUID è "non trovato".
async function readItemId(params: Promise<{ id: string }>): Promise<string | null> {
  const id = (await params).id.toLowerCase()
  return UUID.test(id) ? id : null
}

function notFound() {
  return NextResponse.json({ error: 'Elemento non trovato' }, { status: 404 })
}

// Modifica titolo, descrizione o visibilità.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireDownloadAdmin()
    const id = await readItemId(params)
    if (!id) return notFound()

    const parsed = parseUpdateItemBody(await request.json())
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const item = await updateItem(id, parsed.value)
    if (!item) return notFound()
    return NextResponse.json({ item })
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireDownloadAdmin()
    const id = await readItemId(params)
    if (!id) return notFound()

    const item = await deleteItem(id)
    if (!item) return notFound()

    // Il file si cancella dal pathname salvato nel DB, mai da dati della richiesta.
    // Best-effort: un blob orfano costa poco, una scheda che punta a un file
    // inesistente rovina la pagina pubblica.
    if (item.kind === 'file' && item.blobPathname) {
      try {
        await del(item.blobPathname)
      } catch (e) {
        console.error('[download-area] eliminazione del blob non riuscita:', e instanceof Error ? e.message : e)
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
