// STATO (2026-08-28): questo modulo NON è più referenziato dalla pipeline di
// pubblicazione — il montaggio dei Reel passa da lib/remotion-renderer.ts (vedi
// lib/publish/schedule.ts). Gli unici import restanti sono quelli del suo test.
// È quindi codice morto in attesa di una decisione: rimuoverlo, oppure ricablare
// createAudioMixedVideo se il mix audio via Blotato serve ancora. I difetti noti
// qui sotto sono stati corretti comunque, per non lasciare trappole se venisse
// riattivato.
const BLOTATO_API_BASE = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'

// Numero di slide che il template "Image Slideshow with Text Overlays" accetta.
export const PHOTO_REEL_MAX_SLIDES = 5

// Template ufficiale "Image Slideshow with Text Overlays". Blotato ha usato
// sia il solo UUID sia il percorso completo: per le richieste nuove preferiamo
// sempre l'ID esatto restituito dal catalogo /videos/templates.
export const PHOTO_REEL_TEMPLATE_UUID = '5903b592-1255-43b4-b9ac-f8ed7cbf6a5f'
export const PHOTO_REEL_TEMPLATE_ID = `/base/v2/image-slideshow/${PHOTO_REEL_TEMPLATE_UUID}/v1`
export const AUDIO_MIX_TEMPLATE_UUID = 'c306ae43-1dcc-4f45-ac2b-88e75430ffd8'

const TEMPLATE_CACHE_TTL_MS = 5 * 60 * 1000
// Cache indicizzata per API key: era una singola variabile di modulo, quindi il
// primo cliente che risolveva il catalogo fissava l'ID per 5 minuti per TUTTI i
// workspace serviti dallo stesso processo.
const photoReelTemplateCache = new Map<string, { id: string; expiresAt: number }>()

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

function templateItems(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.map(record)
  const root = record(value)
  for (const key of ['items', 'data', 'templates']) {
    const items = root[key]
    if (Array.isArray(items)) return items.map(record)
  }
  return []
}

export function selectPhotoReelTemplateId(value: unknown): string {
  const ranked = templateItems(value)
    .map(item => {
      const id = text(item.id)
      const label = [item.title, item.name, item.description, id]
        .map(text)
        .join(' ')
        .toLowerCase()
      let score = 0
      if (id.includes(PHOTO_REEL_TEMPLATE_UUID)) score += 100
      if (label.includes('image slideshow')) score += 40
      if (label.includes('text overlay')) score += 25
      if (id.includes('/image-slideshow/')) score += 20
      return { id, score }
    })
    .filter(candidate => candidate.id && candidate.score >= 40)
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.id || ''
}

async function resolvePhotoReelTemplateId(blotatoKey: string, force = false): Promise<string> {
  const cached = photoReelTemplateCache.get(blotatoKey)
  if (!force && cached && cached.expiresAt > Date.now()) {
    return cached.id
  }

  try {
    const params = new URLSearchParams({ fields: 'id,title,name,description' })
    const res = await fetch(`${BLOTATO_API_BASE}/v2/videos/templates?${params}`, {
      headers: headers(blotatoKey),
      cache: 'no-store',
    })
    if (res.ok) {
      const templateId = selectPhotoReelTemplateId(await res.json())
      if (templateId) {
        photoReelTemplateCache.set(blotatoKey, {
          id: templateId,
          expiresAt: Date.now() + TEMPLATE_CACHE_TTL_MS,
        })
        return templateId
      }
    }
  } catch {
    // Il catalogo e un controllo di compatibilita: il percorso canonico resta
    // disponibile come fallback quando la lettura temporaneamente non riesce.
  }

  return PHOTO_REEL_TEMPLATE_ID
}

