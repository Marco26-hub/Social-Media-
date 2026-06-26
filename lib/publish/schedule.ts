// Publish Bridge: invia contenuto a Blotato per pubblicazione social
// Chiamato quando status → APPROVATO. Supporta tutti i formati.

import { q } from '@/lib/db'
import { validateMediaUrls } from '@/lib/media-validate'

const BLOTATO_API_BASE = process.env.BLOTATO_API_URL || 'https://api.blotato.com'
const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY

type ContentRow = Record<string, unknown>

export async function scheduleOnBlotato(
  clienteId: string,
  row: ContentRow,
) {
  if (!BLOTATO_API_KEY) {
    console.warn('[Blotato] BLOTATO_API_KEY non configurata')
    return null
  }

  const canale = row.canale as string
  const formato = row.formato as string

  // Costruisci il contenuto testuale completo per la piattaforma
  const content = buildPlatformContent(canale, formato, row)

  // Raccogli media disponibili (fino a 7)
  const mediaUrls = [row.link_media_1, row.link_media_2, row.link_media_3, row.link_media_4, row.link_media_5, row.link_media_6, row.link_media_7]
    .filter((u): u is string => typeof u === 'string' && u.length > 0)

  // Validate media URLs before sending to Blotato
  if (mediaUrls.length > 0) {
    const validation = await validateMediaUrls(mediaUrls)
    if (!validation.ok) {
      const invalid = validation.errors.map(e => `[media_${e.index}] ${e.url}: ${e.reason}`).join('; ')
      throw new Error(`Media validation failed before Blotato: ${invalid}`)
    }
  }

  const scheduledAt = `${row.data_pubblicazione}T${String(row.ora_pubblicazione).slice(0, 5)}:00`

  // Payload ricco per Blotato
  const payload: Record<string, unknown> = {
    platform: canale,
    format: formato,
    content,
    media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
    scheduled_at: scheduledAt,
    metadata: {
      hook: row.hook || null,
      cta: row.cta || null,
      link: row.link_prodotto || null,
      hashtag: row.hashtag || null,
      alt_text: row.alt_text || null,
      overlay_text: row.overlay_text || null,
      thumbnail_url: row.thumbnail_url || null,
      voiceover_script: row.voiceover_script || null,
      music_mood: row.music_mood || null,
      scenes_json: row.scenes_json || null,
      slides_json: row.slides_json || null,
      idea_visual: row.idea_visual || null,
      nome_prodotto: row.nome_prodotto || null,
      product_link: row.link_prodotto_finale || row.link_prodotto || null,
      utm_source: row.utm_source || canale,
      utm_medium: 'social',
      utm_campaign: row.utm_campaign || 'social_default',
    },
  }

  console.log(`[Blotato] Sending ${canale}/${formato} scheduled at ${scheduledAt}`)

  const res = await fetch(`${BLOTATO_API_BASE}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BLOTATO_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text().catch(() => 'Unknown error')
    throw new Error(`Blotato ${res.status}: ${error.slice(0, 200)}`)
  }

  const result = await res.json()
  const blotatoId = result.id || result.scheduled_id

  // Aggiorna status locale
  if (blotatoId && row.id) {
    await q(
      `UPDATE calendario
       SET blotato_post_id = $1, blotato_status = 'scheduled', blotato_scheduled_at = $2, blotato_sync_at = now()
       WHERE id = $3 AND cliente_id = $4`,
      [blotatoId, scheduledAt, row.id, clienteId],
    )
  }

  return blotatoId
}

function buildPlatformContent(canale: string, formato: string, row: ContentRow): string {
  const hook = (row.hook || '') as string
  const caption = (row.caption || '') as string
  const cta = (row.cta || '') as string
  const hashtag = (row.hashtag || '') as string
  const nomeProdotto = (row.nome_prodotto || '') as string

  const parts: string[] = []

  if (hook) parts.push(hook)

  if (caption && caption !== hook) {
    // Per reel/short/story: caption breve
    if (['reel', 'short', 'story'].includes(formato)) {
      parts.push(caption.slice(0, 300))
    } else {
      parts.push(caption)
    }
  }

  if (cta && !['story'].includes(formato)) {
    parts.push(`\n${cta}`)
  }

  if (hashtag) {
    // Instagram: hashtag nel primo commento (metadata.first_comment)
    // Facebook/TikTok/Pinterest: hashtag nella caption
    if (['facebook', 'tiktok', 'pinterest'].includes(canale)) {
      parts.push(`\n${hashtag}`)
    }
  }

  if (nomeProdotto && !parts.some(p => p.includes(nomeProdotto))) {
    parts.push(`\n📦 ${nomeProdotto}`)
  }

  const content = parts.join('\n\n').trim()
  return content || hook || caption || ''
}
