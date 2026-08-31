import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { requireAdmin, requireClienteAccess } from '@/lib/auth-utils'
import { inspectNonLiveCalendar, deleteNonLiveCalendar } from '@/lib/calendar-cleanup'
import { isStorageConfigured } from '@/lib/storage'
import { pulisciMediaOrfani } from '@/lib/asset-cleanup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Prepara un nuovo piano senza accumulare bozze e approvati mai inviati. Il
// default e sempre una simulazione; la cancellazione richiede dry_run: false.
// I record con ID/stato Blotato non passano mai i guard del servizio.
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json().catch(() => ({})) as { cliente_id?: string; dry_run?: boolean; elimina_media?: boolean }
    const clienteId = String(body.cliente_id || '')
    if (!clienteId) return NextResponse.json({ error: 'cliente_id richiesto' }, { status: 400 })
    await requireClienteAccess(clienteId)

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ error: 'Pulizia non disponibile in modalità demo' }, { status: 503 })
    }

    const dryRun = body.dry_run !== false
    if (dryRun) {
      const summary = await inspectNonLiveCalendar(clienteId)
      return NextResponse.json({
        ok: true,
        dry_run: true,
        ...summary,
        nota: 'Simulazione: nessun contenuto o media è stato toccato.',
      })
    }

    const deleted = await deleteNonLiveCalendar(clienteId)
    let mediaPulizia: Record<string, unknown> | null = null
    if (body.elimina_media !== false && isStorageConfigured()) {
      // Dopo la rimozione DB i file dei vecchi contenuti diventano orfani. La
      // routine conserva sempre l'ultimo caricamento e i media ancora referenziati.
      const result = await pulisciMediaOrfani({ clienteId, dryRun: false })
      mediaPulizia = {
        media_eliminati: result.eliminati,
        mb_liberati: Math.round((result.bytesLiberati / 1024 / 1024) * 10) / 10,
      }
    }

    return NextResponse.json({ ok: true, dry_run: false, ...deleted, ...mediaPulizia })
  } catch (error) {
    return apiError(error)
  }
}
