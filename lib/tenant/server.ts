import { cookies } from 'next/headers'
import { q } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'

export const ACTIVE_CLIENTE_COOKIE = 'active_cliente_id'

export async function getActiveClienteId() {
  const cookieStore = await cookies()
  const cookieClienteId = cookieStore.get(ACTIVE_CLIENTE_COOKIE)?.value

  if (cookieClienteId) return cookieClienteId

  const user = await requireAuth()
  const rows = await q(
    'SELECT cliente_id FROM user_client_access WHERE user_id = $1 AND attivo = true LIMIT 1',
    [user.id]
  )
  return (rows[0] as { cliente_id?: string } | undefined)?.cliente_id ?? null
}

export function applyClienteFilter(baseSql: string, clienteId: string | null) {
  return clienteId ? `${baseSql} WHERE cliente_id = $1` : baseSql
}
