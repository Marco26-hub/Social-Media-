'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import styles from './portale.module.css'

// Logout client-side: signOut reindirizza alla landing SENZA la pagina di conferma
// grezza di NextAuth (che il link GET /api/auth/signout mostrava). Coerente con il
// logout del Sidebar admin.
export default function PortaleLogout() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className={styles.exit}>
      <LogOut size={16} />
      Esci
    </button>
  )
}
