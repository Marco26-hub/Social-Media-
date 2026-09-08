// FONTE UNICA dei dati Trustpilot, usata dal widget e dallo schema JSON-LD.
//
// Il profilo pubblico esiste gia' sul dominio (Trustpilot lo crea da solo alla
// prima recensione o alla prima visita), ma finche' non viene rivendicato dalla
// dashboard Business resta «Unclaimed» e con il paese sbagliato. La
// rivendicazione e' un passaggio manuale: qui si registra solo cio' che il
// codice deve sapere.

// Dominio verificato sul profilo Trustpilot. Deve combaciare con SITE_URL senza
// «www»: e' la chiave con cui Trustpilot indirizza il profilo.
export const TRUSTPILOT_DOMINIO = 'socialautomation.app'

// Pagina pubblica del profilo. Serve sia come fallback del widget (chi ha gli
// script bloccati vede comunque un link vero) sia come `sameAs` nello schema.
export const TRUSTPILOT_PROFILO_URL = `https://www.trustpilot.com/review/${TRUSTPILOT_DOMINIO}`

// Identificativi presi da Trustpilot Business > Integrations > TrustBox: lo
// snippet mostra `data-businessunit-id` e `data-template-id`. Restano in
// ambiente e non nel codice perche' cambiano con il template scelto e perche'
// un valore inventato monterebbe il widget di qualcun altro.
export const TRUSTPILOT_BUSINESS_UNIT_ID =
  process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID?.trim() || ''
export const TRUSTPILOT_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_TRUSTPILOT_TEMPLATE_ID?.trim() || ''

// Il widget si monta solo con entrambi gli identificativi. Senza, non si
// stampa un contenitore vuoto: una fascia «recensioni» che non carica niente
// vale meno di nessuna fascia.
export const TRUSTPILOT_ATTIVO = Boolean(TRUSTPILOT_BUSINESS_UNIT_ID && TRUSTPILOT_TEMPLATE_ID)
