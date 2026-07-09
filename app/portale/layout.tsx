import Link from 'next/link'
import { LogOut } from 'lucide-react'

// Area CLIENTE — separata dalla dashboard operatore/admin. Nessuna sidebar di
// gestione: il cliente vede solo i suoi risultati, il piano e i pagamenti.
export default function PortaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/portale" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 font-serif text-lg font-black text-gray-900">SA</span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">Social Automation</span>
              <span className="text-[11px] font-medium text-gray-500">Area cliente</span>
            </span>
          </Link>
          <Link
            href="/api/auth/signout?callbackUrl=/login"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
    </div>
  )
}
