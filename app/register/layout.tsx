import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Attiva il servizio | Social Automation',
  robots: { index: false, follow: false, noarchive: true },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
