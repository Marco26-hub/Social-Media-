import { createHash } from 'node:crypto'
import { q, withTransaction } from './db'
import { getBlotatoKey } from './blotato-key'
import { getPinnedSubaccountId } from './blotato-accounts'
import { isLocalPreflightFailure } from './calendar-recovery'
import { toYmd, CANALE_TO_BLOTATO } from './publish/blotato-map'
import { CalendarScheduleError, scheduleTarget, lockCalendarChannel, assertFreeCalendarSlot, lockBlotatoAccount, assertFreeBlotatoReservation } from './calendar-slot'
import { listBlotatoSchedules, remoteSlotCollision, scheduleMatches, type ScheduleRow } from './blotato-schedules'

type Expected = { id: string; at: string; draft_hash: string }
export type TimeEdit = { data_pubblicazione?: unknown; ora_pubblicazione?: unknown; dry_run?: boolean; expected_schedule?: Expected }
type Dependencies = { query: typeof q; transaction: typeof withTransaction; key: typeof getBlotatoKey; page: typeof getPinnedSubaccountId; fetch: typeof fetch; now: () => number }
const defaults: Dependencies = { query: q, transaction: withTransaction, key: getBlotatoKey, page: getPinnedSubaccountId, fetch, now: Date.now }
const base = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'
// Ordinamento delle chiavi per confrontare il contenuto, non l'ordine JSON.
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)]))
  return value
}
const draftHash = (draft: unknown) => createHash('sha256').update(JSON.stringify(canonical(draft))).digest('hex')

