import { euro } from '@/lib/euro'
// Pacchetti di produzione video verticale.
//
// Sono a lotto: una sessione produce cinque video, non uno. E' la ragione per
// cui il prezzo per video sta molto sotto quello di un video promozionale su
// misura, che sul mercato italiano parte da 800 euro. Il confronto giusto non
// e' con quello, ma con l'ora di lavoro che l'azienda non spende.
//
// Come funziona: il cliente paga il canone del mese, si gira, e i video escono
// distribuiti sulle settimane invece di arrivare tutti insieme. Il mese dopo
// paga di nuovo e si gira di nuovo. E' un canone, non un acquisto singolo:
// il fornitore li quota al mese, e venderli una tantum pagandoli al mese
// farebbe sparire il margine dal secondo mese in poi.
//
// La distribuzione nel mese non e' un dettaglio amministrativo: e' cio' che
// tiene il profilo vivo ogni settimana invece di riempirlo una volta sola, ed
// e' il motivo per cui si incastra con il piano editoriale social.
//
// I prezzi sono al pubblico, IVA esclusa, e comprendono lo spostamento
// nell'area concordata. Pedaggi, parcheggi e trasferte straordinarie restano
// fuori: vanno detti prima, come per ogni altro servizio.

export type PacchettoVideo = {
  id: string
  nome: string
  /** Video consegnati ogni mese. */
  video: number
  /** Sessioni di ripresa previste nel mese. */
  sessioni: number
  /** Canone mensile al pubblico, in euro. */
  prezzo: number
  perChi: string
}

export const VIDEO_PACCHETTI: readonly PacchettoVideo[] = [
  { id: 'start', nome: 'Start', video: 5, sessioni: 1, prezzo: 590, perChi: 'Chi prova il formato per la prima volta' },
  { id: 'silver', nome: 'Silver', video: 10, sessioni: 2, prezzo: 1090, perChi: 'Chi pubblica con continuità su un canale' },
  { id: 'gold', nome: 'Gold', video: 15, sessioni: 3, prezzo: 1490, perChi: 'Chi copre due canali senza rimanere scoperto' },
  { id: 'platinum', nome: 'Platinum', video: 20, sessioni: 4, prezzo: 1790, perChi: 'Chi tiene il ritmo tutto l’anno' },
] as const

/** Che cosa comprende ogni video, uguale in tutti i pacchetti. */
export const VIDEO_COMPRESO: readonly string[] = [
  'Ideazione del contenuto',
  'Scrittura dello script',
  'Scaletta di registrazione',
  'Riprese in azienda',
  'Presenza in video, se serve',
  'Montaggio e post-produzione',
  'Sottotitoli e grafiche',
  'Spostamento nell’area concordata',
] as const

/** Come vengono consegnati: e' la domanda che arriva subito dopo il prezzo. */
export const VIDEO_CONSEGNA =
  'I video non arrivano tutti insieme: si gira nella sessione del mese e le uscite vengono distribuite sulle settimane, così il profilo resta vivo invece di riempirsi una volta sola. Il mese successivo si rinnova, si gira di nuovo e il ciclo riparte.'

export const VIDEO_ESCLUSO =
  'Pedaggi, parcheggi e trasferte fuori dall’area concordata sono esclusi e vengono conteggiati a parte, indicati nella proposta prima dell’avvio.'

/** Prezzo d'ingresso, per il listino e le pagine che lo citano. */
export const VIDEO_DA = `da ${VIDEO_PACCHETTI[0].prezzo} € al mese`

export function euroVideo(p: PacchettoVideo): string {
  return euro(p.prezzo)
}
