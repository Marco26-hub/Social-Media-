export type CreativeMode = 'standard' | 'ugc'

export function normalizeCreativeMode(value: unknown): CreativeMode {
  return value === 'ugc' ? 'ugc' : 'standard'
}

const UGC_CHANNEL_RULES: Record<string, string> = {
  instagram: 'Reel creator-style 9:16, hook visivo nei primi 2 secondi, scene brevi, overlay leggibili e CTA naturale.',
  facebook: 'Reel o video dimostrativo con racconto chiaro, ritmo meno frenetico, sottotitoli e beneficio concreto.',
  tiktok: 'Video verticale nativo, prima persona, hook 0-2 secondi, tagli credibili, linguaggio diretto e payoff rapido.',
  pinterest: 'Pin creator-style utile e cercabile, con dimostrazione, passaggi concreti e destinazione verificata.',
  linkedin: 'Storia cliente o use case professionale in prima persona solo se documentato; focus su problema, processo e prova.',
  youtube_shorts: 'Short verticale con titolo cercabile, hook immediato, retention per scene e chiusura memorabile.',
  threads: 'Contenuto foto-first o conversazionale, personale e spontaneo, con una sola idea e invito alla conversazione.',
  x: 'Video o post creator-style molto conciso, primo frame forte, osservazione autentica e CTA minima.',
}

export function buildCreativeModeContext(input: {
  mode: CreativeMode
  canale: string
  formato: string
  hasAssets: boolean
}): string {
  if (input.mode !== 'ugc') return ''

  const channelRule = UGC_CHANNEL_RULES[input.canale]
    || 'Contenuto creator-style nativo per il canale, con hook, sviluppo, prova visiva e CTA coerenti con il formato.'
  const assetRule = input.hasAssets
    ? 'Usa esclusivamente prodotto, persone, luoghi e prove realmente visibili o dichiarati negli asset forniti.'
    : 'Non ci sono media reali: crea uno script e un brief di produzione, inserisci foto/video creator e prodotto in missing_inputs e non fingere che il contenuto sia gia stato registrato.'

  return `MODALITA CREATIVA UGC (VINCOLANTE):
- Crea un UGC originale dedicato a ${input.canale}, formato ${input.formato}; non riciclare un contenuto generico o di un altro social.
- Regola nativa del canale: ${channelRule}
- Scrivi un concept registrabile da una persona reale: hook, scene o passaggi, testo parlato/voiceover, overlay, B-roll, caption e CTA.
- Imposta template_style a "ugc" e descrivi nel creative_brief chi registra, ambientazione, inquadrature e ritmo.
- Non inventare testimonianze, recensioni, risultati, uso personale, creator, consenso o social proof. Se non sono documentati, proponi una dimostrazione o un POV senza falsa esperienza.
- ${assetRule}
- Il contenuto resta DA_APPROVARE e ogni dato mancante deve comparire in missing_inputs.`
}