export async function changeCalendarTime(cid: string, id: string, edit: TimeEdit, deps = defaults) {
  const original = (await deps.query('SELECT * FROM calendario WHERE id = $1 AND cliente_id = $2', [id, cid]))[0]
  if (!original) throw new CalendarScheduleError('Contenuto non trovato.', 404)
  const client = (await deps.query('SELECT timezone FROM clienti WHERE id = $1', [cid]))[0]
  const timezone = String(client?.timezone || 'Europe/Rome')
  return deps.transaction(async query => {
    await lockCalendarChannel(query, cid, String(original.canale))
    const row = (await query('SELECT * FROM calendario WHERE id = $1 AND cliente_id = $2 FOR UPDATE', [id, cid]))[0]
    if (!row || row.canale !== original.canale) throw new CalendarScheduleError('Contenuto cambiato durante la modifica: ricarica il calendario.')
    if (row.blotato_status === 'published' || row.blotato_post_url || row.status === 'ARCHIVIATO' || row.status === 'PUBBLICATO' && !row.blotato_post_id) {
      throw new CalendarScheduleError('Contenuto già pubblicato o archiviato: orario protetto.')
    }
    if (row.publish_lock_id) throw new CalendarScheduleError('Invio in lavorazione: attendi la verifica, senza spostarlo o reinviarlo.')
    const unresolved = await query(`SELECT id FROM integration_events WHERE cliente_id = $1 AND provider = 'blotato' AND entity_id = $2
      AND ((event_type = 'post_submission' AND (status = 'processing' OR (status = 'processed' AND $3::boolean)))
        OR (event_type = 'schedule_time_update' AND status = 'processing')) LIMIT 1`, [cid, id, !row.blotato_post_id])
    if (unresolved.length) throw new CalendarScheduleError('Operazione remota con esito incerto: usa Verifica Blotato prima di modificare nuovamente.')
    const target = scheduleTarget(edit.data_pubblicazione ?? toYmd(row.data_pubblicazione), edit.ora_pubblicazione ?? String(row.ora_pubblicazione || '').slice(0, 5), timezone, deps.now())
    await assertFreeCalendarSlot(query, cid, id, String(row.canale), target.day, target.time)
    const remote = Boolean(row.blotato_post_id)
    if (!remote && row.blotato_status && !isLocalPreflightFailure(row)) throw new CalendarScheduleError('Stato remoto senza identificativo: verificare lo storico, non spostare o reinviare.')
    let schedule: ScheduleRow | null = null
    let expected: Expected | null = null
    let key: string | null = null
    if (remote) {
      if (row.blotato_status !== 'scheduled') throw new CalendarScheduleError('Invio non più programmato: verifica lo stato Blotato, nessun reinvio.')
      key = await deps.key(cid)
      if (!key) throw new CalendarScheduleError('API key Blotato non configurata: orario non modificato.', 503)
      const snapshot = (await query(`SELECT payload FROM integration_events WHERE cliente_id = $1 AND provider = 'blotato' AND event_type = 'post_submission'
        AND entity_id = $2 AND payload->>'submission_id' = $3 ORDER BY created_at DESC LIMIT 1`, [cid, id, row.blotato_post_id]))[0]?.payload as ScheduleRow | undefined
      const pageId = String((snapshot?.target as ScheduleRow | undefined)?.pageId || '') || await deps.page(cid, String(row.canale))
      await lockBlotatoAccount(query, String(row.platform_account_id), CANALE_TO_BLOTATO[String(row.canale)], pageId)
      await assertFreeBlotatoReservation(query, id, String(row.platform_account_id), CANALE_TO_BLOTATO[String(row.canale)], pageId, target.iso)
      const schedules = await listBlotatoSchedules(key, deps.fetch)
      const matches = schedules.filter(item => scheduleMatches(row, item, pageId))
      if (matches.length !== 1) throw new CalendarScheduleError(`Programmazione non identificata in modo univoco (${matches.length} corrispondenze). Orario non modificato; nessun reinvio.`)
      schedule = matches[0]
      if (!schedule.id || Date.parse(String(schedule.scheduledAt)) <= deps.now()) throw new CalendarScheduleError('Programmazione non più futura: nessuna modifica.')
      if (remoteSlotCollision(schedules, String(row.platform_account_id), CANALE_TO_BLOTATO[String(row.canale)], pageId, target.iso, String(schedule.id))) {
        throw new CalendarScheduleError('Slot già occupato in Blotato sullo stesso account/canale: scegli un altro orario.')
      }
      expected = { id: String(schedule.id), at: String(schedule.scheduledAt), draft_hash: draftHash(schedule.draft) }
      if (edit.dry_run !== true && (!edit.expected_schedule || Object.entries(expected).some(([k, v]) => edit.expected_schedule?.[k as keyof Expected] !== v))) {
        throw new CalendarScheduleError('La programmazione remota è cambiata oppure manca la simulazione: verifica e conferma di nuovo.')
      }
    }
    if (edit.dry_run === true) return { ok: true, dry_run: true, remote, target, timezone, expected_schedule: expected }
    let intentId: unknown = null
    if (schedule && key) {
      const headers = { 'blotato-api-key': key, 'Content-Type': 'application/json' }
      const read = async () => {
        const response = await deps.fetch(`${base}/v2/schedules/${encodeURIComponent(String(schedule.id))}`, { headers, cache: 'no-store', signal: AbortSignal.timeout(5000) })
        if (!response.ok) throw new CalendarScheduleError(`Programmazione non verificabile (HTTP ${response.status}). Nessun nuovo post.`, 502)
        const body = await response.json() as { schedule?: ScheduleRow }
        if (!body.schedule || String(body.schedule.id) !== String(schedule.id)) throw new CalendarScheduleError('Identificativo della programmazione diverso: operazione bloccata.', 502)
        return body.schedule
      }
      const current = await read()
      if (draftHash(current.draft) !== expected?.draft_hash || String(current.scheduledAt) !== expected?.at) throw new CalendarScheduleError('Testo o orario remoto cambiato: ripeti la verifica.')
      intentId = (await query(`INSERT INTO integration_events (cliente_id, provider, event_type, direction, status, entity_type, entity_id, payload)
        VALUES ($1, 'blotato', 'schedule_time_update', 'outbound', 'processing', 'calendario', $2, $3::jsonb) RETURNING id`,
        [cid, id, JSON.stringify({ submission_id: row.blotato_post_id, schedule_id: schedule.id, old_time: current.scheduledAt, scheduled_time: target.iso })]))[0]?.id
      if (!intentId) throw new CalendarScheduleError('Registro modifica non disponibile: nessuna richiesta remota.', 503)
      try {
        const response = await deps.fetch(`${base}/v2/schedules/${encodeURIComponent(String(schedule.id))}`, {
          method: 'PATCH', headers, body: JSON.stringify({ patch: { scheduledTime: target.iso } }), signal: AbortSignal.timeout(10000),
        })
        if (!response.ok) {
          if (response.status >= 400 && response.status < 500 && response.status !== 408) {
            await query("UPDATE integration_events SET status = 'failed', error_message = $1, processed_at = now() WHERE id = $2", [`Orario rifiutato: HTTP ${response.status}`, intentId])
          }
          throw new CalendarScheduleError(`Cambio orario Blotato HTTP ${response.status}. Nessun nuovo post creato.`, 502)
        }
        const verified = await read()
        if (Date.parse(String(verified.scheduledAt)) !== Date.parse(target.iso) || draftHash(verified.draft) !== expected?.draft_hash) {
          throw new CalendarScheduleError('Orario remoto non confermato o contenuto cambiato. Non reinviare: usa Verifica Blotato.', 502)
        }
      } catch (error) {
        // Non lanciare fuori dalla transazione: il ledger deve sopravvivere a
        // timeout/risposta incerta, mentre il vecchio orario locale resta tale.
        const note = error instanceof CalendarScheduleError ? error.message : 'Esito del cambio orario incerto: usa Verifica Blotato, non reinviare.'
        await query('UPDATE integration_events SET error_message = $1 WHERE id = $2', [note, intentId])
        return { ok: false, verification_pending: true, error: note, remote: true }
      }
    }
    const saved = await query(`UPDATE calendario SET data_pubblicazione = $1::date, ora_pubblicazione = $2::time,
      blotato_scheduled_at = CASE WHEN $3::boolean THEN $4::timestamptz ELSE blotato_scheduled_at END,
      errore_tecnico = CASE WHEN $5::boolean THEN NULL ELSE errore_tecnico END,
      blotato_status = CASE WHEN $5::boolean THEN NULL ELSE blotato_status END,
      blotato_sync_at = CASE WHEN $3::boolean THEN now() ELSE blotato_sync_at END, updated_at = now()
      WHERE id = $6 AND cliente_id = $7 RETURNING id`, [target.day, target.time, remote, target.iso, isLocalPreflightFailure(row), id, cid])
    if (!saved.length) throw new CalendarScheduleError('Orario locale non salvato.', 503)
    if (intentId) await query("UPDATE integration_events SET status = 'processed', processed_at = now(), error_message = NULL WHERE id = $1", [intentId])
    return { ok: true, remote, verified: remote, target, timezone, expected_schedule: expected }
  })
}
