import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { pianificaSpostamento, spostaData } from './plan-shift'

const OGGI = '2026-09-01'

function riga(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'r1',
    id_contenuto: 'C1',
    data_pubblicazione: '2026-09-02',
    status: 'DA_APPROVARE',
    blotato_post_id: null,
    ...over,
  }
}

test('shifting keeps the distance between contents', () => {
  const plan = pianificaSpostamento([
    riga({ id: 'a', data_pubblicazione: '2026-09-02' }),
    riga({ id: 'b', data_pubblicazione: '2026-09-05' }),
    riga({ id: 'c', data_pubblicazione: '2026-09-30' }),
  ], 3, OGGI)
  assert.equal(plan.errore, undefined)
  assert.deepEqual(plan.spostabili.map(s => s.a), ['2026-09-05', '2026-09-08', '2026-10-03'])
  assert.equal(plan.nuovaPrimaData, '2026-09-05')
})

test('content already sent to Blotato is never moved', () => {
  // La data vera vive sul server di Blotato: spostarla solo da noi produrrebbe
  // un calendario che mente sull'orario di uscita.
  const plan = pianificaSpostamento([
    riga({ id: 'a' }),
    riga({ id: 'b', blotato_post_id: 'sub_123' }),
  ], 5, OGGI)
  assert.equal(plan.spostabili.length, 1)
  assert.equal(plan.spostabili[0].id, 'a')
  assert.equal(plan.bloccatiBlotato, 1)
})

test('published and archived content stays where it is', () => {
  const plan = pianificaSpostamento([
    riga({ id: 'a' }),
    riga({ id: 'b', status: 'PUBBLICATO' }),
    riga({ id: 'c', status: 'ARCHIVIATO' }),
  ], 2, OGGI)
  assert.equal(plan.spostabili.length, 1)
  assert.equal(plan.ignorati, 2)
})

test('the past is not rewritten: only content from the threshold date moves', () => {
  const plan = pianificaSpostamento([
    riga({ id: 'vecchio', data_pubblicazione: '2026-08-20' }),
    riga({ id: 'nuovo', data_pubblicazione: '2026-09-10' }),
  ], 4, OGGI)
  assert.deepEqual(plan.spostabili.map(s => s.id), ['nuovo'])
})

test('a backwards shift landing before today is refused whole, not applied in part', () => {
  // Mezzo piano spostato e mezzo no e peggio del problema di partenza.
  const plan = pianificaSpostamento([
    riga({ id: 'a', data_pubblicazione: '2026-09-02' }),
    riga({ id: 'b', data_pubblicazione: '2026-09-20' }),
  ], -10, OGGI)
  assert.equal(plan.spostabili.length, 0)
  assert.match(String(plan.errore), /prima di oggi/)
})

test('a backwards shift that stays from today on is allowed', () => {
  const plan = pianificaSpostamento([riga({ data_pubblicazione: '2026-09-10' })], -5, OGGI)
  assert.equal(plan.errore, undefined)
  assert.equal(plan.spostabili[0].a, '2026-09-05')
})

test('zero, non-integer and oversized shifts are rejected with a reason', () => {
  assert.match(String(pianificaSpostamento([riga()], 0, OGGI).errore), /Indica di quanti giorni/)
  assert.match(String(pianificaSpostamento([riga()], 1.5, OGGI).errore), /Indica di quanti giorni/)
  assert.match(String(pianificaSpostamento([riga()], 400, OGGI).errore), /massimo 180/)
})

test('the shift crosses month and year boundaries correctly', () => {
  assert.equal(spostaData('2026-12-30', 5), '2027-01-04')
  assert.equal(spostaData('2026-03-01', -1), '2026-02-28')
})
