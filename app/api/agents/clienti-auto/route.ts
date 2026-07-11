import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'

export const dynamic = 'force-dynamic'

// Gestione centralizzata (dal pannello agenti) del modo generazione per cliente:
// AUTO = l'autopilota; MANUALE = solo su click. Solo admin. Permette all'admin di
// mettere QUALSIASI cliente su AUTO/MANUALE senza cambiare cliente attivo.
export async function GET() {
  try {
    await requireAdmin()
    if (isDemo() || !dbReady()) {
      return NextResponse.json([{ id: 'demo', nome: 'Cliente demo', mode: 'MANUAL' }])
    }
    const rows = await q(
      `SELECT c.id, c.nome, COALESCE(upper(s.valore), 'MANUAL') AS mode
       FROM clienti c
       LEFT JOIN settings s ON s.cliente_id = c.id AND s.chiave = 'generation_mode'
       WHERE c.attivo = true
       ORDER BY c.nome`,
    )
    return NextResponse.json(rows)
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { cliente_id, mode } = await request.json()
    const m = String(mode || '').toUpperCase()
    if (!cliente_id || (m !== 'MANUAL' && m !== 'AUTO')) {
      return NextResponse.json({ error: 'cliente_id e mode (MANUAL|AUTO) richiesti' }, { status: 400 })
    }
    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })
    await q(
      `INSERT INTO settings (cliente_id, chiave, valore, descrizione)
       VALUES ($1, 'generation_mode', $2, 'MANUAL = generi tu a mano; AUTO = generazione automatica (bozze da approvare)')
       ON CONFLICT (cliente_id, chiave) DO UPDATE SET valore = EXCLUDED.valore, updated_at = now()`,
      [cliente_id, m],
    )
    return NextResponse.json({ ok: true, cliente_id, mode: m })
  } catch (e) {
    return apiError(e)
  }
}
