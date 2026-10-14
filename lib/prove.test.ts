import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { CASES } from './prove'

test('CASES: i tre numeri della home, una sola fonte', () => {
  assert.deepEqual(CASES.map(c => [c.metric, c.unit]), [['24', 'contenuti'], ['3', 'progetti'], ['30', 'aziende']])
  assert.equal(new Set(CASES.map(c => c.title)).size, CASES.length)
  for (const c of CASES) assert.ok(c.href.startsWith('/'), c.href)
})
