export function isDemo(): boolean {
  // Demo esplicito: scelta consapevole (deploy demo pubblico, dev locale).
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true
  if (typeof window !== 'undefined') return false
  // SICUREZZA: in produzione non inferire MAI demo da DATABASE_URL mancante.
  // Un typo/secret mancante non deve aprire l'app senza auth (fail-closed).
  if (process.env.NODE_ENV === 'production') return false
  // Solo in dev locale: nessun DB = demo (comodità).
  if (!process.env.DATABASE_URL) return true
  return false
}
