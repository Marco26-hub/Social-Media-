#!/usr/bin/env node

import { neon } from '@neondatabase/serverless'
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

  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    console.error('DATABASE_URL mancante. Impostala prima di eseguire le migrazioni Neon.')
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  await sql.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `)

  const appliedRows = await sql`select filename, checksum from schema_migrations`
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
    await sql.query(content)
    await sql`
      insert into schema_migrations (filename, checksum)
      values (${filename}, ${hash})
    `
    console.log(`✓ applied ${filename}`)
  }

  console.log('Migrazioni completate.')
}

main().catch((error) => {
  console.error('Migrazione fallita:')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
