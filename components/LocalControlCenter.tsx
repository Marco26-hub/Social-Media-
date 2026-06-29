'use client'
import { useEffect, useState, useCallback } from 'react'
import { Bot, Database, Send, RefreshCw, Power, Loader2 } from 'lucide-react'

type OllamaStatus = { running: boolean; models: string[] }
type EngineStatus = { configured: boolean; connected: boolean; schemaReady: boolean }
type SyncResult = { ok?: boolean; candidates?: number; synced?: number; failed?: number; error?: string; hint?: string }

function Dot({ ok }: { ok: boolean }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-400'}`} />
}

export default function LocalControlCenter() {
  const [ollama, setOllama] = useState<OllamaStatus | null>(null)
  const [engine, setEngine] = useState<EngineStatus | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [sync, setSync] = useState<SyncResult | null>(null)

  const loadOllama = useCallback(async () => {
    try {
      const r = await fetch('/api/system/local/ollama')
      setOllama(await r.json())
    } catch { setOllama({ running: false, models: [] }) }
  }, [])

  const loadEngine = useCallback(async () => {
    try {
      const r = await fetch('/api/system/local/engine')
      setEngine(await r.json())
    } catch { setEngine({ configured: false, connected: false, schemaReady: false }) }
  }, [])

  useEffect(() => { loadOllama(); loadEngine() }, [loadOllama, loadEngine])

  async function startOllama() {
    setBusy('ollama')
    try {
      await fetch('/api/system/local/ollama', { method: 'POST' })
      await loadOllama()
    } finally { setBusy(null) }
  }

  async function startEngine() {
    setBusy('engine')
    try {
      await fetch('/api/system/local/engine', { method: 'POST' })
      await loadEngine()
    } finally { setBusy(null) }
  }

  async function syncBlotato() {
    setBusy('sync'); setSync(null)
    try {
      const r = await fetch('/api/data/blotato-sync', { method: 'POST' })
      setSync(await r.json())
    } catch (e) {
      setSync({ error: (e as Error).message || 'Errore di rete' })
    } finally { setBusy(null) }
  }

  return (
    <div className="card p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Centro di Controllo</h2>
          <p className="text-xs text-gray-500">Motore AI locale (AIM) e dati — disponibile solo in ambiente locale</p>
        </div>
        <button onClick={() => { loadOllama(); loadEngine() }} className="btn-secondary text-xs py-1.5 px-3" title="Aggiorna stato">
          <RefreshCw className="w-3.5 h-3.5" /> Aggiorna
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* ── AI LOCALE (Ollama) ── */}
        <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-gray-900 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">AI Locale (AIM)</p>
              <p className="text-[10px] text-gray-500">Ollama · Mac</p>
            </div>
            {ollama && <Dot ok={ollama.running} />}
          </div>
          <p className="text-[11px] text-gray-600 mb-2 min-h-[28px]">
            {ollama === null ? 'Controllo…'
              : ollama.running
                ? `Attivo · ${ollama.models.length} modelli: ${ollama.models.slice(0, 3).join(', ')}${ollama.models.length > 3 ? '…' : ''}`
                : 'Spento — avvia per generare in locale, gratis e privato'}
          </p>
          <button
            onClick={startOllama}
            disabled={busy === 'ollama' || (ollama?.running ?? false)}
            className="btn-primary text-xs py-1.5 px-3 w-full justify-center disabled:opacity-50"
          >
            {busy === 'ollama' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
            {ollama?.running ? 'Attivo' : 'Avvia Ollama'}
          </button>
        </div>

        {/* ── MOTORE DATI (Neon) ── */}
        <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-blue-50/40 to-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Motore Dati</p>
              <p className="text-[10px] text-gray-500">Neon Postgres · cloud</p>
            </div>
            {engine && <Dot ok={engine.connected} />}
          </div>
          <p className="text-[11px] text-gray-600 mb-2 min-h-[28px]">
            {engine === null ? 'Controllo…'
              : !engine.configured ? 'DATABASE_URL non configurata'
                : engine.connected
                  ? `Connesso · schema ${engine.schemaReady ? 'pronto' : 'da inizializzare'}`
                  : 'Non raggiungibile — verifica connessione'}
          </p>
          <button
            onClick={startEngine}
            disabled={busy === 'engine'}
            className="btn-secondary text-xs py-1.5 px-3 w-full justify-center disabled:opacity-50"
          >
            {busy === 'engine' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Verifica / Inizializza
          </button>
        </div>

        {/* ── SINCRONIZZA BLOTATO ── */}
        <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-violet-50/40 to-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Sincronizza Blotato</p>
              <p className="text-[10px] text-gray-500">Approvati → pubblicazione</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-600 mb-2 min-h-[28px]">
            {sync === null ? 'Invia i contenuti APPROVATI a Blotato per programmarli sui social.'
              : sync.error ? <span className="text-red-600">{sync.error}{sync.hint ? ` — ${sync.hint}` : ''}</span>
                : <span className="text-green-700">{sync.synced}/{sync.candidates} sincronizzati{sync.failed ? `, ${sync.failed} errori` : ''}</span>}
          </p>
          <button
            onClick={syncBlotato}
            disabled={busy === 'sync'}
            className="btn-primary text-xs py-1.5 px-3 w-full justify-center disabled:opacity-50"
          >
            {busy === 'sync' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Sincronizza ora
          </button>
        </div>
      </div>
    </div>
  )
}
