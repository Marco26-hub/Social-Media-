// Pipeline blog MULTI-STEP per modelli LOCALI (Ollama / AIM).
// Spezza la scrittura in passi piccoli e mirati: un modello 8B locale così rende
// quanto un grande modello cloud in single-shot. 100% locale, gratis, privato.
//
// Step: 1) keyword research  2) outline  3) scrittura BLOCCO-PER-BLOCCO
//        4) FAQ  5) meta/title + assemblaggio.

import { callAI, extractJSON, extractJSONArray } from '@/lib/ai'

export type BlogStep = { name: string; label: string; ok: boolean; detail?: string }

export type BlogArticle = {
  slug: string
  meta_title: string
  meta_description: string
  h1: string
  intro: string
  sezioni: { h2: string; paragrafi: string[]; lista_punti?: string[] }[]
  faq: { domanda: string; risposta: string }[]
  cta_finale: string
  keywords_target: string[]
  tempo_lettura_min: number
  angle_editoriale: string
  search_intent: string
}

type RunOpts = {
  tema: string
  brand: Record<string, unknown> | null
  prodotti: Record<string, unknown>[]
  // Modello locale per scrittura (default gemma4: miglior italiano) e ricerca (llama3.1:8b se c'è).
  writeModel: string
  researchModel: string
  openrouterKey?: string
  geminiKey?: string
  opencodeKey?: string
  onStep?: (step: BlogStep) => void
}

const brandName = (b: Record<string, unknown> | null) =>
  (b?.brand_name as string) || 'il brand'

function brandBlock(b: Record<string, unknown> | null): string {
  if (!b) return 'Brand fashion e-commerce italiano di qualità.'
  return [
    `Nome: ${b.brand_name || 'n/d'}`,
    `Settore: ${b.settore || 'moda'}`,
    `Tono di voce: ${b.tono_voce || 'elegante, autentico'}`,
    `Target: ${b.target || 'n/d'}`,
    `Parole da usare: ${b.parole_da_usare || 'n/d'}`,
    `Parole da evitare: ${b.parole_da_evitare || 'n/d'}`,
  ].join('\n')
}

function productsBlock(p: Record<string, unknown>[]): string {
  if (!p?.length) return 'Nessun prodotto specifico.'
  return p.slice(0, 8).map(x => `- ${x.nome_prodotto || x.product_id} (${x.categoria || 'prodotto'})`).join('\n')
}

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

