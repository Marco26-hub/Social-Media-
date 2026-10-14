import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { anteprimaNota, anteprimaOg, contenutoAnteprima } from './anteprima'

test('/regali: voce fissa con il testo dello spec', () => {
  assert.equal(anteprimaNota('/regali'), true)
  assert.deepEqual(contenutoAnteprima('/regali'), {
    occhiello: 'Regali',
    titolo: 'I regali di Social Web Automation.',
    sottotitolo: 'Materiali gratuiti per chi ci segue: si aprono subito, senza registrazione.',
    tinta: 'verde',
  })
  assert.match(anteprimaOg('/regali')[0].url, /p=%2Fregali$/)
})

test('un percorso con il codice non è un’anteprima nota', () => {
  assert.equal(anteprimaNota('/download/k7f3q9xzm2p4v8wn'), false)
})
