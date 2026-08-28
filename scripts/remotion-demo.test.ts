import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'playwright/test'
import { renderSwaSocialVideo } from '../lib/remotion-renderer'

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} richiesto`)
  return value
}

async function dataUrl(filePath: string, mime: string): Promise<string> {
  const bytes = await readFile(filePath)
  return `data:${mime};base64,${bytes.toString('base64')}`
}

test('render requested Remotion demo', async () => {
  // Test MANUALE: monta un video con asset reali passati via env. Senza quelli non
  // c'e niente da renderizzare, quindi si salta invece di fallire — cosi
  // `npm run test:render` resta verde quando si vuole solo la smoke del renderer.
  test.skip(
    !process.env.DEMO_IMAGE_PATHS?.trim() || !process.env.DEMO_AUDIO_PATH?.trim(),
    'DEMO_IMAGE_PATHS e DEMO_AUDIO_PATH non impostate: demo su asset reali saltata',
  )
  test.setTimeout(240_000)
  const imagePaths = required('DEMO_IMAGE_PATHS').split(path.delimiter).filter(Boolean)
  const audioPath = required('DEMO_AUDIO_PATH')
  const logoPath = process.env.DEMO_LOGO_PATH?.trim()
  const mediaUrls = await Promise.all(imagePaths.map(file => dataUrl(file, 'image/jpeg')))
  const audioUrl = await dataUrl(audioPath, 'audio/wav')
  const logoUrl = logoPath ? await dataUrl(logoPath, 'image/png') : undefined

  const result = await renderSwaSocialVideo({
    clienteId: process.env.DEMO_CLIENT_ID || 'remotion-demo',
    mediaUrls,
    audioUrl,
    // Il master demo originale e volutamente molto basso (-36 dB medi).
    // Remotion supporta amplificazione > 1 durante il render: questo gain porta
    // la traccia a un livello social udibile lasciando margine anti-clipping.
    musicVolume: Number(process.env.DEMO_MUSIC_GAIN || 7.5),
    motionPreset: 'trending',
    hook: process.env.DEMO_HOOK || undefined,
    cta: process.env.DEMO_CTA || undefined,
    logoUrl,
  })

  assert.equal(result.durationInSeconds, 15)
  console.log(`DEMO_MEDIA_URL=${result.mediaUrl}`)
})
