'use client'
import { useEffect, useState, useRef } from 'react'
import { Sparkles, Check, ChevronDown, Key, Zap, AlertCircle, Search, ThumbsUp, Eye, Image as ImageIcon } from 'lucide-react'

// Selettore modello — SOLO OpenRouter. L'admin usa la SUA OpenRouter API key
// (per-browser) e sceglie il modello da una lista PER SCOPO caricata LIVE dal
// catalogo OpenRouter (/api/system/openrouter-models): testo (free/pagamento) e
// immagini (modelli che generano immagini in output). Se il catalogo live non
// risponde si usa un fallback curato.

type Category = 'text' | 'image'

type Model = {
  id: string
  name: string
  free: boolean
  context: string
  vision?: boolean       // legge immagini in input
  category: Category     // scopo: genera immagini o testo
  badge?: string
  recommendedFor?: string[]
}

type Task =
  | 'contenuti-social'
  | 'piano-editoriale'
  | 'seo-audit'
  | 'blog-articolo'

const TASK_LABELS: Record<Task, string> = {
  'contenuti-social': 'Contenuti Social',
  'piano-editoriale': 'Piano Editoriale',
  'seo-audit': 'SEO Audit',
  'blog-articolo': 'Blog SEO',
}

// Default: modello testo free di OpenRouter (nessun costo, serve solo la key).
const DEFAULT_MODEL = 'google/gemma-4-31b-it:free'

const TASK_RECOMMENDED: Record<Task, string> = {
  'contenuti-social': DEFAULT_MODEL,
  'piano-editoriale': DEFAULT_MODEL,
  'seo-audit':        DEFAULT_MODEL,
  'blog-articolo':    DEFAULT_MODEL,
}

const TASK_WHY: Record<Task, string> = {
  'contenuti-social': 'Modello testo OpenRouter. Il free tier (Llama 3.3 70B) è gratis; per la vision (leggere le foto) scegli un modello vision con credito.',
  'piano-editoriale': 'Serve output ampio: un modello con contesto/output grande evita il troncamento del JSON del piano.',
  'seo-audit':        'Analisi lunghe: preferisci un modello con buon contesto. Il free tier basta per la maggior parte dei casi.',
  'blog-articolo':    'Articoli long-form: modello con output ampio. Free per iniziare, a pagamento per qualità superiore.',
}

