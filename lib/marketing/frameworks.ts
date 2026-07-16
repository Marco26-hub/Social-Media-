// ─────────────────────────────────────────────────────────────────────────
// FRAMEWORK DI MARKETING FUNNEL — skill "market-emails" + "market-funnel" +
// "market-landing". Cataloghi e rubriche REALI (cadenze, formule oggetto,
// tattiche per stage, checklist CRO pesata) usati per costruire prompt AI
// grounded invece di generare email/piani a caso.
// ─────────────────────────────────────────────────────────────────────────

export type EmailSequenceType = 'welcome' | 'nurture' | 'cart_abandonment' | 'onboarding' | 're_engagement' | 'launch' | 'cold_outreach'

export const EMAIL_SEQUENCE_CATALOG: Record<EmailSequenceType, { label: string; emails: string; goal: string; cadence: string }> = {
  welcome: { label: 'Welcome', emails: '5-7', goal: 'Costruire fiducia, consegnare valore, introdurre il prodotto', cadence: 'Giorno 0 (immediato), 1, 3, 5, 7, [10], [14]' },
  nurture: { label: 'Nurture', emails: '6-8', goal: 'Educare, costruire autorevolezza, superare obiezioni per lead tiepidi', cadence: 'Giorno 1, 3, 6, poi ogni 3-4 giorni' },
  cart_abandonment: { label: 'Cart Abandonment', emails: '3-4', goal: 'Recuperare vendite perse da carrello abbandonato', cadence: '1 ora, 24 ore, 72 ore, [7 giorni]' },
  onboarding: { label: 'Onboarding', emails: '5-7', goal: 'Attivazione nuovo cliente, ridurre abbandono, mostrare valore', cadence: 'Giorno 0, 1, 3, 5, 7, [10]' },
  re_engagement: { label: 'Re-engagement', emails: '3-4', goal: 'Riattivare iscritti inattivi (30-90 giorni) o pulire la lista', cadence: 'Giorno 1, 5, [10]' },
  launch: { label: 'Launch', emails: '4-6', goal: 'Lancio prodotto/collezione con urgenza crescente', cadence: 'Annuncio, teaser, apertura, reminder, chiusura' },
  cold_outreach: { label: 'Cold Outreach', emails: '3-5', goal: 'Primo contatto B2B con valore specifico, non pitch generico', cadence: 'Giorno 1, 4, 8, [14], [21]' },
}

// Struttura email-per-email (skill 3.1/3.2/3.3), i due tipi più rilevanti per un
// e-commerce fashion (il verticale di questo prodotto): welcome + cart_abandonment.
export const SEQUENCE_BLUEPRINTS: Partial<Record<EmailSequenceType, string[]>> = {
  welcome: [
    'Email 1 (immediato) — CONSEGNA+INTRODUZIONE: consegna ciò che è stato promesso (sconto benvenuto/lookbook), imposta aspettative sulle prossime email.',
    'Email 2 (giorno 1) — STORIA+VALORE: storia del brand/founder, connessione con il problema/desiderio del lettore.',
    'Email 3 (giorno 3) — EDUCA+AUTOREVOLEZZA: contenuto utile (guida styling, come abbinare) che dimostra competenza senza vendere.',
    'Email 4 (giorno 5) — SOCIAL PROOF+SOFT PITCH: caso cliente/recensione con dettagli specifici, transizione naturale al prodotto.',
    'Email 5 (giorno 7) — PITCH DIRETTO+OBIEZIONI: offerta diretta, risposta alle 3 obiezioni principali, risk reversal (reso gratuito/garanzia).',
    'Email 6 (giorno 10, opzionale) — URGENZA: incentivo a tempo per chi si è iscritto, ricapitola benefici.',
    'Email 7 (giorno 14, opzionale) — TRANSIZIONE: imposta aspettative email ricorrenti, chiedi preferenze di contenuto.',
  ],
  cart_abandonment: [
    'Email 1 (1 ora dopo) — REMINDER: mostra i prodotti abbandonati con immagine, nessuno sconto ancora, rimuovi attriti tecnici.',
    'Email 2 (24 ore) — GESTIONE OBIEZIONI: rispondi a spedizione/resi/qualità, includi una recensione cliente.',
    'Email 3 (72 ore) — INCENTIVO: sconto a tempo limitato con scadenza chiara, ricorda i benefici chiave del prodotto.',
    'Email 4 (7 giorni, opzionale) — ULTIMA CHANCE: reminder finale, il carrello sta per scadere.',
  ],
}

