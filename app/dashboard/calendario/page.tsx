'use client'
export const dynamic = 'force-dynamic'

import { Fragment, useEffect, useState, useCallback, Suspense } from 'react'
import StatusBadge from '@/components/StatusBadge'
import type { Contenuto, Status } from '@/lib/types'
import { CheckCircle, XCircle, RefreshCw, Eye, Info, ChevronDown, Filter, Sparkles, Share2, Download, Trash2, AlertTriangle, Camera, ImagePlus, Search, CalendarDays, Clock, Layers, BarChart3, Zap, List, LayoutGrid, CalendarClock, Music2, GripVertical, Move, ClipboardCheck } from 'lucide-react'
import CalendarGrid from '@/components/CalendarGrid'
import { preflightRow } from '@/lib/publish/preflight'
import { toYmd } from '@/lib/publish/blotato-map'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { demoContenuti } from '@/lib/demo-data'
import PostPreview from '@/components/PostPreview'
import { readGenerationGate } from '@/lib/generation-gates'
import { readClienteId } from '@/lib/use-data'
import { readAISettings, readApiError } from '@/lib/ai-client'
import { uploadAssets } from '@/lib/asset-upload'
import { useRuntimeDemo } from '@/lib/demo-client'

const CANALI = ['tutti','instagram','facebook','tiktok','pinterest','linkedin','threads','x','youtube_shorts','blog']
const FORMATI = ['tutti','post','carousel','reel','story','pin','short','video','articolo']
const CATEGORIE = [
  ['tutti', 'Tutte le categorie'],
  ['vendita', 'Vendita'],
  ['awareness', 'Awareness'],
  ['community', 'Community'],
  ['educazione', 'Educazione'],
  ['ispirazione', 'Ispirazione'],
  ['trending', 'Trending'],
  ['seo', 'SEO / Blog'],
]
const STATI: Status[] = ['DA_APPROVARE','BOZZA','IDEA','APPROVATO','NON_APPROVATO','PUBBLICATO','ERRORE','ERRORE_MANUALE']
const CANALE_ICON: Record<string, string> = {
  instagram: '📸', facebook: '🔵', tiktok: '🎵', pinterest: '📌', linkedin: '💼', threads: '🧵', x: '✖️', youtube_shorts: '▶️', blog: '📝'
}
const MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4'
const AUDIO_ACCEPT = 'audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/ogg,.mp3,.wav,.m4a,.ogg'
const AUDIO_FORMATS = new Set(['post', 'pin', 'story', 'carousel', 'reel', 'short', 'video'])

function audioFormatLabel(formato: string) {
  if (formato === 'carousel') return 'Carosello'
  if (formato === 'story') return 'Story'
  if (formato === 'post' || formato === 'pin') return 'Post'
  return 'Reel'
}

// Esito (anteprima o applicazione) dello spostamento del piano.
type ShiftResult = {
  applicato: boolean
  giorni: number
  spostati: number
  bloccati_blotato: number
  ignorati: number
  prima_data: string
  nuova_prima_data: string
}

// Referto del controllo finale del ciclo (app/api/data/plan-audit + lib/plan-audit).
type PlanAudit = {
  dal: string
  al: string
  attesi: number
  pianificati: number
  settimanePiene: number
  bloccanti: number
  attenzioni: number
  pronto: boolean
  checks: Array<{
    id: string
    titolo: string
    stato: 'ok' | 'attenzione' | 'blocco'
    dettaglio: string
    contenuti?: string[]
  }>
}

type PackageReconcile = {
  month: string
  reconciled: number
  checked?: number
  unchecked?: number
  remote_errors?: Array<{ id_contenuto: string; error: string }>
  summary: {
    included: number
    planned: number
    published: number
    queued: number
    failed: number
    not_sent: number
    missing_to_create: number
    missing_to_publish: number
    extra_planned: number
  }
}

function isVideoUrl(url?: string | null) {
  if (!url) return false
  return url.split('?')[0].toLowerCase().endsWith('.mp4')
}

