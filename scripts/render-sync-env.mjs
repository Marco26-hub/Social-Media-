#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API_BASE = 'https://api.render.com/v1'
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const envFileArgIndex = process.argv.indexOf('--env-file')
const envFile = envFileArgIndex >= 0
  ? process.argv[envFileArgIndex + 1]
  : path.join(rootDir, '.env.render.production.local')
const includeEmpty = args.has('--include-empty')
const deployAfterSync = args.has('--deploy')

function parseEnv(content) {
  const env = new Map()
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eqIndex = line.indexOf('=')
    if (eqIndex < 0) continue
    const key = line.slice(0, eqIndex).trim()
    const value = line.slice(eqIndex + 1).trim()
    if (!includeEmpty && value === '') continue
    env.set(key, value)
  }
  return env
}

async function renderFetch(pathname, options = {}) {
  const apiKey = process.env.RENDER_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('RENDER_API_KEY mancante. Crea una API key Render e rilancia lo script.')
  }

  const response = await fetch(`${API_BASE}${pathname}`, {
    ...options,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${apiKey}`,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(`Render API ${response.status}: ${JSON.stringify(data)}`)
  }
  return data
}

async function resolveServiceId() {
  const explicit = process.env.RENDER_SERVICE_ID?.trim()
  if (explicit) return explicit

  const targetName = process.env.RENDER_SERVICE_NAME?.trim() || 'social-automation-v2'
  const payload = await renderFetch('/services?limit=100')
  const services = Array.isArray(payload) ? payload : payload?.services || []
  const match = services
    .map((entry) => entry.service || entry)
    .find((service) => service?.name === targetName)

  if (!match?.id) {
    throw new Error(`Servizio Render "${targetName}" non trovato. Imposta RENDER_SERVICE_ID manualmente.`)
  }

  return match.id
}

async function main() {
  const serviceId = await resolveServiceId()
  const env = parseEnv(await readFile(envFile, 'utf8'))
  if (!env.size) throw new Error(`Nessuna env valida trovata in ${envFile}`)

  console.log(`Render service: ${serviceId}`)
  for (const [key, value] of env) {
    await renderFetch(`/services/${serviceId}/env-vars/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    })
    console.log(`✓ ${key}`)
  }

  if (deployAfterSync) {
    await renderFetch(`/services/${serviceId}/deploys`, {
      method: 'POST',
      body: JSON.stringify({ clearCache: 'do_not_clear' }),
    })
    console.log('✓ deploy avviato')
  } else {
    console.log('Env sincronizzate. Avvia deploy da Render o rilancia con --deploy.')
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
