import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q1 } from '@/lib/db'
import { isDemo } from '@/lib/demo'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Preiscrizione ai video corsi AI Act. Nessun pagamento e nessun impegno: la
// riga serve solo ad avvisare quando il corso parte.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const nome = String(body.nome || '').trim().slice(0, 120)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 180)
    const azienda = String(body.azienda || '').trim().slice(0, 160)
    const ruolo = String(body.ruolo || '').trim().slice(0, 120)
    const note = String(body.note || '').trim().slice(0, 600)
    const consenso = body.consenso === true

    if (!nome) return NextResponse.json({ error: 'Serve il nome.' }, { status: 400 })
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'L’email non sembra valida.' }, { status: 400 })
    // Senza consenso l'indirizzo non e utilizzabile per avvisare della partenza:
    // registrarlo comunque significherebbe raccoglierlo senza base per usarlo.
    if (!consenso) return NextResponse.json({ error: 'Serve il consenso per poterti avvisare.' }, { status: 400 })

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ ok: false, demo: true, message: 'Iscrizioni non disponibili in questa modalità. Scrivici su WhatsApp.' })
    }

    // Un secondo invio dallo stesso indirizzo aggiorna la riga: chi si iscrive
    // due volte non deve trovarsi due volte in lista.
    const row = await q1(
      `INSERT INTO corso_iscrizioni (corso, nome, email, azienda, ruolo, note, consenso, origine)
       VALUES ('ai-act', $1, $2, $3, $4, $5, true, $6)
       ON CONFLICT (corso, lower(email)) DO UPDATE
         SET nome = EXCLUDED.nome, azienda = EXCLUDED.azienda, ruolo = EXCLUDED.ruolo,
             note = EXCLUDED.note, consenso = true, updated_at = now()
       RETURNING id`,
      [nome, email, azienda || null, ruolo || null, note || null, 'sito/consulenza'],
    )

    return NextResponse.json({
      ok: true,
      id: String((row as { id: string }).id),
      message: 'Ci sei. Ti avvisiamo appena il primo modulo è pronto.',
    })
  } catch (e) {
    return apiError(e)
  }
}
