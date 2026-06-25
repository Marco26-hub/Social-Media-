const DB_URL = process.env.DATABASE_URL

export function dbReady() {
  return !!DB_URL
}

function neonApiUrl(): string {
  const url = new URL(DB_URL!.replace('postgresql://', 'https://').replace('postgres://', 'https://'))
  url.pathname = '/sql'
  return url.toString()
}

type QueryRow = Record<string, unknown>
type QueryResult = { rows: QueryRow[] }

async function fetchNeon(query: string, params: unknown[] = []): Promise<QueryResult> {
  if (!DB_URL) throw new Error('DATABASE_URL not configured')
  const res = await fetch(neonApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DB_URL}`,
    },
    body: JSON.stringify({ query, params }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Neon error: ${JSON.stringify(data)}`)
  return data as QueryResult
}

export async function q(query: string, params: unknown[] = []): Promise<QueryRow[]> {
  const result = await fetchNeon(query, params)
  return result.rows
}

export async function q1(query: string, params: unknown[] = []): Promise<QueryRow | null> {
  const rows = await q(query, params)
  return rows[0] || null
}
