export type StrategyProfileId =
  | 'auto'
  | 'swa-services'
  | 'silkincom-ecommerce'
  | 'restaurant'
  | 'bowling-case-study'

export type StrategyProfile = {
  id: Exclude<StrategyProfileId, 'auto'>
  label: string
  shortLabel: string
  description: string
  audience: string
  commercialJob: string
  contentRules: string[]
  visualRules: string[]
  ctaRules: string[]
  forbidden: string[]
}

export const STRATEGY_PROFILE_OPTIONS: Array<{
  value: StrategyProfileId
  label: string
  description: string
}> = [
  { value: 'auto', label: 'Automatico', description: 'Sceglie il profilo dal settore e dal brand del cliente' },
  { value: 'swa-services', label: 'SWA · servizi social', description: 'Fa capire metodo, servizi e valore di Social Web Automation' },
  { value: 'silkincom-ecommerce', label: 'SilkInCom · moda e-commerce', description: 'Presenta capi e accessori e accompagna all acquisto' },
  { value: 'restaurant', label: 'Ristorante · piatti ed esperienza', description: 'Racconta piatti, atmosfera, prova sociale e prenotazione' },
  { value: 'bowling-case-study', label: 'Caso Studio Bowling', description: 'Usa il bowling come prova concreta dei servizi SWA' },
]

export const STRATEGY_PROFILES: Record<Exclude<StrategyProfileId, 'auto'>, StrategyProfile> = {
  'swa-services': {
    id: 'swa-services',
    label: 'SWA · servizi social',
    shortLabel: 'SWA servizi',
    description: 'Posizionamento di Social Web Automation come partner che progetta, produce e coordina contenuti social.',
    audience: 'Titolari, marketing manager e responsabili di PMI che pubblicano senza metodo o non hanno tempo per gestire il ciclo social.',
    commercialJob: 'Far riconoscere il problema, dimostrare il metodo SWA e portare a una richiesta di analisi o consulenza.',
    contentRules: [
      'Spiega con esempi semplici cosa fa SWA: strategia, produzione, approvazione, pubblicazione e ottimizzazione.',
      'Trasforma processi invisibili in prove osservabili: calendario, brief, revisioni, QA e risultati da verificare.',
      'Usa il linguaggio del titolare e collega ogni contenuto a un costo reale del disordine: tempo, continuita, opportunita perse.',
    ],
    visualRules: [
      'Mantieni il sistema visivo SWA: verde foresta, nero inchiostro, crema, oro e corallo.',
      'Mostra dashboard, mani al lavoro, calendario editoriale, persone e dettagli di processo con look premium e credibile.',
      'Il logo SWA e un segnale di marca discreto; non trasformare ogni visual in una pubblicita piena di testo.',
    ],
    ctaRules: [
      'Preferisci: chiedi una diagnosi, guarda il metodo, scrivi a SWA, prenota un confronto.',
      'Ogni CTA deve indicare una sola azione e la destinazione reale, senza promesse automatiche di risultati.',
    ],
    forbidden: [
      'Non parlare come un negozio che vende prodotti fisici.',
      'Non inventare clienti, risultati, prezzi, recensioni o percentuali di crescita.',
      'Non usare gergo tecnico senza tradurlo in un beneficio operativo.',
    ],
  },
  'silkincom-ecommerce': {
    id: 'silkincom-ecommerce',
    label: 'SilkInCom · moda e-commerce',
    shortLabel: 'SilkInCom e-commerce',
    description: 'Vendita di abbigliamento e accessori attraverso prodotto, stile, vestibilita e fiducia nell acquisto online.',
    audience: 'Persone interessate a moda e accessori che cercano ispirazione, qualita, abbinamenti e un acquisto semplice.',
    commercialJob: 'Far desiderare il prodotto, ridurre l incertezza e portare alla pagina prodotto o all acquisto.',
    contentRules: [
      'Metti il prodotto reale al centro: dettaglio, fit, materiale, abbinamento e occasione d uso.',
      'Alterna ispirazione, prova prodotto, guida taglie o styling, novita e contenuti di fiducia.',
      'Usa caption e CTA da e-commerce: scopri il capo, guarda i dettagli, scegli il tuo stile, visita la scheda.',
    ],
    visualRules: [
      'Look editoriale fashion: luce pulita, texture leggibili, composizioni curate e spazio per il prodotto.',
      'Rispetta colori, logo e fotografia originali del brand; niente ambientazioni generiche che cambiano identita.',
      'Il visual deve far capire il capo anche senza leggere la caption.',
    ],
    ctaRules: [
      'Collega la CTA alla scheda prodotto reale e usa UTM coerenti quando il link e disponibile.',
      'Non usare CTA da consulenza, audit o gestione social.',
    ],
    forbidden: [
      'Non raccontare SilkInCom come un agenzia di social automation.',
      'Non inventare prezzo, disponibilita, materiali certificati o caratteristiche non fornite.',
      'Non coprire il prodotto con blocchi di testo invasivi.',
    ],
  },
  restaurant: {
    id: 'restaurant',
    label: 'Ristorante · piatti ed esperienza',
    shortLabel: 'Ristorante',
    description: 'Comunicazione locale per far venire voglia di provare il ristorante e trasformare attenzione in prenotazione.',
    audience: 'Persone della zona e visitatori che cercano un esperienza gastronomica, un piatto, una serata o un luogo da condividere.',
    commercialJob: 'Far desiderare il piatto e l atmosfera, costruire fiducia e portare a prenotazione, visita o richiesta informazioni.',
    contentRules: [
      'Racconta ingredienti, preparazione, piatto finito, sala, persone e momento del servizio.',
      'Alterna desiderio, prova sociale, backstage, menu, occasioni e informazioni utili per la visita.',
      'Usa geolocalizzazione e informazioni reali solo quando sono state fornite dal cliente.',
    ],
    visualRules: [
      'Fotografia appetitosa ma credibile: texture del piatto, luce calda motivata, mani e servizio quando utili.',
      'Mantieni colori e atmosfera del locale; evita foto stock o piatti non realmente presenti nel menu.',
      'Il piatto resta leggibile e il testo non deve coprire la parte appetitosa dell immagine.',
    ],
    ctaRules: [
      'Preferisci: prenota, guarda il menu, scrivici, scopri il piatto, vieni a trovarci.',
      'Indica una destinazione concreta: telefono, sito, messaggio o pagina menu realmente disponibile.',
    ],
    forbidden: [
      'Non inventare ingredienti, allergeni, disponibilita, prezzi o recensioni.',
      'Non usare il tono di un e-commerce o di un agenzia B2B.',
      'Non promettere qualita assolute non verificabili.',
    ],
  },
  'bowling-case-study': {
    id: 'bowling-case-study',
    label: 'Caso Studio Bowling',
    shortLabel: 'Caso Studio Bowling',
    description: 'Caso dimostrativo SWA: il bowling e la nicchia osservata, il servizio venduto e la regia social di SWA.',
    audience: 'Titolari e gestori di bowling che vogliono trasformare piste, serate e community in un sistema di contenuti social.',
    commercialJob: 'Far riconoscere al gestore il problema editoriale, mostrare come SWA lo risolve e generare una richiesta di confronto.',
    contentRules: [
      'Parla al gestore del bowling, non al giocatore che cerca una partita: il destinatario compra un servizio.',
      'Usa la pista come caso studio concreto per spiegare format, calendario, produzione, approvazione e distribuzione.',
      'Alterna diagnosi del problema, dietro le quinte del metodo, esempi prima/dopo e invito al confronto.',
      'Ogni Reel deve avere un hook rivolto al gestore e una prova visiva del processo, non solo immagini belle della pista.',
    ],
    visualRules: [
      'Bowling premium e realistico: piste, gestori, team, smartphone, laptop e momenti di lavoro osservabili.',
      'Applica la palette SWA con accenti ispirati al bowling, senza trasformare il profilo in un volantino per consumatori.',
      'Testo breve in safe area, logo SWA discreto, nessun finto sticker o interazione che Blotato non supporta.',
    ],
    ctaRules: [
      'Preferisci: guarda il caso studio, chiedi la struttura, scrivi a SWA, analizziamo il tuo bowling.',
      'La CTA deve parlare al titolare e portare a DM, sito o confronto reale, non a una prenotazione bowling inventata.',
    ],
    forbidden: [
      'Non vendere direttamente partite, pizze, tornei o promozioni del bowling se non fanno parte dell offerta reale.',
      'Non confondere il brand cliente SWA con un bowling cliente: il bowling e la dimostrazione, non il prodotto venduto.',
      'Non inventare metriche del caso studio, clienti, risultati o testimonianze.',
    ],
  },
}

