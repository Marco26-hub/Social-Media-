import { NextResponse } from 'next/server'
import { checkBotId } from 'botid/server'
import { getPublicBaseUrl } from '@/lib/base-url'
import { getSession, requireAuth } from '@/lib/auth-utils'
import { dbReady } from '@/lib/db'
import {
  collegaSessioneStripe,
  creaAcquistoPending,
  getCorsoPerAcquisto,
  getStatoAcquistoBySession,
  haAccessoAlCorso,
  postiEsauriti,
  segnaCheckoutFallito,
} from '@/lib/corsi-db'
import { createOneOffCheckoutSession, stripeConfigured } from '@/lib/stripe'
import { metaSessionMetadata, metaUserContextFromRequest, sendMetaConversionEvent } from '@/lib/meta-conversions-api'

export const dynamic = 'force-dynamic'

// Avvio del pagamento di un corso. Ricalca /api/checkout/service, con due
// differenze volute:
//
// 1. richiede di essere entrati. Un corso si guarda dentro l'area riservata,
//    quindi l'acquirente deve gia avere un account: cosi l'acquisto si lega a
//    una persona invece che a un indirizzo email scritto in un modulo.
// 2. il prezzo viene dalla riga del corso a database, mai dalla richiesta.
//    E il punto in cui si decide quanto addebitare e non deve essere
//    influenzabile da chi manda la richiesta.

function clean(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function statoPubblico(status: string): 'pending' | 'confirmed' | 'attention' {
  if (status === 'paid') return 'confirmed'
  if (status === 'checkout_failed' || status === 'refunded') return 'attention'
  return 'pending'
}

/** Stato dell'ordine, per la pagina di ritorno dal pagamento. */
export async function GET(request: Request) {
  if (!dbReady()) return NextResponse.json({ error: 'Servizio non disponibile' }, { status: 503 })

  const sessionId = new URL(request.url).searchParams.get('session_id')?.trim()
  if (!sessionId) return NextResponse.json({ error: 'Sessione richiesta' }, { status: 400 })

  const ordine = await getStatoAcquistoBySession(sessionId)
  if (!ordine) return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })

  return NextResponse.json({
    titolo: ordine.titolo,
    slug: ordine.slug,
    status: statoPubblico(ordine.status),
  })
}

