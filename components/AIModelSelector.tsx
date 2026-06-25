'use client'
import { useEffect, useState, useRef } from 'react'
import { Sparkles, Check, ChevronDown, Key, Zap, AlertCircle, Search } from 'lucide-react'

type Model = {
  id: string
  name: string
  provider: 'anthropic' | 'openrouter'
  tier: 'default' | 'free' | 'paid'
  context: string
  speed: 'fast' | 'medium' | 'slow'
  quality: 'top' | 'high' | 'medium'
  badge?: string
}

const MODELS: Model[] = [
  // Default — Claude
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'anthropic', tier: 'default', context: '200K', speed: 'fast',   quality: 'top',  badge: 'Tuo default' },
  { id: 'claude-opus-4-7',   name: 'Claude Opus 4.7',   provider: 'anthropic', tier: 'default', context: '200K', speed: 'medium', quality: 'top',  badge: 'Premium' },
  { id: 'claude-haiku-4-5',  name: 'Claude Haiku 4.5',  provider: 'anthropic', tier: 'default', context: '200K', speed: 'fast',   quality: 'high', badge: 'Veloce' },

  // OpenRouter Free — top
  { id: 'nvidia/nemotron-3.5-content-safety:free', name: 'NVIDIA Nemotron 3.5 Safety', provider: 'openrouter', tier: 'free', context: '131K', speed: 'fast',   quality: 'high', badge: 'Content Safety' },
  { id: 'nvidia/nemotron-3-super:free',       name: 'NVIDIA Nemotron 3 Super', provider: 'openrouter', tier: 'free', context: '1M',   speed: 'medium', quality: 'top',  badge: 'Consigliato' },
  { id: 'deepseek/deepseek-v4-flash:free',    name: 'DeepSeek V4 Flash',       provider: 'openrouter', tier: 'free', context: '1M',   speed: 'fast',   quality: 'high' },
  { id: 'openai/gpt-oss-120b:free',           name: 'OpenAI gpt-oss-120b',     provider: 'openrouter', tier: 'free', context: '131K', speed: 'medium', quality: 'high' },
  { id: 'z-ai/glm-4.5-air:free',              name: 'Z.ai GLM 4.5 Air',        provider: 'openrouter', tier: 'free', context: '131K', speed: 'fast',   quality: 'high' },
  { id: 'google/gemma-4-31b:free',            name: 'Google Gemma 4 31B',      provider: 'openrouter', tier: 'free', context: '262K', speed: 'fast',   quality: 'high' },
  { id: 'minimax/minimax-m2.5:free',          name: 'MiniMax M2.5',            provider: 'openrouter', tier: 'free', context: '204K', speed: 'medium', quality: 'high' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B',       provider: 'openrouter', tier: 'free', context: '128K', speed: 'medium', quality: 'high' },
  { id: 'qwen/qwen-2.5-72b-instruct:free',    name: 'Qwen 2.5 72B',            provider: 'openrouter', tier: 'free', context: '32K',  speed: 'medium', quality: 'high' },
  { id: 'mistralai/mistral-nemo:free',        name: 'Mistral Nemo',            provider: 'openrouter', tier: 'free', context: '128K', speed: 'fast',   quality: 'medium' },
]

const QUALITY_DOT: Record<string, string> = {
  top:    'bg-violet-500',
  high:   'bg-blue-500',
  medium: 'bg-gray-400',
}

export default function AIModelSelector() {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('claude-sonnet-4-6')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [orKey, setOrKey] = useState('')
  const [savedKey, setSavedKey] = useState('')
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setSelectedId(localStorage.getItem('ai_model') || 'claude-sonnet-4-6')
    const key = localStorage.getItem('openrouter_key') || ''
    setSavedKey(key)
    setOrKey(key)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const selected = MODELS.find(m => m.id === selectedId) ?? MODELS[0]

  function selectModel(id: string) {
    setSelectedId(id)
    localStorage.setItem('ai_model', id)
    setOpen(false)
    setSearch('')
  }

  function saveKey() {
    localStorage.setItem('openrouter_key', orKey)
    setSavedKey(orKey)
    setShowKeyInput(false)
  }

  const filtered = MODELS.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase())
  )
  const anthropicModels = filtered.filter(m => m.provider === 'anthropic')
  const freeModels = filtered.filter(m => m.tier === 'free')
  const needsOrKey = selected.provider === 'openrouter' && !savedKey

  return (
    <div className="card p-4 md:p-5 mb-6 bg-gradient-to-br from-white to-gray-50 border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Sinistra: modello attuale */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            selected.provider === 'anthropic' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Modello AI</p>
              {selected.badge && (
                <span className="text-[10px] px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">{selected.badge}</span>
              )}
              {selected.tier === 'free' && (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">FREE</span>
              )}
            </div>
            <p className="font-semibold text-gray-900 truncate">{selected.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {selected.provider === 'anthropic' ? 'Anthropic' : 'OpenRouter'} · {selected.context} · {selected.speed} · {selected.quality}
            </p>
          </div>
        </div>

        {/* Destra: bottoni */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!savedKey ? (
            <button onClick={() => setShowKeyInput(s => !s)} className="btn-secondary text-xs py-2 px-3">
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OpenRouter</span>
            </button>
          ) : (
            <span className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> OpenRouter
            </span>
          )}

          {/* Dropdown menu trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(o => !o)}
              className="btn-primary text-xs py-2 px-3 min-w-[140px] justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Cambia modello
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-[340px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Cerca modello..."
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {/* Anthropic */}
                  {anthropicModels.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-gray-50 sticky top-0 z-10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                          Anthropic · Premium
                        </p>
                      </div>
                      {anthropicModels.map(m => (
                        <ModelOption key={m.id} m={m} selected={m.id === selectedId} onClick={() => selectModel(m.id)} />
                      ))}
                    </>
                  )}

                  {/* OpenRouter free */}
                  {freeModels.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-gray-50 sticky top-0 z-10 flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                          OpenRouter · Gratis
                        </p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold tracking-normal">
                          {freeModels.length} modelli
                        </span>
                      </div>
                      {freeModels.map(m => (
                        <ModelOption key={m.id} m={m} selected={m.id === selectedId} onClick={() => selectModel(m.id)} />
                      ))}
                    </>
                  )}

                  {filtered.length === 0 && (
                    <div className="p-6 text-center text-xs text-gray-400">
                      Nessun modello trovato per &ldquo;{search}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning OpenRouter key */}
      {needsOrKey && (
        <div className="mt-3 flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Modello OpenRouter selezionato — aggiungi API key per usarlo</span>
        </div>
      )}

      {/* Input API key */}
      {showKeyInput && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="label">OpenRouter API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={orKey}
              onChange={e => setOrKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="input flex-1"
            />
            <button onClick={saveKey} className="btn-primary text-xs">Salva</button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Crea key gratis su <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-brand-600 hover:underline">openrouter.ai/keys</a>
          </p>
        </div>
      )}
    </div>
  )
}

function ModelOption({ m, selected, onClick }: { m: Model; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2.5 ${
        selected ? 'bg-brand-50' : ''
      }`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${QUALITY_DOT[m.quality]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
          {m.badge && (
            <span className="text-[9px] px-1 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium flex-shrink-0">
              {m.badge}
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 truncate">
          {m.context} · {m.speed} · qualità {m.quality}
        </p>
      </div>
      {selected && <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />}
    </button>
  )
}
