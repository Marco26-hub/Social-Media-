import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { INSTAGRAM_HANDLE, instagramUrl } from './social-links'

test('instagramUrl: variabile d’ambiente con ripiego, letta a ogni chiamata', () => {
  const previous = process.env.NEXT_PUBLIC_INSTAGRAM_URL
  try {
    delete process.env.NEXT_PUBLIC_INSTAGRAM_URL
    assert.equal(instagramUrl(), 'https://www.instagram.com/socialwebautomation/')
    process.env.NEXT_PUBLIC_INSTAGRAM_URL = '  https://www.instagram.com/altro/  '
    assert.equal(instagramUrl(), 'https://www.instagram.com/altro/')
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_INSTAGRAM_URL
    else process.env.NEXT_PUBLIC_INSTAGRAM_URL = previous
  }
  assert.equal(INSTAGRAM_HANDLE, '@socialwebautomation')
})
