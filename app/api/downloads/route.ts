import { NextResponse } from 'next/server'
import { listDownloads } from '@/lib/downloads'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ items: await listDownloads(false) })
  } catch (error) {
    console.error('[downloads api] public catalog unavailable:', error)
    return NextResponse.json(
      { error: 'I materiali non sono momentaneamente disponibili. Riprova tra poco.' },
      { status: 503 },
    )
  }
}
