import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import {
  buildEditorialHistoryContext,
  createMonthlyCreativeDirection,
  findCreativeNearDuplicate,
} from './editorial-variation'

test('monthly creative DNA is stable inside a month and changes the following month', () => {
  const augustA = createMonthlyCreativeDirection({ clienteId: 'client-1', brandName: 'Brand', startISO: '2026-08-01' })
  const augustB = createMonthlyCreativeDirection({ clienteId: 'client-1', brandName: 'Brand', startISO: '2026-08-29' })
  const september = createMonthlyCreativeDirection({ clienteId: 'client-1', brandName: 'Brand', startISO: '2026-09-01' })

  assert.equal(augustA.code, augustB.code)
  assert.notEqual(augustA.code, september.code)
  assert.notEqual(augustA.narrative, september.narrative)
  assert.match(augustA.context, /MONTHLY_DNA/)
  assert.match(augustA.context, /identita del brand restano stabili/i)
})

test('history context remembers creative angles and visual direction, not only hooks', () => {
  const context = buildEditorialHistoryContext([{
    hook: 'La serata cambia quando parte la sfida',
    tema: 'serata tra amici',
    angle: 'rituale di gruppo',
    idea_visual: 'inquadratura soggettiva sulla pista',
    formato: 'reel',
    canale: 'instagram',
  }])

  assert.match(context, /GATE ANTI-CLONE/)
  assert.match(context, /rituale di gruppo/)
  assert.match(context, /inquadratura soggettiva/)
  assert.match(context, /reel\/instagram/)
})

test('novelty gate detects an exact or substantially repeated creative', () => {
  const previous = [{
    hook: 'La serata cambia quando parte la sfida',
    tema: 'bowling tra amici',
    angle: 'rituale di gruppo',
    primary_message: 'trasforma una sera normale in una sfida memorabile',
  }]

  assert.ok(findCreativeNearDuplicate({ ...previous[0] }, previous))
  assert.equal(findCreativeNearDuplicate({
    hook: 'Tre dettagli che cambiano il tuo lancio',
    tema: 'tecnica di bowling',
    angle: 'tutorial pratico',
    primary_message: 'posizione del polso e rilascio della palla',
  }, previous), null)
})
