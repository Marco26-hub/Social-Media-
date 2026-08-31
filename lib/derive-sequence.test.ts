import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { deriveSequenceFromMedia } from './derive-sequence'
import { evaluateNarrativeContract } from './format-narrative'

const CINQUE = ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg']

test('a carousel with five final images gets one slide per image, cover first and CTA last', () => {
  const slides = deriveSequenceFromMedia('carousel', CINQUE)
  assert.equal(slides.length, 5)
  assert.equal(slides[0].ruolo, 'cover')
  assert.equal(slides[4].ruolo, 'cta')
  assert.deepEqual(slides.map(s => s.media), CINQUE)
  assert.deepEqual(slides.map(s => s.numero), [1, 2, 3, 4, 5])
})

test('the derived sequence satisfies the narrative contract that was blocking the content', () => {
  // Caso reale: quattro caroselli con 5 immagini gia impresse, fermi con
  // "servono 5-10 slide narrative (attuali: 0)".
  const issues = evaluateNarrativeContract({
    formato: 'carousel',
    hook: 'Nessuno ti dice come si crea davvero una strategia social che funziona.',
    cta: 'Scopri il metodo',
    slides: deriveSequenceFromMedia('carousel', CINQUE),
  })
  assert.deepEqual(issues, [])
})

test('below the carousel minimum nothing is derived: the gate must keep complaining', () => {
  assert.deepEqual(deriveSequenceFromMedia('carousel', ['a.jpg', 'b.jpg']), [])
  assert.deepEqual(deriveSequenceFromMedia('carousel', []), [])
})

test('a carousel never exceeds ten slides even with more media', () => {
  const molte = Array.from({ length: 14 }, (_, i) => `f${i}.jpg`)
  assert.equal(deriveSequenceFromMedia('carousel', molte).length, 10)
})

test('a reel built from five photos gets the five narrative roles in order', () => {
  const scene = deriveSequenceFromMedia('reel', CINQUE)
  assert.deepEqual(scene.map(s => s.ruolo), ['hook', 'tensione', 'prova', 'payoff', 'cta_loop'])
})

test('an already rendered reel (one MP4) derives nothing: it has no scenes to declare', () => {
  assert.deepEqual(deriveSequenceFromMedia('reel', ['montaggio.mp4']), [])
  // Nemmeno un numero di foto diverso da cinque: sarebbe una sequenza inventata.
  assert.deepEqual(deriveSequenceFromMedia('reel', ['a.jpg', 'b.jpg']), [])
})

test('a story derives exactly its three frames', () => {
  const frames = deriveSequenceFromMedia('story', ['1.jpg', '2.jpg', '3.jpg'])
  assert.deepEqual(frames.map(f => f.ruolo), ['apertura', 'sviluppo', 'risoluzione'])
  assert.deepEqual(deriveSequenceFromMedia('story', ['1.jpg', '2.jpg']), [])
})

test('a plain post derives nothing: it has no sequence', () => {
  assert.deepEqual(deriveSequenceFromMedia('post', CINQUE), [])
})

test('carosello, short and video are read as their canonical format', () => {
  assert.equal(deriveSequenceFromMedia('carosello', CINQUE).length, 5)
  assert.equal(deriveSequenceFromMedia('short', CINQUE).length, 5)
  assert.equal(deriveSequenceFromMedia('video', CINQUE).length, 5)
})
