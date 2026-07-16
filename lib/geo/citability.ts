// ─────────────────────────────────────────────────────────────────────────
// AI CITABILITY SCORER — skill "geo-citability" (ricerca Princeton/Georgia
// Tech/IIT Delhi 2024). Misura quanto un blocco di contenuto è ESTRAIBILE e
// citabile da ChatGPT/Perplexity/Google AI Overviews.
//
// DETERMINISTICO per le prime 4 categorie (regex/euristiche riproducibili,
// gratis, istantanee — niente "chiedi a un LLM di dare un voto 0-100", che
// varia a ogni run e non è verificabile). La 5a categoria (Uniqueness) è per
// natura non misurabile senza confronto con l'intero web: qui è una EURISTICA
// che rileva segnali di first-party content (dati/esperienza proprietari),
// non una verifica reale di unicità — capped a 90 per onestà.
// ─────────────────────────────────────────────────────────────────────────

export type ContentBlock = { heading: string; text: string }

export type BlockScore = {
  heading: string
  words: number
  answerQuality: number
  selfContainment: number
  structure: number
  statDensity: number
  uniqueness: number
  overall: number
  issues: string[]
}

export type CitabilityReport = {
  overall: number
  coverage: number // % blocchi con overall >= 70
  blocks: BlockScore[]
  strongest: BlockScore[]
  weakest: BlockScore[]
}

const WEIGHTS = { answer: 0.30, selfContain: 0.25, structure: 0.20, stats: 0.15, unique: 0.10 }

const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean)

// Pattern di definizione IT ("X è...", "X significa...", "X si riferisce a...").
const DEFINITION_RE = /^[A-ZÀ-Ú][^.!?]{2,60}?\s+(è|sono|significa|rappresenta|indica|consiste in|si riferisce a|permette di)\s/i
// Risposta quantificata: numero, percentuale o dato concreto nella prima frase.
const QUANTIFIED_RE = /\d/
// Pronomi/congiunzioni che tradiscono dipendenza dal contesto precedente.
const DEPENDENT_START_RE = /^(esso|essa|questo|questa|questi|queste|ciò|ma\s|però|tuttavia|e\s|quindi\s|infatti\s|inoltre\s)/i
const QUESTION_HEADING_RE = /^(cosa|come|perché|quando|dove|quali|qual è|cos'è)\b/i
// Statistiche: percentuali, valute, date/anni, conteggi con unità.
const STAT_RE = /\d+([.,]\d+)?\s?%|\€\s?\d+|\$\s?\d+|\b(19|20)\d{2}\b|\b\d+([.,]\d+)?\s?(giorni|mesi|anni|ore|volte|utenti|clienti)\b/gi
const FIRST_PARTY_RE = /(nella nostra esperienza|dal nostro (test|studio|sondaggio|caso)|abbiamo (analizzato|osservato|testato|raccolto)|i nostri clienti|secondo i nostri dati)/i

function scoreAnswerQuality(block: ContentBlock): { score: number; issues: string[] } {
  const issues: string[] = []
  const first = sentences(block.text)[0] || ''
  const firstWords = wordCount(first)
  let score = 30
  if (DEFINITION_RE.test(first)) score += 35
  else issues.push('Manca un pattern di definizione in apertura ("X è...").')
  if (QUANTIFIED_RE.test(first)) score += 20
  else issues.push('La prima frase non contiene un dato quantificato.')
  if (firstWords >= 15 && firstWords <= 45) score += 15
  else if (firstWords > 0) issues.push(`Prima frase di ${firstWords} parole (ideale 15-45 per stare in piedi da sola).`)
  return { score: Math.min(100, score), issues }
}

function scoreSelfContainment(block: ContentBlock): { score: number; issues: string[] } {
  const issues: string[] = []
  const words = wordCount(block.text)
  let score = 40
  if (!DEPENDENT_START_RE.test(block.text.trim())) score += 25
  else issues.push('Il blocco inizia con un pronome/congiunzione che richiede contesto precedente.')
  if (/^[A-ZÀ-Ú]/.test(block.heading.trim())) score += 10
  if (words >= 40 && words <= 200) score += 25
  else if (words > 0) issues.push(`Blocco di ${words} parole (ideale 40-200 per l'estrazione AI).`)
  return { score: Math.min(100, score), issues }
}

function scoreStructure(block: ContentBlock): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 50
  if (QUESTION_HEADING_RE.test(block.heading.trim())) score += 20
  else issues.push('Heading non in forma di domanda (riduce il match con query AI/Google).')
  const paras = block.text.split(/\n{2,}/).filter(Boolean)
  const avgSentPerPara = paras.length ? paras.reduce((a, p) => a + sentences(p).length, 0) / paras.length : sentences(block.text).length
  if (avgSentPerPara >= 1 && avgSentPerPara <= 4) score += 20
  else issues.push(`Media ${avgSentPerPara.toFixed(1)} frasi/paragrafo (ideale 2-4).`)
  if (/^[-*•]\s|^\d+\.\s/m.test(block.text)) score += 10
  return { score: Math.min(100, score), issues }
}

