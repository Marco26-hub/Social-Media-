import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import {
  buildEditorialHistoryContext,
  createMonthlyCreativeDirection,
  findCreativeNearDuplicate,
  isCoordinatedCrossPlatformVariant,
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

test('two campaigns in the same month receive different creative DNA', () => {
  const base = { clienteId: 'client-1', startISO: '2026-08-01', brandName: 'SWA' }
  const first = createMonthlyCreativeDirection({ ...base, campaignKey: 'c00000001' })
  const second = createMonthlyCreativeDirection({ ...base, campaignKey: 'c00000002' })

  assert.notEqual(first.code, second.code)
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

test('coordinated platform variants do not count as duplicate creatives', () => {
  const instagram = {
    content_key: 'reel_01',
    canale: 'instagram',
    hook: 'Il suono che accende la notte',
  }
  const facebook = {
    content_key: 'reel_01',
    canale: 'facebook',
    hook: 'Il suono che accende la notte',
  }
  const anotherInstagramContent = {
    content_key: 'reel_10',
    canale: 'instagram',
    hook: 'Il suono che accende la notte',
  }

  assert.equal(isCoordinatedCrossPlatformVariant(instagram, facebook), true)
  assert.equal(isCoordinatedCrossPlatformVariant(instagram, anotherInstagramContent), false)
  assert.ok(findCreativeNearDuplicate(anotherInstagramContent, [instagram]))
})
