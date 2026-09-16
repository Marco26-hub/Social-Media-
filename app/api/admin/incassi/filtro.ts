import { giornoRoma } from '@/lib/csv'
import type { Incasso } from '@/lib/incassi'
import { intervalloPeriodo, type Intervallo } from '@/lib/periodi'

/**
 * Il periodo chiesto nell'indirizzo, oppure null se manca o e scritto male.
 * Senza periodo l'export restituisce tutto: e il caso di chi vuole lo storico.
 */
export function periodoRichiesto(url: URL): Intervallo | null {
  const periodo = url.searchParams.get('periodo')
  return periodo ? intervalloPeriodo(periodo) : null
}

/** Gli incassi del periodo, per giorno di calendario italiano, estremi inclusi. */
export function nelPeriodo(incassi: Incasso[], intervallo: Intervallo | null): Incasso[] {
  if (!intervallo) return incassi
  return incassi.filter(i => {
    const giorno = giornoRoma(i.pagato_il)
    return giorno >= intervallo.da && giorno <= intervallo.a
  })
}
