import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { hasFinalCampaignAsset, requiresRenderedVisualReview } from './publish/visual-review'

test('campaign folder media are recognised as final creatives', () => {
  // Serve al RENDER: su un asset gia impaginato non si ridisegnano hook e CTA.
  assert.equal(hasFinalCampaignAsset({ campaign_content_key: 'story_03' }), true)
  assert.equal(hasFinalCampaignAsset({ campaign_source_paths: ['STORY_03/SCENA_01.png'] }), true)
  assert.equal(hasFinalCampaignAsset({ campaign_source_paths: '["REEL_01/SCENA_01.png"]' }), true)
})

test('generated visuals are not treated as final creatives', () => {
  assert.equal(hasFinalCampaignAsset({}), false)
  assert.equal(hasFinalCampaignAsset({ campaign_source_paths: [] }), false)
  assert.equal(hasFinalCampaignAsset({ campaign_source_paths: '[]' }), false)
})

test('an unreadable campaign_source_paths is not taken for a final creative', () => {
  for (const rotto of ['{non-json', 'undefined', '{"a":', '<xml/>']) {
    assert.equal(hasFinalCampaignAsset({ campaign_source_paths: rotto }), false, rotto)
  }
})

test('every rendered montage requires a human review before publishing', () => {
  // Regola non negoziabile: il montaggio e un artefatto NUOVO — movimento,
  // transizioni, durata, audio — e nessuno lo pubblica senza averlo visto.
  // Vale anche per i media di una cartella campagna gia approvata: le
  // creativita di partenza sono approvate, il video che ne esce no.
  assert.equal(requiresRenderedVisualReview({}), true)
  assert.equal(requiresRenderedVisualReview({ campaign_content_key: 'reel_01' }), true)
  assert.equal(requiresRenderedVisualReview({ campaign_source_paths: ['REEL_01/SCENA_01.png'] }), true)
  assert.equal(requiresRenderedVisualReview({ campaign_source_paths: '{corrotto' }), true)
})
