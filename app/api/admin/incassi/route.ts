import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { registroIncassi, type Fonte } from '@/lib/incassi'
import { nelPeriodo, periodoRichiesto } from './filtro'

export const dynamic = 'force-dynamic'

// Riepilogo del periodo, per mostrare prima di scaricare cosa conterra il file:
// quante vendite e quanto per ciascuna fonte. Chi esporta deve poter vedere a
// colpo d'occhio se manca qualcosa, prima che se ne accorga il commercialista.
export async function GET(request: Request) {
  try {
    await requireAdmin()
    const url = new URL(request.url)
    const intervallo = periodoRichiesto(url)
    if (url.searchParams.get('periodo') && !intervallo) {
      return NextResponse.json({ error: 'Periodo non valido' }, { status: 400 })
    }

    const { incassi, avvisi } = await registroIncassi()
    const scelti = nelPeriodo(incassi, intervallo)

    const perFonte = new Map<Fonte, { vendite: number; incassato_cents: number; rimborsato_cents: number }>()
    for (const i of scelti) {
      const voce = perFonte.get(i.fonte) ?? { vendite: 0, incassato_cents: 0, rimborsato_cents: 0 }
      voce.vendite += 1
      voce.incassato_cents += i.importo_cents
      voce.rimborsato_cents += i.rimborsato_cents
      perFonte.set(i.fonte, voce)
    }

    return NextResponse.json({
      periodo: intervallo,
      vendite: scelti.length,
      incassato_cents: scelti.reduce((s, i) => s + i.importo_cents, 0),
      rimborsato_cents: scelti.reduce((s, i) => s + i.rimborsato_cents, 0),
      per_fonte: [...perFonte.entries()].map(([fonte, v]) => ({ fonte, ...v })),
      avvisi,
    })
  } catch (e) {
    return apiError(e)
  }
}
