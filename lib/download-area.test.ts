import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import {
  buildBlobPathname,
  formatBytes,
  generateAccessCode,
  isDownloadBlobPathname,
  linkHostname,
  moveItem,
  normalizeAccessCode,
  normalizeLinkUrl,
  validateFileMeta,
  validateItemText,
} from './download-area'

test('generateAccessCode: 16 caratteri dall’alfabeto, 1000 codici tutti diversi', () => {
  const codes = Array.from({ length: 1000 }, generateAccessCode)
  for (const c of codes) assert.match(c, /^[abcdefghjkmnpqrstuvwxyz23456789]{16}$/)
  assert.equal(new Set(codes).size, 1000)
})
test('normalizeAccessCode accetta maiuscole, spazi e trattini; rifiuta formati errati', () => {
  assert.equal(normalizeAccessCode('k7f3q9xzm2p4v8wn'), 'k7f3q9xzm2p4v8wn')
  assert.equal(normalizeAccessCode(' K7F3-Q9XZ-M2P4-V8WN '), 'k7f3q9xzm2p4v8wn')
  for (const bad of ['', 'k7f3q9xz', 'k7f3q9xzm2p4v8wn1', 'k7f3q9xzm2p4v8w0', 'k7f3q9xzm2p4v8wl', '../../etc', null, 42])
    assert.equal(normalizeAccessCode(bad), null)
})
test('normalizeLinkUrl', () => {
  assert.equal(normalizeLinkUrl('https://github.com/marco/repo'), 'https://github.com/marco/repo')
  assert.equal(normalizeLinkUrl('http://esempio.it/x'), 'https://esempio.it/x')
  assert.equal(normalizeLinkUrl('github.com/marco/repo'), 'https://github.com/marco/repo')
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', '/relativo', 'https://user:pw@x.it', 'ftp://x.it', 'non un url', '', 'https://' + 'a'.repeat(2050) + '.it'])
    assert.equal(normalizeLinkUrl(bad), null)
})
test('validateFileMeta', () => {
  assert.deepEqual(validateFileMeta({ name: 'Guida UGC.PDF', size: 2_000_000, contentType: 'application/pdf' }), { ok: true, extension: 'pdf', contentType: 'application/pdf' })
  assert.equal(validateFileMeta({ name: 'x.exe', size: 10 }).ok, false)
  assert.equal(validateFileMeta({ name: 'foto.heic', size: 10 }).ok, false)
  assert.equal(validateFileMeta({ name: 'grande.zip', size: 250 * 1024 * 1024 + 1 }).ok, false)
  assert.equal(validateFileMeta({ name: 'vuoto.pdf', size: 0 }).ok, false)
  assert.equal(validateFileMeta({ name: 'senza-estensione', size: 10 }).ok, false)
})
test('validateItemText', () => {
  assert.deepEqual(validateItemText({ title: '  Guida   UGC ', description: '' }), { ok: true, title: 'Guida UGC', description: null })
  assert.equal(validateItemText({ title: '   ' }).ok, false)
  assert.equal(validateItemText({ title: 'x'.repeat(121) }).ok, false)
  assert.equal(validateItemText({ title: 'ok', description: 'd'.repeat(601) }).ok, false)
})
test('moveItem agli estremi e con id sconosciuto', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c'], 'b', 'up'), ['b', 'a', 'c'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 'c', 'down'), ['a', 'b', 'c'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 'a', 'up'), ['a', 'b', 'c'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 'z', 'down'), ['a', 'b', 'c'])
})
test('formatBytes in italiano', () => {
  assert.equal(formatBytes(512), '512 B')
  assert.equal(formatBytes(1536), '1,5 KB')
  assert.equal(formatBytes(1048576), '1 MB')
  assert.equal(formatBytes(250 * 1024 * 1024), '250 MB')
})
test('pathname dei blob', () => {
  assert.equal(buildBlobPathname('Guida Città UGC (v2).PDF'), 'swa-download/files/guida-citta-ugc-v2.pdf')
  assert.equal(isDownloadBlobPathname('swa-download/files/guida-abc123.pdf'), true)
  assert.equal(isDownloadBlobPathname('swa-download/catalog.json'), false)
  assert.equal(isDownloadBlobPathname('swa-download/files/../x.pdf'), false)
})
test('linkHostname', () => {
  assert.equal(linkHostname('https://www.github.com/marco'), 'github.com')
})