function normalized(value: unknown): string {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function resolveStrategyProfile(
  requested: unknown,
  context: { sector?: unknown; brandName?: unknown; clientName?: unknown } = {},
): StrategyProfile {
  if (typeof requested === 'string' && requested !== 'auto' && requested in STRATEGY_PROFILES) {
    return STRATEGY_PROFILES[requested as Exclude<StrategyProfileId, 'auto'>]
  }
  const text = normalized([context.sector, context.brandName, context.clientName].join(' '))
  if (/bowling|pista|strike|spare/.test(text)) return STRATEGY_PROFILES['bowling-case-study']
  if (/silkincom|abbigliamento|accessori|moda|fashion|ecommerce|e-commerce/.test(text)) return STRATEGY_PROFILES['silkincom-ecommerce']
  if (/ristorante|ristorazione|pizzeria|cucina|piatti|food/.test(text)) return STRATEGY_PROFILES.restaurant
  return STRATEGY_PROFILES['swa-services']
}

export function buildStrategyProfileContext(profile: StrategyProfile): string {
  return `
PROFILO DI REALIZZAZIONE STRATEGICA — ${profile.label.toUpperCase()} (VINCOLANTE):
- Descrizione: ${profile.description}
- Pubblico: ${profile.audience}
- Lavoro commerciale del piano: ${profile.commercialJob}
- Regole contenuto: ${profile.contentRules.join(' ')}
- Regole visual: ${profile.visualRules.join(' ')}
- Regole CTA: ${profile.ctaRules.join(' ')}
- Vietato: ${profile.forbidden.join(' ')}
- Controllo finale: ogni hook, caption, visual, CTA e brief deve essere coerente con questo profilo. Se un dato non e disponibile, segnalarlo in missing_inputs invece di inventarlo.`
}
