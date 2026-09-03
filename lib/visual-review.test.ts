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

test('un montaggio non si ferma per una seconda approvazione', () => {
  // Si approva una volta sola, guardando l'anteprima: da li il contenuto va a
  // Blotato da solo. Il gate precedente rimandava il video in DA_APPROVARE e i
  // contenuti restavano fermi a meta strada senza segnalarlo. Se il render
  // fallisce il contenuto finisce in ERRORE, non in attesa di approvazione.
  assert.equal(requiresRenderedVisualReview({}), false)
  assert.equal(requiresRenderedVisualReview({ campaign_content_key: 'reel_01' }), false)
  assert.equal(requiresRenderedVisualReview({ campaign_source_paths: ['REEL_01/SCENA_01.png'] }), false)
  assert.equal(requiresRenderedVisualReview({ campaign_source_paths: '{corrotto' }), false)
})
