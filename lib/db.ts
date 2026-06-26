import { neon } from '@neondatabase/serverless'

type QueryRow = Record<string, unknown>

let cachedDatabaseUrl = ''
let cachedSql: ReturnType<typeof neon> | null = null

export function dbReady() {
  return Boolean(process.env.DATABASE_URL?.trim())
}

function getSql() {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) throw new Error('DATABASE_URL not configured')

  if (!cachedSql || cachedDatabaseUrl !== databaseUrl) {
    cachedDatabaseUrl = databaseUrl
    cachedSql = neon(databaseUrl)
  }

  return cachedSql
}

export async function q(query: string, params: unknown[] = []): Promise<QueryRow[]> {
  return await getSql().query<false, false>(query, params) as QueryRow[]
}

export async function q1(query: string, params: unknown[] = []): Promise<QueryRow | null> {
  const rows = await q(query, params)
  return rows[0] || null
}
