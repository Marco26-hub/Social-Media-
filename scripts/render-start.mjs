#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const isProduction = process.env.NODE_ENV === 'production'
const hasDatabase = Boolean(process.env.DATABASE_URL?.trim())
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
const isPublishingLive = process.env.PUBLISH_ENABLED === 'true'
const adminEmail = process.env.ADMIN_EMAIL?.trim() || ''
const adminPassword = process.env.ADMIN_PASSWORD?.trim() || ''

// Gate admin hardening ANCORATO al go-live reale (PUBLISH_ENABLED=true), non a
// ogni deploy di produzione. Motivazione: durante setup/test l'app gira in prod
// ma NON pubblica sui social (PUBLISH_ENABLED=false) e l'operatore ha bisogno di
// entrare (anche col default) per configurare. Bloccare ogni deploy impedirebbe
// perfino la configurazione iniziale. Quando si va live davvero (PUBLISH_ENABLED
// =true = clienti reali), ADMIN_EMAIL/ADMIN_PASSWORD diventano OBBLIGATORIE e la
// loro assenza è fatale. Coerente col doppio flag demo/publish del progetto.
const requireAdminHardening = isProduction && !isDemoMode && isPublishingLive

// Verifica coerente con requireAdminHardening.
function assertAdminCredentialsIfNeeded() {
  if (!isProduction || isDemoMode || !hasDatabase) return
  const missing = []
  if (!adminEmail) missing.push('ADMIN_EMAIL')
  if (!adminPassword) missing.push('ADMIN_PASSWORD')
  if (adminPassword && adminPassword.length < 8) missing.push('ADMIN_PASSWORD (min 8 char)')
  if (!missing.length) return

  if (requireAdminHardening) {
    console.error(`[render-start] FATAL: PUBLISH_ENABLED=true ma mancano env admin: ${missing.join(', ')}.`)
    console.error('[render-start] In go-live reale ADMIN_EMAIL e ADMIN_PASSWORD (>=8 char) sono obbligatorie. Settale nel dashboard Render.')
    process.exit(1)
  }
  console.warn(`[render-start] ⚠️  ${missing.join(', ')} non impostate: il default 'admin'/'1234567' resta attivo per il setup.`)
  console.warn("[render-start] ⚠️  PRIMA di PUBLISH_ENABLED=true (go-live reale) DEVI settare ADMIN_EMAIL + ADMIN_PASSWORD, altrimenti il deploy fallirà.")
}

function runMigrationsIfNeeded() {
  if (!hasDatabase) {
    console.log('[render-start] DATABASE_URL assente: salto migrations e avvio in demo/setup mode.')
    return
  }

  console.log('[render-start] DATABASE_URL presente: eseguo migrations Neon prima dello start...')
  const result = spawnSync(process.execPath, ['scripts/run-migrations.mjs'], {
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    const code = typeof result.status === 'number' ? result.status : 1
    console.error(`[render-start] Migrations fallite. Blocco avvio con exit code ${code}.`)
    process.exit(code)
  }

  console.log('[render-start] Migrations completate.')
}

function ensureAdminIfNeeded() {
  if (!hasDatabase) return
  console.log('[render-start] Bootstrap admin da env...')
  const result = spawnSync(process.execPath, ['scripts/ensure-admin.mjs'], {
    stdio: 'inherit',
    env: process.env,
  })
  // Al go-live reale (PUBLISH_ENABLED=true) un fallimento del bootstrap admin è
  // FATALE: resterebbe attivo il fallback 'admin'/'1234567' con clienti reali.
  // In setup/test è solo un warning (non blocca la configurazione).
  if (result.status !== 0) {
    if (requireAdminHardening) {
      console.error(`[render-start] FATAL: ensure-admin ha restituito ${result.status}. Non avvio in go-live con default admin attivo.`)
      process.exit(2)
    }
    console.warn('[render-start] ensure-admin ha restituito codice non-zero (ignorato in setup/demo/dev).')
  }
}

function startNext() {
  const nextBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'next.cmd' : 'next')
  const command = existsSync(nextBin) ? nextBin : 'next'
  const child = spawn(command, ['start'], {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  })

  const forwardSignal = (signal) => {
    if (!child.killed) child.kill(signal)
  }

  process.on('SIGTERM', () => forwardSignal('SIGTERM'))
  process.on('SIGINT', () => forwardSignal('SIGINT'))

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }
    process.exit(code ?? 0)
  })
}

if (!isProduction) {
  console.log('[render-start] NODE_ENV non production: avvio Next senza migrations automatiche.')
} else {
  assertAdminCredentialsIfNeeded()
  runMigrationsIfNeeded()
  ensureAdminIfNeeded()
}

startNext()
