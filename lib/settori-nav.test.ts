import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { SETTORI } from './settori'
import { SETTORI_NAV } from './settori-nav'

test('Pizzerie links to the existing restaurant page without adding a sector', () => {
  const aliases = SETTORI_NAV.filter(s => s.nome === 'Pizzerie')
  assert.equal(aliases.length, 1)
  assert.equal(aliases[0].slug, 'ristoranti-e-bar')
  assert.equal(SETTORI.some(s => s.slug === 'pizzerie'), false)
  assert.equal(SETTORI_NAV.length, SETTORI.length + 1)
  assert.deepEqual(new Set(SETTORI_NAV.map(s => s.slug)), new Set(SETTORI.map(s => s.slug)))
})

test('Sector navigation preserves every original entry and has unique labels per URL', () => {
  for (const { slug, nome, sommario } of SETTORI) {
    assert.ok(SETTORI_NAV.some(s => s.slug === slug && s.nome === nome && s.sommario === sommario))
  }
  assert.equal(new Set(SETTORI_NAV.map(s => `${s.slug}-${s.nome}`)).size, SETTORI_NAV.length)
})