function photoReelBody(args: {
  imageUrls: string[]
  overlays: string[]
  prompt: string
}, templateId: string): string {
  const slides = args.imageUrls.slice(0, PHOTO_REEL_MAX_SLIDES).map((imageSource, index) => ({
    imageSource,
    textOverlay: args.overlays[index] || '',
  }))
  if (args.imageUrls.length > PHOTO_REEL_MAX_SLIDES) {
    // Il chiamante non poteva distinguere "montate tutte" da "montate 5 su 10".
    console.warn(`[Blotato] photo reel: ${args.imageUrls.length} immagini fornite, il template ne accetta ${PHOTO_REEL_MAX_SLIDES}: le altre ${args.imageUrls.length - PHOTO_REEL_MAX_SLIDES} sono state scartate.`)
  }
  return JSON.stringify({
    templateId,
    inputs: {
      slides,
      // Il centro resta fuori dalle aree normalmente coperte da username,
      // caption e pulsanti verticali delle app social.
      textPosition: 'center',
      textColor: '#FFFFFF',
    },
    prompt: args.prompt,
    render: true,
  })
}

export async function createPhotoReel(args: {
  blotatoKey: string
  imageUrls: string[]
  overlays: string[]
  prompt: string
}): Promise<VisualResult> {
  const create = (templateId: string) => fetch(`${BLOTATO_API_BASE}/v2/videos/from-templates`, {
    method: 'POST',
    headers: headers(args.blotatoKey),
    body: photoReelBody(args, templateId),
  })

  let templateId = await resolvePhotoReelTemplateId(args.blotatoKey)
  let res = await create(templateId)
  let error = res.ok ? '' : await res.text().catch(() => 'Errore sconosciuto')

  // Se Blotato ha ruotato il catalogo tra due richieste, aggiorna l'ID e riprova
  // una sola volta. Non si ritentano altri 4xx/5xx per evitare doppie creazioni.
  if (res.status === 404 && /unknown template id/i.test(error)) {
    photoReelTemplateCache.delete(args.blotatoKey)
    const refreshedTemplateId = await resolvePhotoReelTemplateId(args.blotatoKey, true)
    if (refreshedTemplateId !== templateId) {
      templateId = refreshedTemplateId
      res = await create(templateId)
      error = res.ok ? '' : await res.text().catch(() => 'Errore sconosciuto')
    }
  }

  if (!res.ok) {
    throw new Error(`Blotato visual ${res.status}: ${error.slice(0, 250)}`)
  }
  const result = parseVisual(await res.json())
  if (!result.id) throw new Error('Blotato visual creato senza ID')
  return result
}

// Replica il flusso usato dagli agenti Blotato: la traccia non viene allegata al
// post, ma incorporata in un nuovo MP4 tramite il template Combine Clips. Usiamo
// il prompt con URL esatti perche gli input del template sono versionati nel
// catalogo Blotato; il template li compila e restituisce un visual asincrono.
export async function createAudioMixedVideo(args: {
  blotatoKey: string
  videoUrl: string
  audioUrl: string
  title?: string
}): Promise<VisualResult> {
  const prompt = [
    'Combine exactly one existing vertical social video with one audio/music track.',
    `VIDEO URL (use exactly this file): ${args.videoUrl}`,
    `AUDIO/MUSIC URL (use exactly this file): ${args.audioUrl}`,
    'Keep the original 9:16 framing, full video duration and original visual quality.',
    'Start the music at 00:00, trim it to the video duration, add a short fade-out, and do not add titles, captions, watermarks, black frames or extra clips.',
    args.title ? `Track reference: ${args.title}` : '',
  ].filter(Boolean).join('\n')

  const res = await fetch(`${BLOTATO_API_BASE}/v2/videos/from-templates`, {
    method: 'POST',
    headers: headers(args.blotatoKey),
    body: JSON.stringify({
      templateId: AUDIO_MIX_TEMPLATE_UUID,
      inputs: {},
      prompt,
      render: true,
    }),
  })
  if (!res.ok) {
    const error = await res.text().catch(() => 'Errore sconosciuto')
    throw new Error(`Blotato audio visual ${res.status}: ${error.slice(0, 250)}`)
  }
  const result = parseVisual(await res.json())
  if (!result.id) throw new Error('Blotato audio visual creato senza ID')
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
