import { euro } from '@/lib/euro'

// Listino del sistema di sala: menu QR, ordine e pagamento al tavolo,
// prenotazioni.
//
// Il prodotto vive in un repository suo — la piattaforma con Stripe, le sale,
// i QR — e questa e' la copia che il sito pubblica. Le due copie vanno tenute
// allineate a mano: sono progetti separati, e l'unico modo per non farle
// divergere e' che chi cambia il prezzo di la' passi anche di qua. La fonte
// resta packages/shared/plans.ts del gestionale; qui non si inventa niente.
//
// Le cifre sono in centesimi come nella sorgente, IVA esclusa. L'attivazione
// e' diversa per modulo perche' e' diverso il lavoro del primo giorno: le sole
// prenotazioni vogliono capienza, orari e pagina pubblica; gli ordini in piu'
// il menu caricato, i QR stampati e l'incasso collegato.

export type PianoSala = {
  chiave: string
  nome: string
  canoneCents: number
  annualeCents: number
  attivazioneCents: number
  descrizione: string
  nota: string
}

export const GIORNI_PROVA = 14

export const PIANI_SALA: PianoSala[] = [
  {
    chiave: 'prenotazioni',
    nome: 'Solo prenotazioni',
    canoneCents: 8900,
    annualeCents: 89000,
    attivazioneCents: 44900,
    descrizione: 'Pagina di prenotazione per il tuo sito, calendario e conferme.',
    nota: 'Senza gestionale di sala',
  },
  {
    chiave: 'ordini',
    nome: 'Ordini e pagamenti',
    canoneCents: 10900,
    annualeCents: 109000,
    attivazioneCents: 64900,
    descrizione: 'Menu QR, ordine al tavolo, conto alla romana, fattura elettronica.',
    nota: 'Disdetta in qualsiasi momento',
  },
  {
    chiave: 'completo',
    nome: 'Tutto',
    canoneCents: 13900,
    annualeCents: 139000,
    attivazioneCents: 64900,
    descrizione: 'Ordini, pagamenti e prenotazioni insieme.',
    nota: 'Due mesi in omaggio sull’annuale',
  },
]

export function pianoSala(chiave: string): PianoSala {
  const piano = PIANI_SALA.find(p => p.chiave === chiave)
  if (!piano) throw new Error(`Piano di sala sconosciuto: ${chiave}`)
  return piano
}

export const SALA_DA = euro(Math.min(...PIANI_SALA.map(p => p.canoneCents)) / 100)
export const SALA_ATTIVAZIONE_MIN = euro(Math.min(...PIANI_SALA.map(p => p.attivazioneCents)) / 100)
export const SALA_ATTIVAZIONE_MAX = euro(Math.max(...PIANI_SALA.map(p => p.attivazioneCents)) / 100)

/**
 * La nota prezzi della pagina di settore. Le commissioni restano fuori e vanno
 * dette: non le incassiamo noi, sono del circuito di pagamento del locale.
 */
export const SALA_NOTA_PREZZI =
  `Sistema di sala da ${SALA_DA} al mese: prenotazioni ${euro(pianoSala('prenotazioni').canoneCents / 100)}, ordini e pagamenti ${euro(pianoSala('ordini').canoneCents / 100)}, tutto insieme ${euro(pianoSala('completo').canoneCents / 100)}. ` +
  `Attivazione una tantum da ${SALA_ATTIVAZIONE_MIN} a ${SALA_ATTIVAZIONE_MAX}, ${GIORNI_PROVA} giorni di prova senza carta. ` +
  'Le commissioni sugli incassi sono quelle del tuo circuito di pagamento e non passano da noi. Sito e contenuti hanno il loro listino. Prezzi IVA esclusa.'

export const SALA_NOTA_PREZZI_EN =
  `Table system from €${(Math.min(...PIANI_SALA.map(p => p.canoneCents)) / 100).toFixed(0)} per month: bookings €${(pianoSala('prenotazioni').canoneCents / 100).toFixed(0)}, orders and payments €${(pianoSala('ordini').canoneCents / 100).toFixed(0)}, everything together €${(pianoSala('completo').canoneCents / 100).toFixed(0)}. ` +
  `One-off setup from €${(Math.min(...PIANI_SALA.map(p => p.attivazioneCents)) / 100).toFixed(0)} to €${(Math.max(...PIANI_SALA.map(p => p.attivazioneCents)) / 100).toFixed(0)}, ${GIORNI_PROVA} days free with no card. ` +
  'Payment fees belong to your own payment provider and never pass through us. Website and content are priced separately. Prices exclude VAT.'
