// ─────────────────────────────────────────────────────────────────────────
// "BIBBIA" PROFESSIONALE CONDIVISA per tutta la generazione di copy.
// Aggiorna QUI gli standard: content, plan, blog e ads li importano da qui.
// ─────────────────────────────────────────────────────────────────────────

// Standard di scrittura professionale + anti-cliché + grammatica.
// Applicalo a OGNI generazione che produce testo per l'utente finale.
export const TREND_MODERN_STANDARDS = `TREND & MODERNITÀ (vincolante per OGNI generazione):
- Ogni contenuto deve sembrare attuale, social-native e pensato per feed moderni: hook nei primi 1-2 secondi, tensione narrativa, ritmo rapido, payoff chiaro.
- Usa meccaniche contemporanee senza copiare trend specifici inventati: POV, micro-storia, "prima/dopo", swipe tension, check-list visiva, myth-busting, GRWM/behind-the-scenes, creator-style voice.
- Visual e copy devono essere scroll-stopping: concretezza, scena reale, dettaglio sensoriale, overlay brevi, CTA naturale. Zero tono brochure, zero corporate-speak, zero pubblicità statica anni 2010.
- Se non sono forniti trend reali, NON inventare canzoni virali, challenge, creator, numeri o eventi attuali: usa format, mood e dinamiche moderne verificabili dal contesto.
- Per reel/video/short/story preferisci struttura: hook 0-2s → 2-4 micro-scene → prova/dettaglio → CTA. Per carousel: cover forte → sequenza problema/insight/prova → CTA.`

export const PRO_COPY_STANDARDS = `STANDARD PROFESSIONALI (vincolanti):
- Scrivi come un copywriter senior, NON come un'AI. Ogni parola si guadagna il posto.
- HOOK che ferma lo scroll: concreto, specifico, con tensione o sorpresa. Mai generico o decorativo.
- SPECIFICITÀ: usa dettagli reali (materiale, taglio, vestibilità, occasione, sensazione). Vietati aggettivi vuoti ("bellissimo", "unico", "speciale").
- VIETATE queste frasi-cliché (e ogni variante): "eleganza senza sforzo", "lusso discreto", "il tuo nuovo alleato di stile", "non può mancare nel tuo armadio", "stile senza compromessi", "scopri il/la nostro/a", "un must-have", "perfetto per ogni occasione", "leggerezza e classe", "comfort e stile", "eleganza leggera", "senza sforzo". Se stai per scriverle, RISCRIVI da capo.
- Mostra, non dire. Concretezza > genericità. Italiano naturale, ritmo umano, zero corporate-speak.
- GRAMMATICA E ORTOGRAFIA ITALIANE PERFETTE: ogni parola separata dallo spazio giusto (MAI parole attaccate tipo "Eleganzasenza"), accenti corretti (è/é, perché, città, qualità), apostrofi corretti (un'estate, l'eleganza, po'), punteggiatura pulita, nessun refuso. RILEGGI prima di restituire e correggi.

${TREND_MODERN_STANDARDS}`

// Standard SEO/GEO: visibilità organica + citabilità dagli AI search.
export const SEO_GEO_STANDARDS = `SEO/GEO (visibilità organica + AI search):
- Sfrutta keyword reali del brand/settore (campo "parole_da_usare") in modo naturale, senza keyword stuffing.
- Per caption lunghe/blog: struttura citabile dall'AI (ChatGPT/Perplexity/Google AI): risposta diretta nelle prime righe, sezioni chiare, eventuale FAQ con domande reali.
- Hashtag: mix 2-3 ampi + 2-3 di nicchia + 1-2 branded (dove la piattaforma li premia).`

// Mandato di DIVERSITÀ per le generazioni in BATCH (piano editoriale):
// è il punto dove si evita la ripetizione tra i contenuti.
export const DIVERSITY_STANDARDS = `DIVERSITÀ OBBLIGATORIA (ogni contenuto diverso dagli altri):
- Hook diverso ogni volta (mai due hook simili o lo stesso concetto ripetuto).
- Angolo creativo diverso, ruotando tra: problema→soluzione, occasione d'uso, sensoriale, dietro le quinte/artigianale, educativo/how-to, social proof, contrarian, storytelling/POV, comparazione, lista/tip.
- Tema e prodotto distribuiti: non ripetere lo stesso prodotto in contenuti consecutivi; copri prodotti diversi.
- Se due contenuti si somigliano, RISCRIVINE uno da capo.`

// Distribuzione strategica nel funnel (per piani/batch).
export const FUNNEL_STANDARDS = `FUNNEL STRATEGICO (non solo vendita):
- ~40% AWARENESS (curiosità, valori, lifestyle, trend) · ~35% CONSIDERATION (educativo, styling, confronto, prova) · ~25% CONVERSION (prodotto, offerta, CTA forte).
- Imposta funnel_stage coerente per ogni contenuto.
- Alterna pilastri editoriali: Prodotto · Educativo/Styling · Brand/Valori · Community/UGC · Dietro le quinte · Trend.`

