import { Pool, types } from 'pg'

// Colonne `date` (OID 1082) restituite come STRINGA 'YYYY-MM-DD', non come Date.
//
// Il parser di serie di pg dichiara: "Force YYYY-MM-DD dates to be parsed as
// local time" — costruisce cioe un Date a mezzanotte LOCALE. Su un processo in
// Europe/Rome '2026-09-08' diventa 2026-09-07T22:00:00Z, e toYmd (che legge i
// componenti UTC) restituisce 2026-09-07: un giorno prima, su ogni data del
// calendario. In produzione non mordeva perche Vercel gira in UTC, ma bastava
// un ambiente con fuso diverso — lo sviluppo in locale — per spostare indietro
// l'intero piano editoriale. In un prodotto che programma pubblicazioni non e
// un dettaglio estetico.
//
// Tenendo la stringa grezza non esiste piu nessuna conversione di fuso: e la
// stessa forma che il resto del codice si aspetta (toYmd, zonedToUtcIso,
// confronti fra date ISO). I timestamp (1114/1184) restano Date: li l'istante
// e reale e il fuso conta.
types.setTypeParser(1082, value => value)

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
