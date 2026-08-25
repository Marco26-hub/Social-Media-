import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { imageVideoDurationInSeconds, remotionSourceHash } from './remotion-renderer'

test('image video duration always ends on a full visible frame', () => {
  assert.equal(imageVideoDurationInSeconds(1), 8)
  assert.equal(imageVideoDurationInSeconds(5), 15)
  assert.equal(imageVideoDurationInSeconds(10), 20)
})

test('custom audio participates in the deterministic Remotion render identity', () => {
  const base = { mediaUrls: ['https://example.com/slide.jpg'] }
  const first = remotionSourceHash({ ...base, audioUrl: 'https://example.com/track-a.mp3' })
  const same = remotionSourceHash({ ...base, audioUrl: 'https://example.com/track-a.mp3' })
  const other = remotionSourceHash({ ...base, audioUrl: 'https://example.com/track-b.mp3' })

  assert.equal(first, same)
  assert.notEqual(first, other)

  const trending = remotionSourceHash({ ...base, audioUrl: 'https://example.com/track-a.mp3', motionPreset: 'trending' })
  assert.notEqual(first, trending)
})

test('copy, logo and brand participate in the deterministic render identity', () => {
  const mediaUrls = ['https://example.com/frame.jpg']
  const base = remotionSourceHash({ mediaUrls, hook: 'Hook A', cta: 'Prenota ora', brandName: 'Brand A' })
  assert.notEqual(remotionSourceHash({ mediaUrls, hook: 'Hook B', cta: 'Prenota ora', brandName: 'Brand A' }), base)
  assert.notEqual(remotionSourceHash({ mediaUrls, hook: 'Hook A', cta: 'Scrivici', brandName: 'Brand A' }), base)
  assert.notEqual(remotionSourceHash({ mediaUrls, hook: 'Hook A', cta: 'Prenota ora', brandName: 'Brand B' }), base)
  assert.notEqual(remotionSourceHash({ mediaUrls, hook: 'Hook A', cta: 'Prenota ora', brandName: 'Brand A', logoUrl: 'https://example.com/logo.png' }), base)
})
