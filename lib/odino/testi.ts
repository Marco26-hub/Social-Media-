import { ODINO_NOME } from '@/lib/odino/identita'

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
    nonSo: (domanda: string) =>
      `Rispondo solo con quello che è scritto sul sito, e su «${domanda}» non ho niente di verificato. Preferisco dirtelo che inventare una risposta. Prova a chiedere in un altro modo, oppure scrivi a una persona.`,
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
    nonSo: (domanda: string) =>
      `I only answer with what is written on this site, and on “${domanda}” I have nothing verified. I would rather tell you than invent an answer. Try asking it another way, or write to a person.`,
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
