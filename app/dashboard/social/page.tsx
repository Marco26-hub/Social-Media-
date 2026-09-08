'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { PLATFORMS, PLATFORM_LIST, type PlatformKey, type FormatoConfig } from '@/lib/social-config'
import { demoContenuti } from '@/lib/demo-data'
import { Sparkles, Loader2, Check, X, ArrowLeft, Calendar, Eye, ChevronRight, ImagePlus, Link2, Trash2, UploadCloud, UserRound } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import ConfirmModal from '@/components/ConfirmModal'
import AIModelSelector from '@/components/AIModelSelector'
import type { Contenuto } from '@/lib/types'
import { useActiveClienteId } from '@/lib/tenant/client'
import { DEFAULT_AI_MODEL, readAISettings } from '@/lib/ai-client'
import { uploadAssets as uploadAssetsToStorage } from '@/lib/asset-upload'
import { useGeneration } from '@/components/GenerationProvider'
import { useRuntimeDemo } from '@/lib/demo-client'
import { CONTENT_QUALITY_OPTIONS, type ContentQuality } from '@/lib/content-quality'
import { GENERATION_OPTIMIZATION_CYCLE } from '@/lib/production-cycle'
import { BUSINESS_CATEGORY_OPTIONS, resolveBusinessCategory, type BusinessCategoryId } from '@/lib/business-categories'
import type { CreativeMode } from '@/lib/creative-mode'
import { calendarContentHref } from '@/lib/calendar-content-link'
import { useRouter } from 'next/navigation'

// Cap asset per singolo post/carosello = max carosello Instagram (10).
// Altre piattaforme limitano di più in publish (X 4) — vedi warning nel form.
const MAX_POST_ASSETS = 10
const MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4'

function isVideoUrl(url?: string | null) {
  if (!url) return false
  return url.split('?')[0].toLowerCase().endsWith('.mp4')
}

type QualitySelection = 'auto' | ContentQuality
type UploadedAsset = {
  name: string
  url: string
  previewUrl?: string
  path?: string
  mime?: string
  size?: number
  kind?: 'image' | 'video' | 'audio'
  source: 'upload' | 'url'
}

type BrandProfileSummary = {
  brand_name?: string | null
  settore?: string | null
  tono_voce?: string | null
  target?: string | null
}

type ContentSeries = {
  id: string
  position: number
  total: number
  formats: string[]
  theme: string
}

type PendingGeneration = {
  format: FormatoConfig
  creativeMode: CreativeMode
}

function getUgcFormat(config: typeof PLATFORMS[PlatformKey]): FormatoConfig | null {
  if (config.key === 'blog') return null
  const priority = ['reel', 'video', 'short', 'story', 'post', 'pin']
  const format = priority
    .map(value => config.formati.find(item => item.formato === value))
    .find((item): item is FormatoConfig => Boolean(item))
  if (!format) return null
  return {
    ...format,
    id: `${format.id}-UGC`,
    nome: 'UGC',
    desc: `Concept creator-style nativo per ${config.nome}`,
    esempio: 'Hook, script, scene, caption e CTA pronti da produrre',
    goal: 'Fiducia e conversione con una creativita autentica e verificabile',
  }
}

