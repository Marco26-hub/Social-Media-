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
