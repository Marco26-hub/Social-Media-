'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ChevronDown } from 'lucide-react'
import {
  readActiveClienteId,
  writeActiveClienteId,
  pickDefaultClienteId,
  type ClienteAccessRow,
} from '@/lib/tenant/client'

export default function ClienteSelector() {
  const router = useRouter()
  const [rows, setRows] = useState<ClienteAccessRow[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/data/clienti')
      if (!response.ok) {
        setRows([])
        setActiveId(null)
        return
      }

      const clienti = await response.json() as ClienteAccessRow['clienti'][]
      const access = clienti
        .filter(Boolean)
        .map(cliente => ({
          cliente_id: cliente!.id,
          ruolo: 'owner',
          clienti: cliente,
        }))
      const cookieId = readActiveClienteId()
      const nextId = cookieId && access.some(row => row.cliente_id === cookieId)
        ? cookieId
        : pickDefaultClienteId(access.map(row => row.clienti).filter(Boolean) as { id: string; slug?: unknown; nome?: unknown }[])

      if (nextId) writeActiveClienteId(nextId)
      setRows(access)
      setActiveId(nextId)
    }

    load()
  }, [])

  if (rows.length === 0) {
    return (
      <div className="px-3 py-3 border-b border-white/10 text-xs text-white/50">
        Nessun cliente assegnato
      </div>
    )
  }

  function changeCliente(clienteId: string) {
    writeActiveClienteId(clienteId)
    setActiveId(clienteId)
    router.refresh()
  }

  return (
    <div className="px-3 py-3 border-b border-white/10">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-1">
        Cliente attivo
      </label>
      <div className="relative mt-1.5">
        <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        <select
          value={activeId ?? ''}
          onChange={event => changeCliente(event.target.value)}
          className="w-full appearance-none rounded-lg bg-white/10 py-2 pl-8 pr-8 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-brand-500"
        >
          {rows.map(row => (
            <option key={row.cliente_id} value={row.cliente_id} className="text-gray-900">
              {row.clienti?.nome ?? row.cliente_id}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
      </div>
    </div>
  )
}
