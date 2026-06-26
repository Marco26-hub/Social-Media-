import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { scheduleOnBlotato } from '@/lib/publish/schedule'
import { validateMediaUrls, formatMediaError } from '@/lib/media-validate'
import { notifyAgency } from '@/lib/notifications'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const canale = searchParams.get('canale')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query: string
    const params: unknown[] = [cid]

    if (status && status !== 'tutti' && canale && canale !== 'tutti') {
      query = 'SELECT * FROM calendario WHERE cliente_id = $1 AND status = $2 AND canale = $3 ORDER BY data_pubblicazione ASC LIMIT $4'
      params.push(status, canale, limit)
    } else if (status && status !== 'tutti') {
      query = 'SELECT * FROM calendario WHERE cliente_id = $1 AND status = $2 ORDER BY data_pubblicazione ASC LIMIT $3'
      params.push(status, limit)
    } else if (canale && canale !== 'tutti') {
      query = 'SELECT * FROM calendario WHERE cliente_id = $1 AND canale = $2 ORDER BY data_pubblicazione ASC LIMIT $3'
      params.push(canale, limit)
    } else {
      query = 'SELECT * FROM calendario WHERE cliente_id = $1 ORDER BY data_pubblicazione ASC LIMIT $2'
      params.push(limit)
    }
    const rows = await q(query, params)
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const body = await request.json() as Record<string, unknown>
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })

    const fields: string[] = []
    const params: unknown[] = [id]
    for (const [key, val] of Object.entries(body)) {
      if (key === 'id') continue
      params.push(val)
      fields.push(`${key} = $${params.length}`)
    }
    if (body.status === 'APPROVATO') {
      params.push(new Date().toISOString())
      fields.push(`data_approvazione = $${params.length}`)

      // Validate media URLs before approving
      const currentContent = await q('SELECT * FROM calendario WHERE id = $1', [id])
      if (currentContent.length) {
        const row = currentContent[0] as Record<string, unknown>
        const mediaUrls = [row.link_media_1, row.link_media_2, row.link_media_3, row.link_media_4, row.link_media_5, row.link_media_6, row.link_media_7]
        if (mediaUrls.some(u => u)) {
          const validation = await validateMediaUrls(mediaUrls as (string | null | undefined)[])
          if (!validation.ok) {
            const errMsg = formatMediaError(validation.errors)
            params.push(errMsg)
            fields.push(`errore_tecnico = $${params.length}`)
          }
        }
      }
    }
    if (!fields.length) return NextResponse.json({ error: 'niente da aggiornare' }, { status: 400 })
    await q(`UPDATE calendario SET ${fields.join(', ')} WHERE id = $1`, params)

    // Se approvato, schedula su Blotato
    if (body.status === 'APPROVATO') {
      try {
        const content = await q('SELECT * FROM calendario WHERE id = $1', [id])
        if (content.length) {
          const row = content[0] as Record<string, unknown>
          const blotatoId = await scheduleOnBlotato(cid, row)
        }
      } catch (scheduleError) {
        console.error('Blotato scheduling failed:', scheduleError)
        await q('UPDATE calendario SET errore_tecnico = $1 WHERE id = $2', [
          `Blotato: ${(scheduleError as Error).message.slice(0, 300)}`,
          id,
        ])
      }
    }

    // Notifiche Telegram
    if (body.status) {
      const content = await q('SELECT * FROM calendario WHERE id = $1', [id])
      if (content.length) {
        const row = content[0] as Record<string, unknown>
        const statusStr = body.status as string
        if (statusStr === 'APPROVATO') {
          notifyAgency({ type: 'pubblicato', id_contenuto: row.id_contenuto as string, canale: row.canale as string, formato: row.formato as string }).catch(() => {})
        } else if (statusStr === 'ERRORE' || statusStr === 'ERRORE_MANUALE') {
          notifyAgency({ type: 'errore', id_contenuto: row.id_contenuto as string, canale: row.canale as string, errore: (row.errore_tecnico as string) || 'Errore sconosciuto' }).catch(() => {})
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