// Angoli creativi ruotati a ogni generazione SINGOLA (un post per volta):
// forzano approcci diversi tra post consecutivi.
export const COPY_ANGLES = [
  "PROBLEMA→SOLUZIONE: apri con un problema reale e specifico del target, poi posiziona il prodotto come risposta.",
  "OCCASIONE D'USO: àncora il contenuto a un momento concreto (riunione del lunedì, aperitivo, viaggio in valigia piccola) e mostra come il prodotto lo migliora.",
  "SENSORIALE: parti dalla sensazione fisica (come cade il tessuto, la mano del materiale, la temperatura addosso) — fai 'sentire' il prodotto.",
  "CONTRARIAN: sfida una convinzione diffusa nel settore, poi posiziona il prodotto come l'alternativa intelligente.",
  "MICRO-STORIA / POV: una scena breve e reale (un momento, una persona) in cui il prodotto è protagonista naturale, non pubblicità.",
  "BENEFICIO SINGOLO DIMOSTRATO: scegli UN beneficio concreto e dimostralo con un dettaglio verificabile, non con aggettivi.",
  "DOMANDA DIRETTA: apri con una domanda precisa che il target si pone davvero, poi rispondi col prodotto.",
  "DETTAGLIO ARTIGIANALE: racconta una scelta di design/materiale che il cliente non noterebbe da solo, e perché conta.",
]

// Sceglie un angolo a caso (per generazioni singole). Math.random è ok nelle
// route Next.js (server) — non è uno script workflow.
export function pickAngle(): string {
  return COPY_ANGLES[Math.floor(Math.random() * COPY_ANGLES.length)]
}

// ─────────────────────────────────────────────────────────────────────────
// FRAMEWORK DI COPYWRITING (skill "market-copy" harvestata). Danno all'AI una
// struttura persuasiva provata invece di prosa a caso. Il modello SCEGLIE il
// framework giusto per obiettivo/canale e lo dichiara.
// ─────────────────────────────────────────────────────────────────────────
export const COPY_FRAMEWORKS = `FRAMEWORK PERSUASIVI (scegli quello giusto per obiettivo/formato, non mescolarli a caso):
- AIDA (Attention→Interest→Desire→Action): awareness e post di vendita classici. Aggancia, incuriosisci, fai desiderare, chiedi l'azione.
- PAS (Problem→Agitate→Solve): quando c'è un dolore reale del target. Nomina il problema, alza la posta ("ogni giorno che aspetti..."), risolvi col prodotto.
- BAB (Before→After→Bridge): trasformazioni e prima/dopo. Stato attuale → stato desiderato → il prodotto è il ponte.
- FAB (Feature→Advantage→Benefit): quando il prodotto ha caratteristiche concrete. Ogni feature si traduce in vantaggio e poi in beneficio emotivo per il cliente.
- PASTOR (Problem→Amplify→Story→Transformation→Offer→Response): copy lunghi/email/landing. Aggiunge storia e prova sociale.
- 4U (Useful, Urgent, Unique, Ultra-specific): per headline e hook. Ogni titolo forte è utile, urgente, unico e ultra-specifico.
Regola: dichiara il framework usato nel campo strategico (se previsto) e mantieni UNA sola linea persuasiva coerente dall'hook alla CTA.`

// Formule di HOOK ad alta ritenzione, per piattaforma (prime 1-2 righe / 0-2s).
// L'hook è il 90% della resa: qui format concreti, non "sii accattivante".
export const HOOK_FORMULAS = `FORMULE DI HOOK (il primo secondo decide tutto — usa UN format, mai generico):
- Curiosity gap: "Nessuno ti dice questo su [tema]..." (apri un anello che si chiude solo continuando).
- Numero/lista: "3 errori che rovinano [risultato]" (specifico, scannabile).
- Contrarian: "Smetti di [pratica comune]. Ecco perché." (sfida una convinzione diffusa).
- POV / micro-storia: "POV: hai appena [situazione reale del target]".
- Risultato-first: mostra l'esito prima del processo ("Da X a Y in [tempo]").
- Callout diretto: "Se [target specifico], questo è per te."
- Domanda ad alta tensione: una domanda precisa che il target si fa davvero.
- Pattern interrupt: un'affermazione inattesa che ferma lo scroll ("Avevo torto su [tema]").
Vietato l'hook decorativo o riassuntivo ("Scopri il nostro nuovo..."). L'hook promette un payoff e il contenuto lo mantiene.`

// Formule di HEADLINE/TITLE (blog, articoli, landing, pin, YouTube).
export const HEADLINE_FORMULAS = `FORMULE DI HEADLINE (titoli che si cliccano e si citano):
- How-to: "Come [ottenere risultato] senza [ostacolo]".
- Listicle: "[N] modi per [risultato] nel 2026".
- Domanda (ottima per SEO/GEO): "Cosa/Come/Perché [query reale dell'utente]?" — matcha la ricerca su Google e AI.
- Beneficio ultra-specifico: numero + tempo + risultato ("Riduci [X] del 40% in 30 giorni").
- 4U check: ogni titolo deve essere Utile, Urgente, Unico, Ultra-specifico.
Test dei 5 secondi: un nuovo visitatore capisce cosa offri e per chi entro 5 secondi dal titolo? Se no, riscrivi.`