export async function POST(request: Request) {
  try {
    const bot = await checkBotId()
    if (bot.isBot) {
      return NextResponse.json({ error: 'Richiesta automatizzata bloccata.' }, { status: 403 })
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.toLowerCase().startsWith('application/json')) {
      return NextResponse.json({ error: 'Formato richiesta non supportato.' }, { status: 415 })
    }
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > 32_768) {
      return NextResponse.json({ error: 'Richiesta troppo grande.' }, { status: 413 })
    }
    if (request.headers.get('sec-fetch-site') === 'cross-site') {
      return NextResponse.json({ error: 'Origine della richiesta non consentita.' }, { status: 403 })
    }
    const origin = request.headers.get('origin')
    if (origin) {
      try {
        if (new URL(origin).host !== new URL(request.url).host) {
          return NextResponse.json({ error: 'Origine della richiesta non consentita.' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Origine della richiesta non valida.' }, { status: 403 })
      }
    }

    if (!dbReady()) return NextResponse.json({ error: 'Servizio non disponibile' }, { status: 503 })
    if (!stripeConfigured()) {
      return NextResponse.json({ error: 'Pagamenti non disponibili al momento.' }, { status: 503 })
    }

    const utente = await requireAuth()
    const sessione = await getSession()

    const body = await request.json() as Record<string, unknown>
    const slug = clean(body.corso_slug, 120)
    const customerType = clean(body.customer_type, 40)
    const terminiAccettati = body.terms_accepted === true
    const esecuzioneImmediata = body.early_performance_requested === true
    const perditaRecesso = body.withdrawal_loss_acknowledged === true

    if (!slug) return NextResponse.json({ error: 'Corso non indicato.' }, { status: 400 })
    if (customerType !== 'consumatore' && customerType !== 'impresa_professionista') {
      return NextResponse.json({ error: 'Indica se acquisti come impresa o come privato.' }, { status: 400 })
    }
    if (!terminiAccettati) {
      return NextResponse.json({ error: 'Per procedere devi accettare i termini.' }, { status: 400 })
    }

    const corso = await getCorsoPerAcquisto(slug)
    if (!corso || !corso.pubblicato) {
      return NextResponse.json({ error: 'Questo corso non è acquistabile.' }, { status: 404 })
    }

    // In prevendita la rinuncia al recesso non ha effetto: il termine decorre
    // dalla consegna, quindi non la si chiede e non la si registra.
    if (customerType === 'consumatore' && !corso.in_prevendita && (!esecuzioneImmediata || !perditaRecesso)) {
      return NextResponse.json(
        { error: 'Per avere accesso subito devi confermare le due dichiarazioni sul recesso.' },
        { status: 400 },
      )
    }

    if (await haAccessoAlCorso(utente.id, corso.id)) {
      return NextResponse.json({ error: 'Hai già questo corso.', gia_acquistato: true }, { status: 409 })
    }

    // Numero chiuso: si controlla prima di mandare a Stripe, non dopo. Incassare
    // per un posto che non esiste e il modo piu rapido di dover restituire soldi.
    if (await postiEsauriti(corso)) {
      return NextResponse.json(
        { error: 'I posti per questa edizione sono esauriti. Scrivici per la prossima data.', esaurito: true },
        { status: 409 },
      )
    }

    const acquistoId = await creaAcquistoPending(utente.id, corso, {
      customerType,
      earlyPerformanceRequested: corso.in_prevendita ? false : esecuzioneImmediata,
      withdrawalLossAcknowledged: corso.in_prevendita ? false : perditaRecesso,
    })

    const base = getPublicBaseUrl(request)
    const contestoMeta = metaUserContextFromRequest(request)
    const emailAcquirente = sessione?.user?.email || utente.email

    let checkoutUrl: string | null = null
    try {
      const checkout = await createOneOffCheckoutSession({
        refId: acquistoId,
        tipo: 'corso',
        descrizione: `Social Web Automation — ${corso.titolo}`,
        clienteEmail: emailAcquirente,
        amountCents: corso.prezzo_cents,
        successUrl: `${base}/corsi/${corso.slug}/grazie?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${base}/corsi/${corso.slug}?annullato=1`,
        extraMetadata: {
          corso_id: corso.id,
          corso_slug: corso.slug,
          user_id: utente.id,
          ...metaSessionMetadata(contestoMeta),
        },
      })
      checkoutUrl = checkout.url || null
      if (checkoutUrl) await collegaSessioneStripe(acquistoId, checkout.id)
    } catch (errore) {
      await segnaCheckoutFallito(acquistoId, errore instanceof Error ? errore.message : 'errore sconosciuto')
      console.error('[corsi] creazione checkout non riuscita', errore)
      return NextResponse.json(
        { error: 'Non riusciamo ad avviare il pagamento. Riprova fra qualche minuto: non ti è stato addebitato nulla.' },
        { status: 502 },
      )
    }

    if (!checkoutUrl) {
      await segnaCheckoutFallito(acquistoId, 'sessione senza url')
      return NextResponse.json(
        { error: 'Non riusciamo ad avviare il pagamento. Riprova fra qualche minuto.' },
        { status: 502 },
      )
    }

    // L'evento pubblicitario non deve mai far fallire un pagamento che parte.
    void sendMetaConversionEvent({
      eventName: 'InitiateCheckout',
      request,
      eventId: `corso-checkout-${acquistoId}`,
      eventSourceUrl: `${base}/corsi/${corso.slug}`,
      email: emailAcquirente,
      value: corso.prezzo_cents / 100,
      currency: 'EUR',
      customData: { content_name: corso.titolo, content_type: 'course' },
    }).catch(() => {})

    return NextResponse.json({ checkout_url: checkoutUrl })
  } catch (errore) {
    if (errore instanceof Error && errore.message === 'Non autenticato') {
      return NextResponse.json({ error: 'Devi accedere per acquistare un corso.' }, { status: 401 })
    }
    console.error('[corsi] checkout', errore)
    return NextResponse.json({ error: 'Errore imprevisto. Riprova fra poco.' }, { status: 500 })
  }
}
