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

test('slides written with English keys are read, not called duplicates', () => {
  // Caso reale: 5 slide tutte diverse, ognuna con media, overlay_text e
  // alt_text. Nessuna di quelle chiavi era nell'elenco letto dal gate, quindi
  // il testo estratto era vuoto per tutte e il contenuto veniva bocciato per
  // "slide duplicate o senza progressione distinta". Erano distintissime.
  const issues = evaluateNarrativeContract({
    formato: 'carousel',
    hook: 'La tua attivita locale',
    cta: 'Scrivi BOWLING in DM',
    slides: [
      { media: 'a.jpg', overlay_text: 'UNA SERATA. PIU CONTENUTI.', alt_text: 'Persone che giocano a bowling' },
      { media: 'b.jpg', overlay_text: 'AMBIENTE. La pista apre la storia.', alt_text: 'Interno della pista' },
      { media: 'c.jpg', overlay_text: 'GESTO. Il movimento crea attenzione.', alt_text: 'Palla in movimento' },
      { media: 'd.jpg', overlay_text: 'REAZIONE. Il gruppo rende tutto umano.', alt_text: 'Persone sorridenti' },
      { media: 'e.jpg', overlay_text: 'METODO. SWA organizza il mese.', alt_text: 'Due persone al tavolo' },
    ],
  })
  assert.deepEqual(issues, [])
})

test('slides with no readable text are not reported as duplicates', () => {
  // Un elemento senza testo riconoscibile e un problema diverso (e lo dice il
  // conteggio): trasformarlo in "duplicato" mandava fuori strada chi legge.
  const issues = evaluateNarrativeContract({
    formato: 'carousel',
    hook: 'Hook',
    cta: 'CTA',
    slides: [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }],
  })
  assert.equal(issues.filter(i => i.code === 'carousel_slide_duplicate').length, 0)
})

test('genuinely repeated slides are still caught', () => {
  const issues = evaluateNarrativeContract({
    formato: 'carousel',
    hook: 'Hook',
    cta: 'CTA',
    slides: [
      { overlay_text: 'Stessa slide' },
      { overlay_text: 'Stessa slide' },
      { overlay_text: 'Terza' },
      { overlay_text: 'Quarta' },
      { overlay_text: 'Quinta' },
    ],
  })
  assert.ok(issues.some(i => i.code === 'carousel_slide_duplicate'))
})
