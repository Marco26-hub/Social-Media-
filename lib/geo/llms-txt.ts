// ─────────────────────────────────────────────────────────────────────────
// Generatore llms.txt — skill "geo-llmstxt". Standard emergente (Jeremy Howard,
// set. 2024) analogo a robots.txt ma per dire alle AI COSA è utile capire del
// sito. Formato Markdown fisso: H1 nome, blockquote descrizione, sezioni H2
// con link. Deterministico: costruito da dati REALI (brand + articoli
// pubblicati), zero contenuto inventato.
// ─────────────────────────────────────────────────────────────────────────

export type LlmsTxtDoc = { title: string; url: string; description?: string }

export type LlmsTxtInput = {
  siteName: string
  description: string
  baseUrl?: string
  docs: LlmsTxtDoc[] // pagine/articoli principali (## Docs)
  optional?: LlmsTxtDoc[] // pagine secondarie (## Optional)
}

function section(title: string, docs: LlmsTxtDoc[]): string {
  if (!docs.length) return ''
  const lines = docs
    .filter(d => d.title && d.url)
    .map(d => `- [${d.title}](${d.url})${d.description ? `: ${d.description}` : ''}`)
  if (!lines.length) return ''
  return `## ${title}\n${lines.join('\n')}\n`
}

export function buildLlmsTxt(input: LlmsTxtInput): string {
  const parts = [
    `# ${input.siteName}`,
    '',
    `> ${input.description}`,
    '',
    section('Docs', input.docs),
    section('Optional', input.optional || []),
  ].filter(part => part !== '')
  return parts.join('\n').trim() + '\n'
}

// Validazione struttura di un llms.txt esistente (per audit). Onesta: elenca
// cosa manca rispetto alla spec, non "corregge" da sola.
export function validateLlmsTxt(content: string): { ok: boolean; issues: string[] } {
  const issues: string[] = []
  const lines = (content || '').split('\n').map(l => l.trim())
  if (!lines[0]?.startsWith('# ')) issues.push('Manca H1 iniziale ("# Nome sito") in prima riga.')
  if (!lines.some(l => l.startsWith('> '))) issues.push('Manca il blockquote di descrizione ("> ...") dopo l\'H1.')
  if (!/^##\s/m.test(content)) issues.push('Manca almeno una sezione H2 ("## Docs" o simile) con link.')
  if (!/^-\s\[.+\]\(.+\)/m.test(content)) issues.push('Nessun link in formato Markdown "- [Titolo](url)" trovato.')
  return { ok: issues.length === 0, issues }
}
