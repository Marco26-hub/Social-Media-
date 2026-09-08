import Link from 'next/link'
import { ArrowUpRight, MessageCircleQuestion, Check, X } from 'lucide-react'
import { requireAdmin } from '@/lib/auth-utils'
import { dbReady, q } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'ODINO · domande ricevute', robots: { index: false, follow: false } }

// Che cosa hanno chiesto a ODINO, e che cosa non sapeva rispondere.
//
// ODINO non impara a rispondere da solo — senza un modello non puo', e fingere
// il contrario significherebbe fargli inventare cifre. Impara pero' la cosa
// piu' utile: CHE COSA NON SA. Ogni domanda rimasta senza risposta e' un pezzo
// di sito che manca, e finche' nessuno la legge resta mancante. Questa pagina
// serve a leggerle: e' il piano editoriale scritto dai clienti.
//
// Si conserva solo il testo e l'esito. Nessun IP, nessun cookie, nessun
// identificativo: non serve sapere CHI ha chiesto, serve sapere CHE COSA.

type Riga = {
  domanda: string
  risposta_trovata: boolean
  percorso: string | null
  fonte: string | null
  pagina: string | null
  lingua: string
  created_at: string
  volte: number
}

function quando(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default async function OdinoDomandePage() {
  await requireAdmin()

  if (!dbReady()) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">ODINO · domande ricevute</h1>
        <p className="mt-2 text-sm text-gray-600">Nessun database collegato in questo ambiente.</p>
      </div>
    )
  }

  // Le domande identiche si contano insieme: tre persone che chiedono la stessa
  // cosa sono un segnale, tre righe uguali sono rumore.
  const righe = (await q(
    `SELECT domanda,
            bool_or(risposta_trovata) AS risposta_trovata,
            max(percorso) AS percorso,
            max(fonte) AS fonte,
            max(pagina) AS pagina,
            max(lingua) AS lingua,
            max(created_at) AS created_at,
            count(*)::int AS volte
       FROM odino_domande
      GROUP BY lower(domanda), domanda
      ORDER BY bool_or(risposta_trovata) ASC, count(*) DESC, max(created_at) DESC
      LIMIT 300`,
  )) as unknown as Riga[]

  const senza = righe.filter(r => !r.risposta_trovata)
  const con = righe.filter(r => r.risposta_trovata)
  const totale = righe.reduce((s, r) => s + r.volte, 0)

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircleQuestion size={20} aria-hidden="true" /> ODINO · domande ricevute
        </h1>
        <p className="text-sm text-gray-600">
          {totale} domande, {righe.length} diverse. Quelle senza risposta stanno in cima: sono le pagine
          che mancano al sito.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Senza risposta ({senza.length})
        </h2>
        {senza.length === 0 ? (
          <p className="text-sm text-gray-600">Nessuna. ODINO ha trovato una risposta a tutto quello che gli è stato chiesto.</p>
        ) : (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded">
            {senza.map(r => (
              <li key={r.domanda} className="flex items-start gap-3 p-3">
                <X size={16} className="mt-0.5 flex-none text-red-500" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium break-words">{r.domanda}</p>
                  <p className="text-xs text-gray-500">
                    {r.volte > 1 && <>chiesta {r.volte} volte · </>}
                    {r.lingua.toUpperCase()} · {quando(r.created_at)}
                    {r.pagina && <> · da <span className="font-mono">{r.pagina}</span></>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Con risposta ({con.length})
        </h2>
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded">
          {con.map(r => (
            <li key={r.domanda} className="flex items-start gap-3 p-3">
              <Check size={16} className="mt-0.5 flex-none text-brand-600" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm break-words">{r.domanda}</p>
                <p className="text-xs text-gray-500">
                  {r.volte > 1 && <>chiesta {r.volte} volte · </>}
                  {r.lingua.toUpperCase()} · {quando(r.created_at)}
                  {r.percorso && <> · percorso <span className="font-mono">{r.percorso}</span></>}
                </p>
              </div>
              {r.fonte && (
                <Link href={r.fonte} className="flex-none text-xs text-brand-700 inline-flex items-center gap-1">
                  fonte <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
