function comparable(text: string): string {
  return text.normalize('NFKC').toLocaleLowerCase('it').replace(/\*\*/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
}

// Rimuove solo la ripetizione dell'apertura e CTA già presenti. Non riscrive
// semanticamente il copy e non elimina frasi semplicemente simili.
export function uniquePublishCopy(hook: string, caption: string, cta: string): { hook: string; caption: string; cta: string } {
  hook = hook.trim()
  caption = caption.trim()
  cta = cta.trim()
  if (hook && caption.startsWith(hook)) caption = caption.slice(hook.length).trim()
  else if (hook && comparable(hook) === comparable(caption)) caption = ''
  const normalizedCta = comparable(cta)
  const sentences = `${hook}\n${caption}`.split(/[.!?\n]+/).map(comparable)
  if (normalizedCta && sentences.includes(normalizedCta)) cta = ''
  // Variazione equivalente esplicita del CTA SWA, non un filtro semantico generale.
  if (normalizedCta === 'condividilo con chi gestisce i social'
      && sentences.includes('condividilo con chi gestisce i tuoi social')) cta = ''
  return { hook, caption, cta }
}

// Correzione conservativa del testo già inviato: cambia solo le ripetizioni
// riconosciute, lasciando media, hashtag, target e orario remoti intatti.
export function repairQueuedText(text: string, hook: string, cta: string): string {
  hook = hook.trim()
  if (hook && text.startsWith(hook)) {
    const rest = text.slice(hook.length).trimStart()
    if (rest.startsWith(hook)) text = `${hook}\n\n${rest.slice(hook.length).trimStart()}`
  }
  const paragraphs = text.split(/\n\s*\n/)
  const result: string[] = []
  for (const paragraph of paragraphs) {
    const current = comparable(paragraph)
    if (current && result.some(part => comparable(part) === current)) continue
    const before = result.join('\n').split(/[.!?\n]+/).map(comparable)
    if (current === comparable(cta) && before.includes(current)) continue
    if (current === 'condividilo con chi gestisce i social' && before.includes('condividilo con chi gestisce i tuoi social')) continue
    result.push(paragraph)
  }
  return result.join('\n\n')
}
