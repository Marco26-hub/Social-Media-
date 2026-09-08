export function calendarContentHref(idContenuto: string): string {
  const contentId = idContenuto.trim()
  const params = new URLSearchParams({ filter: 'tutti' })

  if (contentId) {
    params.set('q', contentId)
    params.set('open', contentId)
  }

  return `/dashboard/calendario?${params.toString()}`
}
