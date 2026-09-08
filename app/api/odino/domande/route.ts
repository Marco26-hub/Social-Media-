import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { ensureRuntimeMigrations } from '@/lib/runtime-migrations'

// Le domande che le persone fanno a ODINO.
//
// ODINO non impara a rispondere da solo: senza un modello non puo', e fingere
// il contrario significherebbe fargli inventare risposte su prezzi e contratti.
// Impara pero' la cosa piu' utile: CHE COSA NON SA. Ogni domanda rimasta senza
// risposta e' un pezzo di sito che manca, e finche' nessuno la vede resta
// mancante. Registrata, viene letta, scritta una volta e sapura per sempre.
//
// Si conserva solo il testo della domanda e l'esito. Nessun indirizzo IP,
// nessun cookie, nessun identificativo: non serve sapere CHI ha chiesto, serve
// sapere CHE COSA e' stato chiesto. Minimizzazione dei dati, art. 5.1.c GDPR,
// applicata prima ancora che qualcuno la richieda.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX = 400

export async function POST(request: Request) {
  if (!dbReady()) return NextResponse.json({ registrata: false })

  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ errore: 'Corpo non valido' }, { status: 400 })
  }

  const d = corpo as Record<string, unknown>
  const domanda = typeof d.domanda === 'string' ? d.domanda.trim().slice(0, MAX) : ''
  if (domanda.length < 3) return NextResponse.json({ errore: 'Domanda troppo corta' }, { status: 400 })

  try {
    await ensureRuntimeMigrations()
    await q(
      `INSERT INTO odino_domande (domanda, risposta_trovata, percorso, fonte, pagina, lingua)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        domanda,
        Boolean(d.trovata),
        typeof d.percorso === 'string' ? d.percorso.slice(0, 80) : null,
        typeof d.fonte === 'string' ? d.fonte.slice(0, 200) : null,
        typeof d.pagina === 'string' ? d.pagina.slice(0, 200) : null,
        typeof d.lingua === 'string' ? d.lingua.slice(0, 5) : 'it',
      ],
    )
    return NextResponse.json({ registrata: true })
  } catch {
    // Se la registrazione fallisce, ODINO deve continuare a funzionare: la
    // conversazione con una persona vale piu' della statistica.
    return NextResponse.json({ registrata: false })
  }
}
