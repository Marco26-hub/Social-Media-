import { redirect } from 'next/navigation'

type SearchParams = Record<string, string | string[] | undefined>

// Le pagine che erano voci di menu separate sono diventate tab delle pagine
// contenitore (/dashboard/marketing, /dashboard/clienti, /dashboard/settings).
// Questo helper genera lo stub che tiene vive le vecchie
// URL: conserva la query originale — serve ai callback che rimandano lì
// (OAuth Meta `?connect=`, Stripe `?stripe=`) — e aggiunge il tab di destinazione.
export function tabRedirect(target: string, tab: string) {
  return async function TabRedirect({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const sp = await searchParams
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(sp)) {
      if (Array.isArray(value)) value.forEach(v => qs.append(key, v))
      else if (value !== undefined) qs.set(key, value)
    }
    qs.set('tab', tab)
    redirect(`${target}?${qs.toString()}`)
  }
}
