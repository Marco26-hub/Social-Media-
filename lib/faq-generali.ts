// Le domande frequenti generali, quelle della pagina /faq.
//
// Erano dentro il componente di pagina e nessun altro poteva leggerle. Ora
// stanno qui: la pagina le rende, ODINO le cerca, e restano una sola copia.

export type FaqGenerale = { q: string; a: string }

export const FAQ_GENERALI: FaqGenerale[] = [
  { q: `Social Web Automation è un software o un servizio?`, a: `È un servizio gestito. Il portale rende semplici approvazioni e risultati, ma strategia, produzione e pubblicazione vengono svolte dal team Social Web Automation.` },
  { q: `Posso approvare i contenuti prima della pubblicazione?`, a: `Sì. Il processo prevede controllo e approvazione prima della pubblicazione, con il numero di revisioni indicato nel pacchetto.` },
  { q: `Quali aziende seguite?`, a: `Lavoriamo soprattutto con PMI, attività locali e professionisti che vogliono coordinare social, contenuti, sito e visibilità organica.` },
  { q: `Quanto costa la gestione social?`, a: `Presenza costa 490 € al mese: 16 contenuti per ciascuno dei 2 social, cioè 32 pubblicazioni. Crescita costa 990 € al mese: 24 contenuti per ciascuno dei 2 social, cioè 48 pubblicazioni, con un articolo SEO + GEO e analisi competitor. IVA esclusa.` },
  { q: `I piani includono le campagne a pagamento?`, a: `No. Presenza e Crescita sono piani di sola crescita organica. Le campagne ADS rientrano nella configurazione personalizzata: la gestione viene concordata e il budget versato alle piattaforme resta separato dal canone.` },
  { q: `Esiste una soluzione personalizzata?`, a: `Sì. Più brand, volumi elevati, automazioni, e-commerce, produzione video e integrazioni vengono configurati dopo un’analisi iniziale.` },
  { q: `SEO e GEO garantiscono il posizionamento?`, a: `No. Miglioriamo struttura, qualità, reperibilità e citabilità, ma nessuno può garantire posizioni o citazioni da parte di Google o dei sistemi AI.` },
  { q: `Usate intelligenza artificiale?`, a: `Sì, come supporto ad analisi e produzione. Direzione, verifica e responsabilità editoriale restano umane.` },
  { q: `Realizzate anche siti ed e-commerce?`, a: `Sì. Il canone a partire da 19,90 € al mese riguarda una landing page semplice o un sito web base. E-commerce, cataloghi e funzioni avanzate vengono valutati e quotati a parte.` },
  { q: `Chi eroga la consulenza legale?`, a: `Le consulenze legali vengono svolte dall’Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS, professionista abilitato.` },
  { q: `La consulenza è inclusa nei pacchetti social?`, a: `No. La consulenza legale è separata dai servizi di marketing e viene prenotata in base al caso concreto.` },
]
