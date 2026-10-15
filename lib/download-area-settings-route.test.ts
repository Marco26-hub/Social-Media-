import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { GET, PUT } from '../app/api/admin/downloads/settings/route'

async function withDemo<T>(run: () => Promise<T>): Promise<T> {
  const previous = process.env.NEXT_PUBLIC_DEMO_MODE
  process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
  try {
    return await run()
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE
    else process.env.NEXT_PUBLIC_DEMO_MODE = previous
  }
}

test('settings: GET in demo risponde 403', async () => {
  assert.equal((await withDemo(() => GET())).status, 403)
})

test('settings: PUT in demo risponde 403 prima di leggere il corpo', async () => {
  const request = new Request('http://localhost/api/admin/downloads/settings', { method: 'PUT', body: 'non e json' })
  const res = await withDemo(() => PUT(request))
  assert.equal(res.status, 403)
  // Il 403 non basta: anche una route che legge il corpo e poi risponde 403 lo darebbe. Che il
  // guard venga prima si vede dal corpo ancora intatto.
  assert.equal(request.bodyUsed, false)
})
