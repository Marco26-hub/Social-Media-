import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { q } from '@/lib/db'
import { scheduleOnBlotato } from '@/lib/publish/schedule'
import { getBlotatoKey } from '@/lib/blotato-key'

export const dynamic = 'force-dynamic'

// POST — Sincronizza con Blotato tutti i contenuti APPROVATI non ancora inviati.
// È il "tasto Sincronizza" della dashboard: calendario → Blotato → pubblicazione.
export async function POST() {
  let clienteId: string
  try {
    clienteId = await requireClienteId()
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'Non autorizzato' }, { status: 401 })
  }

  // Key per-cliente (settings del cliente) o env globale dell'agenzia.
  const blotatoKey = await getBlotatoKey(clienteId)
  if (!blotatoKey) {
    return NextResponse.json(
      {
        error: 'API key Blotato non configurata per questo cliente',
        hint: 'Inserisci la API key Blotato del cliente in Impostazioni, oppure la key globale in env.',
        synced: 0,
      },
      { status: 400 },
    )
  }

  // Contenuti pronti: approvati e mai sincronizzati su Blotato.
  const rows = await q(
    `SELECT * FROM calendario
     WHERE cliente_id = $1 AND status = 'APPROVATO' AND blotato_post_id IS NULL
     ORDER BY data_pubblicazione, ora_pubblicazione`,
    [clienteId],
  )

  let synced = 0
  const errors: { id_contenuto: string; canale: string; error: string }[] = []

  for (const row of rows) {
    try {
      const id = await scheduleOnBlotato(clienteId, row)
      if (id) synced++
    } catch (e) {
      errors.push({
        id_contenuto: String(row.id_contenuto ?? row.id ?? '?'),
        canale: String(row.canale ?? '?'),
        error: (e as Error).message?.slice(0, 200) || 'errore sconosciuto',
      })
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    candidates: rows.length,
    synced,
    failed: errors.length,
    errors: errors.slice(0, 20),
  })
}
