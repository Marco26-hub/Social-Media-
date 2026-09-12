import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { aggiornaModulo, creaModulo, eliminaModulo } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

// Moduli di un corso. L'id sta nel corpo e non nell'indirizzo: sono operazioni
// che l'editor fa a raffica mentre si costruisce il programma, e una sola route
// con tre verbi si segue meglio di tre file quasi identici.

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { corso_id: corsoId, ...dati } = await request.json() as Record<string, unknown>
    if (typeof corsoId !== 'string' || !corsoId) {
      return NextResponse.json({ error: 'Corso non indicato' }, { status: 400 })
    }
    return NextResponse.json({ id: await creaModulo(corsoId, dati) }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const { id, ...dati } = await request.json() as Record<string, unknown>
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Modulo non indicato' }, { status: 400 })
    await aggiornaModulo(id, dati)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const { id } = await request.json() as Record<string, unknown>
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Modulo non indicato' }, { status: 400 })
    await eliminaModulo(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
