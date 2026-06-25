'use client'

import { useEffect, useState } from 'react'
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

    fetch('/api/data/clienti')
      .then(response => response.ok ? response.json() : [])
      .then((clienti: Cliente[]) => {
        const firstId = clienti[0]?.id
        if (firstId) {
          writeActiveClienteId(firstId)
          setClienteId(firstId)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [clienteId])

  return { clienteId, loading }
}

export type ClienteAccessRow = {
  cliente_id: string
  ruolo: string
  clienti: Cliente | null
}
