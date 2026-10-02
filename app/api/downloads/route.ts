import { NextResponse } from 'next/server'
import { listDownloads } from '@/lib/downloads'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ items: await listDownloads(false) })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
