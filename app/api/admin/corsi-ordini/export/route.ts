import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { listOrdiniCorsiAdmin } from '@/lib/corsi-db'
import { dataCsv, documentoCsv, giornoRoma, importoCsv } from '@/lib/csv'

export const dynamic = 'force-dynamic'

// Export delle vendite dei corsi per il commercialista.
//
// Solo ordini pagati o rimborsati: quelli mai conclusi non hanno generato
// nessun movimento e in contabilita non devono esserci. Il periodo si sceglie
// per data di pagamento (?da=2026-09-01&a=2026-09-30), che e la data che conta
// per il commercialista.
//
// L'importo e quello incassato da Stripe, cosi com'e. Non viene diviso in
// imponibile e IVA: come vada trattato dipende dal regime fiscale, e deciderlo
// qui significherebbe inventare un dato contabile.

function giorno(valore: string | null): string | null {
  return valore && /^\d{4}-\d{2}-\d{2}$/.test(valore) ? valore : null
}

/**
 * Lo stato dal punto di vista del denaro, non dell'accesso.
 *
 * Un ordine rimborsato per intero a cui l'accesso e stato poi riaperto a mano ha
 * status 'paid', ma per la contabilita quei soldi sono usciti. Il commercialista
 * deve leggere dove sono i soldi, e l'accesso al corso non glielo dice.
 */
function statoContabile(pagatoCents: number, rimborsatoCents: number): string {
  if (rimborsatoCents <= 0) return 'Pagato'
  if (rimborsatoCents >= pagatoCents) return 'Rimborsato'
  return 'Rimborsato in parte'
}

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const url = new URL(request.url)
    const da = giorno(url.searchParams.get('da'))
    const a = giorno(url.searchParams.get('a'))

    const ordini = (await listOrdiniCorsiAdmin(5000)).filter(o => {
      if (!o.paid_at) return false
      if (o.status !== 'paid' && o.status !== 'refunded') return false
      // Confronto fra giorni di calendario italiani: gli estremi sono inclusi.
      const pagato = giornoRoma(o.paid_at)
      if (da && pagato < da) return false
      if (a && pagato > a) return false
      return true
    })

    const intestazione = [
      'Data pagamento', 'Ordine', 'Corso', 'Nome', 'Azienda', 'Email', 'Telefono',
      'Tipo cliente', 'Importo incassato', 'Rimborsato', 'Netto', 'Stato', 'Pagamento Stripe',
    ]
    const righe = ordini
      .slice()
      .sort((x, y) => String(x.paid_at).localeCompare(String(y.paid_at)))
      .map(o => [
        dataCsv(o.paid_at),
        o.id,
        o.corso_titolo,
        o.studente_nome || '',
        o.studente_azienda || '',
        o.studente_email,
        o.studente_telefono || '',
        o.customer_type === 'consumatore' ? 'Privato' : 'Impresa/professionista',
        importoCsv(o.amount_cents),
        o.rimborsato_cents ? importoCsv(o.rimborsato_cents) : '',
        importoCsv(Math.max(0, o.amount_cents - o.rimborsato_cents)),
        statoContabile(o.amount_cents, o.rimborsato_cents),
        o.stripe_payment_intent_id || '',
      ])

    const periodo = [url.searchParams.get('da'), url.searchParams.get('a')].filter(Boolean).join('_') || 'tutto'
    return new Response(documentoCsv(intestazione, righe), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="corsi-vendite-${periodo}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (e) {
    return apiError(e)
  }
}
