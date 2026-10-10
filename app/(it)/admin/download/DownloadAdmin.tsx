'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { moveItem } from '@/lib/download-area'
import type { DownloadItem } from '@/lib/download-area-db'
import AddItemSection from './AddItemSection'
import { callApi, type ApiResult } from './api'
import ItemCard from './ItemCard'
import SecretLinkSection from './SecretLinkSection'

type ListResponse = { items: DownloadItem[]; code: string | null; needs_migration: boolean }

export default function DownloadAdmin() {
  const listTitleId = useId()
  const [items, setItems] = useState<DownloadItem[]>([])
  const [code, setCode] = useState<string | null>(null)
  const [needsMigration, setNeedsMigration] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Errori che riguardano l'elenco intero (es. ordine cambiato altrove), non una scheda sola.
  const [notice, setNotice] = useState<string | null>(null)
  // Una sola modifica alla volta sull'elenco: finché una richiesta è in corso, le altre azioni sono disattivate.
  const [pending, setPending] = useState(false)

  // Rilegge tutto dal server e aggiorna lo stato a video.
  const fetchList = useCallback(async (): Promise<{ ok: true; items: DownloadItem[] } | { ok: false; error: string }> => {
    const res = await callApi<ListResponse>('/api/admin/downloads')
    if (!res.ok) return { ok: false, error: res.error }
    setItems(res.data.items)
    setCode(res.data.code)
    setNeedsMigration(res.data.needs_migration)
    return { ok: true, items: res.data.items }
  }, [])

  // Come fetchList, ma restituisce solo il messaggio d'errore (null se è andata bene).
  const reload = useCallback(async (): Promise<string | null> => {
    const list = await fetchList()
    return list.ok ? null : list.error
  }, [fetchList])

  // Per il modulo file: l'elenco aggiornato, o null se la lettura non riesce.
  async function refreshItems(): Promise<DownloadItem[] | null> {
    const list = await fetchList()
    return list.ok ? list.items : null
  }

  // Primo caricamento (e "Riprova"): l'unico che mostra lo stato "Caricamento".
  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(await reload())
    setLoading(false)
  }, [reload])

  useEffect(() => {
    void load()
  }, [load])

  async function exclusive(task: () => Promise<string | null>): Promise<string | null> {
    if (pending) return null
    setPending(true)
    setNotice(null)
    try {
      return await task()
    } finally {
      setPending(false)
    }
  }

  // Scheda sparita (404) o elenco vecchio (409): si ricarica e il messaggio del server
  // resta a livello pagina, perché la scheda che l'ha causato potrebbe non esserci più.
  async function failed(res: Extract<ApiResult<unknown>, { ok: false }>): Promise<string | null> {
    if (res.status === 404 || res.status === 409) {
      setNotice(res.error)
      const reloadError = await reload()
      return reloadError
    }
    return res.error
  }

  async function generateCode(): Promise<string | null> {
    const res = await callApi<{ code: string }>('/api/admin/downloads/code', { method: 'POST' })
    if (!res.ok) return res.error
    setCode(res.data.code)
    return null
  }

  async function handleCreated() {
    setNotice(null)
    const reloadError = await reload()
    if (reloadError) setNotice(`La scheda è stata aggiunta ma l’elenco non si è aggiornato: ${reloadError}`)
  }

  function saveItem(id: string, text: { title: string; description: string | null }) {
    return exclusive(async () => {
      const res = await callApi<{ item: DownloadItem }>(`/api/admin/downloads/${id}`, { method: 'PATCH', body: text })
      if (!res.ok) return failed(res)
      setItems(current => current.map(item => (item.id === id ? res.data.item : item)))
      return null
    })
  }

  function toggleVisible(item: DownloadItem) {
    return exclusive(async () => {
      const res = await callApi<{ item: DownloadItem }>(`/api/admin/downloads/${item.id}`, {
        method: 'PATCH',
        body: { visible: !item.visible },
      })
      if (!res.ok) return failed(res)
      setItems(current => current.map(entry => (entry.id === item.id ? res.data.item : entry)))
      return null
    })
  }

  function moveItemBy(id: string, direction: 'up' | 'down') {
    const ids = items.map(item => item.id)
    const next = moveItem(ids, id, direction)
    if (next.every((value, index) => value === ids[index])) return Promise.resolve(null)
    return exclusive(async () => {
      // Servono tutti gli id, schede nascoste incluse, nel nuovo ordine.
      const res = await callApi<{ ok: true }>('/api/admin/downloads/reorder', { method: 'POST', body: { ids: next } })
      if (!res.ok) return failed(res)
      return reload()
    })
  }

  function deleteItem(id: string) {
    return exclusive(async () => {
      const res = await callApi<{ ok: true }>(`/api/admin/downloads/${id}`, { method: 'DELETE' })
      if (!res.ok) return failed(res)
      return reload()
    })
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Area download</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Gestisci i materiali della pagina riservata: li vede solo chi ha il link segreto.
        </p>
      </header>

      {loading ? (
        <div role="status" className="card p-10 text-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" aria-hidden="true" />
          Caricamento
        </div>
      ) : loadError ? (
        <div className="card p-5">
          <p role="alert" className="text-sm text-red-600">{loadError}</p>
          <button type="button" onClick={() => void load()} className="btn-secondary mt-3">Riprova</button>
        </div>
      ) : needsMigration ? (
        <p role="alert" className="card p-4 text-sm text-amber-800 bg-amber-50 border-amber-200">
          Database non pronto: applica la migrazione 052 (npm run migrate) e ricarica.
        </p>
      ) : (
        <div className="space-y-4">
          <SecretLinkSection code={code} onGenerate={generateCode} />
          <AddItemSection onCreated={handleCreated} onRefresh={refreshItems} />

          <section className="card p-5" aria-labelledby={listTitleId}>
            <h2 id={listTitleId} className="font-bold text-gray-900 mb-4">
              Schede <span className="text-gray-500 font-normal">({items.length})</span>
            </h2>
            {notice && <p role="alert" className="text-sm text-red-600 mb-3">{notice}</p>}
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">Nessuna scheda: aggiungine una qui sopra.</p>
            ) : (
              <ol className="space-y-3">
                {items.map((item, index) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    total={items.length}
                    busy={pending}
                    onSave={saveItem}
                    onToggle={toggleVisible}
                    onMove={moveItemBy}
                    onDelete={deleteItem}
                  />
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
