export type BusinessCategoryId =
  | 'auto'
  | 'social-media-agency'
  | 'ecommerce'
  | 'restaurant-hospitality'
  | 'local-retail'
  | 'beauty-wellness'
  | 'hospitality-tourism'
  | 'real-estate'
  | 'fitness-sports'
  | 'education-training'
  | 'healthcare'
  | 'professional-services'
  | 'b2b-technology'
  | 'home-services'
  | 'automotive'
  | 'nonprofit-community'
  | 'leisure-venue'
  | 'custom'

export type BusinessCategory = {
  id: Exclude<BusinessCategoryId, 'auto'>
  label: string
  description: string
  audience: string
  commercialJob: string
  skills: string[]
  productionRules: string[]
  complianceRules: string[]
}

const COMMON_SKILLS = ['swa-editorial-campaign', 'market-brand', 'market-social', 'market-copy', 'market-funnel', 'canvas-design', 'imagegen']

export const BUSINESS_CATEGORY_OPTIONS: Array<{ value: BusinessCategoryId; label: string; description: string }> = [
  { value: 'auto', label: 'Automatico', description: 'Riconosce la categoria dal settore del cliente' },
  { value: 'social-media-agency', label: 'Agenzia social e marketing', description: 'Servizi di strategia, gestione, contenuti e automazione' },
  { value: 'ecommerce', label: 'E-commerce e vendita online', description: 'Prodotti, catalogo, fiducia e acquisto' },
  { value: 'restaurant-hospitality', label: 'Ristorazione e hospitality', description: 'Piatti, servizio, luogo ed esperienza' },
  { value: 'local-retail', label: 'Retail e negozio locale', description: 'Prodotto, servizio, prossimita e visita in negozio' },
  { value: 'beauty-wellness', label: 'Beauty e wellness', description: 'Servizio, competenza, esperienza e prenotazione' },
  { value: 'hospitality-tourism', label: 'Hotel, turismo e viaggi', description: 'Luogo, ospitalita, esperienza e prenotazione' },
  { value: 'real-estate', label: 'Immobiliare', description: 'Immobili, zona, competenza e contatto qualificato' },
  { value: 'fitness-sports', label: 'Fitness e sport', description: 'Percorso, community, struttura e iscrizione' },
  { value: 'education-training', label: 'Formazione ed educazione', description: 'Metodo, competenza, prova e iscrizione' },
  { value: 'healthcare', label: 'Salute e professioni sanitarie', description: 'Informazione responsabile e contatto qualificato' },
  { value: 'professional-services', label: 'Servizi professionali', description: 'Competenza, prova, fiducia e richiesta' },
  { value: 'b2b-technology', label: 'B2B e tecnologia', description: 'Problema, soluzione, prova e valore aziendale' },
  { value: 'home-services', label: 'Casa, edilizia e servizi locali', description: 'Lavori, processo, affidabilita e preventivo' },
  { value: 'automotive', label: 'Automotive e mobilita', description: 'Veicolo, servizio, prova e contatto' },
  { value: 'nonprofit-community', label: 'No profit e community', description: 'Impatto, persone, trasparenza e partecipazione' },
  { value: 'leisure-venue', label: 'Intrattenimento e venue', description: 'Luogo, esperienza, community ed eventi reali' },
  { value: 'custom', label: 'Categoria personalizzata', description: 'Profilo costruito dal brief e dai dati del cliente' },
]

function category(
  id: Exclude<BusinessCategoryId, 'auto'>,
  label: string,
  description: string,
  audience: string,
  commercialJob: string,
  productionRules: string[],
  complianceRules: string[] = [],
  skills = COMMON_SKILLS,
): BusinessCategory {
  return { id, label, description, audience, commercialJob, skills, productionRules, complianceRules }
}

