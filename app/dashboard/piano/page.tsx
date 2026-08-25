'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { PLATFORM_LIST, type PlatformKey } from '@/lib/social-config'
import { Target, Calendar, CalendarRange, Sparkles, Loader2, Check, X, Info, ImagePlus, Trash2, AlertTriangle, CheckCircle2, Image as ImageIcon, Film, Layers, Smartphone, Music2 } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'
import AIModelSelector from '@/components/AIModelSelector'
import { useActiveClienteId } from '@/lib/tenant/client'
import { readAISettings } from '@/lib/ai-client'
import { uploadAssets } from '@/lib/asset-upload'
import { useGeneration } from '@/components/GenerationProvider'
import { useRuntimeDemo } from '@/lib/demo-client'
import { CONTENT_QUALITY_OPTIONS, type ContentQuality } from '@/lib/content-quality'
import { getPackage, packageContentCount, packageMixForPeriod, type PackageSpec } from '@/lib/packages'
import {
  MEDIA_PER_FORMATO,
  isVideoMedia,
  normalizeMediaTag,
  requisitiDaPacchetto,
  requisitiMedia,
  verificaMedia,
  type MediaTag,
} from '@/lib/media-requirements'

type QualitySelection = 'auto' | ContentQuality
// `tag` = marcatura manuale ("questa foto è del carosello, questo MP4 del reel").
// Viaggia nel body dentro uploaded_assets e vincola l'assegnazione lato server.
type PlanAsset = { url: string; name: string; mime?: string; kind?: 'image' | 'video' | 'audio'; tag: MediaTag }
const MAX_PLAN_IMAGES = 60
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif'
const MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4'
const AUDIO_ACCEPT = 'audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/ogg,.mp3,.wav,.m4a,.ogg'

// Le 5 destinazioni selezionabili sulla miniatura. 'auto' resta il default
// (decide l'AI): chi non vuole pensarci non deve toccare niente.
const TAG_OPTIONS: { value: MediaTag; label: string; menu: string; pill: string }[] = [
  { value: 'auto',      label: 'Auto',       menu: 'Auto — decide l’AI', pill: 'bg-gray-900/55 text-white' },
  { value: 'carosello', label: 'Carosello',  menu: 'Carosello',          pill: 'bg-violet-600/90 text-white' },
  { value: 'reel',      label: 'Reel/Video', menu: 'Reel / Video',       pill: 'bg-rose-600/90 text-white' },
  { value: 'story',     label: 'Story',      menu: 'Story',              pill: 'bg-amber-600/90 text-white' },
  { value: 'post',      label: 'Post',       menu: 'Post',               pill: 'bg-sky-600/90 text-white' },
]

