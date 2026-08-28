import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Approvazione contenuto | Social Web Automation',
  robots: { index: false, follow: false, noarchive: true },
}

export default function ApprovalLayout({ children }: { children: React.ReactNode }) {
  return children
}
