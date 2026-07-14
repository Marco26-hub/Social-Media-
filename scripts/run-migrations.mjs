#!/usr/bin/env node

import pg from 'pg'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const fileArgIndex = argv.indexOf('--file')
const onlyFile = fileArgIndex >= 0 ? argv[fileArgIndex + 1] : null

if (fileArgIndex >= 0 && !onlyFile) {
  console.error('Uso: npm run migrate -- --file 011_admin_user.sql')
  process.exit(1)
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = path.join(rootDir, 'db', 'migrations')

function checksum(content) {
  return createHash('sha256').update(content).digest('hex')
}

// Normalizza la connection string per Supabase: rimuove sslmode (pg lo tratta come
// verify-full e rifiuta il cert chain del pooler) e imposta ssl esplicito. Traffico
// comunque cifrato (TLS). sslmode=disable → nessun SSL (Postgres locale).
function pgConfig(url) {
  try {
    const u = new URL(url)
    const disable = u.searchParams.get('sslmode') === 'disable'
    u.searchParams.delete('sslmode')
    return { connectionString: u.toString(), ssl: disable ? false : { rejectUnauthorized: false } }
  } catch {
    return { connectionString: url, ssl: { rejectUnauthorized: false } }
  }
}

function explainTarget(files) {
  const suffix = onlyFile ? ` solo ${onlyFile}` : ''
  console.log(`Migrazioni trovate${suffix}:`)
  for (const file of files) {
    console.log(`- ${file}`)
  }
}

async function main() {
  const allFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right))

  const files = onlyFile ? allFiles.filter((file) => file === onlyFile) : allFiles

  if (files.length === 0) {
    console.error(onlyFile ? `Migration non trovata: ${onlyFile}` : 'Nessuna migration .sql trovata.')
    process.exit(1)
  }

  if (dryRun) {
    explainTarget(files)
    console.log('Dry-run completato: nessuna query eseguita.')
    return
  }

  // Le migrazioni girano sulla connessione DIRETTA (Supabase: pooler session :5432,
  // IPv4). NON usare il pooler transaction :6543 qui: serve multi-statement/DDL.
  // Fallback a DATABASE_URL per il locale dove ce n'è una sola.
  const databaseUrl = (process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL)?.trim()
  if (!databaseUrl) {
    console.error('DIRECT_DATABASE_URL/DATABASE_URL mancante. Impostala prima di eseguire le migrazioni.')
    process.exit(1)
  }

  // Supabase pooler: rimuovi sslmode dalla stringa (pg lo tratta come verify-full e
  // rifiuta il cert chain) e imposta ssl esplicito. Traffico comunque cifrato (TLS).
  const { connectionString, ssl } = pgConfig(databaseUrl)
  const client = new pg.Client({ connectionString, ssl })
  await client.connect()

  try {
    await client.query(`
      create table if not exists schema_migrations (
        filename text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      )
    `)

    const appliedRows = (await client.query('select filename, checksum from schema_migrations')).rows
    const applied = new Map(appliedRows.map((row) => [row.filename, row.checksum]))

    explainTarget(files)

    for (const filename of files) {
      const fullPath = path.join(migrationsDir, filename)
      const content = await readFile(fullPath, 'utf8')
      const hash = checksum(content)
      const existingHash = applied.get(filename)

      if (existingHash) {
        if (existingHash !== hash) {
          throw new Error(
            `Checksum diversa per ${filename}. Non modificare migration già applicate: crea una nuova migration.`
          )
        }

        console.log(`✓ skip ${filename}`)
        continue
      }

      console.log(`→ apply ${filename}`)
      try {
        // Invia il file INTERO: è Postgres a fare il parsing (commenti, dollar-quote,
        // `;` nelle stringhe, CRLF). Niente splitter hand-rolled fragile. Tutti gli
        // statement del file girano in un'unica transazione implicita: se uno fallisce,
        // rollback dell'intero file (il record in schema_migrations avviene solo dopo).
        await client.query(content)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`${filename}: ${message}`)
      }
      await client.query(
        'insert into schema_migrations (filename, checksum) values ($1, $2)',
        [filename, hash],
      )
      console.log(`✓ applied ${filename}`)
    }

    console.log('Migrazioni completate.')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('Migrazione fallita:')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
