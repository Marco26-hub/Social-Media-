export function isDemo(): boolean {
  // Demo esplicito: scelta consapevole (deploy demo pubblico, dev locale).
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // SICUREZZA (fail-closed): in demo `requireAuth` restituisce un utente finto,
    // `requireClienteAccess` accetta QUALUNQUE id e `requireAdmin` passa sempre.
    // Con un DB reale collegato, il flag acceso per sbaglio esporrebbe /api/admin
    // e i dati di ogni cliente a un anonimo. In produzione con DATABASE_URL
    // configurato il demo è quindi disattivato, salvo opt-in esplicito e separato.
    const withRealDb = typeof window === 'undefined'
      && process.env.NODE_ENV === 'production'
      && Boolean(process.env.DATABASE_URL?.trim())
    if (withRealDb && process.env.DEMO_ALLOW_WITH_DB !== 'true') {
      console.error('[SICUREZZA] NEXT_PUBLIC_DEMO_MODE=true ignorato: build di produzione con DATABASE_URL configurato. Per un deploy demo con DB imposta anche DEMO_ALLOW_WITH_DB=true.')
      return false
    }
    return true
  }
  if (typeof window !== 'undefined') return false
  // SICUREZZA: in produzione non inferire MAI demo da DATABASE_URL mancante.
  // Un typo/secret mancante non deve aprire l'app senza auth (fail-closed).
  if (process.env.NODE_ENV === 'production') return false
  // Solo in dev locale: nessun DB = demo (comodità).
  if (!process.env.DATABASE_URL) return true
  return false
}
