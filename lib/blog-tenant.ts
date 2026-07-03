import { headers } from 'next/headers'
import { dbReady, q } from '@/lib/db'

// Multi-tenant reale per il blog pubblico: ogni cliente ha il proprio dominio/sottodominio
// (es. blog.silkincom.com), configurato in clienti.blog_domain da /dashboard/clienti/[id].
// Risolve il cliente dal Host header della richiesta — MAI da una variabile fissa condivisa,
// altrimenti con più clienti gli articoli finirebbero mischiati sulla stessa pagina pubblica.
// Host non mappato a nessun cliente → null, niente articoli (fail-safe: mai "mostra tutti").
export async function resolveBlogClienteId(): Promise<string | null> {
  if (!dbReady()) return null
  const h = await headers()
  const host = (h.get('host') || '').split(':')[0].toLowerCase().trim()
  if (!host) return null
  try {
    const rows = await q('SELECT id FROM clienti WHERE blog_domain = $1 LIMIT 1', [host])
    return rows[0] ? (rows[0] as { id: string }).id : null
  } catch {
    return null
  }
}
