import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { buildCreativeModeContext, normalizeCreativeMode } from './creative-mode'

test('creative mode accepts only the explicit ugc value', () => {
  assert.equal(normalizeCreativeMode('ugc'), 'ugc')
  assert.equal(normalizeCreativeMode('UGC'), 'standard')
  assert.equal(normalizeCreativeMode(undefined), 'standard')
})

test('ugc context is channel-specific and blocks fabricated testimonials', () => {
  const instagram = buildCreativeModeContext({ mode: 'ugc', canale: 'instagram', formato: 'reel', hasAssets: true })
  const linkedin = buildCreativeModeContext({ mode: 'ugc', canale: 'linkedin', formato: 'post', hasAssets: false })

  assert.match(instagram, /Reel creator-style 9:16/)
  assert.match(instagram, /template_style a "ugc"/)
  assert.match(linkedin, /Storia cliente o use case professionale/)
  assert.match(linkedin, /non fingere che il contenuto sia gia stato registrato/)
  assert.match(linkedin, /Non inventare testimonianze/)
})

test('standard mode adds no creative override', () => {
  assert.equal(buildCreativeModeContext({ mode: 'standard', canale: 'instagram', formato: 'reel', hasAssets: false }), '')
})
