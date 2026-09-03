import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { leggiConsenso, marketingConcesso } from './cookie-consent'

test('solo un si esplicito accende il marketing', () => {
  assert.equal(marketingConcesso('cookie_consent=marketing'), true)
  assert.equal(marketingConcesso('cookie_consent=essential'), false)
  assert.equal(marketingConcesso(null), false)
  assert.equal(marketingConcesso(''), false)
})

test('il vecchio consenso "technical" non vale come risposta', () => {
  // Il banner precedente informava soltanto ("Ho capito") e non chiedeva
  // niente sul marketing: quel valore non e un consenso, ma nemmeno un
  // rifiuto. Deve tornare null, cosi il banner ripropone la scelta.
  assert.equal(leggiConsenso('cookie_consent=technical'), null)
  assert.equal(marketingConcesso('cookie_consent=technical'), false)
})

test('un valore inatteso non accende niente e fa richiedere la scelta', () => {
  for (const valore of ['si', 'true', 'MARKETING', 'marketing2', 'all']) {
    assert.equal(leggiConsenso(`cookie_consent=${valore}`), null, valore)
  }
})

test('il cookie si legge anche in mezzo agli altri', () => {
  assert.equal(leggiConsenso('a=1; cookie_consent=marketing; b=2'), 'marketing')
  assert.equal(leggiConsenso('altro_cookie_consent=marketing'), null)
})

test('un cookie malformato non viene interpretato', () => {
  assert.equal(leggiConsenso('cookie_consent=%E0%A4%A'), null)
})
