'use client'

export const DEFAULT_AI_MODEL = 'gemini-2.5-flash'
export const DEFAULT_OPENROUTER_MODEL = 'google/gemini-2.5-flash'

export const DEFAULT_AGNES_MODEL = 'agnes-2.0-flash'

// La UI offre Gemini nativo (gemini-*), Agnes AI (agnes-*) e OpenRouter: tutto
// ciò che non è gemini-*/agnes-* passa per OpenRouter e richiede la sua key.
function needsOpenRouterKey(model: string) {
  return !model.startsWith('gemini-') && !model.startsWith('agnes-')
}

// Modello salvato da versioni precedenti della UI (Anthropic/OpenCode/Ollama):
// provider non più offerti dal selettore → si migra al default Gemini.
function isLegacyModel(model: string) {
  return model.startsWith('claude-') || model.startsWith('opencode/') || model.startsWith('ollama/')
}

export function readAISettings() {
  if (typeof window === 'undefined') {
    return {
      model: DEFAULT_AI_MODEL,
      openrouter_key: undefined as string | undefined,
      gemini_key: undefined as string | undefined,
      agnes_key: undefined as string | undefined,
    }
  }

  const savedModel = localStorage.getItem('ai_model') || ''
  const openrouterKey = localStorage.getItem('openrouter_key')?.trim()
  const geminiKey = localStorage.getItem('gemini_key')?.trim()
  const agnesKey = localStorage.getItem('agnes_key')?.trim()
  let model = savedModel || (geminiKey ? DEFAULT_AI_MODEL : agnesKey ? DEFAULT_AGNES_MODEL : (openrouterKey ? DEFAULT_OPENROUTER_MODEL : DEFAULT_AI_MODEL))

  if (isLegacyModel(model)) model = DEFAULT_AI_MODEL
  // Modello Agnes salvato ma key rimossa (e nessuna env server garantita): il
  // backend proverebbe comunque AGNES_API_KEY server — ma dal client non lo
  // sappiamo, quindi restiamo sul modello scelto SOLO se la key c'è.
  if (model.startsWith('agnes-') && !agnesKey) model = geminiKey ? DEFAULT_AI_MODEL : model
  // Modello OpenRouter salvato ma key rimossa: non far fallire la generazione sul
  // provider sbagliato — torna al default Gemini (free tier).
  if (needsOpenRouterKey(model) && !openrouterKey) model = DEFAULT_AI_MODEL

  return {
    model,
    openrouter_key: openrouterKey || undefined,
    gemini_key: geminiKey || undefined,
    agnes_key: agnesKey || undefined,
  }
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
