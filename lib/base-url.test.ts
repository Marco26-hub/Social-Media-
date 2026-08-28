import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { getPublicBaseUrl } from './base-url'

function requestWith(headers: Record<string, string>): Request {
  return new Request('https://www.socialautomation.app/api/qualcosa', { headers })
}

function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const previous = Object.keys(vars).map(key => [key, process.env[key]] as const)
  Object.entries(vars).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  })
  try {
    return fn()
  } finally {
    previous.forEach(([key, value]) => {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    })
  }
}

test('uses the forwarded host when it matches the configured site URL', () => {
  const base = withEnv(
    { NEXT_PUBLIC_SITE_URL: 'https://www.socialautomation.app', NEXTAUTH_URL: undefined, ALLOWED_HOSTS: undefined },
    () => getPublicBaseUrl(requestWith({ 'x-forwarded-host': 'www.socialautomation.app', 'x-forwarded-proto': 'https' })),
  )

  assert.equal(base, 'https://www.socialautomation.app')
})

test('accepts platform preview domains, which is why the header wins over env', () => {
  const base = withEnv(
    { NEXT_PUBLIC_SITE_URL: 'https://www.socialautomation.app', NEXTAUTH_URL: undefined, ALLOWED_HOSTS: undefined },
    () => getPublicBaseUrl(requestWith({ 'x-forwarded-host': 'swa-git-main.vercel.app' })),
  )

  assert.equal(base, 'https://swa-git-main.vercel.app')
})

test('a spoofed forwarded host never reaches the generated URLs', () => {
  const base = withEnv(
    { NEXT_PUBLIC_SITE_URL: 'https://www.socialautomation.app', NEXTAUTH_URL: undefined, ALLOWED_HOSTS: undefined },
    () => getPublicBaseUrl(requestWith({ 'x-forwarded-host': 'evil.example.com' })),
  )

  // Ripiega sulla env, non sull'host iniettato: questi URL finiscono in DB e
  // vengono riusati dallo scheduler giorni dopo.
  assert.equal(base, 'https://www.socialautomation.app')
})

test('an extra custom domain can be allowed explicitly via ALLOWED_HOSTS', () => {
  const base = withEnv(
    {
      NEXT_PUBLIC_SITE_URL: 'https://www.socialautomation.app',
      NEXTAUTH_URL: undefined,
      ALLOWED_HOSTS: 'socialautomation.app, altro-dominio.it',
    },
    () => getPublicBaseUrl(requestWith({ 'x-forwarded-host': 'altro-dominio.it' })),
  )

  assert.equal(base, 'https://altro-dominio.it')
})
