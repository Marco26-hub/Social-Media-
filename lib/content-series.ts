const SERIES_PHASES = ['ATTENZIONE', 'FIDUCIA', 'SCELTA', 'AZIONE'] as const

export type ContentSeriesContext = {
  id: string
  position: number
  total: number
  phase: typeof SERIES_PHASES[number]
  theme: string
  prompt: string
}

export function buildContentSeriesContext(input: {
  id: unknown
  position: unknown
  total: unknown
  formats: unknown
  format: unknown
  theme?: unknown
}): ContentSeriesContext | null {
  const id = typeof input.id === 'string' ? input.id.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) : ''
  const total = Math.min(Math.max(Number(input.total) || 0, 0), 12)
  const position = Math.min(Math.max(Number(input.position) || 0, 0), total)
  if (!id || total < 2 || !position) return null

  const formats = Array.isArray(input.formats)
    ? input.formats.filter((value): value is string => typeof value === 'string').slice(0, 12)
    : []
  const format = typeof input.format === 'string' && input.format.trim() ? input.format.trim() : 'content'
  const theme = typeof input.theme === 'string' ? input.theme.trim().replace(/\s+/g, ' ').slice(0, 240) : ''
  const phaseIndex = total === 1 ? 0 : Math.round(((position - 1) / (total - 1)) * (SERIES_PHASES.length - 1))
  const phase = SERIES_PHASES[phaseIndex]

  return {
    id,
    position,
    total,
    phase,
    theme,
    prompt: `SERIE EDITORIALE COORDINATA (VINCOLANTE):
- ID serie: ${id}; contenuto ${position} di ${total}; fase narrativa: ${phase}.
- Tema/promessa comune: ${theme || 'ricavalo dal Profilo Brand e mantienilo identico per tutta la serie'}.
- Formati della serie: ${formats.join(', ') || 'non specificati'}.
- Questo contenuto deve funzionare da solo ma continuare la stessa promessa, direzione visiva e CTA progressiva degli altri slot.
- Non duplicare hook o funzione editoriale: assegna a questo slot un angolo specifico coerente con la fase ${phase}.
- Il formato di questo slot e ${format}.
- In production_notes registra SERIES_ID: ${id}, SERIES_POSITION: ${position}/${total}, SERIES_PHASE: ${phase}, SERIES_THEME: ${theme || 'da Profilo Brand'}.`,
  }
}
