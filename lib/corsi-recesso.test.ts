import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { fineRecesso, statoRecesso } from './corsi-recesso'

const pagato = new Date('2026-09-01T10:00:00.000Z')
const giorni = (n: number) => new Date(pagato.getTime() + n * 86400000)

test('imprese e professionisti non hanno diritto di recesso', () => {
  assert.deepEqual(
    statoRecesso({ customerType: 'impresa_professionista', pagatoIl: pagato, rinunciaIl: null, ora: giorni(1) }),
    { tipo: 'non_previsto' },
  )
})

test('il termine e di quattordici giorni dal pagamento', () => {
  assert.equal(fineRecesso(pagato).toISOString(), '2026-09-15T10:00:00.000Z')
})

test('un consumatore senza rinuncia ha il recesso aperto fino al termine', () => {
  const stato = statoRecesso({ customerType: 'consumatore', pagatoIl: pagato, rinunciaIl: null, ora: giorni(5) })
  assert.equal(stato.tipo, 'aperto')
})

test('passati i quattordici giorni il recesso e scaduto anche senza rinuncia', () => {
  // E il caso della prevendita lunga: chi compra sessanta giorni prima
  // dell'uscita ha gia perso il diritto quando il corso arriva.
  const stato = statoRecesso({ customerType: 'consumatore', pagatoIl: pagato, rinunciaIl: null, ora: giorni(15) })
  assert.equal(stato.tipo, 'scaduto')
})

test('la rinuncia dentro il termine estingue il diritto da quel momento', () => {
  const stato = statoRecesso({ customerType: 'consumatore', pagatoIl: pagato, rinunciaIl: giorni(3), ora: giorni(4) })
  assert.deepEqual(stato, { tipo: 'rinunciato', il: giorni(3) })
})

test('una rinuncia raccolta dopo il termine non conta: il diritto era gia scaduto', () => {
  const stato = statoRecesso({ customerType: 'consumatore', pagatoIl: pagato, rinunciaIl: giorni(20), ora: giorni(21) })
  assert.equal(stato.tipo, 'scaduto')
})

test('un ordine non pagato non ha ancora un termine', () => {
  assert.deepEqual(
    statoRecesso({ customerType: 'consumatore', pagatoIl: null, rinunciaIl: null }),
    { tipo: 'non_pagato' },
  )
})