function scoreStatDensity(block: ContentBlock): { score: number; issues: string[] } {
  const issues: string[] = []
  const words = wordCount(block.text) || 1
  const matches = block.text.match(STAT_RE) || []
  const per500 = (matches.length / words) * 500
  let score: number
  if (per500 >= 5) score = 95
  else if (per500 >= 3) score = 80
  else if (per500 >= 1) score = 60
  else if (per500 > 0) score = 40
  else { score = 15; issues.push('Nessun dato/statistica specifica nel blocco (usa numeri, %, date, conteggi reali).') }
  return { score, issues }
}

function scoreUniqueness(block: ContentBlock): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 50
  if (FIRST_PARTY_RE.test(block.text)) score = 85
  else issues.push('Nessun segnale di contenuto first-party (esperienza/dati proprietari) rilevato.')
  return { score: Math.min(90, score), issues } // capped: euristica, non verifica reale di unicità
}

export function scoreBlock(block: ContentBlock): BlockScore {
  const a = scoreAnswerQuality(block)
  const s = scoreSelfContainment(block)
  const st = scoreStructure(block)
  const d = scoreStatDensity(block)
  const u = scoreUniqueness(block)
  const overall = Math.round(a.score * WEIGHTS.answer + s.score * WEIGHTS.selfContain + st.score * WEIGHTS.structure + d.score * WEIGHTS.stats + u.score * WEIGHTS.unique)
  return {
    heading: block.heading,
    words: wordCount(block.text),
    answerQuality: a.score,
    selfContainment: s.score,
    structure: st.score,
    statDensity: d.score,
    uniqueness: u.score,
    overall,
    issues: [...a.issues, ...s.issues, ...st.issues, ...d.issues, ...u.issues],
  }
}

export function scoreCitability(blocks: ContentBlock[]): CitabilityReport {
  const scored = blocks.filter(b => b.text?.trim()).map(scoreBlock)
  if (!scored.length) return { overall: 0, coverage: 0, blocks: [], strongest: [], weakest: [] }
  const overall = Math.round(scored.reduce((a, b) => a + b.overall, 0) / scored.length)
  const coverage = Math.round((scored.filter(b => b.overall >= 70).length / scored.length) * 100)
  const sorted = [...scored].sort((a, b) => b.overall - a.overall)
  return {
    overall,
    coverage,
    blocks: scored,
    strongest: sorted.slice(0, 3),
    weakest: sorted.slice(-3).reverse(),
  }
}

// Segmenta markdown/testo libero in blocchi per H2/H3 (## o ###). Per contenuti
// che arrivano già strutturati (es. blog_articoli.sezioni) costruisci i
// ContentBlock[] direttamente — questo helper serve per input non strutturato.
export function segmentMarkdown(md: string): ContentBlock[] {
  const lines = (md || '').split('\n')
  const blocks: ContentBlock[] = []
  let heading = 'Introduzione'
  let buf: string[] = []
  const flush = () => { if (buf.join('').trim()) blocks.push({ heading, text: buf.join('\n').trim() }); buf = [] }
  for (const line of lines) {
    const m = line.match(/^#{2,3}\s+(.+)$/)
    if (m) { flush(); heading = m[1].trim(); continue }
    buf.push(line)
  }
  flush()
  return blocks
}

// Prompt AI per riscrivere SOLO i blocchi deboli (score < 60). L'AI è usata per
// la riscrittura creativa grounded sui problemi REALI rilevati dallo scorer
// deterministico — non per inventare un punteggio.
export function rewriteWeakBlockPrompt(block: BlockScore, originalText: string): string {
  return `Sei un editor GEO/SEO senior. Riscrivi questo blocco per massimizzare la citabilità AI (ChatGPT/Perplexity/Google AI Overviews).

HEADING: "${block.heading}"
TESTO ATTUALE:
${originalText}

PROBLEMI RILEVATI (punteggio ${block.overall}/100):
${block.issues.map(i => `- ${i}`).join('\n')}

RISCRIVI seguendo queste regole:
- Prima frase: pattern "X è/significa..." con risposta diretta e un dato quantificato.
- Blocco auto-contenuto: nomina sempre il soggetto, mai iniziare con pronomi.
- 40-100 parole, 2-4 frasi per paragrafo.
- Se mancano statistiche, NON inventarle: usa un'affermazione qualitativa onesta invece di un numero falso.

Output SOLO JSON valido: {"heading_suggerito":"","testo_riscritto":""}`
}
