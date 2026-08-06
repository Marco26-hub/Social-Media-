import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { toYmd, zonedToUtcIso, DEFAULT_TIMEZONE } from '@/lib/publish/blotato-map'
import { nextAvailableSlot, addDays } from '@/lib/scheduling'

export const dynamic = 'force-dynamic'

function todayInTz(tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

// POST — Rimette in coda i contenuti APPROVATI mai sincronizzati su Blotato la
// cui data/ora è già passata: li sposta al primo slot FUTURO libero per il loro
// canale (stesse fasce orarie di sempre, lib/scheduling.ts), senza ammucchiarli
// sullo stesso giorno e senza sovrapporsi a contenuti già pianificati.
//
// Tocca SOLO data_pubblicazione/ora_pubblicazione in locale: non chiama Blotato
// e non cambia lo status. L'invio vero resta il passo separato "Sincronizza
// Blotato", a scelta dell'utente, con i suoi gate (PUBLISH_ENABLED + dry_run)
// invariati.
export async function POST() {
  let cid: string
  try {
    cid = await requireClienteId()
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'Non autorizzato' }, { status: 401 })
  }

  if (isDemo()) {
    return NextResponse.json({ ok: true, demo: true, count: 0, requeued: [] })
  }

  const tzRows = await q('SELECT timezone FROM clienti WHERE id = $1 LIMIT 1', [cid])
  const timezone = String((tzRows[0] as { timezone?: string } | undefined)?.timezone || DEFAULT_TIMEZONE)
  const today = todayInTz(timezone)
  const now = Date.now()

  // Candidati: approvati, mai inviati a Blotato (blotato_post_id nullo).
  const rows = await q(
    `SELECT id, id_contenuto, canale, formato, obiettivo, data_pubblicazione, ora_pubblicazione
     FROM calendario
     WHERE cliente_id = $1 AND status = 'APPROVATO' AND blotato_post_id IS NULL
     ORDER BY data_pubblicazione ASC, ora_pubblicazione ASC`,
    [cid],
  ) as Record<string, unknown>[]

  // Nel passato per davvero: stesso confronto del pre-flight (zonedToUtcIso vs now),
  // non un confronto ingenuo di stringhe data che ignorerebbe il fuso del cliente.
  const passati = rows.filter(r => {
    try {
      return new Date(zonedToUtcIso(r.data_pubblicazione, r.ora_pubblicazione, timezone)).getTime() <= now
    } catch {
      return false
    }
  })

  if (!passati.length) {
    return NextResponse.json({ ok: true, count: 0, requeued: [], note: 'Nessun contenuto approvato in ritardo: niente da rimettere in coda.' })
  }

  // Occupazione futura: ogni contenuto con data da oggi in poi (qualunque stato),
  // così il nuovo slot non si sovrappone visivamente a qualcosa già pianificato.
  const futureRows = await q(
    `SELECT canale, data_pubblicazione, ora_pubblicazione
     FROM calendario
     WHERE cliente_id = $1 AND data_pubblicazione >= $2`,
    [cid, today],
  ) as Record<string, unknown>[]

  const usati = new Set<string>()
  for (const r of futureRows) {
    const canale = String(r.canale || '').toLowerCase()
    const giorno = toYmd(r.data_pubblicazione)
    const ora = String(r.ora_pubblicazione || '').slice(0, 5)
    if (!canale || !giorno || !ora) continue
    usati.add(`${canale}|${giorno}|${ora}`)
    usati.add(`*|${giorno}|${ora}`)
    usati.add(`${canale}|${giorno}|*`)
  }

  // Si riparte sempre da domani: evita il caso limite di uno slot "libero" oggi
  // ma già passato (es. fascia mattina quando sono le 18:00), che ricreerebbe
  // all'istante un altro contenuto in ritardo.
  const daGiorno = addDays(today, 1)

  const requeued: Array<{
    id: string; id_contenuto: string | null; canale: string; formato: string
    da: { giorno: string; ora: string }; a: { giorno: string; ora: string }
  }> = []

  for (const row of passati) {
    const canale = String(row.canale || '')
    const formato = String(row.formato || 'post')
    const obiettivo = row.obiettivo ? String(row.obiettivo) : undefined
    const { giorno, ora } = nextAvailableSlot({ canale, formato, obiettivo, daGiorno }, usati)

    await q(
      `UPDATE calendario SET data_pubblicazione = $1, ora_pubblicazione = $2, updated_at = now()
       WHERE id = $3 AND cliente_id = $4`,
      [giorno, ora, row.id, cid],
    )

    const entry = {
      id: String(row.id),
      id_contenuto: (row.id_contenuto as string) || null,
      canale,
      formato,
      da: { giorno: toYmd(row.data_pubblicazione), ora: String(row.ora_pubblicazione || '').slice(0, 5) },
      a: { giorno, ora },
    }
    requeued.push(entry)

    // Audit best-effort: mai bloccare il requeue se il log fallisce.
    try {
      await q(
        `INSERT INTO log_pubblicazioni (cliente_id, id_contenuto, canale, formato, status_finale, messaggio)
         VALUES ($1, $2, $3, $4, 'RIMESSO_IN_CODA', $5)`,
        [cid, entry.id_contenuto, canale, formato, `Spostato da ${entry.da.giorno} ${entry.da.ora} a ${entry.a.giorno} ${entry.a.ora} (data passata, mai sincronizzato)`],
      )
    } catch (logErr) {
      console.warn('[requeue-passati] log_pubblicazioni insert fallito:', (logErr as Error).message.slice(0, 120))
    }
  }

  return NextResponse.json({ ok: true, count: requeued.length, requeued })
}
