import { createHash } from 'node:crypto'
import { q, withTransaction } from './db'
import { getBlotatoKey } from './blotato-key'
import { matchesPublishedProof } from './blotato-published-match'
import { remoteCalendarTime } from './calendar-display'
import { zonedToUtcIso, CANALE_TO_BLOTATO } from './publish/blotato-map'
import { CalendarScheduleError } from './calendar-slot'
import { parseBlotatoUpdate, publicationSummary, reconciliationRange, type BlotatoRow } from './blotato-lifecycle'

export type ReconcileDependencies = {
  query: typeof q; transaction: typeof withTransaction; key: typeof getBlotatoKey; fetch: typeof fetch; now: () => number
}
const dependencies: ReconcileDependencies = { query: q, transaction: withTransaction, key: getBlotatoKey, fetch, now: Date.now }
const base = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'

export async function reconcileClienteBlotato(cid: string, month?: string, deps = dependencies) {
  const client = (await deps.query('SELECT contenuti_mese, timezone FROM clienti WHERE id = $1 LIMIT 1', [cid]))[0]
  if (!client) throw new Error('Cliente non trovato')
  const timezone = String(client.timezone || 'Europe/Rome')
  const selectedMonth = month || new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit' }).format(new Date(deps.now()))
  const range = reconciliationRange(selectedMonth, timezone)
  // Recupera SOLO un ID originale accettato e salvato nel nostro ledger.
  // Copre un processo interrotto tra risposta Blotato e UPDATE calendario.
  await deps.query(`WITH originals AS (
    SELECT entity_id, MIN(payload->>'submission_id') AS submission_id,
      MIN(payload->>'account_id') AS account_id, MIN(payload->>'scheduled_time') AS scheduled_time
    FROM integration_events WHERE cliente_id = $1 AND provider = 'blotato' AND event_type = 'post_submission'
      AND status = 'processed' AND NULLIF(payload->>'submission_id','') IS NOT NULL
    GROUP BY entity_id HAVING COUNT(DISTINCT payload->>'submission_id') = 1
  ) UPDATE calendario c SET blotato_post_id = o.submission_id, platform_account_id = COALESCE(c.platform_account_id, o.account_id),
    blotato_scheduled_at = COALESCE(c.blotato_scheduled_at, o.scheduled_time::timestamptz),
    blotato_status = 'in-progress', status = 'PUBBLICATO', publish_lock_id = NULL, updated_at = now()
    FROM originals o WHERE c.id::text = o.entity_id AND c.cliente_id = $1 AND c.blotato_post_id IS NULL
      AND c.blotato_post_url IS NULL AND COALESCE(c.blotato_status,'') <> 'published'`, [cid])
  const summary = async () => publicationSummary(await deps.query(
    `SELECT * FROM calendario WHERE cliente_id = $1 AND data_pubblicazione >= $2::date
     AND data_pubblicazione < $3::date AND canale <> 'blog'`, [cid, range.start, range.end]), Math.max(0, Number(client.contenuti_mese) || 0))
  // Sospesi verificabili anche al cambio mese; conferme terminali non consumano il budget.
  const pending = await deps.query(
    `SELECT * FROM calendario WHERE cliente_id = $1 AND NULLIF(btrim(blotato_post_id), '') IS NOT NULL
     AND COALESCE(blotato_status, '') NOT IN ('published', 'failed') AND canale <> 'blog'
     ${month ? 'AND data_pubblicazione >= $2::date AND data_pubblicazione < $3::date' : ''}
     ORDER BY blotato_sync_at ASC NULLS FIRST, data_pubblicazione ASC, id ASC LIMIT 100`,
    month ? [cid, range.start, range.end] : [cid])
  const key = pending.length ? await deps.key(cid) : null
  if (pending.length && !key) throw new CalendarScheduleError('API key Blotato non configurata: stati non verificati', 503)
  const result = { ok: true, month: selectedMonth, reconciled: 0, checked: 0, unchecked: pending.length,
    deferred: false, remote_errors: [] as Array<{ id_contenuto: string; error: string }>, summary: await summary() }
  if (!key || !pending.length) return result
  // Lock e cooldown condivisi tra browser/cron/clienti con la stessa chiave.
  // Unica transazione: compatibile col pooler Supabase; nel DB solo l'hash.
  const keyHash = createHash('sha256').update(key).digest('hex')
  await deps.transaction(async query => {
    const locked = await query("SELECT pg_try_advisory_xact_lock(hashtext('swa-blotato-reconcile'), hashtext($1)) AS locked", [keyHash])
    if (!locked[0]?.locked) { result.deferred = true; result.ok = false; return }
    const recent = await query(`SELECT id FROM integration_events WHERE provider = 'blotato'
      AND event_type = 'status_reconcile' AND entity_id = $1 AND created_at > now() - interval '90 seconds' LIMIT 1`, [keyHash])
    if (recent.length) { result.deferred = true; result.ok = false; return }
    const event = (await query(`INSERT INTO integration_events (cliente_id, provider, event_type, direction, status, entity_type, entity_id)
      VALUES ($1, 'blotato', 'status_reconcile', 'outbound', 'processing', 'workspace', $2) RETURNING id`, [cid, keyHash]))[0]
    let requests = 0
    const started = deps.now()
    const read = async (path: string) => {
      if (requests >= 45 || deps.now() - started > 65000) throw new Error('Budget verifica esaurito: invii protetti, controllo al prossimo ciclo')
      requests++
      const response = await deps.fetch(`${base}${path}`, { method: 'GET', headers: { 'blotato-api-key': key, Accept: 'application/json' },
        cache: 'no-store', signal: AbortSignal.timeout(5000) })
      if (!response.ok) throw new Error(`Lettura Blotato HTTP ${response.status}: nessun reinvio`)
      return await response.json() as BlotatoRow
    }
    for (const row of pending) {
      if (requests >= 43 || deps.now() - started > 60000) break
      result.checked++
      try {
        const submissionId = String(row.blotato_post_id)
        const remote = await read(`/v2/posts/${encodeURIComponent(submissionId)}`)
        if (remote.postSubmissionId && String(remote.postSubmissionId) !== submissionId) throw new Error('ID risposta diverso dall’invio originale')
        let update = parseBlotatoUpdate(remote, timezone)
        let proofId: string | null = null
        const due = Date.parse(String(row.blotato_scheduled_at || ''))
        const overdue = Number.isFinite(due) && due < deps.now() - 15 * 60000
        if (['scheduled', 'in-progress'].includes(update.status) && overdue) {
          if (!row.hook || !row.platform_account_id) throw new Error('Invio scaduto senza account/hook verificabili: controllo manuale, non reinviare')
          const proofRange = reconciliationRange(String(row.data_pubblicazione).slice(0, 7), timezone)
          const start = zonedToUtcIso(proofRange.start, '00:00', timezone)
          const end = zonedToUtcIso(proofRange.end, '00:00', timezone)
          const params = new URLSearchParams({ query: String(row.hook), platform: CANALE_TO_BLOTATO[String(row.canale)], limit: '20' })
          const found = await read(`/v2/published-posts?${params}`)
          if (!Array.isArray(found.items) || !Number.isFinite(Number(found.count)) || Number(found.count) > 20 || found.items.length < Number(found.count)) throw new Error('Ricerca pubblicazioni incompleta o ambigua: stato conservato')
          const candidates = (found.items as BlotatoRow[]).filter(item => {
            const at = Date.parse(String(item.createdAt || ''))
            return item.platform === CANALE_TO_BLOTATO[String(row.canale)] && at >= Date.parse(start) && at < Date.parse(end)
              && String(item.content || '').replace(/\s+/g, ' ').trim().startsWith(String(row.hook).replace(/\s+/g, ' ').trim())
          })
          const originalTarget = (await query(`SELECT payload FROM integration_events WHERE cliente_id = $1 AND provider = 'blotato'
            AND event_type = 'post_submission' AND entity_id = $2 AND payload->>'submission_id' = $3 ORDER BY created_at DESC LIMIT 1`,
            [cid, String(row.id), submissionId]))[0]?.payload as BlotatoRow | undefined
          const originalPage = (originalTarget?.target as BlotatoRow | undefined)?.pageId
          const proofRow = originalPage ? { ...row, blotato_target_page_id: originalPage } : row
          const proofs: BlotatoRow[] = []
          for (const candidate of candidates) {
            if (!candidate.id) throw new Error('Prova pubblicazione senza ID')
            const detail = await read(`/v2/published-posts/${encodeURIComponent(String(candidate.id))}`)
            const proof = detail.publishedPost as BlotatoRow | undefined
            if (proof && String(proof.id) === String(candidate.id) && matchesPublishedProof(proofRow, proof, start, end)) proofs.push(proof)
          }
          if (proofs.length === 1) {
            const proof = proofs[0]
            update = { status: 'published', url: String(proof.postUrl || '') || null, error: null, time: remoteCalendarTime(proof.createdAt, timezone) }
            proofId = String(proof.id)
          } else if (proofs.length > 1) {
            throw new Error('Più pubblicazioni coincidono: possibile duplicato, nessuna modifica')
          } else if (update.status === 'in-progress' || (update.time && Date.parse(update.time.iso) < deps.now() - 15 * 60000)) {
            throw new Error('Invio scaduto senza prova univoca: stato conservato, non reinviare')
          }
        }
        const oldStatus = row.blotato_status ?? null
        const saved = await query(`WITH changed AS (
          UPDATE calendario SET status = CASE WHEN $1 = 'failed' THEN 'ERRORE' ELSE 'PUBBLICATO' END,
            blotato_status = $1, blotato_post_url = COALESCE($2, blotato_post_url), errore_tecnico = $3,
            publish_lock_id = CASE WHEN $1 IN ('published','failed') THEN NULL ELSE publish_lock_id END,
            data_pubblicazione = COALESCE($4::date, data_pubblicazione), ora_pubblicazione = COALESCE($5::time, ora_pubblicazione),
            blotato_scheduled_at = COALESCE($6::timestamptz, blotato_scheduled_at), blotato_sync_at = now(), updated_at = now()
          WHERE id = $7 AND cliente_id = $8 AND blotato_post_id = $9
            AND (blotato_status IS NOT DISTINCT FROM $10 OR blotato_status = $1)
            AND blotato_scheduled_at IS NOT DISTINCT FROM $12::timestamptz
            AND (blotato_status IS DISTINCT FROM 'published' OR $1 = 'published') RETURNING *
        ), logged AS (
          INSERT INTO log_pubblicazioni (cliente_id, id_contenuto, canale, formato, status_precedente, status_finale, blotato_post_id, messaggio)
          SELECT cliente_id, id_contenuto, canale, formato, $10, $1, blotato_post_id, $11 FROM changed WHERE $10 IS DISTINCT FROM $1 RETURNING id
        ) SELECT id FROM changed`,
        [update.status, update.url, update.error ? `Blotato: ${update.error}` : null, update.time?.day || null,
          update.time?.time || null, update.time?.iso || null, row.id, cid, submissionId, oldStatus,
          JSON.stringify({ source: proofId ? 'published-post-proof' : 'submission-status', proof_id: proofId, public_url: update.url, no_resend: true }), row.blotato_scheduled_at ?? null])
        if (!saved.length) throw new Error('Stato cambiato durante la verifica: risposta obsoleta scartata')
        if (update.time && update.status === 'scheduled') await query(`UPDATE integration_events SET status = 'processed', error_message = NULL, processed_at = now()
          WHERE cliente_id = $1 AND provider = 'blotato' AND event_type = 'schedule_time_update' AND entity_id = $2 AND status = 'processing'
            AND payload->>'submission_id' = $3 AND (payload->>'scheduled_time')::timestamptz = $4::timestamptz`, [cid, String(row.id), submissionId, update.time.iso])
        result.reconciled++
      } catch (error) {
        const note = error instanceof Error ? error.message : 'Verifica Blotato fallita'
        result.remote_errors.push({ id_contenuto: String(row.id_contenuto || row.id), error: note.slice(0, 220) })
        console.warn('[Blotato reconcile]', String(row.id_contenuto || row.id), note)
        await query(`UPDATE calendario SET blotato_sync_at = now(), errore_tecnico = $1 WHERE id = $2 AND cliente_id = $3
          AND blotato_post_id = $4 AND blotato_status IS NOT DISTINCT FROM $5 AND blotato_status IS DISTINCT FROM 'published'`,
          [`Verifica Blotato: ${note.slice(0, 450)}`, row.id, cid, row.blotato_post_id, row.blotato_status ?? null])
      }
    }
    result.unchecked = pending.length - result.checked
    result.ok = !result.remote_errors.length && !result.unchecked
    await query(`UPDATE integration_events SET status = $1, payload = $2::jsonb, processed_at = now(), error_message = $3 WHERE id = $4`,
      [result.ok ? 'processed' : 'failed', JSON.stringify({ checked: result.checked, reconciled: result.reconciled, unchecked: result.unchecked, requests, errors: result.remote_errors }),
        result.ok ? null : 'Verifica incompleta: nessun reinvio', event.id])
  })
  result.summary = await summary()
  return result
}
