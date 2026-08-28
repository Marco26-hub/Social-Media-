import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { getVideoMetadata, renderMedia, selectComposition } from '@remotion/renderer'
import { isStorageConfigured, uploadToStorage } from '@/lib/storage'

const FPS = 30
const MAX_IMAGES = 10
let bundlePromise: Promise<string> | null = null

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
    renderer: 'remotion-v2',
  })).digest('hex')
}

export function imageVideoDurationInSeconds(imageCount: number): number {
  if (imageCount <= 1) return 8
  return Math.min(20, Math.max(7, imageCount * 3))
}

async function resolveDuration(sourceVideoUrl: string | undefined, imageCount: number): Promise<number> {
  if (!sourceVideoUrl) return imageVideoDurationInSeconds(imageCount)
  const metadata = await getVideoMetadata(sourceVideoUrl, { logLevel: 'warn' })
  if (!metadata.durationInSeconds || metadata.durationInSeconds <= 0) {
    throw new Error('Remotion non riesce a leggere la durata del video sorgente')
  }
  return metadata.durationInSeconds
}

async function remotionBundle(): Promise<string> {
  if (!bundlePromise) {
    bundlePromise = bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'index.tsx'),
      publicDir: null,
      rootDir: process.cwd(),
      enableCaching: true,
      onProgress: () => {},
    }).catch(error => {
      bundlePromise = null
      throw error
    })
  }
  return bundlePromise
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
    const serveUrl = await remotionBundle()
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
    const composition = await selectComposition({
      serveUrl,
      id: 'SwaSocialVideo',
      inputProps: props,
      logLevel: 'warn',
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
      concurrency: '25%',
      disallowParallelEncoding: true,
      timeoutInMilliseconds: 120000,
      chromiumOptions: { disableWebSecurity: true },
      overwrite: true,
      logLevel: 'warn',
    })

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
