import { Pool } from 'pg'

// Driver Postgres su TCP (node-postgres). Prima usava @neondatabase/serverless
// (protocollo HTTP proprietario Neon); Supabase non lo parla, quindi si passa a `pg`
// puntato al pooler Supavisor. Scelto `pg` (non postgres.js) perché il suo type-parsing
// coincide con quello che il driver Neon restituiva → zero drift sui ~220 call-site.
//
// CONNESSIONE (Supabase su Vercel serverless): usare SEMPRE il pooler transaction mode
// (host aws-0-<region>.pooler.supabase.com:6543) in DATABASE_URL — la connessione diretta
// db.<ref>.supabase.co:5432 è IPv6-only e non è raggiungibile da Vercel. Le migrazioni
// usano invece DIRECT_DATABASE_URL (pooler session 5432): vedi scripts/run-migrations.mjs.
// SSL: la stringa deve includere ?sslmode=require (Supabase lo esige).

type QueryRow = Record<string, unknown>

// Normalizza la connection string per Supabase: rimuove `sslmode` dalla query e imposta
// l'SSL esplicitamente. Serve perché pg tratta sslmode=require come verify-full e
// rifiuta il cert chain del pooler ("self-signed certificate in certificate chain"); il
// traffico resta cifrato (TLS), si salta solo la verifica del chain. sslmode=disable
// (Postgres locale senza TLS) → nessun SSL. Verifica stretta: pinnare la CA (ssl.ca).
function pgConfig(url: string): { connectionString: string; ssl: false | { rejectUnauthorized: boolean } } {
  try {
    const u = new URL(url)
    const disable = u.searchParams.get('sslmode') === 'disable'
    u.searchParams.delete('sslmode')
    return { connectionString: u.toString(), ssl: disable ? false : { rejectUnauthorized: false } }
  } catch {
    return { connectionString: url, ssl: { rejectUnauthorized: false } }
  }
}

let cachedDatabaseUrl = ''
let cachedPool: Pool | null = null

export function dbReady() {
  return Boolean(process.env.DATABASE_URL?.trim())
}

function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) throw new Error('DATABASE_URL not configured')

  if (!cachedPool || cachedDatabaseUrl !== databaseUrl) {
    cachedDatabaseUrl = databaseUrl
    const { connectionString, ssl } = pgConfig(databaseUrl)
    cachedPool = new Pool({
      connectionString,
      ssl,
      // Pool piccolo per istanza serverless: il pooler Supavisor multiplexa a monte,
      // così non si esauriscono le connessioni upstream con molte lambda concorrenti.
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    })
  }

  return cachedPool
}

export async function q(query: string, params: unknown[] = []): Promise<QueryRow[]> {
  const result = await getPool().query(query, params as unknown[])
  return result.rows as QueryRow[]
}

export async function q1(query: string, params: unknown[] = []): Promise<QueryRow | null> {
  const rows = await q(query, params)
  return rows[0] || null
}
