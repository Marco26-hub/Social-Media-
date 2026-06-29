import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { isLocalEnv, ollamaBaseUrl } from '@/lib/local-only'

export const dynamic = 'force-dynamic'

const BASE = ollamaBaseUrl()

// Interroga Ollama: attivo? quali modelli installati?
async function probe(timeoutMs = 1500): Promise<{ running: boolean; models: string[] }> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}/api/tags`, { signal: controller.signal })
    if (!res.ok) return { running: false, models: [] }
    const data = await res.json()
    const models = Array.isArray(data?.models)
      ? data.models.map((m: { name?: string }) => m.name).filter(Boolean)
      : []
    return { running: true, models }
  } catch {
    return { running: false, models: [] }
  } finally {
    clearTimeout(t)
  }
}

// GET — stato Ollama locale
export async function GET() {
  const status = await probe()
  return NextResponse.json({ ...status, baseUrl: BASE })
}

// POST — avvia "ollama serve" in background (solo ambiente locale)
export async function POST() {
  if (!isLocalEnv()) {
    return NextResponse.json(
      { error: 'Disponibile solo in ambiente locale (non in produzione).' },
      { status: 403 },
    )
  }

  // Già attivo?
  const pre = await probe()
  if (pre.running) {
    return NextResponse.json({ started: false, already: true, ...pre })
  }

  // Avvia detached: sopravvive alla richiesta, non blocca il processo Next.
  try {
    const child = spawn('ollama', ['serve'], { detached: true, stdio: 'ignore' })
    child.unref()
    child.on('error', () => {}) // l'errore ENOENT lo rileviamo col poll sotto
  } catch {
    return NextResponse.json(
      { error: 'Comando "ollama" non trovato nel PATH — installa Ollama (ollama.com).' },
      { status: 500 },
    )
  }

  // Poll /api/version finché risponde (max ~5s)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500))
    const s = await probe(800)
    if (s.running) return NextResponse.json({ started: true, ...s })
  }

  return NextResponse.json(
    { started: false, error: 'Ollama non ha risposto entro 5s. Verifica l\'installazione o avvia "ollama serve" manualmente.' },
    { status: 504 },
  )
}
