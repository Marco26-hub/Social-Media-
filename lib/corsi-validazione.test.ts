import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { DatoNonValido, idValido, valoreColonna } from './corsi-validazione'

test('la descrizione vuota resta testo vuoto: la colonna e obbligatoria', () => {
  // Era il motivo per cui creare un corso dall'amministrazione falliva sempre.
  assert.equal(valoreColonna('descrizione', ''), '')
  assert.equal(valoreColonna('descrizione', '   '), '')
})

test('i campi facoltativi vuoti diventano null', () => {
  assert.equal(valoreColonna('sottotitolo', ''), null)
  assert.equal(valoreColonna('categoria', ''), null)
  assert.equal(valoreColonna('disponibile_dal', null), null)
})

test('titolo e slug vuoti vengono rifiutati con un messaggio', () => {
  assert.throws(() => valoreColonna('titolo', ''), DatoNonValido)
  assert.throws(() => valoreColonna('slug', '  '), DatoNonValido)
})

test('lo slug accetta solo il formato di un indirizzo', () => {
  assert.equal(valoreColonna('slug', 'obblighi-ia-2026'), 'obblighi-ia-2026')
  assert.throws(() => valoreColonna('slug', 'Obblighi IA'), DatoNonValido)
  assert.throws(() => valoreColonna('slug', 'corso--doppio'), DatoNonValido)
  assert.throws(() => valoreColonna('slug', '-inizio'), DatoNonValido)
})

test('il prezzo deve essere un intero positivo e plausibile', () => {
  assert.equal(valoreColonna('prezzo_cents', 39000), 39000)
  assert.equal(valoreColonna('prezzo_cents', '200000'), 200000)
  assert.throws(() => valoreColonna('prezzo_cents', 0), DatoNonValido)
  assert.throws(() => valoreColonna('prezzo_cents', -5), DatoNonValido)
  assert.throws(() => valoreColonna('prezzo_cents', 12.5), DatoNonValido)
  assert.throws(() => valoreColonna('prezzo_cents', 200_000_000), DatoNonValido)
})

test('i link devono essere https: un javascript: non entra', () => {
  assert.equal(valoreColonna('link_accesso', 'https://zoom.us/j/1'), 'https://zoom.us/j/1')
  assert.throws(() => valoreColonna('link_accesso', 'javascript:alert(1)'), DatoNonValido)
  assert.throws(() => valoreColonna('video_url', 'http://non-sicuro.it'), DatoNonValido)
})

test('livello, modalita e tipo accettano solo i valori previsti', () => {
  assert.throws(() => valoreColonna('livello', 'esperto'), DatoNonValido)
  assert.throws(() => valoreColonna('modalita', 'ibrido'), DatoNonValido)
  assert.throws(() => valoreColonna('tipo', 'audio'), DatoNonValido)
})

test('l’ordine ammette lo zero, i posti no', () => {
  assert.equal(valoreColonna('ordine', 0), 0)
  assert.throws(() => valoreColonna('posti_totali', 0), DatoNonValido)
})

test('un id malformato non arriva al database', () => {
  assert.equal(idValido('ad536eb5-9dc5-47e6-88f8-d6164d38fd99'), true)
  assert.equal(idValido('undefined'), false)
  assert.equal(idValido(''), false)
  assert.equal(idValido(null), false)
})
