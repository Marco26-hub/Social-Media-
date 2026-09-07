import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { createStandaloneServiceCheckoutSession } from './stripe'
import { standaloneServiceBySlug } from './standalone-services'

test('Agenda and Segretaria plans expose the monthly fee and first-invoice setup fee', () => {
  const expected = {
    'agenda-clienti': [39000, 79000],
    'tutto-in-uno': [56900, 119000],
    'voce-base': [19900, 59000],
    'voce-attivita': [34900, 79000],
    'voce-azienda': [64900, 99000],
  } as const

  for (const [slug, [monthlyCents, setupCents]] of Object.entries(expected)) {
    const service = standaloneServiceBySlug(slug)
    assert.ok(service, `${slug} must be purchasable`)
    assert.equal(service.billingMode, 'subscription')
    assert.equal(service.amountCents, monthlyCents)
    assert.equal(service.setupCents, setupCents)
  }
})

test('Stripe checkout puts setup on the first invoice without making it recurring', async () => {
  const previousKey = process.env.STRIPE_SECRET_KEY
  const previousFetch = globalThis.fetch
  let requestBody = ''

  process.env.STRIPE_SECRET_KEY = 'sk_test_checkout_contract'
  globalThis.fetch = async (_input, init) => {
    requestBody = String(init?.body || '')
    return new Response(JSON.stringify({ id: 'cs_test_contract', url: 'https://checkout.stripe.test/session' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    await createStandaloneServiceCheckoutSession({
      orderId: 'order-contract',
      serviceSlug: 'agenda-clienti',
      serviceName: 'Agenda, clienti e WhatsApp',
      amountCents: 39000,
      setupCents: 79000,
      billingMode: 'subscription',
      customerEmail: 'cliente@example.com',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    })
  } finally {
    globalThis.fetch = previousFetch
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = previousKey
  }

  const params = new URLSearchParams(requestBody)
  assert.equal(params.get('mode'), 'subscription')
  assert.equal(params.get('line_items[0][price_data][unit_amount]'), '39000')
  assert.equal(params.get('line_items[0][price_data][recurring][interval]'), 'month')
  assert.equal(params.get('line_items[1][price_data][unit_amount]'), '79000')
  assert.equal(params.get('line_items[1][price_data][recurring][interval]'), null)
  assert.equal(params.get('line_items[1][price_data][product_data][metadata][tipo]'), 'setup')
  assert.equal(params.get('subscription_data[metadata][service_order_id]'), 'order-contract')
  assert.equal(params.get('billing_address_collection'), 'required')
  assert.equal(params.get('phone_number_collection[enabled]'), 'true')
  assert.equal(params.get('payment_method_options[card][request_three_d_secure]'), 'automatic')
})
