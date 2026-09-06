import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { buildContentSeriesContext } from './content-series'

test('a four-item manual batch follows the full editorial funnel', () => {
  const phases = [1, 2, 3, 4].map(position => buildContentSeriesContext({
    id: 'fashion-test',
    position,
    total: 4,
    formats: ['post', 'carousel', 'reel', 'story'],
    format: ['post', 'carousel', 'reel', 'story'][position - 1],
  })?.phase)

  assert.deepEqual(phases, ['ATTENZIONE', 'FIDUCIA', 'SCELTA', 'AZIONE'])
})

test('series items share id and theme while keeping their own positions', () => {
  const first = buildContentSeriesContext({ id: 'fashion-123', position: 1, total: 2, formats: ['post', 'reel'], format: 'post', theme: 'Nuova collezione lino' })
  const second = buildContentSeriesContext({ id: 'fashion-123', position: 2, total: 2, formats: ['post', 'reel'], format: 'reel', theme: 'Nuova collezione lino' })

  assert.equal(first?.id, second?.id)
  assert.equal(first?.theme, 'Nuova collezione lino')
  assert.equal(second?.position, 2)
})

test('invalid series metadata does not create an accidental group', () => {
  assert.equal(buildContentSeriesContext({ id: '', position: 1, total: 4, formats: [], format: 'post' }), null)
  assert.equal(buildContentSeriesContext({ id: 'single', position: 1, total: 1, formats: ['post'], format: 'post' }), null)
})
