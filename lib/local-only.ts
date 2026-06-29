// Gate per route/feature che eseguono operazioni LOCALI sulla macchina dell'utente
// (child_process, avvio di servizi come Ollama, migrations manuali).
// DEVE essere true SOLO in sviluppo locale: mai in produzione/Render/Vercel
// (Linux serverless, nessun Ollama, spawn non disponibile o pericoloso).
export function isLocalEnv(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    !process.env.RENDER &&
    !process.env.VERCEL
  )
}

// Host base del server Ollama locale (API OpenAI-compatible su /v1, nativa su /api).
// Override possibile con OLLAMA_API_URL (stesso usato da lib/ai.ts).
export function ollamaBaseUrl(): string {
  const raw = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434'
  // Rimuove eventuale suffisso /v1/... per ottenere solo host:porta.
  return raw.replace(/\/v1\/.*$/, '').replace(/\/$/, '')
}
