import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'

export const ACTIVE_CLIENTE_COOKIE = 'active_cliente_id'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user?.id) {
    if (isDemo() || !dbReady()) {
      return { id: 'demo-user', email: 'demo@social-automation.local', name: 'Admin Demo' }
    }
    throw new Error('Non autenticato')
  }
  return session.user as { id: string; email: string; name: string }
}

export async function getActiveClienteId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACTIVE_CLIENTE_COOKIE)?.value || null
}

// Primo cliente attivo a cui l'utente ha accesso. Serve come ripiego quando il
// cookie del cliente attivo non è utilizzabile.
async function firstAccessibleClienteId(userId: string): Promise<string | null> {
  const rows = await q(
    `SELECT c.id
     FROM user_client_access uca
     JOIN clienti c ON c.id = uca.cliente_id
     WHERE uca.user_id = $1
       AND uca.attivo = true
       AND c.attivo = true
     ORDER BY (uca.ruolo = 'owner') DESC, c.nome
     LIMIT 1`,
    [userId],
  )
  return typeof rows[0]?.id === 'string' ? rows[0].id as string : null
}

export async function requireClienteId(): Promise<string> {
  const user = await requireAuth()
  const id = await getActiveClienteId()

  if (isDemo() || !dbReady()) {
    if (!id) throw new Error('Nessun cliente selezionato')
    return id
  }

  // Il cookie `active_cliente_id` dura un anno e non si azzera al logout: dopo
  // un cambio account può puntare al cliente di QUALCUN ALTRO. Prima negava e
  // basta — l'area /portale del cliente moriva su "Accesso negato". Ora il
  // cookie non valido viene ignorato e si usa un cliente dell'utente (mai uno
  // a cui non ha accesso: il ripiego legge solo i suoi user_client_access).
  if (id) {
    try {
      return await requireClienteAccess(id)
    } catch {
      const fallback = await firstAccessibleClienteId(user.id)
      if (fallback) return fallback
      throw new Error('Accesso cliente negato')
    }
  }

  const fallback = await firstAccessibleClienteId(user.id)
  if (fallback) return fallback
  throw new Error('Nessun cliente selezionato')
}

export async function requireClienteAccess(clienteId?: string): Promise<string> {
  const user = await requireAuth()
  const id = clienteId || await getActiveClienteId()
  if (!id) throw new Error('Nessun cliente selezionato')

  if (isDemo() || !dbReady()) return id

  const rows = await q(
    `SELECT 1
     FROM profiles p
     WHERE p.id = $1 AND p.ruolo_globale = 'super_admin'
     UNION ALL
     SELECT 1
     FROM user_client_access uca
     WHERE uca.user_id = $1
       AND uca.cliente_id = $2
       AND uca.attivo = true
     LIMIT 1`,
    [user.id, id],
  )

  if (!rows.length) throw new Error('Accesso cliente negato')
  return id
}

export async function requireAdmin() {
  const user = await requireAuth()

  if (isDemo() || !dbReady()) return user

  const rows = await q(
    `SELECT ruolo_globale
     FROM profiles
     WHERE id = $1
       AND ruolo_globale IN ('super_admin','admin')
     LIMIT 1`,
    [user.id],
  )

  if (!rows.length) throw new Error('Operazione riservata ad admin')
  return user
}
