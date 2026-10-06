import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { toYmd, DEFAULT_TIMEZONE } from '@/lib/publish/blotato-map'
import { recoveryBlockReason, validRecoveryTarget } from '@/lib/calendar-recovery'

export const dynamic = 'force-dynamic'

// Recupero mirato: id, data e ora espliciti. Nessuna scansione/spostamento
// automatico del piano e nessuna cancellazione di riferimenti Blotato.
export async function POST(request: Request) {
  try {
    const cid = await requireClienteId()
    const body = await request.json().catch(() => null) as { id?: string; giorno?: string; ora?: string; dry_run?: boolean } | null
    if (!body?.id || !body.giorno || !body.ora || typeof body.dry_run !== 'boolean') {
      return NextResponse.json({ error: 'Scegli un solo contenuto, la nuova data e l’ora; verifica prima l’anteprima.' }, { status: 400 })
    }
    if (isDemo()) return NextResponse.json({ ok: true, demo: true, count: 0, requeued: [] })
    const clients = await q('SELECT timezone FROM clienti WHERE id = $1 LIMIT 1', [cid])
    const timezone = String(clients[0]?.timezone || DEFAULT_TIMEZONE)
    if (!validRecoveryTarget(body.giorno, body.ora, timezone)) {
      return NextResponse.json({ error: 'La nuova data/ora deve essere valida e futura nel fuso del cliente.' }, { status: 400 })
    }
    const rows = await q(
      `SELECT c.*, EXISTS (
         SELECT 1 FROM log_pubblicazioni l WHERE l.cliente_id = c.cliente_id
           AND l.id_contenuto = c.id_contenuto AND l.status_finale = 'RIMESSO_IN_CODA'
           AND l.messaggio LIKE '%invio Blotato scheduled non confermato, riferimento azzerato%'
       ) AS remote_reference_reset
       FROM calendario c WHERE c.id = $1 AND c.cliente_id = $2`, [body.id, cid],
    )
    if (!rows.length) return NextResponse.json({ error: 'Contenuto non trovato.' }, { status: 404 })
    const row = rows[0]
    const blocked = recoveryBlockReason(row, timezone)
    if (blocked) return NextResponse.json({ error: blocked }, { status: 409 })
    const collision = await q(
      `SELECT id FROM calendario WHERE cliente_id = $1 AND id <> $2 AND canale = $3
       AND data_pubblicazione = $4::date AND ora_pubblicazione = $5::time LIMIT 1`,
      [cid, body.id, row.canale, body.giorno, body.ora],
    )
    if (collision.length) return NextResponse.json({ error: 'Orario già occupato su questo canale: scegli un altro orario.' }, { status: 409 })
    const entry = {
      id: String(row.id), id_contenuto: row.id_contenuto, canale: row.canale, formato: row.formato,
      da: { giorno: toYmd(row.data_pubblicazione), ora: String(row.ora_pubblicazione).slice(0, 5) },
      a: { giorno: body.giorno, ora: body.ora },
    }
    if (body.dry_run) return NextResponse.json({ ok: true, dry_run: true, count: 1, requeued: [entry] })
    // UPDATE e audit atomici. Se la scheda è stata inviata/modificata nel
    // frattempo, non si sposta e non si sblocca nulla.
    const changed = await q(
      `WITH changed AS (
         UPDATE calendario SET data_pubblicazione = $5::date, ora_pubblicazione = $6::time,
           blotato_status = NULL, errore_tecnico = NULL, blotato_sync_at = NULL, updated_at = now()
         WHERE id = $1 AND cliente_id = $2 AND status = 'APPROVATO'
           AND data_pubblicazione = $3::date AND ora_pubblicazione = $4::time
           AND NULLIF(btrim(blotato_post_id), '') IS NULL
           AND NULLIF(btrim(blotato_post_url), '') IS NULL
           AND publish_lock_id IS NULL AND blotato_scheduled_at IS NULL
           AND blotato_status IS NOT DISTINCT FROM $7
           AND errore_tecnico IS NOT DISTINCT FROM $8
           AND NOT EXISTS (SELECT 1 FROM log_pubblicazioni l
             WHERE l.cliente_id = $2 AND l.id_contenuto = calendario.id_contenuto
               AND l.status_finale = 'RIMESSO_IN_CODA'
               AND l.messaggio LIKE '%invio Blotato scheduled non confermato, riferimento azzerato%')
         RETURNING id, cliente_id, id_contenuto, canale, formato
       ), logged AS (
         INSERT INTO log_pubblicazioni (cliente_id, id_contenuto, canale, formato, status_precedente, status_finale, messaggio)
         SELECT cliente_id, id_contenuto, canale, formato, 'APPROVATO', 'RIMESSO_IN_CODA', $9 FROM changed
         RETURNING id
       ) SELECT changed.id FROM changed CROSS JOIN logged`,
      [body.id, cid, entry.da.giorno, row.ora_pubblicazione, body.giorno, body.ora,
        row.blotato_status, row.errore_tecnico,
        `Recupero mirato da ${entry.da.giorno} ${entry.da.ora} a ${body.giorno} ${body.ora}; mai inviato; altri contenuti invariati`],
    )
    if (!changed.length) return NextResponse.json({ error: 'Contenuto modificato o inviato nel frattempo: aggiorna il calendario.' }, { status: 409 })
    return NextResponse.json({ ok: true, dry_run: false, count: 1, requeued: [entry], note: 'Data aggiornata. Nessun invio a Blotato: sincronizza solo questo contenuto quando vuoi.' })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Recupero fallito.' }, { status: 500 })
  }
}
