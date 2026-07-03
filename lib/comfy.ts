// Integrazione ComfyUI LOCALE per generare immagini AI gratis (gira sul Mac
// dell'utente, porta 8188). Come Ollama: funziona SOLO quando l'app gira in locale
// sulla stessa macchina di ComfyUI — su Render/cloud non può raggiungere localhost.
//
// Env:
//   COMFY_URL         base ComfyUI, default http://127.0.0.1:8188
//   COMFY_CHECKPOINT  nome del checkpoint installato (es. "sd_xl_base_1.0.safetensors").
//                     OBBLIGATORIO: dev'essere un checkpoint presente in ComfyUI/models/checkpoints.

export function comfyBaseUrl(): string {
  return (process.env.COMFY_URL || 'http://127.0.0.1:8188').replace(/\/$/, '')
}

export function comfyCheckpoint(): string {
  return process.env.COMFY_CHECKPOINT?.trim() || 'sd_xl_base_1.0.safetensors'
}

// ComfyUI raggiungibile? (per la UI/status, timeout breve)
export async function comfyReachable(timeoutMs = 1500): Promise<boolean> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${comfyBaseUrl()}/system_stats`, { signal: controller.signal })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(t)
  }
}

// Dimensioni per formato social (multipli di 8, richiesto da SDXL).
export function sizeForFormato(formato: string): { width: number; height: number } {
  const f = (formato || '').toLowerCase()
  if (['reel', 'story', 'short', 'video'].includes(f)) return { width: 768, height: 1344 } // 9:16
  if (f === 'carousel') return { width: 1024, height: 1280 }                                 // 4:5
  return { width: 1024, height: 1024 }                                                       // 1:1 post/default
}

// Workflow SDXL text2img in formato API ComfyUI (grafo di nodi).
function buildWorkflow(prompt: string, negative: string, width: number, height: number, seed: number) {
  const ckpt = comfyCheckpoint()
  return {
    '3': { class_type: 'KSampler', inputs: { seed, steps: 28, cfg: 7, sampler_name: 'dpmpp_2m', scheduler: 'karras', denoise: 1, model: ['4', 0], positive: ['6', 0], negative: ['7', 0], latent_image: ['5', 0] } },
    '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: ckpt } },
    '5': { class_type: 'EmptyLatentImage', inputs: { width, height, batch_size: 1 } },
    '6': { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['4', 1] } },
    '7': { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['4', 1] } },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'social-automation', images: ['8', 0] } },
  }
}

type HistoryOutputs = Record<string, { outputs?: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }> }>

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/**
 * Genera un'immagine con ComfyUI e ritorna i byte PNG + mime.
 * Lancia con messaggio chiaro se ComfyUI non è raggiungibile o la generazione fallisce.
 * maxWaitMs: tempo massimo di attesa del render (SDXL su Mac può richiedere 20-60s).
 */
export async function generateImageComfy(opts: {
  prompt: string
  negative?: string
  width?: number
  height?: number
  maxWaitMs?: number
}): Promise<{ bytes: Buffer; mime: string }> {
  const base = comfyBaseUrl()
  const negative = opts.negative || 'testo, watermark, logo, deformità, bassa qualità, sfocato, distorto'
  const width = opts.width || 1024
  const height = opts.height || 1024
  const maxWaitMs = opts.maxWaitMs || 120000
  // Seed casuale per varietà (runtime app: Math.random consentito).
  const seed = Math.floor(Math.random() * 1_000_000_000)

  // 1) Invia il workflow.
  let promptId: string
  try {
    const res = await fetch(`${base}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: buildWorkflow(opts.prompt, negative, width, height, seed) }),
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(`ComfyUI /prompt ${res.status}: ${t.slice(0, 200)}`)
    }
    const data = await res.json() as { prompt_id?: string }
    if (!data.prompt_id) throw new Error('ComfyUI non ha restituito un prompt_id')
    promptId = data.prompt_id
  } catch (e) {
    if (e instanceof Error && /fetch failed|ECONNREFUSED|aborted|network|terminated/i.test(e.message)) {
      throw new Error('ComfyUI non raggiungibile su ' + base + ' — avvia ComfyUI sul Mac (e controlla COMFY_URL).')
    }
    throw e
  }

  // 2) Poll dello storico finché l'output è pronto.
  const started = Date.now()
  let image: { filename: string; subfolder: string; type: string } | null = null
  while (Date.now() - started < maxWaitMs) {
    await sleep(1500)
    try {
      const res = await fetch(`${base}/history/${promptId}`)
      if (!res.ok) continue
      const hist = await res.json() as HistoryOutputs
      const entry = hist[promptId]
      if (entry?.outputs) {
        for (const node of Object.values(entry.outputs)) {
          const img = node.images?.[0]
          if (img) { image = img; break }
        }
      }
      if (image) break
    } catch { /* continua a fare polling */ }
  }
  if (!image) throw new Error(`ComfyUI: render non completato entro ${Math.round(maxWaitMs / 1000)}s`)

  // 3) Scarica l'immagine generata.
  const params = new URLSearchParams({ filename: image.filename, subfolder: image.subfolder || '', type: image.type || 'output' })
  const imgRes = await fetch(`${base}/view?${params.toString()}`)
  if (!imgRes.ok) throw new Error(`ComfyUI /view ${imgRes.status}: impossibile scaricare l'immagine`)
  const bytes = Buffer.from(await imgRes.arrayBuffer())
  const mime = imgRes.headers.get('content-type') || 'image/png'
  return { bytes, mime }
}
