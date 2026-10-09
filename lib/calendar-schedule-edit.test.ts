import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { editableSchedule, validatedScheduleTime, matchesSchedule } from './calendar-schedule-edit'

test('editor protects published, processing and archived posts, but legacy queued status is editable', () => {
  assert.equal(editableSchedule({ status: 'DA_APPROVARE' }), true)
  assert.equal(editableSchedule({ status: 'PUBBLICATO', blotato_status: 'scheduled' }), true)
  assert.equal(editableSchedule({ status: 'APPROVATO', blotato_status: 'published' }), false)
  assert.equal(editableSchedule({ status: 'APPROVATO', blotato_status: 'in-progress' }), false)
  assert.equal(editableSchedule({ status: 'PUBBLICATO' }), false)
  assert.equal(editableSchedule({ status: 'ARCHIVIATO', blotato_status: 'scheduled' }), false)
})
test('times validate dates and Rome daylight savings, without altering the day', () => {
  assert.equal(validatedScheduleTime('2026-10-09', '21:30', 'Europe/Rome'), '2026-10-09T19:30:00.000Z')
  assert.equal(validatedScheduleTime('2026-10-26', '21:30', 'Europe/Rome'), '2026-10-26T20:30:00.000Z')
  for (const [day, time] of [['2026-02-30', '21:30'], ['2026-10-09', '24:00'], ['2026-03-29', '02:30'], ['', '']]) {
    assert.throws(() => validatedScheduleTime(day, time, 'Europe/Rome'))
  }
})
test('schedule matching requires exact account, platform, page and media, never just copy', () => {
  const row = { platform_account_id: 'account', canale: 'facebook', hook: 'Hook.', link_media_1: 'https://swa/1.mp4' }
  const draft = { accountId: 'account', content: { platform: 'facebook', text: 'Hook. Caption.', mediaUrls: ['https://swa/1.mp4'] }, target: { pageId: 'page' } }
  assert.equal(matchesSchedule(row, { draft }, 'page'), true)
  assert.equal(matchesSchedule(row, { draft }, 'other-page'), false)
  assert.equal(matchesSchedule(row, { draft: { ...draft, accountId: 'other' } }, 'page'), false)
  assert.equal(matchesSchedule(row, { draft: { ...draft, content: { ...draft.content, mediaUrls: ['https://other/1.mp4'] } } }, 'page'), false)
  assert.equal(matchesSchedule(row, { draft: { ...draft, content: { ...draft.content, platform: 'instagram' } } }, 'page'), false)
})
