import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'

const DEMO_PENDING = [
  { id: 'demo-1', nome: 'Mario Rossi', email: 'mario@negoziorossi.it', azienda: 'Negozio Rossi', telefono: '+39 340 1112223', pacchetto: 'crescita', created_at: '2026-07-05T09:12:00Z' },
  { id: 'demo-2', nome: 'Laura Bianchi', email: 'laura@studiobianchi.it', azienda: 'Studio Bianchi', telefono: null, pacchetto: 'presenza', created_at: '2026-07-06T14:40:00Z' },
]

// Coda registrazioni in attesa di attivazione (solo admin).
export async function GET() {
  try {
    await requireAdmin()
    if (isDemo() || !dbReady()) return NextResponse.json(DEMO_PENDING)
    const rows = await q(
      `SELECT id, nome, email, azienda, telefono, pacchetto, created_at
       FROM profiles
       WHERE status = 'pending'
       ORDER BY created_at ASC`,
    )
    return NextResponse.json(rows)
  } catch (e) {
    return apiError(e)
  }
}

// Attiva o rifiuta una registrazione.
export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const { id, action } = (await request.json()) as { id?: string; action?: string }
    if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
    if (action !== 'activate' && action !== 'reject') {
      return NextResponse.json({ error: 'action non valida (activate | reject)' }, { status: 400 })
    }
    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })

    const nextStatus = action === 'activate' ? 'active' : 'rejected'
    await q(
      `UPDATE profiles SET status = $1, updated_at = now() WHERE id = $2 AND status = 'pending'`,
      [nextStatus, id],
    )
    return NextResponse.json({ ok: true, status: nextStatus })
  } catch (e) {
    return apiError(e)
  }
}
