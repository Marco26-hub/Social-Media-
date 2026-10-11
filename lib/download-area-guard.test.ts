import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { apiError } from './api-error'
import { requireDownloadAdmin } from './download-area-guard'

type Env = Record<string, string | undefined>

// Esegue il guard con un ambiente controllato e ripristina quello vero.
async function statusWithEnv(env: Env): Promise<number | 'ok'> {
  const keys = Object.keys(env)
  const previous: Env = {}
  for (const key of keys) previous[key] = process.env[key]
  for (const key of keys) {
    if (env[key] === undefined) delete process.env[key]
    else process.env[key] = env[key]
  }
  try {
    await requireDownloadAdmin()
    return 'ok'
  } catch (e) {
    return apiError(e).status
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
  }
}

test('requireDownloadAdmin rifiuta in modalità demo (403), anche con requireAdmin permissivo', async () => {
  assert.equal(await statusWithEnv({ NEXT_PUBLIC_DEMO_MODE: 'true', DATABASE_URL: undefined }), 403)
  // Demo esplicito con un database collegato: requireAdmin lascerebbe passare, il guard no.
  assert.equal(await statusWithEnv({ NEXT_PUBLIC_DEMO_MODE: 'true', DATABASE_URL: 'postgres://u:p@localhost:5432/x' }), 403)
})

test('requireDownloadAdmin risponde 503 senza database (fuori dalla demo)', async () => {
  assert.equal(
    await statusWithEnv({ NEXT_PUBLIC_DEMO_MODE: undefined, NODE_ENV: 'production', DATABASE_URL: undefined }),
    503,
  )
})
