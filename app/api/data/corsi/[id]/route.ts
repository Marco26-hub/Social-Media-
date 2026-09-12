import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { aggiornaCorso, eliminaCorso, getCorsoAdmin } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const corso = await getCorsoAdmin(id)
    if (!corso) return NextResponse.json({ error: 'Corso non trovato' }, { status: 404 })
    return NextResponse.json(corso)
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const corpo = await request.json() as Record<string, unknown>
    await aggiornaCorso(id, corpo)
    // Pubblicare, togliere dal catalogo o cambiare il prezzo deve vedersi
    // subito: il catalogo altrimenti resta fermo fino a cinque minuti.
    revalidatePath('/corsi')
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && /duplicate key|unique/i.test(e.message)) {
      return NextResponse.json({ error: 'Esiste già un corso con questo slug.' }, { status: 409 })
    }
    return apiError(e)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const esito = await eliminaCorso(id)
    if (!esito.eliminato) return NextResponse.json({ error: esito.motivo }, { status: 409 })
    revalidatePath('/corsi')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
