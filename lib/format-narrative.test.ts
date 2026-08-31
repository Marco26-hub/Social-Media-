import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluateNarrativeContract, FORMAT_NARRATIVE_CONTEXT } from './format-narrative'

test('narrative context defines an opening, payoff and close for every sequenced format', () => {
  assert.match(FORMAT_NARRATIVE_CONTEXT, /HOOK \(0-2s\)/)
  assert.match(FORMAT_NARRATIVE_CONTEXT, /PAYOFF/)
  assert.match(FORMAT_NARRATIVE_CONTEXT, /CAROUSEL/)
  assert.match(FORMAT_NARRATIVE_CONTEXT, /STORY/)
  assert.match(FORMAT_NARRATIVE_CONTEXT, /POST STATICO/)
  assert.match(FORMAT_NARRATIVE_CONTEXT, /niente finti sticker/i)
})

test('accepts a complete five-scene Reel', () => {
  const issues = evaluateNarrativeContract({
    formato: 'reel',
    hook: 'Il problema non sono le foto',
    cta: 'Scrivi BOWLING',
    scenes: ['Hook', 'Tensione', 'Prova', 'Payoff', 'CTA'],
  })
  assert.deepEqual(issues, [])
})

test('rejects an incomplete or duplicated Story sequence', () => {
  const issues = evaluateNarrativeContract({
    formato: 'story',
    hook: 'Hai un piano?',
    cta: 'Scrivi in DM',
    scenes: ['Domanda', 'Domanda'],
  })
  assert.ok(issues.some(issue => issue.code === 'story_frame_count'))
  assert.ok(issues.some(issue => issue.code === 'story_frame_duplicate'))
})