export const SUBJECT_LINE_FORMULAS = `FORMULE OGGETTO EMAIL (scegli quella coerente con l'email, mai a caso):
- Numero+Beneficio: "3 modi per raddoppiare [risultato]" — contenuto educativo.
- Curiosity Gap: "L'errore che ci è costato [conseguenza]" — email story-driven.
- Beneficio diretto: "Il tuo [prodotto/report] è pronto" — email di consegna/welcome.
- Personalizzazione: "[Nome], il tuo carrello ti aspetta" — urgenza/onboarding.
- Domanda: "Stai commettendo questo errore?" — problem-awareness.
- How-To: "Come abbinare [prodotto] in 3 modi" — educativo.
- Social proof: "Perché [N] clienti hanno scelto [brand] questo mese" — nurture/lancio.
- Urgenza: "Ultima chance: -20% scade a mezzanotte" — lancio/cart abandonment.
- Pattern interrupt: "Mi sbagliavo su [tema]" — re-engagement.
- Negativa: "Smetti di [pratica comune]" — problem-awareness.
Regole ferree: sotto 50 caratteri (40 ideale su mobile), parola più importante in testa, numeri dispari performano meglio, niente parole spam eccessive ("gratis", "urgente", "clicca ora"), scrivi SEMPRE anche il preview text (preheader).`

export const EMAIL_BENCHMARKS = `BENCHMARK DI SETTORE (open/click/conversion rate medi — usali come riferimento realistico, non promettere di più):
- E-commerce: apertura 15-20%, click 2-3%, conversione 0.5-1.5%.
- Agenzia/Servizi: apertura 18-22%, click 2-4%, conversione 1-3%.`

export const EMAIL_COMPLIANCE = `COMPLIANCE OBBLIGATORIA (includi sempre nel piano):
- Indirizzo fisico del mittente in ogni email (CAN-SPAM).
- Link di disiscrizione chiaro e funzionante (CAN-SPAM, GDPR).
- Consenso esplicito documentato per l'invio (GDPR — no caselle preselezionate).
- Nome mittente e oggetto non ingannevoli.
- Verifica sempre la compliance specifica con un legale prima dell'invio massivo.`

export function buildEmailSequencePrompt(p: {
  tipo: EmailSequenceType
  brandBlock: string
  prodottiBlock: string
  obiettivoExtra?: string
}): string {
  const cat = EMAIL_SEQUENCE_CATALOG[p.tipo]
  const blueprint = SEQUENCE_BLUEPRINTS[p.tipo]
  return `Sei un email marketing strategist senior specializzato in e-commerce fashion. Crea una sequenza email completa "${cat.label}".

BRAND:
${p.brandBlock}

PRODOTTI:
${p.prodottiBlock}

OBIETTIVO SEQUENZA: ${cat.goal}${p.obiettivoExtra ? ` — ${p.obiettivoExtra}` : ''}
NUMERO EMAIL: ${cat.emails}
CADENZA CONSIGLIATA: ${cat.cadence}
${blueprint ? `\nSTRUTTURA EMAIL-PER-EMAIL DA SEGUIRE:\n${blueprint.map(b => `- ${b}`).join('\n')}` : ''}

${SUBJECT_LINE_FORMULAS}

${EMAIL_BENCHMARKS}

${EMAIL_COMPLIANCE}

Regole anti-allucinazione: non inventare percentuali di sconto, codici promo, prezzi o link non forniti dal brand/prodotti — usa placeholder espliciti (es. "[CODICE_SCONTO]") se servono e segnalali in missing_inputs.

Output SOLO JSON valido:
{"tipo":"${p.tipo}","nome_sequenza":"","emails":[{"numero":1,"giorno":"0","job":"una sola cosa che questa email deve ottenere","oggetto":"","preview_text":"","corpo":"","cta":""}],"segmentazione_consigliata":[""],"ab_test_consigliati":[{"elemento":"","variante_a":"","variante_b":""}],"kpi_target":{"open_rate":"","click_rate":"","conversion_rate":""},"missing_inputs":[""],"status":"DA_APPROVARE"}`
}

