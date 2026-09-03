import { createHash, randomUUID } from 'crypto'

import { marketingConcesso } from './cookie-consent'

const GRAPH_VERSION = 'v21.0'
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE

type MetaEventName = 'PageView' | 'Lead' | 'InitiateCheckout' | 'Purchase'

type MetaEventInput = {
  eventName: MetaEventName
  request: Request
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

function clientIp(request: Request): string | undefined {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || undefined
}

export async function sendMetaConversionEvent(input: MetaEventInput): Promise<string | null> {
  if (!PIXEL_ID || !ACCESS_TOKEN || !marketingConsentGranted(input.request)) return null

  const eventId = input.eventId || randomUUID()
  const payload: Record<string, unknown> = {
    data: [{
      event_name: input.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: input.eventSourceUrl || input.request.url,
      user_data: {
        em: sha256(input.email),
        ph: sha256(input.phone),
        client_ip_address: clientIp(input.request),
        client_user_agent: input.request.headers.get('user-agent') || undefined,
        fbp: cookieValue(input.request, '_fbp'),
        fbc: cookieValue(input.request, '_fbc'),
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
