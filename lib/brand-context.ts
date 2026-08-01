// Contesto brand condiviso da generatore di post singoli E piano editoriale
// (settimanale/mensile). Stessa logica in un solo posto così i due flussi non
// divergono: campi espliciti con default sensati invece di un dump JSON grezzo.
// Ritorna '' se il brand non è configurato (nessun brand_name) — chi la usa
// ripiega sulla persona generica del system prompt.
export function buildBrandContext(brand: Record<string, unknown> | null): string {
  if (!brand || !brand.brand_name) return ''
  return `CONTESTO BRAND (USA SEMPRE QUESTI DATI):
Nome: ${brand.brand_name || ''}
Settore: ${brand.settore || 'moda e-commerce'}
Tono di voce: ${brand.tono_voce || 'elegante e professionale'}
Target: ${brand.target || 'adulti 25-55'}
Promessa: ${brand.promessa_brand || 'qualità e stile'}
Colori brand: ${brand.colori_brand || ''}
Parole da usare: ${brand.parole_da_usare || ''}
Parole da EVITARE: ${brand.parole_da_evitare || ''}
Emoji consentiti: ${brand.emoji_policy || ''}
Hashtag base: ${brand.hashtag_base || ''}
CTA base: ${brand.cta_base || ''}
`
}
