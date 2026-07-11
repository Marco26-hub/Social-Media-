import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'

export const dynamic = 'force-dynamic'

// Storico analisi competitor del cliente attivo (generate dall'agente AUTO o dal
// manuale). Ritorna il campo `analisi` (jsonb) pronto per la UI.
export async function GET() {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) return NextResponse.json([])
    const cid = await requireClienteId()
    const rows = await q(
      'SELECT id, competitor_nome, analisi, score_competitor, fonte_generazione, created_at FROM competitor_analysis WHERE cliente_id = $1 ORDER BY created_at DESC LIMIT 30',
      [cid],
    )
    return NextResponse.json(rows)
  } catch (e) {
    return apiError(e)
  }
}