export const BUSINESS_CATEGORIES: Record<Exclude<BusinessCategoryId, 'auto'>, BusinessCategory> = {
  'social-media-agency': category('social-media-agency', 'Agenzia social e marketing', 'Vende competenza, metodo e gestione del ciclo editoriale.', 'Titolari e responsabili marketing che hanno bisogno di continuita, metodo e produzione.', 'Far riconoscere il problema, dimostrare il metodo e generare una richiesta qualificata.', ['Spiega strategia, produzione, approvazione, pubblicazione e ottimizzazione con esempi concreti.', 'Trasforma processi invisibili in prove osservabili: calendario, brief, revisioni e QA.', 'Traduci il gergo tecnico in tempo risparmiato, controllo e opportunita.'], [], [...COMMON_SKILLS, 'content-research-writer', 'market-seo', 'market-competitors']),
  ecommerce: category('ecommerce', 'E-commerce e vendita online', 'Vende prodotti attraverso desiderio, fiducia e percorso di acquisto.', 'Persone interessate al prodotto che cercano ispirazione, qualita e un acquisto semplice.', 'Far desiderare il prodotto, ridurre l incertezza e portare alla scheda o all acquisto.', ['Mostra prodotto reale, dettaglio, uso, confronto, prova e occasione d acquisto.', 'Alterna ispirazione, dimostrazione, obiezioni, novita e prova sociale.', 'Collega ogni CTA a una scheda o destinazione realmente disponibile.'], ['Non inventare prezzo, disponibilita, materiali, recensioni o caratteristiche.'], [...COMMON_SKILLS, 'market-seo']),
  'restaurant-hospitality': category('restaurant-hospitality', 'Ristorazione e hospitality', 'Vende piatto, luogo, servizio ed esperienza.', 'Persone locali o viaggiatori che cercano un esperienza da provare e condividere.', 'Far desiderare l esperienza e portare a prenotazione, visita o richiesta.', ['Racconta piatto, preparazione, sala, servizio, persone e momento.', 'Usa fotografia appetitosa ma credibile e non coprire il piatto con testo.', 'Indica menu, telefono, sito o messaggio solo se realmente disponibili.'], ['Non inventare ingredienti, allergeni, prezzi, disponibilita o recensioni.'], [...COMMON_SKILLS, 'content-research-writer']),
  'local-retail': category('local-retail', 'Retail e negozio locale', 'Porta persone in negozio attraverso prodotto, servizio e prossimita.', 'Clienti della zona che cercano un prodotto, un consiglio o un servizio affidabile.', 'Generare visita, messaggio, telefonata o richiesta di disponibilita.', ['Alterna prodotto, dimostrazione, persone, servizio, novita e vita del quartiere.', 'Rendi chiari luogo e disponibilita solo quando verificati.', 'Adatta il contenuto a orari e occasioni reali del negozio.']),
  'beauty-wellness': category('beauty-wellness', 'Beauty e wellness', 'Vende esperienza, competenza, risultato documentabile e fiducia.', 'Persone che cercano un professionista, un trattamento o un percorso di benessere.', 'Ridurre dubbi, mostrare competenza e portare a prenotazione o consulenza.', ['Mostra ambiente, gesti professionali, processo e risultato autorizzato.', 'Usa prima/dopo solo con consenso e senza promesse assolute.', 'Costruisci fiducia con educazione, metodo e prova reale.'], ['Non fare claim medici o promesse garantite; non usare immagini di clienti senza consenso.']),
  'hospitality-tourism': category('hospitality-tourism', 'Hotel, turismo e viaggi', 'Vende destinazione, ospitalita e motivo concreto per partire.', 'Viaggiatori che confrontano luoghi, esperienze, servizi e affidabilita.', 'Portare a richiesta, prenotazione o visita alla destinazione reale.', ['Mostra luogo, dettaglio, esperienza, servizio e contesto locale.', 'Distingui stagione, disponibilita e promessa verificata.', 'Usa storytelling sensoriale ma mantieni informazioni pratiche leggibili.'], ['Non inventare camere, servizi, prezzi, recensioni o disponibilita.'], [...COMMON_SKILLS, 'content-research-writer', 'market-seo']),
  'real-estate': category('real-estate', 'Immobiliare', 'Vende opportunita, immobile, zona e competenza.', 'Persone che cercano casa, investimento o consulenza immobiliare.', 'Generare contatto qualificato, visita o richiesta di valutazione.', ['Metti in evidenza immobile reale, zona, stato, vantaggi e prossima azione.', 'Separa fatti verificati da opinioni e stime.', 'Usa planimetrie e dettagli tecnici solo se aggiornati.'], ['Non inventare metrature, prezzi, rendite, classe energetica o disponibilita.'], [...COMMON_SKILLS, 'content-research-writer', 'market-seo']),
  'fitness-sports': category('fitness-sports', 'Fitness e sport', 'Vende percorso, struttura, community e progressione.', 'Persone che vogliono iniziare, migliorare o trovare una comunita sportiva.', 'Portare a prova, iscrizione, visita o contatto.', ['Mostra persone reali, esercizio, ambiente, istruttori e percorso.', 'Comunica benefici realistici e non risultati garantiti.', 'Alterna educazione, motivazione, prova sociale e invito.'], ['Non fare promesse mediche o trasformazioni garantite.']),
  'education-training': category('education-training', 'Formazione ed educazione', 'Vende metodo, competenza e trasformazione verificabile.', 'Studenti, professionisti o aziende che cercano una competenza concreta.', 'Far capire il metodo e portare a orientamento, iscrizione o richiesta informazioni.', ['Insegna qualcosa in ogni contenuto e mostra metodo, docente, programma o prova.', 'Distingui risultato atteso, requisito e testimonianza verificata.', 'Usa sequenze didattiche salvabili e CTA informative.'], ['Non garantire lavoro, certificazioni o risultati non documentati.'], [...COMMON_SKILLS, 'content-research-writer', 'market-seo']),
  healthcare: category('healthcare', 'Salute e professioni sanitarie', 'Informa con responsabilita e facilita un contatto qualificato.', 'Persone che cercano informazioni affidabili e un professionista.', 'Costruire fiducia e portare a contatto o prenotazione appropriata.', ['Priorita a educazione chiara, autorevolezza, prevenzione e percorso del paziente.', 'Usa linguaggio comprensibile e fonti verificabili.', 'Mantieni CTA informative e non allarmistiche.'], ['Niente diagnosi, cure personalizzate, promesse, paura o claim assoluti.'], [...COMMON_SKILLS, 'content-research-writer', 'market-seo']),
  'professional-services': category('professional-services', 'Servizi professionali', 'Trasforma competenza, metodo e prova in fiducia.', 'Imprenditori e persone che devono scegliere un professionista.', 'Generare richiesta qualificata attraverso problema, prova e metodo.', ['Spiega problema, processo, prova, obiezioni e prossimo passo.', 'Usa casi e risultati solo se forniti e verificabili.', 'Evita il tono autoreferenziale: parti dal rischio o obiettivo del cliente.'], ['Non inventare clienti, risultati, certificazioni o garanzie.'], [...COMMON_SKILLS, 'content-research-writer', 'market-seo', 'market-competitors']),
  'b2b-technology': category('b2b-technology', 'B2B e tecnologia', 'Vende soluzione, impatto operativo e fiducia tecnica.', 'Decision maker aziendali che valutano problema, rischio, integrazione e valore.', 'Portare a demo, audit, contatto o richiesta commerciale.', ['Parti dal problema operativo e mostra workflow, prova, integrazione e risultato atteso.', 'Traduce la tecnologia in tempo, costi, controllo e rischio.', 'Usa demo e diagrammi leggibili, mai promesse vaghe.'], ['Non inventare integrazioni, clienti, benchmark o percentuali.'], [...COMMON_SKILLS, 'content-research-writer', 'market-seo', 'market-competitors']),
  'home-services': category('home-services', 'Casa, edilizia e servizi locali', 'Vende affidabilita, processo, lavoro eseguito e preventivo.', 'Proprietari e aziende che cercano un fornitore affidabile nella propria zona.', 'Generare sopralluogo, preventivo, chiamata o richiesta.', ['Mostra prima, processo, dettaglio, risultato e persone al lavoro.', 'Rendi visibili tempi e fasi solo se reali.', 'Usa geolocalizzazione e contatto concreto quando disponibili.'], ['Non inventare prezzi, tempi, materiali, certificazioni o risultati.']),
  automotive: category('automotive', 'Automotive e mobilita', 'Vende veicolo, servizio, prova e assistenza.', 'Persone o aziende che valutano acquisto, manutenzione o mobilita.', 'Portare a prova, preventivo, contatto o visita.', ['Mostra veicolo reale, dettaglio, uso, assistenza e contesto.', 'Distingui caratteristiche di serie, optional, prezzo e disponibilita.', 'Usa CTA coerenti con la destinazione reale.'], ['Non inventare chilometraggio, prezzo, disponibilita, consumi o dotazioni.']),
  'nonprofit-community': category('nonprofit-community', 'No profit e community', 'Vende partecipazione, fiducia, impatto e trasparenza.', 'Persone che condividono una causa e possono partecipare, donare o diffondere.', 'Portare a partecipazione, donazione, volontariato o informazione.', ['Racconta persone, problema, azione, impatto e trasparenza.', 'Dai dignita ai soggetti e usa consenso per immagini e storie.', 'Mostra come contribuire con un passo semplice e verificabile.'], ['Non sfruttare paura, dolore o dati non verificati.'], [...COMMON_SKILLS, 'content-research-writer', 'market-seo']),
  'leisure-venue': category('leisure-venue', 'Intrattenimento e venue', 'Vende luogo, esperienza, community ed eventi.', 'Persone che cercano un esperienza e gestori che vogliono riempire e fidelizzare la venue.', 'Portare a visita, prenotazione, evento o richiesta del gestore.', ['Per una venue cliente parla all utente finale; per un caso studio parla al gestore e mostra il metodo.', 'Mostra ambiente, persone, servizio e momento con energia credibile.', 'Distingui sempre promozione della venue da vendita di servizi marketing.'], ['Non inventare eventi, prezzi, orari, disponibilita o risultati.']),
  custom: category('custom', 'Categoria personalizzata', 'Profilo costruito a partire da brand, settore, offerta e brief.', 'Da definire nel brief del cliente.', 'Da definire senza inventare informazioni mancanti.', ['Richiedi o segnala pubblico, offerta, prova, destinazione, vincoli e tono prima di finalizzare.', 'Se mancano dati essenziali, usa missing_inputs e mantieni il contenuto in revisione.'], ['Non colmare i dati mancanti con assunzioni non dichiarate.']),
}

