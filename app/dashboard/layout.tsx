import Sidebar from '@/components/Sidebar'
import DemoBanner from '@/components/DemoBanner'
import AuthProvider from '@/components/AuthProvider'
import { GenerationProvider } from '@/components/GenerationProvider'
import GenerationBar from '@/components/GenerationBar'
import BackToTop from '@/components/BackToTop'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GenerationProvider>
        <div className="md:flex min-h-screen w-full max-w-full overflow-x-hidden">
          <Sidebar />
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
