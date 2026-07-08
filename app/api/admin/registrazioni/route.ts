import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q, q1 } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { sendAccountActivated } from '@/lib/email'
import { activateRegistration } from '@/lib/provisioning'

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

    // Rifiuto: solo flip di stato, nessun provisioning.
    if (action === 'reject') {
      await q(`UPDATE profiles SET status = 'rejected', updated_at = now() WHERE id = $1 AND status = 'pending'`, [id])
      return NextResponse.json({ ok: true, status: 'rejected' })
    }

    // Provisioning via helper condiviso (stessa logica del webhook Stripe).
    const prof = (await q1('SELECT email, nome, status FROM profiles WHERE id = $1', [id])) as
      { email: string | null; nome: string | null; status: string } | null
    if (!prof) return NextResponse.json({ error: 'Registrazione non trovata' }, { status: 404 })

    const result = await activateRegistration({ profileId: id })

    // Email di attivazione al cliente (no-op se RESEND_API_KEY non configurata).
    if (prof.email && !result.alreadyActive) {
      const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://social-media-manager-zte4.onrender.com').replace(/\/$/, '')
      await sendAccountActivated(prof.email, prof.nome || 'Cliente', `${base}/login`).catch(() => {})
    }

    return NextResponse.json({ ok: true, status: 'active', cliente_id: result.clienteId, already_active: result.alreadyActive })
  } catch (e) {
    return apiError(e)
  }
}