function normalize(value: unknown): string {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function resolveBusinessCategory(requested: unknown, context: { sector?: unknown; brandName?: unknown; clientName?: unknown } = {}): BusinessCategory {
  if (typeof requested === 'string' && requested !== 'auto' && requested in BUSINESS_CATEGORIES) {
    return BUSINESS_CATEGORIES[requested as Exclude<BusinessCategoryId, 'auto'>]
  }
  const text = normalize([context.sector, context.brandName, context.clientName].join(' '))
  if (/swa|social|marketing|agenzia|automation/.test(text)) return BUSINESS_CATEGORIES['social-media-agency']
  if (/silkincom|abbigliamento|accessori|moda|fashion|ecommerce|e-commerce|negozio online/.test(text)) return BUSINESS_CATEGORIES.ecommerce
  if (/ristorante|ristorazione|pizzeria|cucina|piatti|food|hotel|albergo|turismo|viaggi/.test(text)) return BUSINESS_CATEGORIES['restaurant-hospitality']
  if (/bowling|pista|strike|spare|intrattenimento|venue|sala giochi/.test(text)) return BUSINESS_CATEGORIES['leisure-venue']
  if (/immobiliare|immobili|agenzia immobiliare/.test(text)) return BUSINESS_CATEGORIES['real-estate']
  if (/palestra|fitness|sport|yoga|pilates/.test(text)) return BUSINESS_CATEGORIES['fitness-sports']
  if (/salute|sanitario|medico|clinica|fisioterapia|dentista/.test(text)) return BUSINESS_CATEGORIES.healthcare
  if (/beauty|estetica|parrucchier|benessere|spa/.test(text)) return BUSINESS_CATEGORIES['beauty-wellness']
  if (/software|saas|tecnologia|tech|informatica|b2b/.test(text)) return BUSINESS_CATEGORIES['b2b-technology']
  if (/formazione|scuola|corso|educazione|universita/.test(text)) return BUSINESS_CATEGORIES['education-training']
  if (/auto|automotive|concessionaria|officina|mobilita/.test(text)) return BUSINESS_CATEGORIES.automotive
  return BUSINESS_CATEGORIES['professional-services']
}

export function buildBusinessCategoryContext(categoryValue: BusinessCategory): string {
  return `
CATEGORIA LAVORATIVA E MOTORE DI REALIZZAZIONE — ${categoryValue.label.toUpperCase()} (VINCOLANTE):
- Descrizione: ${categoryValue.description}
- Pubblico: ${categoryValue.audience}
- Lavoro commerciale: ${categoryValue.commercialJob}
- Skill attive: ${categoryValue.skills.join(', ')}
- Regole di produzione: ${categoryValue.productionRules.join(' ')}
- Vincoli: ${categoryValue.complianceRules.join(' ')}
- Il nome e i dati del brand cliente personalizzano il risultato, ma non cambiano questa categoria senza una scelta esplicita. Se mancano dati, compilare missing_inputs invece di inventare.`
}