// Fallback se il catalogo live non è raggiungibile: id verificati (stessi della
// cascade backend) + un modello immagini di default.
const OPENROUTER_FALLBACK: Model[] = [
  { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B', free: true, context: '262K', category: 'text', badge: 'Affidabile', recommendedFor: ['contenuti-social', 'piano-editoriale', 'seo-audit', 'blog-articolo'] },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'NVIDIA Nemotron 3 Super 120B', free: true, context: '1M', category: 'text' },
  { id: 'openai/gpt-oss-20b:free', name: 'OpenAI gpt-oss-20b', free: true, context: '131K', category: 'text' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', free: false, context: '1M', vision: true, category: 'text', badge: 'Vision · crediti' },
  { id: 'google/gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', free: false, context: '—', category: 'image', badge: 'Genera immagini' },
]

// Quanti modelli A PAGAMENTO (testo) mostrare senza ricerca attiva.
const PAID_VISIBLE_DEFAULT = 40

// Modello salvato da versioni precedenti (provider rimossi) → si torna al default.
function isLegacyModel(id: string): boolean {
  return /^(gemini[-.]|agnes-|claude-|opencode\/|ollama\/)/i.test(id)
}

export default function AIModelSelector({ task }: { task?: Task }) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(DEFAULT_MODEL)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [orKey, setOrKey] = useState('')
  const [savedKey, setSavedKey] = useState('')
  const [search, setSearch] = useState('')
  const [orModels, setOrModels] = useState<Model[] | null>(null)
  const [orCatalogError, setOrCatalogError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = localStorage.getItem('openrouter_key') || ''
    setSavedKey(key)
    setOrKey(key)
    const storedModel = localStorage.getItem('ai_model') || ''
    const safeModel = (!storedModel || isLegacyModel(storedModel)) ? DEFAULT_MODEL : storedModel
    if (safeModel !== storedModel) localStorage.setItem('ai_model', safeModel)
    setSelectedId(safeModel)
  }, [task])

  // Catalogo OpenRouter LIVE (proxy con cache 1h lato server).
  useEffect(() => {
    let cancelled = false
    fetch('/api/system/openrouter-models')
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        if (d?.ok && Array.isArray(d.models) && d.models.length) {
          setOrModels((d.models as Array<{ id: string; name: string; context: string; free: boolean; vision: boolean; category: Category }>).map(m => ({
            id: m.id, name: m.name, free: m.free, context: m.context, vision: m.vision, category: m.category || 'text',
          })))
          setOrCatalogError('')
        } else {
          setOrModels(null)
          setOrCatalogError(String(d?.error || 'catalogo non disponibile'))
        }
      })
      .catch(e => { if (!cancelled) { setOrModels(null); setOrCatalogError(e instanceof Error ? e.message : 'rete') } })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const list = orModels ?? OPENROUTER_FALLBACK
  const selected: Model = list.find(m => m.id === selectedId) ?? {
    id: selectedId, name: selectedId, free: selectedId.endsWith(':free'), context: 'n/d', category: 'text',
  }

  function selectModel(id: string) {
    setSelectedId(id)
    localStorage.setItem('ai_model', id)
    setOpen(false)
    setSearch('')
  }
  function saveKey() {
    localStorage.setItem('openrouter_key', orKey.trim())
    setSavedKey(orKey.trim())
    setShowKeyInput(false)
  }
  function removeKey() {
    localStorage.removeItem('openrouter_key')
    setOrKey(''); setSavedKey(''); setShowKeyInput(false)
  }

  const q = search.trim().toLowerCase()
  const match = (m: Model) => !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
  const textFree = list.filter(m => m.category === 'text' && m.free).filter(match)
  const textPaidAll = list.filter(m => m.category === 'text' && !m.free).filter(match)
  const textPaid = q ? textPaidAll : textPaidAll.slice(0, PAID_VISIBLE_DEFAULT)
  const textPaidHidden = q ? 0 : Math.max(0, textPaidAll.length - textPaid.length)
  const imageModels = list.filter(m => m.category === 'image').filter(match)

  const needsOrKey = !savedKey

  const recommendedId = task ? TASK_RECOMMENDED[task] : null
  const isOnRecommended = recommendedId === selectedId
  const taskModels = task
    ? OPENROUTER_FALLBACK.filter(m => m.recommendedFor?.includes(task)).slice(0, 3)
    : []

  const totalShown = textFree.length + textPaid.length + imageModels.length

  return (
    <div className="card p-4 md:p-5 mb-6 bg-gradient-to-br from-white to-gray-50 border-gray-100 overflow-visible">
      <div className="flex flex-col lg:flex-row lg:items-start lg:flex-wrap lg:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1 lg:min-w-[260px]">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            selected.category === 'image' ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Modello AI</p>
              {selected.badge && !(selected.badge.includes('Consigliato') && isOnRecommended) && (
                <span className="text-[10px] px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">{selected.badge}</span>
              )}
              {selected.free && (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">FREE</span>
              )}
              {selected.category === 'image' && (
                <span className="text-[10px] px-1.5 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded-full font-medium flex items-center gap-0.5">
                  <ImageIcon className="w-3 h-3" /> immagini
                </span>
              )}
              {selected.vision && (
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium flex items-center gap-0.5">
                  <Eye className="w-3 h-3" /> vision
                </span>
              )}
              {isOnRecommended && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Consigliato
                </span>
              )}
            </div>
            <p className="font-semibold text-gray-900 truncate">{selected.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">OpenRouter · contesto {selected.context}</p>
            {task && (
              <p className="text-[11px] text-amber-700 mt-1 leading-snug">{TASK_WHY[task]}</p>
            )}
          </div>
        </div>

        <div className="flex items-stretch sm:items-center gap-2 flex-shrink-0 flex-col sm:flex-row sm:flex-wrap w-full lg:w-auto">
          {!savedKey ? (
            <button onClick={() => setShowKeyInput(s => !s)} className="btn-secondary text-xs py-2 px-3 justify-center">
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OpenRouter Key</span>
            </button>
          ) : (
            <button onClick={() => setShowKeyInput(s => !s)} title="Cambia o rimuovi key OpenRouter" className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 hover:bg-green-100 whitespace-nowrap">
              <Check className="w-3 h-3" /> OpenRouter <span className="text-green-500">· modifica</span>
            </button>
          )}

          <div className="relative max-w-full w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setOpen(o => !o)}
              className="btn-primary text-xs py-2 px-3 min-w-0 sm:min-w-[140px] justify-between w-full sm:w-auto"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Cambia modello
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="fixed left-3 right-3 top-24 max-h-[calc(100vh-7rem)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px] sm:max-w-[360px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder={`Cerca tra ${list.length} modelli...`} autoFocus
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="max-h-[calc(100vh-12rem)] sm:max-h-[460px] overflow-y-auto overscroll-contain">
                  {task && taskModels.length > 0 && !q && (
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <p className="text-[10px] uppercase tracking-wide text-amber-700 font-bold mb-1">
                        Consigliati per {TASK_LABELS[task]}
                      </p>
                      <p className="text-[10px] text-gray-500 mb-2 leading-snug">{TASK_WHY[task]}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {taskModels.map(m => (
                          <button
                            key={m.id}
                            onClick={() => selectModel(m.id)}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-medium transition-colors text-left ${
                              m.id === selectedId
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : m.id === recommendedId
                                ? 'border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <span className="block font-semibold">{m.name}</span>
                            <span className="block text-[9px] text-gray-400">OpenRouter · {m.context}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {textFree.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-gray-50 sticky top-0 z-10 flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-700">Testo · Gratis</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold tracking-normal">
                          {orModels ? `${textFree.length} dal catalogo live` : `${textFree.length} · lista base`}
                        </span>
                      </div>
                      {textFree.map(m => (
                        <ModelOption key={m.id} m={m} selected={m.id === selectedId} recommended={m.id === recommendedId} onClick={() => selectModel(m.id)} />
                      ))}
                    </>
                  )}

                  {textPaid.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-emerald-50 sticky top-0 z-10 flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Testo · A pagamento</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold tracking-normal">serve credito</span>
                      </div>
                      {textPaid.map(m => (
                        <ModelOption key={m.id} m={m} selected={m.id === selectedId} recommended={m.id === recommendedId} onClick={() => selectModel(m.id)} />
                      ))}
                      {textPaidHidden > 0 && (
                        <p className="px-3 py-2 text-[10px] text-gray-400">
                          + altri {textPaidHidden} modelli testo a pagamento — usa la ricerca per trovarli.
                        </p>
                      )}
                    </>
                  )}

                  {imageModels.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-fuchsia-50 sticky top-0 z-10 flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-700">Immagini</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded-full font-bold tracking-normal">generano immagini · credito</span>
                      </div>
                      {imageModels.map(m => (
                        <ModelOption key={m.id} m={m} selected={m.id === selectedId} recommended={false} onClick={() => selectModel(m.id)} />
                      ))}
                      <p className="px-3 py-1.5 text-[10px] text-gray-400 border-b border-gray-50">
                        I modelli immagine sono a pagamento: la tua key OpenRouter deve avere credito. Supportano anche image-to-image dalla foto prodotto.
                      </p>
                    </>
                  )}

                  {totalShown === 0 && (
                    <div className="p-6 text-center text-xs text-gray-400">Nessun modello trovato per &ldquo;{search}&rdquo;</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {orCatalogError && (
        <div className="mt-3 flex items-start gap-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Catalogo OpenRouter live non raggiungibile ({orCatalogError}): mostro la lista base. I modelli restano utilizzabili.</span>
        </div>
      )}

      {needsOrKey && (
        <div className="mt-3 flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Aggiungi la tua OpenRouter API key per generare. I modelli :free non consumano credito; testo vision e immagini richiedono credito.</span>
        </div>
      )}

      {showKeyInput && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="label">OpenRouter API Key</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="password" value={orKey} onChange={e => setOrKey(e.target.value)} placeholder="sk-or-v1-..." className="input flex-1" />
            <button onClick={saveKey} className="btn-primary text-xs justify-center">Salva</button>
            {savedKey && <button onClick={removeKey} className="btn-secondary text-xs justify-center text-red-600">Rimuovi</button>}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Crea key su <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-brand-600 hover:underline">openrouter.ai/keys</a> — i modelli :free non consumano credito; per vision/immagini serve credito.
          </p>
        </div>
      )}
    </div>
  )
}

function ModelOption({ m, selected, recommended, onClick }: { m: Model; selected: boolean; recommended: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2.5 ${
        selected ? 'bg-brand-50' : recommended ? 'bg-amber-50/50' : ''
      }`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.category === 'image' ? 'bg-fuchsia-500' : m.free ? 'bg-green-500' : 'bg-emerald-600'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
          {m.badge && (
            <span className="text-[9px] px-1 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium flex-shrink-0">{m.badge}</span>
          )}
          {m.category === 'image' && <ImageIcon className="w-3 h-3 text-fuchsia-400 flex-shrink-0" />}
          {m.vision && <Eye className="w-3 h-3 text-indigo-400 flex-shrink-0" />}
          {recommended && <ThumbsUp className="w-3 h-3 text-amber-500 flex-shrink-0" />}
        </div>
        <p className="text-[10px] text-gray-400 truncate">
          {m.id} · {m.context}
          {m.recommendedFor?.length ? ` · ${m.recommendedFor.map(t => TASK_LABELS[t as Task] || t).join(', ')}` : ''}
        </p>
      </div>
      {selected && <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />}
    </button>
  )
}
