import { initBotId } from 'botid/client/core'

// Protegge solo le azioni pubbliche che possono creare una sessione Stripe.
// Il webhook non deve passare da BotID: viene chiamato direttamente da Stripe.
initBotId({
  protect: [
    { path: '/api/checkout/service', method: 'POST' },
    { path: '/api/auth/register', method: 'POST' },
    { path: '/api/consulenza', method: 'POST' },
  ],
})
