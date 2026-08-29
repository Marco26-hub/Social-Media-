import { createHash } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { getVideoMetadata, RenderInternals, renderMedia, selectComposition } from '@remotion/renderer'
import chromium from '@sparticuz/chromium'
import { isStorageConfigured, uploadToStorage } from '@/lib/storage'

const FPS = 30
const MAX_IMAGES = 10
let bundlePromise: Promise<string> | null = null
let browserExecutablePromise: Promise<string | null> | null = null

export type SwaRenderInput = {
  clienteId: string
  mediaUrls: string[]
  audioUrl?: string
  keepOriginalAudio?: boolean
  musicVolume?: number
  motionPreset?: 'trending' | 'premium' | 'minimal' | 'classico'
  hook?: string
  cta?: string
  logoUrl?: string
  brandName?: string
}

export type SwaRenderResult = {
  id: string
  mediaUrl: string
  durationInFrames: number
  durationInSeconds: number
  sourceHash: string
}

function configuredBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || `http://127.0.0.1:${process.env.PORT || '3000'}`
  return raw.trim().replace(/\/$/, '')
}

function safePathPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'client'
}

export function remotionSourceHash(input: Omit<SwaRenderInput, 'clienteId'>): string {
  return createHash('sha256').update(JSON.stringify({
    mediaUrls: input.mediaUrls,
    audioUrl: input.audioUrl || '',
    keepOriginalAudio: input.keepOriginalAudio !== false,
    musicVolume: input.musicVolume ?? null,
    motionPreset: input.motionPreset || 'premium',
    hook: input.hook || '',
    cta: input.cta || '',
    logoUrl: input.logoUrl || '',
    brandName: input.brandName || '',
    renderer: 'remotion-v3',
  })).digest('hex')
}

export function imageVideoDurationInSeconds(imageCount: number): number {
  if (imageCount <= 1) return 8
  return Math.min(20, Math.max(7, imageCount * 3))
}

// Il path immagini è già limitato a 20s. Quello video accettava invece qualunque
// durata del sorgente: un MP4 da 8 minuti (il limite di upload è 100MB) diventava
// un render 1080x1920 h264 da decine di minuti dentro una request HTTP. 90s copre
// abbondantemente Reel e Short, che è tutto ciò che pubblichiamo.
export const MAX_SOURCE_VIDEO_SECONDS = 90

// Remotion arrotonda le percentuali sul numero di CPU disponibili. Nelle
// funzioni Vercel con una sola CPU, "25%" diventava 0 e il render falliva con
// "Minimum for concurrency is 1" prima ancora di inviare il post a Blotato.
export function remotionConcurrency(isServerless = Boolean(process.env.VERCEL)): number | `${number}%` {
  return isServerless ? 1 : '25%'
}

export function canUseStaticImagesAudioFastPath(input: Pick<SwaRenderInput, 'mediaUrls' | 'audioUrl' | 'hook' | 'cta' | 'logoUrl' | 'brandName'>): boolean {
  return input.mediaUrls.length > 0
    && Boolean(input.audioUrl)
    && input.mediaUrls.every(url => !/\.(mp4|mov|webm|m4v)(\?|$)/i.test(url))
    && !input.hook
    && !input.cta
    && !input.logoUrl
    && !input.brandName
}

function mediaExtension(url: string, fallback: string): string {
  try {
    const extension = path.extname(new URL(url, configuredBaseUrl()).pathname).toLowerCase()
    return /^\.[a-z0-9]{2,5}$/.test(extension) ? extension : fallback
  } catch {
    return fallback
  }
}

async function downloadRenderInput(url: string, destination: string): Promise<string> {
  if (path.isAbsolute(url) && !/^https?:/i.test(url)) return url

  const response = await fetch(new URL(url, configuredBaseUrl()), {
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) {
    throw new Error(`Download media per montaggio fallito (${response.status}): ${url}`)
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()))
  return destination
}

