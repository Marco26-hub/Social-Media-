import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { apiError } from '@/lib/api-error'
import { dbReady, q, q1 } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { PACCHETTO_SLUGS, pacchettoBySlug } from '@/lib/pacchetti'
import { notifyNewRegistration, sendRegistrationReceived } from '@/lib/email'
import { verifyTurnstile } from '@/lib/turnstile'
import { passwordProblem } from '@/lib/password-policy'
import { stripeConfigured, createStripeCheckoutSession, createOneOffCheckoutSession, euroStringToCents } from '@/lib/stripe'
import {
  collegaSessioneStripe,
  creaAcquistoPending,
  getCorsoPerAcquisto,
  haAccessoAlCorso,
  segnaCheckoutFallito,
  type CorsoPerAcquisto,
} from '@/lib/corsi-db'
import { checkBotId } from 'botid/server'

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://www.socialautomation.app').replace(/\/$/, '')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    const origin = request.headers.get('origin')
    if (request.headers.get('sec-fetch-site') === 'cross-site') {
      return NextResponse.json({ error: 'Origine della richiesta non consentita.' }, { status: 403 })
    }
    if (origin) {
      try {
        if (new URL(origin).host !== new URL(request.url).host) {
          return NextResponse.json({ error: 'Origine della richiesta non consentita.' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Origine della richiesta non valida.' }, { status: 403 })
      }
    }

    const body = (await request.json()) as Record<string, unknown>
    const nome = String(body.nome || '').trim()
    const azienda = String(body.azienda || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const telefono = String(body.telefono || '').trim()
    const password = String(body.password || '')
    const corsoRichiesto = String(body.corso_slug || '').trim().toLowerCase()
    // Un corso non e un pacchetto: chi compra un corso non ha un piano social,
    // e la colonna deve restare vuota invece di mostrare un abbonamento finto.
    const pacchetto = corsoRichiesto ? '' : String(body.pacchetto || '').trim().toLowerCase()
    // Percorso corso: la registrazione porta dritta al pagamento del corso
    // indicato, senza passare dal pannello pacchetti e senza attesa di
    // approvazione. Se e presente, il pacchetto viene ignorato.
    const corsoSlug = corsoRichiesto
    const customerType = String(body.customer_type || '').trim()
    const termsAccepted = body.terms_accepted === true
    const earlyPerformanceRequested = body.early_performance_requested === true
    const withdrawalLossAcknowledged = body.withdrawal_loss_acknowledged === true
    const turnstileToken = typeof body.turnstile_token === 'string' ? body.turnstile_token : ''
    const honeypot = typeof body.website === 'string' ? body.website : ''
    const elapsedMs = typeof body.elapsed_ms === 'number' ? body.elapsed_ms : 99999

    // Anti-bot a zero dipendenze esterne:
    // 1) honeypot: campo nascosto compilato solo dai bot → scarta (200 finto ok
    //    per non far capire al bot che è stato individuato).
    // 2) submit troppo veloce (<1.5s dall'apertura) = quasi certamente bot.
    if (honeypot.trim() !== '' || elapsedMs < 1500) {
      console.warn('[register] richiesta scartata (honeypot/timing)', { honeypot: Boolean(honeypot), elapsedMs })
      return NextResponse.json({ ok: true, status: 'pending', message: 'Richiesta ricevuta.' })
    }

    // Captcha Turnstile (layer opzionale aggiuntivo: no-op se non configurato).
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
    if (!(await verifyTurnstile(turnstileToken, ip))) {
      return NextResponse.json({ error: 'Verifica anti-bot fallita. Riprova.' }, { status: 400 })
    }

    // Validazione input
    if (!nome) return NextResponse.json({ error: 'Nome richiesto' }, { status: 400 })
    if (customerType !== 'consumatore' && customerType !== 'impresa_professionista') {
      return NextResponse.json({ error: 'Indica se acquisti come consumatore oppure come impresa/professionista' }, { status: 400 })
    }
    if (customerType === 'impresa_professionista' && !azienda) return NextResponse.json({ error: 'Azienda richiesta' }, { status: 400 })
    if (!termsAccepted) return NextResponse.json({ error: 'Devi accettare Termini e Condizioni' }, { status: 400 })
    // Per un corso la regola non e la stessa: in prevendita il recesso NON
    // decade (l'esecuzione non e iniziata), quindi la rinuncia non si chiede.
    // La decisione si puo prendere solo dopo aver letto il corso a database.
    if (!corsoSlug && customerType === 'consumatore' && (!earlyPerformanceRequested || !withdrawalLossAcknowledged)) {
      return NextResponse.json({ error: 'Per iniziare subito conferma la richiesta di esecuzione anticipata e la relativa informativa sul recesso' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
    const problemaPassword = passwordProblem(password)
    if (problemaPassword) return NextResponse.json({ error: problemaPassword }, { status: 400 })
    if (pacchetto && !PACCHETTO_SLUGS.has(pacchetto)) return NextResponse.json({ error: 'Pacchetto non valido' }, { status: 400 })

    // Demo: risposta chiara 200 (nessuna registrazione reale).
    if (isDemo()) {
      return NextResponse.json(
        { ok: false, demo: true, message: 'Registrazione non disponibile in modalità demo. Contattaci per attivare un account reale.' },
        { status: 200 },
      )
    }
    // Produzione senza DB raggiungibile = errore server reale (503), non un 200
    // silenzioso: il cliente deve sapere che la richiesta NON è stata registrata.
    if (!dbReady()) {
      console.error('[register] DATABASE non pronto: registrazione rifiutata (503)')
      return NextResponse.json(
        { ok: false, error: 'Servizio temporaneamente non disponibile. Riprova tra poco o contattaci.' },
        { status: 503 },
      )
    }

    // Corso: deve esistere, essere pubblicato e avere Stripe configurato. Un
    // corso senza pagamento non si consegna, quindi qui non si degrada a
    // 'pending' come fanno i pacchetti: o si paga, o non si registra nulla.
    let corso: CorsoPerAcquisto | null = null
    if (corsoSlug) {
      corso = await getCorsoPerAcquisto(corsoSlug)
      if (!corso || !corso.pubblicato) {
        return NextResponse.json({ error: 'Questo corso non è acquistabile.' }, { status: 404 })
      }
      if (!stripeConfigured()) {
        return NextResponse.json({ error: 'Pagamenti non disponibili al momento. Riprova più tardi.' }, { status: 503 })
      }
      if (customerType === 'consumatore' && !corso.in_prevendita && (!earlyPerformanceRequested || !withdrawalLossAcknowledged)) {
        return NextResponse.json(
          { error: 'Per avere accesso subito devi confermare le due dichiarazioni sul recesso.' },
          { status: 400 },
        )
      }
    }

    // Email già usata? Se il profilo è già ATTIVO/rifiutato → 409. Se è PENDING
    // (registrato ma checkout non completato) → riusa il profilo e rigenera un
    // checkout, così chi ha abbandonato il pagamento può riprovare senza bloccarsi.
    //
    // Il 409 esplicito consente user enumeration, ed è una scelta deliberata: qui
    // si sta per pagare, e una risposta generica porterebbe l'utente a completare
    // un secondo acquisto invece di fare login. Mitigazione: rate-limit 10/5min
    // su questa route (middleware.ts). Non "correggere" senza considerare questo.
    const existing = await q1('SELECT id, status FROM profiles WHERE email = $1 LIMIT 1', [email]) as
      { id: string; status: string } | null
    let profileId: string
    if (existing) {
      if (existing.status !== 'pending') {
        return NextResponse.json({ error: 'Esiste già un account con questa email. Accedi.' }, { status: 409 })
      }
      // Aggiorna i dati del profilo pending, riusandolo. La password NON viene
      // toccata: non c'è verifica email in questo flow, quindi riscrivere l'hash
      // permetteva a chiunque conoscesse l'indirizzo di ri-registrarlo con una
      // propria password e prendersi l'account quando la vittima completava il
      // pagamento. Chi riprende un checkout abbandonato accede con la password
      // che ha scelto alla prima registrazione (o usa il recupero password).
      await q(
        `UPDATE profiles SET nome = $2, azienda = $3, telefono = $4, pacchetto = $5,
          customer_type = $6, terms_accepted_at = now(), terms_version = '2026-08-11',
          early_performance_requested = $7, withdrawal_loss_acknowledged = $8, updated_at = now()
         WHERE id = $1`,
        [existing.id, nome, azienda || null, telefono || null, pacchetto || null,
          customerType, customerType === 'consumatore' && earlyPerformanceRequested,
          customerType === 'consumatore' && withdrawalLossAcknowledged],
      )
      profileId = String(existing.id)
    } else {
      const passwordHash = await bcrypt.hash(password, 12)
      const inserted = await q1(
        `INSERT INTO profiles (
           email, nome, password_hash, ruolo_globale, status, azienda, telefono, pacchetto,
           customer_type, terms_accepted_at, terms_version,
           early_performance_requested, withdrawal_loss_acknowledged
         ) VALUES ($1, $2, $3, 'user', 'pending', $4, $5, $6, $7, now(), '2026-08-11', $8, $9)
         RETURNING id`,
        [email, nome, passwordHash, azienda || null, telefono || null, pacchetto || null, customerType,
          customerType === 'consumatore' && earlyPerformanceRequested,
          customerType === 'consumatore' && withdrawalLossAcknowledged],
      )
      profileId = String((inserted as { id: string }).id)
    }

    // Corso: crea l'acquisto in attesa e manda a Stripe. Il webhook segnera il
    // pagamento, portera il profilo ad 'active' e mandera le mail: e lo stesso
    // ramo usato da chi compra gia essendo entrato.
    if (corso) {
      if (await haAccessoAlCorso(profileId, corso.id)) {
        return NextResponse.json({ error: 'Hai già questo corso. Accedi per guardarlo.' }, { status: 409 })
      }

      const acquistoId = await creaAcquistoPending(profileId, corso, {
        customerType: customerType as 'consumatore' | 'impresa_professionista',
        earlyPerformanceRequested: corso.in_prevendita ? false : earlyPerformanceRequested,
        withdrawalLossAcknowledged: corso.in_prevendita ? false : withdrawalLossAcknowledged,
      })

      try {
        const checkout = await createOneOffCheckoutSession({
          refId: acquistoId,
          tipo: 'corso',
          descrizione: `Social Web Automation — ${corso.titolo}`,
          clienteEmail: email,
          amountCents: corso.prezzo_cents,
          successUrl: `${baseUrl()}/corsi/${corso.slug}/grazie?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl()}/corsi/${corso.slug}?annullato=1`,
          extraMetadata: { corso_id: corso.id, corso_slug: corso.slug, user_id: profileId },
        })
        if (checkout.url) {
          await collegaSessioneStripe(acquistoId, checkout.id)
          return NextResponse.json({ ok: true, status: 'checkout', checkout_url: checkout.url })
        }
        await segnaCheckoutFallito(acquistoId, 'sessione senza url')
      } catch (e) {
        await segnaCheckoutFallito(acquistoId, e instanceof Error ? e.message : 'errore sconosciuto')
        console.error('[register] checkout corso non riuscito:', e instanceof Error ? e.message : e)
      }

      return NextResponse.json(
        { error: 'Non riusciamo ad avviare il pagamento. Riprova fra qualche minuto: non ti è stato addebitato nulla.' },
        { status: 502 },
      )
    }

    // FLOW A — paga-prima: se Stripe è configurato e il pacchetto ha un prezzo
    // valido, crea subito una Checkout Session. Il cliente viene reindirizzato a
    // Stripe; ad avvenuto pagamento il webhook checkout.session.completed attiva
    // automaticamente l'account (crea il workspace). client_reference_id +
    // metadata[profile_id] legano il pagamento alla registrazione pending.
    const pkg = pacchettoBySlug(pacchetto)
    const amountCents = pkg ? euroStringToCents(pkg.prezzo) : 0
    if (stripeConfigured() && pkg && amountCents > 0) {
      try {
        const session = await createStripeCheckoutSession({
          clienteId: profileId, // qui è il profile_id (workspace non ancora creato)
          profileId,
          clienteNome: azienda || nome,
          clienteEmail: email,
          pacchettoSlug: pacchetto,
          pacchettoNome: pkg.nome,
          amountCents,
          setupCents: euroStringToCents(pkg.setup), // 'Setup incluso' → 0 → nessun addebito
          successUrl: `${baseUrl()}/login?attivato=1`,
          cancelUrl: `${baseUrl()}/register?annullato=1&piano=${encodeURIComponent(pacchetto)}`,
        })
        // Notifica interna (il cliente riceverà la conferma dopo il pagamento).
        await notifyNewRegistration({ nome, email, azienda, pacchetto }).catch(() => {})
        if (session.url) {
          return NextResponse.json({ ok: true, status: 'checkout', checkout_url: session.url })
        }
      } catch (e) {
        // Stripe fallito: NON bloccare la registrazione, degrada al flusso pending
        // (attivazione manuale admin). Logga per debug.
        console.error('[register] creazione checkout Stripe fallita, degrado a pending:', e instanceof Error ? e.message : e)
      }
    }

    // Fallback (Stripe non configurato o checkout fallito): pending + notifiche.
    await Promise.allSettled([
      sendRegistrationReceived(email, nome),
      notifyNewRegistration({ nome, email, azienda, pacchetto: pacchetto || null }),
    ])

    return NextResponse.json({
      ok: true,
      status: 'pending',
      message: 'Richiesta ricevuta. Ti attiviamo a breve e ti avvisiamo via email.',
    })
  } catch (e) {
    return apiError(e)
  }
}
