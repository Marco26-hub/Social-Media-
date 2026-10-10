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
  parseCreateItemBody,
  parseUpdateItemBody,
  validateFileMeta,
  validateItemText,
  validateReorder,
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
test('parseCreateItemBody: link valido, link pericoloso, file fuori prefisso', () => {
  assert.deepEqual(parseCreateItemBody({ kind: 'link', title: 'App UGC', url: 'ugc.example.com' }), { ok: true, value: { kind: 'link', title: 'App UGC', description: null, url: 'https://ugc.example.com/' } })
  assert.equal(parseCreateItemBody({ kind: 'link', title: 'x', url: 'javascript:alert(1)' }).ok, false)
  assert.equal(parseCreateItemBody({ kind: 'file', title: 'x', blob: { url: 'https://s/x.pdf', downloadUrl: 'https://s/x.pdf?download=1', pathname: 'altro/x.pdf', contentType: 'application/pdf', size: 10, fileName: 'x.pdf' } }).ok, false)
  assert.equal(parseCreateItemBody({ kind: 'video' }).ok, false)
})
test('parseUpdateItemBody richiede almeno un campo valido', () => {
  assert.deepEqual(parseUpdateItemBody({ visible: false }), { ok: true, value: { visible: false } })
  assert.equal(parseUpdateItemBody({}).ok, false)
  assert.equal(parseUpdateItemBody({ title: '' }).ok, false)
})
test('validateReorder rifiuta elenchi non aggiornati', () => {
  assert.deepEqual(validateReorder(['b', 'a'], ['a', 'b']), { ok: true, ids: ['b', 'a'] })
  assert.equal(validateReorder(['a'], ['a', 'b']).ok, false)
  assert.equal(validateReorder(['a', 'a'], ['a', 'b']).ok, false)
  assert.equal(validateReorder(['a', 'c'], ['a', 'b']).ok, false)
})
const validBlob = {
  url: 'https://store.public.blob.vercel-storage.com/swa-download/files/guida-ab12.pdf',
  downloadUrl: 'https://store.public.blob.vercel-storage.com/swa-download/files/guida-ab12.pdf?download=1',
  pathname: 'swa-download/files/guida-ab12.pdf',
  contentType: 'text/html',
  size: 2048,
  fileName: 'Guida.PDF',
}
test('parseCreateItemBody: file valido, il tipo salvato è quello dell’estensione', () => {
  const parsed = parseCreateItemBody({ kind: 'file', title: ' Guida  UGC ', description: ' Per iniziare ', blob: validBlob })
  assert.deepEqual(parsed, {
    ok: true,
    value: {
      kind: 'file',
      title: 'Guida UGC',
      description: 'Per iniziare',
      blob: { ...validBlob, contentType: 'application/pdf' },
    },
  })
})
test('parseCreateItemBody: file con dati del blob non validi', () => {
  const file = (blob: unknown) => parseCreateItemBody({ kind: 'file', title: 'x', blob }).ok
  assert.equal(file(validBlob), true)
  assert.equal(file(undefined), false)
  assert.equal(file(null), false)
  assert.equal(file({ ...validBlob, pathname: 'swa-download/files/../x.pdf' }), false)
  assert.equal(file({ ...validBlob, pathname: 'altro/x.pdf' }), false)
  // il solo prefisso supera isDownloadBlobPathname: lo ferma il nome del file
  assert.equal(file({ ...validBlob, pathname: 'swa-download/files/', fileName: 'x.exe' }), false)
  assert.equal(file({ ...validBlob, fileName: 'x.exe' }), false)
  assert.equal(file({ ...validBlob, fileName: 'constructor' }), false)
  assert.equal(file({ ...validBlob, fileName: '__proto__' }), false)
  assert.equal(file({ ...validBlob, fileName: 'a\nb.pdf' }), false)
  assert.equal(file({ ...validBlob, fileName: 'a'.repeat(256) + '.pdf' }), false)
  assert.equal(file({ ...validBlob, fileName: 42 }), false)
  assert.equal(file({ ...validBlob, size: 0 }), false)
  assert.equal(file({ ...validBlob, size: 10.5 }), false)
  assert.equal(file({ ...validBlob, size: '10' }), false)
  assert.equal(file({ ...validBlob, size: 250 * 1024 * 1024 + 1 }), false)
  assert.equal(file({ ...validBlob, url: 'javascript:alert(1)' }), false)
  assert.equal(file({ ...validBlob, downloadUrl: 'http://insicuro.example.com/x.pdf' }), false)
})
test('parseCreateItemBody: corpo non valido o titolo mancante', () => {
  for (const bad of [null, undefined, 'link', 42, [], {}]) assert.equal(parseCreateItemBody(bad).ok, false)
  assert.equal(parseCreateItemBody({ kind: 'link', title: '  ', url: 'https://a.example.com' }).ok, false)
  assert.equal(parseCreateItemBody({ kind: 'link', title: 'x' }).ok, false)
})
test('parseUpdateItemBody: campi singoli, descrizione azzerabile, tipi sbagliati', () => {
  assert.deepEqual(parseUpdateItemBody({ title: '  Nuova   guida ' }), { ok: true, value: { title: 'Nuova guida' } })
  assert.deepEqual(parseUpdateItemBody({ description: null }), { ok: true, value: { description: null } })
  assert.deepEqual(parseUpdateItemBody({ description: '  ' }), { ok: true, value: { description: null } })
  assert.deepEqual(
    parseUpdateItemBody({ title: 'a', description: 'b', visible: true, id: 'ignorato' }),
    { ok: true, value: { title: 'a', description: 'b', visible: true } },
  )
  assert.equal(parseUpdateItemBody({ visible: 'false' }).ok, false)
  assert.equal(parseUpdateItemBody({ visible: 0 }).ok, false)
  assert.equal(parseUpdateItemBody({ description: 42 }).ok, false)
  assert.equal(parseUpdateItemBody({ description: 'd'.repeat(601) }).ok, false)
  for (const bad of [null, undefined, 'x', [], [{ visible: true }]]) assert.equal(parseUpdateItemBody(bad).ok, false)
})
test('validateReorder: elenco vuoto, forme non valide, elenco più lungo', () => {
  assert.deepEqual(validateReorder([], []), { ok: true, ids: [] })
  assert.equal(validateReorder([], ['a']).ok, false)
  assert.equal(validateReorder(['a', 'b', 'c'], ['a', 'b']).ok, false)
  assert.equal(validateReorder('a', ['a']).ok, false)
  assert.equal(validateReorder(null, []).ok, false)
  assert.equal(validateReorder([1, 2], ['1', '2']).ok, false)
})
