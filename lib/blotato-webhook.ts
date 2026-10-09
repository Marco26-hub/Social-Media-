import { withTransaction } from './db'
import { CANALE_TO_BLOTATO } from './publish/blotato-map'
import { CalendarScheduleError } from './calendar-slot'

export async function applyBlotatoCallback(body: Record<string, unknown>, transaction = withTransaction) {
  const id = String(body.postSubmissionId || body.id || '').trim()
  if (!id || !['published', 'failed', 'scheduled'].includes(String(body.status))) throw new CalendarScheduleError('ID o stato callback non valido.', 400)
  if (body.postSubmissionId && body.id && String(body.id) !== id) throw new CalendarScheduleError('Identificativi callback discordanti.', 400)
  const status = String(body.status)
  return transaction(async query => {
    // Mai associare per giorno/orario/piattaforma: può essere il post di un
    // altro cliente. Il riferimento dell'invio originale deve essere univoco.
    const rows = await query('SELECT * FROM calendario WHERE blotato_post_id = $1 LIMIT 2 FOR UPDATE', [id])
    if (!rows.length) throw new CalendarScheduleError('Invio originale non trovato: nessuna associazione per somiglianza.', 404)
    if (rows.length !== 1) throw new CalendarScheduleError('ID di invio ambiguo: nessuno stato modificato.', 409)
    const row = rows[0]
    if (body.platform && String(body.platform) !== CANALE_TO_BLOTATO[String(row.canale)]) throw new CalendarScheduleError('Piattaforma del callback diversa dall’invio.', 409)
    const previous = String(row.blotato_status || '')
    const url = typeof body.post_url === 'string' && /^https:\/\//.test(body.post_url) ? body.post_url : null
    if (previous === 'published' && status !== 'published' || previous === 'failed' && status === 'scheduled'
      || previous === status && (status !== 'published' || row.blotato_post_url || !url)) return { ok: true, ignored: true }
    await query(`UPDATE calendario SET status = CASE WHEN $1 = 'failed' THEN 'ERRORE' ELSE 'PUBBLICATO' END,
      blotato_status = $1, blotato_post_url = COALESCE(blotato_post_url, $2),
      errore_tecnico = CASE WHEN $1 = 'failed' THEN $3 WHEN $1 = 'published' THEN NULL ELSE errore_tecnico END,
      publish_lock_id = CASE WHEN $1 IN ('published','failed') THEN NULL ELSE publish_lock_id END,
      blotato_sync_at = now(), updated_at = now() WHERE id = $4 AND cliente_id = $5 AND blotato_post_id = $6`,
      [status, url, `Blotato: ${String(body.error || 'Pubblicazione fallita').slice(0, 500)}`, row.id, row.cliente_id, id])
    if (previous !== status) await query(`INSERT INTO log_pubblicazioni (cliente_id, id_contenuto, canale, formato, status_precedente, status_finale, blotato_post_id, messaggio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Stato verificato da callback Blotato firmato; nessun reinvio')`,
      [row.cliente_id, row.id_contenuto, row.canale, row.formato, previous, status, id])
    return { ok: true, ignored: false }
  })
}
