import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { intervalloPeriodo, periodiRecenti } from './periodi'

test('un mese va dal primo all’ultimo giorno', () => {
  assert.deepEqual(intervalloPeriodo('2026-09'), { da: '2026-09-01', a: '2026-09-30', etichetta: 'settembre 2026' })
  assert.equal(intervalloPeriodo('2026-01')?.a, '2026-01-31')
})

test('febbraio tiene conto degli anni bisestili', () => {
  assert.equal(intervalloPeriodo('2026-02')?.a, '2026-02-28')
  assert.equal(intervalloPeriodo('2028-02')?.a, '2028-02-29')
})

test('i trimestri sono quelli della liquidazione IVA', () => {
  assert.deepEqual(intervalloPeriodo('2026-T1'), { da: '2026-01-01', a: '2026-03-31', etichetta: '1° trimestre 2026' })
  assert.equal(intervalloPeriodo('2026-T2')?.a, '2026-06-30')
  assert.deepEqual(intervalloPeriodo('2026-T3'), { da: '2026-07-01', a: '2026-09-30', etichetta: '3° trimestre 2026' })
  assert.equal(intervalloPeriodo('2026-T4')?.a, '2026-12-31')
})

test('un periodo scritto male non diventa un intervallo', () => {
  assert.equal(intervalloPeriodo('2026-13'), null)
  assert.equal(intervalloPeriodo('2026-T5'), null)
  assert.equal(intervalloPeriodo('settembre'), null)
  assert.equal(intervalloPeriodo(''), null)
})

test('i periodi proposti partono da oggi e attraversano il cambio d’anno', () => {
  const { mesi, trimestri } = periodiRecenti('2026-02-10', 4, 3)
  assert.deepEqual(mesi, ['2026-02', '2026-01', '2025-12', '2025-11'])
  assert.deepEqual(trimestri, ['2026-T1', '2025-T4', '2025-T3'])
})
