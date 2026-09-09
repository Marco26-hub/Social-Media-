import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'playwright/test'
import { SETTORI } from './settori'

// SettorePage costruisce il percorso dell'immagine dallo slug:
// `/images/settori/${settore.slug}-cinematica.webp`. Se il file sul disco ha
// un altro nome nessuno se ne accorge in compilazione: la pagina va online e
// mostra un'immagine rotta. E' successo con le gelaterie, dove lo slug e'
// «gelaterie» e il file era «gelateria».
test('ogni settore ha l immagine che il suo slug richiede', () => {
  const mancanti = SETTORI.filter(
    (s) => !existsSync(join(process.cwd(), 'public', 'images', 'settori', `${s.slug}-cinematica.webp`)),
  ).map((s) => `${s.slug} -> public/images/settori/${s.slug}-cinematica.webp`)
  assert.deepEqual(mancanti, [])
})

test('gli slug dei settori sono unici', () => {
  const slug = SETTORI.map((s) => s.slug)
  assert.equal(new Set(slug).size, slug.length)
})