function asText(value: unknown) {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function hasText(value: unknown) {
  return asText(value).trim().length > 0
}

// Contenuto fermato dalla GENERAZIONE (slot vuoto, struttura narrativa mancante
// o troppo simile a un altro): tutti e tre si sistemano rigenerando. Un
// ERRORE_MANUALE senza uno di quei marcatori e invece un errore di
// PUBBLICAZIONE e resta affare di "Riprova pubblicazione".
function isGenerationFallback(c: Contenuto): boolean {
  return readGenerationGate(c.status, c.note) !== null
}

function formatDateLabel(date: string) {
  if (!date) return 'Data non impostata'
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function formatTimeLabel(time?: string | null) {
  const value = (time || '').slice(0, 5)
  return value || 'orario non impostato'
}

function formatCategoryLabel(value?: string | null) {
  if (!value) return 'Senza categoria'
  return CATEGORIE.find(([id]) => id === value)?.[1] || value.replace(/_/g, ' ')
}

function formatDayName(date: string) {
  if (!date) return 'Da programmare'
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(parsed)
}

function formatShortDate(date: string) {
  if (!date) return 'Senza data'
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' }).format(parsed)
}

function formatMonthLabel(month: string) {
  const parsed = new Date(`${month}-01T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return month
  return new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(parsed)
}

function statusTone(status: string) {
  if (status === 'PUBBLICATO') return 'bg-green-500'
  if (status === 'APPROVATO') return 'bg-blue-500'
  if (status === 'ERRORE' || status === 'ERRORE_MANUALE') return 'bg-red-500'
  if (status === 'NON_APPROVATO') return 'bg-rose-400'
  if (status === 'DA_APPROVARE') return 'bg-amber-500'
  return 'bg-slate-400'
}

export default function CalendarioPage() {
  return (
    <Suspense fallback={<div className="p-8"><RefreshCw className="w-6 h-6 text-gray-400 animate-spin" /></div>}>
      <CalendarioInner />
    </Suspense>
  )
}

function CalendarioInner() {
  const searchParams = useSearchParams()
  const [contenuti, setContenuti]   = useState<Contenuto[]>([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState<Contenuto | null>(null)
  const [filterStatus, setFilter]   = useState<string>(searchParams.get('filter') ?? 'DA_APPROVARE')
  const [filterCanale, setCanale]   = useState('tutti')
  const [filterFormato, setFormato] = useState('tutti')
  const [filterCategoria, setCategoria] = useState('tutti')
  const [searchText, setSearchText] = useState('')
  const [saving, setSaving]         = useState<string | null>(null)
  const [scoring, setScoring]       = useState<string | null>(null)
  const [scoreError, setScoreError] = useState<string | null>(null)
  const [scores, setScores]         = useState<Record<string, Record<string, unknown>>>({})
  const [sendingToken, setSendingToken] = useState<string | null>(null)
  const [approvalUrl, setApprovalUrl]   = useState<string | null>(null)
  const [demoData, setDemoData]     = useState<Contenuto[]>(demoContenuti)
  const [dragItem, setDragItem]     = useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [backuping, setBackuping] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Contenuto | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false)
  const [bulkMoveDate, setBulkMoveDate] = useState('')
  const [bulkMoveTime, setBulkMoveTime] = useState('')
  const [bulkMoving, setBulkMoving] = useState(false)
  // Conferma "non approvare": rejectTarget = singolo post (tasto rosso), rejectBulkOpen = selezione multipla.
  const [rejectTarget, setRejectTarget] = useState<Contenuto | null>(null)
  const [rejectBulkOpen, setRejectBulkOpen] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [brand, setBrand] = useState<{ brand_name?: string | null; social_handle?: string | null } | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [comfyState, setComfyState] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [comfyMsg, setComfyMsg] = useState<string | null>(null)
  const [dryRun, setDryRun] = useState<boolean | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [reconciling, setReconciling] = useState(false)
  const [packageReconcile, setPackageReconcile] = useState<PackageReconcile | null>(null)
  const [auditing, setAuditing] = useState(false)
  const [planAudit, setPlanAudit] = useState<PlanAudit | null>(null)
  // Spostamento del piano: `shiftOpen` apre il pannello, `shiftPreview` tiene
  // l'anteprima calcolata dal server. Nessuno spostamento parte senza che
  // l'anteprima sia stata mostrata: sono decine di pubblicazioni.
  const [shiftOpen, setShiftOpen] = useState(false)
  const [shiftGiorni, setShiftGiorni] = useState('7')
  // 'giorni' = sposta di N giorni · 'data' = riparti dal giorno scelto.
  const [shiftModo, setShiftModo] = useState<'giorni' | 'data'>('giorni')
  const [shiftData, setShiftData] = useState('')
  const [shifting, setShifting] = useState(false)
  const [shiftPreview, setShiftPreview] = useState<ShiftResult | null>(null)
  const [shiftError, setShiftError] = useState<string | null>(null)
  const [requeuing, setRequeuing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<{ type: 'ok' | 'warn' | 'err'; text: string } | null>(null)
  const [vista, setVista] = useState<'lista' | 'griglia'>('lista')
  const [clienteTz, setClienteTz] = useState('Europe/Rome')
  const demo = useRuntimeDemo()

  const clienteId = readClienteId()

  useEffect(() => {
    fetch('/api/data/brand').then(r => r.ok ? r.json() : null).then(setBrand).catch(() => setBrand(null))
  }, [clienteId])

  // Fuso del cliente attivo: usato dal pre-flight (badge/griglia) per validare l'orario.
  useEffect(() => {
    if (!clienteId) return
    fetch('/api/data/clienti')
      .then(r => r.ok ? r.json() : [])
      .then((rows: Array<{ id?: string; slug?: string; timezone?: string }>) => {
        const c = Array.isArray(rows) ? rows.find(x => x.id === clienteId || x.slug === clienteId) : null
        if (c?.timezone) setClienteTz(c.timezone)
      })
      .catch(() => {})
  }, [clienteId])

  // Modalità pubblicazione del cliente (dry_run): REAL = pubblica, DEMO = prova.
  useEffect(() => {
    fetch('/api/data/settings')
      .then(r => r.ok ? r.json() : [])
      .then((rows: Array<{ chiave?: string; valore?: string }>) => {
        const dr = Array.isArray(rows) ? rows.find(s => s.chiave === 'dry_run') : null
        setDryRun(dr ? dr.valore?.toUpperCase() === 'TRUE' : null)
      })
      .catch(() => setDryRun(null))
  }, [clienteId])

  // Cambio filtro/cliente → azzera la selezione multipla (gli id mostrati cambiano).
  useEffect(() => {
    setSelectedIds(new Set())
  }, [filterStatus, filterCanale, filterFormato, filterCategoria, searchText, selectedDay, clienteId])

  const fetchData = useCallback(async () => {
    setLoading(true)
    if (demo) {
      let filtered = demoData
      if (filterStatus !== 'tutti') filtered = filtered.filter(c => c.status === filterStatus)
      if (filterCanale !== 'tutti') filtered = filtered.filter(c => c.canale === filterCanale)
      if (filterFormato !== 'tutti') filtered = filtered.filter(c => c.formato === filterFormato)
      if (filterCategoria !== 'tutti') filtered = filtered.filter(c => c.obiettivo === filterCategoria)
      if (searchText.trim()) {
        const needle = searchText.trim().toLowerCase()
        filtered = filtered.filter(c => [
          c.id_contenuto, c.hook, c.caption, c.tema, c.nome_prodotto,
        ].some(value => String(value || '').toLowerCase().includes(needle)))
      }
      setContenuti(filtered)
      setLoading(false)
      return
    }
    const params = new URLSearchParams()
    if (clienteId) params.set('cliente_id', clienteId)
    if (filterStatus !== 'tutti') params.set('status', filterStatus)
    if (filterCanale !== 'tutti') params.set('canale', filterCanale)
    if (filterFormato !== 'tutti') params.set('formato', filterFormato)
    if (filterCategoria !== 'tutti') params.set('obiettivo', filterCategoria)
    if (searchText.trim()) params.set('q', searchText.trim())
    params.set('limit', '200')

    setLoadError(null)
    try {
      const res = await fetch(`/api/data/calendario?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setContenuti(data as Contenuto[])
      } else {
        // NON fingere "nessun contenuto" su un errore server: distingui vuoto da guasto.
        setContenuti([])
        setLoadError(await readApiError(res, 'Errore nel caricamento dei contenuti'))
      }
    } catch (e) {
      setContenuti([])
      setLoadError((e as Error)?.message || 'Errore di rete nel caricamento dei contenuti')
    }
    setLoading(false)
  }, [filterStatus, filterCanale, filterFormato, filterCategoria, searchText, demo, demoData, clienteId])

  useEffect(() => { fetchData() }, [fetchData])

  async function refreshSelected(idContenuto: string) {
    if (!clienteId) return
    try {
      const r = await fetch(`/api/data/calendario?cliente_id=${encodeURIComponent(clienteId)}`)
      if (!r.ok) return
      const all = await r.json() as Contenuto[]
      const found = all.find(c => c.id_contenuto === idContenuto)
      if (found) setSelected(found)
    } catch { /* noop */ }
  }

  async function approva(c: Contenuto, user: string = 'admin') {
    setSaving(c.id)
    if (demo) {
      setDemoData(prev => prev.map(x => x.id === c.id ? {
        ...x, status: 'APPROVATO' as Status,
        checked_copy: 'SI', checked_media: 'SI', checked_link: 'SI',
        approvato_da: user, data_approvazione: new Date().toISOString(),
      } : x))
    } else {
      const res = await fetch('/api/data/calendario', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: c.id,
          status: 'APPROVATO',
          checked_copy: 'SI',
          checked_media: 'SI',
          checked_link: 'SI',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSyncMsg({ type: 'err', text: data.error || 'Approvazione non riuscita' })
      } else if (data.publish_status === 'visual_pending' || data.publish_status === 'visual_review') {
        setSyncMsg({
          type: 'warn',
          text: data.publish_status === 'visual_review'
            ? 'Montaggio video pronto: apri Preview, controllalo e approvalo di nuovo per pubblicarlo.'
            : 'Montaggio video in corso: nessuna pubblicazione è partita. Premi Sincronizza per aggiornarne lo stato.',
        })
      } else if (data.publish_note) {
        setSyncMsg({ type: data.publish_status === 'skipped' ? 'err' : 'warn', text: data.publish_note })
      }
      await fetchData()
    }
    setSelected(null)
    setSaving(null)
  }

  // Sincronizza su Blotato UN SOLO contenuto — a differenza di "Sincronizza
  // Blotato" (tutto il batch APPROVATO non ancora inviato in un colpo), utile
  // per testare un singolo invio reale senza coinvolgere gli altri.
  async function syncUno(c: Contenuto) {
    setSaving(c.id)
    setSyncMsg(null)
    try {
      const res = await fetch(`/api/data/calendario/${c.id}/sync-uno`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Sincronizzazione singola fallita')
      const label = data.status === 'scheduled'
        ? 'inviato a Blotato: programmato per davvero.'
        : data.status === 'visual_review'
          ? 'video pronto: apri Preview e approvalo di nuovo; non è stato pubblicato.'
          : data.status === 'visual_pending'
            ? 'montaggio video in corso; non è stato pubblicato.'
        : data.status === 'dry_run'
          ? 'dry-run: pubblicazione non attiva, nessun invio reale.'
          : `non inviato: ${data.reason || 'scartato dal pre-flight'}`
      setSyncMsg({
        type: data.status === 'scheduled' ? 'ok' : ['dry_run', 'visual_pending', 'visual_review'].includes(data.status) ? 'warn' : 'err',
        text: `${c.canale} · ${c.formato} — ${label}`,
      })
      await fetchData()
    } catch (e) {
      setSyncMsg({ type: 'err', text: (e as Error).message })
    } finally {
      setSaving(null)
    }
  }

  async function rifiuta(c: Contenuto) {
    setSaving(c.id)
    if (demo) {
      setDemoData(prev => prev.map(x => x.id === c.id ? { ...x, status: 'NON_APPROVATO' as Status } : x))
    } else {
      await fetch('/api/data/calendario', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, status: 'NON_APPROVATO' }),
      })
    }
    setSelected(null)
    setSaving(null)
  }

  // Recupero di un contenuto rifiutato: torna in coda "Da approvare" così non
  // resta intrappolato nel bucket Non approvati.
  async function ripristina(c: Contenuto) {
    setSaving(c.id)
    if (demo) {
      setDemoData(prev => prev.map(x => x.id === c.id ? { ...x, status: 'DA_APPROVARE' as Status } : x))
    } else {
      await fetch('/api/data/calendario', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, status: 'DA_APPROVARE' }),
      })
    }
    setSelected(null)
    setSaving(null)
  }

  async function resetErrore(c: Contenuto) {
    setSaving(c.id)
    setSyncMsg(null)
    if (demo) {
      setDemoData(prev => prev.map(x => x.id === c.id ? {
        ...x, status: 'APPROVATO' as Status, errore_tecnico: null, retry_count: 0, publish_lock_id: null,
      } : x))
    } else {
      try {
        const res = await fetch('/api/data/calendario', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: c.id,
            status: 'APPROVATO',
            errore_tecnico: null,
            retry_count: 0,
            publish_lock_id: null,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Riprova pubblicazione fallita')
        if (data.scheduling_error || data.scheduled === false) {
          setSyncMsg({
            type: 'err',
            text: data.scheduling_error || data.publish_note || 'Contenuto ripristinato, ma Blotato non lo ha programmato.',
          })
        } else {
          setSyncMsg({ type: 'ok', text: `${c.canale} · ${c.formato} reinviato a Blotato e programmato.` })
        }
      } catch (e) {
        setSyncMsg({ type: 'err', text: (e as Error).message })
      }
      await fetchData()
    }
    setSaving(null)
  }

  async function completaFallbackManuale(c: Contenuto) {
    if (!hasText(c.hook) && !hasText(c.caption)) {
      setAdminError('Inserisci almeno un hook o una caption prima di mandare il contenuto in approvazione.')
      return
    }
    setSaving(c.id)
    setAdminError(null)
    try {
      await saveField(c, 'status', 'DA_APPROVARE', {
        note: null,
        errore_tecnico: null,
        retry_count: 0,
        publish_lock_id: null,
      })
      setSyncMsg({ type: 'ok', text: `${c.id_contenuto} sistemato e spostato in Da approvare.` })
      setSelected(null)
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setSaving(null)
    }
  }

  async function rigeneraFallback(c: Contenuto) {
    setSaving(c.id)
    setAdminError(null)
    setSyncMsg(null)
    try {
      const ai = readAISettings()
      const res = await fetch(`/api/data/calendario/${encodeURIComponent(c.id)}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ai),
      })
      if (!res.ok) throw new Error(await readApiError(res, 'Rigenerazione contenuto fallita'))
      const data = await res.json() as { content?: Partial<Contenuto>; risolto?: boolean; motivo_residuo?: string | null }
      // Lo stato lo decide il server: se la rigenerazione non ha prodotto la
      // struttura richiesta (un Reel ancora senza le 5 scene) il contenuto RESTA
      // fermo. Forzare "Da approvare" qui sarebbe un lavaggio: l'utente lo
      // approverebbe convinto che sia a posto.
      const updated = { ...c, ...(data.content || {}) } as Contenuto
      if (demo) setDemoData(prev => prev.map(item => item.id === c.id ? updated : item))
      setContenuti(prev => prev.map(item => item.id === c.id ? updated : item))
      setSelected(updated)
      setSyncMsg(data.risolto === false
        ? { type: 'warn', text: `${c.id_contenuto} rigenerato ma ancora incompleto: ${data.motivo_residuo}. Riprova, o scegli un modello piu capace.` }
        : { type: 'ok', text: `${c.id_contenuto} rigenerato. Controlla l'anteprima e approvalo solo quando e pronto.` })
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setSaving(null)
    }
  }

  // Genera un'immagine AI per il contenuto via OpenRouter (/api/generate/image).
  // Usa il modello selezionato + la key OpenRouter dell'admin. Se il contenuto ha
  // già una foto, la usa come riferimento image-to-image per restare on-brand.
  async function generaImmagine(c: Contenuto) {
    if (!clienteId) return
    setComfyState('generating')
    setComfyMsg('Generazione immagine AI in corso…')
    try {
      const ai = readAISettings()
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: clienteId, id_contenuto: c.id_contenuto, openrouter_key: ai.openrouter_key }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Generazione immagine fallita')
      setComfyState('done')
      setComfyMsg('Immagine generata e aggiunta al contenuto.')
      await refreshSelected(c.id_contenuto)
      setContenuti(prev => prev.map(item => item.id === c.id ? { ...item, ...(data.slot ? { [data.slot]: data.url } : {}) } : item))
    } catch (e) {
      setComfyState('error')
      setComfyMsg((e as Error).message)
    }
  }

  // Sincronizza su Blotato i contenuti APPROVATI non ancora inviati (pubblicazione).
  async function reconcileBlotato(showMessage = true): Promise<PackageReconcile | null> {
    setReconciling(true)
    if (showMessage) setSyncMsg(null)
    try {
      const res = await fetch('/api/data/blotato-reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error(await readApiError(res, 'Verifica Blotato fallita'))
      const data = await res.json() as PackageReconcile
      setPackageReconcile(data)
      if (showMessage) {
        const errorNote = data.remote_errors?.length ? ` ${data.remote_errors.length} stati non verificati.` : ''
        setSyncMsg({
          type: data.remote_errors?.length ? 'err' : 'ok',
          text: `Blotato verificato: ${data.summary.published} pubblicati, ${data.summary.queued} in coda, ${data.summary.failed} falliti.${errorNote}`,
        })
      }
      await fetchData()
      return data
    } catch (e) {
      if (showMessage) setSyncMsg({ type: 'err', text: (e as Error).message })
      return null
    } finally {
      setReconciling(false)
    }
  }

  // Controllo finale del ciclo: guarda il piano COME INSIEME (copertura, quattro
  // settimane, mix, media, slot rotti, arco narrativo, duplicati). Non tocca
  // nulla e non blocca l'invio a Blotato: e un referto, la decisione resta a chi
  // pubblica.
  async function verificaPiano() {
    setAuditing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/data/plan-audit', { method: 'POST' })
      if (!res.ok) throw new Error(await readApiError(res, 'Controllo del piano fallito'))
      const data = await res.json() as PlanAudit
      setPlanAudit(data)
      setSyncMsg({
        type: data.pronto ? (data.attenzioni ? 'warn' : 'ok') : 'err',
        text: data.pronto
          ? `Piano completo: ${data.pianificati} contenuti sul ciclo${data.attenzioni ? `, ${data.attenzioni} cose da guardare` : ', nessun problema'}.`
          : `Piano NON completo: ${data.bloccanti} problemi bloccanti su ${data.pianificati} contenuti. Leggi il referto qui sotto.`,
      })
    } catch (e) {
      setSyncMsg({ type: 'err', text: (e as Error).message })
    } finally {
      setAuditing(false)
    }
  }

  // `applica = false` chiede solo l'anteprima: il server calcola e non scrive.
  async function spostaPiano(applica: boolean) {
    setShifting(true)
    setShiftError(null)
    try {
      const res = await fetch('/api/data/calendario/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftModo === 'data'
          ? { riparti_da: shiftData, dry_run: !applica }
          : { giorni: Number(shiftGiorni), dry_run: !applica }),
      })
      if (!res.ok) throw new Error(await readApiError(res, 'Spostamento del piano fallito'))
      const data = await res.json() as ShiftResult
      setShiftPreview(data)
      if (applica) {
        setShiftOpen(false)
        setShiftPreview(null)
        setSyncMsg({
          type: data.bloccati_blotato ? 'warn' : 'ok',
          text: `Piano spostato di ${data.giorni > 0 ? '+' : ''}${data.giorni} giorni: ${data.spostati} contenuti, si parte dal ${formatShortDate(data.nuova_prima_data)}.`
            + (data.bloccati_blotato ? ` ${data.bloccati_blotato} gia inviati a Blotato NON sono stati spostati: la loro data vive sul server di Blotato.` : ''),
        })
        await fetchData()
      }
    } catch (e) {
      setShiftError((e as Error).message)
      setShiftPreview(null)
    } finally {
      setShifting(false)
    }
  }

  async function syncBlotato() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/data/blotato-sync', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.hint || data.error || 'Sincronizzazione fallita')
      const firstErr = Array.isArray(data.errors) && data.errors[0] ? ` — ${data.errors[0].canale}: ${data.errors[0].error}` : ''
      const failNote = data.failed ? ` (${data.failed} falliti)${firstErr}` : ''
      // dry-run = pubblicazione non attiva: contenuti pronti ma non pubblicati davvero.
      const dryNote = data.dry_run ? ` ${data.dry_run} in dry-run (PUBLISH_ENABLED non attivo).` : ''
      // I video montati adesso NON partono: tornano in "Da approvare" perche il
      // montaggio e un artefatto nuovo e va guardato. Detto cosi invece che con
      // "N video pronti": chi guardava l'elenco vedeva i contenuti lasciare gli
      // approvati e pensava fossero spariti.
      const visualNote = data.visual_review
        ? ` ${data.visual_review} video sono stati montati e sono tornati in "Da approvare": guardali in Preview e approvali una seconda volta, poi risincronizza. Nessun video appena montato viene pubblicato senza che tu lo veda.`
        : ''
      const pendingNote = data.visual_pending ? ` ${data.visual_pending} montaggi ancora in corso.` : ''
      // Il montaggio video e lento e la funzione ha un tetto di 5 minuti: con
      // molti approvati un giro solo non basta, e va detto.
      const restoNote = data.rimasti
        ? ` ⏳ Restano ${data.rimasti} contenuti da lavorare: premi di nuovo "Sincronizza Blotato" per continuare.`
        : ''
      setSyncMsg({
        type: data.failed ? 'err' : (data.dry_run || data.visual_pending || data.visual_review || data.rimasti) ? 'warn' : 'ok',
        text: data.candidates === 0
          ? 'Nessun contenuto approvato da sincronizzare.'
          : `${data.synced} contenuti inviati a Blotato${failNote}.${dryNote}${visualNote}${pendingNote}${restoNote}`,
      })
      // Dopo l'invio rileggi Blotato: scheduled non equivale a pubblicato. Questo
      // aggiorna anche gli invii dei giorni scorsi rimasti senza webhook.
      await reconcileBlotato(false)
      await fetchData()
    } catch (e) {
      setSyncMsg({ type: 'err', text: (e as Error).message })
    } finally {
      setSyncing(false)
    }
  }

  // Rimette in coda i contenuti approvati in ritardo e recupera gli invii
  // Blotato rimasti scheduled dopo conferma esplicita dell'utente.
  async function requeuePassati() {
    if (stalli.length > 0 && !window.confirm(
      `${stalli.length} contenuti risultano inviati a Blotato ma non confermati. Hai verificato che NON siano già stati pubblicati sui social? Proseguendo verranno riprogrammati e potrebbero essere pubblicati di nuovo.`,
    )) return
    setRequeuing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/data/calendario/requeue-passati', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.hint || data.error || 'Requeue fallito')
      setSyncMsg({
        type: 'ok',
        text: data.count === 0
          ? (data.note || 'Nessun contenuto in ritardo da rimettere in coda.')
          : `${data.count} contenuti rimessi in coda: ${data.requeued.map((r: { canale: string; a: { giorno: string; ora: string } }) => `${r.canale} → ${r.a.giorno} ${r.a.ora}`).join(', ')}.`,
      })
      await fetchData()
    } catch (e) {
      setSyncMsg({ type: 'err', text: (e as Error).message })
    } finally {
      setRequeuing(false)
    }
  }

  async function downloadBackup() {
    setBackuping(true)
    setAdminError(null)
    try {
      const res = await fetch('/api/data/backup', { cache: 'no-store' })
      if (!res.ok) throw new Error(await readApiError(res, 'Backup contenuti fallito'))
      const blob = await res.blob()
      const disposition = res.headers.get('content-disposition') || ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match?.[1] || `social-automation-backup-${new Date().toISOString().slice(0, 10)}.json`
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setBackuping(false)
    }
  }

  // Carica/sostituisce un media in uno specifico slot (link_media_1..10) del contenuto:
  // upload su /api/assets/upload (stesso endpoint del piano) + PATCH calendario.
  // slot 1 = media principale (thumb riga + preview), 2..10 = slide carosello/scene.
  async function attachPhoto(c: Contenuto, file: File, slot = 1) {
    if (!clienteId) return
    const col = `link_media_${slot}`
    setUploadingPhoto(`${c.id}:${slot}`)
    setAdminError(null)
    try {
      const form = new FormData()
      form.append('cliente_id', clienteId)
      form.append('files', file)
      const uploadData = await uploadAssets(form)
      const uploaded = uploadData.assets?.[0]
      const url = uploaded?.url
      if (!url) throw new Error('Upload riuscito ma nessun URL restituito')
      const extraPatch: Partial<Contenuto> = uploaded.kind === 'video' || uploaded.mime?.startsWith('video/')
        ? { media_type: 'video' }
        : {}
      await saveField(c, col, url, extraPatch)
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setUploadingPhoto(null)
    }
  }

  // Rimuove il media da uno slot (mette la colonna a null).
  async function removePhoto(c: Contenuto, slot = 1) {
    const col = `link_media_${slot}`
    setUploadingPhoto(`${c.id}:${slot}`)
    setAdminError(null)
    try {
      await saveField(c, col, null)
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setUploadingPhoto(null)
    }
  }

  async function attachContentAudio(c: Contenuto, file: File) {
    if (!clienteId) return
    setUploadingPhoto(`${c.id}:audio`)
    setAdminError(null)
    try {
      const form = new FormData()
      form.append('cliente_id', clienteId)
      form.append('files', file)
      const uploadData = await uploadAssets(form)
      const uploaded = uploadData.assets?.[0]
      if (!uploaded?.url || uploaded.kind !== 'audio') throw new Error('Il file selezionato non è un audio supportato')
      await saveField(c, 'reel_audio_url', uploaded.url, {
        reel_audio_title: uploaded.name,
        reel_audio_source_url: null,
        reel_audio_license: 'Licenza dichiarata dal caricante; conservare la prova di origine',
        blotato_visual_id: null,
        blotato_visual_status: null,
        blotato_visual_media_url: null,
        blotato_audio_visual_id: null,
        blotato_audio_visual_status: null,
        blotato_audio_visual_media_url: null,
      })
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setUploadingPhoto(null)
    }
  }

  // Persiste un valore in una colonna qualunque (media, hook, caption, hashtag,
  // cta...) e allinea sia la lista sia la scheda "Dettagli" eventualmente aperta.
  // Generica di proposito: prima serviva solo ai media, ma il PATCH sottostante
  // già accettava qualsiasi colonna in whitelist — mancava solo chi la chiamasse.
  async function saveField(c: Contenuto, col: string, value: string | null, extraPatch: Partial<Contenuto> = {}) {
    const renderReset: Partial<Contenuto> = col.startsWith('link_media_') ? {
      blotato_visual_id: null,
      blotato_visual_status: null,
      blotato_visual_media_url: null,
      blotato_visual_source_hash: null,
      blotato_audio_visual_id: null,
      blotato_audio_visual_status: null,
      blotato_audio_visual_media_url: null,
    } : {}
    const patch = { ...renderReset, ...extraPatch }
    if (demo) {
      setDemoData(prev => prev.map(item => item.id === c.id ? { ...item, [col]: value, ...patch } : item))
    } else {
      const patchRes = await fetch('/api/data/calendario', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, [col]: value, ...patch }),
      })
      if (!patchRes.ok) throw new Error(await readApiError(patchRes, `Salvataggio ${col} fallito`))
    }
    setContenuti(prev => prev.map(item => item.id === c.id ? { ...item, [col]: value, ...patch } : item))
    setSelected(prev => prev && prev.id === c.id ? { ...prev, [col]: value, ...patch } : prev)
  }

  async function saveTextField(c: Contenuto, col: 'hook' | 'caption' | 'hashtag' | 'cta', value: string) {
    setSaving(c.id)
    setAdminError(null)
    try {
      await saveField(c, col, value)
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setSaving(null)
    }
  }

  // Testo/hashtag: editabile finché il contenuto non è mai stato inviato a
  // Blotato. Dopo, Blotato ha già la sua copia: modificare qui non aggiornerebbe
  // il post reale già programmato o pubblicato, quindi resta di sola lettura
  // per non far credere all'admin di aver corretto qualcosa che in realtà è
  // già partito così com'era.
  function editableField(c: Contenuto, label: string, col: 'hook' | 'caption' | 'hashtag' | 'cta', multiline = false) {
    const value = asText(c[col])
    if (c.blotato_post_id) {
      if (!hasText(value)) return null
      return (
        <div>
          <p className="label">{label}</p>
          <p className={`text-sm whitespace-pre-wrap ${col === 'hashtag' ? 'text-brand-600' : 'text-gray-700'}`}>{value}</p>
        </div>
      )
    }
    const Field = multiline ? 'textarea' : 'input'
    return (
      <div>
        <p className="label flex items-center justify-between">
          <span>{label}</span>
          {saving === c.id && <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />}
        </p>
        <Field
          key={`${c.id}-${col}`}
          defaultValue={value}
          onBlur={e => { if (e.target.value !== value) saveTextField(c, col, e.target.value) }}
          className={`input text-sm w-full mt-1 ${multiline ? 'h-24 resize-none' : ''}`}
        />
        {col === 'hashtag' && <p className="text-[10px] text-gray-400 mt-1">Instagram accetta al massimo 5 hashtag nel testo del post.</p>}
      </div>
    )
  }

  async function deleteContent(c: Contenuto) {
    setDeleting(true)
    setAdminError(null)
    try {
      if (demo) {
        setDemoData(prev => prev.filter(item => item.id !== c.id))
      } else {
        const res = await fetch(`/api/data/calendario?id=${encodeURIComponent(c.id)}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(await readApiError(res, 'Cancellazione contenuto fallita'))
        setContenuti(prev => prev.filter(item => item.id !== c.id))
      }
      if (selected?.id === c.id) setSelected(null)
      setDeleteTarget(null)
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  // Elimina in blocco i contenuti selezionati (svuota velocemente un piano generato).
  async function bulkDelete() {
    const ids = [...selectedIds]
    if (!ids.length) return
    setBulkDeleting(true)
    setAdminError(null)
    try {
      if (demo) {
        setDemoData(prev => prev.filter(item => !selectedIds.has(item.id)))
        setContenuti(prev => prev.filter(item => !selectedIds.has(item.id)))
      } else {
        const res = await fetch('/api/data/calendario', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        })
        if (!res.ok) throw new Error(await readApiError(res, 'Eliminazione multipla fallita'))
        const data = await res.json() as { deleted_ids?: string[]; warning?: string }
        // Rimuovi SOLO quelli davvero eliminati dal server (fonte di verità), non l'intera selezione.
        const removed = new Set(data.deleted_ids ?? ids)
        setContenuti(prev => prev.filter(item => !removed.has(item.id)))
        if (data.warning) setAdminError(data.warning)
      }
      if (selected && selectedIds.has(selected.id)) setSelected(null)
      setSelectedIds(new Set())
      setBulkDeleteOpen(false)
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setBulkDeleting(false)
    }
  }

  // Non approva in blocco i contenuti selezionati → NON_APPROVATO. Il PATCH accetta
  // un id per volta, quindi mandiamo le richieste in parallelo e aggiorniamo solo i
  // contenuti davvero passati (fonte di verità), come fa bulkDelete.
  async function bulkReject() {
    // GUARD: solo i contenuti DA_APPROVARE sono rifiutabili (come il tasto rosso
    // singolo). Mai toccare post APPROVATO/PUBBLICATO (già inviati o
    // live su Blotato) né già NON_APPROVATO: li rifiuteremmo desincronizzando lo stato
    // reale della pubblicazione.
    const rejectableIds = [...selectedIds].filter(id => contenuti.find(c => c.id === id)?.status === 'DA_APPROVARE')
    const skipped = selectedIds.size - rejectableIds.length
    if (!rejectableIds.length) {
      setAdminError('Nessun contenuto "Da approvare" tra i selezionati: solo i contenuti in attesa di approvazione possono essere rifiutati.')
      setRejectBulkOpen(false)
      return
    }
    setRejecting(true)
    setAdminError(null)
    try {
      const rejSet = new Set(rejectableIds)
      if (demo) {
        setDemoData(prev => prev.map(item => rejSet.has(item.id) ? { ...item, status: 'NON_APPROVATO' as Status } : item))
        setContenuti(prev => prev.map(item => rejSet.has(item.id) ? { ...item, status: 'NON_APPROVATO' as Status } : item))
      } else {
        const results = await Promise.allSettled(rejectableIds.map(id =>
          fetch('/api/data/calendario', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'NON_APPROVATO' }),
          }).then(res => { if (!res.ok) throw new Error(); return id }),
        ))
        const ok = new Set(results.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled').map(r => r.value))
        setContenuti(prev => prev.map(item => ok.has(item.id) ? { ...item, status: 'NON_APPROVATO' as Status } : item))
        const failed = rejectableIds.length - ok.size
        const notes: string[] = []
        if (failed > 0) notes.push(`${failed} non aggiornati`)
        if (skipped > 0) notes.push(`${skipped} saltati (non erano "Da approvare")`)
        if (notes.length) setAdminError(notes.join(' · '))
      }
      if (selected && selectedIds.has(selected.id)) setSelected(null)
      setSelectedIds(new Set())
      setRejectBulkOpen(false)
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setRejecting(false)
    }
  }

  async function bulkMove() {
    if (!bulkMoveDate || !selectedIds.size) return
    const selectedRows = contenuti.filter(item => selectedIds.has(item.id))
    const movable = selectedRows.filter(item => !item.blotato_post_id
      && item.blotato_status !== 'scheduled'
      && item.blotato_status !== 'published'
      && !['PUBBLICATO', 'ARCHIVIATO'].includes(item.status))
    const skipped = selectedRows.length - movable.length
    if (!movable.length) {
      setAdminError('I contenuti selezionati sono già sincronizzati o pubblicati: rimettili in coda prima di spostarli.')
      setBulkMoveOpen(false)
      return
    }
    setBulkMoving(true)
    setAdminError(null)
    try {
      const movedIds = new Set<string>()
      let failed = 0
      if (demo) {
        movable.forEach(item => movedIds.add(item.id))
        setDemoData(prev => prev.map(item => movedIds.has(item.id) ? {
          ...item,
          data_pubblicazione: bulkMoveDate,
          ...(bulkMoveTime ? { ora_pubblicazione: bulkMoveTime } : {}),
        } : item))
      } else {
        const results = await Promise.allSettled(movable.map(async item => {
          const res = await fetch('/api/data/calendario', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: item.id,
              data_pubblicazione: bulkMoveDate,
              ...(bulkMoveTime ? { ora_pubblicazione: bulkMoveTime } : {}),
            }),
          })
          if (!res.ok) throw new Error(await readApiError(res, `Spostamento ${item.id_contenuto} fallito`))
          return item.id
        }))
        results.forEach(result => { if (result.status === 'fulfilled') movedIds.add(result.value) })
        failed = movable.length - movedIds.size
      }
      setContenuti(prev => prev.map(item => movedIds.has(item.id) ? {
        ...item,
        data_pubblicazione: bulkMoveDate,
        ...(bulkMoveTime ? { ora_pubblicazione: bulkMoveTime } : {}),
      } : item))
      setSelectedIds(new Set())
      setBulkMoveOpen(false)
      setBulkMoveDate('')
      setBulkMoveTime('')
      if (failed || skipped) {
        setAdminError([
          failed ? `${failed} contenuti non spostati` : '',
          skipped ? `${skipped} saltati perché già sincronizzati` : '',
        ].filter(Boolean).join(' · '))
      }
      setSyncMsg({ type: 'ok', text: `${movedIds.size} contenuti spostati al ${formatDateLabel(bulkMoveDate)}.` })
    } catch (e) {
      setAdminError((e as Error).message)
    } finally {
      setBulkMoving(false)
    }
  }

  function toggleSelectId(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds(prev => prev.size === visibleCalendarItems.length ? new Set() : new Set(visibleCalendarItems.map(c => c.id)))
  }

  async function handleScore(c: Contenuto) {
    setScoring(c.id)
    setScoreError(null)
    if (demo) {
      await new Promise(r => setTimeout(r, 1200))
      setScores(prev => ({
        ...prev,
        [c.id]: {
          score_globale: 78,
          hook_strength: 72,
          copy_quality: 85,
          brand_fit: 80,
          cta_effectiveness: 70,
          hashtag_relevance: 76,
          seo_potential: 65,
          compliance: 90,
          giudizio: 'BUONO',
          punti_forti: ['Hook coinvolgente', 'Tono coerente con il brand'],
          punti_deboli: ['CTA poco incisiva', 'Hashtag generici'],
          suggerimenti: ['Rendi la CTA più urgente', 'Aggiungi 2 hashtag di nicchia'],
        },
      }))
      setScoring(null)
      return
    }
    try {
      const aiSettings = readAISettings()
      const res = await fetch('/api/generate/score-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          canale: c.canale,
          formato: c.formato,
          hook: c.hook,
          caption: c.caption,
          hashtag: c.hashtag,
          cta: c.cta,
          visual: c.idea_visual || c.alt_text || '',
          quality_level: c.quality_level,
          audience_segment: c.audience_segment,
          funnel_stage: c.funnel_stage,
          angle: c.angle,
          primary_message: c.primary_message,
          creative_brief: c.creative_brief,
          kpi_target: c.kpi_target,
          performance_hypothesis: c.performance_hypothesis,
          optimization_cycle: c.optimization_cycle_json,
          next_iteration_actions: c.next_iteration_actions,
          production_notes: c.production_notes,
          compliance_notes: c.compliance_notes,
          ...aiSettings,
        }),
      })
      if (!res.ok) throw new Error(await readApiError(res, 'Scoring AI fallito'))
      const data = await res.json()
      setScores(prev => ({ ...prev, [c.id]: data }))
    } catch (e) {
      setScoreError((e as Error).message)
    }
    setScoring(null)
  }

  async function generateApprovalLink(c: Contenuto) {
    setSendingToken(c.id)
    setApprovalUrl(null)
    if (demo) {
      await new Promise(r => setTimeout(r, 500))
      setApprovalUrl(`${window.location.origin}/approve/demo-${c.id}`)
      setSendingToken(null)
      return
    }
    try {
      const clienteId = readClienteId()
      if (!clienteId) throw new Error('Nessun cliente selezionato')
      const res = await fetch('/api/data/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: clienteId, contenuto_id: c.id_contenuto }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Errore generazione link (HTTP ${res.status})`)
      }
      const data = await res.json()
      setApprovalUrl(data.url as string)
    } catch (e) {
      // NIENTE fallback muto: l'utente ha cliccato "genera link" e non vede nulla.
      setSyncMsg({ type: 'err', text: `Link approvazione non generato: ${(e as Error).message}` })
    }
    setSendingToken(null)
  }

  async function handleDrop(c: Contenuto, newDate: string): Promise<boolean> {
    setDragOverDate(null)
    if (toYmd(c.data_pubblicazione) === newDate) return true
    if (c.blotato_post_id || c.blotato_status === 'scheduled' || c.blotato_status === 'published' || ['PUBBLICATO', 'ARCHIVIATO'].includes(c.status)) {
      setSyncMsg({ type: 'err', text: 'Contenuto già sincronizzato con Blotato: rimettilo prima in coda, poi potrai spostarlo.' })
      return false
    }
    if (demo) {
      setDemoData(prev => prev.map(x => x.id === c.id ? { ...x, data_pubblicazione: newDate } : x))
      return true
    }
    try {
      const res = await fetch('/api/data/calendario', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, data_pubblicazione: newDate }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `spostamento non salvato (HTTP ${res.status})`)
      }
      setContenuti(prev => prev.map(x => x.id === c.id ? { ...x, data_pubblicazione: newDate } : x))
      return true
    } catch (e) {
      // NIENTE fallback muto: senza questo l'utente trascina, il card "resta" sulla
      // nuova data in UI ma il DB ha la data vecchia -> disallineamento silenzioso.
      setSyncMsg({ type: 'err', text: `Spostamento non salvato (riprova): ${(e as Error).message}` })
      return false
    }
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + 1 + i)
    return d.toISOString().split('T')[0]
  })
  const todayIso = new Date().toISOString().split('T')[0]
  const calendarItems = [...contenuti].sort((a, b) => {
    const left = `${a.data_pubblicazione || '9999-12-31'} ${a.ora_pubblicazione || '99:99'}`
    const right = `${b.data_pubblicazione || '9999-12-31'} ${b.ora_pubblicazione || '99:99'}`
    return left.localeCompare(right)
  })
  const visibleCalendarItems = selectedDay
    ? calendarItems.filter(c => toYmd(c.data_pubblicazione) === selectedDay)
    : calendarItems
  const stats = {
    total: contenuti.length,
    daApprovare: contenuti.filter(c => c.status === 'DA_APPROVARE').length,
    approvati: contenuti.filter(c => c.status === 'APPROVATO').length,
    nonApprovati: contenuti.filter(c => c.status === 'NON_APPROVATO').length,
    pubblicati: contenuti.filter(c => c.status === 'PUBBLICATO' || c.blotato_status === 'published').length,
    errori: contenuti.filter(c => c.status === 'ERRORE' || c.status === 'ERRORE_MANUALE' || c.blotato_status === 'failed' || Boolean(c.errore_tecnico)).length,
    oggi: contenuti.filter(c => c.data_pubblicazione === todayIso).length,
    video: contenuti.filter(c => c.media_type === 'video' || ['reel', 'video', 'short', 'story'].includes(c.formato)).length,
    trend: contenuti.filter(c => c.obiettivo === 'trending' || c.template_style || c.creative_brief || c.quality_level === 'high').length,
  }
  // Quanti dei selezionati sono davvero rifiutabili (solo DA_APPROVARE): serve al
  // modale di conferma bulk per non promettere un rifiuto su post già pubblicati.
  const rejectableSelectedCount = [...selectedIds].filter(id => contenuti.find(c => c.id === id)?.status === 'DA_APPROVARE').length
  const nextContent = calendarItems.find(c => c.data_pubblicazione >= todayIso && c.status !== 'PUBBLICATO')
  // Inviati a Blotato ma mai confermati: l'orario è passato e lo stato è fermo a
  // 'scheduled'. Tolleranza di 15' per non allarmare su un ritardo fisiologico.
  const stalli = contenuti.filter(c => {
    if (c.blotato_status !== 'scheduled' || !c.blotato_scheduled_at) return false
    const t = new Date(c.blotato_scheduled_at).getTime()
    return Number.isFinite(t) && Date.now() - t > 15 * 60 * 1000
  })
  const channelEntries = Object.entries(
    contenuti.reduce<Record<string, number>>((acc, c) => {
      acc[c.canale] = (acc[c.canale] || 0) + 1
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="p-4 md:p-8">
      {/* Header premium */}
      <div className="mb-4 md:mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-900 text-white shadow-xl">
        <div className="p-5 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-brand-50 ring-1 ring-white/15">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Regia editoriale
                </span>
                {dryRun !== null && (
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${dryRun ? 'bg-amber-300 text-amber-950' : 'bg-emerald-300 text-emerald-950'}`}
                    title={dryRun ? 'Modalità prova: i post approvati NON vengono pubblicati' : 'Live: i post approvati vengono pubblicati sui social'}
                  >
                    {dryRun ? 'DEMO' : 'REAL'}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl md:text-4xl font-black tracking-tight">Calendario contenuti</h1>
              <p className="mt-2 text-sm md:text-base text-slate-300">
                Vista premium per capire subito cosa pubblicare, quando, su quale canale e cosa richiede attenzione.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                  <Layers className="h-3.5 w-3.5" /> {stats.total} contenuti filtrati
                </span>
                {nextContent && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                    <Clock className="h-3.5 w-3.5" /> Prossimo: {formatShortDate(nextContent.data_pubblicazione)} · {formatTimeLabel(nextContent.ora_pubblicazione)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-400/15 px-3 py-1 text-fuchsia-100 ring-1 ring-fuchsia-300/20">
                  <Zap className="h-3.5 w-3.5" /> Generazioni trend-first
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* PRIMO della fila di proposito: e il passo che viene subito dopo la
                  generazione del piano (verifica il ciclo → approva → sincronizza →
                  verifica Blotato). Colore diverso dalla coppia Blotato perche
                  guarda il PIANO, non le pubblicazioni. */}
              <button onClick={verificaPiano} disabled={auditing} className="rounded-xl bg-violet-300 px-3 py-2 text-xs font-semibold text-violet-950 shadow-sm hover:bg-violet-200 disabled:opacity-60 inline-flex items-center gap-1.5" title="Controlla il ciclo intero: contenuti previsti, quattro settimane, mix formati, media, slot rotti, arco narrativo e duplicati">
                {auditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                <span>{auditing ? 'Controllo...' : 'Verifica piano'}</span>
              </button>
              {/* Accanto a "Verifica piano" perche e l'altra azione che agisce sul
                  PIANO intero, non sul singolo contenuto. */}
              <button onClick={() => { setShiftOpen(true); setShiftPreview(null); setShiftError(null) }} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 inline-flex items-center gap-1.5" title="Sposta tutto il piano futuro avanti o indietro di N giorni, mantenendo distanze, orari e sequenza">
                <CalendarClock className="w-4 h-4" />
                <span>Sposta piano</span>
              </button>
              <button onClick={requeuePassati} disabled={requeuing} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 disabled:opacity-60 inline-flex items-center gap-1.5" title="Sposta i contenuti approvati in ritardo e recupera gli invii Blotato rimasti programmati">
                {requeuing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />}
                <span>{requeuing ? 'Rimetto in coda...' : 'Rimetti in coda i passati'}</span>
              </button>
              <button onClick={syncBlotato} disabled={syncing} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100 disabled:opacity-60 inline-flex items-center gap-1.5" title="Invia i contenuti APPROVATI a Blotato per la pubblicazione">
                {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                <span>{syncing ? 'Sincronizzo...' : 'Sincronizza Blotato'}</span>
              </button>
              <button onClick={() => reconcileBlotato(true)} disabled={reconciling || syncing} className="rounded-xl bg-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-sm hover:bg-emerald-200 disabled:opacity-60 inline-flex items-center gap-1.5" title="Controlla su Blotato cosa e stato pubblicato davvero e calcola cosa manca al pacchetto">
                <RefreshCw className={`w-4 h-4 ${reconciling ? 'animate-spin' : ''}`} />
                <span>{reconciling ? 'Verifico...' : 'Verifica Blotato'}</span>
              </button>
              <button onClick={downloadBackup} disabled={backuping} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 inline-flex items-center gap-1.5">
                {backuping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Backup</span>
              </button>
              <button onClick={fetchData} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 inline-flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4" />
                <span>Aggiorna</span>
              </button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
            {[
              { label: 'Da approvare', value: stats.daApprovare, tone: 'text-amber-200' },
              { label: 'Oggi', value: stats.oggi, tone: 'text-brand-100' },
              { label: 'Approvati', value: stats.approvati, tone: 'text-blue-200' },
              { label: 'Non approvati', value: stats.nonApprovati, tone: 'text-rose-200' },
              { label: 'Pubblicati', value: stats.pubblicati, tone: 'text-emerald-200' },
              { label: 'Errori', value: stats.errori, tone: 'text-red-200' },
              { label: 'Reel/Video', value: stats.video, tone: 'text-fuchsia-200' },
              { label: 'Trend/Premium', value: stats.trend, tone: 'text-violet-200' },
              { label: 'Canali', value: channelEntries.length, tone: 'text-slate-100' },
            ].map(item => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                <p className={`text-xl font-black ${item.tone}`}>{item.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
          {channelEntries.length > 0 && (
            <div className="mt-4 rounded-2xl bg-white/[0.08] p-3 ring-1 ring-white/10">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-200">
                <BarChart3 className="h-4 w-4" /> Mix canali visibile
              </div>
              <div className="flex flex-wrap gap-2">
                {channelEntries.map(([canale, count]) => (
                  <span key={canale} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100">
                    {CANALE_ICON[canale] || '📄'} {canale}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {syncMsg && (
        <div className={`mb-4 rounded-xl border p-3 text-sm flex items-start gap-2 ${syncMsg.type === 'ok' ? 'border-green-200 bg-green-50 text-green-800' : syncMsg.type === 'warn' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {syncMsg.type === 'ok' ? <CheckCircle className="w-4 h-4 mt-0.5" /> : <AlertTriangle className="w-4 h-4 mt-0.5" />}
          {syncMsg.text}
        </div>
      )}

      {shiftOpen && (
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="font-semibold text-slate-900">Sposta il piano</p>
              <p className="text-xs text-slate-600">Tutti i contenuti futuri si spostano insieme: distanze, orari e sequenza restano identici.</p>
            </div>
            <button type="button" onClick={() => { setShiftOpen(false); setShiftPreview(null); setShiftError(null) }} className="text-xs font-medium text-gray-500 hover:text-gray-800">Chiudi</button>
          </div>
          <div className="flex flex-wrap items-end gap-3 px-4 py-3">
            {/* Due modi per dire la stessa cosa. "Riparti dal giorno" e quello
                naturale quando la partenza slitta a una data precisa: non devi
                contare i giorni a mano. */}
            <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 text-xs font-medium">
              {([['giorni', 'Di N giorni'], ['data', 'Riparti dal giorno']] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setShiftModo(id); setShiftPreview(null); setShiftError(null) }}
                  className={`px-3 py-2 ${shiftModo === id ? 'bg-slate-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {shiftModo === 'giorni' ? (
              <label className="text-xs font-medium text-gray-700">
                Giorni
                <input
                  type="number"
                  value={shiftGiorni}
                  onChange={e => { setShiftGiorni(e.target.value); setShiftPreview(null) }}
                  className="mt-1 block w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="7"
                />
                <span className="mt-1 block text-[11px] font-normal text-gray-500">Negativo per anticipare</span>
              </label>
            ) : (
              <label className="text-xs font-medium text-gray-700">
                Il piano riparte dal
                <input
                  type="date"
                  value={shiftData}
                  onChange={e => { setShiftData(e.target.value); setShiftPreview(null) }}
                  className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-[11px] font-normal text-gray-500">Il primo contenuto cade qui, gli altri lo seguono</span>
              </label>
            )}
            <button type="button" onClick={() => spostaPiano(false)} disabled={shifting} className="btn-secondary py-2 px-4 text-sm disabled:opacity-60">
              {shifting && !shiftPreview ? 'Calcolo...' : 'Anteprima'}
            </button>
            {shiftPreview && !shiftPreview.applicato && (
              <button type="button" onClick={() => spostaPiano(true)} disabled={shifting} className="btn-primary py-2 px-4 text-sm disabled:opacity-60">
                {shifting ? 'Sposto...' : `Conferma: sposta ${shiftPreview.spostati} contenuti`}
              </button>
            )}
          </div>
          {shiftError && <p className="border-t bg-red-50 px-4 py-2 text-xs text-red-700">{shiftError}</p>}
          {shiftPreview && !shiftPreview.applicato && (
            <div className="border-t bg-slate-50 px-4 py-3 text-xs text-slate-700">
              <p>
                <span className="font-semibold">{shiftPreview.spostati} contenuti</span> si spostano di {shiftPreview.giorni > 0 ? '+' : ''}{shiftPreview.giorni} giorni:
                si parte dal <span className="font-semibold">{formatShortDate(shiftPreview.nuova_prima_data)}</span> invece che dal {formatShortDate(shiftPreview.prima_data)}.
              </p>
              {shiftPreview.bloccati_blotato > 0 && (
                <p className="mt-1 text-amber-800">
                  {shiftPreview.bloccati_blotato} contenuti sono gia stati inviati a Blotato e NON verranno spostati: la loro data di uscita vive sul server di Blotato, cambiarla qui creerebbe un calendario che mente. Per spostarli davvero vanno annullati la e rimessi in coda.
                </p>
              )}
              {shiftPreview.ignorati > 0 && <p className="mt-1 text-gray-500">{shiftPreview.ignorati} gia pubblicati o archiviati restano dove sono.</p>}
            </div>
          )}
        </div>
      )}

      {/* REFERTO DEL CICLO — sopra il consuntivo pacchetto: quello dice cosa e
          stato pubblicato, questo dice se il piano e completo e coerente PRIMA
          di pubblicarlo. Informativo: non blocca la sincronizzazione. */}
      {planAudit && (
        <div className={`mb-4 overflow-hidden rounded-xl border bg-white shadow-sm ${planAudit.pronto ? 'border-violet-200' : 'border-red-300'}`}>
          <div className={`flex flex-col gap-1 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${planAudit.pronto ? 'border-violet-100 bg-violet-50' : 'border-red-100 bg-red-50'}`}>
            <div>
              <p className={`font-semibold ${planAudit.pronto ? 'text-violet-950' : 'text-red-900'}`}>
                {planAudit.pronto ? 'Piano del ciclo completo' : 'Piano del ciclo NON completo'}
              </p>
              <p className={`text-xs ${planAudit.pronto ? 'text-violet-800' : 'text-red-800'}`}>
                Ciclo di 4 settimane dal {formatShortDate(planAudit.dal)} al {formatShortDate(planAudit.al)} · {planAudit.pianificati} contenuti attivi
                {planAudit.attesi > 0 && ` su ${planAudit.attesi} previsti`} · {planAudit.settimanePiene}/4 settimane coperte
              </p>
            </div>
            <button type="button" onClick={() => setPlanAudit(null)} className="self-start text-xs font-medium text-gray-500 hover:text-gray-800">Chiudi</button>
          </div>
          <ul className="divide-y">
            {planAudit.checks.map(c => (
              <li key={c.id} className="flex items-start gap-2.5 px-4 py-2.5">
                {c.stato === 'ok'
                  ? <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  : c.stato === 'attenzione'
                    ? <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    : <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />}
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${c.stato === 'ok' ? 'text-gray-700' : c.stato === 'attenzione' ? 'text-amber-800' : 'text-red-800'}`}>{c.titolo}</p>
                  <p className="text-xs text-gray-600">{c.dettaglio}</p>
                  {Boolean(c.contenuti?.length) && (
                    <p className="mt-0.5 font-mono text-[11px] text-gray-500">{c.contenuti?.join(' · ')}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t bg-gray-50 px-4 py-2 text-[11px] text-gray-600">
            Il referto non blocca la sincronizzazione: decidi tu se pubblicare. Gli slot mancanti si rigenerano dalla pagina Piano (fase 1 · settimane 1-2, fase 2 · settimane 3-4).
          </div>
        </div>
      )}

      {packageReconcile && (
        <div className="mb-4 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-emerald-100 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-emerald-950">Consuntivo pacchetto · {formatMonthLabel(packageReconcile.month)}</p>
              <p className="text-xs text-emerald-800">Stati riletti direttamente da Blotato. “Programmato” non viene contato come pubblicato.</p>
            </div>
            <span className="text-xs font-medium text-emerald-800">Quota {packageReconcile.summary.included} contenuti</span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Pubblicati confermati', value: packageReconcile.summary.published, tone: 'text-emerald-700', filter: 'PUBBLICATO' },
              { label: 'In coda Blotato', value: packageReconcile.summary.queued, tone: 'text-blue-700', filter: 'PUBBLICATO' },
              { label: 'Non ancora inviati', value: packageReconcile.summary.not_sent, tone: 'text-amber-700', filter: 'DA_APPROVARE' },
              { label: 'Falliti', value: packageReconcile.summary.failed, tone: 'text-red-700', filter: 'ERRORE' },
              { label: 'Mancano da creare', value: packageReconcile.summary.missing_to_create, tone: 'text-violet-700', filter: 'tutti' },
              { label: 'Mancano da pubblicare', value: packageReconcile.summary.missing_to_publish, tone: 'text-fuchsia-700', filter: 'tutti' },
            ].map(item => (
              <button key={item.label} type="button" onClick={() => setFilter(item.filter)} className="min-h-20 bg-white p-3 text-left hover:bg-gray-50" title={`Filtra: ${item.label}`}>
                <p className={`text-xl font-black ${item.tone}`}>{item.value}</p>
                <p className="text-[10px] font-medium uppercase text-gray-500">{item.label}</p>
              </button>
            ))}
          </div>
          {(packageReconcile.summary.extra_planned > 0 || Boolean(packageReconcile.remote_errors?.length) || Boolean(packageReconcile.unchecked)) && (
            <div className="border-t px-4 py-2 text-xs text-amber-800">
              {packageReconcile.summary.extra_planned > 0 && <span>{packageReconcile.summary.extra_planned} contenuti pianificati oltre quota. </span>}
              {Boolean(packageReconcile.remote_errors?.length) && <span>{packageReconcile.remote_errors?.length} stati non letti da Blotato; riprova la verifica. </span>}
              {Boolean(packageReconcile.unchecked) && <span>{packageReconcile.unchecked} contenuti oltre il limite del controllo singolo.</span>}
            </div>
          )}
        </div>
      )}

      {/* Contenuti "in stallo": inviati a Blotato, orario passato, nessuna conferma
          di pubblicazione mai arrivata. Senza questo avviso restano invisibili —
          il campo blotato_status resta 'scheduled' per sempre se il webhook non
          risponde (in produzione basta che manchi BLOTATO_WEBHOOK_SECRET perché
          ogni callback venga rifiutato con 401). È successo davvero: un post
          programmato non è uscito e nessuno se n'è accorto per ore. */}
      {stalli.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">
              {stalli.length === 1 ? '1 contenuto risulta ancora "programmato" ma l\'orario è passato.' : `${stalli.length} contenuti risultano ancora "programmati" ma l'orario è passato.`}
            </p>
            <p className="mt-0.5 text-red-700">
              Blotato non ha confermato la pubblicazione. Verifica sul social se il post è uscito davvero: se non c&apos;è, controlla lo storico Blotato e la API key del cliente.
            </p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-red-700">
              {stalli.slice(0, 5).map(c => (
                <li key={c.id}>
                  <span className="font-mono">{c.id_contenuto}</span> · {c.canale} · previsto {formatDateLabel(c.data_pubblicazione)} alle {formatTimeLabel(c.ora_pubblicazione)}
                </li>
              ))}
              {stalli.length > 5 && <li>…e altri {stalli.length - 5}.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Banner modalità DEMO: chiarisce che le approvazioni non pubblicano davvero */}
      {dryRun === true && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Modalità <strong>DEMO</strong> attiva: approvando un contenuto <strong>non</strong> viene pubblicato sui social (solo prova).
            Per pubblicare davvero, spegni <span className="font-mono">Modalità pubblicazione</span> in{' '}
            <Link href="/dashboard/settings" className="underline font-medium">Impostazioni</Link> (→ REAL).
          </span>
        </div>
      )}

      {(scoreError || adminError) && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {scoreError ? `AI scoring: ${scoreError}` : adminError}
        </div>
      )}

      {/* Filtri */}
      <div className="card p-3 md:p-4 mb-4 md:mb-6 bg-white/90">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Filtra contenuti</span>
          </div>
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Cerca ID, hook, tema o prodotto..."
              className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {[
            { label: 'Canale', value: filterCanale, setter: setCanale, options: CANALI.map(c => [c, c === 'tutti' ? 'Tutti i canali' : `${CANALE_ICON[c] || ''} ${c}`]) },
            { label: 'Formato', value: filterFormato, setter: setFormato, options: FORMATI.map(f => [f, f === 'tutti' ? 'Tutti i formati' : f]) },
            { label: 'Categoria', value: filterCategoria, setter: setCategoria, options: CATEGORIE },
          ].map(filter => (
            <label key={filter.label} className="relative">
              <span className="sr-only">{filter.label}</span>
              <select
                value={filter.value}
                onChange={e => filter.setter(e.target.value)}
                className="pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[140px]"
              >
                {filter.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 mr-1">Stato:</span>
          {['tutti', ...STATI].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'tutti' ? 'Tutti' : s.replace('_',' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Week date bar — drop targets */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {weekDays.map(date => {
          const countOnDate = contenuti.filter(c => c.data_pubblicazione === date).length
          const isToday = date === new Date().toISOString().split('T')[0]
          const isOver = dragOverDate === date
          return (
            <button
              type="button"
              key={date}
              onClick={() => setSelectedDay(current => current === date ? null : date)}
              aria-pressed={selectedDay === date}
              title={selectedDay === date ? 'Mostra tutta la settimana' : `Mostra i contenuti del ${formatDateLabel(date)}`}
              onDragOver={e => { e.preventDefault(); setDragOverDate(date) }}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={e => {
                e.preventDefault()
                setDragOverDate(null)
                const cid = e.dataTransfer.getData('contenuto_id')
                const content = contenuti.find(c => c.id === cid)
                if (content) handleDrop(content, date)
              }}
              className={`flex-1 min-w-[60px] rounded-xl border-2 px-2 py-2 text-center cursor-pointer transition-colors ${
                isOver ? 'border-brand-400 bg-brand-50 scale-105' :
                selectedDay === date ? 'border-brand-600 bg-brand-600 text-white shadow-md' :
                isToday ? 'border-brand-300 bg-brand-50/50' :
                'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className={`text-[10px] uppercase ${selectedDay === date ? 'text-white/75' : 'text-gray-400'}`}>
                {['LUN','MAR','MER','GIO','VEN','SAB','DOM'][new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1]}
              </p>
              <p className={`text-sm font-bold ${selectedDay === date ? 'text-white' : isToday ? 'text-brand-600' : 'text-gray-700'}`}>
                {date.split('-')[2]}
              </p>
              {countOnDate > 0 && (
                <span className={`text-[10px] font-medium ${selectedDay === date ? 'text-white/80' : isToday ? 'text-brand-500' : 'text-gray-400'}`}>
                  {countOnDate}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Toggle vista: lista editoriale ↔ griglia calendario (stile Blotato) */}
      <div className="flex items-center gap-1 mb-3">
        <button
          onClick={() => setVista('lista')}
          className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${vista === 'lista' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <List className="w-3.5 h-3.5" /> Lista
        </button>
        <button
          onClick={() => setVista('griglia')}
          className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${vista === 'griglia' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <LayoutGrid className="w-3.5 h-3.5" /> Griglia
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : loadError ? (
        <div className="card p-8 text-center border border-red-200 bg-red-50">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-800">Impossibile caricare i contenuti</p>
          <p className="text-xs text-red-600 mt-1">{loadError}</p>
          <button onClick={() => fetchData()} className="btn-secondary text-xs mt-3 inline-flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Riprova
          </button>
        </div>
      ) : contenuti.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-lg">Nessun contenuto trovato</p>
          <p className="text-sm mt-1">Cambia i filtri o attendi il piano settimanale</p>
        </div>
      ) : vista === 'griglia' ? (
        <CalendarGrid items={calendarItems} tz={clienteTz} onSelect={setSelected} onMove={handleDrop} />
      ) : (
        <div className="space-y-3">
          {/* Barra selezione multipla — seleziona tutto + elimina in blocco.
              STICKY: con un piano da oltre 100 contenuti la barra usciva subito dallo
              schermo e per selezionare tutto o eliminare bisognava risalire in cima.
              Sta sopra le intestazioni dei giorni (z-30 contro z-10), che infatti
              si agganciano piu in basso (top-14). */}
          <div className="sticky top-0 z-30 -mx-1 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.size > 0 && selectedIds.size === visibleCalendarItems.length}
                ref={el => { if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < visibleCalendarItems.length }}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-medium text-gray-600">
                {selectedIds.size === 0
                  ? `Seleziona tutti (${visibleCalendarItems.length})`
                  : selectedIds.size === visibleCalendarItems.length
                    ? `Tutti selezionati (${selectedIds.size}) — clicca per deselezionare`
                    : `${selectedIds.size} di ${visibleCalendarItems.length} selezionati`}
              </span>
            </label>
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => {
                    const first = contenuti.find(item => selectedIds.has(item.id))
                    setBulkMoveDate(first ? toYmd(first.data_pubblicazione) : todayIso)
                    setBulkMoveTime('')
                    setBulkMoveOpen(true)
                  }}
                  className="py-1.5 px-3 text-xs inline-flex items-center gap-1.5 rounded-lg font-medium bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                >
                  <Move className="w-3.5 h-3.5" />
                  Sposta selezionati ({selectedIds.size})
                </button>
                <button
                  onClick={() => setRejectBulkOpen(true)}
                  className="py-1.5 px-3 text-xs inline-flex items-center gap-1.5 rounded-lg font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Non approva selezionati ({selectedIds.size})
                </button>
                <button
                  onClick={() => setBulkDeleteOpen(true)}
                  className="btn-danger py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Elimina selezionati ({selectedIds.size})
                </button>
              </div>
            )}
          </div>
          {visibleCalendarItems.length === 0 && selectedDay ? (
            <div className="card p-10 text-center text-gray-500">
              <CalendarDays className="mx-auto mb-2 h-6 w-6 text-gray-400" />
              <p className="text-sm font-semibold">Nessun contenuto il {formatDateLabel(selectedDay)}</p>
              <button type="button" onClick={() => setSelectedDay(null)} className="btn-secondary mt-3 text-xs">Mostra tutta la settimana</button>
            </div>
          ) : visibleCalendarItems.map((c, index) => {
            const previousDate = visibleCalendarItems[index - 1]?.data_pubblicazione
            const showDateHeader = c.data_pubblicazione !== previousDate
            const dayItems = visibleCalendarItems.filter(item => item.data_pubblicazione === c.data_pubblicazione)
            const dayStatus = dayItems.reduce<Record<string, number>>((acc, item) => {
              acc[item.status] = (acc[item.status] || 0) + 1
              return acc
            }, {})
            const scoreLabel = scores[c.id] ? String(scores[c.id].score_globale ?? 'Valuta') : 'Valuta'
            return (
            <Fragment key={c.id}>
              {showDateHeader && (
                <div
                  onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOverDate(toYmd(c.data_pubblicazione)) }}
                  onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOverDate(null) }}
                  onDrop={event => {
                    event.preventDefault()
                    const contentId = event.dataTransfer.getData('contenuto_id') || event.dataTransfer.getData('text/plain')
                    const content = contenuti.find(item => item.id === contentId)
                    setDragOverDate(null)
                    if (content) void handleDrop(content, toYmd(c.data_pubblicazione))
                  }}
                  className={`sticky top-14 z-10 rounded-2xl border bg-white/95 p-3 shadow-sm backdrop-blur transition-colors md:p-4 ${dragOverDate === toYmd(c.data_pubblicazione) ? 'border-brand-500 bg-brand-50/95 ring-2 ring-brand-200' : 'border-slate-200'}`}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{formatDayName(c.data_pubblicazione)}</p>
                      <h2 className="text-lg font-black text-slate-900">{formatDateLabel(c.data_pubblicazione)}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{dayItems.length} contenuti</span>
                      {Object.entries(dayStatus).map(([status, count]) => (
                        <span key={status} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          <span className={`h-2 w-2 rounded-full ${statusTone(status)}`} />
                          {status.replace('_', ' ')} {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className={`card overflow-hidden border-slate-200/80 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg md:p-4 ${dragItem === c.id ? 'opacity-50 scale-95' : ''} ${selectedIds.has(c.id) ? 'ring-2 ring-brand-400' : ''}`}>
              <div className={`mb-3 h-1 rounded-full ${statusTone(c.status)}`} />
              <div className="flex flex-wrap items-start gap-3 md:gap-4">
                {(() => {
                  const movable = !c.blotato_post_id && c.blotato_status !== 'scheduled' && c.blotato_status !== 'published' && !['PUBBLICATO', 'ARCHIVIATO'].includes(c.status)
                  return (
                    <span
                      draggable={movable}
                      onDragStart={event => {
                        if (!movable) return
                        event.dataTransfer.setData('contenuto_id', c.id)
                        event.dataTransfer.setData('text/plain', c.id)
                        event.dataTransfer.effectAllowed = 'move'
                        setDragItem(c.id)
                      }}
                      onDragEnd={() => { setDragItem(null); setDragOverDate(null) }}
                      title={movable ? 'Trascina in un altro giorno' : 'Già sincronizzato: rimettilo in coda prima di spostarlo'}
                      className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border ${movable ? 'cursor-grab border-slate-200 bg-slate-50 text-slate-500 hover:border-brand-300 hover:text-brand-700 active:cursor-grabbing' : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'}`}
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                  )
                })()}
                {/* Checkbox selezione per eliminazione multipla */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(c.id)}
                  onChange={() => toggleSelectId(c.id)}
                  onClick={e => e.stopPropagation()}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 flex-shrink-0"
                  title="Seleziona per eliminazione multipla"
                />
                {/* Media thumb — click per caricare/sostituire media principale */}
                <label
                  className="relative w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden group cursor-pointer"
                  title="Carica o sostituisci foto/video principale"
                  onClick={e => e.stopPropagation()}
                  draggable={false}
                >
                  {c.link_media_1 && isVideoUrl(c.link_media_1) ? (
                    <video src={c.link_media_1} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                  ) : c.link_media_1 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.link_media_1} alt="" className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {CANALE_ICON[c.canale] ?? '📄'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors flex items-center justify-center">
                    {uploadingPhoto === `${c.id}:1` ? (
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept={MEDIA_ACCEPT}
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) attachPhoto(c, f, 1); e.target.value = '' }}
                  />
                </label>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-gray-400">{c.id_contenuto}</span>
                    <StatusBadge status={c.status} />
                    {(() => {
                      // Badge pre-flight Blotato: solo per contenuti che verranno sincronizzati
                      // (non pubblicati/archiviati/non_approvati). Avvisa senza bloccare l'approvazione.
                      if (['PUBBLICATO', 'NON_APPROVATO', 'ARCHIVIATO'].includes(c.status)) return null
                      const pf = preflightRow(c as unknown as Record<string, unknown>, clienteTz)
                      if (pf.ok) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Pronto Blotato</span>
                      return <span title={pf.errors.map(e => e.message).join('; ')} className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Blocca sync</span>
                    })()}
                    {c.quality_level && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 uppercase">{c.quality_level}</span>
                    )}
                    <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                      <span>{CANALE_ICON[c.canale] ?? '📄'}</span>
                      <span>{c.canale}</span>
                      <span>·</span>
                      <span>{c.formato}</span>
                      {c.obiettivo && (
                        <>
                          <span>·</span>
                          <span className="text-amber-700">{formatCategoryLabel(c.obiettivo)}</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs text-gray-600 ml-auto inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-2 py-1 font-medium">
                      <span>{formatDateLabel(c.data_pubblicazione)}</span>
                      <span className="text-gray-300">·</span>
                      <span className="font-mono">{formatTimeLabel(c.ora_pubblicazione)}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">{c.formato}</span>
                    {c.obiettivo && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">{formatCategoryLabel(c.obiettivo)}</span>
                    )}
                    {c.tema && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 truncate max-w-[220px]">{c.tema}</span>
                    )}
                  </div>
                  {c.hook && <p className="text-sm font-medium text-gray-800 mb-0.5 truncate">{c.hook}</p>}
                  {/* Due righe, non una: `truncate` tagliava una caption da 700
                      caratteri a meta della prima frase, spesso a meta parola, e
                      sembrava che il testo fosse tagliato nel contenuto. */}
                  {c.caption && <p className="text-sm text-gray-500 line-clamp-2">{c.caption}</p>}
                  {c.errore_tecnico && (
                    <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mt-1 truncate">
                      ⚠ {c.errore_tecnico}
                    </p>
                  )}
                  {c.blotato_status && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        c.blotato_status === 'published' ? 'bg-green-500' :
                        c.blotato_status === 'scheduled' ? 'bg-blue-500' :
                        c.blotato_status === 'failed' ? 'bg-red-500' :
                        c.blotato_status === 'visual_pending' ? 'bg-amber-500' :
                        c.blotato_status === 'visual_review' ? 'bg-violet-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-[10px] text-gray-500">
                        {c.blotato_status === 'published' ? 'Pubblicato' :
                         c.blotato_status === 'scheduled' ? 'In coda Blotato' :
                         c.blotato_status === 'failed' ? 'Fallito' :
                         c.blotato_status === 'visual_pending' ? 'Montaggio Reel in corso' :
                         c.blotato_status === 'visual_review' ? 'Video pronto da approvare' : c.blotato_status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Azioni */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-2 flex-shrink-0">
                  <Link
                    href={`/preview/${c.id_contenuto}`}
                    onClick={() => {
                      try { localStorage.setItem(`preview_${c.id_contenuto}`, JSON.stringify({
                        hook: c.hook, caption: c.caption, hashtag: c.hashtag, cta: c.cta,
                        canale: c.canale, formato: c.formato,
                        link_media_1: c.blotato_audio_visual_media_url || c.blotato_visual_media_url || c.link_media_1, link_media_2: c.link_media_2, link_media_3: c.link_media_3,
                        link_media_4: c.link_media_4, link_media_5: c.link_media_5, link_media_6: c.link_media_6,
                        link_media_7: c.link_media_7, link_media_8: c.link_media_8, link_media_9: c.link_media_9,
                        link_media_10: c.link_media_10,
                        nome_prodotto: c.nome_prodotto, tema: c.tema, note: c.note,
                        scenes_json: c.scenes_json, slides_json: c.slides_json, overlay_text: c.overlay_text,
                        alt_text: c.alt_text, tags: c.tags, thumbnail_url: c.thumbnail_url,
                        idea_visual: c.idea_visual, voiceover_script: c.voiceover_script, music_mood: c.music_mood,
                        reel_audio_url: c.reel_audio_url, reel_audio_title: c.reel_audio_title,
                        blotato_visual_media_url: c.blotato_visual_media_url,
                        blotato_audio_visual_media_url: c.blotato_audio_visual_media_url,
                        link_prodotto_finale: c.link_prodotto_finale || c.link_prodotto,
                        brand_name: brand?.brand_name, social_handle: brand?.social_handle,
                      })) } catch {}
                    }}
                    title="Anteprima del post"
                    className="btn-secondary py-1.5 px-2 md:px-3 justify-center inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden md:inline text-xs">Preview</span>
                  </Link>
                  <button
                    onClick={() => setSelected(c)}
                    title="Dettagli e brief completo"
                    className="btn-secondary py-1.5 px-2 md:px-3 justify-center"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span className="hidden md:inline text-xs">Dettagli</span>
                  </button>
                  <button
                    onClick={() => handleScore(c)}
                    disabled={scoring === c.id}
                    title="Valuta con AI (punteggio qualità)"
                    className={`py-1.5 px-2 md:px-3 justify-center inline-flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${
                      scores[c.id]
                        ? 'bg-violet-50 text-violet-700 border border-violet-200'
                        : 'btn-secondary'
                    }`}
                  >
                    {scoring === c.id
                      ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      : <Sparkles className="w-3.5 h-3.5" />
                    }
                    <span className="hidden md:inline">{scoreLabel}</span>
                  </button>
                  {c.status === 'DA_APPROVARE' && (
                    <>
                      <button onClick={() => approva(c)} disabled={saving === c.id} title="Approva contenuto" className="btn-primary py-1.5 px-2 md:px-3 justify-center">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{saving === c.id ? '...' : 'Approva'}</span>
                      </button>
                      <button onClick={() => setRejectTarget(c)} disabled={saving === c.id} title="Non approvare (va in Non approvati)" className="btn-danger py-1.5 px-2 md:px-3 justify-center">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {c.status === 'NON_APPROVATO' && (
                    <button onClick={() => ripristina(c)} disabled={saving === c.id} title="Ripristina in Da approvare" className="btn-secondary py-1.5 px-2 md:px-3 justify-center">
                      <RefreshCw className={`w-3.5 h-3.5 ${saving === c.id ? 'animate-spin' : ''}`} />
                      <span className="hidden md:inline">Ripristina</span>
                    </button>
                  )}
                  {isGenerationFallback(c) ? (
                    <button onClick={() => setSelected(c)} disabled={saving === c.id} className="btn-secondary py-1.5 px-2 md:px-3 justify-center" title="Modifica il contenuto incompleto">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Sistema</span>
                    </button>
                  ) : (c.status === 'ERRORE' || c.status === 'ERRORE_MANUALE') && (
                    <button onClick={() => resetErrore(c)} disabled={saving === c.id} className="btn-secondary py-1.5 px-2 md:px-3 justify-center">
                      <RefreshCw className={`w-3.5 h-3.5 ${saving === c.id ? 'animate-spin' : ''}`} />
                      <span className="hidden md:inline">Riprova pubblicazione</span>
                    </button>
                  )}
                  {c.status === 'APPROVATO' && !c.blotato_post_id && (
                    <button onClick={() => syncUno(c)} disabled={saving === c.id} title="Sincronizza SOLO questo contenuto su Blotato (non l'intero batch)" className="btn-secondary py-1.5 px-2 md:px-3 justify-center">
                      {saving === c.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span className="hidden md:inline">Sincronizza questo</span>
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(c)}
                    disabled={saving === c.id}
                    className="py-1.5 px-2 md:px-3 justify-center inline-flex items-center gap-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                    title="Elimina definitivamente il contenuto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Elimina</span>
                  </button>
                </div>
              </div>
            </div>
            </Fragment>
            )
          })}
        </div>
      )}

      {/* Modal dettaglio */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">{selected.id_contenuto}</h2>
                <p className="text-sm text-gray-500">
                  {selected.canale} · {selected.formato} · {formatCategoryLabel(selected.obiettivo)} · {formatDateLabel(selected.data_pubblicazione)} alle {formatTimeLabel(selected.ora_pubblicazione)}
                </p>
                {!selected.blotato_post_id
                  && selected.blotato_status !== 'scheduled'
                  && selected.blotato_status !== 'published'
                  && !['PUBBLICATO', 'ARCHIVIATO'].includes(selected.status)
                  && (
                    <label className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                      <input
                        type="date"
                        value={toYmd(selected.data_pubblicazione)}
                        aria-label="Sposta contenuto a un'altra data"
                        className="border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                        onChange={async event => {
                          const newDate = event.target.value
                          if (newDate && await handleDrop(selected, newDate)) {
                            setSelected(current => current ? { ...current, data_pubblicazione: newDate } : current)
                          }
                        }}
                      />
                    </label>
                  )}
                {selected.quality_level && (
                  <span className="inline-flex mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-violet-100 text-violet-700">
                    Qualità {selected.quality_level}
                  </span>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {isGenerationFallback(selected) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-semibold">Contenuto da completare</p>
                  <p className="mt-1 text-xs">Il ciclo ha conservato data, canale, formato e media. Modifica qui sotto hook, caption, hashtag e CTA, poi mandalo in approvazione.</p>
                </div>
              )}
              {/* Anteprima visuale post */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 -mx-6 -mt-6 px-6 py-6 border-b">
                <p className="label mb-3">Anteprima {selected.canale}</p>
                <PostPreview c={selected} brand={brand} />
              </div>

              {/* Contenuto — editabile finché non è mai stato inviato a Blotato */}
              {editableField(selected, 'Hook', 'hook')}
              {editableField(selected, 'Caption', 'caption', true)}
              {editableField(selected, 'Hashtag', 'hashtag')}
              {editableField(selected, 'CTA', 'cta')}

              {Boolean(selected.angle || selected.audience_segment || selected.funnel_stage || selected.kpi_target || selected.primary_message || selected.creative_brief || selected.template_id || selected.template_style || selected.production_notes || selected.compliance_notes || selected.expected_outcome || selected.production_cycle_stage || selected.performance_hypothesis || selected.optimization_cycle_json || selected.next_iteration_actions) && (
                <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
                  <p className="text-sm font-bold text-violet-900 mb-3">Strategia operativa</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {[
                      { label: 'Audience', value: selected.audience_segment },
                      { label: 'Funnel', value: selected.funnel_stage },
                      { label: 'Angolo', value: selected.angle },
                      { label: 'KPI', value: selected.kpi_target },
                      { label: 'Messaggio', value: selected.primary_message },
                      { label: 'Outcome', value: selected.expected_outcome },
                      { label: 'Ciclo', value: selected.production_cycle_stage },
                      { label: 'Ipotesi', value: selected.performance_hypothesis },
                      { label: 'Template', value: selected.template_id },
                      { label: 'Stile', value: selected.template_style },
                    ].filter(item => Boolean(item.value)).map(item => (
                      <div key={item.label} className="bg-white rounded-lg p-2 border border-violet-100">
                        <p className="text-[10px] uppercase text-violet-500 font-bold">{item.label}</p>
                        <p className="text-xs text-gray-800 mt-0.5">{asText(item.value)}</p>
                      </div>
                    ))}
                  </div>
                  {selected.creative_brief && (
                    <div className="mb-2">
                      <p className="text-[10px] uppercase text-violet-600 font-bold">Brief creativo</p>
                      <p className="text-xs text-violet-900 whitespace-pre-wrap">{selected.creative_brief}</p>
                    </div>
                  )}
                  {Boolean(selected.layout_spec_json || selected.asset_requirements_json) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      {Boolean(selected.layout_spec_json) && (
                        <div className="bg-white rounded-lg p-2 border border-violet-100">
                          <p className="text-[10px] uppercase text-violet-600 font-bold">Layout</p>
                          <pre className="text-[10px] text-violet-900 whitespace-pre-wrap font-mono mt-1">{JSON.stringify(selected.layout_spec_json, null, 2)}</pre>
                        </div>
                      )}
                      {Boolean(selected.asset_requirements_json) && (
                        <div className="bg-white rounded-lg p-2 border border-violet-100">
                          <p className="text-[10px] uppercase text-violet-600 font-bold">Asset richiesti</p>
                          <pre className="text-[10px] text-violet-900 whitespace-pre-wrap font-mono mt-1">{JSON.stringify(selected.asset_requirements_json, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                  {Boolean(selected.optimization_cycle_json || selected.next_iteration_actions) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      {Boolean(selected.optimization_cycle_json) && (
                        <div className="bg-white rounded-lg p-2 border border-violet-100">
                          <p className="text-[10px] uppercase text-violet-600 font-bold">Ottimizzazione</p>
                          <pre className="text-[10px] text-violet-900 whitespace-pre-wrap font-mono mt-1">{JSON.stringify(selected.optimization_cycle_json, null, 2)}</pre>
                        </div>
                      )}
                      {Boolean(selected.next_iteration_actions) && (
                        <div className="bg-white rounded-lg p-2 border border-violet-100">
                          <p className="text-[10px] uppercase text-violet-600 font-bold">Prossime azioni</p>
                          <pre className="text-[10px] text-violet-900 whitespace-pre-wrap font-mono mt-1">{JSON.stringify(selected.next_iteration_actions, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                  {selected.production_notes && (
                    <div className="mb-2">
                      <p className="text-[10px] uppercase text-violet-600 font-bold">Produzione</p>
                      <p className="text-xs text-violet-900 whitespace-pre-wrap">{selected.production_notes}</p>
                    </div>
                  )}
                  {selected.compliance_notes && (
                    <div>
                      <p className="text-[10px] uppercase text-violet-600 font-bold">Compliance</p>
                      <p className="text-xs text-violet-900 whitespace-pre-wrap">{selected.compliance_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Checklist */}
              <div>
                <p className="label">Checklist revisione</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { k: 'checked_copy',  l: 'Copy' },
                    { k: 'checked_media', l: 'Media' },
                    { k: 'checked_link',  l: 'Link' },
                    { k: 'checked_price', l: 'Prezzo' },
                  ].map(({ k, l }) => {
                    const val = selected[k as keyof Contenuto] as string
                    return (
                      <div key={k} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                        val === 'SI' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                      }`}>
                        {val === 'SI' ? '✓' : '○'} {l}
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => handleScore(selected)}
                  disabled={scoring === selected.id}
                  className="btn-secondary w-full justify-center mt-3 text-xs py-2"
                >
                  {scoring === selected.id
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Sparkles className="w-3.5 h-3.5" />
                  }
                  {scoring === selected.id ? 'Valutando...' : scores[selected.id] ? 'Rivaluta contenuto' : 'AI Score — Valuta qualità'}
                </button>
              </div>

              {/* AI Score */}
              {scores[selected.id] && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-violet-900">AI Content Score</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      (scores[selected.id].giudizio as string) === 'OTTIMO' ? 'bg-green-100 text-green-700' :
                      (scores[selected.id].giudizio as string) === 'BUONO' ? 'bg-violet-100 text-violet-700' :
                      (scores[selected.id].giudizio as string) === 'MEDIOCRE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {scores[selected.id].giudizio as string} · {scores[selected.id].score_globale as number}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[
                      { k: 'hook_strength', l: 'Hook' },
                      { k: 'copy_quality', l: 'Copy' },
                      { k: 'brand_fit', l: 'Brand' },
                      { k: 'cta_effectiveness', l: 'CTA' },
                      { k: 'hashtag_relevance', l: 'Hashtag' },
                      { k: 'seo_potential', l: 'SEO' },
                      { k: 'platform_native_fit', l: 'Native' },
                      { k: 'creative_clarity', l: 'Brief' },
                      { k: 'conversion_path', l: 'Funnel' },
                      { k: 'accessibility', l: 'Access' },
                      { k: 'compliance', l: 'Regole' },
                      { k: 'optimization_readiness', l: 'Itera' },
                    ].map(({ k, l }) => {
                      const rawValue = scores[selected.id][k]
                      const val = typeof rawValue === 'number' ? rawValue : 0
                      const color = val >= 80 ? 'bg-green-500' : val >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      return (
                        <div key={k} className="bg-white rounded-lg p-2 text-center">
                          <p className="text-[10px] text-gray-400 uppercase">{l}</p>
                          <p className="text-sm font-bold text-gray-900">{val}</p>
                          <div className="w-full h-1 bg-gray-100 rounded-full mt-1">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {Array.isArray(scores[selected.id].punti_forti) && (scores[selected.id].punti_forti as string[]).length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] uppercase text-green-600 font-bold mb-1">Punti forti</p>
                      <ul className="space-y-0.5">
                        {(scores[selected.id].punti_forti as string[]).map((p: string, i: number) => (
                          <li key={i} className="text-xs text-green-700 flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(scores[selected.id].punti_deboli) && (scores[selected.id].punti_deboli as string[]).length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] uppercase text-red-500 font-bold mb-1">Da migliorare</p>
                      <ul className="space-y-0.5">
                        {(scores[selected.id].punti_deboli as string[]).map((p: string, i: number) => (
                          <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                            <span className="text-red-400 mt-0.5">○</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(scores[selected.id].suggerimenti) && (scores[selected.id].suggerimenti as string[]).length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase text-violet-600 font-bold mb-1">Suggerimenti</p>
                      <ul className="space-y-0.5">
                        {(scores[selected.id].suggerimenti as string[]).map((s: string, i: number) => (
                          <li key={i} className="text-xs text-violet-700 flex items-start gap-1">
                            <Sparkles className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Immagine AI via OpenRouter — usa il modello selezionato + la key OpenRouter (a pagamento). */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-900">Genera immagine AI</p>
                </div>
                <p className="text-xs text-emerald-700/80 mb-3">
                  Crea un&apos;immagine dal contenuto via OpenRouter. Se il post ha già una foto, la usa come riferimento. Richiede una key OpenRouter con credito.
                </p>
                <button
                  onClick={() => generaImmagine(selected)}
                  disabled={comfyState === 'generating'}
                  className="w-full text-xs font-semibold py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {comfyState === 'generating' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {comfyState === 'generating' ? 'Generazione in corso…' : 'Genera immagine AI'}
                </button>
                {comfyMsg && (
                  <p className={`text-xs mt-2 ${comfyState === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>{comfyMsg}</p>
                )}
              </div>

              {/* Immagini del post — ogni slot ha il suo campo carica/sostituisci/rimuovi */}
              {(() => {
                const isCarousel = selected.formato === 'carousel'
                const slotCount = isCarousel ? 10 : 1
                const mediaVals = [
                  selected.link_media_1, selected.link_media_2, selected.link_media_3,
                  selected.link_media_4, selected.link_media_5, selected.link_media_6, selected.link_media_7,
                  selected.link_media_8, selected.link_media_9, selected.link_media_10,
                ]
                // Mostra tutti gli slot pieni + il primo slot vuoto (per aggiungerne uno).
                const lastFilled = mediaVals.reduce((acc, v, i) => (v ? i : acc), -1)
                const visibleSlots = isCarousel
                  ? Math.min(slotCount, Math.max(1, lastFilled + 2))
                  : 1
                return (
                  <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <ImagePlus className="w-4 h-4 text-sky-600" />
                        <p className="text-sm font-bold text-sky-900">Immagini del post</p>
                      </div>
                      <span className="text-[10px] text-sky-600 uppercase font-bold">
                        {isCarousel ? 'carosello · fino a 7' : '1 immagine'}
                      </span>
                    </div>
                    <p className="text-xs text-sky-700/80 mb-3">
                      Carica foto o MP4 dal computer. Ogni media ha il suo campo: puoi sostituirlo o rimuoverlo singolarmente.
                    </p>
                    <div className={`grid gap-2 ${isCarousel ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1 max-w-[200px]'}`}>
                      {Array.from({ length: visibleSlots }).map((_, i) => {
                        const slot = i + 1
                        const url = mediaVals[i]
                        const busy = uploadingPhoto === `${selected.id}:${slot}`
                        return (
                          <div key={slot} className="relative">
                            <label
                              className={`relative block ${isCarousel ? 'aspect-square' : 'aspect-[4/5]'} rounded-lg overflow-hidden border-2 ${url ? 'border-sky-200' : 'border-dashed border-sky-300'} bg-white cursor-pointer group`}
                              title={url ? 'Sostituisci media' : 'Carica foto o MP4'}
                            >
                              {url && isVideoUrl(url) ? (
                                <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                              ) : url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={url} alt={`Slide ${slot}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-sky-400 gap-1">
                                  <Camera className="w-5 h-5" />
                                  <span className="text-[10px] font-medium">Carica</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                {busy ? (
                                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                ) : url ? (
                                  <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                ) : null}
                              </div>
                              <span className="absolute top-1 left-1 text-[9px] font-bold bg-black/50 text-white rounded px-1">{slot}</span>
                              <input
                                type="file"
                                accept={MEDIA_ACCEPT}
                                className="hidden"
                                disabled={busy}
                                onChange={e => { const f = e.target.files?.[0]; if (f) attachPhoto(selected, f, slot); e.target.value = '' }}
                              />
                            </label>
                            {url && !busy && (
                              <button
                                type="button"
                                onClick={() => removePhoto(selected, slot)}
                                title="Rimuovi media"
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-200"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {AUDIO_FORMATS.has(selected.formato) && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Music2 className="h-4 w-4 text-emerald-700" />
                      <p className="text-sm font-bold text-emerald-950">Audio {audioFormatLabel(selected.formato)}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700">MP3 · WAV · M4A · OGG</span>
                  </div>
                  {selected.reel_audio_url && (
                    <div className="mb-3">
                      <p className="mb-1 truncate text-[11px] font-medium text-emerald-800">{selected.reel_audio_title || 'Traccia audio caricata'}</p>
                      <audio src={selected.reel_audio_url} controls preload="metadata" className="h-9 w-full" />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-400 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50">
                    {uploadingPhoto === `${selected.id}:audio` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Music2 className="h-4 w-4" />}
                    {selected.reel_audio_url ? 'Sostituisci audio' : `Carica audio ${audioFormatLabel(selected.formato)}`}
                    <input
                      type="file"
                      accept={AUDIO_ACCEPT}
                      className="hidden"
                      disabled={uploadingPhoto === `${selected.id}:audio`}
                      onChange={e => { const file = e.target.files?.[0]; if (file) attachContentAudio(selected, file); e.target.value = '' }}
                    />
                  </label>
                  {selected.formato === 'carousel' && (
                    <p className="mt-2 text-[10px] text-emerald-800">
                      Con questa traccia il carosello viene adattato a slideshow video/Reel: le slide restano in ordine, ma non sara pubblicato come carosello statico.
                    </p>
                  )}
                  {['post', 'pin'].includes(selected.formato) && (
                    <p className="mt-2 text-[10px] text-emerald-800">
                      Con questa traccia il post viene adattato a video/Reel. La foto resta il visual principale e la pubblicazione richiede una nuova approvazione.
                    </p>
                  )}
                  {selected.formato === 'story' && selected.canale === 'instagram' && (
                    <p className="mt-2 text-[10px] text-emerald-800">
                      Alla prima approvazione Remotion trasforma la Story in un MP4 9:16 e incorpora questa traccia. Il risultato richiede una nuova approvazione.
                    </p>
                  )}
                  {selected.formato === 'story' && selected.canale === 'facebook' && (
                    <p className="mt-2 text-[10px] text-emerald-800">
                      Blotato non pubblica Facebook Story via API: con questa traccia SWA la adatta automaticamente a Reel Facebook.
                    </p>
                  )}
                  {['reel', 'short', 'video'].includes(selected.formato) && (
                    <p className="mt-2 text-[10px] text-emerald-800">
                      Alla prima approvazione Remotion incorpora questa traccia in un nuovo MP4. Il video torna in Anteprima e richiede una seconda approvazione prima della pubblicazione.
                    </p>
                  )}
                </div>
              )}

              {/* Errore */}
              {selected.errore_tecnico && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="label text-red-600">Errore tecnico</p>
                  <p className="text-sm text-red-700">{selected.errore_tecnico}</p>
                </div>
              )}

              {/* Note */}
              {selected.note && (
                <div>
                  <p className="label">Note</p>
                  <p className="text-sm text-gray-600">{selected.note}</p>
                </div>
              )}
            </div>

            {/* Footer azioni */}
            <div className="p-6 border-t space-y-3">
              {/* Approval link */}
              {selected.status === 'DA_APPROVARE' && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3">
                    <button onClick={() => generateApprovalLink(selected)} disabled={sendingToken === selected.id} className="btn-secondary flex-1 justify-center py-2">
                      <Share2 className="w-4 h-4" />
                      {sendingToken === selected.id ? 'Genero...' : 'Invia al cliente'}
                    </button>
                  </div>
                  {approvalUrl && (
                    <div className="bg-brand-50 border border-brand-200 rounded-lg p-2.5">
                      <p className="text-xs text-brand-700 font-medium mb-1">✅ Link approvazione generato:</p>
                      <div className="flex gap-2">
                        <input readOnly value={approvalUrl} className="input text-xs flex-1" onClick={e => (e.target as HTMLInputElement).select()} />
                        <button onClick={() => { navigator.clipboard?.writeText(approvalUrl) }} className="btn-primary text-xs px-3">Copia</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selected.status === 'DA_APPROVARE' && (
                <div className="flex gap-3">
                  <button onClick={() => approva(selected)} className="btn-primary flex-1 justify-center" disabled={saving === selected.id}>
                    <CheckCircle className="w-4 h-4" />
                    {saving === selected.id ? 'Salvando...' : 'Approva'}
                  </button>
                  <button onClick={() => setRejectTarget(selected)} className="btn-danger flex-1 justify-center" disabled={saving === selected.id}>
                    <XCircle className="w-4 h-4" />
                    Non approvare
                  </button>
                </div>
              )}

              {selected.status === 'NON_APPROVATO' && (
                <div className="flex gap-3">
                  <button onClick={() => ripristina(selected)} className="btn-secondary flex-1 justify-center" disabled={saving === selected.id}>
                    <RefreshCw className={`w-4 h-4 ${saving === selected.id ? 'animate-spin' : ''}`} />
                    {saving === selected.id ? 'Salvando...' : 'Ripristina in Da approvare'}
                  </button>
                </div>
              )}
            </div>

            {isGenerationFallback(selected) ? (
              <div className="p-6 border-t bg-amber-50/40">
                <div className="grid gap-2 sm:grid-cols-2">
                  <button onClick={() => rigeneraFallback(selected)} className="btn-primary w-full justify-center" disabled={saving === selected.id}>
                    <Sparkles className={`w-4 h-4 ${saving === selected.id ? 'animate-pulse' : ''}`} />
                    {saving === selected.id ? 'Rigenerazione...' : 'Rigenera con AI'}
                  </button>
                  <button onClick={() => completaFallbackManuale(selected)} className="btn-secondary w-full justify-center" disabled={saving === selected.id}>
                    <CheckCircle className="w-4 h-4" />
                    Corretto manualmente
                  </button>
                </div>
                <p className="mt-2 text-center text-[11px] text-gray-500">La rigenerazione conserva data, canale, formato e media. Torna sempre in Da approvare: non pubblica nulla.</p>
              </div>
            ) : (selected.status === 'ERRORE' || selected.status === 'ERRORE_MANUALE') && (
              <div className="p-6 border-t">
                <button onClick={() => resetErrore(selected)} className="btn-secondary w-full justify-center" disabled={saving === selected.id}>
                  <RefreshCw className="w-4 h-4" />
                  Reset e riprova pubblicazione
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Cancellare contenuto?</h2>
                <p className="text-xs text-gray-500">{deleteTarget.id_contenuto} · {deleteTarget.canale} · {deleteTarget.formato}</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">
                Questa azione elimina il contenuto dal calendario e rimuove eventuali token di approvazione collegati. Prima puoi scaricare un backup JSON.
              </p>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                Se il contenuto è già pubblicato su social, questo cancella solo la copia interna della piattaforma.
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="btn-secondary flex-1 justify-center">
                Annulla
              </button>
              <button
                onClick={() => deleteContent(deleteTarget)}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Cancello...' : 'Cancella'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale conferma eliminazione multipla */}
      {bulkMoveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !bulkMoving && setBulkMoveOpen(false)}>
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <CalendarClock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-gray-900">Sposta {selectedIds.size} contenuti</h2>
                <p className="text-xs text-gray-500">Inclusi i contenuti ancora da approvare</p>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Nuova data</label>
                <input
                  type="date"
                  value={bulkMoveDate}
                  onChange={event => setBulkMoveDate(event.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Nuova ora <span className="font-normal text-gray-400">(facoltativa)</span></label>
                <input
                  type="time"
                  value={bulkMoveTime}
                  onChange={event => setBulkMoveTime(event.target.value)}
                  className="input w-full"
                />
                <p className="mt-1 text-[11px] text-gray-500">Lascia vuoto per mantenere l’orario di ciascun contenuto.</p>
              </div>
              <p className="rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs text-sky-800">
                I contenuti già programmati o pubblicati su Blotato verranno saltati. Prima devono essere rimessi in coda.
              </p>
            </div>
            <div className="flex gap-3 border-t p-5">
              <button type="button" onClick={() => setBulkMoveOpen(false)} disabled={bulkMoving} className="btn-secondary flex-1 justify-center">Annulla</button>
              <button type="button" onClick={bulkMove} disabled={bulkMoving || !bulkMoveDate} className="btn-primary flex-1 justify-center">
                {bulkMoving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Move className="h-4 w-4" />}
                {bulkMoving ? 'Sposto...' : 'Sposta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => !bulkDeleting && setBulkDeleteOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Eliminare {selectedIds.size} contenuti?</h2>
                <p className="text-xs text-gray-500">Eliminazione multipla dal calendario</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">
                Elimina definitivamente <span className="font-semibold">{selectedIds.size} contenuti</span> selezionati e i relativi token di approvazione. Utile per svuotare un piano editoriale generato che non ti serve.
              </p>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                Azione irreversibile. I contenuti già pubblicati sui social non vengono rimossi dalle piattaforme, solo la copia interna.
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => setBulkDeleteOpen(false)} disabled={bulkDeleting} className="btn-secondary flex-1 justify-center">
                Annulla
              </button>
              <button
                onClick={bulkDelete}
                disabled={bulkDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                {bulkDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {bulkDeleting ? 'Elimino...' : `Elimina ${selectedIds.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conferma "Non approvare": copre sia il singolo post (tasto rosso) sia la
          selezione multipla. Il rifiuto sposta il contenuto in Non approvati (recuperabile). */}
      {(rejectTarget !== null || rejectBulkOpen) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { if (!rejecting) { setRejectTarget(null); setRejectBulkOpen(false) } }}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  {rejectBulkOpen ? `Non approvare ${rejectableSelectedCount} post?` : 'Non approvare questo post?'}
                </h2>
                <p className="text-xs text-gray-500">Andranno nella lista Non approvati</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">
                {rejectBulkOpen
                  ? <><span className="font-semibold">{rejectableSelectedCount}</span> contenuti in <span className="font-semibold">Da approvare</span> passeranno in <span className="font-semibold">Non approvati</span> e non verranno pubblicati.{selectedIds.size > rejectableSelectedCount && <> Gli altri <span className="font-semibold">{selectedIds.size - rejectableSelectedCount}</span> selezionati verranno saltati (non sono in attesa di approvazione).</>}</>
                  : <>Il post <span className="font-semibold">{rejectTarget?.id_contenuto}</span> ({rejectTarget?.canale} · {rejectTarget?.formato}) passerà in <span className="font-semibold">Non approvati</span> e non verrà pubblicato.</>}
              </p>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                Azione reversibile: potrai riportarli in <span className="font-semibold">Da approvare</span> con il pulsante Ripristina.
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => { setRejectTarget(null); setRejectBulkOpen(false) }} disabled={rejecting} className="btn-secondary flex-1 justify-center">
                Annulla
              </button>
              <button
                onClick={() => { if (rejectBulkOpen) { bulkReject() } else { const t = rejectTarget; setRejectTarget(null); if (t) rifiuta(t) } }}
                disabled={rejecting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                {rejecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {rejecting ? 'Aggiorno...' : rejectBulkOpen ? `Non approvare ${rejectableSelectedCount}` : 'Non approvare'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