// Pagina UNICA "Crea contenuti social": la piattaforma si sceglie qui in cima
// (prima erano 9 pagine identiche, una per canale). Il generatore (PlatformContent)
// resta invariato e riceve il config della piattaforma scelta; `key={platform}`
// lo rimonta pulito a ogni cambio canale.
export default function SocialPage() {
  const [platform, setPlatform] = useState<PlatformKey>('instagram')

  // Init dalla query ?platform= (deep-link + vecchie URL redirette qui).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('platform')
    if (q && PLATFORMS[q as PlatformKey]) setPlatform(q as PlatformKey)
  }, [])

  function choose(p: PlatformKey) {
    setPlatform(p)
    const url = new URL(window.location.href)
    url.searchParams.set('platform', p)
    window.history.replaceState(null, '', url.toString())
  }

  return (
    <div>
      {/* Selettore piattaforma — sostituisce le 9 voci di menu */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur px-4 md:px-8 pt-4 pb-2 border-b border-gray-100">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-2">Scegli il canale</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {PLATFORM_LIST.map(p => {
            const active = p.key === platform
            return (
              <button
                key={p.key}
                onClick={() => choose(p.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  active ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-700'
                }`}
              >
                <span className="text-sm leading-none">{p.emoji}</span>
                {p.nome}
              </button>
            )
          })}
        </div>
      </div>

      <PlatformContent key={platform} config={PLATFORMS[platform]} />
    </div>
  )
}

function PlatformContent({ config }: { config: typeof PLATFORMS[PlatformKey] }) {
  const router = useRouter()
  const [recenti, setRecenti] = useState<Contenuto[]>([])
  const [states, setStates]   = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({})
  const [generatedContentIds, setGeneratedContentIds] = useState<Record<string, string>>({})
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})
  const [pending, setPending] = useState<PendingGeneration | null>(null)
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set())
  const [pendingBatch, setPendingBatch] = useState(false)
  const [crossCanali, setCrossCanali] = useState<Set<string>>(new Set())
  const [aiModel, setAiModel] = useState(DEFAULT_AI_MODEL)
  const [quality, setQuality] = useState<QualitySelection>('auto')
  const [businessCategory, setBusinessCategory] = useState<BusinessCategoryId>('auto')
  const [brandProfile, setBrandProfile] = useState<BrandProfileSummary | null>(null)
  const [brandProfileLoading, setBrandProfileLoading] = useState(true)
  const [assets, setAssets] = useState<UploadedAsset[]>([])
  const [assetUrl, setAssetUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [prodottoNome, setProdottoNome] = useState('')
  const [prodotti, setProdotti] = useState<Array<{ id: string; product_id: string; nome_prodotto: string; link_img_1: string | null; link_img_2: string | null; link_img_3: string | null }>>([])
  const demo = useRuntimeDemo()
  const { clienteId, loading: loadingCliente } = useActiveClienteId()
  const clienteIdRef = useRef(clienteId)
  const gen = useGeneration()
  const activeBusinessCategory = resolveBusinessCategory(businessCategory, {
    sector: brandProfile?.settore,
    brandName: brandProfile?.brand_name,
  })
  const ugcFormat = getUgcFormat(config)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAiModel(readAISettings().model || DEFAULT_AI_MODEL)
    }
  }, [])

  useEffect(() => {
    clienteIdRef.current = clienteId
    setBusinessCategory('auto')
    setBrandProfile(null)
    setBrandProfileLoading(true)
    setRecenti([])
    setProdotti([])
    setStates({})
    setGeneratedContentIds({})
    setErrors({})
    setWarnings({})
    setPending(null)
    setPendingBatch(false)
    setSelectedFormats(new Set())
    setCrossCanali(new Set())
    setQuality('auto')
    setProdottoNome('')
    setAssetUrl('')
    setAssets(previous => {
      previous.forEach(asset => {
        if (asset.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(asset.previewUrl)
      })
      return []
    })
  }, [clienteId])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (demo) {
        if (!cancelled) setRecenti(demoContenuti.filter(c => c.canale === config.canaleDb).slice(0, 5))
        return
      }
      if (loadingCliente) return
      const params = new URLSearchParams({ canale: config.canaleDb, limit: '5' })
      const response = await fetch(`/api/data/calendario?${params.toString()}`)
      const data = response.ok ? await response.json() as Contenuto[] : []
      if (!cancelled) setRecenti(data)
    }
    load().catch(() => { if (!cancelled) setRecenti([]) })
    return () => { cancelled = true }
  }, [demo, config.canaleDb, clienteId, loadingCliente])

  useEffect(() => {
    let cancelled = false
    if (loadingCliente) return
    if (demo) {
      setBrandProfile({ brand_name: 'SILKinCOM', settore: 'Fashion/Abbigliamento' })
      setBrandProfileLoading(false)
      return
    }
    setBrandProfile(null)
    setBrandProfileLoading(true)
    fetch('/api/data/brand')
      .then(async response => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({})) as { error?: string }
          throw new Error(data.error || 'Profilo Brand non disponibile')
        }
        return response.json() as Promise<BrandProfileSummary | null>
      })
      .then(profile => {
        if (cancelled) return
        setBrandProfile(profile)
        setErrors(prev => { const next = { ...prev }; delete next.brand_profile; return next })
      })
      .catch(error => {
        if (cancelled) return
        setBrandProfile(null)
        setErrors(prev => ({ ...prev, brand_profile: (error as Error).message }))
      })
      .finally(() => { if (!cancelled) setBrandProfileLoading(false) })
    return () => { cancelled = true }
  }, [demo, clienteId, loadingCliente])

  // Catalogo prodotti (per usarne le foto già caricate senza ri-uploadarle).
  useEffect(() => {
    let cancelled = false
    if (demo) return
    setProdotti([])
    fetch('/api/data/prodotti')
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (!cancelled) setProdotti(Array.isArray(d) ? d : []) })
      .catch(() => { if (!cancelled) setProdotti([]) })
    return () => { cancelled = true }
  }, [demo, clienteId])

  // Usa le foto di un prodotto del catalogo come media del contenuto (+ nome prodotto).
  function usaProdotto(pid: string) {
    const p = prodotti.find(x => x.id === pid)
    if (!p) return
    const imgs = [p.link_img_1, p.link_img_2, p.link_img_3].filter((u): u is string => Boolean(u))
    if (!imgs.length) {
      setErrors(prev => ({ ...prev, prodotto: `"${p.nome_prodotto}" non ha foto caricate — caricale in Prodotti col bottone camera.` }))
      return
    }
    setErrors(prev => { const n = { ...prev }; delete n.prodotto; return n })
    setProdottoNome(p.nome_prodotto)
    setAssets(prev => {
      const existing = new Set(prev.map(a => a.url))
      const nuovi: UploadedAsset[] = imgs.filter(u => !existing.has(u)).map(u => ({ name: p.nome_prodotto, url: u, source: 'url' as const }))
      return [...prev, ...nuovi].slice(0, MAX_POST_ASSETS)
    })
  }

  function chiediGenera(f: FormatoConfig, creativeMode: CreativeMode = 'standard') {
    setAiModel(readAISettings().model)
    setPending({ format: f, creativeMode })
  }

  // Primo nome prodotto ricavato dal filename: "camicia-riva_azzurra.jpg" → "Camicia Riva Azzurra".
  function prettyName(filename: string): string {
    const base = filename
      .replace(/\.[a-z0-9]{2,5}$/i, '')   // togli estensione
      .replace(/[-_.]+/g, ' ')            // trattini/underscore → spazio
      .replace(/\d{3,}/g, '')             // togli code numeriche lunghe
      .replace(/\s+/g, ' ')
      .trim()
    if (!base) return ''
    return base.replace(/\b\p{L}/gu, c => c.toUpperCase()).slice(0, 60)
  }

  async function uploadAssets(files: FileList | null) {
    if (!files?.length) return
    try {
      if (!clienteId) throw new Error('Cliente non selezionato')
      const uploadClienteId = clienteId
      setUploading(true)
      const form = new FormData()
      form.append('cliente_id', clienteId)
      const selectedFiles = Array.from(files).slice(0, MAX_POST_ASSETS - assets.length)
      selectedFiles.forEach(file => form.append('files', file))
      const previews = new Map(selectedFiles.map(file => [file.name, URL.createObjectURL(file)]))
      const data = await uploadAssetsToStorage(form)
      if (clienteIdRef.current !== uploadClienteId) {
        previews.forEach(preview => URL.revokeObjectURL(preview))
        return
      }
      // name prefillato dal filename pulito (l'utente può correggerlo).
      const uploaded = (data.assets || []).map(asset => ({ ...asset, previewUrl: previews.get(asset.name) || asset.url, name: prettyName(asset.name) }))
      setAssets(prev => [...prev, ...uploaded].slice(0, MAX_POST_ASSETS))
      // Successo parziale: alcuni file possono essere stati scartati (HEIC, troppo
      // grandi). I validi sono caricati; segnaliamo gli altri senza bloccare.
      if (data.skipped?.length) {
        setErrors(prev => ({ ...prev, asset_upload: `${data.skipped!.length} file saltati — ${data.skipped!.map(s => `${s.name}: ${s.motivo}`).join(' · ')}` }))
      } else {
        setErrors(prev => { const next = { ...prev }; delete next.asset_upload; return next })
      }
    } catch (e) {
      setErrors(prev => ({ ...prev, asset_upload: (e as Error).message }))
    } finally {
      setUploading(false)
    }
  }

  function addAssetUrl() {
    const value = assetUrl.trim()
    if (!value) return
    try {
      const parsed = new URL(value)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('URL non valido')
      const asset: UploadedAsset = {
        name: prettyName(parsed.pathname.split('/').pop() || '') || 'Immagine',
        url: parsed.toString(),
        mime: isVideoUrl(parsed.toString()) ? 'video/mp4' : undefined,
        kind: isVideoUrl(parsed.toString()) ? 'video' : 'image',
        source: 'url',
      }
      setAssets(prev => [...prev, asset].slice(0, MAX_POST_ASSETS))
      setAssetUrl('')
    } catch {
      setErrors(prev => ({ ...prev, asset_url: 'Inserisci un URL pubblico valido, es. https://...' }))
    }
  }

  function removeAsset(index: number) {
    setAssets(prev => prev.filter((_, i) => i !== index))
  }

  function renameAsset(index: number, nome: string) {
    setAssets(prev => prev.map((a, i) => (i === index ? { ...a, name: nome } : a)))
  }

  async function genera(f: FormatoConfig, series?: ContentSeries, creativeMode: CreativeMode = 'standard') {
    const generationClienteId = clienteId
    if (!demo && clienteIdRef.current !== generationClienteId) return
    setPending(null)
    setErrors(prev => {
      const next = { ...prev }
      delete next[f.id]
      return next
    })
    setWarnings(prev => {
      const next = { ...prev }
      delete next[f.id]
      return next
    })
    if (!demo && !clienteId) {
      setErrors(prev => ({ ...prev, [f.id]: 'Cliente non selezionato' }))
      setStates(s => ({ ...s, [f.id]: 'error' }))
      return
    }
    setStates(s => ({ ...s, [f.id]: 'loading' }))

    const aiSettings = readAISettings()
    const isBlog = f.formato === 'articolo'
    const endpoint = isBlog ? '/api/generate/blog' : '/api/generate/content'
    const body = isBlog
      ? { cliente_id: clienteId, tema: prodottoNome.trim() || (config.nome + ' - ' + f.nome), nome_prodotto: prodottoNome.trim() || undefined, quality, uploaded_assets: assets, media_urls: assets.map(asset => asset.url), ...aiSettings }
      : {
          cliente_id: clienteId,
          canale: config.canaleDb,
          formato: f.formato,
          tema: prodottoNome.trim() || undefined,
          nome_prodotto: prodottoNome.trim() || undefined,
          quality,
          business_category: businessCategory,
          creative_mode: creativeMode,
          uploaded_assets: assets,
          media_urls: assets.map(asset => asset.url),
          // Un UGC deve essere progettato nativamente per il social aperto.
          // Gli altri canali hanno ciascuno il proprio bottone UGC dedicato.
          also_canali: creativeMode === 'ugc' ? [] : [...crossCanali],
          ...(series ? {
            series_id: series.id,
            series_position: series.position,
            series_total: series.total,
            series_formats: series.formats,
            series_theme: series.theme,
          } : {}),
          ...aiSettings,
        }

    // Generazione nel provider globale: continua anche se cambi pagina, con barra di progresso.
    const result = await gen.run({
      key: `content:${f.id}`,
      label: `${config.nome} · ${f.nome}`,
      url: endpoint,
      body,
      href: '/dashboard/calendario',
      estMs: isBlog ? 35000 : 22000,
    })

    // La richiesta conserva correttamente il cliente originale nel backend, ma
    // il suo esito non deve aggiornare la UI se nel frattempo l'admin ha cambiato workspace.
    if (clienteIdRef.current !== generationClienteId) return

    if (result.ok) {
      setStates(s => ({ ...s, [f.id]: 'success' }))
      const response = result.data as { id_contenuto?: string; warning?: string; warnings?: string[] } | undefined
      const generatedContentId = response?.id_contenuto
      if (generatedContentId) {
        setGeneratedContentIds(previous => ({ ...previous, [f.id]: generatedContentId }))
      }
      const responseWarnings = [response?.warning, ...(response?.warnings || [])].filter((value): value is string => Boolean(value))
      if (creativeMode === 'ugc' && !generatedContentId) {
        responseWarnings.push('UGC creato, ma il server non ha restituito il riferimento preciso: verra aperto l’elenco Da approvare.')
      }
      if (responseWarnings.length) {
        setWarnings(prev => ({ ...prev, [f.id]: responseWarnings.join(' ') }))
      }
    } else {
      setErrors(prev => ({ ...prev, [f.id]: result.error || `Generazione ${f.nome} fallita` }))
      setStates(s => ({ ...s, [f.id]: 'error' }))
    }
    // L'esito UGC resta cliccabile finche l'utente apre il record appena creato.
    // Per i contenuti standard conserviamo il feedback temporaneo precedente.
    if (!result.ok || creativeMode !== 'ugc') {
      setTimeout(() => setStates(s => ({ ...s, [f.id]: 'idle' })), 4000)
    }
  }

  function toggleFormat(id: string) {
    setSelectedFormats(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Un solo formato resta autonomo; due o piu formati condividono serie, tema e funnel.
  async function generaBatch() {
    setPendingBatch(false)
    setAiModel(readAISettings().model)
    const scelti = config.formati.filter(f => selectedFormats.has(f.id))
    if (scelti.length === 1) {
      await genera(scelti[0])
      setSelectedFormats(new Set())
      return
    }
    if (scelti.length < 2) return

    const seriesId = `${activeBusinessCategory.id}-${Date.now().toString(36)}`
    const formats = scelti.map(format => format.formato)
    const seriesTheme = prodottoNome.trim()
      || `${brandProfile?.brand_name || 'Brand'}: ${activeBusinessCategory.description}`
    const batchClienteId = clienteId
    for (const [index, f] of scelti.entries()) {
      if (clienteIdRef.current !== batchClienteId) break
      await genera(f, { id: seriesId, position: index + 1, total: scelti.length, formats, theme: seriesTheme })
    }
    setSelectedFormats(new Set())
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />
        Dashboard
      </Link>

      {/* Header piattaforma */}
      <div className={`rounded-2xl bg-gradient-to-br ${config.gradient} border border-gray-100 p-6 md:p-8 mb-6`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${config.colorBg} flex items-center justify-center text-3xl md:text-4xl shadow-lg flex-shrink-0`}>
            {config.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{config.nome}</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">{config.tagline}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-2xl">{config.descrizione}</p>
          </div>
        </div>
      </div>

      <AIModelSelector task="contenuti-social" />

      <div className="card p-4 mb-5 border-brand-200 bg-brand-50/40">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Categoria e Profilo Brand</p>
            <p className="text-xs text-gray-500 mt-1">
              La categoria guida il metodo; nome, tono, target e vincoli arrivano dal Profilo Brand del cliente attivo.
            </p>
            <select
              value={businessCategory}
              onChange={event => setBusinessCategory(event.target.value as BusinessCategoryId)}
              className="input mt-3"
            >
              {BUSINESS_CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label} — {option.description}</option>
              ))}
            </select>
          </div>
          <div className="md:w-80 rounded-xl border border-brand-100 bg-white p-3">
            <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Brand Profile collegato</p>
            {brandProfileLoading ? (
              <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Caricamento...</p>
            ) : brandProfile?.brand_name ? (
              <>
                <p className="text-sm font-semibold text-gray-900 mt-1">{brandProfile.brand_name}</p>
                <p className="text-xs text-gray-500">{brandProfile.settore || 'Settore da completare'} · motore {activeBusinessCategory.label}</p>
              </>
            ) : (
              <p className="text-xs text-amber-700 mt-1">Profilo non compilato: la generazione userà un fallback dichiarato.</p>
            )}
            <Link href="/dashboard/settings?tab=brand" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline mt-2">
              {brandProfile?.brand_name ? 'Modifica Profilo Brand' : 'Completa Profilo Brand'} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gray-900">Qualità generazione</p>
            <p className="text-xs text-gray-500">Auto usa il pacchetto cliente; High crea brief elite con KPI, varianti e checklist.</p>
          </div>
          <select
            value={quality}
            onChange={event => setQuality(event.target.value as QualitySelection)}
            className="input md:max-w-xs"
          >
            {CONTENT_QUALITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label} — {option.desc}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-4 mb-5 border-slate-200 bg-slate-50">
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-brand-600 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-gray-900">Ciclo operativo della generazione</p>
            <p className="text-xs text-gray-500">
              Il contenuto non esce “nudo”: include ipotesi performance, metrica da guardare, fallback e prossime azioni.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {GENERATION_OPTIMIZATION_CYCLE.slice(0, 3).map(stage => (
            <div key={stage.id} className="rounded-xl bg-white border border-gray-100 p-3">
              <p className="text-xs font-bold text-gray-900">{stage.title}</p>
              <p className="text-[11px] text-gray-500 mt-1">{stage.output}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 mb-5 border-brand-100 bg-gradient-to-br from-white to-brand-50/40">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-brand-600" />
              <p className="text-sm font-bold text-gray-900">Media tuoi per creare il contenuto</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Carica foto prodotto/brand o video MP4, oppure incolla URL pubblici: entrano nel prompt e vengono salvati nel contenuto.
            </p>
            <p className="text-[11px] text-amber-700 mt-1">
              Per autopublishing Blotato usa URL pubblici o media caricati qui; max {MAX_POST_ASSETS} asset
              (attenzione: Instagram carosello pubblica max 10, X max 4).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 lg:w-[520px]">
            <label className="btn-secondary justify-center py-2 px-3 cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {uploading ? 'Carico...' : 'Carica foto/MP4'}
              <input
                type="file"
                accept={MEDIA_ACCEPT}
                multiple
                className="hidden"
                disabled={uploading || assets.length >= MAX_POST_ASSETS}
                onChange={event => { const el = event.currentTarget; uploadAssets(el.files).finally(() => { el.value = '' }) }}
              />
            </label>
            <div className="flex flex-1 gap-2">
              <input
                value={assetUrl}
                onChange={event => setAssetUrl(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addAssetUrl()
                  }
                }}
                className="input text-xs"
                placeholder="https://... immagine o video .mp4 pubblico"
              />
              <button type="button" onClick={addAssetUrl} className="btn-secondary py-2 px-3" aria-label="Aggiungi URL media">
                <Link2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Usa le foto già caricate su un prodotto del catalogo (niente ri-upload) */}
        {prodotti.length > 0 && (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">Oppure usa le foto di un prodotto:</label>
            <select
              defaultValue=""
              onChange={e => { if (e.target.value) { usaProdotto(e.target.value); e.target.value = '' } }}
              className="input text-xs flex-1"
            >
              <option value="">Seleziona un prodotto del catalogo…</option>
              {prodotti.map(p => {
                const hasImg = Boolean(p.link_img_1 || p.link_img_2 || p.link_img_3)
                return <option key={p.id} value={p.id}>{p.nome_prodotto}{hasImg ? '' : ' (nessuna foto)'}</option>
              })}
            </select>
          </div>
        )}
        {errors.prodotto && <p className="text-xs text-red-600 mt-1">{errors.prodotto}</p>}

        {/* Nome prodotto/i caricati: la vision VEDE il prodotto, questo dà i NOMI esatti */}
        <div className="mt-3">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <ImagePlus className="w-3.5 h-3.5 text-brand-600" />
            Prodotto/i nel media <span className="font-normal text-gray-400">(nome esatto per un copy preciso)</span>
          </label>
          <input
            value={prodottoNome}
            onChange={event => setProdottoNome(event.target.value)}
            className="input text-xs mt-1"
            placeholder="Es: Camicia Riva azzurra in lino, Cappellino Darsena"
          />
        </div>

        {assets.length > 0 && (
          <>
            <p className="text-[11px] text-gray-500 mt-4 mb-1.5">Dai un nome a ogni media col prodotto che contiene — l&apos;AI lo userà nel copy.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {assets.map((asset, index) => (
                <div key={`${asset.url}-${index}`} className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <div className="relative group">
                    {asset.kind === 'video' || asset.mime?.startsWith('video/') || isVideoUrl(asset.previewUrl || asset.url) ? (
                      <video src={asset.previewUrl || asset.url} className="w-full aspect-square object-cover" muted playsInline preload="metadata" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.previewUrl || asset.url} alt={asset.name} className="w-full aspect-square object-cover" />
                    )}
                    <span className="absolute top-1 left-1 bg-black/55 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {asset.kind === 'video' || asset.mime?.startsWith('video/') || isVideoUrl(asset.previewUrl || asset.url) ? 'MP4' : asset.source === 'upload' ? 'Upload' : 'URL'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAsset(index)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/90 text-red-600 flex items-center justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Rimuovi media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    value={asset.name || ''}
                    onChange={e => renameAsset(index, e.target.value)}
                    placeholder="Nome prodotto…"
                    className="w-full text-[11px] px-2 py-1.5 border-t border-gray-100 focus:outline-none focus:bg-brand-50/40"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {ugcFormat && (() => {
        const st = states[ugcFormat.id] ?? 'idle'
        const generatedContentId = generatedContentIds[ugcFormat.id]
        return (
          <div className="card p-4 md:p-5 mb-5 border-emerald-200 bg-emerald-50/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <UserRound className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">UGC dedicato a {config.nome}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Genera un concept {ugcFormat.formato} nativo con hook, script, scene, caption e CTA usando il Profilo Brand attivo.
                  </p>
                  <p className={`text-[11px] mt-1 ${assets.length ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {assets.length
                      ? `${assets.length} media real${assets.length === 1 ? 'e' : 'i'} collegat${assets.length === 1 ? 'o' : 'i'} al brief.`
                      : 'Senza media reali crea il brief da produrre e segnala gli asset mancanti.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (st === 'success') {
                    router.push(generatedContentId
                      ? calendarContentHref(generatedContentId)
                      : '/dashboard/calendario?filter=DA_APPROVARE')
                    return
                  }
                  chiediGenera(ugcFormat, 'ugc')
                }}
                disabled={st === 'loading'}
                className={`md:w-64 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2 ${
                  st === 'success' ? 'bg-green-100 text-green-700' :
                  st === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-60'
                }`}
              >
                {st === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                {st === 'success' && <Check className="w-4 h-4" />}
                {st === 'error' && <X className="w-4 h-4" />}
                {st === 'idle' && <Sparkles className="w-4 h-4" />}
                {st === 'loading' ? 'Generando UGC...' :
                 st === 'success' ? 'Apri UGC nel calendario' :
                 st === 'error' ? 'Errore - riprova' :
                 `Genera UGC ${config.nome}`}
              </button>
            </div>
          </div>
        )
      })()}

      {Object.values(errors).length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          AI: {Object.values(errors)[0]}
        </div>
      )}

      {Object.values(warnings).length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Attenzione: {Object.values(warnings)[0]}
        </div>
      )}

      {/* Cross-post: pubblica lo stesso contenuto anche su altri social (opt-in) */}
      <div className="card p-4 mb-6">
        <p className="text-sm font-semibold text-gray-900 mb-1">Pubblica anche su (opzionale)</p>
        <p className="text-xs text-gray-500 mb-3">Il contenuto viene creato per <span className="font-medium">{config.nome}</span>. Spunta altri social per creare lo stesso contenuto anche lì (uno per social, ognuno approvabile a parte).</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_LIST.filter(p => p.key !== 'blog' && p.canaleDb !== config.canaleDb).map(p => {
            const on = crossCanali.has(p.canaleDb)
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setCrossCanali(prev => { const n = new Set(prev); if (n.has(p.canaleDb)) n.delete(p.canaleDb); else n.add(p.canaleDb); return n })}
                className={`text-xs px-3 py-1.5 rounded-full border-2 transition-colors inline-flex items-center gap-1.5 ${
                  on ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{p.emoji}</span> {p.nome}
                {on && <Check className="w-3 h-3" />}
              </button>
            )
          })}
        </div>
        {crossCanali.size > 0 && (
          <p className="text-[11px] text-brand-700 mt-2">Verrà pubblicato anche su {crossCanali.size} altr{crossCanali.size === 1 ? 'o social' : 'i social'}.</p>
        )}
      </div>

      {/* Format scegliere cosa creare */}
      <div className="mb-8">
        <h2 className="font-bold text-gray-900 mb-1">Cosa vuoi creare?</h2>
        <p className="text-xs md:text-sm text-gray-500 mb-4">Il bottone singolo crea un contenuto autonomo. Se selezioni più formati, l&apos;AI li collega in una serie {activeBusinessCategory.label} coordinata con sviluppo narrativo comune.</p>

        {/* Barra generazione multipla */}
        {selectedFormats.size > 0 && (
          <div className="sticky top-2 z-10 mb-4 flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 shadow-sm">
            <span className="text-sm text-brand-800 font-medium">{selectedFormats.size} formati selezionati</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedFormats(new Set())} className="text-xs text-gray-500 hover:text-gray-700">Deseleziona</button>
              <button onClick={() => setPendingBatch(true)} className="btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Genera selezionati ({selectedFormats.size})
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
          {config.formati.map(f => {
            const Icon = f.icon
            const st = states[f.id] ?? 'idle'
            const checked = selectedFormats.has(f.id)
            return (
              <div key={f.id} className={`card p-4 md:p-5 hover:shadow-md transition-shadow ${checked ? 'ring-2 ring-brand-400' : ''}`}>
                <div className="flex items-start gap-3 mb-3">
                  <label className="flex-shrink-0 cursor-pointer pt-1" title="Seleziona per generazione multipla">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFormat(f.id)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                  </label>
                  <div className={`w-10 h-10 rounded-xl ${config.colorBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{f.nome}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-mono">{f.aspectRatio}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{f.formato}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">Esempio</p>
                  <p className="text-xs text-gray-700 italic">&ldquo;{f.esempio}&rdquo;</p>
                </div>

                <button
                  onClick={() => chiediGenera(f)}
                  disabled={st === 'loading'}
                  className={`w-full text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    st === 'success' ? 'bg-green-100 text-green-700' :
                    st === 'error'   ? 'bg-red-100 text-red-700' :
                                       'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60'
                  }`}
                >
                  {st === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {st === 'success' && <Check className="w-4 h-4" />}
                  {st === 'error'   && <X className="w-4 h-4" />}
                  {st === 'idle'    && <Sparkles className="w-4 h-4" />}
                  {st === 'loading' ? 'Generando...' :
                   st === 'success' ? 'Aggiunto in calendario' :
                   st === 'error'   ? 'Errore — riprova' :
                   `Genera ${f.nome.toLowerCase()}`}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirm modal */}
      {pending && (() => {
        const isFree = aiModel.endsWith(':free')
        const f = pending.format
        const isUgc = pending.creativeMode === 'ugc'
        return (
          <ConfirmModal
            open={true}
            onClose={() => setPending(null)}
            onConfirm={() => genera(f, undefined, pending.creativeMode)}
            title={isUgc ? `Generare UGC dedicato a ${config.nome}?` : `Generare ${f.nome} ${config.nome}?`}
            desc={isUgc
              ? `L'AI creerà un UGC ${f.formato} nativo per ${config.nome}, separato dagli altri social, usando il Profilo Brand del cliente attivo. Verrà aggiunto al calendario in stato DA_APPROVARE.`
              : `L'AI scriverà hook, caption, hashtag e CTA per un ${f.nome.toLowerCase()} ${config.nome}. Verrà aggiunto al calendario in stato DA_APPROVARE.`}
            modello={aiModel}
            isFree={isFree}
            tokenEstimate={{
              input: 800,
              output: 600,
              cost: isFree ? 'GRATIS (OpenRouter free)' :
                    aiModel.includes('opus') ? '~$0.03' :
                    aiModel.includes('haiku') ? '~$0.004' :
                    '~$0.012',
            }}
            running={false}
          />
        )
      })()}

      {/* Confirm modal batch (generazione multipla) */}
      {pendingBatch && (() => {
        const isFree = aiModel.endsWith(':free')
        const n = selectedFormats.size
        const nomi = config.formati.filter(f => selectedFormats.has(f.id)).map(f => f.nome).join(', ')
        const isSeries = n > 1
        return (
          <ConfirmModal
            open={true}
            onClose={() => setPendingBatch(false)}
            onConfirm={generaBatch}
            title={`Generare ${n} formati ${config.nome}?`}
            desc={isSeries
              ? `L'AI genererà una serie ${activeBusinessCategory.label} coordinata di ${n} contenuti (${nomi}), con tema e funnel condivisi. Ogni elemento resta approvabile separatamente nel calendario. L'AI verrà chiamata ${n} volte.`
              : `L'AI genererà ${nomi} come contenuto autonomo e lo aggiungerà al calendario in stato DA_APPROVARE.`}
            modello={aiModel}
            isFree={isFree}
            tokenEstimate={{
              input: 800 * n,
              output: 600 * n,
              cost: isFree ? 'GRATIS (OpenRouter free)' :
                    aiModel.includes('opus') ? `~$${(0.03 * n).toFixed(2)}` :
                    aiModel.includes('haiku') ? `~$${(0.004 * n).toFixed(3)}` :
                    `~$${(0.012 * n).toFixed(2)}`,
            }}
            running={false}
          />
        )
      })()}

      {/* Contenuti recenti */}
      {recenti.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Ultimi contenuti {config.nome}</h2>
            <Link href={`/dashboard/calendario`} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              Tutti <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recenti.map(c => (
              <div key={c.id} className="card p-3 md:p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {c.link_media_1 && isVideoUrl(c.link_media_1) ? (
                    <video src={c.link_media_1} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                  ) : c.link_media_1 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.link_media_1} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">{config.emoji}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] text-gray-400">{c.id_contenuto}</span>
                    <StatusBadge status={c.status} />
                    {c.quality_level && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 uppercase">{c.quality_level}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{c.hook || c.caption}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {c.data_pubblicazione} {c.ora_pubblicazione?.slice(0,5)}
                  </p>
                </div>
                <Link href={calendarContentHref(c.id_contenuto)} className="btn-secondary py-1.5 px-2" title="Apri questo contenuto nel calendario">
                  <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
