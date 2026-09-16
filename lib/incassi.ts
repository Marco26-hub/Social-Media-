import { dbReady, q } from '@/lib/db'

// Registro incassi: tutto cio che e stato venduto e pagato, da tutte le fonti.
//
// E il file che va al commercialista. Ogni fonte scrive i propri pagamenti in
// un posto diverso, e per ciascuna si legge il posto in cui la storia e
// completa:
//
//   Pacchetti social (Presenza, Crescita)  -> `pagamenti`: una riga per fattura
//   Servizi in abbonamento (Blog, Sito…)   -> `stripe_webhook_events`
//   Servizi una tantum (Pilot…)            -> `standalone_service_orders`
//   Consulenze legali                      -> `consulenze`
//   Corsi                                  -> `corso_acquisti`
//
// I servizi in abbonamento sono il caso delicato. `standalone_service_orders`
// tiene solo l'ULTIMA fattura di ogni ordine: i rinnovi mensili non diventano
// righe. Leggere li avrebbe dato un incasso per abbonamento, cioe mesi interi
// mancanti. Ogni evento Stripe invece e conservato per intero e non viene mai
// cancellato, quindi i rinnovi si ricostruiscono da li, uno per fattura, con la
// stessa regola con cui il webhook li riconosce (findStandaloneOrder).
//
// Per la stessa ragione i servizi in abbonamento NON si leggono anche dalla
// tabella degli ordini: il primo pagamento e anch'esso una fattura, ed e gia
// fra gli eventi. Contarlo due volte sarebbe un incasso inventato.

export type Fonte = 'Pacchetto social' | 'Servizio in abbonamento' | 'Servizio una tantum' | 'Consulenza legale' | 'Corso'

export type Incasso = {
  pagato_il: string
  fonte: Fonte
  descrizione: string
  cliente: string
  azienda: string | null
  email: string
  tipo_cliente: string | null
  importo_cents: number
  rimborsato_cents: number
  /** Numero della fattura Stripe se c'e, altrimenti l'id del pagamento. */
  riferimento: string | null
  link_documento: string | null
}

const iso = (v: unknown) => new Date(String(v)).toISOString()
const testo = (v: unknown) => (v === null || v === undefined || v === '' ? null : String(v))

async function pacchetti(): Promise<Incasso[]> {
  const rows = await q(
    `SELECT p.paid_at, p.amount_paid, p.stripe_invoice_id, p.stripe_payment_intent_id,
            p.hosted_invoice_url, p.raw->>'number' AS numero,
            c.nome AS cliente_nome, c.email AS cliente_email, c.pacchetto,
            o.nome AS titolare, o.azienda, o.customer_type
       FROM pagamenti p
       JOIN clienti c ON c.id = p.cliente_id
       LEFT JOIN LATERAL (
         SELECT pr.nome, pr.azienda, pr.customer_type
           FROM user_client_access u
           JOIN profiles pr ON pr.id = u.user_id
          WHERE u.cliente_id = c.id
          ORDER BY (u.ruolo = 'owner') DESC
          LIMIT 1
       ) o ON true
      WHERE p.status = 'paid' AND p.amount_paid > 0 AND p.paid_at IS NOT NULL`,
  )
  return rows.map(r => ({
    pagato_il: iso(r.paid_at),
    fonte: 'Pacchetto social' as const,
    descrizione: `Pacchetto ${testo(r.pacchetto) ?? 'social'}`,
    cliente: testo(r.titolare) ?? String(r.cliente_nome ?? ''),
    azienda: testo(r.azienda) ?? testo(r.cliente_nome),
    email: String(r.cliente_email ?? ''),
    tipo_cliente: testo(r.customer_type),
    importo_cents: Number(r.amount_paid ?? 0),
    rimborsato_cents: 0,
    riferimento: testo(r.numero) ?? testo(r.stripe_invoice_id),
    link_documento: testo(r.hosted_invoice_url),
  }))
}

async function serviziInAbbonamento(): Promise<Incasso[]> {
  // Un evento per fattura: la stessa fattura arriva sia come invoice.paid sia
  // come invoice.payment_succeeded, e a volte due volte ciascuno.
  const rows = await q(
    `WITH fatture AS (
       SELECT DISTINCT ON (f->>'id')
              f, e.raw->>'created' AS creato_evento
         FROM stripe_webhook_events e
         CROSS JOIN LATERAL (SELECT e.raw->'data'->'object' AS f) x
        WHERE e.event_type IN ('invoice.paid', 'invoice.payment_succeeded')
          AND COALESCE((f->>'amount_paid')::int, 0) > 0
        ORDER BY f->>'id', e.received_at DESC
     )
     SELECT fa.f->>'id' AS invoice_id,
            fa.f->>'number' AS numero,
            (fa.f->>'amount_paid')::int AS importo,
            fa.f->>'hosted_invoice_url' AS link,
            COALESCE((fa.f->'status_transitions'->>'paid_at')::bigint, fa.creato_evento::bigint) AS pagato_epoch,
            o.service_name, o.nome, o.azienda, o.email, o.customer_type
       FROM fatture fa
       JOIN standalone_service_orders o
         ON o.billing_mode = 'subscription'
        AND (
              -- Stesse vie con cui il webhook ritrova l'ordine da una fattura.
              o.id::text = fa.f->'metadata'->>'service_order_id'
           OR o.id::text = fa.f->'parent'->'subscription_details'->'metadata'->>'service_order_id'
           OR o.id::text = fa.f->'subscription_details'->'metadata'->>'service_order_id'
           OR o.stripe_subscription_id = fa.f->>'subscription'
           OR o.stripe_subscription_id = fa.f->'parent'->'subscription_details'->>'subscription'
        )`,
  )
  return rows.map(r => ({
    pagato_il: new Date(Number(r.pagato_epoch) * 1000).toISOString(),
    fonte: 'Servizio in abbonamento' as const,
    descrizione: String(r.service_name ?? 'Servizio'),
    cliente: String(r.nome ?? ''),
    azienda: testo(r.azienda),
    email: String(r.email ?? ''),
    tipo_cliente: testo(r.customer_type),
    importo_cents: Number(r.importo ?? 0),
    rimborsato_cents: 0,
    riferimento: testo(r.numero) ?? testo(r.invoice_id),
    link_documento: testo(r.link),
  }))
}

