import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import {
  DEFAULT_PAGE_TEXTS,
  IN_APP_DOWNLOAD_HINT,
  PAGE_TEXT_LIMITS,
  buildBlobPathname,
  buildWhatsAppUrl,
  describeItem,
  formatBytes,
  generateAccessCode,
  hasMarkerPhrase,
  isDownloadBlobPathname,
  linkHostname,
  moveItem,
  normalizeAccessCode,
  normalizeLinkUrl,
  parseCreateItemBody,
  parseUpdateItemBody,
  resolvePageTexts,
  validateFileMeta,
  validateItemText,
  validatePageSettings,
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
test('describeItem: file da scaricare e link esterno', () => {
  assert.deepEqual(describeItem({ kind: 'file', url: 'https://s/g.pdf', downloadUrl: 'https://s/g.pdf?download=1', fileName: 'guida.pdf', contentType: 'application/pdf', sizeBytes: 2_516_582 }), { actionLabel: 'Scarica il PDF', href: 'https://s/g.pdf?download=1', meta: 'PDF · 2,4 MB', external: false, hint: null })
  assert.deepEqual(describeItem({ kind: 'link', url: 'https://www.github.com/marco/repo', downloadUrl: null, fileName: null, contentType: null, sizeBytes: null }), { actionLabel: 'Apri il link', href: 'https://www.github.com/marco/repo', meta: 'github.com', external: true, hint: null })
})
test('describeItem: file senza dimensione, senza estensione o senza downloadUrl', () => {
  // Senza contentType il tipo si ricava dall'estensione: "a.ZIP" in maiuscolo vale ZIP.
  assert.deepEqual(describeItem({ kind: 'file', url: 'https://s/g.zip', downloadUrl: null, fileName: 'a.ZIP', contentType: null, sizeBytes: null }), { actionLabel: 'Scarica lo ZIP', href: 'https://s/g.zip', meta: 'ZIP', external: false, hint: null })
  assert.equal(describeItem({ kind: 'file', url: 'https://s/x', downloadUrl: null, fileName: 'senza-estensione', contentType: null, sizeBytes: 1536 }).meta, '1,5 KB')
  assert.equal(describeItem({ kind: 'file', url: 'https://s/x', downloadUrl: null, fileName: null, contentType: null, sizeBytes: null }).meta, '')
})
test('describeItem: tipo sconosciuto o ripiego sull’estensione che non esiste tra quelle ammesse', () => {
  const file = (fileName: string | null) => ({ kind: 'file' as const, url: 'https://s/x', downloadUrl: null, fileName, contentType: null, sizeBytes: null })
  // `constructor` e `__proto__` esistono su ogni oggetto: senza Object.hasOwn il ripiego restituirebbe una funzione.
  for (const name of ['senza-estensione', 'x.sconosciuta', 'x.constructor', 'x.__proto__', null]) {
    assert.equal(describeItem(file(name)).actionLabel, 'Scarica il file', String(name))
  }
})

test('describeItem: etichetta per tipo di file', () => {
  const file = (fileName: string, contentType: string | null) => ({ kind: 'file' as const, url: `https://s/${fileName}`, downloadUrl: `https://s/${fileName}?download=1`, fileName, contentType, sizeBytes: 1536 })
  const cases: Array<[string, string, string]> = [
    ['guida.pdf', 'application/pdf', 'Scarica il PDF'],
    ['kit.zip', 'application/zip', 'Scarica lo ZIP'],
    ['foto.png', 'image/png', 'Scarica l’immagine'],
    ['clip.mp4', 'video/mp4', 'Scarica il video'],
    ['dati.csv', 'text/csv', 'Scarica il file'],
  ]
  for (const [name, type, label] of cases) {
    const d = describeItem(file(name, type))
    assert.equal(d.actionLabel, label)
    assert.equal(d.href, `https://s/${name}?download=1`)
    assert.equal(d.hint, null)
    assert.equal(d.external, false)
  }
})

test('describeItem: nel browser in-app PDF, immagini e video si aprono nel visore', () => {
  const file = (fileName: string, contentType: string) => ({ kind: 'file' as const, url: `https://s/${fileName}`, downloadUrl: `https://s/${fileName}?download=1`, fileName, contentType, sizeBytes: 10 })
  assert.deepEqual(describeItem(file('g.pdf', 'application/pdf'), { inApp: true }), { actionLabel: 'Apri il PDF', href: 'https://s/g.pdf', meta: 'PDF · 10 B', external: false, hint: null })
  assert.equal(describeItem(file('f.jpg', 'image/jpeg'), { inApp: true }).actionLabel, 'Apri l’immagine')
  assert.equal(describeItem(file('v.mp4', 'video/mp4'), { inApp: true }).actionLabel, 'Guarda il video')
  assert.equal(describeItem(file('v.mp4', 'video/mp4'), { inApp: true }).href, 'https://s/v.mp4')
})

test('describeItem: nel browser in-app ZIP e documenti restano da scaricare, con l’avviso', () => {
  const zip = describeItem({ kind: 'file', url: 'https://s/k.zip', downloadUrl: 'https://s/k.zip?download=1', fileName: 'k.zip', contentType: 'application/zip', sizeBytes: 10 }, { inApp: true })
  assert.equal(zip.actionLabel, 'Scarica lo ZIP')
  assert.equal(zip.href, 'https://s/k.zip?download=1')
  assert.equal(zip.hint, IN_APP_DOWNLOAD_HINT)
  const doc = describeItem({ kind: 'file', url: 'https://s/d.docx', downloadUrl: null, fileName: 'd.docx', contentType: null, sizeBytes: null }, { inApp: true })
  assert.equal(doc.actionLabel, 'Scarica il file')
  assert.equal(doc.href, 'https://s/d.docx')
  assert.equal(doc.hint, IN_APP_DOWNLOAD_HINT)
})

test('describeItem: link esterno e link WhatsApp (host esatto)', () => {
  const link = (url: string) => ({ kind: 'link' as const, url, downloadUrl: null, fileName: null, contentType: null, sizeBytes: null })
  assert.equal(describeItem(link('https://github.com/marco/repo')).actionLabel, 'Apri il link')
  assert.deepEqual(describeItem(link('https://wa.me/393477196603?text=ciao')), { actionLabel: 'Scrivici su WhatsApp', href: 'https://wa.me/393477196603?text=ciao', meta: 'wa.me', external: true, hint: null })
  assert.equal(describeItem(link('https://wa.me.evil.example/x')).actionLabel, 'Apri il link')
})

test('DEFAULT_PAGE_TEXTS: dentro i limiti e con la frase marcatore', () => {
  for (const key of ['eyebrow', 'title', 'lead', 'whatsappText'] as const) {
    assert.ok(DEFAULT_PAGE_TEXTS[key].length <= PAGE_TEXT_LIMITS[key], key)
  }
  assert.ok(hasMarkerPhrase(DEFAULT_PAGE_TEXTS.whatsappText))
  assert.equal(DEFAULT_PAGE_TEXTS.title, 'Ecco i tuoi regali.')
})

test('validatePageSettings: spazi tolti, vuoto diventa null, showUgc solo se presente', () => {
  assert.deepEqual(
    validatePageSettings({ eyebrow: '  Nuovo   occhiello ', title: '', lead: '   ', whatsappText: 'Ciao! Ho preso i regali SWA.' }),
    { ok: true, value: { eyebrow: 'Nuovo occhiello', title: null, lead: null, whatsappText: 'Ciao! Ho preso i regali SWA.' } },
  )
  assert.deepEqual(validatePageSettings({ showUgc: true }), { ok: true, value: { eyebrow: null, title: null, lead: null, whatsappText: null, showUgc: true } })
  assert.deepEqual(validatePageSettings({}), { ok: true, value: { eyebrow: null, title: null, lead: null, whatsappText: null } })
})

test('validatePageSettings: limiti esatti e tipi sbagliati', () => {
  assert.equal(validatePageSettings({ eyebrow: 'x'.repeat(60) }).ok, true)
  assert.equal(validatePageSettings({ eyebrow: 'x'.repeat(61) }).ok, false)
  assert.equal(validatePageSettings({ title: 'x'.repeat(91) }).ok, false)
  assert.equal(validatePageSettings({ lead: 'x'.repeat(241) }).ok, false)
  assert.equal(validatePageSettings({ whatsappText: 'x'.repeat(301) }).ok, false)
  assert.equal(validatePageSettings({ title: 5 }).ok, false)
  assert.equal(validatePageSettings({ showUgc: 'si' }).ok, false)
  for (const bad of [null, [], 'testo', 42]) assert.equal(validatePageSettings(bad).ok, false)
})

test('validatePageSettings: il limite si misura dopo la pulizia, gli errori nominano il campo, showUgc false vale', () => {
  // spazi ai bordi e ripetuti non contano per il limite; a capo e tabulazioni diventano uno spazio
  assert.deepEqual(validatePageSettings({ eyebrow: `  ${'x'.repeat(60)}  ` }), { ok: true, value: { eyebrow: 'x'.repeat(60), title: null, lead: null, whatsappText: null } })
  assert.equal(validatePageSettings({ title: `a${' '.repeat(200)}b` }).ok, true)
  assert.deepEqual(validatePageSettings({ lead: 'riga uno\n\n\triga due' }), { ok: true, value: { eyebrow: null, title: null, lead: 'riga uno riga due', whatsappText: null } })
  assert.deepEqual(validatePageSettings({ eyebrow: 'x'.repeat(61) }), { ok: false, error: 'L’occhiello può avere al massimo 60 caratteri.' })
  assert.deepEqual(validatePageSettings({ title: 5 }), { ok: false, error: 'Il titolo non è valido.' })
  assert.deepEqual(validatePageSettings({ lead: 'x'.repeat(241) }), { ok: false, error: 'Il sottotitolo può avere al massimo 240 caratteri.' })
  assert.deepEqual(validatePageSettings({ whatsappText: false }), { ok: false, error: 'Il messaggio WhatsApp non è valido.' })
  // showUgc: false è un valore (spegne l'app), null no; undefined equivale ad assente
  assert.deepEqual(validatePageSettings({ showUgc: false }), { ok: true, value: { eyebrow: null, title: null, lead: null, whatsappText: null, showUgc: false } })
  assert.equal(validatePageSettings({ showUgc: null }).ok, false)
  const result = validatePageSettings({ title: 'T', showUgc: undefined })
  assert.ok(result.ok && !Object.hasOwn(result.value, 'showUgc'))
})

test('resolvePageTexts: il campo vuoto usa il testo standard', () => {
  assert.deepEqual(resolvePageTexts(null), DEFAULT_PAGE_TEXTS)
  assert.deepEqual(resolvePageTexts({ title: 'Titolo nuovo', lead: '', eyebrow: null }), { ...DEFAULT_PAGE_TEXTS, title: 'Titolo nuovo' })
})

test('resolvePageTexts: soli spazi valgono come vuoto e il risultato è una copia dei testi standard', () => {
  assert.deepEqual(resolvePageTexts({ title: '   ', whatsappText: '\n' }), DEFAULT_PAGE_TEXTS)
  assert.deepEqual(resolvePageTexts(undefined), DEFAULT_PAGE_TEXTS)
  // chi modifica il risultato non deve toccare i testi standard condivisi
  assert.notEqual(resolvePageTexts(null), DEFAULT_PAGE_TEXTS)
})

test('buildWhatsAppUrl: numero dal titolare e testo codificato', () => {
  assert.equal(
    buildWhatsAppUrl('Ciao! Ho preso i regali SWA. Mi occupo di: '),
    'https://wa.me/393477196603?text=Ciao!%20Ho%20preso%20i%20regali%20SWA.%20Mi%20occupo%20di%3A%20',
  )
  assert.equal(buildWhatsAppUrl('attività'), 'https://wa.me/393477196603?text=attivit%C3%A0')
})

test('hasMarkerPhrase: senza distinguere maiuscole e spazi', () => {
  assert.equal(hasMarkerPhrase('Ciao! Ho preso i regali SWA.'), true)
  assert.equal(hasMarkerPhrase('ciao, ho  PRESO i regali swa'), true)
  assert.equal(hasMarkerPhrase('Ciao! Vorrei una prova.'), false)
})
