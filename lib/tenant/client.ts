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

// Cliente di default quando non c'è ancora una scelta (nessun cookie). "Per ora"
// l'admin deve partire su silkincom, non sul primo in ordine alfabetico (pino).
// Gli altri clienti restano comunque selezionabili nel menu.
const DEFAULT_CLIENTE_SLUG = 'silkincom'

export function pickDefaultClienteId(clienti: Array<{ id: string; slug?: unknown; nome?: unknown }>): string | null {
  const matches = (v: unknown) => typeof v === 'string' && v.trim().toLowerCase() === DEFAULT_CLIENTE_SLUG
  const preferred = clienti.find(c => matches(c.slug) || matches(c.nome))
  return (preferred?.id ?? clienti[0]?.id) ?? null
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
        const firstId = pickDefaultClienteId(clienti)
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
