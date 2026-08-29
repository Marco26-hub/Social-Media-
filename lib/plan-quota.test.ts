import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { SETTIMANE_DEL_MESE, contenutiDellaFase, quotaBlocco, settimaneDellaFase } from './plan-quota'

test('splitting a total across blocks never creates or loses content', () => {
  for (const totale of [16, 24, 30, 7, 1, 0]) {
    for (const blocchi of [2, 3, 4]) {
      const somma = Array.from({ length: blocchi }, (_, i) => quotaBlocco(totale, blocchi, i))
        .reduce((a, b) => a + b, 0)
      assert.equal(somma, totale, `totale ${totale} in ${blocchi} blocchi`)
    }
  }
})

test('phase 1 covers weeks 1-2 and phase 2 covers weeks 3-4', () => {
  assert.deepEqual(settimaneDellaFase(1), [0, 1])
  assert.deepEqual(settimaneDellaFase(2), [2, 3])
  assert.deepEqual(settimaneDellaFase(null), [...SETTIMANE_DEL_MESE])
})

test('the two phases together rebuild exactly the monthly quota', () => {
  // È la regressione che conta: prima la fase veniva ignorata con un pacchetto
  // attivo, quindi OGNI fase generava il mese intero e lanciarle entrambe
  // produceva il doppio dei contenuti previsti dal pacchetto.
  for (const totaleMensile of [16, 24, 30, 12]) {
    const fase1 = contenutiDellaFase(totaleMensile, 1)
    const fase2 = contenutiDellaFase(totaleMensile, 2)
    assert.equal(fase1 + fase2, totaleMensile, `pacchetto da ${totaleMensile}/mese`)
    assert.equal(contenutiDellaFase(totaleMensile, null), totaleMensile)
    // Nessuna fase deve da sola coincidere col mese intero.
    assert.notEqual(fase1, totaleMensile)
  }
})

test('a Crescita package gives half of its 24 monthly contents per phase', () => {
  assert.equal(contenutiDellaFase(24, 1), 12)
  assert.equal(contenutiDellaFase(24, 2), 12)
})

test('an odd monthly quota is split without rounding drift', () => {
  // 30/mese: 8+7+8+7 sulle quattro settimane -> 15 e 15 sulle due fasi.
  assert.equal(contenutiDellaFase(30, 1) + contenutiDellaFase(30, 2), 30)
  assert.equal(contenutiDellaFase(7, 1) + contenutiDellaFase(7, 2), 7)
})

test('the format mix must be split over the four weeks, not over the emitted blocks', () => {
  // Regressione reale: emettendo solo i blocchi di una fase, il mix dei formati
  // veniva diviso per il NUMERO DI BLOCCHI EMESSI (2) invece che per le quattro
  // settimane del mese. Risultato: la fase 1 riceveva tutti i reel e tutte le
  // story del mese, e la fase 2 li riceveva di nuovo.
  const reelMensili = 4
  const storyMensili = 2

  // Sbagliato: denominatore = blocchi emessi dalla fase.
  const reelConDenominatoreSbagliato = [0, 1]
    .reduce((somma, i) => somma + quotaBlocco(reelMensili, 2, i), 0)
  assert.equal(reelConDenominatoreSbagliato, reelMensili, 'una sola fase prenderebbe tutti i reel del mese')

  // Corretto: denominatore = quattro settimane, indice = settimana reale.
  const reelFase1 = settimaneDellaFase(1)
    .reduce((somma, settimana) => somma + quotaBlocco(reelMensili, SETTIMANE_DEL_MESE.length, settimana), 0)
  const reelFase2 = settimaneDellaFase(2)
    .reduce((somma, settimana) => somma + quotaBlocco(reelMensili, SETTIMANE_DEL_MESE.length, settimana), 0)
  assert.equal(reelFase1, 2)
  assert.equal(reelFase2, 2)
  assert.equal(reelFase1 + reelFase2, reelMensili)

  const storyFase1 = settimaneDellaFase(1)
    .reduce((somma, settimana) => somma + quotaBlocco(storyMensili, SETTIMANE_DEL_MESE.length, settimana), 0)
  const storyFase2 = settimaneDellaFase(2)
    .reduce((somma, settimana) => somma + quotaBlocco(storyMensili, SETTIMANE_DEL_MESE.length, settimana), 0)
  assert.equal(storyFase1 + storyFase2, storyMensili)
})