const DESTINATION_UPLOADS: { tag: Exclude<MediaTag, 'auto'>; title: string; detail: string; accept: string; style: string; iconStyle: string }[] = [
  { tag: 'post', title: 'Foto Post', detail: 'IG/FB 4:5 · Pin 2:3', accept: IMAGE_ACCEPT, style: 'border-sky-200 hover:border-sky-400 hover:bg-sky-50/50', iconStyle: 'bg-sky-100 text-sky-700' },
  { tag: 'story', title: 'Foto Story', detail: 'Verticale 9:16', accept: IMAGE_ACCEPT, style: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50', iconStyle: 'bg-amber-100 text-amber-700' },
  { tag: 'carosello', title: 'Foto Carosello', detail: '3-10 slide · stesso rapporto', accept: IMAGE_ACCEPT, style: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50/50', iconStyle: 'bg-violet-100 text-violet-700' },
  { tag: 'reel', title: 'Reel / Video', detail: 'MP4 o 5 foto · verticale 9:16', accept: MEDIA_ACCEPT, style: 'border-rose-200 hover:border-rose-400 hover:bg-rose-50/50', iconStyle: 'bg-rose-100 text-rose-700' },
]

const AUDIO_DESTINATIONS: { tag: 'post' | 'story' | 'carosello' | 'reel'; title: string; detail: string; style: string }[] = [
  { tag: 'post', title: 'Audio Post', detail: 'Crea versione video musicale', style: 'border-sky-200 hover:border-sky-400 hover:bg-sky-50/50' },
  { tag: 'story', title: 'Audio Story', detail: 'Story video 9:16 / Reel FB', style: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50' },
  { tag: 'carosello', title: 'Audio Carosello', detail: 'Crea slideshow video musicale', style: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50/50' },
  { tag: 'reel', title: 'Audio Reel', detail: 'Traccia da incorporare nel MP4', style: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50' },
]

function tagMeta(tag: MediaTag) {
  return TAG_OPTIONS.find(o => o.value === tag) ?? TAG_OPTIONS[0]
}

// ── Semaforo media di UN SINGOLO pulsante ────────────────────────────────
// I due pulsanti possono generare quantità diverse. Entrambi seguono il periodo
// selezionato, ma pacchetto e piano libero mantengono conteggi e controlli propri.
// Non blocca mai: avvisa e lascia decidere.
function SemaforoMedia({ titolo, pulsante, requisiti, verifica, caricati }: {
  titolo: string
  pulsante: string
  requisiti: { immagini: number; video: number }
  verifica: { ok: boolean; mancanti: string[]; avvisi: string[] }
  caricati: { immagini: number; video: number }
}) {
  const richiesti = `${requisiti.immagini} immagini${requisiti.video > 0 ? ` + ${requisiti.video} MP4` : ''}`
  const disponibili = `${caricati.immagini} ${caricati.immagini === 1 ? 'immagine' : 'immagini'} e ${caricati.video} MP4`
  const Icona = verifica.ok ? CheckCircle2 : AlertTriangle
  return (
    <div
      className={`mb-2.5 flex items-start gap-2 rounded-xl border p-2.5 text-xs ${
        verifica.ok
          ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
          : 'border-amber-300 bg-amber-50 text-amber-900'
      }`}
    >
      <Icona className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-semibold">
          {titolo}: {verifica.ok ? 'media sufficienti' : 'media insufficienti'}
        </p>
        <p className="mt-0.5">
          Servono <span className="font-semibold">{richiesti}</span>, hai caricato <span className="font-semibold">{disponibili}</span>.
          {!verifica.ok && ' Puoi generare comunque, ma i contenuti scoperti restano senza media (li aggiungi poi dal calendario).'}
        </p>
        {!verifica.ok && verifica.mancanti.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {verifica.mancanti.map((m, i) => <li key={i}>• {m}</li>)}
          </ul>
        )}
        {verifica.avvisi.length > 0 && (
          <ul className={`mt-1 space-y-0.5 ${verifica.ok ? 'text-emerald-700/90' : 'text-amber-800/80'}`}>
            {verifica.avvisi.map((a, i) => <li key={i}>• {a}</li>)}
          </ul>
        )}
        <p className={`mt-1 ${verifica.ok ? 'text-emerald-700/80' : 'text-amber-800/70'}`}>
          ↓ Questo conto vale per {pulsante}.
        </p>
      </div>
    </div>
  )
}

export default function PianoPage() {
  const [periodo, setPeriodo] = useState<'settimanale' | 'mensile'>('settimanale')
  const [piattaforme, setPiattaforme] = useState<PlatformKey[]>(['instagram', 'facebook'])
  const [obiettivo, setObiettivo] = useState('mix')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [aiModel, setAiModel] = useState('google/gemma-4-31b-it:free')
  const [quality, setQuality] = useState<QualitySelection>('auto')
  const [visualPreset, setVisualPreset] = useState<'' | 'trending' | 'premium' | 'minimal' | 'classico'>('')
  const [useTrendingEffects, setUseTrendingEffects] = useState(true)
  const [useWebTrends, setUseWebTrends] = useState(true)
  const [includeWeekend, setIncludeWeekend] = useState(true)
  const [planAssets, setPlanAssets] = useState<PlanAsset[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fallbackPopup, setFallbackPopup] = useState<{ count: number; completed: number } | null>(null)
  const [clientePkg, setClientePkg] = useState<PackageSpec | null>(null)
  // Quota reale del cliente (clienti.contenuti_mese): l'admin può sovrascrivere
  // il numero di contenuti del pacchetto, e il fabbisogno media deve seguirla.
  const [clienteQuota, setClienteQuota] = useState<number | null>(null)
  const { clienteId } = useActiveClienteId()
  const demo = useRuntimeDemo()
  const gen = useGeneration()
  const running = gen.isRunning('piano')
  const runningPkg = gen.isRunning('piano-pacchetto')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAiModel(localStorage.getItem('ai_model') ?? 'google/gemma-4-31b-it:free')
    }
  }, [])

  // Pacchetto del cliente attivo: abilita la modalità "piano del pacchetto"
  // e alimenta il calcolo del fabbisogno media (quante foto/MP4 servono).
  useEffect(() => {
    let alive = true
    async function loadPkg() {
      if (!clienteId) { setClientePkg(null); setClienteQuota(null); return }
      try {
        const rows = await fetch('/api/data/clienti').then(r => r.ok ? r.json() : [])
        const c = Array.isArray(rows) ? rows.find((x: { id?: string; slug?: string }) => x.id === clienteId || x.slug === clienteId) : null
        const quota = Number(c?.contenuti_mese)
        if (alive) {
          setClientePkg(getPackage(c?.pacchetto))
          setClienteQuota(Number.isFinite(quota) && quota > 0 ? quota : null)
        }
      } catch { if (alive) { setClientePkg(null); setClienteQuota(null) } }
    }
    loadPkg()
    return () => { alive = false }
  }, [clienteId])

  function togglePlatform(key: PlatformKey) {
    setPiattaforme(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key])
  }

  // Nome prodotto precompilato dal filename: "tshirt-lario.jpg" → "Tshirt Lario".
  // L'AI lo usa per scegliere la foto giusta per ogni contenuto del piano.
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

  function renamePlanAsset(index: number, value: string) {
    setPlanAssets(prev => prev.map((a, i) => i === index ? { ...a, name: value } : a))
  }

  // Marcatura manuale: vincolo, non consiglio. Lato server un media marcato
  // "carosello" non finisce su un reel o una story (e viceversa).
  function retagPlanAsset(index: number, value: string) {
    const tag = normalizeMediaTag(value)
    setPlanAssets(prev => prev.map((a, i) => i === index ? { ...a, tag } : a))
  }

  // Upload in blocchi da 14 (limite server per richiesta) finché tutti i media scelti sono caricati.
  async function uploadPlanImages(files: FileList | null, destination: MediaTag = 'auto') {
    if (!files?.length || !clienteId) return
    setUploadError(null)
    setUploadingImages(true)
    try {
      const selected = Array.from(files).slice(0, MAX_PLAN_IMAGES - planAssets.length)
      for (let i = 0; i < selected.length; i += 14) {
        const chunk = selected.slice(i, i + 14)
        const form = new FormData()
        form.append('cliente_id', clienteId)
        chunk.forEach(file => form.append('files', file))
        const data = await uploadAssets(form)
        const uploaded: PlanAsset[] = (data.assets || []).map(a => ({
          url: a.url,
          name: a.kind === 'audio' ? a.name : prettyName(a.name),
          mime: a.mime,
          kind: a.kind,
          tag: destination,
        }))
        setPlanAssets(prev => [...prev, ...uploaded])
      }
    } catch (e) {
      setUploadError((e as Error).message)
    } finally {
      setUploadingImages(false)
    }
  }

  function removePlanImage(index: number) {
    setPlanAssets(prev => prev.filter((_, i) => i !== index))
  }

  function chiediConferma() {
    if (piattaforme.length === 0) {
      setMsg({ type: 'err', text: 'Seleziona almeno una piattaforma' })
      return
    }
    setAiModel(readAISettings().model)
    setConfirmOpen(true)
  }

  async function genera(faseArg?: 1 | 2) {
    setConfirmOpen(false)
    setMsg(null)

    // Accetta SOLO 1 o 2: se qualcuno ripassa `genera` come handler React,
    // l'evento del click non deve finire nel body (JSON circolare).
    const fase = faseArg === 1 || faseArg === 2 ? faseArg : undefined

    if (!demo && !clienteId) {
      setMsg({ type: 'err', text: 'Cliente non selezionato' })
      return
    }

    const aiSettings = readAISettings()
    const faseLabel = fase ? ` · fase ${fase} (sett. ${fase === 1 ? '1-2' : '3-4'})` : ''
    // Fase mensile: metà settimane per volta → richiesta più corta, meno rischio timeout.
    const result = await gen.run<{
      count?: number
      completed_count?: number
      fallback_slots?: number
      images_provided?: number
      images_insufficient?: boolean
      carousel_underfilled?: boolean
      chunks_total?: number
      chunks_failed?: number
      items_scartati?: number
    }>({
      key: fase ? `piano-fase-${fase}` : 'piano',
      label: `Piano editoriale ${periodo}${faseLabel}`,
      url: '/api/generate/plan',
      body: { cliente_id: clienteId, piattaforme, obiettivo, periodo, quality, media_urls: planAssets.filter(a => a.kind !== 'audio').map(a => a.url), uploaded_assets: planAssets.map(a => ({ url: a.url, name: a.name, mime: a.mime, kind: a.kind, tag: a.tag })), ...(visualPreset ? { visual_preset: visualPreset } : {}), use_trending_effects: useTrendingEffects, include_weekend: includeWeekend, use_web_trends: useWebTrends, ...(fase ? { fase } : {}), ...aiSettings },
      href: '/dashboard/calendario',
      estMs: periodo === 'mensile' ? 50000 : 25000,
      timeoutMs: periodo === 'mensile' ? 130000 : 95000,
    })

    if (result.ok) {
      const data = result.data
      const fallbackCount = data?.fallback_slots ?? 0
      if (fallbackCount > 0) {
        setFallbackPopup({ count: fallbackCount, completed: data?.completed_count ?? 0 })
      }
      const imgNote = !data?.images_provided
        ? ' Nessun media caricato: i contenuti sono senza foto/video, caricali poi dal calendario.'
        : data.images_insufficient
          ? ` ${data.images_provided} media usati uno per contenuto: sono finiti prima dei post, gli ultimi restano senza media (caricane altri o assegnali dal calendario).`
          : ` ${data.images_provided} media abbinati dall'AI ai contenuti in base alla descrizione (carosello 3-10).`
      const chunkNote = data?.chunks_failed
        ? ` ${data.chunks_failed} blocchi AI sono stati recuperati come contenuti da sistemare nel calendario.`
        : ''
      const scartatiNote = data?.items_scartati
        ? ` ⚠️ ${data.items_scartati} contenuti sono stati scartati perché il modello li ha restituiti incompleti (senza testo): rigenera, o passa a un modello più capace dal selettore in alto.`
        : ''
      const faseNote = fase ? ` (fase ${fase}: settimane ${fase === 1 ? '1-2' : '3-4'})` : ''
      const outcome = fallbackCount > 0
        ? `${data?.completed_count ?? 0} completati, ${fallbackCount} da sistemare`
        : `${data?.count ?? '?'} contenuti completati`
      setMsg({ type: 'ok', text: `Piano generato${faseNote}: ${outcome}. Tutti gli slot del ciclo sono nel calendario.${imgNote}${chunkNote}${scartatiNote}` })
    } else {
      setMsg({ type: 'err', text: result.error || 'Generazione piano fallita' })
    }
  }

  // Modalità "piano del pacchetto": numero/mix/social/qualità imposti dal pacchetto
  // acquistato dal cliente. Il periodo selezionato governa anche il pacchetto.
  async function generaPacchetto() {
    setMsg(null)
    if (!clientePkg) return
    if (!demo && !clienteId) { setMsg({ type: 'err', text: 'Cliente non selezionato' }); return }
    if (piattaforme.length > clientePkg.social) {
      setMsg({ type: 'err', text: `Il pacchetto ${clientePkg.nome} include fino a ${clientePkg.social} social: riduci la selezione.` })
      return
    }
    const aiSettings = readAISettings()
    const result = await gen.run<{ count?: number; completed_count?: number; fallback_slots?: number; articolo_blog?: boolean; pacchetto_troncati?: number; images_provided?: number }>({
      key: 'piano-pacchetto',
      label: `Piano ${periodo} · pacchetto ${clientePkg.nome}`,
      url: '/api/generate/plan',
      body: { cliente_id: clienteId, piattaforme, obiettivo, periodo, quality: 'auto', media_urls: planAssets.filter(a => a.kind !== 'audio').map(a => a.url), uploaded_assets: planAssets.map(a => ({ url: a.url, name: a.name, mime: a.mime, kind: a.kind, tag: a.tag })), ...(visualPreset ? { visual_preset: visualPreset } : {}), use_trending_effects: true, include_weekend: includeWeekend, use_web_trends: true, pacchetto: clientePkg.id, ...aiSettings },
      href: '/dashboard/calendario',
      estMs: periodo === 'mensile' ? 55000 : 30000,
      timeoutMs: periodo === 'mensile' ? 140000 : 100000,
    })
    if (result.ok) {
      const d = result.data
      const fallbackCount = d?.fallback_slots ?? 0
      if (fallbackCount > 0) {
        setFallbackPopup({ count: fallbackCount, completed: d?.completed_count ?? 0 })
      }
      const outcome = fallbackCount > 0
        ? `${d?.completed_count ?? 0} completati, ${fallbackCount} da sistemare`
        : `${d?.count ?? '?'} contenuti completati`
      setMsg({ type: 'ok', text: `Piano ${periodo} ${clientePkg.nome} generato: ${outcome}${d?.articolo_blog ? ' + articolo blog collegato' : ''}. Il ciclo resta completo nel calendario.` })
    } else {
      setMsg({ type: 'err', text: result.error || 'Generazione piano pacchetto fallita' })
    }
  }

  // ── Fabbisogno media: quante foto e quanti MP4 servono DAVVERO ──────────
  // Prima qui c'era una stima statica ("servono circa 10-20 media"). Ora il
  // numero esce dal pacchetto/quota del cliente e dalle regole per formato
  // (1 media per post, 5 per carosello, 1 MP4 per reel), e si aggiorna da solo
  // mentre l'utente carica.
  // Fabbisogno del PULSANTE VIOLA (piano libero): segue il periodo selezionato.
  const requisiti = useMemo(
    () => requisitiDaPacchetto(clientePkg, clienteQuota, periodo),
    [clientePkg, clienteQuota, periodo],
  )
  // Senza pacchetto né quota il fabbisogno non è calcolabile: niente allarmi,
  // si mostrano solo le regole per formato.
  const fabbisognoNoto = requisiti.immagini > 0 || requisiti.video > 0
  // Conteggio per estensione, la stessa regola usata da verificaMedia e dal
  // backend: quello che si legge qui è quello che vede l'assegnazione.
  const caricati = useMemo(() => {
    const visualAssets = planAssets.filter(a => a.kind !== 'audio')
    const video = visualAssets.filter(a => isVideoMedia(a.url)).length
    return { video, immagini: visualAssets.length - video }
  }, [planAssets])
  // Piano pacchetto e piano libero hanno verifiche indipendenti.
  const verifica = useMemo(
    () => verificaMedia(planAssets.filter(a => a.kind !== 'audio').map(a => ({ url: a.url, tag: a.tag })), requisiti),
    [planAssets, requisiti],
  )
  const contenutiPacchettoPeriodo = clientePkg ? packageContentCount(clientePkg, periodo, clienteQuota) : 0
  const mixPacchettoPeriodo = clientePkg ? packageMixForPeriod(clientePkg, periodo, clienteQuota) : null
  const uploadTargets = mixPacchettoPeriodo ? {
    post: { main: `${mixPacchettoPeriodo.postSingoli} foto richieste`, note: `${mixPacchettoPeriodo.postSingoli} post/pin` },
    story: { main: `${mixPacchettoPeriodo.stories} foto richieste`, note: `${mixPacchettoPeriodo.stories} Story` },
    carosello: {
      main: `${mixPacchettoPeriodo.caroselli * MEDIA_PER_FORMATO.carousel.immagini} foto richieste`,
      note: `${mixPacchettoPeriodo.caroselli} caroselli × ${MEDIA_PER_FORMATO.carousel.immagini}`,
    },
    reel: {
      main: `${mixPacchettoPeriodo.reelVideo} MP4 richiesti`,
      note: `oppure ${mixPacchettoPeriodo.reelVideo * MEDIA_PER_FORMATO.reel.immagini} foto 9:16`,
    },
  } : null
  const numContenuti = periodo === 'mensile' ? '25-35' : '7-10'
  const numeroRiepilogo = clientePkg ? String(contenutiPacchettoPeriodo) : numContenuti
  const contenutiLiberiStimati = periodo === 'mensile' ? 30 : 8
  const requisitiLiberi = useMemo(
    () => requisitiMedia({ contenuti: contenutiLiberiStimati, postCaroselli: 0, reelBrevi: 0, conVideo: true }),
    [contenutiLiberiStimati],
  )
  const verificaLibera = useMemo(
    () => verificaMedia(planAssets.filter(a => a.kind !== 'audio').map(a => ({ url: a.url, tag: a.tag })), requisitiLiberi),
    [planAssets, requisitiLiberi],
  )
  const isFree = aiModel.endsWith(':free')
  const stimaContenuti = contenutiLiberiStimati
  const tokenStima = {
    input:  stimaContenuti * 800,    // ~800 token input per contenuto
    output: stimaContenuti * 600,    // ~600 token output per contenuto
    cost:   isFree ? 'GRATIS (OpenRouter free tier)' :
            `~$${(stimaContenuti * 0.012).toFixed(2)} (dipende dal modello OpenRouter scelto)`,
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Piano editoriale</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Un click → AI genera contenuti per tutti i social selezionati con il modello che hai impostato.
        </p>
      </div>

      <AIModelSelector task="piano-editoriale" />

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">Q</div>
          <h2 className="font-semibold text-gray-900">Qualità operativa</h2>
        </div>
        <select
          value={quality}
          onChange={event => setQuality(event.target.value as QualitySelection)}
          className="input"
        >
          {CONTENT_QUALITY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label} — {option.desc}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          High/Elite aggiunge per ogni contenuto: audience, funnel, KPI, angle, brief creativo, A/B test, rischi e checklist.
        </p>
      </div>

      {/* Stile visual e motion per la produzione del piano */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">V</div>
          <h2 className="font-semibold text-gray-900">Stile visual</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {([
            { value: '' as const, label: 'Auto', desc: 'Sceglie l’AI' },
            { value: 'trending' as const, label: '🔥 Trending', desc: 'Cuts rapidi, hook forte' },
            { value: 'premium' as const, label: '✨ Premium', desc: 'Elegante, curato' },
            { value: 'minimal' as const, label: '⚪ Minimal', desc: 'Pulito, essenziale' },
            { value: 'classico' as const, label: '📰 Classico', desc: 'Sobrio, informativo' },
          ]).map(p => (
            <button
              key={p.value || 'auto'}
              onClick={() => setVisualPreset(p.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                visualPreset === p.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <p className="font-semibold text-xs text-gray-900">{p.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={clientePkg ? true : useTrendingEffects}
            onChange={e => setUseTrendingEffects(e.target.checked)}
            disabled={Boolean(clientePkg)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Effetti e animazioni recenti, calibrati per formato e brand{clientePkg ? ' · attivi nella skill' : ''}</span>
        </label>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={clientePkg ? true : useWebTrends}
            onChange={e => setUseWebTrends(e.target.checked)}
            disabled={Boolean(clientePkg)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Trend reali dal web: format, motion, transizioni e meccaniche del momento{clientePkg ? ' · obbligatori nella skill' : ''}</span>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          La skill usa i trend solo quando pertinenti e li alterna per non rendere il profilo confuso o ripetitivo.
        </p>
      </div>

      {/* La skill e automatica: nessun selettore puo scavalcare il pacchetto acquistato. */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">S</div>
          <div>
            <h2 className="font-semibold text-gray-900">Skill editoriale</h2>
            <p className="text-xs text-gray-500">Regia del piano, delle immagini e della griglia.</p>
          </div>
        </div>
        <div className={`flex items-start gap-3 rounded-lg border p-3 ${
          clientePkg ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'
        }`}>
          {clientePkg
            ? <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-700" />
            : <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />}
          <div>
            <p className="font-semibold text-sm text-gray-900">
              {clientePkg ? `Skill SWA ${clientePkg.nome} attiva automaticamente` : 'Piano libero: generazione standard'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {clientePkg
                ? `Il pacchetto acquistato attiva la ricetta ${clientePkg.nome}: strategia, storyboard, griglia e brief immagini. Numero, mix, social e qualità restano quelli contrattuali.`
                : 'Assegna al cliente il pacchetto Presenza o Crescita per applicare automaticamente la relativa skill SWA.'}
            </p>
            {clientePkg && (
              <p className="mt-2 text-[10px] font-medium leading-relaxed text-emerald-800">
                Brief e offerta → ricerca recente → strategia e funnel → regia e griglia → produzione → QA → approvazione → distribuzione e ottimizzazione
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step 1 — Periodo */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">1</div>
          <h2 className="font-semibold text-gray-900">Periodo</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(['settimanale', 'mensile'] as const).map(p => {
            const Icon = p === 'settimanale' ? Calendar : CalendarRange
            const conteggioPeriodo = clientePkg && periodo === p ? packageContentCount(clientePkg, p, clienteQuota) : null
            return (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  periodo === p
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${periodo === p ? 'text-brand-600' : 'text-gray-400'}`} />
                <p className="font-semibold text-sm text-gray-900 capitalize">{p}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {conteggioPeriodo
                    ? `${conteggioPeriodo} contenuti · pacchetto ${clientePkg?.nome}`
                    : periodo === p
                      ? p === 'settimanale' ? '7-10 contenuti / 7 giorni' : '25-35 contenuti / 30 giorni'
                      : 'Seleziona questo periodo'}
                </p>
              </button>
            )
          })}
        </div>
        <label className="mt-4 flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeWeekend}
            onChange={e => setIncludeWeekend(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700">Includi il <strong>weekend</strong> (sabato e domenica) nel piano</span>
        </label>
      </div>

      {/* Step 2 — Piattaforme */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">2</div>
          <h2 className="font-semibold text-gray-900">Piattaforme</h2>
          <span className="text-xs text-gray-400 ml-auto">{piattaforme.length} selezionate</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PLATFORM_LIST.map(p => {
            const selected = piattaforme.includes(p.key)
            return (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className={`p-3 rounded-xl border-2 transition-all relative ${
                  selected
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                {selected && (
                  <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-brand-600" />
                )}
                <div className="text-2xl mb-1">{p.emoji}</div>
                <p className="text-xs font-semibold text-gray-900">{p.nome}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{p.formati.length} formati</p>
              </button>
            )
          })}
        </div>
        {clientePkg && (
          <p className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
            piattaforme.length > 0 && piattaforme.length <= clientePkg.social
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}>
            Pacchetto {clientePkg.nome}: selezionati <span className="font-bold">{piattaforme.length}/{clientePkg.social}</span> social disponibili.
            {piattaforme.length > 0 && piattaforme.length <= clientePkg.social ? ' Selezione valida.' : ` Puoi usarne al massimo ${clientePkg.social}.`}
          </p>
        )}
      </div>

      {/* Step 3 — Obiettivo */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">3</div>
          <h2 className="font-semibold text-gray-900">Obiettivo principale</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { v: 'mix',         l: 'Mix completo', e: '🎯' },
            { v: 'vendita',     l: 'Vendita',      e: '💰' },
            { v: 'awareness',   l: 'Awareness',    e: '📢' },
            { v: 'community',   l: 'Community',    e: '💬' },
          ].map(o => (
            <button
              key={o.v}
              onClick={() => setObiettivo(o.v)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                obiettivo === o.v
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <div className="text-xl mb-1">{o.e}</div>
              <p className="text-xs font-semibold text-gray-900">{o.l}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Riepilogo + CTA */}
      <div className="card p-5 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-violet-100">
        <div className="flex items-start gap-3 mb-4">
          <Target className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Riepilogo</p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-mono font-bold text-violet-700">{numeroRiepilogo}</span> contenuti
              {' '}<span className="capitalize">{periodo}</span> distribuiti su
              {' '}<span className="font-semibold">{piattaforme.length}</span> piattaforme
              ({piattaforme.map(p => PLATFORM_LIST.find(x => x.key === p)?.emoji).join(' ')})
              {' '}con obiettivo <span className="font-semibold">{obiettivo}</span>
              {' '}e qualità <span className="font-semibold uppercase">{clientePkg?.quality ?? quality}</span>
              {clientePkg ? ` · pacchetto ${clientePkg.nome}` : ''}.
            </p>
          </div>
        </div>

        {/* Upload media: caricali tutti in un colpo, il piano li distribuisce sui contenuti */}
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-gray-700 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-700 leading-relaxed flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-gray-950">Media kit del piano</p>
                {clientePkg && (
                  <span className="rounded-md bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white">
                    {clientePkg.nome} · <span className="capitalize">{periodo}</span>
                  </span>
                )}
              </div>
              {fabbisognoNoto ? (
                <>
                  <p className="mt-0.5">
                    Piano <span className="font-semibold capitalize">{periodo}</span> del pacchetto {clientePkg?.nome}: servono{' '}
                    <span className="font-bold text-violet-700">{requisiti.immagini} immagini</span>
                    {requisiti.video > 0 && <> + <span className="font-bold text-violet-700">{requisiti.video} MP4</span></>}
                    {' · '}caricati{' '}
                    <span className={`font-bold ${caricati.immagini >= requisiti.immagini ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {caricati.immagini} {caricati.immagini === 1 ? 'immagine' : 'immagini'}
                    </span>
                    {' e '}
                    <span className={`font-bold ${caricati.video >= requisiti.video ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {caricati.video} MP4
                    </span>
                    .
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-gray-600">
                    {requisiti.dettaglio.map((riga, i) => <li key={i}>• {riga}</li>)}
                  </ul>
                </>
              ) : (
                <>
                  <p className="mt-0.5">
                    {requisiti.dettaglio[0]} Piano <span className="font-semibold capitalize">{periodo}</span> ({numContenuti} contenuti):{' '}
                    <span className="font-semibold text-violet-700">{planAssets.length} media caricati</span> ({caricati.immagini} immagini, {caricati.video} MP4).
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-gray-600">
                    <li>• <span className="font-medium">{MEDIA_PER_FORMATO.post.immagini} media</span> per ogni post/story/pin/video</li>
                    <li>• <span className="font-medium">{MEDIA_PER_FORMATO.carousel.immagini} media</span> per ogni carosello (minimo {MEDIA_PER_FORMATO.carousel.min}, massimo {MEDIA_PER_FORMATO.carousel.max})</li>
                    <li>• <span className="font-medium">1 MP4</span> per ogni reel/short, oppure {MEDIA_PER_FORMATO.reel.immagini} immagini da montare come slide</li>
                  </ul>
                </>
              )}
              {clientePkg && mixPacchettoPeriodo && (
                <div className="mt-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2 py-1.5 text-emerald-900">
                  <p>
                    Ricetta automatica <span className="font-bold">{clientePkg.nome} · {periodo}</span>: il pulsante verde genera esattamente <span className="font-bold">{mixPacchettoPeriodo.totale} contenuti</span>,
                    {' '}{mixPacchettoPeriodo.postSingoli} post/pin + {mixPacchettoPeriodo.caroselli} caroselli + {mixPacchettoPeriodo.stories} Story + {mixPacchettoPeriodo.reelVideo} Reel/short.
                    Fabbisogno collegato: <span className="font-bold">{requisiti.immagini} immagini{requisiti.video > 0 ? ` + ${requisiti.video} MP4` : ''}</span>.
                  </p>
                  <p className="mt-1 text-[10px] text-emerald-800">
                    I conteggi seguono il pacchetto del cliente, non il numero di file gia caricati. Se il materiale e stato prodotto con una ricetta diversa, correggi prima il pacchetto nella scheda cliente.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Caricamento media separato per formato">
            {DESTINATION_UPLOADS.map(destination => {
              const destinationAssets = planAssets.filter(asset => asset.tag === destination.tag && asset.kind !== 'audio')
              const imageCount = destinationAssets.filter(asset => !isVideoMedia(asset.url)).length
              const videoCount = destinationAssets.length - imageCount
              const target = uploadTargets?.[destination.tag]
              const DestinationIcon = destination.tag === 'post'
                ? ImageIcon
                : destination.tag === 'story'
                  ? Smartphone
                  : destination.tag === 'carosello'
                    ? Layers
                    : Film
              return (
                <label
                  key={destination.tag}
                  className={`relative flex min-h-[98px] cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${destination.style} ${uploadingImages ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${destination.iconStyle}`}>
                    {uploadingImages ? <Loader2 className="h-5 w-5 animate-spin" /> : <DestinationIcon className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-gray-950">{destination.title}</span>
                    <span className="mt-0.5 block text-[10px] text-gray-500">{destination.detail}</span>
                    {target && (
                      <span className="mt-2 block">
                        <span className="block font-semibold text-gray-900">{target.main}</span>
                        <span className="block text-[10px] text-gray-500">{target.note}</span>
                      </span>
                    )}
                  </span>
                  <span className="self-start rounded-md bg-gray-100 px-2 py-1 text-right font-mono text-[10px] font-semibold text-gray-700" aria-label={`${destinationAssets.length} media caricati`}>
                    {destination.tag === 'reel' ? `${videoCount} MP4 · ${imageCount} foto` : `${imageCount} foto`}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept={destination.accept}
                    className="hidden"
                    disabled={uploadingImages || planAssets.length >= MAX_PLAN_IMAGES}
                    onChange={e => { uploadPlanImages(e.target.files, destination.tag); e.target.value = '' }}
                  />
                </label>
              )
            })}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Caricamento audio separato per formato">
            {AUDIO_DESTINATIONS.map(destination => (
              <label
                key={destination.tag}
                className={`flex min-h-[82px] cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 text-xs shadow-sm transition-all hover:shadow-md ${destination.style} ${uploadingImages ? 'pointer-events-none opacity-50' : ''}`}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                  {uploadingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music2 className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-950">{destination.title}</span>
                  <span className="mt-0.5 block text-[10px] text-gray-500">{destination.detail}</span>
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-1 font-mono text-[10px] font-semibold text-emerald-800">
                  {planAssets.filter(asset => asset.kind === 'audio' && asset.tag === destination.tag).length}
                </span>
                <input
                  type="file"
                  multiple
                  accept={AUDIO_ACCEPT}
                  className="hidden"
                  disabled={uploadingImages || planAssets.length >= MAX_PLAN_IMAGES}
                  onChange={e => { uploadPlanImages(e.target.files, destination.tag); e.target.value = '' }}
                />
              </label>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-gray-500">
            MP3, WAV, M4A o OGG, massimo 25 MB. Remotion incorpora la traccia in un MP4 SWA prima del passaggio a Blotato. Reel e Instagram Story mantengono il formato video; Post, Caroselli e Facebook Story vengono adattati a Reel/slideshow video e richiedono una nuova approvazione.
          </p>

          <label className={`mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-[11px] text-gray-600 hover:border-gray-400 hover:bg-gray-50 ${uploadingImages ? 'pointer-events-none opacity-50' : ''}`}>
            <ImagePlus className="h-3.5 w-3.5" />
            Auto / destinazione dal nome o dalla descrizione ({planAssets.filter(asset => asset.tag === 'auto').length})
            <input
              type="file"
              multiple
              accept={MEDIA_ACCEPT}
              className="hidden"
              disabled={uploadingImages || planAssets.length >= MAX_PLAN_IMAGES}
              onChange={e => { uploadPlanImages(e.target.files, 'auto'); e.target.value = '' }}
            />
          </label>

          <p className="mt-2 text-right text-[10px] text-gray-500">Totale {planAssets.length}/{MAX_PLAN_IMAGES} media</p>

          {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}

          {planAssets.length > 0 && (
            <>
              <p className="mt-3 text-[11px] text-gray-500">Controlla nome e destinazione sulle miniature. Puoi spostare qualsiasi file in un altro formato prima di generare il piano.</p>
              <div className="mt-1.5 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {planAssets.map((a, i) => {
                  const meta = tagMeta(a.tag)
                  const isVideo = a.kind === 'video' || a.mime?.startsWith('video/') || isVideoMedia(a.url)
                  const isAudio = a.kind === 'audio' || a.mime?.startsWith('audio/')
                  return (
                    <div key={a.url + i} className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                      <div className="relative group aspect-square bg-gray-100">
                        {isAudio ? (
                          <div className="flex h-full flex-col items-center justify-center gap-2 bg-emerald-50 px-2 text-center text-emerald-800">
                            <Music2 className="h-8 w-8" />
                            <span className="line-clamp-2 text-[10px] font-semibold">Audio {meta.label}</span>
                            <audio src={a.url} controls preload="metadata" className="h-7 w-full" />
                          </div>
                        ) : isVideo ? (
                          <video src={a.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                        )}
                        {/* MP4 e marcatura leggibili a colpo d'occhio sulla miniatura */}
                        {isVideo && !isAudio && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-black/65 text-white text-[9px] font-bold leading-none">MP4</span>
                        )}
                        <span className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold leading-none ${meta.pill}`}>
                          {meta.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePlanImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-red-600 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Rimuovi media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        value={a.name || ''}
                        onChange={e => renamePlanAsset(i, e.target.value)}
                        placeholder="Nome prodotto…"
                        className="w-full text-[11px] px-2 py-1.5 border-t border-gray-100 focus:outline-none focus:bg-violet-50/40"
                      />
                      <select
                        value={a.tag}
                        onChange={e => retagPlanAsset(i, e.target.value)}
                        aria-label={`Destinazione di ${a.name || 'questo media'}`}
                        title="Dove deve finire questo media"
                        className="w-full text-[11px] px-1.5 py-1.5 bg-white text-gray-700 border-t border-gray-100 focus:outline-none focus:bg-violet-50/40 cursor-pointer"
                      >
                        {(isAudio ? TAG_OPTIONS.filter(o => ['post', 'story', 'carosello', 'reel'].includes(o.value)) : TAG_OPTIONS).map(o => (
                          <option key={o.value} value={o.value}>{o.menu}</option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Modalità pacchetto: se il cliente ha un pacchetto, un click genera i contenuti compresi */}
        {clientePkg && (
          <div className="mb-3 p-3 rounded-xl bg-white/70 border border-emerald-200">
            <p className="text-xs text-gray-700">
              Piano <span className="font-bold capitalize text-emerald-700">{periodo}</span> del pacchetto <span className="font-bold text-emerald-700">{clientePkg.nome}</span>
              {' '}su {clientePkg.social} social, qualità <span className="uppercase">{clientePkg.quality}</span>.
            </p>
            <p className="mt-1 text-[11px] font-semibold text-emerald-800">
              Skill SWA {clientePkg.nome} applicata automaticamente: strategia, storyboard immagini e coerenza della griglia.
            </p>
            {mixPacchettoPeriodo && (
              <p className="mt-1 mb-2 text-[11px] font-medium text-emerald-800">
                Periodo <span className="font-bold capitalize">{periodo}</span>: {mixPacchettoPeriodo.totale} contenuti
                {' '}({mixPacchettoPeriodo.postSingoli} post/pin + {mixPacchettoPeriodo.caroselli} caroselli + {mixPacchettoPeriodo.stories} Story + {mixPacchettoPeriodo.reelVideo} Reel/short)
                {clienteQuota && clienteQuota !== clientePkg.contenutiMese ? ' · quota personalizzata del cliente' : ''}.
                {clientePkg.articoloBlog && periodo === 'mensile' ? ' Include l’articolo blog collegato.' : ''}
              </p>
            )}
            {verifica && (
              <SemaforoMedia
                titolo={`Piano ${periodo} del pacchetto ${clientePkg.nome}`}
                pulsante="il pulsante verde qui sotto"
                requisiti={requisiti}
                verifica={verifica}
                caricati={caricati}
              />
            )}
            <button
              onClick={generaPacchetto}
              disabled={runningPkg || running || uploadingImages || piattaforme.length === 0 || piattaforme.length > clientePkg.social}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {runningPkg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {runningPkg ? 'Generazione pacchetto...' : `Genera piano ${periodo} · pacchetto ${clientePkg.nome}`}
            </button>
            <p className="mt-1.5 text-[11px] text-gray-500 text-center">Numero, mix formati e qualità seguono il pacchetto. Puoi usare fino a {clientePkg.social} social.</p>
          </div>
        )}

        {clientePkg && <p className="text-[11px] text-gray-400 mb-2 text-center">— oppure genera un piano libero (scegli tu i parametri) —</p>}

        {/* Semaforo del PIANO LIBERO: fabbisogno del periodo selezionato al
            punto 1. Può essere verde mentre quello del pacchetto è ambra. */}
        <SemaforoMedia
          titolo={`Piano libero ${periodo}`}
          pulsante="il pulsante viola qui sotto"
          requisiti={requisitiLiberi}
          verifica={verificaLibera}
          caricati={caricati}
        />

        <button
          onClick={chiediConferma}
          disabled={running || runningPkg || uploadingImages || piattaforme.length === 0}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {running ? 'Generazione in corso...' : `Genera piano ${periodo}`}
        </button>

        {/* Mensile in 2 fasi: richieste più corte, meno rischio timeout/rate-limit */}
        {periodo === 'mensile' && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2 text-center">Oppure genera in 2 fasi (più affidabile se va in timeout):</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => genera(1)}
                disabled={running || uploadingImages || piattaforme.length === 0}
                className="btn-secondary py-2.5 justify-center text-sm disabled:opacity-50"
              >
                Fase 1 · settimane 1-2
              </button>
              <button
                onClick={() => genera(2)}
                disabled={running || uploadingImages || piattaforme.length === 0}
                className="btn-secondary py-2.5 justify-center text-sm disabled:opacity-50"
              >
                Fase 2 · settimane 3-4
              </button>
            </div>
          </div>
        )}

        {/* onConfirm va passato come arrow, non come riferimento a `genera`:
            ConfirmModal lo usa come onClick e React passerebbe l'evento come
            `fase`, che finiva nel body della richiesta (JSON circolare). */}
        <ConfirmModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => genera()}
          title="Conferma generazione piano"
          desc={`Stai per generare ${numContenuti} contenuti per ${piattaforme.length} piattaforme con qualità ${quality}. L'AI verrà chiamata UNA volta.`}
          modello={aiModel}
          isFree={isFree}
          tokenEstimate={tokenStima}
          running={running}
        />

        {msg && (
          <div className={`mt-4 text-sm rounded-lg p-3 flex items-start gap-2 ${
            msg.type === 'ok'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {msg.type === 'ok' ? <Check className="w-4 h-4 mt-0.5" /> : <X className="w-4 h-4 mt-0.5" />}
            {msg.text}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>I contenuti verranno creati in stato <span className="font-mono bg-white px-1 rounded">DA APPROVARE</span>.
        Dal <a href="/dashboard/calendario" className="text-brand-600 hover:underline">calendario</a> li approvi (verde → sync Blotato) o li rifiuti (rosso → Non approvati) prima della pubblicazione.</p>
      </div>

      {fallbackPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="fallback-title">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-amber-200 bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50 p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 id="fallback-title" className="font-bold text-gray-900">{fallbackPopup.count} contenuti da sistemare</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {fallbackPopup.completed} contenuti sono pronti. Gli altri mantengono giorno, formato e media assegnati e non interrompono il ciclo.
                </p>
              </div>
            </div>
            <div className="space-y-2 p-5">
              <a
                href="/dashboard/calendario?filter=ERRORE_MANUALE"
                className="btn-primary flex w-full justify-center py-3"
                onClick={() => setFallbackPopup(null)}
              >
                <Calendar className="h-4 w-4" />
                Apri i {fallbackPopup.count} contenuti da sistemare
              </a>
              <button onClick={() => setFallbackPopup(null)} className="btn-secondary w-full justify-center py-2.5">
                Resta nel piano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
