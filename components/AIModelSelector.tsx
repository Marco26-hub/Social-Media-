'use client'
import { useEffect, useState, useRef } from 'react'
import { Sparkles, Check, ChevronDown, Key, Zap, AlertCircle, Search, ThumbsUp, Eye } from 'lucide-react'

// Selettore modello RISTRETTO a tre provider:
// - Google Gemini: famiglia Flash del free tier (key gratuita su AI Studio).
// - Agnes AI: gateway apihub.agnes-ai.com — modelli flash testo (2.0/1.5); la
//   stessa key abilita anche generazione immagini (agnes-image-2.1-flash) e video.
// - OpenRouter: catalogo caricato LIVE dall'API (/api/system/openrouter-models),
//   così la lista è quella reale e non una hardcoded che invecchia. Se l'API non
//   risponde si usa un fallback curato (gli stessi id della cascade backend).
// Anthropic diretto / OpenCode / Ollama restano supportati dal backend (lib/ai.ts)
// ma NON sono più offerti dalla UI: troppa superficie di scelta e key diverse.

type Provider = 'openrouter' | 'gemini' | 'agnes'

type Model = {
  id: string
  name: string
  provider: Provider
  free: boolean
  context: string
  vision?: boolean
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

// Default qualità-first: Gemini 2.5 Flash nativo (key Google gratuita, vede le
// immagini prodotto, 65K output). OpenRouter è l'alternativa per chi ha key/crediti.
const GEMINI_25 = 'gemini-2.5-flash'

const TASK_RECOMMENDED: Record<Task, string> = {
  'contenuti-social': GEMINI_25,
  'piano-editoriale': GEMINI_25,
  'seo-audit':        GEMINI_25,
  'blog-articolo':    GEMINI_25,
}

// "Perché" mostrato in UI: spiega la logica della raccomandazione per task.
const TASK_WHY: Record<Task, string> = {
  'contenuti-social': 'Gemini 2.5 Flash nativo: vede le foto prodotto (vision), veloce, key Google gratuita. OpenRouter resta opzionale.',
  'piano-editoriale': 'Gemini 2.5 Flash: 1M contesto + 65K output → il JSON del piano non tronca. Key Google gratuita.',
  'seo-audit':        'Gemini 2.5 Flash: contesto 1M + output ampio per analisi lunghe. In alternativa un modello OpenRouter con la tua key.',
  'blog-articolo':    'Gemini 2.5 Flash: 65K output per articoli long-form senza troncamento. In alternativa un modello OpenRouter con la tua key.',
}

// Google Gemini — SOLO famiglia Flash disponibile nel free tier di AI Studio.
const GEMINI_MODELS: Model[] = [
  { id: 'gemini-2.5-flash',      name: 'Gemini 2.5 Flash',      provider: 'gemini', free: true, context: '1M', vision: true, badge: '★ Consigliato · 65K output', recommendedFor: ['contenuti-social', 'piano-editoriale', 'seo-audit', 'blog-articolo'] },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'gemini', free: true, context: '1M', vision: true, badge: 'Veloce+' },
  { id: 'gemini-2.0-flash',      name: 'Gemini 2.0 Flash',      provider: 'gemini', free: true, context: '1M', vision: true, badge: 'Stabile', recommendedFor: ['contenuti-social'] },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', provider: 'gemini', free: true, context: '1M', vision: true, badge: 'Economico' },
  { id: 'gemini-1.5-flash',      name: 'Gemini 1.5 Flash',      provider: 'gemini', free: true, context: '1M', vision: true },
]

// Agnes AI — modelli TESTO del catalogo reale della key (GET /v1/models). I modelli
// media della stessa key (agnes-image-2.1-flash, agnes-video-v2.0) non stanno qui:
// li usa la generazione immagini/video, non il copy.
const AGNES_MODELS: Model[] = [
  { id: 'agnes-2.0-flash', name: 'Agnes 2.0 Flash', provider: 'agnes', free: false, context: 'n/d', badge: '★ Testo · stessa key per immagini/video', recommendedFor: ['contenuti-social', 'piano-editoriale'] },
  { id: 'agnes-1.5-flash', name: 'Agnes 1.5 Flash', provider: 'agnes', free: false, context: 'n/d', badge: 'Veloce' },
]

// Fallback OpenRouter se il catalogo live non è raggiungibile: gli stessi modelli
// free della cascade backend (lib/ai.ts FALLBACK_MODELS) — id verificati, non inventati.
const OPENROUTER_FALLBACK: Model[] = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B',    provider: 'openrouter', free: true, context: '128K', badge: 'Affidabile', recommendedFor: ['contenuti-social', 'piano-editoriale', 'seo-audit', 'blog-articolo'] },
  { id: 'openai/gpt-oss-120b:free',               name: 'OpenAI gpt-oss-120b', provider: 'openrouter', free: true, context: '131K' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free',  name: 'Qwen3 Next 80B',   provider: 'openrouter', free: true, context: '262K' },
  { id: 'google/gemma-4-31b-it:free',             name: 'Google Gemma 4 31B', provider: 'openrouter', free: true, context: '262K' },
  { id: 'google/gemini-2.5-flash',                name: 'Gemini 2.5 Flash · OpenRouter', provider: 'openrouter', free: false, context: '1M', vision: true, badge: 'Vision · crediti OR' },
]

