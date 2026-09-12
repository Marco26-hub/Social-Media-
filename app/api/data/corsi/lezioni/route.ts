import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { aggiornaLezione, creaLezione, eliminaLezione } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

// Lezioni. Stessa forma della route dei moduli: id nel corpo, tre verbi.

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { modulo_id: moduloId, ...dati } = await request.json() as Record<string, unknown>
    if (typeof moduloId !== 'string' || !moduloId) {
      return NextResponse.json({ error: 'Modulo non indicato' }, { status: 400 })
    }
    return NextResponse.json({ id: await creaLezione(moduloId, dati) }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const { id, ...dati } = await request.json() as Record<string, unknown>
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Lezione non indicata' }, { status: 400 })
    await aggiornaLezione(id, dati)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const { id } = await request.json() as Record<string, unknown>
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Lezione non indicata' }, { status: 400 })
    await eliminaLezione(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
