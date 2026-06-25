import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth'

export const ACTIVE_CLIENTE_COOKIE = 'active_cliente_id'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user?.id) throw new Error('Non autenticato')
  return session.user as { id: string; email: string; name: string }
}

export async function getActiveClienteId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACTIVE_CLIENTE_COOKIE)?.value || null
}

export async function requireClienteId(): Promise<string> {
  const id = await getActiveClienteId()
  if (!id) throw new Error('Nessun cliente selezionato')
  return id
}
