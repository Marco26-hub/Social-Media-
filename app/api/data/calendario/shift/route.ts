import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { giorniPerRipartireDa, pianificaSpostamento } from '@/lib/plan-shift'

export const dynamic = 'force-dynamic'

function oggiNelFuso(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

// POST — Sposta l'intero piano futuro di N giorni, mantenendo distanze, orari e
// sequenza. `dry_run: true` restituisce SOLO l'anteprima senza scrivere nulla:
// e la modalita che usa l'interfaccia per mostrare "sposto 34 contenuti, il
// primo passa dal 2 al 5 settembre" PRIMA di chiedere conferma. Spostare 48
// pubblicazioni e un'azione che si nota, non deve partire da un click distratto.
export async function POST(request: Request) {
  try {
    const cid = await requireClienteId()
    // Due modi per dire la stessa cosa: "sposta di N giorni" oppure "riparti dal
    // giorno X". Il secondo e solo un modo piu naturale di esprimere il primo —
    // sotto gira lo stesso motore, con gli stessi controlli.
    const body = await request.json().catch(() => ({})) as {
      giorni?: number
      riparti_da?: string
      da?: string
      dry_run?: boolean
    }
    const dryRun = body.dry_run !== false

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ ok: true, demo: true, applicato: false, spostati: 0, bloccati_blotato: 0, ignorati: 0 })
    }

    const clientRows = await q('SELECT timezone FROM clienti WHERE id = $1 LIMIT 1', [cid]) as Record<string, unknown>[]
    if (!clientRows.length) return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 })
    const oggi = oggiNelFuso(String(clientRows[0].timezone || 'Europe/Rome'))

    const rows = await q(
      `SELECT id, id_contenuto, data_pubblicazione, status, blotato_post_id
         FROM calendario
        WHERE cliente_id = $1 AND data_pubblicazione >= $2::date
        ORDER BY data_pubblicazione, ora_pubblicazione`,
      [cid, body.da && /^\d{4}-\d{2}-\d{2}$/.test(body.da) ? body.da : oggi],
    ) as Record<string, unknown>[]

    let giorni = Number(body.giorni)
    if (body.riparti_da) {
      const calcolo = giorniPerRipartireDa(rows, String(body.riparti_da), oggi, body.da)
      if (calcolo.errore) return NextResponse.json({ error: calcolo.errore }, { status: 400 })
      giorni = calcolo.giorni
    }

    const piano = pianificaSpostamento(rows, giorni, oggi, body.da)
    if (piano.errore) {
      return NextResponse.json({ error: piano.errore }, { status: 400 })
    }

    const riepilogo = {
      ok: true,
      applicato: !dryRun,
      giorni,
      spostati: piano.spostabili.length,
      bloccati_blotato: piano.bloccatiBlotato,
      ignorati: piano.ignorati,
      prima_data: piano.primaData,
      nuova_prima_data: piano.nuovaPrimaData,
    }
    if (dryRun) return NextResponse.json(riepilogo)

    // Un solo UPDATE per tutte le righe: uno spostamento a meta sarebbe peggio
    // del problema che risolve. `date + integer` resta una date in Postgres e fa
    // i conti sul calendario vero, quindi cambi di mese e anno bisestile non
    // sono casi speciali.
    await q(
      `UPDATE calendario
          SET data_pubblicazione = data_pubblicazione + $3::int,
              updated_at = now()
        WHERE cliente_id = $1
          AND id = ANY($2::uuid[])`,
      [cid, piano.spostabili.map(s => s.id), giorni],
    )

    return NextResponse.json(riepilogo)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Spostamento del piano fallito'
    return NextResponse.json({ error: message }, { status: /autenticat|autorizzat|cliente/i.test(message) ? 403 : 500 })
  }
}
