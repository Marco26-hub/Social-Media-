import crypto from 'crypto'

const STRIPE_API_BASE = 'https://api.stripe.com/v1'

export type StripeCheckoutSession = {
  id: string
  url: string | null
  customer?: string | null
  subscription?: string | null
}

export type StripePortalSession = {
  id: string
  url: string
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim())
}

function stripeKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) throw new Error('STRIPE_SECRET_KEY non configurata')
  return key
}

function appendForm(params: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return
  params.append(key, String(value))
}

async function stripeRequest<T>(path: string, params: URLSearchParams): Promise<T> {
  const res = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  const data = await res.json().catch(() => null) as { error?: { message?: string } } | T | null
  if (!res.ok) {
    const msg = data && typeof data === 'object' && 'error' in data ? data.error?.message : null
    throw new Error(msg || `Stripe error ${res.status}`)
  }
  return data as T
}

export function euroStringToCents(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const amount = Number(cleaned)
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return Math.round(amount * 100)
}

export async function createStripeCheckoutSession(args: {
  clienteId: string
  clienteNome: string
  clienteEmail?: string | null
  pacchettoSlug: string
  pacchettoNome: string
  amountCents: number
  successUrl: string
  cancelUrl: string
  stripeCustomerId?: string | null
}): Promise<StripeCheckoutSession> {
  if (args.amountCents <= 0) throw new Error('Importo pacchetto non valido')

  const params = new URLSearchParams()
  appendForm(params, 'mode', 'subscription')
  appendForm(params, 'success_url', args.successUrl)
  appendForm(params, 'cancel_url', args.cancelUrl)
  appendForm(params, 'client_reference_id', args.clienteId)
  appendForm(params, 'customer', args.stripeCustomerId || null)
  if (!args.stripeCustomerId) appendForm(params, 'customer_email', args.clienteEmail || null)
  appendForm(params, 'metadata[cliente_id]', args.clienteId)
  appendForm(params, 'metadata[pacchetto_slug]', args.pacchettoSlug)
  appendForm(params, 'subscription_data[metadata][cliente_id]', args.clienteId)
  appendForm(params, 'subscription_data[metadata][pacchetto_slug]', args.pacchettoSlug)
  appendForm(params, 'line_items[0][quantity]', 1)
  appendForm(params, 'line_items[0][price_data][currency]', 'eur')
  appendForm(params, 'line_items[0][price_data][unit_amount]', args.amountCents)
  appendForm(params, 'line_items[0][price_data][recurring][interval]', 'month')
  appendForm(params, 'line_items[0][price_data][product_data][name]', `Social Automation — ${args.pacchettoNome}`)
  appendForm(params, 'line_items[0][price_data][product_data][metadata][cliente_id]', args.clienteId)
  appendForm(params, 'line_items[0][price_data][product_data][metadata][pacchetto_slug]', args.pacchettoSlug)

  return stripeRequest<StripeCheckoutSession>('/checkout/sessions', params)
}

export async function createStripePortalSession(args: {
  stripeCustomerId: string
  returnUrl: string
}): Promise<StripePortalSession> {
  const params = new URLSearchParams()
  appendForm(params, 'customer', args.stripeCustomerId)
  appendForm(params, 'return_url', args.returnUrl)
  return stripeRequest<StripePortalSession>('/billing_portal/sessions', params)
}

export function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET non configurata')
  if (!signatureHeader) return false

  const parts = Object.fromEntries(
    signatureHeader.split(',').map(part => {
      const [key, value] = part.split('=')
      return [key, value]
    }),
  )
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  const payload = `${timestamp}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  const expectedBuffer = Buffer.from(expected, 'hex')
  const signatureBuffer = Buffer.from(signature, 'hex')
  if (expectedBuffer.length !== signatureBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
}
