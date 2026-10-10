import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { POST } from '../app/api/admin/downloads/upload/route'

type Env = Record<string, string | undefined>

// Chiama la route con un ambiente controllato e ripristina quello vero.
async function postWithEnv(env: Env, body: string): Promise<{ status: number; json: unknown }> {
  const keys = Object.keys(env)
  const previous: Env = {}
  for (const key of keys) previous[key] = process.env[key]
  for (const key of keys) {
    if (env[key] === undefined) delete process.env[key]
    else process.env[key] = env[key]
  }
  try {
    const response = await POST(
      new Request('http://localhost/api/admin/downloads/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    )
    return { status: response.status, json: await response.json() }
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
  }
}

// Il guard viene prima di ogni altro controllo: chi non e ammesso (qui la demo) riceve 403
// anche senza token di storage (che darebbe 503) e anche con un corpo non valido (400).
test('upload: il guard risponde prima del controllo dello storage', async () => {
  const res = await postWithEnv({ NEXT_PUBLIC_DEMO_MODE: 'true', BLOB_READ_WRITE_TOKEN: undefined }, '{}')
  assert.equal(res.status, 403)
})

test('upload: il guard risponde prima della lettura del corpo', async () => {
  const res = await postWithEnv({ NEXT_PUBLIC_DEMO_MODE: 'true', BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_test_x' }, 'non e json')
  assert.equal(res.status, 403)
})
