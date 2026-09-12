import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { aggiornaIncontro, creaIncontro, eliminaIncontro } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

// Incontri dei corsi live. Le date sono pubbliche e sono quello che il cliente
// ha comprato: spostarne una non e una modifica qualsiasi, va comunicata.

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { corso_id: corsoId, ...dati } = await request.json() as Record<string, unknown>
    if (typeof corsoId !== 'string' || !corsoId) {
      return NextResponse.json({ error: 'Corso non indicato' }, { status: 400 })
    }
    return NextResponse.json({ id: await creaIncontro(corsoId, dati) }, { status: 201 })
  } catch (e) {
    if (e instanceof Error && /Serve la data/.test(e.message)) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    return apiError(e)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const { id, ...dati } = await request.json() as Record<string, unknown>
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Incontro non indicato' }, { status: 400 })
    await aggiornaIncontro(id, dati)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const { id } = await request.json() as Record<string, unknown>
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Incontro non indicato' }, { status: 400 })
    await eliminaIncontro(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