// ───────────────────────────────────────────────────────────────────────
// FUNNEL STAGES — skill "market-funnel". Tattiche con lift atteso PER STAGE,
// per costruire piani realistici invece di liste generiche di "consigli".
// ───────────────────────────────────────────────────────────────────────
export const FUNNEL_STAGE_TACTICS: Record<string, { label: string; tattiche: string[] }> = {
  tofu: {
    label: 'Top of Funnel — Awareness → Interest',
    tattiche: [
      'A/B test su headline (lift atteso 10-30%)',
      'Posizionamento social proof above the fold (lift atteso 5-15%)',
      'Ottimizzazione velocità pagina (lift atteso 5-20%)',
      'Popup exit-intent con lead magnet (converte 2-5% di chi sta uscendo)',
    ],
  },
  mofu: {
    label: 'Middle of Funnel — Interest → Consideration',
    tattiche: [
      'Pagine case study/testimonianze (lift atteso 10-20%)',
      'Pagine di confronto/caratteristiche (lift atteso 5-15%)',
      'Demo prodotto interattive (lift atteso 15-30%)',
      'Sequenze email di retargeting (lift atteso 10-25%)',
    ],
  },
  bofu: {
    label: 'Bottom of Funnel — Consideration → Purchase',
    tattiche: [
      'Redesign pagina prezzi/checkout (lift atteso 10-25%)',
      'Riduzione attrito al checkout (lift atteso 5-15%)',
      'Risk reversal: garanzie, reso gratuito, prova (lift atteso 10-20%)',
      'Urgenza e scarsità reali, mai finte (lift atteso 5-15%)',
      'Recupero carrello abbandonato (recupera 5-15% dei carrelli persi)',
    ],
  },
  retention: {
    label: 'Post-Purchase — Retention & Expansion',
    tattiche: [
      'Sequenza onboarding post-acquisto (riduzione abbandono 10-20%)',
      'Upsell/cross-sell nella pagina di ringraziamento (lift atteso 5-15% su AOV)',
      'Programma referral (lift atteso 5-15% nuovi clienti)',
      'Survey NPS a 30 giorni (identifica clienti a rischio)',
    ],
  },
}

export function buildFunnelPlanPrompt(p: { brandBlock: string; obiettivo?: string; datiFunnel?: string }): string {
  const stages = Object.values(FUNNEL_STAGE_TACTICS)
    .map(s => `${s.label}:\n${s.tattiche.map(t => `- ${t}`).join('\n')}`)
    .join('\n\n')
  return `Sei un funnel strategist senior per e-commerce. Costruisci un piano di ottimizzazione funnel completo.

BRAND:
${p.brandBlock}

OBIETTIVO: ${p.obiettivo || 'aumentare conversione complessiva'}
${p.datiFunnel ? `\nDATI FUNNEL ATTUALI (reali, non stimarli di nuovo):\n${p.datiFunnel}` : '\nNessun dato di funnel fornito: basa le priorità sulle tattiche standard sotto, segnala in missing_inputs che servono metriche reali per una diagnosi precisa.'}

TATTICHE DI RIFERIMENTO PER STAGE (usa SOLO queste come base, non inventarne altre con numeri diversi):
${stages}

Per ogni stage identifica: bottleneck probabile, 2-3 tattiche prioritarie (tra quelle sopra) con lift atteso onestamente riportato, effort stimato.

Output SOLO JSON valido:
{"funnel_stages":[{"stage":"tofu|mofu|bofu|retention","bottleneck_probabile":"","tattiche_prioritarie":[{"tattica":"","lift_atteso":"","effort":"basso|medio|alto"}]}],"quick_wins":[""],"kpi_da_monitorare":[""],"missing_inputs":[""]}`
}

