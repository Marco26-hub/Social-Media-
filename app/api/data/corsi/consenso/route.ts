import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAuth } from '@/lib/auth-utils'
import { consensoConsegnaDaRaccogliere, getCorsoPerAcquisto, registraConsensoConsegna } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

// Le due dichiarazioni sul recesso, raccolte alla consegna invece che
// all'acquisto. Serve a chi ha comprato in prevendita: al momento dell'acquisto
// il diritto non poteva essere rinunciato, perche l'esecuzione non era iniziata.
//
// Le due caselle devono arrivare entrambe e spuntate. Non si accetta una
// richiesta che ne porti una sola: sono due dichiarazioni distinte e vanno
// rese separatamente, non dedotte l'una dall'altra.
export async function POST(request: Request) {
  try {
    const utente = await requireAuth()
    const corpo = await request.json() as Record<string, unknown>
    const slug = typeof corpo.corso_slug === 'string' ? corpo.corso_slug.trim() : ''
    if (!slug) return NextResponse.json({ error: 'Corso non indicato' }, { status: 400 })

    if (corpo.early_performance_requested !== true || corpo.withdrawal_loss_acknowledged !== true) {
      return NextResponse.json(
        { error: 'Per accedere alle lezioni devi confermare entrambe le dichiarazioni.' },
        { status: 400 },
      )
    }

    const corso = await getCorsoPerAcquisto(slug)
    if (!corso) return NextResponse.json({ error: 'Corso non disponibile' }, { status: 404 })

    // Se non erano dovute, non si scrive niente e si risponde ok: la pagina
    // aveva gia l'accesso e una seconda richiesta non deve dare errore.
    if (!(await consensoConsegnaDaRaccogliere(utente.id, corso.id))) {
      return NextResponse.json({ ok: true, gia_registrato: true })
    }

    const fatto = await registraConsensoConsegna(utente.id, corso.id)
    if (!fatto) return NextResponse.json({ error: 'Corso non disponibile' }, { status: 403 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
