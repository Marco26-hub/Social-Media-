import { ODINO_NOME } from '@/lib/odino/identita'

function rispostaNonVerificataIt(domanda: string): string {
  const testo = domanda.toLocaleLowerCase('it')
  const citazione = `«${domanda}»`

  if (/\b(prezzo|prezzi|costa|costo|quanto|preventivo|tariffa|tariffe|sconto|sconti)\b/.test(testo)) {
    return `Non trovo un prezzo pubblico verificato per ${citazione}, quindi non te ne invento uno. Posso rispondere sui prezzi presenti nel listino; per questo caso puoi passare la domanda a una persona con il pulsante qui sotto.`
  }
  if (/\b(fate|vendete|offrite|realizzate|stampate|producete|avete|servizio|prodotto)\b/.test(testo)) {
    return `Nel catalogo pubblico non trovo ${citazione}. Questo non significa automaticamente che sia impossibile: significa che non posso confermare che lo offriamo. Passo volentieri la richiesta a una persona, già completa della tua domanda.`
  }
  if (/\b(contratto|legge|legale|gdpr|privacy|garanzia|rimborso|disdetta|dati)\b/.test(testo)) {
    return `Su ${citazione} non ho una risposta verificata abbastanza precisa. Trattandosi di condizioni o aspetti delicati, preferisco non darti una risposta plausibile ma sbagliata: puoi inoltrare la domanda a una persona qui sotto.`
  }
  return `Non ho ancora una risposta verificata per ${citazione}, ma non ti lascio senza una strada. Prova a riformulare indicando servizio, obiettivo o settore; altrimenti inoltra la domanda a una persona con il pulsante qui sotto.`
}

function rispostaNonVerificataEn(question: string): string {
  const text = question.toLocaleLowerCase('en')
  const quote = `“${question}”`

  if (/\b(price|prices|cost|quote|fee|fees|discount|how much)\b/.test(text)) {
    return `I cannot find a verified public price for ${quote}, so I will not make one up. I can answer about prices in the published list; for this case, send the question to a person with the button below.`
  }
  if (/\b(do you|sell|offer|provide|make|print|service|product)\b/.test(text)) {
    return `I cannot find ${quote} in the public catalogue. That does not automatically mean it is impossible; it means I cannot confirm that we offer it. You can pass the complete question to a person below.`
  }
  if (/\b(contract|law|legal|gdpr|privacy|guarantee|refund|cancel|data)\b/.test(text)) {
    return `I do not have a sufficiently precise verified answer about ${quote}. Because this concerns terms or a sensitive matter, I would rather not give you a plausible but wrong answer. You can send it to a person below.`
  }
  return `I do not yet have a verified answer for ${quote}, but I will not leave you at a dead end. Try mentioning the service, goal or business sector, or send the question to a person with the button below.`
}

// Le parole dell'interfaccia di ODINO, nelle due lingue.
//
// Stavano dentro il componente, in italiano, perche' ODINO viveva solo sulle
// pagine italiane. Le ventotto pagine inglesi avevano un sito che spiega tutto
// e nessuno a cui chiedere: chi arrivava da fuori leggeva e se ne andava.

export type Lingua = 'it' | 'en'

export const TESTI = {
  it: {
    apri: `Chiedi a ${ODINO_NOME}, l’assistente del sito`,
    apriBreve: `Chiedi a ${ODINO_NOME}`,
    pannello: `${ODINO_NOME}, assistente di Social Web Automation`,
    presentazione: 'L’assistente di Social Web Automation. Sono un sistema automatico, non una persona.',
    chiudi: 'Chiudi',
    titoloVuoto: 'Che cosa ti serve sapere?',
    introVuoto:
      'Scrivi la tua domanda come la diresti a voce — «quanto costa la gestione social», «ho un centro estetico e perdo chiamate», «posso disdire quando voglio». Rispondo con quello che è scritto sul sito: prezzi di listino, che cosa è compreso e che cosa resta fuori.',
    introVuoto2: 'Se preferisci, parti da una di queste.',
    titoloNonSo: 'Questa non la so.',
    nonSo: rispostaNonVerificataIt,
    scriviAUnaPersona: 'Scrivi a una persona',
    frequenti: 'Domande frequenti',
    daQui: 'Da qui',
    suggerite: 'Forse cerchi questo',
    settoreEtichetta: (nome: string) => `Per ${nome.toLowerCase()} c’è una pagina dedicata`,
    settoreLink: (nome: string) => `Apri la pagina ${nome}`,
    campoEtichetta: 'Scrivi la tua domanda',
    campoPlaceholder: 'Oppure scrivi: «ho un centro estetico»',
    invia: 'Chiedi',
    nota:
      'Sono un assistente automatico, non una persona. Le cifre che ti mostro sono quelle del listino pubblico: non le invento e non le tratto. Per un preventivo serve una persona.',
    dalSito: 'Dalle pagine del sito',
    /** Il messaggio con cui la domanda arriva a una persona, gia' scritto. */
    whatsapp: (domanda: string) =>
      `Ciao! Ho chiesto a ODINO sul sito: «${domanda}» e non ha trovato la risposta. Me la potete dare voi?`,
    iniziali: ['da-dove-parto', 'quanto-costa-social', 'telefono-come-funziona', 'cosa-resta-fuori', 'garantite-risultati', 'parlare-con-persona'],
    settoriBase: '/settori',
  },
  en: {
    apri: `Ask ${ODINO_NOME}, the site assistant`,
    apriBreve: `Ask ${ODINO_NOME}`,
    pannello: `${ODINO_NOME}, the Social Web Automation assistant`,
    presentazione: 'The Social Web Automation assistant. I am an automated system, not a person.',
    chiudi: 'Close',
    titoloVuoto: 'What do you need to know?',
    introVuoto:
      'Write your question the way you would say it — “what does managed social media cost”, “I run a beauty salon and I miss calls”, “can we cancel any time”. I answer with what is written on this site: list prices, what is included and what stays outside.',
    introVuoto2: 'Or start from one of these.',
    titoloNonSo: 'That one I do not know.',
    nonSo: rispostaNonVerificataEn,
    scriviAUnaPersona: 'Write to a person',
    frequenti: 'Common questions',
    daQui: 'From here',
    suggerite: 'You may be looking for',
    settoreEtichetta: (nome: string) => `${nome} have a page of their own`,
    settoreLink: (nome: string) => `Open the ${nome} page`,
    campoEtichetta: 'Write your question',
    campoPlaceholder: 'Or write: “I run a restaurant”',
    invia: 'Ask',
    nota:
      'I am an automated system, not a person. The figures I show are the published list prices: I do not invent them and I do not negotiate them. A quote needs a person.',
    dalSito: 'From the site’s pages',
    whatsapp: (domanda: string) =>
      `Hello! I asked ODINO on your website: “${domanda}” and it could not find the answer. Could you help?`,
    iniziali: ['da-dove-parto', 'quanto-costa-social', 'telefono-come-funziona', 'cosa-resta-fuori', 'garantite-risultati', 'parlare-con-persona'],
    settoriBase: '/en/settori',
  },
} as const

export const WHATSAPP_ODINO = '393477196603'
