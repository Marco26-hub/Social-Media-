'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import type { Brand } from '@/lib/types'
import {
  Globe, Sparkles, Save, Loader2, Check,
  Palette, Target, MessageCircle, Hash,
  MousePointerClick, AlertTriangle, FileText
} from 'lucide-react'
import { isDemo } from '@/lib/demo'

const TONI_VOCE = ['elegante','casual','ironico','professionale','emozionale','tecnico','luxury','friendly','sostenibile','istituzionale','ribelle','minimal']
const SETTORI = ['Fashion/Abbigliamento','Beauty/Cosmesi','Food/Bevande','Tech/Elettronica','Arredamento/Design','Fitness/Sport','Gioielli/Accessori','Libri/Editoria','Arte/Cultura','Servizi','Altro']

export default function BrandPage() {
  const [brand, setBrand] = useState<Partial<Brand> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [url, setUrl] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const demo = isDemo()

  useEffect(() => {
    async function load() {
      if (demo) {
        setBrand({
          brand_name: 'SILKinCOM',
          sito_url: 'https://silkincom.com',
          settore: 'Fashion/Abbigliamento',
          tono_voce: 'elegante',
          target: 'Donna 25-45, professionista, attenta allo stile',
          promessa_brand: 'Eleganza accessibile per la donna moderna',
          colori_brand: 'Beige, Nero, Bianco, Oro',
          parole_da_usare: 'eleganza, stile, qualità, made in Italy, versatilità, charme, look, outfit',
          parole_da_evitare: 'saldi, cheap, low cost, cinese, fast fashion',
          emoji_policy: 'Pochi emoji, solo ✨🤍🖤. Mai più di 2 per post.',
          hashtag_base: '#silkincom #stileitaliano #elegance #fashion #madeinitaly',
          cta_base: 'Scopri la collezione',
          note_legali: '',
        })
        setUrl('https://silkincom.com')
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/data/brand')
        const data = res.ok ? await res.json() : null
        setBrand(data || { brand_name: '' })
        if (data?.sito_url) setUrl(data.sito_url)
      } catch { setBrand({ brand_name: '' }) }
      setLoading(false)
    }
    load()
  }, [demo])

  async function handleDiscovery() {
    if (!url.trim()) { setMsg({ type: 'err', text: 'Inserisci URL del sito' }); return }
    setDiscovering(true)
    setMsg(null)

    if (demo) {
      await new Promise(r => setTimeout(r, 1500))
      setBrand(prev => ({
        ...prev,
        sito_url: url,
        settore: 'Fashion/Abbigliamento',
        tono_voce: 'elegante',
        target: 'Donna 25-45, professionista',
        promessa_brand: 'Eleganza accessibile',
        colori_brand: 'Beige, Nero, Bianco',
        parole_da_usare: 'eleganza, stile, qualità, made in Italy',
        parole_da_evitare: 'economico, low cost',
        emoji_policy: '✨🤍🖤 max 2 per post',
        hashtag_base: '#brand #stile #moda',
        cta_base: 'Scopri di più',
      }))
      setMsg({ type: 'ok', text: 'Profilo brand generato dalla demo. Rivedi e salva.' })
      setDiscovering(false)
      return
    }

    try {
      const aiModel = typeof window !== 'undefined' ? localStorage.getItem('ai_model') ?? 'claude-sonnet-4-6' : 'claude-sonnet-4-6'
      const orKey = typeof window !== 'undefined' ? localStorage.getItem('openrouter_key') ?? '' : ''
      const res = await fetch('/api/generate/brand-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, model: aiModel, openrouter_key: orKey || undefined }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
      const discovered = await res.json()
      setBrand(prev => ({ ...prev, ...discovered, sito_url: url }))
      setMsg({ type: 'ok', text: 'Profilo generato! Rivedi i campi e clicca Salva.' })
    } catch (e) {
      setMsg({ type: 'err', text: (e as Error).message })
    }
    setDiscovering(false)
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    if (demo) {
      await new Promise(r => setTimeout(r, 800))
      setMsg({ type: 'ok', text: 'Profilo brand salvato (demo)' })
      setSaving(false); return
    }
    try {
      const res = await fetch('/api/data/brand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
      setMsg({ type: 'ok', text: 'Profilo brand salvato con successo' })
    } catch (e) {
      setMsg({ type: 'err', text: (e as Error).message })
    }
    setSaving(false)
  }

  function update(field: string, value: string) {
    setBrand(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Profilo Brand</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Configura il DNA del brand. L&apos;AI userà questi dati per generare contenuti coerenti e differenziati.
        </p>
      </div>

      {/* AI Discovery */}
      <div className="card p-5 mb-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-violet-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">AI Brand Discovery</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Inserisci l&apos;URL del sito. L&apos;AI analizza tono, target, stile e compila il profilo automaticamente.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://esempio.com"
              className="input pl-9"
            />
          </div>
          <button onClick={handleDiscovery} disabled={discovering} className="btn-primary text-sm px-5">
            {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {discovering ? 'Analizzo...' : 'Analizza sito'}
          </button>
        </div>
      </div>

      {/* Brand form */}
      <div className="space-y-4">
        {/* Nome + Settore */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              Nome Brand
            </label>
            <input
              value={brand?.brand_name || ''}
              onChange={e => update('brand_name', e.target.value)}
              placeholder="Nome del brand"
              className="input mt-1"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              Settore
            </label>
            <select
              value={(brand as Record<string, string>)?.settore || ''}
              onChange={e => update('settore', e.target.value)}
              className="input mt-1"
            >
              <option value="">Seleziona settore...</option>
              {SETTORI.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Tono + Target */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
              Tono di voce
            </label>
            <select
              value={brand?.tono_voce || ''}
              onChange={e => update('tono_voce', e.target.value)}
              className="input mt-1"
            >
              <option value="">Seleziona tono...</option>
              {TONI_VOCE.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-gray-400" />
              Target Audience
            </label>
            <input
              value={brand?.target || ''}
              onChange={e => update('target', e.target.value)}
              placeholder="Es: Donna 25-45, professionista, attenta allo stile"
              className="input mt-1"
            />
          </div>
        </div>

        {/* Promessa + Colori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gray-400" />
              Promessa Brand
            </label>
            <input
              value={brand?.promessa_brand || ''}
              onChange={e => update('promessa_brand', e.target.value)}
              placeholder="Es: Eleganza accessibile per la donna moderna"
              className="input mt-1"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-gray-400" />
              Colori Brand
            </label>
            <input
              value={brand?.colori_brand || ''}
              onChange={e => update('colori_brand', e.target.value)}
              placeholder="Es: Beige, Nero, Bianco, Oro"
              className="input mt-1"
            />
          </div>
        </div>

        {/* Parole da usare / evitare */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" />
              Parole da usare
            </label>
            <textarea
              value={brand?.parole_da_usare || ''}
              onChange={e => update('parole_da_usare', e.target.value)}
              placeholder="Parole chiave da includere, separate da virgola"
              className="input mt-1 h-20 resize-none"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Parole da evitare
            </label>
            <textarea
              value={brand?.parole_da_evitare || ''}
              onChange={e => update('parole_da_evitare', e.target.value)}
              placeholder="Parole da NON usare, separate da virgola"
              className="input mt-1 h-20 resize-none"
            />
          </div>
        </div>

        {/* Emoji + Hashtag */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gray-400" />
              Emoji Policy
            </label>
            <input
              value={brand?.emoji_policy || ''}
              onChange={e => update('emoji_policy', e.target.value)}
              placeholder="Es: Solo ✨🤍🖤, max 2 per post"
              className="input mt-1"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              Hashtag base
            </label>
            <input
              value={brand?.hashtag_base || ''}
              onChange={e => update('hashtag_base', e.target.value)}
              placeholder="Es: #brand #stile #modaitaliana"
              className="input mt-1"
            />
          </div>
        </div>

        {/* CTA + Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
              CTA Default
            </label>
            <input
              value={brand?.cta_base || ''}
              onChange={e => update('cta_base', e.target.value)}
              placeholder="Es: Scopri la collezione"
              className="input mt-1"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Note legali / Disclaimer
            </label>
            <input
              value={brand?.note_legali || ''}
              onChange={e => update('note_legali', e.target.value)}
              placeholder="Eventuali note legali obbligatorie"
              className="input mt-1"
            />
          </div>
        </div>

        {/* Message + Save */}
        {msg && (
          <div className={`p-3 rounded-lg text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full sm:w-auto text-sm px-8 py-3">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salva profilo brand'}
        </button>
      </div>
    </div>
  )
}