async function renderStaticImagesAudio(args: {
  imageUrls: string[]
  audioUrl: string
  durationInSeconds: number
  renderDir: string
  outputLocation: string
}): Promise<void> {
  const imageFiles = await Promise.all(args.imageUrls.map((url, index) => downloadRenderInput(
    url,
    path.join(args.renderDir, `image-${index}${mediaExtension(url, '.jpg')}`),
  )))
  const audioFile = await downloadRenderInput(
    args.audioUrl,
    path.join(args.renderDir, `audio${mediaExtension(args.audioUrl, '.mp3')}`),
  )
  const slideDuration = args.durationInSeconds / imageFiles.length
  const imageInputs = imageFiles.flatMap(file => [
    '-loop', '1',
    '-framerate', '24',
    '-t', String(slideDuration),
    '-i', file,
  ])
  const preparedFrames = imageFiles.map((_, index) => (
    `[${index}:v]scale=1080:1920:force_original_aspect_ratio=increase,`
    + `crop=1080:1920,format=yuv420p[v${index}]`
  ))
  const concat = `${imageFiles.map((_, index) => `[v${index}]`).join('')}concat=n=${imageFiles.length}:v=1:a=0[video]`
  const ffmpegArgs = [
    '-y',
    ...imageInputs,
    '-stream_loop', '-1',
    '-i', audioFile,
    '-filter_complex', [...preparedFrames, concat].join(';'),
    '-map', '[video]',
    '-map', `${imageFiles.length}:a:0`,
    '-t', String(args.durationInSeconds),
    '-r', '24',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-tune', 'stillimage',
    '-crf', '20',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-movflags', '+faststart',
    '-map_metadata', '-1',
    args.outputLocation,
  ]

  await RenderInternals.callFf({
    args: ffmpegArgs,
    bin: 'ffmpeg',
    indent: false,
    logLevel: 'warn',
    binariesDirectory: null,
    cancelSignal: undefined,
    options: {
      stdio: ['ignore', 'ignore', 'pipe'],
    },
  })
}

async function resolveDuration(sourceVideoUrl: string | undefined, imageCount: number): Promise<number> {
  if (!sourceVideoUrl) return imageVideoDurationInSeconds(imageCount)
  const metadata = await getVideoMetadata(sourceVideoUrl, { logLevel: 'warn' })
  if (!metadata.durationInSeconds || metadata.durationInSeconds <= 0) {
    throw new Error('Remotion non riesce a leggere la durata del video sorgente')
  }
  if (metadata.durationInSeconds > MAX_SOURCE_VIDEO_SECONDS) {
    throw new Error(`Video sorgente troppo lungo (${Math.round(metadata.durationInSeconds)}s): il massimo per il montaggio è ${MAX_SOURCE_VIDEO_SECONDS}s. Taglia il video prima di caricarlo.`)
  }
  return metadata.durationInSeconds
}

// Bundle costruito in fase di build da scripts/ensure-remotion-browser.mjs e
// spedito dentro la funzione serverless (outputFileTracingIncludes).
const PREBUILT_BUNDLE_DIR = path.join(process.cwd(), '.remotion-bundle')

async function remotionBundle(): Promise<string> {
  if (!bundlePromise) {
    bundlePromise = (async () => {
      // Percorso normale in produzione: il bundle esiste gia, niente webpack a
      // runtime. Prima veniva ricompilato a ogni cold start, dentro la richiesta e
      // su disco effimero — il punto piu fragile dell'intera pipeline.
      try {
        await access(path.join(PREBUILT_BUNDLE_DIR, 'index.html'))
        return PREBUILT_BUNDLE_DIR
      } catch {
        // Nessun bundle pre-buildato (dev locale senza `npm run remotion:browser`):
        // si ricade sulla compilazione al volo.
      }
      return bundle({
        entryPoint: path.join(process.cwd(), 'remotion', 'index.tsx'),
        publicDir: null,
        rootDir: process.cwd(),
        enableCaching: true,
        onProgress: () => {},
      })
    })().catch(error => {
      bundlePromise = null
      throw error
    })
  }
  return bundlePromise
}

function remotionBrowserExecutable(): Promise<string | null> {
  if (!browserExecutablePromise) {
    browserExecutablePromise = process.env.VERCEL
      ? chromium.executablePath()
      : Promise.resolve(null)
  }
  return browserExecutablePromise
}

