import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { q, withTransaction } from './db'
import { changeCalendarTime } from './blotato-reschedule'
import { applyBlotatoCallback } from './blotato-webhook'
import { scheduleTarget } from './calendar-slot'
import { listBlotatoSchedules } from './blotato-schedules'
import { matchesCalendarFilter } from './calendar-filters'
import { publicationSummary } from './blotato-lifecycle'
import { reconcileClienteBlotato } from './blotato-reconcile'

const NOW = Date.parse('2026-10-09T10:00:00Z')
type Row = Record<string, unknown>
function fixture(options: { collision?: boolean; failedVerify?: boolean; timeout?: boolean; foreign?: boolean; duplicate?: boolean; remoteCollision?: boolean } = {}) {
  const row: Row = { id: 'post-1', cliente_id: 'client-1', id_contenuto: 'IG_1', canale: 'instagram', formato: 'post', status: 'PUBBLICATO',
    blotato_status: 'scheduled', blotato_post_id: 'submission-original', platform_account_id: 'account-1', hook: 'Un hook.',
    data_pubblicazione: '2026-10-10', ora_pubblicazione: '19:00', blotato_scheduled_at: '2026-10-10T17:00:00Z', link_media_1: 'https://source/image.jpg' }
  const draft = { accountId: 'account-1', target: { targetType: 'instagram' }, content: { platform: 'instagram', text: 'Un hook. Caption', mediaUrls: [row.link_media_1] } }
  let at = '2026-10-10T17:00:00Z'
  const requests: Array<{ url: string; method: string; body?: string }> = []
  const events: Array<{ sql: string; args: unknown[] }> = []
  const query: typeof q = async (sql, args = []) => {
    events.push({ sql, args })
    if (sql.includes('SELECT timezone')) return [{ timezone: 'Europe/Rome' }]
    if (sql.startsWith('SELECT * FROM calendario WHERE id')) return options.foreign ? [] : [row]
    if (sql.startsWith('SELECT id_contenuto')) return options.collision ? [{ id_contenuto: 'IG_2' }] : []
    if (sql.includes('SELECT payload')) return []
    if (sql.includes('INSERT INTO integration_events')) return [{ id: 'event-1' }]
    if (sql.startsWith('UPDATE calendario SET data_pubblicazione')) {
      row.data_pubblicazione = args[0]; row.ora_pubblicazione = args[1]; row.blotato_scheduled_at = args[3]
      return [{ id: row.id }]
    }
    return []
  }
  const transaction: typeof withTransaction = async work => work(query)
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input); const method = init?.method || 'GET'
    requests.push({ url, method, body: init?.body as string | undefined })
    if (url.includes('/v2/schedules?')) {
      const schedule = { id: 'schedule-different-id', scheduledAt: at, draft }
      return Response.json({ items: [schedule, ...(options.duplicate ? [{ ...schedule, id: 'other' }] : []),
        ...(options.remoteCollision ? [{ ...schedule, id: 'slot-taken', scheduledAt: '2026-10-10T18:00:00Z' }] : [])] })
    }
    assert.ok(url.endsWith('/v2/schedules/schedule-different-id'))
    if (method === 'PATCH') {
      assert.deepEqual(JSON.parse(String(init?.body)), { patch: { scheduledTime: '2026-10-10T18:00:00.000Z' } })
      if (options.timeout) throw new Error('timeout')
      if (!options.failedVerify) at = '2026-10-10T18:00:00.000Z'
      return new Response(null, { status: 204 })
    }
    return Response.json({ schedule: { id: 'schedule-different-id', scheduledAt: at, draft } })
  }
  const deps = { query, transaction, key: async () => 'test-only-key', page: async () => '', fetch: fetcher, now: () => NOW }
  return { row, requests, events, deps, draft }
}
const edit = { data_pubblicazione: '2026-10-10', ora_pubblicazione: '20:00' }

test('time preview does not write or POST; confirmation patches SAME schedule and verifies before local save', async () => {
  const f = fixture()
  const preview = await changeCalendarTime('client-1', 'post-1', { ...edit, dry_run: true }, f.deps)
  assert.equal(f.row.ora_pubblicazione, '19:00')
  assert.equal(f.events.some(e => e.sql.startsWith('UPDATE calendario')), false)
  const saved = await changeCalendarTime('client-1', 'post-1', { ...edit, expected_schedule: preview.expected_schedule! }, f.deps)
  assert.equal(saved.ok, true); assert.equal(saved.verified, true)
  assert.equal(f.row.ora_pubblicazione, '20:00'); assert.equal(f.row.blotato_post_id, 'submission-original')
  assert.equal(f.requests.filter(r => r.method === 'PATCH').length, 1)
  assert.equal(f.requests.filter(r => r.method === 'POST').length, 0)
  assert.deepEqual(f.draft.content.mediaUrls, ['https://source/image.jpg'])
})
for (const mode of ['failedVerify', 'timeout'] as const) test(`uncertain reschedule (${mode}) never pretends success or changes local time`, async () => {
  const f = fixture({ [mode]: true })
  const preview = await changeCalendarTime('client-1', 'post-1', { ...edit, dry_run: true }, f.deps)
  const saved = await changeCalendarTime('client-1', 'post-1', { ...edit, expected_schedule: preview.expected_schedule! }, f.deps)
  assert.equal(saved.ok, false); assert.equal(saved.verification_pending, true)
  assert.equal(f.row.ora_pubblicazione, '19:00')
  assert.ok(f.events.some(e => e.sql.includes('UPDATE integration_events SET error_message')))
})
test('missing preview, local/remote occupied slot, duplicate mapping and wrong tenant all block before PATCH', async () => {
  for (const options of [{}, { collision: true }, { remoteCollision: true }, { duplicate: true }, { foreign: true }]) {
    const f = fixture(options)
    await assert.rejects(changeCalendarTime('client-1', 'post-1', edit, f.deps))
    assert.equal(f.requests.some(r => r.method !== 'GET'), false)
    assert.equal(f.row.ora_pubblicazione, '19:00')
  }
})
test('published and in-progress posts are never rescheduled', async () => {
  for (const remote of ['published', 'in-progress']) {
    const f = fixture(); f.row.blotato_status = remote
    await assert.rejects(changeCalendarTime('client-1', 'post-1', { ...edit, dry_run: true }, f.deps))
    assert.equal(f.requests.length, 0)
  }
})
test('date validation rejects impossible/ambiguous DST and past slots; Rome conversion is correct', () => {
  assert.equal(scheduleTarget('2026-10-10', '20:00', 'Europe/Rome', NOW).iso, '2026-10-10T18:00:00.000Z')
  for (const [day, time] of [['2026-02-30', '20:00'], ['2026-03-29', '02:30'], ['2026-10-25', '02:30'], ['2026-10-08', '20:00'], ['2026-10-10', '25:00']]) {
    assert.throws(() => scheduleTarget(day, time, 'Europe/Rome', NOW))
  }
})
test('schedule listing rejects incomplete/repeating pagination, never silently drops the remainder', async () => {
  await assert.rejects(listBlotatoSchedules('test', async () => Response.json({ items: [], cursor: 'same' })), /paginazione/)
  await assert.rejects(listBlotatoSchedules('test', async () => Response.json({ items: null })), /incompleta/)
})

