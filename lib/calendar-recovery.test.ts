import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { isLocalPreflightFailure, recoveryBlockReason, validRecoveryTarget } from './calendar-recovery'

const now = Date.parse('2026-10-05T18:00:00Z')
const row = { status: 'APPROVATO', data_pubblicazione: '2026-10-05', ora_pubblicazione: '19:00' }
const tz = 'Europe/Rome'

test('only approved overdue never sent items can be recovered', () => {
  assert.equal(recoveryBlockReason(row, tz, now), null)
  for (const status of ['PUBBLICATO', 'DA_APPROVARE', 'ERRORE', 'NON_APPROVATO']) assert.ok(recoveryBlockReason({ ...row, status }, tz, now))
  for (const day of ['2026-10-11', '2026-10-18']) assert.ok(recoveryBlockReason({ ...row, data_pubblicazione: day }, tz, now))
})

test('past scheduled posts and erased remote references must never be reset', () => {
  for (const protection of [
    { blotato_post_id: 'submission-id', blotato_status: 'scheduled' },
    { blotato_status: 'published' }, { blotato_status: 'scheduled' },
    { blotato_status: 'in-progress' }, { blotato_status: 'failed' },
    { blotato_post_url: 'https://instagram.com/p/example' },
    { blotato_scheduled_at: '2026-10-03T17:00:00Z' },
    { publish_lock_id: 'render-in-flight' }, { remote_reference_reset: true },
  ]) assert.ok(recoveryBlockReason({ ...row, ...protection }, tz, now))
})

test('only a local past-date preflight can be cleared, not a remote failure', () => {
  const local = { ...row, blotato_status: 'failed', errore_tecnico: 'Pre-flight Blotato: Data/ora nel passato (2026-10-05 19:00:00): Blotato rifiuta la programmazione' }
  assert.equal(isLocalPreflightFailure(local), true)
  assert.equal(recoveryBlockReason(local, tz, now), null)
  assert.equal(isLocalPreflightFailure({ ...local, blotato_post_id: 'remote-id' }), false)
  assert.equal(isLocalPreflightFailure({ ...local, errore_tecnico: 'Blotato: failed' }), false)
  assert.equal(isLocalPreflightFailure({ ...local, remote_reference_reset: true }), false)
})

test('requires an explicit valid future date/time in the client timezone', () => {
  assert.equal(validRecoveryTarget('2026-10-06', '21:00', tz, now), true)
  assert.equal(validRecoveryTarget('2026-10-05', '21:00', tz, now), true)
  for (const [day, time] of [['2026-10-05', '19:00'], ['2026-02-31', '21:00'], ['2026-10-06', '25:00'], ['', '21:00']]) assert.equal(validRecoveryTarget(day, time, tz, now), false)
})
