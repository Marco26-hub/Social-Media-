#!/usr/bin/env node

import { ensureBrowser } from '@remotion/renderer'

const status = await ensureBrowser({
  chromeMode: 'headless-shell',
  logLevel: 'info',
})

console.log(`[remotion] browser: ${status.type}${'path' in status ? ` (${status.path})` : ''}`)
