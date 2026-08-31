import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAdmin, requireAuth, requireClienteId } from '@/lib/auth-utils'
import { validateMediaUrls, formatMediaError } from '@/lib/media-validate'
import { notifyAgency } from '@/lib/notifications'
import { isDemo } from '@/lib/demo'
import { demoContenuti } from '@/lib/demo-data'
import { getTableColumns } from '@/lib/db-schema'
import { toYmd } from '@/lib/publish/blotato-map'

// L'approvazione non innesca piu alcun montaggio (l'invio a Blotato e il render
// avvengono solo dalle route di sincronizzazione). Il tetto resta alto perche la
// GET del calendario puo restituire molte righe con molte colonne.
export const maxDuration = 300

const CALENDARIO_UPDATE_COLUMNS = new Set([
  'data_pubblicazione',
  'ora_pubblicazione',
  'canale',
  'formato',
  'obiettivo',
  'product_id',
  'nome_prodotto',
  'tema',
  'hook',
  'caption',
  'hashtag',
  'cta',
  'link_media_1',
  'link_media_2',
  'link_media_3',
  'link_media_4',
  'link_media_5',
  'link_media_6',
  'link_media_7',
  'link_media_8',
  'link_media_9',
  'link_media_10',
  'link_prodotto',
  'link_prodotto_finale',
  'status',
  'approvato_da',
  'errore',
  'note',
  'platform_account_id',
  'publish_lock_id',
  'retry_count',
  'media_type',
  'media_validato',
  'errore_tecnico',
  'checked_copy',
  'checked_media',
  'checked_link',
  'checked_price',
  'checked_by',
  'checked_at',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'promo_id',
  'promo_codice',
  'promo_validata',
  'fonte_media',
  'consenso_utilizzo',
  'scenes_json',
  'slides_json',
  'overlay_text',
  'alt_text',
  'tags',
  'thumbnail_url',
  'idea_visual',
  'voiceover_script',
  'music_mood',
  'reel_audio_url',
  'reel_audio_title',
  'reel_audio_source_url',
  'reel_audio_license',
  'quality_level',
  'audience_segment',
  'funnel_stage',
  'angle',
  'primary_message',
  'proof_points',
  'hook_variants',
  'caption_long',
  'cta_variants',
  'creative_brief',
  'template_id',
  'template_style',
  'layout_spec_json',
  'asset_requirements_json',
  'production_notes',
  'compliance_notes',
  'risk_flags',
  'platform_best_practices',
  'ab_variants_json',
  'kpi_target',
  'expected_outcome',
  'production_cycle_stage',
  'optimization_cycle_json',
  'performance_hypothesis',
  'next_iteration_actions',
  'missing_inputs',
  'content_checklist',
  'strategy_profile',
  'business_category',
  'checked_alt_text',
  'checked_aspect_ratio',
  'checked_media_valid',
  'blotato_visual_id',
  'blotato_visual_status',
  'blotato_visual_media_url',
  'blotato_visual_source_hash',
  'blotato_audio_visual_id',
  'blotato_audio_visual_status',
  'blotato_audio_visual_media_url',
  'blotato_audio_visual_updated_at',
])

