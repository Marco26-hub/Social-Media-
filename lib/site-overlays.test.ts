import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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
})

test('MetaPixel resta escluso su /download', () => {
  assert.match(read('components', 'MetaPixel.tsx'), /isDownloadPath\(pathname\)/)
})

// Si legge il sorgente intero, commenti compresi: in questi file nemmeno un commento
// può nominare i termini vietati. I file non ancora creati si saltano (arrivano con
// la pagina regali e con la 404 del segmento) e il test li controlla da quando esistono.
test('la pagina dei regali non porta pixel, CAPI né consenso', () => {
  for (const file of ['page.tsx', 'GiftPage.tsx', 'not-found.tsx']) {
    let source = ''
    try { source = read('app', '(it)', 'download', '[codice]', file) } catch { continue }
    assert.doesNotMatch(source, /MetaPixel|meta-conversions-api|CookieBanner|cookie-consent/, file)
  }
})
