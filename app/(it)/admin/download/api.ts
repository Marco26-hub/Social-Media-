// Chiamate JSON alle API admin dell'area download. Ogni errore (HTTP o di rete)
// diventa un messaggio in italiano pronto da mostrare, mai un'eccezione.

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number }

type ApiInit = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown }

export async function callApi<T>(url: string, init: ApiInit = {}): Promise<ApiResult<T>> {
  try {
    const hasBody = init.body !== undefined
    const res = await fetch(url, {
      method: init.method ?? 'GET',
      cache: 'no-store',
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(init.body) : undefined,
    })
    const json: unknown = await res.json().catch(() => null)
    if (!res.ok) {
      const serverError = (json as { error?: unknown } | null)?.error
      return {
        ok: false,
        error: typeof serverError === 'string' && serverError ? serverError : `Operazione non riuscita (errore ${res.status}).`,
        status: res.status,
      }
    }
    return { ok: true, data: json as T }
  } catch {
    return { ok: false, error: 'Connessione non riuscita: controlla la rete e riprova.', status: 0 }
  }
}
