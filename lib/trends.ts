// ─────────────────────────────────────────────────────────────────────────
// Trend web reali per il piano editoriale. Usa la web search di OpenRouter
// (plugin "web") per estrarre 4-6 trend/format social ATTUALI del settore del
// brand, da iniettare nel prompt di generazione. È la leva "all'avanguardia":
// invece di dire genericamente "sii moderno", il modello riceve trend veri del
// momento.
//
// SICUREZZA/ROBUSTEZZA: opzionale e fail-safe. Qualunque problema (key assente,
// plugin non disponibile sulla key, timeout, JSON storto) → ritorna [] e il piano
// prosegue con TREND_MODERN_STANDARDS + contesto stagionale, senza regressioni.
// ─────────────────────────────────────────────────────────────────────────

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Stessa validazione BYO-key del bridge lib/ai.ts: accetta solo il formato atteso,
// altrimenti ripiega sulla key server.
function resolveKey(byo?: string): string {
  const b = (byo || '').trim()
  const valid = /^sk-or-v1-[A-Za-z0-9_-]{20,}$/.test(b) ? b : ''
  return (valid || process.env.OPENROUTER_API_KEY || '').trim()
}

// Estrae bullet puliti dalla risposta del modello. Tollerante a "- ", "• ", "* ",
// liste numerate e righe piene; scarta preamboli e righe vuote.
function parseTrendLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim())
    .map(line => line.replace(/\s+/g, ' '))
    .filter(line => line.length >= 3 && line.length <= 140)
    // Scarta righe che sembrano intro/outro invece di trend veri.
    .filter(line => !/^(ecco|questi|di seguito|in sintesi|conclusion|fonte|source)/i.test(line))
    .slice(0, 6)
}

export type FetchTrendsOptions = {
  settore?: string | null
  brandName?: string | null
  periodoLabel?: string | null   // es. "agosto, estate"
  model?: string
  openrouterKey?: string
  timeoutMs?: number
}

// Ritorna una lista di trend testuali (max 6), o [] se non disponibili.
export async function fetchSectorTrends(opts: FetchTrendsOptions): Promise<string[]> {
  const key = resolveKey(opts.openrouterKey)
  if (!key) return []

  const settore = String(opts.settore || 'moda e abbigliamento').slice(0, 80)
  const extra = [
    opts.brandName ? `brand: ${String(opts.brandName).slice(0, 60)}` : '',
    opts.periodoLabel ? `periodo: ${String(opts.periodoLabel).slice(0, 40)}` : '',
  ].filter(Boolean).join(', ')

  const userPrompt = `Cerca sul web i TREND social attuali (formati video, pattern interrupt, animazioni, transizioni, camera movement, typography motion, meccaniche native, mood e audio) realmente in voga ORA per il settore "${settore}" in Italia${extra ? ` (${extra})` : ''}.
Rispondi SOLO con 4-6 bullet brevi (una riga ciascuno, max ~15 parole), ognuno un trend/format concreto e sfruttabile in un piano social. Niente introduzione, niente link, niente numeri di paragrafo.`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 12000)
  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: opts.model || 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: userPrompt }],
        // Plugin di web search OpenRouter: funziona con qualsiasi modello.
        plugins: [{ id: 'web', max_results: 5 }],
        max_tokens: 500,
        temperature: 0.6,
      }),
    })
    if (!res.ok) return []
    const data = await res.json().catch(() => null)
    const content: string = data?.choices?.[0]?.message?.content || ''
    if (!content.trim()) return []
    return parseTrendLines(content)
  } catch {
    // Timeout / rete / plugin non abilitato: fail-safe, nessuna regressione.
    return []
  } finally {
    clearTimeout(timer)
  }
}

// Costruisce il blocco di prompt dai trend (vuoto se nessun trend disponibile).
export function buildTrendContext(trends: string[]): string {
  if (!trends.length) return ''
  return `

TREND SOCIAL ATTUALI (dal web, sfruttali dove pertinenti — NON forzarli se non c'entrano col brand):
${trends.map(t => `- ${t}`).join('\n')}
Usa questi trend reali come ispirazione per format, motion, transizioni, meccaniche e mood; adattali al brand, non copiarli pedissequamente. Assegna a ogni contenuto almeno una scelta visuale o di movimento concreta e diversa dalle due pubblicazioni precedenti.`
}
