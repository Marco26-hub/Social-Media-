#!/usr/bin/env node

// Preparazione di Remotion PRIMA di `next build` (vedi lo script "build").
// Due compiti:
//  1. scaricare il Chromium headless usato da renderMedia per disegnare i fotogrammi;
//  2. PRE-BUILDARE il bundle della composizione.
//
// Il punto 2 è ciò che rende il render possibile in serverless: prima il bundle
// veniva compilato con webpack a RUNTIME, dentro la richiesta, su disco effimero e
// da capo a ogni cold start. Qui lo costruiamo una volta sola in fase di build e lo
// spediamo con la funzione (vedi outputFileTracingIncludes in next.config.mjs).

import path from 'node:path'
import { ensureBrowser } from '@remotion/renderer'
import { bundle } from '@remotion/bundler'

if (process.env.VERCEL) {
  console.log('[remotion] browser: @sparticuz/chromium (serverless)')
} else {
  const status = await ensureBrowser({
    chromeMode: 'headless-shell',
    logLevel: 'info',
  })
  console.log(`[remotion] browser: ${status.type}${'path' in status ? ` (${status.path})` : ''}`)
}

const outDir = path.join(process.cwd(), '.remotion-bundle')
const serveUrl = await bundle({
  entryPoint: path.join(process.cwd(), 'remotion', 'index.tsx'),
  outDir,
  publicDir: null,
  rootDir: process.cwd(),
  enableCaching: true,
  onProgress: () => {},
})

// NON rimuovere i file .map: Remotion li legge in prepareServer per simbolicare
// gli stack trace e senza bundle.js.map selectComposition muore con ENOENT.
// Verificato: rimuovendoli il render fallisce subito (~12MB risparmiati, pipeline rotta).
console.log(`[remotion] bundle pre-buildato: ${serveUrl}`)
