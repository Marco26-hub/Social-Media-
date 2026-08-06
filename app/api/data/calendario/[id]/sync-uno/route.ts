import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { scheduleOnBlotato } from '@/lib/publish/schedule'
import { DEFAULT_TIMEZONE } from '@/lib/publish/blotato-map'

export const dynamic = 'force-dynamic'

// POST — Sincronizza su Blotato UN SOLO contenuto (non l'intero batch di
// "Sincronizza Blotato"). Serve a poter testare un singolo invio reale senza
// coinvolgere tutti gli APPROVATI non ancora inviati nello stesso click.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let cid: string
  try {
    cid = await requireClienteId()
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'Non autorizzato' }, { status: 401 })
  }

  if (isDemo()) {
    return NextResponse.json({ ok: true, demo: true, status: 'dry_run' })
  }

  const rows = await q('SELECT * FROM calendario WHERE id = $1 AND cliente_id = $2', [id, cid]) as Record<string, unknown>[]
  if (!rows.length) {
    return NextResponse.json({ error: 'contenuto non trovato' }, { status: 404 })
  }
  const row = rows[0]
  if (row.status !== 'APPROVATO') {
    return NextResponse.json({ error: `contenuto non APPROVATO (stato attuale: ${row.status}): sincronizzabile solo un contenuto approvato` }, { status: 400 })
  }
  if (row.blotato_post_id) {
    return NextResponse.json({ error: 'contenuto già sincronizzato su Blotato' }, { status: 400 })
  }

  const tzRows = await q('SELECT timezone FROM clienti WHERE id = $1 LIMIT 1', [cid])
  const timezone = String((tzRows[0] as { timezone?: string } | undefined)?.timezone || DEFAULT_TIMEZONE)

  try {
    const outcome = await scheduleOnBlotato(cid, row, timezone)
    return NextResponse.json({ ok: true, ...outcome })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message.slice(0, 500) }, { status: 502 })
  }
}
