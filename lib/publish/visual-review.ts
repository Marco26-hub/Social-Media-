type ContentRow = Record<string, unknown>

/**
 * Vero se i media vengono da una cartella campagna gia prodotta: hook e CTA sono
 * gia impaginati nell'immagine, quindi il render NON deve ridisegnarli sopra.
 *
 * ATTENZIONE: questa funzione dice solo come MONTARE, non se pubblicare senza
 * controllo. La revisione del video montato e sempre richiesta — vedi
 * requiresRenderedVisualReview.
 */
export function hasFinalCampaignAsset(row: ContentRow): boolean {
  if (String(row.campaign_content_key || '').trim()) return true

  const paths = row.campaign_source_paths
  if (Array.isArray(paths)) return paths.length > 0
  if (typeof paths !== 'string') return false

  const normalized = paths.trim().toLowerCase()
  if (!normalized || normalized === '[]' || normalized === 'null') return false
  try {
    const parsed = JSON.parse(paths)
    return Array.isArray(parsed) ? parsed.length > 0 : Boolean(parsed)
  } catch {
    // Fail-closed: su un dato illeggibile si assume che NON sia un asset finale,
    // quindi il render ridisegna hook e CTA invece di ometterli.
    return false
  }
}

/**
 * Un video montato non viene MAI pubblicato senza che una persona lo abbia
 * guardato. Vale anche per i media di una cartella campagna gia prodotta.
 *
 * Le creativita di partenza sono si gia approvate, ma il montaggio e un
 * artefatto NUOVO: Remotion aggiunge movimento, transizioni, durata e una
 * traccia audio, e puo sbagliare senza che nessuno se ne accorga — tanto piu
 * che in produzione non ha ancora un montaggio riuscito alle spalle. Il
 * contenuto torna quindi in DA_APPROVARE con stato visual_review, si guarda in
 * Preview e si approva una seconda volta.
 *
 * Il bypass per gli asset di campagna (commit 6c6c465) e stato rimosso su
 * richiesta esplicita: il controllo umano sul montaggio e la garanzia che regge
 * l'intero flusso, e vale piu del giro in meno.
 */
// La firma tiene il parametro perche i chiamanti passano la riga e perche una
// futura eccezione (se mai motivata) si scriverebbe qui e in nessun altro punto.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function requiresRenderedVisualReview(row: ContentRow): boolean {
  return true
}
