import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { validateReorder } from '@/lib/download-area'
import { listItems, reorderItems } from '@/lib/download-area-db'
import { requireDownloadAdmin } from '@/lib/download-area-guard'

export const dynamic = 'force-dynamic'

// Salva il nuovo ordine delle schede. Il client manda tutti gli id (nascoste
// incluse): se l'insieme non coincide con quello del DB, l'elenco è vecchio.
export async function POST(request: Request) {
  try {
    await requireDownloadAdmin()
    const body: unknown = await request.json()
    const ids = typeof body === 'object' && body !== null ? (body as { ids?: unknown }).ids : undefined
    if (!Array.isArray(ids)) return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })

    const current = await listItems({ includeHidden: true })
    const checked = validateReorder(ids, current.map(item => item.id))
    if (!checked.ok) {
      return NextResponse.json({ error: 'L’elenco è cambiato, ricarica la pagina.' }, { status: 409 })
    }

    await reorderItems(checked.ids)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