test('webhook is monotonic, duplicate callbacks do not duplicate logs, and unknown IDs never match by time', async () => {
  const row: Row = { id: 'post-1', cliente_id: 'client-1', canale: 'instagram', blotato_status: 'scheduled', blotato_post_id: 'original' }
  let logs = 0
  const query: typeof q = async (sql, args = []) => {
    if (sql.startsWith('SELECT *')) return args[0] === 'original' ? [row] : []
    if (sql.startsWith('UPDATE calendario')) { row.blotato_status = args[0]; row.blotato_post_url = args[1]; assert.equal(args[4], 'client-1') }
    if (sql.startsWith('INSERT INTO log')) logs++
    return []
  }
  const tx: typeof withTransaction = async work => work(query)
  assert.equal((await applyBlotatoCallback({ id: 'original', status: 'published', post_url: 'https://instagram.com/p/test' }, tx)).ignored, false)
  for (const status of ['published', 'scheduled', 'failed']) assert.equal((await applyBlotatoCallback({ id: 'original', status }, tx)).ignored, true)
  assert.equal(row.blotato_status, 'published'); assert.equal(logs, 1)
  await assert.rejects(applyBlotatoCallback({ id: 'wrong', status: 'published', scheduled_at: '2026-10-09T11:00Z' }, tx), /non trovato/)
})
test('state card predicates separate ready, queued, confirmed and errors including manual errors', () => {
  const rows = [{ status: 'APPROVATO' }, { status: 'PUBBLICATO', blotato_status: 'scheduled', blotato_post_id: 's1' },
    { status: 'PUBBLICATO', blotato_status: 'published', blotato_post_id: 's2' }, { status: 'ERRORE_MANUALE' }]
  assert.equal(rows.filter(r => matchesCalendarFilter(r, 'APPROVATO')).length, 1)
  assert.equal(rows.filter(r => matchesCalendarFilter(r, 'IN_CODA')).length, 1)
  assert.equal(rows.filter(r => matchesCalendarFilter(r, 'PUBBLICATO')).length, 1)
  assert.equal(rows.filter(r => matchesCalendarFilter(r, 'ERRORI')).length, 1)
  assert.equal(publicationSummary(rows, 24).published, 1)
})

test('reconcile confirms original submission via GET only and discards a concurrent time edit', async () => {
  for (const concurrent of [false, true]) {
    const row: Row = { id: '1', canale: 'instagram', status: 'PUBBLICATO', blotato_status: 'scheduled', blotato_post_id: 'original', data_pubblicazione: '2026-10-10', blotato_scheduled_at: '2026-10-10T17:00Z' }
    const query: typeof q = async (sql, args = []) => {
      if (sql.includes('SELECT contenuti_mese')) return [{ timezone: 'Europe/Rome', contenuti_mese: 24 }]
      if (sql.includes('NULLIF(btrim')) return [row]
      if (sql.includes('SELECT * FROM calendario')) return [row]
      if (sql.includes('pg_try_advisory')) return [{ locked: true }]
      if (sql.includes('INSERT INTO integration_events')) return [{ id: 'event' }]
      if (sql.startsWith('WITH changed')) {
        assert.ok(sql.includes('blotato_scheduled_at IS NOT DISTINCT FROM $12'))
        assert.equal(args[8], 'original')
        if (concurrent) return []
        row.blotato_status = args[0]; return [{ id: '1' }]
      }
      return []
    }
    const transaction: typeof withTransaction = async work => work(query)
    const fetcher: typeof fetch = async (url, init) => {
      assert.ok(String(url).endsWith('/v2/posts/original')); assert.equal(init?.method, 'GET')
      return Response.json({ postSubmissionId: 'original', status: 'published', publicUrl: 'https://instagram.com/p/test' })
    }
    const result = await reconcileClienteBlotato('client-1', '2026-10', { query, transaction, key: async () => 'test', fetch: fetcher, now: () => NOW })
    assert.equal(result.reconciled, concurrent ? 0 : 1)
    assert.equal(result.ok, !concurrent)
  }
})
