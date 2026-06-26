#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const isProduction = process.env.NODE_ENV === 'production'
const hasDatabase = Boolean(process.env.DATABASE_URL?.trim())

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

  console.log('[render-start] Migrations completate: avvio Next.js.')
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
  runMigrationsIfNeeded()
}

startNext()
