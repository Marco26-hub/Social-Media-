'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import ClienteSelector from '@/components/ClienteSelector'
import {
  LayoutDashboard, Calendar, Settings,
  LogOut, Zap, Menu, X, Target,
  Users, Sparkles, TrendingUp, Globe, CreditCard, BookOpen
} from 'lucide-react'

type NavItem = { href: string; label: string; icon?: React.ElementType; emoji?: string; external?: boolean; adminOnly?: boolean }
type NavSection = { title: string; items: NavItem[] }

const SECTIONS: NavSection[] = [
  {
    title: '',
    items: [
      { href: '/dashboard',            label: 'Dashboard',  icon: LayoutDashboard },
      { href: '/dashboard/il-mio-piano', label: 'Il mio piano', icon: CreditCard },
      { href: '/dashboard/calendario', label: 'Calendario', icon: Calendar },
      { href: '/dashboard/agenti',     label: 'Agenti (auto)', icon: Zap, adminOnly: true },
    ],
  },
  {
    title: 'SOCIAL',
    items: [
      { href: '/dashboard/social', label: 'Crea contenuti', icon: Sparkles, adminOnly: true },
    ],
  },
  {
    // Ex 10 voci: Blog SEO, Campagne Ads, SEO + GEO, Leads, Competitor,
    // Analytics, Report, Log e Consumi sono tutti tab di /dashboard/marketing.
    // Vecchie URL vive via redirect stub.
    title: 'STRUMENTI',
    items: [
      { href: '/dashboard/piano',     label: 'Piano editoriale',      icon: Target, adminOnly: true },
      { href: '/dashboard/marketing', label: 'Marketing e risultati', icon: TrendingUp },
    ],
  },
  {
    // Ex 9 voci: area agenzia (Clienti/Registrazioni/Pagamenti/Onboarding) sotto
    // "Clienti", e config (Impostazioni/Brand/Prodotti/Setup) sotto "Configurazione".
    title: 'GESTIONE',
    items: [
      { href: '/dashboard/clienti',  label: 'Clienti',        icon: Users, adminOnly: true },
      { href: '/dashboard/settings', label: 'Configurazione', icon: Settings, adminOnly: true },
      { href: '/dashboard/guida',    label: 'Come funziona',  icon: BookOpen, adminOnly: true },
      { href: '/',                   label: 'Vedi landing',   icon: Globe, external: true },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { data: session } = useSession()
  const isAdmin = ['admin', 'super_admin'].includes(session?.user?.ruolo ?? '')
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  async function handleLogout() {
    await signOut({ redirect: false })
    // Dopo il logout torna alla landing pubblica (non alla pagina di login).
    router.replace('/')
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-sidebar text-white flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2" aria-label="Social Web Automation, home">
          <span className="w-[76px] h-9 bg-[#0f6b4f] rounded flex items-center justify-center flex-shrink-0">
            <Image src="/brand/swa-logo-official.png" alt="SWA" width={66} height={30} className="w-[66px] h-[30px] object-contain" priority />
          </span>
          <span className="font-semibold text-sm">Social Web Automation</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            className="p-2 text-white/80 hover:text-white"
            aria-label="Apri la landing"
            title="Vedi la landing"
          >
            <Globe className="w-5 h-5" />
          </Link>
          <button onClick={() => setOpen(true)} className="p-2 -mr-2" aria-label="Apri menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar drawer */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 md:z-auto
        h-screen w-64 md:w-60 bg-sidebar flex flex-col flex-shrink-0
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 min-w-0" aria-label="Social Web Automation, home">
            <span className="w-[76px] h-9 bg-[#0f6b4f] rounded flex items-center justify-center flex-shrink-0">
              <Image src="/brand/swa-logo-official.png" alt="SWA" width={66} height={30} className="w-[66px] h-[30px] object-contain" priority />
            </span>
            <span className="text-white font-semibold text-sm">Social Web Automation</span>
          </Link>
          <button onClick={() => setOpen(false)} className="md:hidden text-white/60 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ClienteSelector />

        {/* Nav con sezioni */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {SECTIONS.map((section, idx) => {
            const visibleItems = section.items.filter(item => !item.adminOnly || isAdmin)
            if (!visibleItems.length) return null
            return (
              <div key={idx}>
                {section.title && (
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 px-3">
                    {section.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map(item => {
                    const active = !item.external && (
                      pathname === item.href ||
                      (item.href !== '/dashboard' && item.href !== '/' && pathname.startsWith(item.href))
                    )
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        {...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          active
                            ? 'bg-brand-600 text-white font-medium'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {item.emoji ? (
                          <span className="w-4 text-center text-base leading-none">{item.emoji}</span>
                        ) : Icon ? (
                          <Icon className="w-4 h-4 flex-shrink-0" />
                        ) : null}
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Esci
          </button>
        </div>
      </aside>
    </>
  )
}