async function serviziUnaTantum(): Promise<Incasso[]> {
  const rows = await q(
    `SELECT paid_at, amount_cents, service_name, nome, azienda, email, customer_type,
            stripe_payment_intent_id, last_invoice_url
       FROM standalone_service_orders
      WHERE billing_mode = 'payment' AND paid_at IS NOT NULL`,
  )
  return rows.map(r => ({
    pagato_il: iso(r.paid_at),
    fonte: 'Servizio una tantum' as const,
    descrizione: String(r.service_name ?? 'Servizio'),
    cliente: String(r.nome ?? ''),
    azienda: testo(r.azienda),
    email: String(r.email ?? ''),
    tipo_cliente: testo(r.customer_type),
    importo_cents: Number(r.amount_cents ?? 0),
    rimborsato_cents: 0,
    riferimento: testo(r.stripe_payment_intent_id),
    link_documento: testo(r.last_invoice_url),
  }))
}

async function consulenze(): Promise<Incasso[]> {
  const rows = await q(
    `SELECT paid_at, importo_cents, tipo, nome, email, stripe_payment_intent_id
       FROM consulenze
      WHERE status = 'paid' AND paid_at IS NOT NULL`,
  )
  return rows.map(r => ({
    pagato_il: iso(r.paid_at),
    fonte: 'Consulenza legale' as const,
    descrizione: 'Consulenza legale individuale',
    cliente: String(r.nome ?? ''),
    azienda: null,
    email: String(r.email ?? ''),
    // Il modulo della consulenza non chiede se si acquista come impresa.
    tipo_cliente: null,
    importo_cents: Number(r.importo_cents ?? 0),
    rimborsato_cents: 0,
    riferimento: testo(r.stripe_payment_intent_id),
    link_documento: null,
  }))
}

async function corsi(): Promise<Incasso[]> {
  const rows = await q(
    `SELECT a.paid_at, a.amount_cents, a.customer_type, a.stripe_payment_intent_id,
            COALESCE((a.metadata->>'rimborsato_cents')::int, 0) AS rimborsato,
            c.titolo, p.nome, p.azienda, p.email
       FROM corso_acquisti a
       JOIN corsi c    ON c.id = a.corso_id
       JOIN profiles p ON p.id = a.user_id
      WHERE a.paid_at IS NOT NULL AND a.status IN ('paid', 'refunded')`,
  )
  return rows.map(r => ({
    pagato_il: iso(r.paid_at),
    fonte: 'Corso' as const,
    descrizione: `Corso: ${String(r.titolo ?? '')}`,
    cliente: String(r.nome ?? ''),
    azienda: testo(r.azienda),
    email: String(r.email ?? ''),
    tipo_cliente: testo(r.customer_type),
    importo_cents: Number(r.amount_cents ?? 0),
    rimborsato_cents: Number(r.rimborsato ?? 0),
    riferimento: testo(r.stripe_payment_intent_id),
    link_documento: null,
  }))
}

/** Codici Postgres di tabella o colonna mancante: migrazione non ancora applicata. */
function tabellaAssente(errore: unknown): boolean {
  const code = (errore as { code?: string })?.code || ''
  return code === '42P01' || code === '42703'
}

export type Registro = {
  incassi: Incasso[]
  /** Fonti che non si sono potute leggere, con il motivo, da mostrare a chi esporta. */
  avvisi: string[]
}

/**
 * Tutti gli incassi, dal piu vecchio al piu recente.
 *
 * Una fonte che non si legge non fa fallire il registro: finisce negli avvisi.
 * Un export che si interrompe per una tabella non ancora creata lascerebbe il
 * commercialista senza nulla; uno che tace la mancanza gli darebbe un totale
 * sbagliato. Gli avvisi dicono cosa manca.
 */
export async function registroIncassi(): Promise<Registro> {
  if (!dbReady()) return { incassi: [], avvisi: ['Database non disponibile.'] }

  const fonti: [string, () => Promise<Incasso[]>][] = [
    ['pacchetti social', pacchetti],
    ['servizi in abbonamento', serviziInAbbonamento],
    ['servizi una tantum', serviziUnaTantum],
    ['consulenze legali', consulenze],
    ['corsi', corsi],
  ]

  const incassi: Incasso[] = []
  const avvisi: string[] = []
  for (const [nome, leggi] of fonti) {
    try {
      incassi.push(...await leggi())
    } catch (errore) {
      avvisi.push(tabellaAssente(errore)
        ? `Fonte «${nome}» non ancora disponibile: migrazione da applicare.`
        : `Fonte «${nome}» non letta: ${errore instanceof Error ? errore.message.slice(0, 120) : 'errore'}.`)
    }
  }

  incassi.sort((x, y) => x.pagato_il.localeCompare(y.pagato_il))
  return { incassi, avvisi }
}
