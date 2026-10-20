import { TITOLARE } from '@/lib/legal-config'

export function richiestaDemoRistoranti(locale: 'it' | 'en' = 'it'): string {
  const message = locale === 'en'
    ? 'Hello SWA, I would like to arrange a demo of Tavolo for my venue: QR menu, ordering, payments and bookings.'
    : 'Ciao SWA, vorrei concordare una demo di Tavolo per il mio locale: menu QR, ordini, pagamenti e prenotazioni.'
  return `https://wa.me/${TITOLARE.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}
