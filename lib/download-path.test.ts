import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { isDownloadPath, pathForTelemetry, siteOverlaysEnabled } from './download-path'

test('isDownloadPath riconosce i percorsi sotto /download/', () => {
  assert.equal(isDownloadPath('/download/k7f3q9xzm2p4v8wn'), true)
  assert.equal(isDownloadPath('/download/k7f3q9xzm2p4v8wn/altro'), true)
  assert.equal(isDownloadPath('/download/'), true)
})

test('isDownloadPath non scatta sugli altri percorsi', () => {
  assert.equal(isDownloadPath('/'), false)
  assert.equal(isDownloadPath('/download'), false)
  assert.equal(isDownloadPath('/downloads/x'), false)
  assert.equal(isDownloadPath('/blog/download/x'), false)
  assert.equal(isDownloadPath('/en/download/x'), false)
  assert.equal(isDownloadPath(''), false)
  assert.equal(isDownloadPath(null), false)
  assert.equal(isDownloadPath(undefined), false)
})

test('pathForTelemetry nasconde il codice e lascia intatti gli altri percorsi', () => {
  assert.equal(pathForTelemetry('/download/k7f3q9xzm2p4v8wn'), '/download/[codice]')
  assert.equal(pathForTelemetry('/download/k7f3q9xzm2p4v8wn/altro'), '/download/[codice]')
  assert.equal(pathForTelemetry('/servizi/segretaria-telefonica-ai'), '/servizi/segretaria-telefonica-ai')
  assert.equal(pathForTelemetry('/'), '/')
  assert.ok(!pathForTelemetry('/download/k7f3q9xzm2p4v8wn').includes('k7f3'))
})

test('siteOverlaysEnabled: spento su /download/*, acceso altrove', () => {
  assert.equal(siteOverlaysEnabled('/download/k7f3q9xzm2p4v8wn'), false)
  assert.equal(siteOverlaysEnabled('/download/k7f3q9xzm2p4v8wn/altro'), false)
  for (const open of ['/', '/en', '/servizi/seo-geo', '/download', '/blog/download/x', null, undefined]) {
    assert.equal(siteOverlaysEnabled(open), true, String(open))
  }
})
