export type CreativeRecord = Record<string, unknown>

export type MonthlyCreativeDirection = {
  code: string
  month: string
  narrative: string
  visualLanguage: string
  motionLanguage: string
  proofMechanism: string
  engagementMechanic: string
  context: string
}

const NARRATIVE_SYSTEMS = [
  'mini-documentario osservazionale: persone, gesti e dettagli reali guidano il racconto',
  'problema, tensione, dimostrazione e risultato: ogni contenuto chiude il payoff aperto dall hook',
  'serie episodica: ogni uscita risponde a una domanda e prepara naturalmente la successiva',
  'punto di vista del cliente: situazioni riconoscibili raccontate dall interno, senza tono pubblicitario',
  'dietro le quinte editoriale: processo, competenza e decisioni che il pubblico normalmente non vede',
  'myth-busting di nicchia: convinzione comune, prova concreta e alternativa utile',
  'sfida o trasformazione verificabile: partenza, passaggi reali e arrivo senza promesse gonfiate',
  'rituale di community: persone, abitudini e momenti condivisi diventano il filo del mese',
] as const

const VISUAL_LANGUAGES = [
  'cinematografico umano con luce pratica, profondita e primi piani espressivi',
  'editoriale grafico con composizioni nette, spazio negativo e tipografia breve',
  'UGC premium controllato: camera vicina, imperfezione credibile e grading coerente',
  'macro sensoriale: texture, mani, materiali e dettagli alternati ad ambienti leggibili',
  'energia sociale: gruppi, reazioni autentiche e azioni congelate nel momento decisivo',
  'regia architettonica: linee, simmetrie, ambiente e presenza umana in scala',
  'contrasto di prospettive: soggettiva, campo medio e dettaglio con un solo accento cromatico',
] as const

const MOTION_LANGUAGES = [
  'match cut su gesto o oggetto, con chiusura su frame pieno e luminoso',
  'speed ramp controllato solo nei passaggi chiave, alternato a pause leggibili',
  'handheld-to-static: apertura viva e prova finale stabile',
  'kinetic typography essenziale sincronizzata ai cambi di scena',
  'transizioni per occlusione naturale, senza effetti applicati come decorazione',
  'push-in progressivo e reveal finale del beneficio o della CTA',
  'loop narrativo: ultimo gesto raccordato al primo senza frame nero',
  'split reveal o confronto sincronizzato, con gerarchia visiva immediata',
  'montaggio beat-led sobrio: tagli sul ritmo e micro-pause sui dettagli importanti',
] as const

const PROOF_MECHANISMS = [
  'dimostrazione reale del prodotto o servizio in uso',
  'processo e competenza mostrati dietro le quinte',
  'testimonianza o reazione autentica, solo se disponibile e autorizzata',
  'confronto verificabile prima/dopo o scelta A/B, senza risultati inventati',
  'micro FAQ che scioglie una singola obiezione concreta',
  'dettaglio tecnico spiegato attraverso un beneficio osservabile',
  'prova di community: comportamento, partecipazione o contenuto cliente verificabile',
] as const

const ENGAGEMENT_MECHANICS = [
  'commento con keyword collegato a una risposta o risorsa reale',
  'salvataggio di checklist, sequenza o riferimento utile',
  'domanda binaria o sondaggio coerente con il contenuto',
  'DM con intento preciso e risposta operativa definita',
  'condivisione con una persona che vive la stessa situazione',
  'scelta tra due opzioni che prepara il contenuto successivo',
  'click verso una destinazione tracciata con promessa coerente',
  'risposta a una domanda della community trasformata in nuovo episodio',
] as const

const HISTORY_FIELDS = [
  'hook',
  'tema',
  'angle',
  'primary_message',
  'idea_visual',
  'template_style',
  'production_notes',
  'formato',
  'canale',
  'data_pubblicazione',
] as const

