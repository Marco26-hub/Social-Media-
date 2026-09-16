#!/usr/bin/env node
// Prova il webhook dei corsi senza un account Stripe.
//
// La firma di Stripe e un HMAC-SHA256 di «timestamp.corpo» col segreto del
// webhook: se il server gira con lo stesso segreto, questi eventi passano la
// verifica esattamente come quelli veri. Cosi si prova tutto cio che succede
// DOPO il pagamento — ordine pagato, account attivato, rimborsi, storico —
// senza chiavi Stripe. Non prova la creazione della sessione di pagamento, che
// parla con i server di Stripe.
//
// Funziona solo contro un server avviato con lo stesso segreto, quindi solo in
// locale: in produzione il segreto e un altro e questi eventi vengono respinti.
//
// Uso:
//   STRIPE_WEBHOOK_SECRET=whsec_prova_locale nel .env.local del server, poi
//   node scripts/prova-webhook-corsi.mjs <base> pagamento <acquisto> <corso> <utente> <slug> <payment_intent>
//   node scripts/prova-webhook-corsi.mjs <base> rimborso <payment_intent> <rimborsato_cents> <pagato_cents>
//   node scripts/prova-webhook-corsi.mjs <base> firma-sbagliata

import crypto from 'node:crypto'

const SEGRETO = process.env.PROVA_WEBHOOK_SECRET || 'whsec_prova_locale'
const [base, tipo, ...argomenti] = process.argv.slice(2)

if (!base || !tipo) {
  console.error('uso: prova-webhook-corsi.mjs <base> pagamento|rimborso|firma-sbagliata [...]')
  process.exit(1)
}

async function invia(evento, firmaValida = true) {
  const corpo = JSON.stringify(evento)
  const t = Math.floor(Date.now() / 1000)
  const firma = firmaValida
    ? crypto.createHmac('sha256', SEGRETO).update(`${t}.${corpo}`).digest('hex')
    : 'deadbeef'
  const risposta = await fetch(`${base}/api/stripe/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': `t=${t},v1=${firma}` },
    body: corpo,
  })
  console.log(risposta.status, (await risposta.text()).slice(0, 200))
}

// Id sempre diversi: il webhook scarta gli eventi gia visti, ed e giusto cosi.
const idEvento = prefisso => `${prefisso}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`

if (tipo === 'pagamento') {
  const [acquisto, corso, utente, slug, paymentIntent] = argomenti
  await invia({
    id: idEvento('evt_prova_pagamento'),
    type: 'checkout.session.completed',
    data: { object: {
      id: `cs_test_prova_${Date.now()}`,
      object: 'checkout.session',
      payment_status: 'paid',
      payment_intent: paymentIntent,
      amount_total: 200000,
      currency: 'eur',
      metadata: { tipo: 'corso', ref_id: acquisto, corso_id: corso, corso_slug: slug, user_id: utente },
    } },
  })
} else if (tipo === 'rimborso') {
  const [paymentIntent, rimborsato, pagato] = argomenti
  await invia({
    id: idEvento('evt_prova_rimborso'),
    type: 'charge.refunded',
    data: { object: {
      id: `ch_test_prova_${Date.now()}`,
      object: 'charge',
      payment_intent: paymentIntent,
      amount: Number(pagato),
      amount_refunded: Number(rimborsato),
      refunded: Number(rimborsato) >= Number(pagato),
    } },
  })
} else if (tipo === 'firma-sbagliata') {
  await invia({ id: idEvento('evt_x'), type: 'checkout.session.completed', data: { object: {} } }, false)
} else {
  console.error(`tipo sconosciuto: ${tipo}`)
  process.exit(1)
}
