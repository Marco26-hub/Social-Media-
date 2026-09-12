import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { creaCorso, listCorsiAdmin } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

// Amministrazione del catalogo. requireAdmin lancia, e apiError traduce: il
// middleware protegge gia /dashboard, ma una route non deve fidarsi di chi la
// chiama — si arriva qui anche senza passare da una pagina.

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json(await listCorsiAdmin())
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const corpo = await request.json() as Record<string, unknown>
    const id = await creaCorso(corpo)
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    // Slug gia in uso: e l'errore che si fa davvero, e merita un messaggio suo
    // invece del 500 generico.
    if (e instanceof Error && /duplicate key|unique/i.test(e.message)) {
      return NextResponse.json({ error: 'Esiste già un corso con questo slug.' }, { status: 409 })
    }
    if (e instanceof Error && /Servono slug/.test(e.message)) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    return apiError(e)
  }
}
