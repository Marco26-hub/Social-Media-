import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'playwright/test'

test('la 404 del segmento non nomina regali, materiali, campagne o codici', () => {
  const source = readFileSync(join(process.cwd(), 'app', '(it)', 'download', '[codice]', 'not-found.tsx'), 'utf8')
  // singolare e plurale: "materiale" e "codici" valgono quanto "materiali" e "codice"
  assert.doesNotMatch(source, /regal|material[ei]|campagn|codic[ei]|riservat/i)
  // Il titolo è il solo H1 e le azioni sono link veri: la frase o l'etichetta da sole
  // comparirebbero anche in un commento.
  assert.match(source, /<h1[^>]*>Questa pagina non esiste o non è più disponibile\.<\/h1>/)
  assert.match(source, /<Link\b[^>]*href="\/"[^>]*>\s*Vai alla home/)
  // i due link esterni si aprono in un'altra scheda senza consegnare l'opener né il referrer
  assert.match(source, /<a\b[^>]*rel="noopener noreferrer"[^>]*>\s*Seguici su Instagram\s*<\/a>/)
  assert.match(source, /<a\b[^>]*rel="noopener noreferrer"[^>]*>\s*Scrivici su WhatsApp\s*<\/a>/)
})
