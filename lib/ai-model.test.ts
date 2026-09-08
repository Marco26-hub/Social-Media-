import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { isFreeOpenRouterModel, isVisionModel } from './ai-model'

test('recognises vision models used by the social generator', () => {
  assert.equal(isVisionModel('google/gemini-2.5-flash'), true)
  assert.equal(isVisionModel('openai/gpt-4o-mini'), true)
  assert.equal(isVisionModel('google/gemma-4-31b-it:free'), false)
})

test('recognises OpenRouter free model ids', () => {
  assert.equal(isFreeOpenRouterModel('openai/gpt-oss-20b:free'), true)
  assert.equal(isFreeOpenRouterModel('google/gemini-2.5-flash'), false)
})
