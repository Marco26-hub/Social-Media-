import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { BUSINESS_CATEGORIES } from './business-categories'
import {
  applyEditorialContentDirection,
  createEditorialContentDirections,
  isPlaceholderEditorialText,
} from './editorial-content-direction'
import { resolveStrategyProfile, STRATEGY_PROFILES } from './strategy-profiles'

function bowlingSlots() {
  const formats = ['reel', 'reel', 'carousel', 'post', 'story', 'reel']
  return Array.from({ length: 24 }, (_, index) => ({
    contentKey: `${formats[index % formats.length]}_${String(index + 1).padStart(2, '0')}`,
    channel: index % 2 ? 'facebook' : 'instagram',
    format: formats[index % formats.length],
    week: Math.floor(index / 6) + 1,
  }))
}

test('a 24-content Growth plan receives one distinct editorial and visual direction per concept', () => {
  const directions = createEditorialContentDirections({
    creativeCode: 'SWA-202609-TEST',
    category: BUSINESS_CATEGORIES['social-media-agency'],
    profile: STRATEGY_PROFILES['bowling-case-study'],
    slots: bowlingSlots(),
  })

  assert.equal(directions.length, 24)
  assert.equal(new Set(directions.map(item => item.directionKey)).size, 24)
  assert.equal(new Set(directions.map(item => item.visualSignature)).size, 24)
  assert.deepEqual(
    [...new Set(directions.map(item => item.funnelStage))],
    ['ATTENZIONE', 'FIDUCIA', 'SCELTA', 'AZIONE'],
  )
  assert.ok(directions.every(item => /gestore|SWA|bowling|regia|calendario|editor/i.test(item.visualBrief)))
})

test('coordinated social variants share the concept but receive channel-specific directions', () => {
  const directions = createEditorialContentDirections({
    creativeCode: 'SWA-202609-PAIR',
    category: BUSINESS_CATEGORIES['social-media-agency'],
    profile: STRATEGY_PROFILES['bowling-case-study'],
    slots: [
      { contentKey: 'reel_01', channel: 'instagram', format: 'reel', week: 1 },
      { contentKey: 'reel_01', channel: 'facebook', format: 'reel', week: 1 },
    ],
  })

  assert.equal(directions[0].conceptKey, directions[1].conceptKey)
  assert.equal(directions[0].visualSignature, directions[1].visualSignature)
  assert.notEqual(directions[0].directionKey, directions[1].directionKey)
  assert.notEqual(directions[0].platformInstruction, directions[1].platformInstruction)
})

test('generation leftovers are replaced by the assigned direction, never persisted as themes', () => {
  const [direction] = createEditorialContentDirections({
    creativeCode: 'SWA-202609-CLEAN',
    category: BUSINESS_CATEGORIES['social-media-agency'],
    profile: STRATEGY_PROFILES['swa-services'],
    slots: [{ contentKey: 'post_01', channel: 'instagram', format: 'post', week: 2 }],
  })
  const item = applyEditorialContentDirection({ tema: 'Slot del piano da completare' }, direction)

  assert.equal(isPlaceholderEditorialText('Slot del piano da completare'), true)
  assert.equal(isPlaceholderEditorialText(item.tema), false)
  assert.equal(item.tema, direction.themeSeed)
  assert.equal(item.idea_visual, direction.visualBrief)
  assert.equal(item.funnel_stage, 'FIDUCIA')
})

test('separate phase runs cannot reuse the same visual identity when their local counters restart', () => {
  const common = {
    creativeCode: 'SWA-202609-PHASES',
    category: BUSINESS_CATEGORIES['social-media-agency'],
    profile: STRATEGY_PROFILES['bowling-case-study'],
  }
  const [phaseOne] = createEditorialContentDirections({
    ...common,
    slots: [{ contentKey: 'reel_01', channel: 'instagram', format: 'reel', week: 1 }],
  })
  const [phaseTwo] = createEditorialContentDirections({
    ...common,
    slots: [{ contentKey: 'reel_07', channel: 'instagram', format: 'reel', week: 3 }],
  })

  assert.notEqual(phaseOne.conceptKey, phaseTwo.conceptKey)
  assert.notEqual(phaseOne.visualSignature, phaseTwo.visualSignature)
})

test('a Bowling case-study folder overrides the generic agency profile automatically', () => {
  const profile = resolveStrategyProfile('auto', {
    sector: 'Agenzia social media e automazione',
    brandName: 'SWA',
    campaignContext: 'CRESCITA_Campagna_Mese_04_CASO_STUDIO_BOWLING_SWA/04_CRESCITA_Per_Strategia',
  })

  assert.equal(profile.id, 'bowling-case-study')
})
