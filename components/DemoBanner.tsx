'use client'

import { isDemo } from '@/lib/demo'

export default function DemoBanner() {
  if (!isDemo()) return null

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200 px-6 py-2 text-center text-sm text-amber-900">
      🎬 <strong>Demo Mode</strong> — dati finti, modifiche non salvate. Configura Neon/Postgres per attivare live.
    </div>
  )
}
