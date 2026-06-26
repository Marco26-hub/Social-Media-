import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isDemo } from '@/lib/demo'

export async function middleware(request: NextRequest) {
  if (isDemo()) return NextResponse.next()

  const { pathname } = request.nextUrl
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET })
  const isAuthPage = pathname === '/login'
  const isDashboard = pathname.startsWith('/dashboard')
  const isApprove = pathname.startsWith('/approve')
  const isPreview = pathname.startsWith('/preview')
  const isPublicApprovalApi = pathname === '/api/data/approve' && request.method !== 'POST'
  const isProtectedApi =
    pathname.startsWith('/api/generate') ||
    (pathname.startsWith('/api/data') && !isPublicApprovalApi)

  if (isApprove || isPreview) return NextResponse.next()

  if (isProtectedApi && !token) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(token ? '/dashboard/clienti' : '/login', request.url))
  }

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard/clienti', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
