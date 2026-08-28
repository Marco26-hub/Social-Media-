// Invio email transazionali via Resend REST (nessun SDK extra, come lib/stripe.ts).
// No-op sicuro se RESEND_API_KEY manca: logga e ritorna { sent:false } senza
// rompere il flusso (registrazione/attivazione funzionano comunque). Appena la
// key è su Vercel, le email partono senza altre modifiche.
//
// Env:
//   RESEND_API_KEY   — key Resend (re_...)
//   EMAIL_FROM       — mittente verificato, es. "Social Web Automation <no-reply@tuodominio.it>"
//   AGENCY_NOTIFY_EMAIL — dove ricevere le notifiche interne (nuove registrazioni)

const RESEND_API = 'https://api.resend.com/emails'

export type EmailResult = { sent: boolean; id?: string; error?: string; skipped?: boolean }

function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim())
}

export async function sendEmail(opts: { to: string | string[]; subject: string; html?: string; text?: string }): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()
  if (!key || !from) {
    console.warn(`[email] RESEND_API_KEY/EMAIL_FROM assenti: email "${opts.subject}" NON inviata (no-op).`)
    return { sent: false, skipped: true }
  }
  const to = Array.isArray(opts.to) ? opts.to : [opts.to]
  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from,
        to,
        subject: opts.subject,
        ...(opts.html ? { html: opts.html } : {}),
        ...(opts.text ? { text: opts.text } : {}),
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[email] Resend ${res.status}: ${body.slice(0, 200)}`)
      return { sent: false, error: `Resend ${res.status}` }
    }
    const data = await res.json().catch(() => ({})) as Record<string, unknown>
    return { sent: true, id: typeof data.id === 'string' ? data.id : undefined }
  } catch (e) {
    console.error('[email] invio fallito:', e instanceof Error ? e.message : String(e))
    return { sent: false, error: (e as Error).message?.slice(0, 120) }
  }
}

// Notifica interna all'agenzia: nuova registrazione da approvare.
export async function notifyNewRegistration(p: { nome: string; email: string; azienda: string; pacchetto?: string | null }): Promise<EmailResult> {
  const to = process.env.AGENCY_NOTIFY_EMAIL?.trim()
  if (!to) return { sent: false, skipped: true }
  return sendEmail({
    to,
    subject: `Nuova registrazione: ${p.azienda} (${p.pacchetto || 'nessun pacchetto'})`,
    text: `Nuova richiesta di registrazione da approvare:\n\nNome: ${p.nome}\nEmail: ${p.email}\nAzienda: ${p.azienda}\nPacchetto: ${p.pacchetto || '—'}\n\nApprova da /dashboard/clienti?tab=registrazioni.`,
  })
}

// Email al cliente: registrazione ricevuta (in attesa di attivazione).
export async function sendRegistrationReceived(to: string, nome: string): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: 'Richiesta ricevuta — Social Web Automation',
    html: `<p>Ciao ${escapeHtml(nome)},</p><p>abbiamo ricevuto la tua richiesta di registrazione. Ti attiviamo a breve e ti avvisiamo via email appena l'account è pronto.</p><p>— Social Web Automation</p>`,
  })
}

// Email al cliente: account attivato.
export async function sendAccountActivated(to: string, nome: string, loginUrl: string): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: 'Il tuo account è attivo — Social Web Automation',
    html: `<p>Ciao ${escapeHtml(nome)},</p><p>il tuo account è stato attivato. Puoi accedere al pannello qui:</p><p><a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></p><p>— Social Web Automation</p>`,
  })
}

export async function sendStandaloneOrderConfirmed(
  to: string,
  nome: string,
  serviceName: string,
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: `Pagamento confermato - ${serviceName}`,
    html: `<p>Ciao ${escapeHtml(nome)},</p><p>il pagamento per <strong>${escapeHtml(serviceName)}</strong> e stato confermato.</p><p>Ti contatteremo per raccogliere materiali, accessi e priorita operative necessarie all'avvio del servizio.</p><p>Social Web Automation</p>`,
    text: `Ciao ${nome},\n\nil pagamento per ${serviceName} e stato confermato. Ti contatteremo per raccogliere materiali, accessi e priorita operative necessarie all'avvio del servizio.\n\nSocial Web Automation`,
  })
}

