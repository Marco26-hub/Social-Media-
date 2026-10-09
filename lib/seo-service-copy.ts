import { PREZZI } from '@/lib/prezzi-ingresso'
import { PACCHETTI } from '@/lib/pacchetti'

// Testi condivisi da pagina servizio e FAQ generale.
// La rubrica resta un metodo editoriale SWA, non una metrica dei motori.
export const SEO_SERVICE_COPY = {
  it: {
    difference: 'SEO e GEO condividono la stessa base: pagine accessibili, contenuti utili, fonti e identità verificabili. SEO descrive la visibilità nella ricerca; GEO e AEO l’uso delle informazioni nelle risposte AI e nelle risposte dirette. Cambiano le superfici osservate, non esiste un codice speciale che garantisca una citazione.',
    rubric: 'Usiamo una rubrica editoriale interna SWA: qualità della risposta 30%, autonomia del passaggio 25%, struttura 20%, dati verificabili 15%, unicità 10%. I pesi servono a ordinare le revisioni e motivare le correzioni. Non è un punteggio di Google o di altri motori, né una misura della probabilità di essere citati.',
    readability: 'Verifichiamo accessibilità delle pagine pubbliche, blocchi di scansione e indicizzazione, testo disponibile, collegamenti, fonti e coerenza dei dati strutturati. I contenuti privati restano protetti. Un file llms.txt è facoltativo: Google non lo usa per le sue funzioni AI e non sostituisce l’indicizzazione. Non serve frammentare artificialmente il testo o rispondere sempre nella prima frase; conta che la risposta sia chiara e utile.',
    example: `Esempio editoriale sul nostro listino, non un caso cliente: «Gestione social completa» non chiarisce costo o volume. «Presenza: 2 social, 16 contenuti mensili per canale, fino a 32 pubblicazioni, ${PREZZI.presenza}, IVA esclusa e setup incluso» rende verificabili perimetro, quantità e condizioni. La fonte è la pagina Pacchetti. È una revisione di chiarezza, non la prova di un miglioramento del ranking o delle citazioni AI.`,
  },
  en: {
    difference: 'SEO and GEO share the same foundation: accessible pages, useful content, sources and verifiable identities. SEO describes search visibility; GEO and AEO describe the use of information in AI-generated and direct answers. The surfaces we observe differ; no special code guarantees a citation.',
    rubric: 'We use an internal SWA editorial rubric: answer quality 30%, standalone passage 25%, structure 20%, verifiable data 15%, uniqueness 10%. The weights help prioritise revisions and explain corrections. This is not a Google or search-engine score, nor a measure of the probability of being cited.',
    readability: 'We check public-page accessibility, crawling and indexing blocks, available text, links, sources and the consistency of structured data. Private content stays protected. An llms.txt file is optional: Google does not use it for its AI features and it cannot replace indexing. There is no need to artificially fragment text or always answer in the first sentence; a clear, useful answer matters.',
    example: `An editorial example from our own price list, not a client case: “Complete social management” does not explain cost or volume. “Presence: 2 social channels, 16 monthly content pieces per channel, up to 32 publications, ${PACCHETTI[0].prezzo} per month excluding VAT, setup included” makes scope, quantity and terms verifiable. The source is the Pricing page. This is a clarity revision, not evidence of improved rankings or AI citations.`,
  },
} as const
