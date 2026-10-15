import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'playwright/test'
import { anteprimaNota, anteprimaOg, contenutoAnteprima } from './anteprima'

test('/regali: voce fissa con il testo dello spec', () => {
  assert.equal(anteprimaNota('/regali'), true)
  assert.deepEqual(contenutoAnteprima('/regali'), {
    occhiello: 'Regali',
    titolo: 'I regali di Social Web Automation.',
    sottotitolo: 'Materiali gratuiti per chi ci segue: si aprono subito, senza registrazione.',
    tinta: 'verde',
  })
  assert.match(anteprimaOg('/regali')[0].url, /p=%2Fregali$/)
})

test('un percorso con il codice non è un’anteprima nota', () => {
  assert.equal(anteprimaNota('/download/k7f3q9xzm2p4v8wn'), false)
  // La perdita vera passa da contenutoAnteprima, che dà il testo all'immagine (la rotta la
  // disegna con quello) e all'alt di anteprimaOg: un percorso con il codice ripiega sulla
  // scheda dell'azienda (quella della home) e non ha una voce propria.
  assert.deepEqual(contenutoAnteprima('/download/k7f3q9xzm2p4v8wn'), contenutoAnteprima('/'))
})

// anteprimaOg mette il percorso nell'URL dell'immagine: con il codice nel percorso il codice uscirebbe.
test('la pagina regali chiama anteprimaOg solo con /regali', () => {
  const page = readFileSync(join(process.cwd(), 'app', '(it)', 'download', '[codice]', 'page.tsx'), 'utf8')
  const calls = page.match(/anteprimaOg\(/g) ?? []
  const safe = page.match(/anteprimaOg\('\/regali'\)/g) ?? []
  assert.ok(calls.length > 0)
  assert.equal(calls.length, safe.length)
})

// Una `metadata` statica farebbe comparire il titolo dei regali sulla 404 pubblica: Next applica
// i metadata della pagina anche quando risponde con notFound(). Si calcolano quindi in
// generateMetadata (codice sbagliato → metadata neutri) e le schede si leggono una volta sola per
// richiesta con cache(), condivisa fra metadata e pagina.
test('la pagina regali calcola i metadata con generateMetadata e non ne esporta di fissi', () => {
  const page = readFileSync(join(process.cwd(), 'app', '(it)', 'download', '[codice]', 'page.tsx'), 'utf8')
  assert.doesNotMatch(page, /export\s+const\s+metadata\b/)
  assert.match(page, /^export async function generateMetadata\(/m)
  // anche un commento può nominare cache(): serve la chiamata vera, assegnata a una costante
  assert.match(page, /=\s*cache\(/)
})
