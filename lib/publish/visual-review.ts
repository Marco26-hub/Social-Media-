type ContentRow = Record<string, unknown>

/**
 * Vero se i media vengono da una cartella campagna gia prodotta: hook e CTA sono
 * gia impaginati nell'immagine, quindi il render NON deve ridisegnarli sopra.
 *
 * ATTENZIONE: dice solo COME montare. Non dice se il contenuto sia gia pronto:
 * un reel di una cartella campagna e comunque un montaggio da produrre, perche
 * il materiale caricato sono foto verticali, non un MP4 finito.
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
 * Il montaggio NON si ferma per una seconda approvazione: si approva una volta
 * sola, guardando l'anteprima, e da li il contenuto arriva a Blotato da solo.
 *
 * Il gate precedente rimandava ogni video in DA_APPROVARE con stato
 * visual_review, chiedendo di riapprovare un contenuto gia approvato. Nel flusso
 * reale il materiale e sempre lo stesso — foto verticali caricate a mano, viste
 * in anteprima prima di approvare — quindi la seconda conferma non aggiungeva
 * una decisione: aggiungeva un giro, e i contenuti restavano fermi a meta strada
 * senza che nulla lo segnalasse (due reel del 5 settembre non sono mai partiti
 * proprio cosi).
 *
 * Il controllo sul montaggio resta, ma cambia forma: se il render fallisce il
 * contenuto finisce in ERRORE — visibile nel contatore e nel filtro — invece di
 * mettersi in attesa di un'approvazione. Il prezzo accettato consapevolmente e
 * che un montaggio tecnicamente riuscito ma brutto esce senza un secondo sguardo:
 * per quello resta l'anteprima prima di approvare.
 */
// La firma tiene il parametro perche i chiamanti passano la riga e perche una
// futura eccezione (se mai motivata) si scriverebbe qui e in nessun altro punto.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function requiresRenderedVisualReview(row: ContentRow): boolean {
  return false
}
