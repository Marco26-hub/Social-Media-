import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { impostaAccessoAcquisto, listVenditeCorsi } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json(await listVenditeCorsi())
  } catch (e) {
    return apiError(e)
  }
}

// Chiude o riapre l'accesso a mano. Il webhook chiude da solo i rimborsi
// totali; questo copre quello che una macchina non puo decidere — un rimborso
// parziale che era un recesso, una contestazione della carta, un acquisto
// sbagliato — ed e anche il modo per rimediare a una chiusura non dovuta.
export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const { id, azione } = await request.json() as Record<string, unknown>
    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Acquisto non indicato' }, { status: 400 })
    }
    if (azione !== 'chiudi' && azione !== 'riapri') {
      return NextResponse.json({ error: 'Azione non valida' }, { status: 400 })
    }
    const fatto = await impostaAccessoAcquisto(id, azione === 'chiudi' ? 'refunded' : 'paid')
    if (!fatto) {
      // Un ordine mai pagato non ha un accesso da chiudere: rispondere ok
      // lascerebbe credere il contrario.
      return NextResponse.json({ error: 'Questo ordine non ha un accesso da modificare.' }, { status: 409 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
