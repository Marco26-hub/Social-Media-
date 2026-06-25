'use client'

import { useEffect, useState } from 'react'
import { Key, Check, ExternalLink, ShieldCheck } from 'lucide-react'

export default function OpenRouterKeyInput() {
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_key') || ''
    setKey(savedKey)
    if (savedKey) setSaved(true)
  }, [])

  function saveKey() {
    localStorage.setItem('openrouter_key', key.trim())
    if (key.trim()) setSaved(true)
  }

  function clearKey() {
    localStorage.removeItem('openrouter_key')
    setKey('')
    setSaved(false)
  }

  return (
    <div className="card p-4 md:p-5 mb-6 bg-white border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
            <Key className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">OpenRouter API Key</p>
            <p className="text-[11px] text-gray-400">Usa modelli AI gratis (Nemotron, DeepSeek, Llama...)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved ? (
            <button onClick={clearKey} className="text-[10px] text-gray-400 hover:text-red-500 underline">
              Rimuovi
            </button>
          ) : (
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-[10px] text-brand-600 hover:underline inline-flex items-center gap-1">
              Crea key gratis <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {saved ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
          <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-green-800">Key salvata</p>
            <p className="text-[10px] text-green-600 truncate">
              {key.slice(0, 12)}...{key.slice(-4)}
            </p>
          </div>
          <button onClick={() => { setSaved(false); setShow(true) }} className="text-[10px] text-green-700 hover:underline flex-shrink-0">
            Cambia
          </button>
        </div>
      ) : show ? (
        <div className="flex gap-2">
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-or-v1-..."
            autoFocus
            className="input flex-1 text-sm"
          />
          <button onClick={saveKey} disabled={!key.trim()} className="btn-primary text-xs px-4">Salva</button>
          <button onClick={() => setShow(false)} className="btn-secondary text-xs">Annulla</button>
        </div>
      ) : (
        <button onClick={() => setShow(true)} className="btn-secondary w-full justify-center text-xs py-3 border-dashed">
          <Key className="w-3.5 h-3.5" />
          Inserisci API Key OpenRouter
        </button>
      )}
    </div>
  )
}