const STOP_WORDS = new Set([
  'a', 'ad', 'al', 'alla', 'alle', 'anche', 'che', 'chi', 'con', 'da', 'dal', 'dalla',
  'dei', 'del', 'della', 'delle', 'di', 'e', 'ed', 'gli', 'ha', 'hai', 'il', 'in', 'la',
  'le', 'lo', 'ma', 'nel', 'nella', 'non', 'o', 'per', 'piu', 'se', 'sei', 'su', 'sul',
  'tra', 'tu', 'un', 'una', 'uno', 'questo', 'questa', 'come', 'cosa', 'ecco', 'poi',
])

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function stableHash(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function parseMonth(startISO: string): { key: string; ordinal: number } {
  const match = /^(\d{4})-(\d{2})/.exec(startISO)
  const now = new Date()
  const year = match ? Number(match[1]) : now.getUTCFullYear()
  const month = match ? Number(match[2]) : now.getUTCMonth() + 1
  return {
    key: `${year}-${String(month).padStart(2, '0')}`,
    ordinal: year * 12 + month - 1,
  }
}

function rotatingIndex(length: number, brandSeed: number, monthOrdinal: number, step: number, salt: string): number {
  return (stableHash(`${brandSeed}:${salt}`) + monthOrdinal * step) % length
}

export function createMonthlyCreativeDirection(args: {
  clienteId: string
  startISO: string
  brandName?: string
}): MonthlyCreativeDirection {
  const { key, ordinal } = parseMonth(args.startISO)
  const brandSeed = stableHash(`${args.clienteId}:${args.brandName || 'brand'}`)
  const narrativeIndex = rotatingIndex(NARRATIVE_SYSTEMS.length, brandSeed, ordinal, 1, 'narrative')
  const visualIndex = rotatingIndex(VISUAL_LANGUAGES.length, brandSeed, ordinal, 2, 'visual')
  const motionIndex = rotatingIndex(MOTION_LANGUAGES.length, brandSeed, ordinal, 2, 'motion')
  const proofIndex = rotatingIndex(PROOF_MECHANISMS.length, brandSeed, ordinal, 3, 'proof')
  const engagementIndex = rotatingIndex(ENGAGEMENT_MECHANICS.length, brandSeed, ordinal, 3, 'engagement')
  const code = `SWA-${key.replace('-', '')}-${narrativeIndex + 1}${visualIndex + 1}${motionIndex + 1}${proofIndex + 1}${engagementIndex + 1}`
  const direction = {
    code,
    month: key,
    narrative: NARRATIVE_SYSTEMS[narrativeIndex],
    visualLanguage: VISUAL_LANGUAGES[visualIndex],
    motionLanguage: MOTION_LANGUAGES[motionIndex],
    proofMechanism: PROOF_MECHANISMS[proofIndex],
    engagementMechanic: ENGAGEMENT_MECHANICS[engagementIndex],
  }

  return {
    ...direction,
    context: `

DNA CREATIVO MENSILE ${direction.code} - VINCOLANTE:
- Il metodo, il tono e l'identita del brand restano stabili; questo DNA cambia l'esecuzione del mese.
- Sistema narrativo: ${direction.narrative}.
- Linguaggio visivo dominante: ${direction.visualLanguage}.
- Linguaggio motion: ${direction.motionLanguage}.
- Prova dominante: ${direction.proofMechanism}.
- Micro-azione dominante: ${direction.engagementMechanic}.
- Usa questa direzione come famiglia riconoscibile, non come template identico: varia soggetto, distanza, apertura, ritmo e composizione tra i contenuti.
- Non cambiare logo, palette approvata, font, grading di base, safe area o tono per inseguire il trend. I trend entrano solo se compatibili con questo DNA.
- In production_notes registra "MONTHLY_DNA: ${direction.code}" e una riga "NOVELTY_GATE: PASS" oppure "NOVELTY_GATE: REVISE <motivo>".`,
  }
}

function unique(values: string[], limit: number): string[] {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))].slice(0, limit)
}

export function buildEditorialHistoryContext(rows: CreativeRecord[]): string {
  if (!rows.length) return ''
  const hooks = unique(rows.map(row => text(row.hook)), 24)
  const themes = unique(rows.map(row => text(row.tema)), 16)
  const angles = unique(rows.map(row => text(row.angle)), 14)
  const visualDirections = unique(rows.flatMap(row => [
    text(row.idea_visual),
    text(row.template_style),
    text(row.production_notes).split('\n').find(line => /TREND_EFFECT|MONTHLY_DNA/i.test(line)) || '',
  ]), 14)
  const recentMix = unique(rows.map(row => [text(row.formato), text(row.canale)].filter(Boolean).join('/')), 12)
  if (![hooks, themes, angles, visualDirections].some(values => values.length)) return ''

  return `

MEMORIA CREATIVA STORICA - GATE ANTI-CLONE:
${hooks.length ? `- Hook gia usati: ${hooks.map(value => `"${value.slice(0, 100)}"`).join(' | ')}.` : ''}
${themes.length ? `- Temi recenti: ${themes.map(value => value.slice(0, 70)).join(' | ')}.` : ''}
${angles.length ? `- Angoli recenti: ${angles.map(value => value.slice(0, 70)).join(' | ')}.` : ''}
${visualDirections.length ? `- Regie/effetti recenti: ${visualDirections.map(value => value.slice(0, 100)).join(' | ')}.` : ''}
${recentMix.length ? `- Accoppiate formato/canale recenti: ${recentMix.join(' | ')}.` : ''}
- Non basta cambiare due parole: cambia premessa, prospettiva, prova, scena iniziale e payoff.
- Puoi evolvere un meccanismo che ha funzionato, ma devi applicarlo a un insight, una dimostrazione e una composizione nuovi.`
}

function normalizedTokens(record: CreativeRecord): Set<string> {
  const raw = ['hook', 'tema', 'angle', 'primary_message', 'idea_visual']
    .map(field => text(record[field]))
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
  return new Set(raw.split(/\s+/).filter(token => token.length > 2 && !STOP_WORDS.has(token)))
}

function normalizedHook(record: CreativeRecord): string {
  return text(record.hook)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function creativeSimilarity(a: CreativeRecord, b: CreativeRecord): number {
  const hookA = normalizedHook(a)
  const hookB = normalizedHook(b)
  if (hookA.length >= 12 && hookA === hookB) return 1
  const tokensA = normalizedTokens(a)
  const tokensB = normalizedTokens(b)
  if (tokensA.size < 4 || tokensB.size < 4) return 0
  let intersection = 0
  tokensA.forEach(token => { if (tokensB.has(token)) intersection++ })
  const union = new Set([...tokensA, ...tokensB]).size
  return union ? intersection / union : 0
}

export function findCreativeNearDuplicate(
  candidate: CreativeRecord,
  previous: CreativeRecord[],
  threshold = 0.76,
): { score: number; hook: string } | null {
  let best: { score: number; hook: string } | null = null
  for (const row of previous) {
    const score = creativeSimilarity(candidate, row)
    if (score < threshold || (best && score <= best.score)) continue
    best = { score, hook: text(row.hook).slice(0, 100) }
  }
  return best
}

export const EDITORIAL_HISTORY_COLUMNS = HISTORY_FIELDS
