import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { hasFinalCampaignAsset, requiresRenderedVisualReview } from './publish/visual-review'

test('final campaign assets do not require a second approval after rendering', () => {
  assert.equal(hasFinalCampaignAsset({ campaign_content_key: 'story_03' }), true)
  assert.equal(hasFinalCampaignAsset({ campaign_source_paths: ['STORY_03/SCENA_01.png'] }), true)
  assert.equal(hasFinalCampaignAsset({ campaign_source_paths: '["REEL_01/SCENA_01.png"]' }), true)
  assert.equal(requiresRenderedVisualReview({ campaign_content_key: 'reel_01' }), false)
})

test('generated visuals retain the explicit second approval gate', () => {
  assert.equal(hasFinalCampaignAsset({}), false)
  assert.equal(hasFinalCampaignAsset({ campaign_source_paths: [] }), false)
  assert.equal(hasFinalCampaignAsset({ campaign_source_paths: '[]' }), false)
  assert.equal(requiresRenderedVisualReview({}), true)
})

test('an unreadable campaign_source_paths closes the gate instead of opening it', () => {
  // Questo valore decide se un montaggio puo essere pubblicato senza che nessuno
  // lo guardi. Un dato corrotto veniva scambiato per "asset finale gia
  // approvato" e il video usciva senza revisione: deve valere il contrario.
  for (const rotto of ['{non-json', 'undefined', '{"a":', '<xml/>']) {
    assert.equal(hasFinalCampaignAsset({ campaign_source_paths: rotto }), false, rotto)
    assert.equal(requiresRenderedVisualReview({ campaign_source_paths: rotto }), true, rotto)
  }
})