export async function renderSwaSocialVideo(input: SwaRenderInput): Promise<SwaRenderResult> {
  const mediaUrls = input.mediaUrls.filter(Boolean).slice(0, MAX_IMAGES)
  if (!mediaUrls.length) throw new Error('Remotion richiede almeno una foto o un video sorgente')
  if (process.env.NODE_ENV === 'production' && !isStorageConfigured()) {
    throw new Error('Storage persistente non configurato: il render non viene creato per evitare un MP4 perso al riavvio')
  }

  const sourceVideoUrl = mediaUrls.find(url => /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url))
  const imageUrls = sourceVideoUrl ? [] : mediaUrls
  const durationInSeconds = await resolveDuration(sourceVideoUrl, imageUrls.length)
  const durationInFrames = Math.max(FPS, Math.ceil(durationInSeconds * FPS))
  const sourceHash = remotionSourceHash({
    mediaUrls: sourceVideoUrl ? [sourceVideoUrl] : imageUrls,
    audioUrl: input.audioUrl,
    keepOriginalAudio: input.keepOriginalAudio,
    musicVolume: input.musicVolume,
    motionPreset: input.motionPreset,
    hook: input.hook,
    cta: input.cta,
    logoUrl: input.logoUrl,
    brandName: input.brandName,
  })
  const filename = `swa-remotion-${sourceHash.slice(0, 24)}.mp4`
  const renderDir = await mkdtemp(path.join(tmpdir(), 'swa-remotion-'))
  const outputLocation = path.join(renderDir, filename)

  try {
    const props = {
      mediaUrls: imageUrls,
      sourceVideoUrl,
      audioUrl: input.audioUrl,
      durationInFrames,
      keepOriginalAudio: input.keepOriginalAudio !== false,
      musicVolume: input.musicVolume,
      motionPreset: input.motionPreset || 'premium',
      hook: input.hook,
      cta: input.cta,
      logoUrl: input.logoUrl,
      brandName: input.brandName,
    }
    if (canUseStaticImagesAudioFastPath(input)) {
      console.info(`[Remotion] percorso ffmpeg rapido: ${mediaUrls.length} immagini, ${durationInSeconds}s`)
      await renderStaticImagesAudio({
        imageUrls: mediaUrls,
        audioUrl: input.audioUrl!,
        durationInSeconds,
        renderDir,
        outputLocation,
      })
    } else {
      const serveUrl = await remotionBundle()
      const browserExecutable = await remotionBrowserExecutable()
      const composition = await selectComposition({
        serveUrl,
        id: 'SwaSocialVideo',
        inputProps: props,
        logLevel: 'warn',
        browserExecutable,
        chromeMode: 'headless-shell',
      })
      await renderMedia({
        serveUrl,
        composition,
        inputProps: props,
        codec: 'h264',
        audioCodec: 'aac',
        outputLocation,
        pixelFormat: 'yuv420p',
        crf: 18,
        jpegQuality: 92,
        x264Preset: 'veryfast',
        concurrency: remotionConcurrency(),
        disallowParallelEncoding: true,
        timeoutInMilliseconds: 120000,
        chromiumOptions: { disableWebSecurity: true },
        browserExecutable,
        chromeMode: 'headless-shell',
        overwrite: true,
        logLevel: 'warn',
      })
    }

    const bytes = await readFile(outputLocation)
    const safeClienteId = safePathPart(input.clienteId)
    const key = `uploads/${safeClienteId}/${filename}`
    let mediaUrl: string
    if (isStorageConfigured()) {
      const directUrl = await uploadToStorage(key, bytes, 'video/mp4')
      mediaUrl = directUrl || `${configuredBaseUrl()}/api/assets/file/${encodeURIComponent(safeClienteId)}/${encodeURIComponent(filename)}`
    } else {
      const localDir = path.join(process.cwd(), 'public', 'uploads', safeClienteId)
      await mkdir(localDir, { recursive: true })
      await writeFile(path.join(localDir, filename), bytes)
      mediaUrl = `${configuredBaseUrl()}/api/assets/file/${encodeURIComponent(safeClienteId)}/${encodeURIComponent(filename)}`
    }

    return {
      id: `remotion:${sourceHash}`,
      mediaUrl,
      durationInFrames,
      durationInSeconds,
      sourceHash,
    }
  } finally {
    await rm(renderDir, { recursive: true, force: true })
  }
}
