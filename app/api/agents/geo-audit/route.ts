import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { cronDenied } from '@/lib/cron-auth'
import { requireAdmin } from '@/lib/auth-utils'
import { eseguiGeoAuditPerCliente, type GeoAuditResult } from '@/lib/agents/geo-audit'
import { notifyAgency } from '@/lib/notifications'
import { isAgentEnabled } from '@/lib/agent-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Agente GEO schedulato: punteggio di citabilità AI CALCOLATO (lib/geo/citability.ts)
// sugli articoli blog pubblicati di ogni cliente AUTO. Complementa seo-audit (che ha
// un unico score_geo_ai_search stimato dall'AI) con una misura riproducibile.
// Stesso pattern di app/api/agents/seo-audit: auth cron/admin, gate agent_config,
// niente falliti mascherati da 200.
export async function POST(request: Request) {
  const denied = cronDenied(request)
  if (denied) {
    try {
      await requireAdmin()
    } catch {
      return denied
    }
  }

  try {
    if (!dbReady()) return NextResponse.json({ error: 'DB non pronto' }, { status: 503 })
    if (!(await isAgentEnabled('geo'))) {
      return NextResponse.json({ ok: true, disabled: true, message: 'Agente GEO disabilitato dal pannello.' })
    }

    const rows = await q(
      `SELECT s.cliente_id
       FROM settings s
       JOIN clienti c ON c.id = s.cliente_id
       WHERE s.chiave = 'generation_mode' AND upper(s.valore) = 'AUTO' AND c.attivo = true`,
    )
    const clienti = rows.map(r => String((r as Record<string, unknown>).cliente_id)).filter(Boolean)

    const risultati: GeoAuditResult[] = []
    for (const clienteId of clienti) {
      try {
        risultati.push(await eseguiGeoAuditPerCliente(clienteId, {}))
      } catch (e) {
        risultati.push({ clienteId, ok: false, articoliAnalizzati: 0, errore: (e instanceof Error ? e.message : String(e)).slice(0, 160) })
      }
    }

    const fatti = risultati.filter(r => r.ok).length
    const conErrori = risultati.filter(r => !r.ok)
    // Fallimento "vero" solo se c'erano clienti AUTO e NESSUNO ha prodotto un audit.
    // Molti clienti senza articoli pubblicati sono un esito atteso, non un errore di sistema.
    const failedRun = clienti.length > 0 && fatti === 0 && conErrori.every(r => !r.errore?.includes('Nessun articolo'))

    if (failedRun) {
      await notifyAgency({
        type: 'errore',
        id_contenuto: 'audit GEO automatico',
        canale: `${clienti.length} clienti AUTO`,
        errore: conErrori[0]?.errore || 'nessun audit prodotto',
      }).catch(() => {})
    }

    return NextResponse.json({
      ok: !failedRun,
      clienti_auto: clienti.length,
      audit_fatti: fatti,
      falliti: conErrori.length,
      error: failedRun ? `Nessun audit GEO prodotto su ${clienti.length} clienti AUTO. Primo errore: ${conErrori[0]?.errore || 'sconosciuto'}` : undefined,
      dettaglio: risultati,
    }, { status: failedRun ? 502 : 200 })
  } catch (e) {
    return apiError(e)
  }
}
