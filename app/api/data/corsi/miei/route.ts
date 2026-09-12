import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAuth } from '@/lib/auth-utils'
import { listCorsiUtente } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

// I corsi di chi chiede, e di nessun altro: l'id viene dalla sessione e non e
// accettato come parametro.
export async function GET() {
  try {
    const utente = await requireAuth()
    const corsi = await listCorsiUtente(utente.id)
    return NextResponse.json({
      corsi: corsi.map(c => ({
        slug: c.slug,
        titolo: c.titolo,
        modalita: c.modalita,
        lezioni_totali: c.lezioni_totali,
        lezioni_completate: c.lezioni_completate,
      })),
    })
  } catch (e) {
    return apiError(e)
  }
}
