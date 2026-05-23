import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Social Automation — Admin',
  description: 'Gestione contenuti social automatizzata',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
