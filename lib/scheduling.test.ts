import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { cadenzaDaPacchetto } from './scheduling'

test('a package cadence spreads its weekly quota without piling up a single day', () => {
  // Crescita: 24 al mese = 6 a settimana.
  const cadenza = cadenzaDaPacchetto(null, 'settimanale', true, 6)
  assert.equal(cadenza.contenutiSettimana, 6)
  assert.equal(cadenza.maxPerGiorno, 2)
  assert.ok(cadenza.giorniAttivi >= 5, 'sei contenuti vanno distribuiti, non concentrati')
})

test('a campaign folder doubling the weekly target must widen the cadence, not compress it', () => {
  // Regressione reale: importando la cartella, il target settimanale passa da 6 a
  // 12 (stessi contenuti su due social), ma la cadenza restava quella del
  // pacchetto. Il piano dichiarava "6 a settimana, max 2 al giorno" mentre ne
  // piazzava 12: finivano tutti nei primi 4 giorni, lasciando mezza settimana
  // vuota. La cadenza deve seguire il target reale.
  const daPacchetto = cadenzaDaPacchetto(null, 'settimanale', true, 6)
  const daCartella = cadenzaDaPacchetto(null, 'settimanale', true, 12)

  assert.equal(daCartella.contenutiSettimana, 12)
  assert.ok(
    daCartella.giorniAttivi > daPacchetto.giorniAttivi,
    'con il doppio dei contenuti servono piu giorni, non gli stessi',
  )
  // 12 contenuti su 7 giorni: la settimana si riempie tutta.
  assert.ok(
    daCartella.giorniAttivi * daCartella.maxPerGiorno >= 12,
    'la capienza dichiarata deve bastare a ospitare tutti i contenuti della settimana',
  )
})

test('without weekend the cadence stays inside the five working days', () => {
  const cadenza = cadenzaDaPacchetto(null, 'settimanale', false, 12)
  assert.ok(cadenza.giorniAttivi <= 5, 'senza weekend non si possono usare piu di cinque giorni')
  assert.ok(cadenza.giorniAttivi * cadenza.maxPerGiorno >= 12)
})
