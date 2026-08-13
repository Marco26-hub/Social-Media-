const BLOTATO_API_BASE = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'

// Template ufficiale "Image Slideshow with Text Overlays".
export const PHOTO_REEL_TEMPLATE_ID = '5903b592-1255-43b4-b9ac-f8ed7cbf6a5f'

type VisualResult = {
  id: string
  status: string
  mediaUrl: string
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function parseVisual(value: unknown): VisualResult {
  const root = record(value)
  const item = record(root.item || root.data || root.visual || root.video)
  return {
    id: text(root.id) || text(item.id),
    status: (text(root.status) || text(item.status) || 'queueing').toLowerCase(),
    mediaUrl: text(root.mediaUrl) || text(root.videoUrl) || text(item.mediaUrl) || text(item.videoUrl),
  }
}

function headers(blotatoKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${blotatoKey}`,
    'blotato-api-key': blotatoKey,
  }
}

export async function createPhotoReel(args: {
  blotatoKey: string
  imageUrls: string[]
  overlays: string[]
  prompt: string
}): Promise<VisualResult> {
  const slides = args.imageUrls.slice(0, 5).map((imageSource, index) => ({
    imageSource,
    textOverlay: args.overlays[index] || '',
  }))
  const res = await fetch(`${BLOTATO_API_BASE}/v2/videos/from-templates`, {
    method: 'POST',
    headers: headers(args.blotatoKey),
    body: JSON.stringify({
      templateId: PHOTO_REEL_TEMPLATE_ID,
      inputs: {
        slides,
        // Il centro resta fuori dalle aree normalmente coperte da username,
        // caption e pulsanti verticali delle app social.
        textPosition: 'center',
        textColor: '#FFFFFF',
      },
      prompt: args.prompt,
      render: true,
    }),
  })
  if (!res.ok) {
    const error = await res.text().catch(() => 'Errore sconosciuto')
    throw new Error(`Blotato visual ${res.status}: ${error.slice(0, 250)}`)
  }
  const result = parseVisual(await res.json())
  if (!result.id) throw new Error('Blotato visual creato senza ID')
  return result
}

export async function getPhotoReelStatus(blotatoKey: string, id: string): Promise<VisualResult> {
  const res = await fetch(`${BLOTATO_API_BASE}/v2/videos/creations/${encodeURIComponent(id)}`, {
    headers: headers(blotatoKey),
    cache: 'no-store',
  })
  if (!res.ok) {
    const error = await res.text().catch(() => 'Errore sconosciuto')
    throw new Error(`Stato visual Blotato ${res.status}: ${error.slice(0, 250)}`)
  }
  return parseVisual(await res.json())
}

export function visualIsDone(status: string): boolean {
  return ['done', 'completed', 'complete'].includes(status.toLowerCase())
}

export function visualIsFailed(status: string): boolean {
  return ['failed', 'creation-from-template-failed', 'error'].includes(status.toLowerCase())
}
