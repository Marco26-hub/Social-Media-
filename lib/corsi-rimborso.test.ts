import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { rimborsoChiudeAccesso } from './corsi-rimborso'

test('un rimborso totale chiude l’accesso al corso', () => {
  assert.equal(rimborsoChiudeAccesso(200000, 200000), true)
})

test('un rimborso parziale lascia l’accesso aperto', () => {
  // E il caso dello sconto concesso dopo l'acquisto: chi ha pagato quasi tutto
  // non deve perdere le lezioni per un gesto commerciale.
  assert.equal(rimborsoChiudeAccesso(50000, 200000), false)
  assert.equal(rimborsoChiudeAccesso(199999, 200000), false)
})

test('un rimborso superiore al pagato resta totale', () => {
  // Succede con rimborsi emessi in piu tranche o con importi corretti dopo il
  // pagamento: non deve lasciare l'accesso aperto per un arrotondamento.
  assert.equal(rimborsoChiudeAccesso(200001, 200000), true)
})

test('nessun rimborso non chiude niente', () => {
  assert.equal(rimborsoChiudeAccesso(0, 200000), false)
})

test('un importo pagato non valido non chiude in automatico', () => {
  // Riga malformata o importo a zero: la decisione passa a una persona invece
  // di togliere l'accesso per un dato che non torna.
  assert.equal(rimborsoChiudeAccesso(0, 0), false)
  assert.equal(rimborsoChiudeAccesso(100, -1), false)
  assert.equal(rimborsoChiudeAccesso(Number.NaN, 200000), false)
})
