import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { preflightRow } from './publish/preflight'

const baseStory = {
  formato: 'story',
  hook: 'Una storia',
  data_pubblicazione: '2099-08-31',
  ora_pubblicazione: '20:00',
  link_media_1: 'https://example.com/frame-01.png',
  reel_audio_url: 'https://example.com/audio.mp3',
}

test('Instagram Story from images is accepted and marked for MP4 rendering', () => {
  const result = preflightRow({ ...baseStory, canale: 'instagram' })

  assert.equal(result.ok, true)
  assert.ok(result.warnings.some(warning => /MP4 verticale/.test(warning)))
})

test('Facebook Story is accepted as a Reel video adaptation', () => {
  const result = preflightRow({ ...baseStory, canale: 'facebook' })

  assert.equal(result.ok, true)
  assert.ok(result.warnings.some(warning => /Reel video/.test(warning)))
})
