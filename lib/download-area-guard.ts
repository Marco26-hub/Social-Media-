// Controllo accessi delle API admin dell'area download. Solo server.
//
// `requireAdmin` in modalità demo, o senza database, lascia passare qualunque
// utente autenticato: va bene per il resto del pannello, non qui. Queste route
// caricano e cancellano file veri su Blob e ruotano il codice segreto, quindi
// in demo si rifiuta e senza DB si risponde "non disponibile" (apiError: 403/503).

import { requireAdmin } from '@/lib/auth-utils'
import { dbReady } from '@/lib/db'
import { isDemo } from '@/lib/demo'

export async function requireDownloadAdmin(): Promise<void> {
  if (isDemo()) throw new Error('Operazione riservata ad admin')
  if (!dbReady()) throw new Error('Database non disponibile')
  await requireAdmin()
}
