import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { folderGroupKey, parseCampaignFolderFile } from './campaign-folder'

test('reads week, social, format, content and frame from an SWA campaign path', () => {
  const parsed = parseCampaignFolderFile({
    name: 'REEL_01_FRAME_03.png',
    relativePath: 'Mese_02/Settimana_01/Instagram/Reel/Reel_01/REEL_01_FRAME_03.png',
    type: 'image/png',
  })

  assert.deepEqual(parsed.errors, [])
  assert.equal(parsed.week, 1)
  assert.equal(parsed.platform, 'instagram')
  assert.equal(parsed.tag, 'reel')
  assert.equal(parsed.contentKey, 'reel_01')
  assert.equal(parsed.sequence, 3)
  assert.equal(folderGroupKey(parsed), '1:instagram:reel:reel_01')
})

test('accepts Italian aliases and Facebook abbreviation', () => {
  const parsed = parseCampaignFolderFile({
    name: 'slide-02.jpg',
    relativePath: 'SETTIMANA 2/FB/CAROSELLI/CAROUSEL 03/slide-02.jpg',
    type: 'image/jpeg',
  })

  assert.deepEqual(parsed.errors, [])
  assert.equal(parsed.week, 2)
  assert.equal(parsed.platform, 'facebook')
  assert.equal(parsed.tag, 'carosello')
  assert.equal(parsed.contentKey, 'carosello_03')
  assert.equal(parsed.sequence, 2)
})

test('reads the strategy phase folders used by the real Presence campaign', () => {
  const parsed = parseCampaignFolderFile({
    name: 'REEL_15_COVER.png',
    relativePath: 'PRESENZA_Campagna_Mese_04_Bowling/04_PRESENZA_Per_Strategia/Facebook/04_AZIONE/REEL_15_UGC_COSA_FACCIAMO_STASERA/REEL_15_COVER.png',
    type: 'image/png',
  })

  assert.deepEqual(parsed.errors, [])
  assert.equal(parsed.week, 4)
  assert.equal(parsed.platform, 'facebook')
  assert.equal(parsed.contentKey, 'reel_15')
  assert.equal(parsed.sequence, 0)
})

test('marks ambiguous media as blocked instead of guessing', () => {
  const parsed = parseCampaignFolderFile({
    name: 'foto-finale.png',
    relativePath: 'Mese_02/immagini/foto-finale.png',
    type: 'image/png',
  })

  assert.equal(parsed.errors.length, 4)
  assert.equal(parsed.tag, 'auto')
})

test('ignores strategy documents as unsupported media', () => {
  const parsed = parseCampaignFolderFile({
    name: 'STRATEGIA.md',
    relativePath: 'Mese_02/STRATEGIA.md',
    type: 'text/markdown',
  })

  assert.equal(parsed.kind, 'unsupported')
  assert.deepEqual(parsed.errors, [])
})
