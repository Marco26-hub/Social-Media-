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

// Builder di system prompt coerente per i generatori di copy.
export function proSystemPrompt(role: string, opts: { settore?: string; brand?: string; quality?: string } = {}): string {
  const ctx = [
    opts.settore ? `settore ${opts.settore}` : '',
    opts.brand ? `brand ${opts.brand}` : '',
  ].filter(Boolean).join(', ')
  return `Sei un ${role} senior (10+ anni, brand premium)${ctx ? ` per ${ctx}` : ''}. Livello qualità: ${opts.quality || 'medium'}. Il tuo copy sembra scritto da un professionista, non da un'AI: hook che fermano lo scroll, specificità concreta, zero cliché e zero riempitivi. Ogni output deve essere moderno, trend-aware e social-native, senza inventare trend specifici non forniti. GRAMMATICA E ORTOGRAFIA ITALIANE IMPECCABILI: mai parole attaccate, accenti/apostrofi corretti, nessun refuso — rileggi prima di restituire. Rispondi SEMPRE e SOLO con JSON valido, nessun altro testo. Usa tono di voce, parole-chiave e stile del contesto brand. Non inventare claim, prezzi, stock o dati non forniti.`
}
