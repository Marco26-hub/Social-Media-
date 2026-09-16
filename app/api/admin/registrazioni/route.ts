import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q, q1 } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { sendAccountActivated } from '@/lib/email'
import { activateRegistration } from '@/lib/provisioning'
import { corsiPronti, sqlProfiloSoloCorso } from '@/lib/corsi-db'

const DEMO_PENDING = [
  { id: 'demo-1', nome: 'Mario Rossi', email: 'mario@negoziorossi.it', azienda: 'Negozio Rossi', telefono: '+39 340 1112223', pacchetto: 'crescita', created_at: '2026-07-05T09:12:00Z' },
  { id: 'demo-2', nome: 'Laura Bianchi', email: 'laura@studiobianchi.it', azienda: 'Studio Bianchi', telefono: null, pacchetto: 'presenza', created_at: '2026-07-06T14:40:00Z' },
]

// Coda registrazioni in attesa di attivazione (solo admin).
//
// Esclude chi ha solo iniziato ad acquistare un corso: non e una registrazione
// da approvare ma un pagamento non concluso, e sta nel tab Vendite dei corsi.
// Vedi sqlProfiloSoloCorso per il perche nessuna delle due azioni qui va bene.
export async function GET() {
  try {
    await requireAdmin()
    if (isDemo() || !dbReady()) return NextResponse.json(DEMO_PENDING)
    // Senza le tabelle dei corsi non esistono acquisti non conclusi da escludere,
    // e nominarle nella query la farebbe fallire: la coda tornerebbe un 500.
    const filtroCorsi = (await corsiPronti()) ? `AND NOT ${sqlProfiloSoloCorso('p')}` : ''
    const rows = await q(
      `SELECT p.id, p.nome, p.email, p.azienda, p.telefono, p.pacchetto, p.created_at
       FROM profiles p
       WHERE p.status = 'pending'
         ${filtroCorsi}
       ORDER BY p.created_at ASC`,
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

    // La coda non li mostra piu, ma la route si raggiunge anche senza passare
    // dalla pagina: il controllo sta qui, non solo nell'elenco.
    const soloCorso = (await corsiPronti())
      ? await q1(`SELECT 1 AS ok FROM profiles p WHERE p.id = $1 AND ${sqlProfiloSoloCorso('p')}`, [id])
      : null
    if (soloCorso) {
      return NextResponse.json(
        {
          error:
            'Questa persona ha solo iniziato l’acquisto di un corso senza completarlo. Non va attivata né rifiutata da qui: '
            + 'attivarla creerebbe un pannello social mai pagato, rifiutarla le impedirebbe di comprare in futuro. '
            + 'Il suo ordine è nel tab Vendite dei corsi e l’account si attiva da solo quando paga.',
        },
        { status: 409 },
      )
    }

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
      const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://www.socialautomation.app').replace(/\/$/, '')
      await sendAccountActivated(prof.email, prof.nome || 'Cliente', `${base}/login`).catch(() => {})
    }

    return NextResponse.json({ ok: true, status: 'active', cliente_id: result.clienteId, already_active: result.alreadyActive })
  } catch (e) {
    return apiError(e)
  }
}
