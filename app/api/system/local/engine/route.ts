import { NextResponse } from 'next/server'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { isLocalEnv } from '@/lib/local-only'
import { dbReady, q } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Verifica connessione Neon + presenza schema (tabella calendario).
async function engineStatus() {
  const configured = dbReady()
  if (!configured) return { configured: false, connected: false, schemaReady: false }
  try {
    await q('SELECT 1')
    let schemaReady = false
    try {
      const rows = await q("SELECT to_regclass('public.calendario') AS t")
      schemaReady = Boolean(rows[0]?.t)
    } catch {
      schemaReady = false
    }
    return { configured: true, connected: true, schemaReady }
  } catch {
    return { configured: true, connected: false, schemaReady: false }
  }
}

// GET — stato motore dati (Neon Postgres cloud)
export async function GET() {
  const status = await engineStatus()
  return NextResponse.json({ ...status, engine: 'neon-postgres (cloud)' })
}

// POST — "Attiva Motore": applica/verifica lo schema con le migrations (solo locale)
export async function POST() {
  if (!isLocalEnv()) {
    return NextResponse.json(
      { error: 'Disponibile solo in ambiente locale (non in produzione).' },
      { status: 403 },
    )
  }
  if (!dbReady()) {
    return NextResponse.json(
      { error: 'DATABASE_URL non configurata in .env.local — imposta la connection string Neon.' },
      { status: 400 },
    )
  }

  // Esegue lo stesso migrator di "npm run migrate" sul DB Neon configurato.
  const script = path.join(process.cwd(), 'scripts', 'run-migrations.mjs')
  const run = spawnSync(process.execPath, [script], {
    env: process.env,
    encoding: 'utf8',
    timeout: 120_000,
  })

  const out = `${run.stdout || ''}${run.stderr || ''}`.slice(-2000)
  if (run.status !== 0) {
    return NextResponse.json(
      { ok: false, error: 'Migrations fallite', log: out },
      { status: 500 },
    )
  }

  const status = await engineStatus()
  return NextResponse.json({ ok: true, ...status, engine: 'neon-postgres (cloud)', log: out })
}
