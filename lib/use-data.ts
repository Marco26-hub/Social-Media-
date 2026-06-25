'use client'
import { useState, useEffect, useCallback } from 'react'
import { isDemo } from '@/lib/demo'

type FetchState<T> = { data: T; loading: boolean }

let _clienteId: string | null = null
function getClienteId() {
  if (typeof document === 'undefined') return ''
  if (_clienteId) return _clienteId
  const found = document.cookie.split('; ').find(r => r.startsWith('active_cliente_id='))
  _clienteId = found ? decodeURIComponent(found.split('=')[1]) : ''
  return _clienteId
}

export function refreshClienteId() { _clienteId = null }

export function useApi<T>(url: string, demoFallback: T, deps: unknown[] = []): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: demoFallback, loading: !isDemo() })

  const fetchData = useCallback(async () => {
    if (isDemo()) { setState({ data: demoFallback, loading: false }); return }
    setState(s => ({ ...s, loading: true }))
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setState({ data: data as T, loading: false })
    } catch {
      setState(s => ({ ...s, loading: false }))
    }
  }, [url, ...deps])

  useEffect(() => { fetchData() }, [fetchData])
  return state
}

export function readClienteId() { return getClienteId() }
export function writeClienteId(id: string) {
  _clienteId = id
  document.cookie = `active_cliente_id=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`
}
