import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'playwright/test'

// Guardia strutturale. Che i due componenti si montino o no dipende da usePathname()
// e da React, che questi test non eseguono: si legge il sorgente, e se qualcuno
// rimette banner e Odino nel layout o fa entrare il tracciamento nella pagina dei
// regali il test fallisce.
const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), 'utf8')

test('il layout monta SiteOverlays e non importa più banner e Odino direttamente', () => {
  const layout = read('app', '(it)', 'layout.tsx')
  assert.match(layout, /<SiteOverlays \/>/)
  assert.doesNotMatch(layout, /import CookieBanner/)
  assert.doesNotMatch(layout, /import Odino/)
  assert.match(layout, /<MetaPixel \/>/)
})

test('SiteOverlays decide con siteOverlaysEnabled', () => {
  const source = read('components', 'SiteOverlays.tsx')
  assert.match(source, /siteOverlaysEnabled\(/)
  assert.match(source, /<Odino \/>/)
  assert.match(source, /<CookieBanner \/>/)
  // La polarità del cancello: il componente non rende niente quando siteOverlaysEnabled è
  // FALSO. Rovesciato, banner e Odino comparirebbero sui regali e sparirebbero dal resto del sito.
  assert.match(source, /if \(!siteOverlaysEnabled\(pathname\)\) return null/)
})

test('MetaPixel resta escluso su /download', () => {
  assert.match(read('components', 'MetaPixel.tsx'), /isDownloadPath\(pathname\)/)
})

// Si legge il sorgente intero, commenti compresi: in nessun file della pagina nemmeno un
// commento può nominare i termini vietati. Si controllano TUTTI i file .ts e .tsx della
// cartella (anche quelli aggiunti dopo, dove finirebbe una chiamata di tracciamento) e
// nessuno si salta in silenzio: se la cartella cambia nome o un file sparisce, il test lo dice.
test('la pagina dei regali non porta pixel, CAPI né consenso', () => {
  const folder = ['app', '(it)', 'download', '[codice]']
  const files = readdirSync(join(process.cwd(), ...folder), { encoding: 'utf8', recursive: true }).filter(name => /\.tsx?$/.test(name))
  for (const expected of ['page.tsx', 'GiftPage.tsx', 'not-found.tsx', 'InAppNotice.tsx', 'CopyLinkButton.tsx', 'download-copy.ts']) {
    assert.ok(files.includes(expected), `${expected} non è tra i file letti`)
  }
  for (const file of files) {
    assert.doesNotMatch(read(...folder, file), /MetaPixel|meta-conversions-api|CookieBanner|cookie-consent/, file)
  }
})
