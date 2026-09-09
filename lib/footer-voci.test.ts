import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { RECESSO_FOOTER, VOCI_FOOTER } from './footer-voci'

// Il footer e' lo stesso su tutto il sito. Le due lingue devono restare
// speculari: stesso numero di voci, stesso ordine, e ogni percorso italiano
// con la sua gemella inglese. Aggiungere una voce a una sola lingua rompe la
// corrispondenza senza che nessuno se ne accorga.
test('le due lingue del footer hanno le stesse voci nello stesso ordine', () => {
  assert.equal(VOCI_FOOTER.it.length, VOCI_FOOTER.en.length)
})

// Il riferimento approvato ha dodici voci: quattro per riga sul telefono e sei
// per riga su desktop. Il conteggio fisso impedisce che una pagina torni ad
// avere un footer piu' lungo delle altre.
test('le voci del footer riempiono righe intere', () => {
  for (const lingua of ['it', 'en'] as const) {
    assert.equal(VOCI_FOOTER[lingua].length, 12, `${lingua}: ${VOCI_FOOTER[lingua].length} voci`)
  }
})

test('nessun percorso del footer e ripetuto', () => {
  for (const lingua of ['it', 'en'] as const) {
    const href = [...VOCI_FOOTER[lingua].map(v => v.href), RECESSO_FOOTER[lingua].href]
    assert.equal(new Set(href).size, href.length, `${lingua}: percorsi ripetuti`)
  }
})

test('le voci italiane portano a percorsi italiani e viceversa', () => {
  // Il cambio lingua e' l'unica voce che punta all'altra: e' il suo compito.
  for (const v of VOCI_FOOTER.it) {
    if (v.lang === 'en') { assert.equal(v.href, '/en'); continue }
    assert.equal(v.href.startsWith('/en/') || v.href === '/en', false, `it -> ${v.href}`)
  }
  for (const v of VOCI_FOOTER.en) {
    if (v.lang === 'it') { assert.equal(v.href, '/'); continue }
    assert.equal(v.href.startsWith('/en'), true, `en -> ${v.href}`)
  }
  assert.equal(RECESSO_FOOTER.it.href.startsWith('/en'), false)
  assert.equal(RECESSO_FOOTER.en.href.startsWith('/en'), true)
})
