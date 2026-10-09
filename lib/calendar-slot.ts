import { q } from './db'
import { remoteCalendarTime } from './calendar-display'
import { toYmd, zonedToUtcIso } from './publish/blotato-map'

export class CalendarScheduleError extends Error {
  constructor(message: string, public status = 409) { super(message) }
}

export function scheduleTarget(day: unknown, time: unknown, timezone: string, now = Date.now()) {
  if (typeof day !== 'string' || typeof time !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)
    || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new CalendarScheduleError('Data e ora non valide.', 400)
  const date = new Date(`${day}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || toYmd(date) !== day) throw new CalendarScheduleError('Data non valida.', 400)
  const iso = zonedToUtcIso(day, time, timezone)
  const local = remoteCalendarTime(iso, timezone)
  if (local?.day !== day || local?.time !== time) throw new CalendarScheduleError('Orario inesistente nel fuso del cliente (cambio ora legale).', 400)
  // Il calendario raccoglie HH:mm, non l'offset: non scegliere di nascosto una
  // delle due occorrenze di un'ora ripetuta al passaggio all'ora solare.
  for (const offset of [-3600000, 3600000]) {
    const alternative = remoteCalendarTime(new Date(Date.parse(iso) + offset).toISOString(), timezone)
    if (alternative?.day === day && alternative?.time === time) throw new CalendarScheduleError('Orario ambiguo al cambio ora solare: scegli un altro slot.', 400)
  }
  if (Date.parse(iso) <= now) throw new CalendarScheduleError('La nuova programmazione deve essere nel futuro.', 400)
  return { day, time, iso }
}

export async function lockCalendarChannel(query: typeof q, cid: string, canale: string) {
  await query("SELECT pg_advisory_xact_lock(hashtext('swa-calendar-slot'), hashtext($1))", [`${cid}:${canale}`])
}

export async function assertFreeCalendarSlot(query: typeof q, cid: string, id: string, canale: string, day: string, time: string) {
  const collision = await query(`SELECT id_contenuto FROM calendario WHERE cliente_id = $1 AND id <> $2::uuid AND canale = $3
    AND data_pubblicazione = $4::date AND date_trunc('minute', ora_pubblicazione::interval) = $5::time::interval
    AND status NOT IN ('ARCHIVIATO', 'NON_APPROVATO') LIMIT 1`, [cid, id, canale, day, time])
  if (collision.length) throw new CalendarScheduleError(`Slot occupato su ${canale} da ${collision[0].id_contenuto}: scegli un altro orario.`)
}

export async function lockBlotatoAccount(query: typeof q, account: string, platform: string, page: string | null) {
  await query("SELECT pg_advisory_xact_lock(hashtext('swa-blotato-account'), hashtext($1))", [`${account}:${platform}:${page || ''}`])
}

export async function assertFreeBlotatoReservation(query: typeof q, id: string, account: string, platform: string, page: string | null, iso: string) {
  const reserved = await query(`SELECT e.id FROM integration_events e LEFT JOIN calendario c ON c.id::text = e.entity_id AND c.cliente_id = e.cliente_id
    WHERE e.provider = 'blotato' AND e.event_type = 'post_submission' AND e.status IN ('processing','processed')
      AND e.entity_id <> $1 AND e.payload->>'account_id' = $2 AND e.payload->'target'->>'targetType' = $3
      AND COALESCE(e.payload->'target'->>'pageId', '') = COALESCE($4, '')
      AND (e.status = 'processing' OR COALESCE(c.blotato_status, '') NOT IN ('published','failed'))
      AND date_trunc('minute', COALESCE(c.blotato_scheduled_at, (e.payload->>'scheduled_time')::timestamptz)) = date_trunc('minute', $5::timestamptz)
    LIMIT 1`, [id, account, platform, page, iso])
  if (reserved.length) throw new CalendarScheduleError('Slot già riservato da un invio SWA sullo stesso account/canale. Scegli un altro orario.')
}
