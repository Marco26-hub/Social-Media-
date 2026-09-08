import { createHash, randomUUID } from 'crypto'

import { marketingConcesso } from './cookie-consent'

const GRAPH_VERSION = 'v21.0'
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE

type MetaEventName = 'PageView' | 'Lead' | 'InitiateCheckout' | 'Purchase'

/**
 * Da dove arrivano consenso e identificatori di chi ha fatto l'azione.
 *
 * Finora tutto veniva letto dalla Request: cookie di consenso, _fbp, _fbc, IP e
 * browser. Va bene per Lead e InitiateCheckout, che nascono da una richiesta
 * del cliente. Il Purchase no: lo conferma il webhook di Stripe, e quella
 * richiesta arriva da Stripe, senza i cookie del cliente. Il contesto si
 * cattura quindi al checkout, si salva nei metadata della sessione Stripe e
 * si rilegge al momento dell'incasso.
 */
export type MetaUserContext = {
  consent: boolean
  ip?: string
  userAgent?: string
  fbp?: string
  fbc?: string
  sourceUrl?: string
}

type MetaEventInput = {
  eventName: MetaEventName
  /** La richiesta del cliente, quando c'e'. In alternativa `context`. */
  request?: Request
  context?: MetaUserContext
  eventId?: string
  eventSourceUrl?: string
  email?: string
  phone?: string
  value?: number
  currency?: string
  customData?: Record<string, unknown>
}

function sha256(value?: string): string | undefined {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return undefined
  return createHash('sha256').update(normalized).digest('hex')
}

function cookieValue(request: Request, name: string): string | undefined {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

function marketingConsentGranted(request: Request): boolean {
  return marketingConcesso(request.headers.get('cookie'))
}

export function metaUserContextFromRequest(request: Request): MetaUserContext {
  const consent = marketingConsentGranted(request)
  // Senza consenso non si raccoglie niente: nemmeno per tenerlo da parte.
  if (!consent) return { consent: false }
  return {
    consent: true,
    ip: clientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    fbp: cookieValue(request, '_fbp'),
    fbc: cookieValue(request, '_fbc'),
    sourceUrl: request.url,
  }
}

const META_KEYS = ['meta_consent', 'meta_ip', 'meta_ua', 'meta_fbp', 'meta_fbc', 'meta_src'] as const

/** Il contesto in forma di metadata Stripe: stringhe corte, chiavi fisse. */
export function metaSessionMetadata(ctx: MetaUserContext): Record<string, string> {
  if (!ctx.consent) return { meta_consent: '0' }
  const out: Record<string, string> = { meta_consent: '1' }
  if (ctx.ip) out.meta_ip = ctx.ip.slice(0, 64)
  if (ctx.userAgent) out.meta_ua = ctx.userAgent.slice(0, 240)
  if (ctx.fbp) out.meta_fbp = ctx.fbp.slice(0, 120)
  if (ctx.fbc) out.meta_fbc = ctx.fbc.slice(0, 240)
  if (ctx.sourceUrl) out.meta_src = ctx.sourceUrl.slice(0, 240)
  return out
}

/** Il contesto riletto dai metadata della sessione, al webhook. */
export function metaContextFromSessionMetadata(meta: Record<string, unknown>): MetaUserContext {
  const v = (k: (typeof META_KEYS)[number]) => (typeof meta[k] === 'string' && meta[k] ? String(meta[k]) : undefined)
  if (v('meta_consent') !== '1') return { consent: false }
  return { consent: true, ip: v('meta_ip'), userAgent: v('meta_ua'), fbp: v('meta_fbp'), fbc: v('meta_fbc'), sourceUrl: v('meta_src') }
}

function clientIp(request: Request): string | undefined {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || undefined
}

export async function sendMetaConversionEvent(input: MetaEventInput): Promise<string | null> {
  const ctx = input.context ?? (input.request ? metaUserContextFromRequest(input.request) : { consent: false })
  if (!PIXEL_ID || !ACCESS_TOKEN || !ctx.consent) return null

  const eventId = input.eventId || randomUUID()
  const payload: Record<string, unknown> = {
    data: [{
      event_name: input.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: input.eventSourceUrl || ctx.sourceUrl,
      user_data: {
        em: sha256(input.email),
        ph: sha256(input.phone),
        client_ip_address: ctx.ip,
        client_user_agent: ctx.userAgent,
        fbp: ctx.fbp,
        fbc: ctx.fbc,
      },
      custom_data: {
        currency: input.currency,
        value: input.value,
        ...input.customData,
      },
    }],
  }
  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE

  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = await response.text()
      console.warn('[meta-capi] evento non inviato:', response.status, body.slice(0, 300))
      return null
    }
    return eventId
  } catch (error) {
    console.warn('[meta-capi] errore invio evento:', error instanceof Error ? error.message : error)
    return null
  }
}
