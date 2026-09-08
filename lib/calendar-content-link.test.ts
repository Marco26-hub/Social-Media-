import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { calendarContentHref } from './calendar-content-link'

test('builds a calendar deep link that filters and opens the generated content', () => {
  assert.equal(calendarContentHref(' UGC Instagram 01 '),
    '/dashboard/calendario?filter=tutti&q=UGC+Instagram+01&open=UGC+Instagram+01',
  )
})

test('keeps the calendar link valid when the content id is missing', () => {
  assert.equal(calendarContentHref('  '), '/dashboard/calendario?filter=tutti')
})
