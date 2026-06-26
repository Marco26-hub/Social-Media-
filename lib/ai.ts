const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const FALLBACK_MODELS = [
  'openrouter/free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'google/gemma-4-31b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'nvidia/nemotron-3-super:free',
  'claude-sonnet-4-6',
]

function isAnthropicModel(model: string) {
  return model.startsWith('claude-')
}

export async function callAI(params: {
  model: string
  systemPrompt?: string
  userPrompt: string
  openrouterKey?: string
  maxTokens?: number
  silentFallback?: boolean
}): Promise<string> {
  const { model, systemPrompt, userPrompt, maxTokens = 4000, silentFallback = true } = params
  const orKey = (params.openrouterKey || process.env.OPENROUTER_API_KEY || '').trim()
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || '').trim()

  const errors: string[] = []

  // Try 1: OpenRouter (if key available)
  if (orKey) {
    try {
      // Try requested model first
      const res = await callOpenRouter(model, systemPrompt, userPrompt, orKey, maxTokens)
      if (res) return res
    } catch (e) {
      errors.push(`OpenRouter(${model}): ${(e as Error).message}`)
      console.warn('[AI fallback]', errors[errors.length - 1])

      // Try fallback models on OpenRouter
      if (silentFallback) {
        for (const fb of FALLBACK_MODELS) {
          if (fb === model || isAnthropicModel(fb)) continue
          try {
            const res = await callOpenRouter(fb, systemPrompt, userPrompt, orKey, maxTokens)
            if (res) return res
          } catch {
            // continue to next fallback
          }
        }
      }
    }
  }

  // Try 2: Anthropic direct
  if (anthropicKey && isAnthropicModel(model)) {
    try {
      const res = await callAnthropic(model, systemPrompt, userPrompt, anthropicKey, maxTokens)
      if (res) return res
    } catch (e) {
      errors.push(`Anthropic: ${(e as Error).message}`)
      console.warn('[AI fallback]', errors[errors.length - 1])
    }
  } else if (anthropicKey && silentFallback) {
    // Try with Claude fallback on Anthropic
    try {
      const res = await callAnthropic('claude-sonnet-4-6', systemPrompt, userPrompt, anthropicKey, maxTokens)
      if (res) return res
    } catch {
      // silent
    }
  }

  // Give up
  const errMsg = errors.length > 0
    ? `AI generation failed after ${errors.length} attempt(s): ${errors.join('; ')}`
    : 'No AI provider configured. Aggiungi OPENROUTER_API_KEY o ANTHROPIC_API_KEY su Render, oppure incolla una OpenRouter API Key nella pagina.'
  throw new Error(errMsg)
}

async function callOpenRouter(
  model: string,
  systemPrompt: string | undefined,
  userPrompt: string,
  key: string,
  maxTokens: number,
): Promise<string> {
  const messages: { role: string; content: string }[] = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: userPrompt })

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => '')}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callAnthropic(
  model: string,
  systemPrompt: string | undefined,
  userPrompt: string,
  key: string,
  maxTokens: number,
): Promise<string> {
  const messages: { role: string; content: string }[] = [
    { role: 'user', content: userPrompt },
  ]
  const body: Record<string, unknown> = { model, max_tokens: maxTokens, messages }
  if (systemPrompt) body.system = systemPrompt

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => '')}`)
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

export function extractJSON(text: string): unknown {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON object found in AI response')
  return JSON.parse(m[0])
}

export function extractJSONArray(text: string): unknown[] {
  const m = text.match(/\[[\s\S]*\]/)
  if (!m) throw new Error('No JSON array found in AI response')
  return JSON.parse(m[0])
}
