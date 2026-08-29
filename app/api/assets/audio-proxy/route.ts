import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function allowedAudioUrl(raw: string): URL | null {
  try {
    const url = new URL(raw)
    const configuredHosts = [process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.STORAGE_PUBLIC_URL]
      .map(value => {
        try { return value ? new URL(value).hostname : '' } catch { return '' }
      })
      .filter(Boolean)
    if (url.protocol !== 'https:' || !configuredHosts.includes(url.hostname)) return null
    if (!/\.(mp3|wav|m4a|ogg)(?:$|\?)/i.test(url.toString())) return null
    return url
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const source = allowedAudioUrl(new URL(request.url).searchParams.get('url') || '')
  if (!source) return NextResponse.json({ error: 'URL audio non consentito' }, { status: 400 })

  const range = request.headers.get('range')
  const upstream = await fetch(source, {
    headers: range ? { Range: range } : undefined,
    cache: 'force-cache',
  })
  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: 'Audio non disponibile' }, { status: upstream.status === 404 ? 404 : 502 })
  }

  const headers = new Headers()
  headers.set('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg')
  headers.set('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  for (const name of ['content-length', 'content-range']) {
    const value = upstream.headers.get(name)
    if (value) headers.set(name, value)
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers })
}
