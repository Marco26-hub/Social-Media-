import assert from 'node:assert/strict'
import { test } from 'playwright/test'

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

test('a Post written with Italian field names is not sent back for manual review', () => {
  const issues = evaluateNarrativeContract({
    formato: 'post',
    hook: 'Il tuo bowling ha gia le storie',
    didascalia: 'Contesto, prova e takeaway del contenuto.',
    call_to_action: 'Scrivi BOWLING',
    messaggio_chiave: 'La regia editoriale viene prima del file',
  })
  assert.deepEqual(issues, [])
})

test('Short and Video follow the same five-scene contract as a Reel', () => {
  for (const formato of ['short', 'video']) {
    const completo = evaluateNarrativeContract({
      formato,
      hook: 'Una serata, cinque angoli',
      cta: 'Salva il metodo',
      scenes: ['Hook', 'Tensione', 'Prova', 'Payoff', 'CTA'],
    })
    assert.deepEqual(completo, [], `${formato} completo`)

    const corto = evaluateNarrativeContract({
      formato,
      hook: 'Una serata, cinque angoli',
      cta: 'Salva il metodo',
      scenes: ['Hook', 'Payoff'],
    })
    assert.ok(corto.some(issue => issue.code === 'reel_scene_count'), `${formato} incompleto`)
  }
})

test('a carousel serialised as a JSON string is read, not rejected', () => {
  const issues = evaluateNarrativeContract({
    formato: 'carosello',
    hook: 'Prima di pubblicare',
    cta: 'Salva la checklist',
    slides: JSON.stringify([
      { ruolo: 'cover', titolo: 'Cover' },
      { ruolo: 'problema', titolo: 'Problema' },
      { ruolo: 'sviluppo', titolo: 'Sviluppo' },
      { ruolo: 'payoff', titolo: 'Payoff' },
      { ruolo: 'cta', titolo: 'CTA' },
    ]),
  })
  assert.deepEqual(issues, [])
})