export async function notifyStandaloneOrderPaid(p: {
  orderId: string
  serviceName: string
  nome: string
  azienda?: string | null
  email: string
  amountCents: number
}): Promise<EmailResult> {
  const to = process.env.AGENCY_NOTIFY_EMAIL?.trim()
  if (!to) return { sent: false, skipped: true }
  return sendEmail({
    to,
    subject: `Nuovo ordine pagato: ${p.serviceName}`,
    text: `Ordine: ${p.orderId}\nServizio: ${p.serviceName}\nCliente: ${p.nome}\nAzienda: ${p.azienda || '-'}\nEmail: ${p.email}\nImporto: EUR ${(p.amountCents / 100).toFixed(2)}\n\nGestisci l'ordine dall'area Pagamenti.`,
  })
}

export type WithdrawalReceipt = {
  referenceCode: string
  requestLabel: string
  fullName: string
  email: string
  contractReference: string
  contractCategory: string
  declarationText: string
  submittedAtLabel: string
  payloadHash: string
}

export async function sendWithdrawalReceipt(receipt: WithdrawalReceipt): Promise<EmailResult> {
  const rows = [
    ['Codice pratica', receipt.referenceCode],
    ['Richiesta', receipt.requestLabel],
    ['Nome', receipt.fullName],
    ['Email di conferma', receipt.email],
    ['Contratto', receipt.contractReference],
    ['Categoria', receipt.contractCategory],
    ['Data e ora di trasmissione', receipt.submittedAtLabel],
    ['Impronta della dichiarazione', receipt.payloadHash],
  ].map(([label, value]) => `<tr><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #d9e1dd">${escapeHtml(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #d9e1dd">${escapeHtml(value)}</td></tr>`).join('')

  return sendEmail({
    to: receipt.email,
    subject: `Ricevuta ${receipt.requestLabel.toLowerCase()} ${receipt.referenceCode} - Social Web Automation`,
    html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#15231f"><h1 style="font-size:24px">Dichiarazione ricevuta</h1><p>Questa email costituisce avviso di ricevimento su supporto durevole. Conserva il codice pratica.</p><table style="width:100%;border-collapse:collapse">${rows}</table><h2 style="font-size:17px;margin-top:24px">Contenuto trasmesso</h2><p style="padding:16px;background:#f3f7f5;border-left:4px solid #0f7b5a">${escapeHtml(receipt.declarationText)}</p><p>La ricezione registra la dichiarazione al momento indicato. L'esito delle verifiche e gli eventuali rimborsi saranno comunicati separatamente.</p><p>Social Web Automation di Marco Dibenedetto</p></div>`,
    text: withdrawalReceiptText(receipt),
  })
}

export async function notifyWithdrawalRequest(to: string, receipt: WithdrawalReceipt): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: `${receipt.requestLabel}: ${receipt.referenceCode}`,
    text: `Nuova dichiarazione ricevuta.\n\n${withdrawalReceiptText(receipt)}\n\nGestire la pratica dall'area amministrativa Pagamenti.`,
  })
}

function withdrawalReceiptText(receipt: WithdrawalReceipt): string {
  return [
    'SOCIAL AUTOMATION - RICEVUTA DICHIARAZIONE',
    '',
    `Codice pratica: ${receipt.referenceCode}`,
    `Richiesta: ${receipt.requestLabel}`,
    `Nome: ${receipt.fullName}`,
    `Email di conferma: ${receipt.email}`,
    `Contratto: ${receipt.contractReference}`,
    `Categoria: ${receipt.contractCategory}`,
    `Data e ora di trasmissione: ${receipt.submittedAtLabel}`,
    '',
    'Contenuto trasmesso:',
    receipt.declarationText,
    '',
    `Impronta SHA-256: ${receipt.payloadHash}`,
  ].join('\n')
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

export { emailConfigured }
