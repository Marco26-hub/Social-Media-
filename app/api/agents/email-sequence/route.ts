import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { cronDenied } from '@/lib/cron-auth'
import { requireAdmin } from '@/lib/auth-utils'
import { eseguiEmailSequencePerCliente, type EmailSequenceResult } from '@/lib/agents/email-sequence'
import { notifyAgency } from '@/lib/notifications'
import { isAgentEnabled } from '@/lib/agent-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Agente email schedulato: crea le sequenze essenziali (welcome, cart_abandonment)
// mancanti per i clienti AUTO. Idempotente — un cliente che le ha già non viene
// ritoccato (email_sequence è un asset stabile, non contenuto del giorno).
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
    if (!(await isAgentEnabled('email'))) {
      return NextResponse.json({ ok: true, disabled: true, message: 'Agente email disabilitato dal pannello.' })
    }

    const rows = await q(
      `SELECT s.cliente_id
       FROM settings s
       JOIN clienti c ON c.id = s.cliente_id
       WHERE s.chiave = 'generation_mode' AND upper(s.valore) = 'AUTO' AND c.attivo = true`,
    )
    const clienti = rows.map(r => String((r as Record<string, unknown>).cliente_id)).filter(Boolean)

    const risultati: EmailSequenceResult[] = []
    for (const clienteId of clienti) {
      try {
        risultati.push(await eseguiEmailSequencePerCliente(clienteId, {}))
      } catch (e) {
        risultati.push({ clienteId, sequenzeCreate: 0, errori: [(e instanceof Error ? e.message : String(e)).slice(0, 160)] })
      }
    }

    const totale = risultati.reduce((n, r) => n + r.sequenzeCreate, 0)
    const conErrori = risultati.filter(r => r.errori.length > 0)
    // Nessuna sequenza creata può significare "tutti i clienti le avevano già" (ok)
    // oppure "tutti falliti" (errore reale). Distingui guardando gli errori.
    const failedRun = clienti.length > 0 && totale === 0 && conErrori.length === clienti.length && conErrori.every(r => r.errori.some(e => !e.includes('già')))

    if (failedRun) {
      await notifyAgency({
        type: 'errore',
        id_contenuto: 'sequenze email automatiche',
        canale: `${clienti.length} clienti AUTO`,
        errore: conErrori[0]?.errori[0] || 'nessuna sequenza generata',
      }).catch(() => {})
    }

    return NextResponse.json({
      ok: !failedRun,
      clienti_auto: clienti.length,
      sequenze_create: totale,
      falliti: conErrori.length,
      error: failedRun ? `Nessuna sequenza email creata su ${clienti.length} clienti AUTO. Primo errore: ${conErrori[0]?.errori[0] || 'sconosciuto'}` : undefined,
      dettaglio: risultati,
    }, { status: failedRun ? 502 : 200 })
  } catch (e) {
    return apiError(e)
  }
}
