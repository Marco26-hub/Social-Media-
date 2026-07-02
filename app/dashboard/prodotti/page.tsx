'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Prodotto } from '@/lib/types'
import { demoProdotti } from '@/lib/demo-data'
import { isDemo } from '@/lib/demo'
import { readClienteId } from '@/lib/use-data'
import { Camera, Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const stockColor: Record<string, string> = {
  disponibile: 'text-green-700 bg-green-50',
  esaurito:    'text-red-700 bg-red-50',
  in_arrivo:   'text-yellow-700 bg-yellow-50',
}

export default function ProdottiPage() {
  const demo = isDemo()
  const [prodotti, setProdotti] = useState<Prodotto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  const load = useCallback(async () => {
    if (demo) {
      setProdotti(demoProdotti)
      setLoading(false)
      return
    }
    const res = await fetch('/api/data/prodotti')
    const data = res.ok ? await res.json() : null
    setProdotti(data ?? [])
    setLoading(false)
  }, [demo])

  useEffect(() => { load() }, [load])

  async function handleImagePick(prodottoId: string, file: File | undefined) {
    if (!file || demo) return
    setUploadError(null)
    setUploadingId(prodottoId)
    try {
      const clienteId = readClienteId()
      const form = new FormData()
      form.append('cliente_id', clienteId || '')
      form.append('files', file)
      const upRes = await fetch('/api/assets/upload', { method: 'POST', body: form })
      const upData = await upRes.json()
      if (!upRes.ok || !upData.assets?.[0]?.url) throw new Error(upData.error || 'Upload fallito')

      const patchRes = await fetch('/api/data/prodotti', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prodottoId, link_img_1: upData.assets[0].url }),
      })
      if (!patchRes.ok) throw new Error('Salvataggio immagine fallito')
      await load()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Errore upload immagine')
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Prodotti</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">{prodotti?.length ?? 0} prodotti nel catalogo</p>
        {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {loading && <div className="card p-4 text-sm text-gray-400">Caricamento prodotti...</div>}
        {(prodotti ?? []).map((p: Prodotto) => (
          <div key={p.id} className="card p-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputs.current[p.id]?.click()}
                disabled={demo || uploadingId === p.id}
                title="Carica immagine da questo computer"
                className="relative w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden group disabled:cursor-not-allowed"
              >
                {p.link_img_1 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.link_img_1} alt={p.nome_prodotto} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">👕</div>
                )}
                {!demo && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    {uploadingId === p.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                )}
                <input
                  ref={el => { fileInputs.current[p.id] = el }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={e => handleImagePick(p.id, e.target.files?.[0])}
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-gray-900 truncate">{p.nome_prodotto}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    p.prodotto_attivo === 'SI' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.prodotto_attivo === 'SI' ? 'Attivo' : 'Inattivo'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{p.product_id} · {p.categoria}</p>
                <div className="flex items-center gap-2 mt-2">
                  {p.prezzo && <span className="text-sm font-semibold text-gray-800">€{p.prezzo}</span>}
                  {p.prezzo_promo && <span className="text-xs text-red-600 line-through">€{p.prezzo_promo}</span>}
                  {p.stock_status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${stockColor[p.stock_status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.stock_status.replace('_',' ')}
                      {p.stock_quantity != null ? ` (${p.stock_quantity})` : ''}
                    </span>
                  )}
                </div>
                {p.priorita && (
                  <p className="text-xs text-gray-400 mt-1">Priorità: {p.priorita}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && (!prodotti || prodotti.length === 0) && (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-lg">Nessun prodotto</p>
          <p className="text-sm mt-1">Importa i prodotti dalla migrazione CSV</p>
        </div>
      )}
    </div>
  )
}
