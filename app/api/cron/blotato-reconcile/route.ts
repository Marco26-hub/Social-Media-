import { NextResponse } from 'next/server'
import { cronDenied } from '@/lib/cron-auth'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { reconcileClienteBlotato } from '@/lib/blotato-reconcile'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Solo stati degli invii esistenti. Non genera/approva/renderizza/crea post.
export async function GET(request: Request) {
  const denied = cronDenied(request)
  if (denied) return denied
  if (isDemo() || !dbReady()) return NextResponse.json({ error: 'Riconciliazione reale non disponibile' }, { status: 503 })
  const started = Date.now()
  try {
    const clients = await q(`SELECT c.cliente_id FROM calendario c JOIN clienti cl ON cl.id = c.cliente_id
      WHERE cl.attivo = true AND (c.blotato_post_id IS NOT NULL OR EXISTS (
        SELECT 1 FROM integration_events accepted WHERE accepted.cliente_id = c.cliente_id AND accepted.entity_id = c.id::text
          AND accepted.provider = 'blotato' AND accepted.event_type = 'post_submission'
          AND accepted.status = 'processed' AND NULLIF(accepted.payload->>'submission_id', '') IS NOT NULL))
        AND COALESCE(c.blotato_status, '') NOT IN ('published','failed') AND c.canale <> 'blog'
      GROUP BY c.cliente_id ORDER BY (SELECT MAX(e.created_at) FROM integration_events e WHERE e.cliente_id = c.cliente_id
        AND e.provider = 'blotato' AND e.event_type = 'status_reconcile') ASC NULLS FIRST LIMIT 10`)
    const results: Array<Record<string, unknown>> = []
    for (const client of clients) {
      if (Date.now() - started > 210000) break
      try {
        const result = await reconcileClienteBlotato(String(client.cliente_id))
        results.push({ cliente_id: client.cliente_id, ok: result.ok, checked: result.checked, deferred: result.deferred, remote_errors: result.remote_errors })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Verifica fallita'
        console.error('[Blotato cron]', client.cliente_id, message)
        results.push({ cliente_id: client.cliente_id, ok: false, error: message })
      }
    }
    const ok = results.every(result => result.ok) && results.length === clients.length
    return NextResponse.json({ ok, checked_clients: results.length, deferred_clients: clients.length - results.length, results },
      { status: ok ? 200 : 502, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Verifica periodica fallita: nessun invio' }, { status: 500 })
  }
}
