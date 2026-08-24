import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout servizi | Social Automation',
  description: 'Checkout sicuro per i servizi Blog SEO + GEO, Web & Commerce e Pilot Ricerca Clienti B2B di Social Automation.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
