// Invio email transazionali via Resend REST (nessun SDK extra, come lib/stripe.ts).
// No-op sicuro se RESEND_API_KEY manca: logga e ritorna { sent:false } senza
// rompere il flusso (registrazione/attivazione funzionano comunque). Appena la
// key è su Render, le email partono senza altre modifiche.
//
// Env:
//   RESEND_API_KEY   — key Resend (re_...)
//   EMAIL_FROM       — mittente verificato, es. "Social Automation <no-reply@tuodominio.it>"
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
    text: `Nuova richiesta di registrazione da approvare:\n\nNome: ${p.nome}\nEmail: ${p.email}\nAzienda: ${p.azienda}\nPacchetto: ${p.pacchetto || '—'}\n\nApprova da /dashboard/registrazioni.`,
  })
}

// Email al cliente: registrazione ricevuta (in attesa di attivazione).
export async function sendRegistrationReceived(to: string, nome: string): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: 'Richiesta ricevuta — Social Automation',
    html: `<p>Ciao ${escapeHtml(nome)},</p><p>abbiamo ricevuto la tua richiesta di registrazione. Ti attiviamo a breve e ti avvisiamo via email appena l'account è pronto.</p><p>— Social Automation</p>`,
  })
}

// Email al cliente: account attivato.
export async function sendAccountActivated(to: string, nome: string, loginUrl: string): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: 'Il tuo account è attivo — Social Automation',
    html: `<p>Ciao ${escapeHtml(nome)},</p><p>il tuo account è stato attivato. Puoi accedere al pannello qui:</p><p><a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></p><p>— Social Automation</p>`,
  })
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

export { emailConfigured }
