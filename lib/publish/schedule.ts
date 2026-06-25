// Publish Bridge: schedula contenuto su Blotato quando viene approvato
// Chiamato automaticamente quando status → APPROVATO

import { q } from '@/lib/db'

const BLOTATO_API_BASE = process.env.BLOTATO_API_URL || 'https://api.blotato.com'
const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY

type BlotatoSchedulePayload = {
  platform: string
  content: string
  media_urls?: string[]
  scheduled_at: string
  metadata?: Record<string, unknown>
}

export async function scheduleOnBlotato(
  clienteId: string,
  canale: string,
  content: string,
  scheduledAt: string,
  mediaUrls: string[] = [],
  metadata: Record<string, unknown> = {},
) {
  if (!BLOTATO_API_KEY) {
    throw new Error('BLOTATO_API_KEY non configurata')
  }

  // Trova account Blotato per questo cliente e piattaforma
  const accounts = await q(
    'SELECT platform_account_id FROM social_accounts WHERE cliente_id = $1 AND platform = $2 AND attivo = true LIMIT 1',
    [clienteId, canale],
  )

  if (!accounts.length) {
    throw new Error(`Nessun account ${canale} collegato per questo cliente`)
  }

  const payload: BlotatoSchedulePayload = {
    platform: canale,
    content,
    media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
    scheduled_at: scheduledAt,
    metadata,
  }

  const res = await fetch(`${BLOTATO_API_BASE}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BLOTATO_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Blotato scheduling failed: ${res.status} ${error}`)
  }

  const result = await res.json()
  return result.id || result.scheduled_id
}
