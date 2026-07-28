'use client'

// Default: modello testo free di OpenRouter (nessun costo, serve solo la key).
export const DEFAULT_AI_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'

// Modello salvato da versioni precedenti della UI (provider rimossi:
// Gemini-nativo/Agnes/Anthropic/OpenCode/Ollama) → si migra al default OpenRouter.
function isLegacyModel(model: string) {
  return /^(gemini[-.]|agnes-|claude-|opencode\/|ollama\/)/i.test(model)
}

// Impostazioni AI lato client: SOLO OpenRouter (chiave per-browser). Il modello e la
// key vivono in localStorage; la chiamata li invia al server, che le valida.
export function readAISettings() {
  if (typeof window === 'undefined') {
    return { model: DEFAULT_AI_MODEL, openrouter_key: undefined as string | undefined }
  }
  const savedModel = localStorage.getItem('ai_model') || ''
  const openrouterKey = localStorage.getItem('openrouter_key')?.trim()
  const model = (!savedModel || isLegacyModel(savedModel)) ? DEFAULT_AI_MODEL : savedModel
  if (model !== savedModel) localStorage.setItem('ai_model', model)
  return { model, openrouter_key: openrouterKey || undefined }
}

export async function readApiError(response: Response, fallback: string) {
  try {
    const data = await response.clone().json()
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (typeof data?.message === 'string' && data.message.trim()) return data.message
  } catch {
    try {
      const text = await response.text()
      const trimmed = text.trim()
      // Non rovesciare l'HTML di una pagina d'errore gateway (502/504).
      if (/^\s*<|<!doctype|<html/i.test(trimmed)) {
        if (response.status === 502 || response.status === 504) {
          return 'Operazione troppo lunga, interrotta dal server (timeout). Riprova.'
        }
        return `Errore server (${response.status || 'rete'}). Riprova tra poco.`
      }
      if (trimmed) return trimmed.slice(0, 500)
    } catch {
      // keep fallback
    }
  }

  return fallback
}

export async function assertApiOk(response: Response, fallback: string) {
  if (response.ok) return
  throw new Error(await readApiError(response, fallback))
}