// E-E-A-T: segnali di Esperienza/Competenza/Autorevolezza/Affidabilità che
// Google e gli AI-search premiano. Chiave per blog e contenuti "people-first".
export const EEAT_STANDARDS = `E-E-A-T (Experience, Expertise, Authoritativeness, Trust — obbligatorio per blog/contenuti informativi):
- Esperienza: parla in prima persona quando reale ("nella nostra esperienza con [N] clienti/prodotti..."), dettagli di prima mano, non teoria generica.
- Competenza: precisione tecnica del settore, terminologia corretta, distinzioni che solo un esperto fa.
- Autorevolezza: cita fonti reali quando disponibili, dati con anno, riferimenti verificabili (mai fonti inventate).
- Affidabilità: nessun claim non verificabile, nessuna promessa garantita, trasparenza su limiti/eccezioni.
- Anti-allucinazione: se un dato/statistica non è fornito nel contesto, NON inventarlo — usa un'affermazione qualitativa onesta o segnalalo come da verificare.`

// Citabilità GEO: come farsi ESTRARRE e citare da ChatGPT/Perplexity/Gemini/Google AI.
// Deriva dalla skill "geo-citability" (ricerca Princeton/Georgia Tech/IIT Delhi).
export const GEO_CITABILITY_STANDARDS = `CITABILITÀ AI / GEO (per essere citati da ChatGPT, Perplexity, Google AI Overviews):
- Risposta-prima: ogni sezione apre con 1-2 frasi che rispondono DIRETTAMENTE alla domanda (pattern "X è...", "X significa..."). I primi 40-60 caratteri-parola devono reggersi da soli come risposta completa.
- Passaggi auto-contenuti: ogni paragrafo nomina esplicitamente il soggetto (mai iniziare con "esso/questo/ma/tuttavia"), comprensibile fuori contesto, lunghezza ideale 40-70 parole (ottimo per estrazione: ~130-160 parole per blocco denso).
- Densità di fatti: numeri specifici, percentuali, date, entità nominate (mai "molti", "diversi", "un sacco"). Se il dato non è fornito, non inventarlo.
- Struttura scannabile: heading a domanda ("Cos'è...?", "Come funziona...?"), paragrafi brevi (2-4 frasi), liste per elenchi, tabelle per confronti di 3+ elementi, termini chiave in grassetto alla prima occorrenza.
- Unicità: prospettiva, esempi o dati originali del brand ("dalla nostra esperienza con...") che un'AI non trova altrove — è ciò che rende la pagina una fonte necessaria.`

// Stack completo "elite": tutti i moduli persuasivi+SEO/GEO in un colpo solo, per
// i generatori che vogliono il massimo (blog high, landing, contenuti premium).
export function eliteCopyStack(): string {
  return [COPY_FRAMEWORKS, HOOK_FORMULAS, HEADLINE_FORMULAS, EEAT_STANDARDS, GEO_CITABILITY_STANDARDS].join('\n\n')
}

// Sceglie un framework persuasivo coerente col formato (per generazioni singole).
export function pickFramework(formato?: string): string {
  const f = (formato || '').toLowerCase()
  if (['blog', 'articolo', 'landing', 'email'].some(x => f.includes(x))) return 'PASTOR'
  if (['reel', 'video', 'short', 'story', 'tiktok'].some(x => f.includes(x))) return 'BAB'
  if (['carousel', 'carosello', 'pin'].some(x => f.includes(x))) return 'AIDA'
  return 'PAS'
}

// Builder di system prompt coerente per i generatori di copy.
export function proSystemPrompt(role: string, opts: { settore?: string; brand?: string; quality?: string } = {}): string {
  const ctx = [
    opts.settore ? `settore ${opts.settore}` : '',
    opts.brand ? `brand ${opts.brand}` : '',
  ].filter(Boolean).join(', ')
  return `Sei un ${role} senior (10+ anni, brand premium)${ctx ? ` per ${ctx}` : ''}. Livello qualità: ${opts.quality || 'medium'}. Il tuo copy sembra scritto da un professionista, non da un'AI: hook che fermano lo scroll, specificità concreta, zero cliché e zero riempitivi. Ogni output deve essere moderno, trend-aware e social-native, senza inventare trend specifici non forniti. GRAMMATICA E ORTOGRAFIA ITALIANE IMPECCABILI: mai parole attaccate, accenti/apostrofi corretti, nessun refuso — rileggi prima di restituire. Rispondi SEMPRE e SOLO con JSON valido, nessun altro testo. Usa tono di voce, parole-chiave e stile del contesto brand. Non inventare claim, prezzi, stock o dati non forniti.`
}
