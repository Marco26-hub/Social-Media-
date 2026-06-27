// Demo walkthrough recorder.
// Avvia l'app in DEMO mode, naviga le schermate chiave con un cursore freccia
// animato e registra un video. Output: demo/demo-walkthrough.mp4 (+ .webm grezzo).
//
//   node scripts/demo-walkthrough.mjs
//
// Richiede: playwright (devDep) + chromium installato (npx playwright install chromium).
// ffmpeg opzionale: se presente converte il .webm in .mp4.

import { chromium } from 'playwright'
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const PORT = Number(process.env.DEMO_PORT || 3100)
const BASE = `http://localhost:${PORT}`
const OUT_DIR = join(ROOT, 'demo')
const RAW_DIR = join(OUT_DIR, 'raw')
const VIEWPORT = { width: 1280, height: 800 }

// ── cursore freccia animato, iniettato in ogni pagina ────────────────────────
const CURSOR_INIT = () => {
  const make = () => {
    if (document.getElementById('__demoCursor')) return
    const c = document.createElement('div')
    c.id = '__demoCursor'
    c.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none">' +
      '<path d="M5 3l5.6 15 2.2-6.2 6.2-2.2L5 3z" fill="#111827" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>'
    Object.assign(c.style, {
      position: 'fixed', left: '0', top: '0', zIndex: '2147483647',
      pointerEvents: 'none', transform: 'translate(640px,400px)',
      transition: 'transform .7s cubic-bezier(.22,.61,.36,1)',
      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.45))',
    })
    document.documentElement.appendChild(c)
    window.__cur = c
  }
  window.__moveCursor = (x, y) => { make(); if (window.__cur) window.__cur.style.transform = `translate(${x}px,${y}px)` }
  window.__clickRipple = (x, y) => {
    make()
    const r = document.createElement('div')
    Object.assign(r.style, {
      position: 'fixed', left: (x - 13) + 'px', top: (y - 13) + 'px', width: '26px', height: '26px',
      borderRadius: '50%', border: '2px solid rgba(124,58,237,.95)', zIndex: '2147483646',
      pointerEvents: 'none', transform: 'scale(0)', opacity: '1',
      transition: 'transform .45s ease-out, opacity .45s ease-out',
    })
    document.documentElement.appendChild(r)
    requestAnimationFrame(() => { r.style.transform = 'scale(2.4)'; r.style.opacity = '0' })
    setTimeout(() => r.remove(), 480)
  }
  if (document.readyState !== 'loading') make()
  else document.addEventListener('DOMContentLoaded', make)
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function waitForServer(timeoutMs = 90000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/dashboard/piano`, { redirect: 'manual' })
      if (res.status < 500) return true
    } catch { /* not ready */ }
    await sleep(800)
  }
  throw new Error(`Dev server non pronto su ${BASE} entro ${timeoutMs}ms`)
}

async function main() {
  if (existsSync(RAW_DIR)) rmSync(RAW_DIR, { recursive: true, force: true })
  mkdirSync(RAW_DIR, { recursive: true })

  console.log(`[demo] avvio next dev in DEMO mode su :${PORT} ...`)
  const server = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, NEXT_PUBLIC_DEMO_MODE: 'true', NODE_ENV: 'development' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', d => { if (/error/i.test(String(d))) process.stdout.write(`[next] ${d}`) })
  server.stderr.on('data', d => process.stdout.write(`[next] ${d}`))

  let browser
  try {
    await waitForServer()
    console.log('[demo] server pronto, avvio Chromium + registrazione ...')

    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      recordVideo: { dir: RAW_DIR, size: VIEWPORT },
    })
    await context.addInitScript(CURSOR_INIT)
    const page = await context.newPage()
    page.setDefaultTimeout(15000)

    const moveAndClick = async (loc, pause = 750) => {
      try {
        await loc.scrollIntoViewIfNeeded()
        const box = await loc.boundingBox()
        if (box) {
          const x = Math.round(box.x + box.width / 2)
          const y = Math.round(box.y + box.height / 2)
          await page.evaluate(([x, y]) => window.__moveCursor(x, y), [x, y])
          await sleep(pause)
          await page.evaluate(([x, y]) => window.__clickRipple(x, y), [x, y])
          await sleep(160)
        }
        await loc.click({ timeout: 8000 })
        await sleep(450)
      } catch (e) {
        console.log(`[demo] step click saltato: ${e.message.split('\n')[0]}`)
      }
    }

    const goto = async (path, settle = 1400) => {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' }).catch(() => {})
      await sleep(settle)
    }

    // 1) Piano editoriale ─ seleziona, genera
    await goto('/dashboard/piano')
    await moveAndClick(page.getByRole('button', { name: /LinkedIn/i }).first()) // aggiunge una piattaforma
    await sleep(400)
    await moveAndClick(page.getByRole('button', { name: /Genera piano/i }).first())
    await sleep(700) // ConfirmModal
    await moveAndClick(page.getByRole('button', { name: /Conferma e genera/i }).first())
    await sleep(3200) // barra di progresso + toast demo

    // 2) Calendario ─ contenuti generati
    await goto('/dashboard/calendario', 1800)
    await page.mouse.wheel(0, 360).catch(() => {})
    await sleep(1600)

    // 3) Social Instagram ─ genera un post
    await goto('/dashboard/social/instagram')
    await page.mouse.wheel(0, 420).catch(() => {})
    await sleep(700)
    await moveAndClick(page.getByRole('button', { name: /Genera post/i }).first())
    await sleep(700)
    await moveAndClick(page.getByRole('button', { name: /Conferma e genera/i }).first())
    await sleep(3000)

    // 4) Profilo Brand ─ panoramica
    await goto('/dashboard/brand', 1600)
    await page.mouse.wheel(0, 300).catch(() => {})
    await sleep(1500)

    const video = page.video()
    await context.close()
    const webm = video ? await video.path() : null
    await browser.close()
    browser = null

    if (webm) {
      const finalWebm = join(OUT_DIR, 'demo-walkthrough.webm')
      rmSync(finalWebm, { force: true })
      spawnSync('cp', [webm, finalWebm])
      console.log(`[demo] video grezzo: ${finalWebm}`)

      const hasFfmpeg = spawnSync('which', ['ffmpeg']).status === 0
      if (hasFfmpeg) {
        const mp4 = join(OUT_DIR, 'demo-walkthrough.mp4')
        const r = spawnSync('ffmpeg', [
          '-y', '-i', finalWebm,
          '-vf', 'fps=30,scale=1280:-2:flags=lanczos',
          '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
          mp4,
        ], { stdio: 'ignore' })
        if (r.status === 0) console.log(`[demo] ✅ MP4: ${mp4}`)
        else console.log('[demo] ffmpeg fallito, resta il .webm')
      } else {
        console.log('[demo] ffmpeg assente: output solo .webm')
      }
    } else {
      console.log('[demo] nessun video registrato')
    }
  } finally {
    if (browser) await browser.close().catch(() => {})
    server.kill('SIGTERM')
    // raw temp cleanup
    try { for (const f of readdirSync(RAW_DIR)) if (f.endsWith('.webm')) rmSync(join(RAW_DIR, f), { force: true }) } catch {}
    setTimeout(() => process.exit(0), 500)
  }
}

main().catch(e => { console.error('[demo] errore:', e); process.exit(1) })
