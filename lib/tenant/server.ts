import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types'

export const ACTIVE_CLIENTE_COOKIE = 'active_cliente_id'

export async function getActiveClienteId(supabase: SupabaseClient<Database>) {
  const cookieStore = await cookies()
  const cookieClienteId = cookieStore.get(ACTIVE_CLIENTE_COOKIE)?.value

  if (cookieClienteId) return cookieClienteId

  const { data } = await supabase
    .from('user_client_access')
    .select('cliente_id')
    .eq('attivo', true)
    .limit(1)
    .maybeSingle()

  const row = data as { cliente_id?: string } | null
  return row?.cliente_id ?? null
}

export function applyClienteFilter<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  clienteId: string | null
) {
  return clienteId ? query.eq('cliente_id', clienteId) : query
}