// ───────────────────────────────────────────────────────────────────────
// LANDING PAGE CRO — skill "market-landing". Rubrica pesata a 7 sezioni (100%),
// grounded sui checklist reali della skill (non un generico "valuta la pagina").
// ───────────────────────────────────────────────────────────────────────
export const LANDING_CRO_RUBRIC = `FRAMEWORK CRO A 7 SEZIONI (pesi = contributo al punteggio 0-100):
1. Hero Section (25%): headline visibile in 2s, benefit-driven e <10 parole, sottotitolo specifico, CTA above the fold e contrastante, CTA action-oriented (non "Invia"), visual coerente col messaggio, trust badge visibili, pagina <3s di caricamento.
2. Value Proposition (20%): cosa fa il prodotto è chiaro, risultati specifici promessi, differenziazione dalle alternative, target chiaro, benefici quantificati, scannabile. Valuta con 4U: Utile, Urgente, Unico, Ultra-specifico.
3. Social Proof (15%, in ordine di forza persuasiva): metriche di risultato > testimonianze nominali con foto > loghi clienti riconoscibili > case study con risultati > rating/recensioni > menzioni stampa > certificazioni > UGC. Numeri specifici ("11.847") battono numeri arrotondati ("10.000+"). Posiziona vicino ai punti di decisione.
4. Features & Benefits (15%): ogni feature tradotta in beneficio (non solo elencata), scannabile con icone/bullet, gerarchia visiva, 3-7 feature chiave (non di più), screenshot/demo di supporto.
5. Objection Handling (10%): FAQ sulle 3-5 obiezioni principali, risk reversal (garanzia/prova/cancella quando vuoi), trasparenza prezzi, indicatori sicurezza/privacy se rilevante.
6. Call-to-Action (10%): CTA ripetuta a intervalli logici, testo action-oriented specifico (non "Invia"), contrasto visivo, nessuna CTA competitiva nella stessa vista.
7. Footer & Elementi secondari (5%): link legali presenti, contatti reali, coerenza brand.`

export function buildLandingCroPrompt(p: { brandBlock: string; pageContent: string; pageType?: string; url?: string }): string {
  return `Sei un CRO (Conversion Rate Optimization) specialist senior. Analizza questa landing page con il framework a 7 sezioni pesato.

BRAND:
${p.brandBlock}

TIPO PAGINA: ${p.pageType || '(deducilo dal contenuto: landing prodotto, homepage, pagina categoria...)'}
${p.url ? `URL: ${p.url}` : ''}

CONTENUTO PAGINA (testo/HTML estratto):
${p.pageContent.slice(0, 8000)}

${LANDING_CRO_RUBRIC}

Regole: assegna un punteggio 0-10 per sezione basato SOLO sui checklist sopra, poi calcola il punteggio pesato totale. Non inventare dati che non puoi osservare dal contenuto (es. velocità di caricamento reale): se non osservabile, segnalalo come "da verificare" invece di stimarlo a caso.

Output SOLO JSON valido:
{"cro_score_totale":0,"tipo_pagina_rilevato":"","sezioni":[{"nome":"Hero Section","peso":25,"score_10":0,"punti_forti":[""],"problemi":[""]}],"quick_wins":["fix implementabile questa settimana"],"medio_termine":["fix del mese"],"strategico":["fix del trimestre"],"ab_test_consigliati":[{"elemento":"","ipotesi":""}],"non_verificabile_dal_contenuto":[""]}`
}
