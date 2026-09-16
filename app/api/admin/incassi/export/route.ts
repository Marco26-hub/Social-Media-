import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { dataCsv, documentoCsv, importoCsv } from '@/lib/csv'
import { registroIncassi } from '@/lib/incassi'
import { nelPeriodo, periodoRichiesto } from '../filtro'

export const dynamic = 'force-dynamic'

// Registro incassi per il commercialista: tutte le vendite del periodo, da
// tutte le fonti, in un file solo.
//
// Gli importi sono quelli incassati da Stripe, cosi come sono. Non vengono divisi
// in imponibile e IVA: come vadano trattati dipende dal regime fiscale, e
// deciderlo qui significherebbe inventare un dato contabile.

function statoContabile(incassatoCents: number, rimborsatoCents: number): string {
  if (rimborsatoCents <= 0) return 'Incassato'
  if (rimborsatoCents >= incassatoCents) return 'Rimborsato'
  return 'Rimborsato in parte'
}

function tipoCliente(valore: string | null): string {
  if (valore === 'consumatore') return 'Privato'
  if (valore === 'impresa_professionista') return 'Impresa/professionista'
  return 'Non indicato'
}

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

    const intestazione = [
      'Data incasso', 'Tipo', 'Descrizione', 'Cliente', 'Azienda', 'Email', 'Tipo cliente',
      'Importo incassato', 'Rimborsato', 'Netto', 'Stato', 'Riferimento Stripe', 'Documento Stripe',
    ]
    const righe = scelti.map(i => [
      dataCsv(i.pagato_il),
      i.fonte,
      i.descrizione,
      i.cliente,
      i.azienda || '',
      i.email,
      tipoCliente(i.tipo_cliente),
      importoCsv(i.importo_cents),
      i.rimborsato_cents ? importoCsv(i.rimborsato_cents) : '',
      importoCsv(Math.max(0, i.importo_cents - i.rimborsato_cents)),
      statoContabile(i.importo_cents, i.rimborsato_cents),
      i.riferimento || '',
      i.link_documento || '',
    ])

    // Una fonte che non si e potuta leggere va detta dentro il file, non solo a
    // schermo: il file puo arrivare al commercialista senza passare da chi l'ha
    // scaricato, e un totale incompleto che non lo dichiara e peggio di niente.
    for (const avviso of avvisi) righe.push([`ATTENZIONE: ${avviso}`])

    const nome = url.searchParams.get('periodo') || 'tutto'
    return new Response(documentoCsv(intestazione, righe), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="incassi-${nome}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (e) {
    return apiError(e)
  }
}
