import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { callAI } from './ai'

// Fetch che non risponde mai: simula il modello lento. Rispetta l'AbortSignal,
// quindi il tempo speso è esattamente il timeout deciso da callAI.
function hangingFetch(onCall: () => void): typeof fetch {
  return ((_url: unknown, init?: { signal?: AbortSignal }) => {
    onCall()
    return new Promise((_resolve, reject) => {
      const signal = init?.signal
      if (!signal) return
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })
  }) as unknown as typeof fetch
}

async function withStubbedOpenRouter(onCall: () => void, run: () => Promise<void>) {
  const prevKey = process.env.OPENROUTER_API_KEY
  const prevFetch = globalThis.fetch
  process.env.OPENROUTER_API_KEY = 'sk-or-v1-test000000000000000000000'
  globalThis.fetch = hangingFetch(onCall)
  try {
    await run()
  } finally {
    globalThis.fetch = prevFetch
    if (prevKey === undefined) delete process.env.OPENROUTER_API_KEY
    else process.env.OPENROUTER_API_KEY = prevKey
  }
}

test('the model cascade respects a global deadline instead of spending the full timeout on every model', async () => {
  // Regressione del piano mensile: `timeoutMs` vale per OGNI modello, quindi la
  // cascata (modello + 2 fallback) poteva durare 3 volte tanto e sfondare
  // l'attesa del browser, che mostrava "Richiesta troppo lunga" mentre il server
  // continuava a generare. Con `deadlineAt` la cascata si chiude entro il budget.
  let calls = 0
  await withStubbedOpenRouter(() => { calls++ }, async () => {
    const started = Date.now()
    await assert.rejects(
      callAI({
        model: 'google/gemma-4-31b-it:free',
        userPrompt: 'piano di prova',
        timeoutMs: 60000,
        deadlineAt: Date.now() + 9000,
      }),
      (e: Error) => /tempo.*esaurito/i.test(e.message),
    )
    const elapsed = Date.now() - started
    // Senza deadline sarebbero stati 3 × 60s.
    assert.ok(elapsed < 20000, `cascata durata ${elapsed}ms, oltre il budget di 9s`)
    assert.ok(calls <= 2, `${calls} tentativi: la cascata non si è fermata alla scadenza`)
  })
})

test('without a deadline the single-attempt timeout still applies', async () => {
  let calls = 0
  await withStubbedOpenRouter(() => { calls++ }, async () => {
    await assert.rejects(callAI({
      model: 'google/gemma-4-31b-it:free',
      userPrompt: 'piano di prova',
      timeoutMs: 1200,
      silentFallback: false,
    }))
    assert.equal(calls, 1, 'senza fallback deve restare un solo tentativo')
  })
})
