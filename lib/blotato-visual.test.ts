import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import {
  createPhotoReel,
  PHOTO_REEL_TEMPLATE_ID,
  PHOTO_REEL_TEMPLATE_UUID,
  selectPhotoReelTemplateId,
} from './blotato-visual'

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
