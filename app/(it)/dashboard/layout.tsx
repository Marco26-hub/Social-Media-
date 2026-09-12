import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import DemoBanner from '@/components/DemoBanner'
import AuthProvider from '@/components/AuthProvider'
import { GenerationProvider } from '@/components/GenerationProvider'
import GenerationBar from '@/components/GenerationBar'
import BackToTop from '@/components/BackToTop'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Area operativa | Social Web Automation',
  robots: { index: false, follow: false, noarchive: true },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GenerationProvider>
        {/* data-area marca l'area operativa: le correzioni del tema scuro in
            globals.css sono limitate a questo sottoalbero, cosi non possono
            toccare il sito pubblico, che ha gia i suoi colori. */}
        <div data-area="operativa" className="md:flex min-h-screen w-full max-w-full overflow-x-hidden">
          <Suspense fallback={<aside className="hidden md:block md:sticky top-0 h-screen w-60 flex-shrink-0 bg-sidebar" />}>
            <Sidebar />
          </Suspense>
          <main className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
            <DemoBanner />
            {children}
          </main>
        </div>
        <GenerationBar />
        <BackToTop />
      </GenerationProvider>
    </AuthProvider>
  )
}