// Quanti modelli A PAGAMENTO mostrare senza ricerca attiva (il catalogo completo
// supera i 300: si trovano tutti con la ricerca, la lista base resta leggibile).
const PAID_VISIBLE_DEFAULT = 40

function providerOf(id: string): Provider {
  if (id.startsWith('gemini-')) return 'gemini'
  if (id.startsWith('agnes-')) return 'agnes'
  return 'openrouter'
}

// Modello legacy (Anthropic/OpenCode/Ollama) salvato da versioni precedenti della
// UI: non più offerto → si torna al default. Il backend li accetterebbe ancora, ma
// la UI non deve rimandare l'utente su provider senza key input.
function isLegacyModel(id: string): boolean {
  return id.startsWith('claude-') || id.startsWith('opencode/') || id.startsWith('ollama/')
}

export default function AIModelSelector({ task }: { task?: Task }) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(GEMINI_25)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [orKey, setOrKey] = useState('')
  const [savedKey, setSavedKey] = useState('')
  const [showGemInput, setShowGemInput] = useState(false)
  const [gemKey, setGemKey] = useState('')
  const [savedGemKey, setSavedGemKey] = useState('')
  const [showAgnesInput, setShowAgnesInput] = useState(false)
  const [agnesKey, setAgnesKey] = useState('')
  const [savedAgnesKey, setSavedAgnesKey] = useState('')
  const [search, setSearch] = useState('')
  const [orModels, setOrModels] = useState<Model[] | null>(null)
  const [orCatalogError, setOrCatalogError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = localStorage.getItem('openrouter_key') || ''
    setSavedKey(key)
    setOrKey(key)
    const gk = localStorage.getItem('gemini_key') || ''
    setSavedGemKey(gk)
    setGemKey(gk)
    const ak = localStorage.getItem('agnes_key') || ''
    setSavedAgnesKey(ak)
    setAgnesKey(ak)
    const storedModel = localStorage.getItem('ai_model') || ''
    // Migrazione: modello legacy o modello OpenRouter senza key → default Gemini.
    const invalid = !storedModel || isLegacyModel(storedModel) || (providerOf(storedModel) === 'openrouter' && !key)
    const safeModel = invalid ? GEMINI_25 : storedModel
    if (safeModel !== storedModel) localStorage.setItem('ai_model', safeModel)
    setSelectedId(safeModel)
  }, [task])

  // Catalogo OpenRouter LIVE (proxy con cache 1h lato server). In errore si resta
  // sul fallback curato e si mostra il perché — niente lista finta spacciata per live.
  useEffect(() => {
    let cancelled = false
    fetch('/api/system/openrouter-models')
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        if (d?.ok && Array.isArray(d.models) && d.models.length) {
          setOrModels((d.models as Array<{ id: string; name: string; context: string; free: boolean; vision: boolean }>).map(m => ({
            id: m.id, name: m.name, provider: 'openrouter' as const,
            free: m.free, context: m.context, vision: m.vision,
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const openRouterList = orModels ?? OPENROUTER_FALLBACK
  const allModels: Model[] = [...GEMINI_MODELS, ...AGNES_MODELS, ...openRouterList]
  const selected: Model = allModels.find(m => m.id === selectedId) ?? {
    // Modello salvato non (più) nel catalogo: lo mostriamo comunque com'è invece di
    // fingere che sia un altro — la generazione lo passa al backend tal quale.
    id: selectedId, name: selectedId, provider: providerOf(selectedId), free: selectedId.endsWith(':free'), context: 'n/d',
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

  function saveGemKey() {
    localStorage.setItem('gemini_key', gemKey.trim())
    setSavedGemKey(gemKey.trim())
    setShowGemInput(false)
  }

  function removeKey() {
    localStorage.removeItem('openrouter_key')
    setOrKey(''); setSavedKey(''); setShowKeyInput(false)
    // Senza key i modelli OpenRouter non girano: se ne era selezionato uno, default Gemini.
    if (providerOf(selectedId) === 'openrouter') selectModel(GEMINI_25)
  }
  function removeGemKey() {
    localStorage.removeItem('gemini_key')
    setGemKey(''); setSavedGemKey(''); setShowGemInput(false)
  }
  function saveAgnesKey() {
    localStorage.setItem('agnes_key', agnesKey.trim())
    setSavedAgnesKey(agnesKey.trim())
    setShowAgnesInput(false)
  }
  function removeAgnesKey() {
    localStorage.removeItem('agnes_key')
    setAgnesKey(''); setSavedAgnesKey(''); setShowAgnesInput(false)
    // Senza key i modelli Agnes non girano dal client: torna al default Gemini.
    if (providerOf(selectedId) === 'agnes') selectModel(GEMINI_25)
  }

  const q = search.trim().toLowerCase()
  const match = (m: Model) => !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
  const geminiModels = GEMINI_MODELS.filter(match)
  const agnesModels = AGNES_MODELS.filter(match)
  const orFree = openRouterList.filter(m => m.free).filter(match)
  const orPaidAll = openRouterList.filter(m => !m.free).filter(match)
  // Senza ricerca: primi N a pagamento (i più recenti, l'API li ordina così) per
  // non esplodere la dropdown; la ricerca copre l'intero catalogo.
  const orPaid = q ? orPaidAll : orPaidAll.slice(0, PAID_VISIBLE_DEFAULT)
  const orPaidHidden = q ? 0 : Math.max(0, orPaidAll.length - orPaid.length)

  const needsOrKey = selected.provider === 'openrouter' && !savedKey
  const needsGemKey = selected.provider === 'gemini' && !savedGemKey
  const needsAgnesKey = selected.provider === 'agnes' && !savedAgnesKey

  const recommendedId = task ? TASK_RECOMMENDED[task] : null
  const isOnRecommended = recommendedId === selectedId

  const taskModels = task
    ? [...GEMINI_MODELS, ...OPENROUTER_FALLBACK].filter(m => m.recommendedFor?.includes(task)).slice(0, 3)
    : []

  const totalShown = geminiModels.length + agnesModels.length + orFree.length + orPaid.length

  return (
    <div className="card p-4 md:p-5 mb-6 bg-gradient-to-br from-white to-gray-50 border-gray-100 overflow-visible">
      <div className="flex flex-col lg:flex-row lg:items-start lg:flex-wrap lg:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1 lg:min-w-[260px]">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            selected.provider === 'gemini'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
              : selected.provider === 'agnes'
              ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
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
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {selected.provider === 'gemini' ? 'Google Gemini · key gratuita' : selected.provider === 'agnes' ? 'Agnes AI · apihub.agnes-ai.com' : 'OpenRouter · via API'} · contesto {selected.context}
            </p>
            {task && (
              <p className="text-[11px] text-amber-700 mt-1 leading-snug">{TASK_WHY[task]}</p>
            )}
          </div>
        </div>

        <div className="flex items-stretch sm:items-center gap-2 flex-shrink-0 flex-col sm:flex-row sm:flex-wrap w-full lg:w-auto">
          {!savedKey ? (
            <button onClick={() => setShowKeyInput(s => !s)} className="btn-secondary text-xs py-2 px-3 justify-center">
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OpenRouter</span>
            </button>
          ) : (
            <button onClick={() => setShowKeyInput(s => !s)} title="Cambia o rimuovi key OpenRouter" className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 hover:bg-green-100 whitespace-nowrap">
              <Check className="w-3 h-3" /> OpenRouter <span className="text-green-500">· modifica</span>
            </button>
          )}

          {!savedGemKey ? (
            <button onClick={() => setShowGemInput(s => !s)} className="btn-secondary text-xs py-2 px-3 justify-center">
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gemini</span>
            </button>
          ) : (
            <button onClick={() => setShowGemInput(s => !s)} title="Cambia o rimuovi key Gemini" className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 hover:bg-blue-100 whitespace-nowrap">
              <Check className="w-3 h-3" /> Gemini <span className="text-blue-400">· modifica</span>
            </button>
          )}

          {!savedAgnesKey ? (
            <button onClick={() => setShowAgnesInput(s => !s)} className="btn-secondary text-xs py-2 px-3 justify-center">
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agnes AI</span>
            </button>
          ) : (
            <button onClick={() => setShowAgnesInput(s => !s)} title="Cambia o rimuovi key Agnes AI" className="text-xs text-fuchsia-700 bg-fuchsia-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 hover:bg-fuchsia-100 whitespace-nowrap">
              <Check className="w-3 h-3" /> Agnes AI <span className="text-fuchsia-400">· modifica</span>
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
                      placeholder={`Cerca tra ${GEMINI_MODELS.length + AGNES_MODELS.length + openRouterList.length} modelli...`} autoFocus
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="max-h-[calc(100vh-12rem)] sm:max-h-[460px] overflow-y-auto overscroll-contain">
                  {/* Consigliati per task */}
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
                            <span className="block text-[9px] text-gray-400">{m.provider === 'gemini' ? 'Gemini' : 'OpenRouter'} · {m.context}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {geminiModels.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-gray-50 sticky top-0 z-10 flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Google Gemini · Flash</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold tracking-normal">free · key gratuita</span>
                      </div>
                      {geminiModels.map(m => (
                        <ModelOption
                          key={m.id} m={m} selected={m.id === selectedId}
                          recommended={m.id === recommendedId}
                          onClick={() => selectModel(m.id)}
                        />
                      ))}
                    </>
                  )}

                  {agnesModels.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-gray-50 sticky top-0 z-10 flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-700">Agnes AI · Flash</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded-full font-bold tracking-normal">testo + immagini + video</span>
                      </div>
                      {agnesModels.map(m => (
                        <ModelOption
                          key={m.id} m={m} selected={m.id === selectedId}
                          recommended={m.id === recommendedId}
                          onClick={() => selectModel(m.id)}
                        />
                      ))}
                      <p className="px-3 py-1.5 text-[10px] text-gray-400 border-b border-gray-50">
                        La key Agnes abilita anche <span className="font-mono">agnes-image-2.1-flash</span> (immagini contenuti) e <span className="font-mono">agnes-video-v2.0</span>.
                      </p>
                    </>
                  )}

                  {orFree.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-gray-50 sticky top-0 z-10 flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-700">OpenRouter · Gratis</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold tracking-normal">
                          {orModels ? `${orFree.length} dal catalogo live` : `${orFree.length} · lista base`}
                        </span>
                      </div>
                      {orFree.map(m => (
                        <ModelOption
                          key={m.id} m={m} selected={m.id === selectedId}
                          recommended={m.id === recommendedId}
                          onClick={() => selectModel(m.id)}
                        />
                      ))}
                    </>
                  )}

                  {orPaid.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-emerald-50 sticky top-0 z-10 flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">OpenRouter · A pagamento</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold tracking-normal">serve credito</span>
                      </div>
                      {orPaid.map(m => (
                        <ModelOption
                          key={m.id} m={m} selected={m.id === selectedId}
                          recommended={m.id === recommendedId}
                          onClick={() => selectModel(m.id)}
                        />
                      ))}
                      {orPaidHidden > 0 && (
                        <p className="px-3 py-2 text-[10px] text-gray-400">
                          + altri {orPaidHidden} modelli a pagamento — usa la ricerca per trovarli.
                        </p>
                      )}
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
          <span>Modello OpenRouter selezionato — aggiungi la API key per usarlo</span>
        </div>
      )}

      {needsGemKey && (
        <div className="mt-3 flex items-start gap-2 text-xs bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-blue-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Modello Gemini selezionato — aggiungi la API key Google (gratis) per usarlo</span>
        </div>
      )}

      {needsAgnesKey && (
        <div className="mt-3 flex items-start gap-2 text-xs bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-2.5 text-fuchsia-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Modello Agnes AI selezionato — aggiungi la API key (sk-...) per usarlo</span>
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
            Crea key gratis su <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-brand-600 hover:underline">openrouter.ai/keys</a> — i modelli :free non consumano credito.
          </p>
        </div>
      )}

      {showGemInput && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="label">Google Gemini API Key</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="password" value={gemKey} onChange={e => setGemKey(e.target.value)} placeholder="AIza..." className="input flex-1" />
            <button onClick={saveGemKey} className="btn-primary text-xs justify-center">Salva</button>
            {savedGemKey && <button onClick={removeGemKey} className="btn-secondary text-xs justify-center text-red-600">Rimuovi</button>}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Crea key gratis su <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-brand-600 hover:underline">aistudio.google.com/apikey</a>
          </p>
        </div>
      )}

      {showAgnesInput && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="label">Agnes AI API Key</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="password" value={agnesKey} onChange={e => setAgnesKey(e.target.value)} placeholder="sk-..." className="input flex-1" />
            <button onClick={saveAgnesKey} className="btn-primary text-xs justify-center">Salva</button>
            {savedAgnesKey && <button onClick={removeAgnesKey} className="btn-secondary text-xs justify-center text-red-600">Rimuovi</button>}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Endpoint <span className="font-mono">apihub.agnes-ai.com</span> — la stessa key abilita testo (agnes-2.0-flash), immagini (agnes-image-2.1-flash) e video (agnes-video-v2.0).
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
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.provider === 'gemini' ? 'bg-blue-500' : m.provider === 'agnes' ? 'bg-fuchsia-500' : m.free ? 'bg-green-500' : 'bg-emerald-600'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
          {m.badge && (
            <span className="text-[9px] px-1 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium flex-shrink-0">{m.badge}</span>
          )}
          {m.vision && (
            <Eye className="w-3 h-3 text-indigo-400 flex-shrink-0" />
          )}
          {recommended && (
            <ThumbsUp className="w-3 h-3 text-amber-500 flex-shrink-0" />
          )}
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