async function repairCoordinatedNoveltyErrors(clienteId: string) {
  await q(`
    UPDATE calendario AS affected
       SET status = 'DA_APPROVARE',
           note = NULL,
           errore_tecnico = NULL,
           updated_at = now()
     WHERE affected.cliente_id = $1
       AND affected.status = 'ERRORE_MANUALE'
       AND affected.note LIKE '[NOVELTY_GATE] Somiglianza creativa 100% con %'
       AND affected.errore_tecnico LIKE 'Contenuto da differenziare: Somiglianza creativa 100% con %'
       AND NULLIF(affected.campaign_content_key, '') IS NOT NULL
       AND EXISTS (
         SELECT 1
           FROM calendario AS coordinated
          WHERE coordinated.cliente_id = affected.cliente_id
            AND coordinated.campaign_content_key = affected.campaign_content_key
            AND LOWER(coordinated.canale) <> LOWER(affected.canale)
            AND COALESCE(coordinated.hook, '') = COALESCE(affected.hook, '')
       )
  `, [clienteId])
}

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const canale = searchParams.get('canale')
    const formato = searchParams.get('formato')
    const obiettivo = searchParams.get('obiettivo')
    const search = searchParams.get('q')?.trim()
    // Clamp esplicito: `?limit=abc` finiva come NaN nel LIMIT $n (errore driver →
    // 500) e `?limit=999999999` restituiva l'intero calendario in una risposta.
    const limitRichiesto = Number(searchParams.get('limit') ?? 50)
    const limit = Number.isFinite(limitRichiesto) ? Math.min(Math.max(Math.trunc(limitRichiesto), 1), 500) : 50

    if (isDemo() || !dbReady()) {
      let rows = demoContenuti
      if (status && status !== 'tutti') rows = rows.filter((item) => item.status === status)
      if (canale && canale !== 'tutti') rows = rows.filter((item) => item.canale === canale)
      if (formato && formato !== 'tutti') rows = rows.filter((item) => item.formato === formato)
      if (obiettivo && obiettivo !== 'tutti') rows = rows.filter((item) => item.obiettivo === obiettivo)
      if (search) {
        const needle = search.toLowerCase()
        rows = rows.filter((item) => [
          item.id_contenuto, item.hook, item.caption, item.tema, item.nome_prodotto,
        ].some(value => String(value || '').toLowerCase().includes(needle)))
      }
      return NextResponse.json(rows.slice(0, limit))
    }

    const cid = await requireClienteId()
    // Bonifica i falsi positivi creati dal vecchio novelty gate: gli adattamenti
    // coordinati Facebook/Instagram condividono intenzionalmente hook e chiave.
    await repairCoordinatedNoveltyErrors(cid)
    const params: unknown[] = [cid]
    const where = ['cliente_id = $1']
    const addFilter = (column: string, value: string | null) => {
      if (!value || value === 'tutti') return
      params.push(value)
      where.push(`${column} = $${params.length}`)
    }
    addFilter('status', status)
    addFilter('canale', canale)
    addFilter('formato', formato)
    addFilter('obiettivo', obiettivo)
    if (search) {
      params.push(`%${search}%`)
      where.push(`(
        id_contenuto ILIKE $${params.length}
        OR hook ILIKE $${params.length}
        OR caption ILIKE $${params.length}
        OR tema ILIKE $${params.length}
        OR nome_prodotto ILIKE $${params.length}
      )`)
    }
    params.push(limit)
    const query = `SELECT * FROM calendario
      WHERE ${where.join(' AND ')}
      ORDER BY data_pubblicazione ASC, ora_pubblicazione ASC
      LIMIT $${params.length}`
    const rows = await q(query, params)
    // `data_pubblicazione` è una colonna `date`: senza normalizzazione il client
    // riceve "2026-07-18T00:00:00.000Z", mentre tutta la UI (statistiche "oggi",
    // barra della settimana, raggruppamento per giorno, griglia mensile,
    // preflight) confronta stringhe 'YYYY-MM-DD' e quindi non trovava mai nulla.
    return NextResponse.json(rows.map(r => ({ ...r, data_pubblicazione: toYmd(r.data_pubblicazione) })))
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth()
    const body = await request.json() as Record<string, unknown>
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ ok: true, demo: true })
    }

    const cid = await requireClienteId()
    const calendarioColumns = await getTableColumns('calendario')
    const existingContent = await q('SELECT * FROM calendario WHERE id = $1 AND cliente_id = $2', [id, cid])
    if (!existingContent.length) {
      return NextResponse.json({ error: 'contenuto non trovato' }, { status: 404 })
    }
    if (
      body.data_pubblicazione
      && (existingContent[0] as Record<string, unknown>).blotato_post_id
      && body.data_pubblicazione !== toYmd((existingContent[0] as Record<string, unknown>).data_pubblicazione)
    ) {
      return NextResponse.json({ error: 'contenuto già sincronizzato con Blotato: rimettilo in coda prima di cambiare data' }, { status: 409 })
    }

    const fields: string[] = []
    const params: unknown[] = [id, cid]
    const skippedSchemaFields: string[] = []
    for (const [key, val] of Object.entries(body)) {
      if (!CALENDARIO_UPDATE_COLUMNS.has(key)) continue
      if (!calendarioColumns.has(key)) {
        skippedSchemaFields.push(key)
        continue
      }
      params.push(val)
      fields.push(`${key} = $${params.length}`)
    }
    if (body.status === 'APPROVATO') {
      const existing = existingContent[0] as Record<string, unknown>
      const isPublishRetry = ['ERRORE', 'ERRORE_MANUALE'].includes(String(existing.status || ''))
        || String(existing.blotato_status || '').toLowerCase() === 'failed'

      // Un errore remoto conserva volutamente il submission id per audit. Quando
      // l'utente preme "Riprova pubblicazione", pero, quel vecchio id impedirebbe
      // allo scheduler di acquisire il lock e il contenuto non verrebbe reinviato.
      // Azzera solo tentativi falliti, mai post scheduled/published.
      if (isPublishRetry) {
        for (const column of ['blotato_post_id', 'blotato_status', 'blotato_post_url', 'blotato_scheduled_at', 'blotato_sync_at']) {
          if (calendarioColumns.has(column)) fields.push(`${column} = NULL`)
        }
      }

      // Un Reel creato da foto richiede una seconda approvazione: questa PATCH
      // è il consenso esplicito dato DOPO aver visto l'MP4 nella Preview.
      if (
        calendarioColumns.has('blotato_visual_status')
        && String(existing.blotato_visual_status || '') === 'ready_for_review'
      ) {
        params.push('approved')
        fields.push(`blotato_visual_status = $${params.length}`)
      }
      if (
        calendarioColumns.has('blotato_audio_visual_status')
        && String(existing.blotato_audio_visual_status || '') === 'ready_for_review'
      ) {
        params.push('approved')
        fields.push(`blotato_audio_visual_status = $${params.length}`)
      }
      if (calendarioColumns.has('data_approvazione')) {
        params.push(new Date().toISOString())
        fields.push(`data_approvazione = $${params.length}`)
      }

      // Validate media URLs before approving
      const row = { ...(existingContent[0] as Record<string, unknown>), ...body }
      const mediaUrls = [row.link_media_1, row.link_media_2, row.link_media_3, row.link_media_4, row.link_media_5, row.link_media_6, row.link_media_7, row.link_media_8, row.link_media_9, row.link_media_10]
      if (mediaUrls.some(u => u)) {
        const validation = await validateMediaUrls(mediaUrls as (string | null | undefined)[])
        if (!validation.ok && calendarioColumns.has('errore_tecnico')) {
          const errMsg = formatMediaError(validation.errors)
          params.push(errMsg)
          fields.push(`errore_tecnico = $${params.length}`)
        }
      }
    }
    if (!fields.length) {
      if (skippedSchemaFields.length) return NextResponse.json({ ok: true, schema_fallback: true, skipped_fields: skippedSchemaFields })
      return NextResponse.json({ error: 'niente da aggiornare' }, { status: 400 })
    }
    await q(`UPDATE calendario SET ${fields.join(', ')} WHERE id = $1 AND cliente_id = $2`, params)

    // APPROVAZIONE E INVIO SONO DUE PASSI DISTINTI.
    //
    // Prima l'approvazione chiamava scheduleOnBlotato immediatamente: cliccare
    // "Approva" mandava il contenuto in coda su Blotato nello stesso istante, e il
    // pulsante "Sincronizza Blotato" restava solo un recupero per i falliti. Chi
    // approvava per dare l'ok editoriale si trovava il post gia programmato sui
    // social, senza un secondo passaggio volontario — ed e successo davvero: un
    // carosello e uscito su Instagram prima che ci si accorgesse dell'invio.
    //
    // Ora "Approva" cambia SOLO lo stato. Il trasferimento a Blotato avviene
    // esclusivamente da "Sincronizza Blotato" (POST /api/data/blotato-sync) o da
    // "Sincronizza questo" (sync-uno), che restano gli unici punti di invio.
    const schedulingError: string | null = null
    const publishStatus: 'scheduled' | 'visual_pending' | 'visual_review' | 'dry_run' | 'skipped' | null = null
    const publishNote: string | null = body.status === 'APPROVATO'
      ? 'Contenuto approvato. Non e stato inviato ai social: usa "Sincronizza Blotato" quando vuoi trasferirlo.'
      : null

    // Notifiche Telegram
    if (body.status) {
      const content = await q('SELECT * FROM calendario WHERE id = $1 AND cliente_id = $2', [id, cid])
      if (content.length) {
        const row = content[0] as Record<string, unknown>
        const statusStr = body.status as string
        // Notifica 'pubblicato' SOLO se davvero programmato (non dry-run/skipped).
        if (statusStr === 'APPROVATO' && publishStatus === 'scheduled') {
          notifyAgency({ type: 'pubblicato', id_contenuto: row.id_contenuto as string, canale: row.canale as string, formato: row.formato as string }).catch(() => {})
        } else if (statusStr === 'ERRORE' || statusStr === 'ERRORE_MANUALE') {
          notifyAgency({ type: 'errore', id_contenuto: row.id_contenuto as string, canale: row.canale as string, errore: (row.errore_tecnico as string) || 'Errore sconosciuto' }).catch(() => {})
        }
      }
    }

    // Non nascondere il fallimento di scheduling: l'approvazione è andata (status
    // salvato) ma la pubblicazione NON è stata programmata → il frontend deve avvisare.
    if (schedulingError) {
      return NextResponse.json({ ok: true, scheduled: false, scheduling_error: schedulingError, ...(skippedSchemaFields.length ? { schema_fallback: true, skipped_fields: skippedSchemaFields } : {}) })
    }
    return NextResponse.json({
      ok: true,
      ...(body.status === 'APPROVATO'
        ? { scheduled: publishStatus === 'scheduled', publish_status: publishStatus, ...(publishNote ? { publish_note: publishNote } : {}) }
        : {}),
      ...(skippedSchemaFields.length ? { schema_fallback: true, skipped_fields: skippedSchemaFields } : {}),
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)

    // Supporta sia il delete singolo (?id=) sia il bulk (?ids=id1,id2,... oppure body {ids:[]}).
    // Il bulk serve a svuotare in un colpo i contenuti-BOZZA di un piano editoriale generato.
    let ids: string[] = []
    const singleId = searchParams.get('id')
    const idsParam = searchParams.get('ids')
    if (singleId) ids = [singleId]
    else if (idsParam) ids = idsParam.split(',').map(s => s.trim()).filter(Boolean)
    else {
      // Prova dal body JSON (DELETE con body è valido lato fetch).
      const body = await request.json().catch(() => null) as { ids?: unknown } | null
      if (Array.isArray(body?.ids)) ids = body.ids.filter((x): x is string => typeof x === 'string' && x.length > 0)
    }

    if (!ids.length) return NextResponse.json({ error: 'id o ids richiesti' }, { status: 400 })
    // Cap difensivo: evita richieste giganti accidentali.
    if (ids.length > 500) return NextResponse.json({ error: 'Massimo 500 contenuti per eliminazione' }, { status: 400 })

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ ok: true, demo: true, deleted: ids.length, deleted_ids: ids })
    }

    const cid = await requireClienteId()
    // Seleziona SOLO i contenuti che appartengono davvero al cliente attivo (tenant guard).
    const placeholders = ids.map((_, i) => `$${i + 2}`).join(',')
    const rows = await q(
      `SELECT * FROM calendario WHERE cliente_id = $1 AND id IN (${placeholders})`,
      [cid, ...ids],
    ) as Record<string, unknown>[]

    if (!rows.length) {
      return NextResponse.json({ error: 'nessun contenuto trovato per gli id richiesti' }, { status: 404 })
    }

    const foundIds = rows.map(r => r.id as string)
    const foundPlaceholders = foundIds.map((_, i) => `$${i + 2}`).join(',')
    const contenutoIds = rows.map(r => r.id_contenuto).filter(Boolean) as string[]

    // Elimina i token di approvazione collegati (se presenti).
    if (contenutoIds.length) {
      const tokPlaceholders = contenutoIds.map((_, i) => `$${i + 2}`).join(',')
      await q(
        `DELETE FROM approval_tokens WHERE cliente_id = $1 AND contenuto_id IN (${tokPlaceholders})`,
        [cid, ...contenutoIds],
      )
    }
    await q(
      `DELETE FROM calendario WHERE cliente_id = $1 AND id IN (${foundPlaceholders})`,
      [cid, ...foundIds],
    )

    // Log per ogni contenuto eliminato (tracciabilità admin).
    for (const row of rows) {
      await q(
        `INSERT INTO log_pubblicazioni (cliente_id, id_contenuto, canale, formato, status_precedente, status_finale, messaggio)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          cid,
          row.id_contenuto || null,
          row.canale || null,
          row.formato || null,
          row.status || null,
          'ARCHIVIATO',
          ids.length > 1 ? 'Contenuto cancellato da admin (eliminazione multipla)' : 'Contenuto cancellato da admin',
        ],
      )
    }

    // Segnala se alcuni id richiesti non erano del cliente / inesistenti (niente silenzio).
    const skipped = ids.filter(id => !foundIds.includes(id))
    return NextResponse.json({
      ok: true,
      deleted: foundIds.length,
      deleted_ids: foundIds,
      ...(skipped.length ? { skipped: skipped.length, warning: `${skipped.length} id ignorati (non trovati o di altro cliente)` } : {}),
    })
  } catch (e) {
    return apiError(e)
  }
}
