import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { accorciaCaption, CAPTION_VIDEO_MAX } from './caption-limits'

// La caption vera che e stata pubblicata tagliata a meta parola.
const CAPTION_REALE = "Hai un'attività locale e non sai come far valere i tuoi contenuti sui social? Il problema non è la foto, ma la strategia! Scopri come #SocialAutomation trasforma ogni momento in una storia riconoscibile e ti garantisce una visibilità organica duratura.\n\nNon lasciare che i tuoi contenuti restino isolati. Con la nostra strategia ogni post ha un ruolo."

test('a caption shorter than the limit is left alone', () => {
  assert.equal(accorciaCaption('Testo corto.'), 'Testo corto.')
  assert.equal(accorciaCaption(''), '')
})

test('the real published caption no longer stops mid-word', () => {
  // Prima usciva "...restino isol": parola spezzata, nessun puntino.
  const out = accorciaCaption(CAPTION_REALE)
  assert.ok(out.length <= CAPTION_VIDEO_MAX, `${out.length} caratteri, oltre il limite`)
  assert.ok(!/isol$/.test(out), `taglio ancora a meta parola: ${JSON.stringify(out.slice(-40))}`)
  assert.ok(/[.!?…]$/.test(out), `non chiude su una punteggiatura: ${JSON.stringify(out.slice(-40))}`)
})

test('it closes on the last complete sentence when there is one', () => {
  const testo = 'Prima frase corta. Seconda frase che chiude bene. ' + 'x'.repeat(400)
  const out = accorciaCaption(testo, 100)
  assert.equal(out, 'Prima frase corta. Seconda frase che chiude bene.')
})

test('with no sentence end it cuts on a whole word and says the text continues', () => {
  const testo = 'parola '.repeat(100)
  const out = accorciaCaption(testo, 50)
  assert.ok(out.endsWith('…'), `manca il segno di continuazione: ${out}`)
  assert.ok(!out.includes('parol…'), `parola spezzata: ${out}`)
  assert.ok(out.length <= 50)
})

test('a dot inside a number or abbreviation does not count as a sentence end', () => {
  // Chiudere su "1." lascerebbe una frase senza senso.
  const testo = 'Nel 2026 abbiamo raggiunto 1.500 clienti attivi in tutta Italia e continuiamo a crescere ogni mese.'
  const out = accorciaCaption(testo, 40)
  assert.ok(!out.endsWith('1.'), `tagliato dentro il numero: ${out}`)
  assert.ok(out.endsWith('…'))
})

test('a sentence ending just before the limit is preferred to an ellipsis', () => {
  const testo = 'Frase che occupa quasi tutto lo spazio disponibile qui. Coda che eccede il limite e va tagliata via.'
  const out = accorciaCaption(testo, 60)
  assert.equal(out, 'Frase che occupa quasi tutto lo spazio disponibile qui.')
})
