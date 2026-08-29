import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { requireAdmin, requireClienteAccess } from '@/lib/auth-utils'
import { isStorageConfigured } from '@/lib/storage'
import { pulisciMediaOrfani } from '@/lib/asset-cleanup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Puo dover cancellare centinaia di oggetti, uno alla volta.
export const maxDuration = 300

// Elimina i media caricati e mai usati da nessun contenuto.
//
// SICUREZZA DEL DATO:
//  - solo admin: e una cancellazione irreversibile su storage;
//  - `dry_run` e il DEFAULT: per cancellare serve passarlo esplicitamente false;
//  - l'ultimo caricamento non viene mai toccato, perche i suoi file possono non
//    essere ancora in calendario e servire alla fase successiva.
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json().catch(() => ({})) as { cliente_id?: string; dry_run?: boolean }
    const clienteId = String(body.cliente_id || '')
    if (!clienteId) return NextResponse.json({ error: 'cliente_id richiesto' }, { status: 400 })
    await requireClienteAccess(clienteId)

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ error: 'Pulizia non disponibile in modalità demo' }, { status: 503 })
    }
    if (!isStorageConfigured()) {
      return NextResponse.json({ error: 'Storage non configurato' }, { status: 503 })
    }

    const dryRun = body.dry_run !== false
    const esito = await pulisciMediaOrfani({ clienteId, dryRun })

    return NextResponse.json({
      ok: true,
      ...esito,
      mb_liberati: Math.round((esito.bytesLiberati / 1024 / 1024) * 10) / 10,
      ...(dryRun ? { nota: 'Simulazione: nessun file è stato toccato.' } : {}),
    })
  } catch (e) {
    return apiError(e)
  }
}
