import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'playwright/test'

test('la 404 del segmento non nomina regali, materiali, campagne o codici', () => {
  const source = readFileSync(join(process.cwd(), 'app', '(it)', 'download', '[codice]', 'not-found.tsx'), 'utf8')
  assert.doesNotMatch(source, /regal|materiali|campagn|codice|riservat/i)
  assert.match(source, /Questa pagina non esiste o non è più disponibile\./)
})
