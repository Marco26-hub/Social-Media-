export type NarrativeIssue = {
  code: string
  message: string
}

const FORMAT_ALIASES: Record<string, string> = {
  carosello: 'carousel',
  short: 'reel',
  video: 'reel',
}

function normalizedFormat(value: unknown): string {
  const format = String(value || 'post').trim().toLowerCase()
  return FORMAT_ALIASES[format] || format
}

function sequence(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function sequenceText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (!value || typeof value !== 'object') return ''
  const row = value as Record<string, unknown>
  return [
    row.ruolo,
    row.role,
    row.titolo,
    row.testo,
    row.descrizione,
    row.overlay_testo,
    row.voiceover,
    row.obiettivo_slide,
  ].filter(Boolean).map(String).join(' ').trim()
}

function countDistinctSequenceItems(items: unknown[]): number {
  return new Set(items.map(sequenceText).map(text => text.toLowerCase()).filter(Boolean)).size
}

// Il modello risponde in italiano e alterna gli alias: la route li accetta gia
// con pickText/pickJson. Se il gate leggesse solo la chiave inglese, un piano
// scritto con "messaggio_chiave" finirebbe tutto in ERRORE_MANUALE per un
// campo che in realta c'e.
function firstText(item: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = item[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function firstSequence(item: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    const items = sequence(item[key])
    if (items.length) return items
  }
  return []
}

export const FORMAT_NARRATIVE_CONTEXT = `
CONTRATTO NARRATIVO E PRODUTTIVO PER FORMATO — VINCOLANTE:
- Ogni contenuto ha una sola promessa, un solo pubblico e una sola micro-azione. Hook, sviluppo, prova, payoff e CTA devono parlare dello stesso problema.
- Non basta raggiungere il numero di file: ogni scena o slide deve avere una funzione narrativa distinta e un visual diverso, mantenendo personaggi, luce, palette e direzione artistica coerenti.
- Proteggi logo, volto, hook e CTA dalle interfacce social. Nei verticali 9:16 lascia libera la fascia superiore dell'app e il lato destro; mantieni i messaggi chiave nella safe area centrale. Vietate sovrapposizioni tra logo, handle, testi e controlli.
- Non simulare sondaggi, box domande, link, swipe o pulsanti che la pubblicazione automatica non rende realmente interattivi.

REEL / SHORT / VIDEO — 5 scene, 9:16:
1. HOOK (0-2s): pattern interrupt visivo + promessa specifica comprensibile anche senza audio.
2. TENSIONE (2-5s): problema concreto o open loop, senza ripetere il hook.
3. PROVA (5-9s): dimostrazione, esempio, processo o dettaglio credibile.
4. PAYOFF (9-13s): risposta utile e trasformazione promessa.
5. CTA/LOOP (13-18s): una micro-azione concreta e un frame finale pubblicabile che richiami l'apertura.
Compila scenes con esattamente 5 oggetti e i campi numero, ruolo, secondi, descrizione, overlay_testo, visual, movimento, transizione, voiceover. Nessuna scena-filler.

CAROUSEL — almeno 5 slide separate, stesso rapporto:
1. COVER: promessa specifica, leggibile in un secondo; non anticipare tutta la risposta.
2. PROBLEMA: rende riconoscibile la situazione e apre lo swipe.
3..N-2. SVILUPPO/PROVA: un'idea per slide, progressione logica, esempi o passaggi concreti.
N-1. PAYOFF/RECAP: ricompone il valore e risponde alla cover.
N. CTA: una sola azione con motivo per salvare, condividere, commentare o contattare.
Compila slides con numero, ruolo, titolo, testo, visual, obiettivo_slide e raccordo_successivo. Le slide devono funzionare in ordine, mai come poster indipendenti assemblati per caso.

STORY — 3 frame, 9:16:
1. APERTURA: domanda o tensione immediata.
2. SVILUPPO: contesto/prova che fa avanzare la storia.
3. RISOLUZIONE/CTA: risposta e azione realmente supportata, per esempio "Scrivi BOWLING in DM"; niente finti sticker.
Compila scenes con 3 frame e ruolo, testo, visual, durata e raccordo. Il terzo frame deve chiudere l'open loop del primo.

POST STATICO — 4:5:
- Il visual contiene un solo hook breve e una gerarchia chiara; la fotografia resta protagonista.
- La caption completa l'arco: hook -> contesto/prova -> takeaway -> CTA. Non duplicare parola per parola il testo nell'immagine.
- Il post deve avere hook, primary_message, proof_points o esempio verificabile, caption e CTA coerenti.`

export function evaluateNarrativeContract(item: Record<string, unknown>): NarrativeIssue[] {
  const format = normalizedFormat(item.formato ?? item.format)
  const hook = firstText(item, ['hook', 'gancio'])
  const caption = firstText(item, ['caption', 'didascalia'])
  const cta = firstText(item, ['cta', 'call_to_action'])
  const issues: NarrativeIssue[] = []

  if (!hook) issues.push({ code: 'hook_missing', message: 'Hook narrativo mancante' })
  if (!cta) issues.push({ code: 'cta_missing', message: 'CTA finale mancante' })

  if (format === 'reel') {
    const scenes = firstSequence(item, ['scenes', 'scene', 'frames'])
    if (scenes.length !== 5) issues.push({ code: 'reel_scene_count', message: `Reel: servono esattamente 5 scene narrative (attuali: ${scenes.length})` })
    if (scenes.length && countDistinctSequenceItems(scenes) !== scenes.length) {
      issues.push({ code: 'reel_scene_duplicate', message: 'Reel: scene duplicate o prive di una funzione distinta' })
    }
  } else if (format === 'carousel') {
    const slides = firstSequence(item, ['slides', 'immagini'])
    if (slides.length < 5 || slides.length > 10) issues.push({ code: 'carousel_slide_count', message: `Carosello: servono 5-10 slide narrative (attuali: ${slides.length})` })
    if (slides.length && countDistinctSequenceItems(slides) !== slides.length) {
      issues.push({ code: 'carousel_slide_duplicate', message: 'Carosello: slide duplicate o senza progressione distinta' })
    }
  } else if (format === 'story') {
    const frames = firstSequence(item, ['scenes', 'frames', 'scene'])
    if (frames.length !== 3) issues.push({ code: 'story_frame_count', message: `Story: servono esattamente 3 frame narrativi (attuali: ${frames.length})` })
    if (frames.length && countDistinctSequenceItems(frames) !== frames.length) {
      issues.push({ code: 'story_frame_duplicate', message: 'Story: frame duplicati o senza avanzamento narrativo' })
    }
  } else if (format === 'post') {
    if (!caption) issues.push({ code: 'post_caption_missing', message: 'Post: caption narrativa mancante' })
    if (!firstText(item, ['primary_message', 'messaggio_chiave'])) {
      issues.push({ code: 'post_message_missing', message: 'Post: messaggio principale non definito' })
    }
  }

  return issues
}
