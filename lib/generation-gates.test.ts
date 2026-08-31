import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { readGateReason, readGenerationGate } from './generation-gates'

test('all three generation gates are recognised as regenerable', () => {
  assert.equal(readGenerationGate('ERRORE_MANUALE', '[GENERATION_FALLBACK] blocco non completato'), 'fallback')
  assert.equal(readGenerationGate('ERRORE_MANUALE', '[NARRATIVE_GATE] Reel: servono esattamente 5 scene narrative (attuali: 0)'), 'narrative')
  assert.equal(readGenerationGate('ERRORE_MANUALE', '[NOVELTY_GATE] Somiglianza creativa 82%'), 'novelty')
})

test('a publishing error is not regenerable through this path', () => {
  // ERRORE_MANUALE senza marcatore = problema di pubblicazione: si risolve con
  // "Riprova pubblicazione", non riscrivendo il contenuto.
  assert.equal(readGenerationGate('ERRORE_MANUALE', 'Blotato: pubblicazione fallita'), null)
  assert.equal(readGenerationGate('ERRORE_MANUALE', null), null)
  assert.equal(readGenerationGate('ERRORE', '[NARRATIVE_GATE] qualcosa'), null)
  assert.equal(readGenerationGate('DA_APPROVARE', '[NARRATIVE_GATE] qualcosa'), null)
})

test('the reason is handed to the model without the technical prefix', () => {
  assert.equal(
    readGateReason('[NARRATIVE_GATE] Reel: servono esattamente 5 scene narrative (attuali: 0)'),
    'Reel: servono esattamente 5 scene narrative (attuali: 0)',
  )
  assert.equal(readGateReason('Blotato: pubblicazione fallita'), '')
})
