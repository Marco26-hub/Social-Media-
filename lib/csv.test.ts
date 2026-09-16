import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { cellaCsv, dataCsv, documentoCsv, giornoRoma, importoCsv } from './csv'

test('una cella che inizia come una formula non viene eseguita da Excel', () => {
  assert.equal(cellaCsv('=HYPERLINK("http://x")'), `"'=HYPERLINK(""http://x"")"`)
  assert.equal(cellaCsv('+39 333'), "'+39 333")
  assert.equal(cellaCsv('-5'), "'-5")
  assert.equal(cellaCsv('@somma'), "'@somma")
})

test('punto e virgola, virgolette e a capo restano dentro la cella', () => {
  assert.equal(cellaCsv('Rossi; Bianchi'), '"Rossi; Bianchi"')
  assert.equal(cellaCsv('Studio "Alfa"'), '"Studio ""Alfa"""')
  assert.equal(cellaCsv('riga\nseconda'), '"riga\nseconda"')
})

test('gli importi escono con la virgola decimale e senza valuta', () => {
  assert.equal(importoCsv(200000), '2000,00')
  assert.equal(importoCsv(14700), '147,00')
  assert.equal(importoCsv(5), '0,05')
})

test('le date escono nel formato e nel fuso italiani', () => {
  // 23:30 UTC del 31 agosto e gia il primo settembre a Roma.
  assert.equal(dataCsv('2026-08-31T23:30:00.000Z'), '01/09/2026')
  assert.equal(dataCsv(null), '')
})

test('il documento ha il BOM e usa il punto e virgola', () => {
  const csv = documentoCsv(['a', 'b'], [[1, 'x']])
  assert.ok(csv.startsWith('﻿'))
  assert.equal(csv, '﻿a;b\r\n1;x\r\n')
})

test('il giorno a Roma segue l’ora legale e quella solare', () => {
  // Estate, +02:00: le 22:30 UTC sono gia il giorno dopo.
  assert.equal(giornoRoma('2026-08-31T22:30:00.000Z'), '2026-09-01')
  // Inverno, +01:00: le 22:30 UTC sono ancora lo stesso giorno.
  assert.equal(giornoRoma('2026-12-31T22:30:00.000Z'), '2026-12-31')
  assert.equal(giornoRoma('2026-12-31T23:30:00.000Z'), '2027-01-01')
})
