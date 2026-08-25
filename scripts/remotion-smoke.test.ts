import assert from 'node:assert/strict'
import { readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'playwright/test'
import { renderSwaSocialVideo } from '../lib/remotion-renderer'

function wavDataUrl(durationSeconds = 1.2, sampleRate = 8000): string {
  const sampleCount = Math.ceil(durationSeconds * sampleRate)
  const bytes = Buffer.alloc(44 + sampleCount * 2)
  bytes.write('RIFF', 0)
  bytes.writeUInt32LE(36 + sampleCount * 2, 4)
  bytes.write('WAVEfmt ', 8)
  bytes.writeUInt32LE(16, 16)
  bytes.writeUInt16LE(1, 20)
  bytes.writeUInt16LE(1, 22)
  bytes.writeUInt32LE(sampleRate, 24)
  bytes.writeUInt32LE(sampleRate * 2, 28)
  bytes.writeUInt16LE(2, 32)
  bytes.writeUInt16LE(16, 34)
  bytes.write('data', 36)
  bytes.writeUInt32LE(sampleCount * 2, 40)
  for (let index = 0; index < sampleCount; index++) {
    const sample = Math.sin((index / sampleRate) * Math.PI * 2 * 440) * 0.18
    bytes.writeInt16LE(Math.round(sample * 32767), 44 + index * 2)
  }
  return `data:audio/wav;base64,${bytes.toString('base64')}`
}

test('renders a vertical MP4 with a custom audio track', async () => {
  test.setTimeout(180_000)
  const root = process.cwd()
  const image = await readFile(path.join(root, 'public', 'brand', 'swa-logo-official.png'))
  let outputPath = ''
  try {
    const result = await renderSwaSocialVideo({
      clienteId: 'remotion-smoke',
      mediaUrls: [`data:image/png;base64,${image.toString('base64')}`],
      audioUrl: wavDataUrl(),
    })

    assert.match(result.id, /^remotion:/)
    assert.match(result.mediaUrl, /swa-remotion-.+\.mp4$/)
    assert.equal(result.durationInSeconds, 8)
    outputPath = path.join(root, 'public', 'uploads', 'remotion-smoke', result.mediaUrl.split('/').pop() || '')
  } finally {
    if (outputPath && process.env.KEEP_REMOTION_SMOKE !== '1') await unlink(outputPath).catch(() => {})
  }
})