export async function generateBlogLocal(opts: RunOpts): Promise<{ article: BlogArticle; steps: BlogStep[] }> {
  const { tema, brand, prodotti, writeModel, researchModel } = opts
  const keys = { openrouterKey: opts.openrouterKey, geminiKey: opts.geminiKey, opencodeKey: opts.opencodeKey }
  const steps: BlogStep[] = []
  const emit = (s: BlogStep) => { steps.push(s); opts.onStep?.(s) }

  const BRAND = brandBlock(brand)
  const PRODOTTI = productsBlock(prodotti)

  // ───────── STEP 1: Keyword research ─────────
  const kwRaw = await callAI({
    model: researchModel,
    systemPrompt: 'Sei un SEO strategist. Rispondi SOLO con JSON valido, italiano impeccabile.',
    userPrompt:
      `Brand:\n${BRAND}\n\nTema articolo: "${tema}".\n\n` +
      `Genera la strategia keyword per un articolo blog SEO/GEO in italiano. JSON:\n` +
      `{"primaria":"keyword principale","secondarie":["4-6 keyword correlate"],"intent":"informazionale|commerciale|transazionale","domande":["3-5 domande che l'utente cerca su Google/AI"]}`,
    maxTokens: 1200,
    ...keys,
  })
  const kw = extractJSON(kwRaw) as { primaria?: string; secondarie?: string[]; intent?: string; domande?: string[] }
  const primaria = kw.primaria || tema
  const secondarie = Array.isArray(kw.secondarie) ? kw.secondarie : []
  const intent = kw.intent || 'informazionale'
  const domande = Array.isArray(kw.domande) ? kw.domande : []
  emit({ name: 'keywords', label: 'Parole chiave', ok: true, detail: `${primaria} + ${secondarie.length} correlate` })

  // ───────── STEP 2: Outline ─────────
  const outlineRaw = await callAI({
    model: writeModel,
    systemPrompt: 'Sei un caporedattore SEO. Rispondi SOLO con JSON valido, italiano impeccabile.',
    userPrompt:
      `Brand:\n${BRAND}\n\nProdotti:\n${PRODOTTI}\n\n` +
      `Tema: "${tema}". Keyword primaria: "${primaria}". Secondarie: ${secondarie.join(', ')}. Intent: ${intent}.\n\n` +
      `Crea la scaletta di un articolo blog 800-1200 parole. JSON:\n` +
      `{"h1":"titolo H1 50-60 char con keyword","angle":"angolo editoriale in una frase","sezioni":[{"h2":"titolo sezione con keyword secondaria","punti":["2-4 punti da coprire"]}]}\n` +
      `Esattamente 3-4 sezioni. Niente intro/conclusione come sezioni (gestite a parte).`,
    maxTokens: 1500,
    ...keys,
  })
  const outline = extractJSON(outlineRaw) as { h1?: string; angle?: string; sezioni?: { h2: string; punti: string[] }[] }
  const h1 = outline.h1 || `${tema}: la guida`
  const angle = outline.angle || ''
  const outlineSezioni = (Array.isArray(outline.sezioni) ? outline.sezioni : []).slice(0, 4)
  emit({ name: 'outline', label: 'Scaletta', ok: true, detail: `${outlineSezioni.length} sezioni` })

  // ───────── STEP 3: Intro ─────────
  const introRaw = await callAI({
    model: writeModel,
    systemPrompt: 'Sei un copywriter SEO/GEO senior. Italiano impeccabile, mai parole attaccate. Rispondi SOLO con JSON valido.',
    userPrompt:
      `Articolo su "${tema}" per ${brandName(brand)}. H1: "${h1}". Angolo: ${angle}. Keyword: ${primaria}.\n` +
      `Scrivi l'INTRODUZIONE (60-90 parole) che risponde SUBITO all'intento di ricerca (ottimo per AI search/GEO): prima frase = risposta diretta con il soggetto esplicito (mai "questo/esso"), un dato concreto se disponibile. JSON: {"intro":"..."}`,
    maxTokens: 600,
    ...keys,
  })
  const intro = (extractJSON(introRaw) as { intro?: string }).intro || ''

  // ───────── STEP 3b: Scrittura BLOCCO-PER-BLOCCO ─────────
  const sezioni: BlogArticle['sezioni'] = []
  for (let i = 0; i < outlineSezioni.length; i++) {
    const sez = outlineSezioni[i]
    const secRaw = await callAI({
      model: writeModel,
      systemPrompt: 'Sei un copywriter SEO/GEO senior. Italiano impeccabile. Non inventare dati o fonti. Rispondi SOLO con JSON valido.',
      userPrompt:
        `Articolo: "${h1}" (${brandName(brand)}). Keyword: ${primaria}, ${secondarie.join(', ')}.\n` +
        `Scrivi SOLO questa sezione.\nH2: "${sez.h2}"\nPunti da coprire: ${(sez.punti || []).join('; ')}\n\n` +
        `2-3 paragrafi (40-70 parole l'uno), chiari e utili, auto-contenuti (nomina sempre il soggetto, mai iniziare con un pronome). Includi 1 lista puntata se sensato. ` +
        `JSON: {"h2":"${sez.h2}","paragrafi":["..."],"lista_punti":["..."]}`,
      maxTokens: 1100,
      ...keys,
    })
    const parsed = extractJSON(secRaw) as { h2?: string; paragrafi?: string[]; lista_punti?: string[] }
    sezioni.push({
      h2: parsed.h2 || sez.h2,
      paragrafi: Array.isArray(parsed.paragrafi) ? parsed.paragrafi : [],
      lista_punti: Array.isArray(parsed.lista_punti) && parsed.lista_punti.length ? parsed.lista_punti : undefined,
    })
    emit({ name: `sezione_${i + 1}`, label: `Sezione ${i + 1}/${outlineSezioni.length}`, ok: true, detail: sez.h2 })
  }

  // ───────── STEP 4: FAQ ─────────
  const faqRaw = await callAI({
    model: writeModel,
    systemPrompt: 'Sei un esperto SEO/GEO. Rispondi SOLO con JSON array valido, italiano impeccabile.',
    userPrompt:
      `Articolo "${h1}" su ${primaria}. Domande reali degli utenti: ${domande.join(' | ')}.\n` +
      `Scrivi 3-4 FAQ (domanda + risposta 30-50 parole, diretta, citabile da AI). JSON array: [{"domanda":"","risposta":""}]`,
    maxTokens: 1200,
    ...keys,
  })
  let faq: BlogArticle['faq'] = []
  try { faq = (extractJSONArray(faqRaw) as BlogArticle['faq']).slice(0, 5) } catch { faq = [] }
  // ok riflette il risultato reale: senza FAQ l'articolo perde citabilità GEO, non fingere "✓".
  emit({ name: 'faq', label: 'FAQ', ok: faq.length > 0, detail: faq.length ? `${faq.length} domande` : 'FAQ non generate' })

  // ───────── STEP 5: Meta + title + slug + CTA ─────────
  const metaRaw = await callAI({
    model: writeModel,
    systemPrompt: 'Sei un SEO specialist. Rispondi SOLO con JSON valido. Rispetta ESATTI i limiti di caratteri.',
    userPrompt:
      `Articolo "${h1}" su "${primaria}" per ${brandName(brand)}.\n` +
      `Genera metadati SEO. JSON:\n` +
      `{"slug":"url-friendly-con-keyword","meta_title":"50-60 caratteri ESATTI con keyword","meta_description":"140-160 caratteri ESATTI invoglianti","cta_finale":"call to action verso i prodotti"}`,
    maxTokens: 600,
    ...keys,
  })
  const meta = extractJSON(metaRaw) as { slug?: string; meta_title?: string; meta_description?: string; cta_finale?: string }
  emit({ name: 'meta', label: 'Meta & Title', ok: true, detail: meta.meta_title || '' })

  // ───────── Assemblaggio ─────────
  const allText = [intro, ...sezioni.flatMap(s => [...s.paragrafi, ...(s.lista_punti || [])]), ...faq.flatMap(f => [f.domanda, f.risposta])].join(' ')
  const tempo = Math.max(2, Math.round(wordCount(allText) / 200))
  const slug = (meta.slug || primaria.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) || `articolo-${tema.slice(0, 20)}`

  const article: BlogArticle = {
    slug,
    meta_title: (meta.meta_title || h1).slice(0, 65),
    meta_description: (meta.meta_description || intro).slice(0, 165),
    h1,
    intro,
    sezioni,
    faq,
    cta_finale: meta.cta_finale || `Scopri la collezione ${brandName(brand)}.`,
    keywords_target: [primaria, ...secondarie],
    tempo_lettura_min: tempo,
    angle_editoriale: angle,
    search_intent: intent,
  }

  return { article, steps }
}
