'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Cliente } from '@/lib/types'

export const ACTIVE_CLIENTE_COOKIE = 'active_cliente_id'

export function readActiveClienteId() {
  if (typeof document === 'undefined') return null
  const found = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${ACTIVE_CLIENTE_COOKIE}=`))

  return found ? decodeURIComponent(found.split('=')[1]) : null
}

export function writeActiveClienteId(clienteId: string) {
  document.cookie = `${ACTIVE_CLIENTE_COOKIE}=${encodeURIComponent(clienteId)}; path=/; max-age=31536000; SameSite=Lax`
}

export function useActiveClienteId() {
  const [clienteId, setClienteId] = useState<string | null>(() => readActiveClienteId())
  const [loading, setLoading] = useState(!clienteId)

  useEffect(() => {
    if (clienteId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from('user_client_access')
      .select('cliente_id')
      .eq('attivo', true)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.cliente_id) {
          writeActiveClienteId(data.cliente_id)
          setClienteId(data.cliente_id)
        }
        setLoading(false)
      })
  }, [clienteId])

  return { clienteId, loading }
}

export type ClienteAccessRow = {
  cliente_id: string
  ruolo: string
  clienti: Cliente | null
}
