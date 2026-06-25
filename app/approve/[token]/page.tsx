'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader2, Clock, ExternalLink } from 'lucide-react'
import PostPreview from '@/components/PostPreview'
import StatusBadge from '@/components/StatusBadge'

type ApprovalData = Record<string, unknown>

export default function ApprovePage({ params }: { params: Promise<{ token: string }> }) {
  const [data, setData] = useState<ApprovalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<'idle' | 'approving' | 'rejecting'>('idle')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    params.then(p => setToken(p.token))
  }, [params])

  useEffect(() => {
    if (!token) return
    fetch(`/api/data/approve?token=${token}`)
      .then(res => res.ok ? res.json() : Promise.reject('Token non valido'))
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(typeof e === 'string' ? e : 'Errore caricamento'); setLoading(false) })
  }, [token])

  async function handleAction(status: 'approved' | 'rejected') {
    setAction(status === 'approved' ? 'approving' : 'rejecting')
    try {
      const res = await fetch('/api/data/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, status }),
      })
      if (!res.ok) throw new Error('Operazione fallita')
      setDone(true)
    } catch {
      setError('Errore durante l\'operazione. Riprova.')
    }
    setAction('idle')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Caricamento contenuto...</p></div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card max-w-md w-full p-8 text-center"><XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" /><h1 className="text-lg font-bold text-gray-900 mb-2">Link non valido</h1><p className="text-sm text-gray-500">{error}</p></div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card max-w-md w-full p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Grazie!</h1>
        <p className="text-sm text-gray-500">La tua risposta è stata registrata. Riceverai aggiornamenti dal team.</p>
      </div>
    </div>
  )

  const c = data as Record<string, string>
  const contenuto = {
    id: c.id || '',
    cliente_id: c.cliente_id || '',
    id_contenuto: c.contenuto_id || '',
    data_pubblicazione: c.data_pubblicazione || '',
    ora_pubblicazione: c.ora_pubblicazione || '',
    canale: c.canale || 'instagram',
    formato: c.formato || 'post',
    hook: c.hook || '',
    caption: c.caption || '',
    hashtag: c.hashtag || '',
    cta: c.cta || '',
    link_media_1: c.link_media_1 || null,
    link_media_2: c.link_media_2 || null,
    link_media_3: c.link_media_3 || null,
    nome_prodotto: c.nome_prodotto || '',
    tema: c.tema || '',
    status: 'DA_APPROVARE',
    media_type: 'image',
    retry_count: 0,
    blotato_scheduled_at: null,
    created_at: '',
    updated_at: '',
  } as import('@/lib/types').Contenuto

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-1.5 rounded-full text-xs font-medium mb-3">
            <Clock className="w-3 h-3" />
            Approvazione contenuto
          </div>
          <h1 className="text-xl font-bold text-gray-900">{c.cliente_nome || 'Brand'}</h1>
          <p className="text-sm text-gray-500 mt-1">Rivedi il contenuto e approva o richiedi modifiche</p>
        </div>

        {/* Content Card */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <span className="text-2xl">{c.canale === 'instagram' ? '📸' : c.canale === 'facebook' ? '🔵' : c.canale === 'tiktok' ? '🎵' : c.canale === 'pinterest' ? '📌' : '▶️'}</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm capitalize">{c.canale} · {c.formato}</p>
              <p className="text-xs text-gray-400">{c.data_pubblicazione} {c.ora_pubblicazione?.slice(0, 5)} {c.nome_prodotto && `· ${c.nome_prodotto}`}</p>
            </div>
          </div>

          <PostPreview c={contenuto} />

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {c.hook && <div><p className="text-[10px] uppercase text-gray-400 font-semibold">Hook</p><p className="text-sm font-medium text-gray-900">{c.hook}</p></div>}
            {c.caption && <div><p className="text-[10px] uppercase text-gray-400 font-semibold">Caption</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{c.caption}</p></div>}
            {c.hashtag && <div><p className="text-[10px] uppercase text-gray-400 font-semibold">Hashtag</p><p className="text-xs text-brand-600">{c.hashtag}</p></div>}
            {c.cta && <div><p className="text-[10px] uppercase text-gray-400 font-semibold">CTA</p><p className="text-xs text-gray-700">{c.cta}</p></div>}
          </div>
        </div>

        {/* Actions */}
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-3 text-center">Il tuo feedback aiuta il team a migliorare i contenuti.</p>
          <div className="flex gap-3">
            <button onClick={() => handleAction('rejected')} disabled={action !== 'idle'} className="btn-danger flex-1 justify-center py-3">
              {action === 'rejecting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Richiedi modifica
            </button>
            <button onClick={() => handleAction('approved')} disabled={action !== 'idle'} className="btn-primary flex-1 justify-center py-3">
              {action === 'approving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approva
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-4">Link valido 7 giorni · Social Automation V2</p>
      </div>
    </div>
  )
}
