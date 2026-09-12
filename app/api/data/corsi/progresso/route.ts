import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAuth } from '@/lib/auth-utils'
import { setProgresso } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

// Segna una lezione come vista, o toglie il segno.
//
// Non c'e nessun controllo di accesso qui dentro: sta tutto in setProgresso, che
// scrive solo se esiste un acquisto pagato per il corso di quella lezione. Un
// id di lezione indovinato non produce nulla.

export async function POST(request: Request) {
  try {
    const utente = await requireAuth()
    const body = await request.json() as Record<string, unknown>
    const lezioneId = typeof body.lezione_id === 'string' ? body.lezione_id.trim() : ''
    const completata = body.completata === true

    if (!lezioneId) {
      return NextResponse.json({ error: 'Lezione non indicata' }, { status: 400 })
    }

    const fatto = await setProgresso(utente.id, lezioneId, completata)
    if (!fatto) {
      // Stessa risposta per "lezione inesistente" e "corso non tuo": chi prova
      // non deve poter distinguere i due casi.
      return NextResponse.json({ error: 'Lezione non disponibile' }, { status: 403 })
    }
    return NextResponse.json({ ok: true, completata })
  } catch (e) {
    return apiError(e)
  }
}
