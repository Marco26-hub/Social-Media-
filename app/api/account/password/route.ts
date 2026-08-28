import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { apiError } from '@/lib/api-error'
import { dbReady, q, q1 } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { requireAuth } from '@/lib/auth-utils'
import { passwordProblem } from '@/lib/password-policy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cambio password dell'utente autenticato.
//
// Fino a questa route in TUTTA l'applicazione non esisteva alcun modo di
// cambiare una password: `password_hash` veniva scritto solo dalla
// registrazione (app/api/auth/register/route.ts) e letto solo dal login
// (lib/auth.ts). Di conseguenza gli account seminati da
// db/migrations/011_admin_user.sql restavano sulla password del seed, che è
// scritta in chiaro nel commento di quel file — versionato in un repository
// pubblico. Ruotarla richiedeva un UPDATE SQL a mano.
//
// Regole allineate alla registrazione tramite lib/password-policy.ts, cosi le due
// route non possono divergere. Hash bcrypt con cost 12, come la registrazione.

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (isDemo() || !dbReady()) {
      return NextResponse.json({ error: 'Cambio password non disponibile in modalità demo' }, { status: 503 })
    }

    const body = await request.json().catch(() => ({}))
    const currentPassword = String(body?.current_password || '')
    const newPassword = String(body?.new_password || '')

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Password attuale e nuova password sono obbligatorie' }, { status: 400 })
    }
    const problema = passwordProblem(newPassword, currentPassword)
    if (problema) return NextResponse.json({ error: problema }, { status: 400 })

    const row = await q1('SELECT id, password_hash FROM profiles WHERE id = $1 LIMIT 1', [user.id]) as
      { id: string; password_hash: string } | null
    if (!row?.password_hash) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    // Prova di possesso: senza questa, un cookie di sessione rubato basterebbe a
    // impossessarsi definitivamente dell'account cambiandone la password.
    const valid = await bcrypt.compare(currentPassword, row.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Password attuale non corretta' }, { status: 401 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    const updated = await q(
      'UPDATE profiles SET password_hash = $1, updated_at = now() WHERE id = $2 RETURNING id',
      [passwordHash, row.id],
    )
    if (!updated.length) {
      return NextResponse.json({ error: 'Aggiornamento non riuscito' }, { status: 500 })
    }

    // La sessione NextAuth è un JWT e non contiene la password: resta valida.
    // Va detto al chiamante, così l'utente sa di dover riautenticare gli altri
    // dispositivi a mano (non esiste ancora una revoca globale delle sessioni).
    return NextResponse.json({ ok: true, sessioni_altre_revocate: false })
  } catch (e) {
    return apiError(e)
  }
}
