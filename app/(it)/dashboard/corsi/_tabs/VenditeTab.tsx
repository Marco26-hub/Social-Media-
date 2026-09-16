'use client'

import { Receipt } from 'lucide-react'
import CorsiOrdiniAdmin from '@/components/CorsiOrdiniAdmin'

// Le vendite dei corsi. E lo stesso blocco del tab Pagamenti, con in piu i
// pulsanti per chiudere e riaprire l'accesso: due viste separate degli stessi
// ordini finirebbero per non dire la stessa cosa.
export default function VenditeTab() {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Vendite corsi</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Un rimborso totale chiude l’accesso da solo; uno parziale no, e va deciso qui.
        Chi ha iniziato un acquisto senza pagare è qui e non in Registrazioni: il suo account
        si attiva da solo quando completa il pagamento. Gli stessi ordini sono anche nel tab
        Pagamenti dei clienti.
      </p>
      <CorsiOrdiniAdmin gestioneAccesso />
    </div>
  )
}
