// ─────────────────────────────────────────────────────────────────────────
// CANCELLI DELLA GENERAZIONE
//
// La generazione del piano parcheggia in ERRORE_MANUALE i contenuti che non
// sono pronti, marcando il motivo nel campo `note` con un prefisso. Sono tre
// casi diversi ma con lo STESSO rimedio: una rigenerazione singola che tiene
// data, canale, formato e media e riscrive solo la parte editoriale.
//
//   [GENERATION_FALLBACK] — l'AI non ha prodotto il contenuto (tempo finito,
//                           JSON troncato): resta lo slot con i media.
//   [NARRATIVE_GATE]      — contenuto scritto, ma senza la struttura che il
//                           formato richiede (un Reel vuole 5 scene, un
//                           carosello 5-10 slide, una Story 3 frame).
//   [NOVELTY_GATE]        — troppo simile a un contenuto già in calendario.
//
// Prima solo il primo caso era rigenerabile: gli altri due restavano senza
// alcuna azione possibile nell'interfaccia (solo "Riprova pubblicazione", che
// tenterebbe di pubblicare un Reel senza scene, o "Elimina"). Un vicolo cieco.
//
// ERRORE_MANUALE senza nessuno di questi prefissi è un problema di
// PUBBLICAZIONE, non di generazione: quello si risolve con "Riprova
// pubblicazione" e qui non viene toccato.
// ─────────────────────────────────────────────────────────────────────────

export type GenerationGate = 'fallback' | 'narrative' | 'novelty'

const PREFIXES: Array<{ gate: GenerationGate; prefix: string }> = [
  { gate: 'fallback', prefix: '[GENERATION_FALLBACK]' },
  { gate: 'narrative', prefix: '[NARRATIVE_GATE]' },
  { gate: 'novelty', prefix: '[NOVELTY_GATE]' },
]

// Riconosce il cancello che ha fermato il contenuto. null = non è un contenuto
// fermato dalla generazione (quindi non rigenerabile per questa via).
export function readGenerationGate(status: unknown, note: unknown): GenerationGate | null {
  if (String(status || '').toUpperCase() !== 'ERRORE_MANUALE') return null
  const text = String(note || '').trim()
  return PREFIXES.find(({ prefix }) => text.startsWith(prefix))?.gate ?? null
}

// Motivo leggibile, senza il prefisso tecnico: è ciò che si passa al modello
// per fargli correggere ESATTAMENTE quel difetto invece di riscrivere a caso.
export function readGateReason(note: unknown): string {
  const text = String(note || '').trim()
  const match = PREFIXES.find(({ prefix }) => text.startsWith(prefix))
  return match ? text.slice(match.prefix.length).trim() : ''
}

export function gateAzione(gate: GenerationGate): string {
  if (gate === 'fallback') return 'La generazione non ha completato questo contenuto.'
  if (gate === 'narrative') return 'Il contenuto non ha la struttura che il suo formato richiede.'
  return 'Il contenuto somiglia troppo a un altro già in calendario.'
}
