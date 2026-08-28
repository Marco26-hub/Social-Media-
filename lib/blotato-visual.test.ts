import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import {
  AUDIO_MIX_TEMPLATE_UUID,
  createAudioMixedVideo,
  createPhotoReel,
  PHOTO_REEL_TEMPLATE_ID,
  PHOTO_REEL_TEMPLATE_UUID,
  selectPhotoReelTemplateId,
} from './blotato-visual'

test('createAudioMixedVideo sends exact video and audio URLs to Combine Clips', async () => {
  const originalFetch = globalThis.fetch
  let requestBody: Record<string, unknown> = {}

  try {
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>
      return new Response(JSON.stringify({ item: { id: 'audio-visual-123', status: 'queueing' } }), { status: 201 })
    }) as typeof fetch

    const result = await createAudioMixedVideo({
      blotatoKey: 'test-key',
      videoUrl: 'https://example.com/reel.mp4',
      audioUrl: 'https://example.com/music.mp3',
      title: 'Pixabay 12345',
    })

    assert.equal(result.id, 'audio-visual-123')
    assert.equal(requestBody.templateId, AUDIO_MIX_TEMPLATE_UUID)
    assert.match(String(requestBody.prompt), /https:\/\/example\.com\/reel\.mp4/)
    assert.match(String(requestBody.prompt), /https:\/\/example\.com\/music\.mp3/)
    assert.equal(requestBody.render, true)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('selectPhotoReelTemplateId prefers the exact catalog ID', () => {
  const catalogId = `/base/v2/image-slideshow/${PHOTO_REEL_TEMPLATE_UUID}/v1`
  const selected = selectPhotoReelTemplateId({
    items: [
      { id: '/base/v2/quote-card/example/v1', title: 'Quote Card' },
      { id: catalogId, title: 'Image Slideshow with Text Overlays' },
    ],
  })

  assert.equal(selected, catalogId)
})

test('selectPhotoReelTemplateId supports wrapped and bare UUID catalogs', () => {
  const selected = selectPhotoReelTemplateId({
    data: [
      {
        id: PHOTO_REEL_TEMPLATE_UUID,
        name: 'Image Slideshow with Text Overlays',
      },
    ],
  })

  assert.equal(selected, PHOTO_REEL_TEMPLATE_UUID)
})

test('createPhotoReel submits the ID returned by the live template catalog', async () => {
  const originalFetch = globalThis.fetch
  const catalogId = `${PHOTO_REEL_TEMPLATE_ID}?revision=current`
  const requests: Array<{ url: string; init?: RequestInit }> = []

  try {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      requests.push({ url, init })
      if (url.includes('/v2/videos/templates?')) {
        return new Response(JSON.stringify({
          items: [{ id: catalogId, title: 'Image Slideshow with Text Overlays' }],
        }), { status: 200 })
      }
      return new Response(JSON.stringify({ item: { id: 'visual-123', status: 'queueing' } }), {
        status: 201,
      })
    }) as typeof fetch

    const result = await createPhotoReel({
      blotatoKey: 'test-key',
      imageUrls: ['https://example.com/cover.jpg'],
      overlays: ['Titolo'],
      prompt: 'Crea un reel immobiliare',
    })

    assert.equal(result.id, 'visual-123')
    assert.equal(requests.length, 2)
    const body = JSON.parse(String(requests[1].init?.body))
    assert.equal(body.templateId, catalogId)
    assert.deepEqual(body.inputs.slides, [{
      imageSource: 'https://example.com/cover.jpg',
      textOverlay: 'Titolo',
    }])
  } finally {
    globalThis.fetch = originalFetch
  }
})
