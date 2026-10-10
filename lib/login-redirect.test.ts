import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { needsFullPageLoad } from './login-redirect'

test('needsFullPageLoad: /admin e i suoi sotto-percorsi richiedono il caricamento completo', () => {
  assert.equal(needsFullPageLoad('/admin'), true)
  assert.equal(needsFullPageLoad('/admin/'), true)
  assert.equal(needsFullPageLoad('/admin/download'), true)
  assert.equal(needsFullPageLoad('/admin/download/altro'), true)
  // Query e hash non cambiano il percorso.
  assert.equal(needsFullPageLoad('/admin?x=1'), true)
  assert.equal(needsFullPageLoad('/admin/download?x=1#a'), true)
  assert.equal(needsFullPageLoad('/admin#a'), true)
})

test('needsFullPageLoad: ogni altra destinazione resta una navigazione morbida', () => {
  assert.equal(needsFullPageLoad('/dashboard/clienti'), false)
  assert.equal(needsFullPageLoad('/portale'), false)
  assert.equal(needsFullPageLoad('/'), false)
  // Prefisso condiviso ma percorso diverso.
  assert.equal(needsFullPageLoad('/administrator'), false)
  assert.equal(needsFullPageLoad('/admin-tools'), false)
  // /admin solo come parte di un altro percorso o di una query.
  assert.equal(needsFullPageLoad('/dashboard/admin'), false)
  assert.equal(needsFullPageLoad('/login?callbackUrl=/admin'), false)
  assert.equal(needsFullPageLoad(''), false)
})
