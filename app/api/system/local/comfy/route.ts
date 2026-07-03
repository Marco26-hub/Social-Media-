import { NextResponse } from 'next/server'
import { comfyReachable, comfyBaseUrl, comfyCheckpoint } from '@/lib/comfy'
import { isLocalEnv } from '@/lib/local-only'

export const dynamic = 'force-dynamic'

// Stato ComfyUI locale (per la UI: mostrare "attivo/spento" e guidare l'utente).
export async function GET() {
  const running = await comfyReachable()
  return NextResponse.json({
    running,
    baseUrl: comfyBaseUrl(),
    checkpoint: comfyCheckpoint(),
    localEnv: isLocalEnv(),
  })
}
