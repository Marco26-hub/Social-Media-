import { q } from '@/lib/db'
import { callAI, extractJSONChecked } from '@/lib/ai'
import { brandField } from '@/lib/client-context'
import { scoreCitability, type ContentBlock, type BlockScore } from '@/lib/geo/citability'
import { validateLlmsTxt, buildLlmsTxt } from '@/lib/geo/llms-txt'

type Row = Record<string, unknown>

export type GeoAuditResult = { clienteId: string; ok: boolean; articoliAnalizzati: number; errore?: string }
export type AiKeys = { model?: string; openrouterKey?: string; geminiKey?: string; opencodeKey?: string }

function blocksFromArticle(article: Row): ContentBlock[] {
  const blocks: ContentBlock[] = []
  if (typeof article.intro === 'string' && article.intro.trim()) blocks.push({ heading: 'Introduzione', text: article.intro })
  for (const s of (Array.isArray(article.sezioni) ? article.sezioni : []) as Row[]) {
    const paragrafi = Array.isArray(s.paragrafi) ? (s.paragrafi as string[]) : []
    const lista = Array.isArray(s.lista_punti) ? (s.lista_punti as string[]).map(p => `- ${p}`) : []
    blocks.push({ heading: String(s.h2 || ''), text: [...paragrafi, ...lista].join('\n\n') })
  }
  for (const f of (Array.isArray(article.faq) ? article.faq : []) as Row[]) {
    blocks.push({ heading: String(f.domanda || 'FAQ'), text: String(f.risposta || '') })
  }
  return blocks
}

const PROMPT = `Sei un GEO/AI-search strategist senior. Hai già i punteggi di citabilità CALCOLATI (non stimarli di nuovo): usali per dare 3-5 raccomandazioni concrete e azionabili, ordinate per impatto.

BRAND: {{BRAND}}

ARTICOLI ANALIZZATI (con problemi reali rilevati per blocco):
{{DETTAGLIO}}

Regole: le raccomandazioni devono derivare SOLO dai problemi elencati sopra (non inventare altro). Ogni raccomandazione indica articolo/sezione, problema e azione concreta.

Output SOLO JSON valido: {"raccomandazioni":[{"priorita":"alta|media|bassa","articolo":"","problema":"","azione":""}]}`

export async function eseguiGeoAuditPerCliente(
  clienteId: string,
  opts: { aiKeys?: AiKeys } = {},
): Promise<GeoAuditResult> {
  const [brandRows, cliRows, articoli] = await Promise.all([
    q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [clienteId]),
    q('SELECT * FROM clienti WHERE id = $1 LIMIT 1', [clienteId]),
    q(
      `SELECT slug, h1, meta_title, meta_description, intro, sezioni, faq, url_pubblicato
       FROM blog_articoli WHERE cliente_id = $1 AND status = 'PUBBLICATO'
       ORDER BY data_pubblicazione DESC LIMIT 20`,
      [clienteId],
    ),
  ])
  const brand = (brandRows[0] as Row) || null
  const cliente = (cliRows[0] as Row) || {}
  // Nessun articolo pubblicato → niente da misurare (audit onesto, non un punteggio finto).
  if (!articoli.length) {
    return { clienteId, ok: false, articoliAnalizzati: 0, errore: 'Nessun articolo blog PUBBLICATO: audit GEO saltato.' }
  }

  const perArticolo = (articoli as Row[]).map(art => {
    const blocks = blocksFromArticle(art)
    const report = scoreCitability(blocks)
    return { slug: art.slug as string, h1: (art.h1 as string) || (art.slug as string), report }
  })

  const scoreMedio = Math.round(perArticolo.reduce((a, x) => a + x.report.overall, 0) / perArticolo.length)
  const coverageMedia = Math.round(perArticolo.reduce((a, x) => a + x.report.coverage, 0) / perArticolo.length)
  const piuDebole = [...perArticolo].sort((a, b) => a.report.overall - b.report.overall)[0]

  // llms.txt "pronto" = il cliente ha blog_domain configurato E almeno un articolo
  // pubblicato con meta_description (requisiti minimi per un file utile, non fittizio).
  const llmsTxtPronto = Boolean(cliente.blog_domain) && (articoli as Row[]).some(a => a.meta_description)
  if (llmsTxtPronto) {
    // Costruzione solo per validare la struttura (non salvata qui: la genera la route dedicata su richiesta).
    const preview = buildLlmsTxt({
      siteName: brandField(brand || {}, 'brand_name', (cliente.nome as string) || 'Brand'),
      description: brandField(brand || {}, 'promessa_brand', 'Sito e blog.'),
      docs: (articoli as Row[]).slice(0, 3).map(a => ({ title: (a.h1 as string) || '', url: (a.url_pubblicato as string) || `/blog/${a.slug}` })),
    })
    validateLlmsTxt(preview) // rimane un controllo di coerenza interna, non blocca il salvataggio
  }

  const dettaglio = perArticolo.map(x => ({
    slug: x.slug,
    titolo: x.h1,
    score: x.report.overall,
    coverage: x.report.coverage,
    blocchi_deboli: x.report.weakest.filter(b => b.overall < 70).map((b: BlockScore) => ({ heading: b.heading, score: b.overall, issues: b.issues })),
  }))

  const nomeBrand = brand ? brandField(brand, 'nome', 'il cliente') : 'il cliente'
  const model = opts.aiKeys?.model || 'gemini-2.5-flash'
  let raccomandazioni: unknown[] = []
  try {
    const raw = await callAI({
      model,
      systemPrompt: 'Sei un GEO strategist senior. Rispondi SOLO con JSON valido, italiano impeccabile.',
      userPrompt: PROMPT
        .replace('{{BRAND}}', () => JSON.stringify({ nome: nomeBrand }, null, 2))
        .replace('{{DETTAGLIO}}', () => JSON.stringify(dettaglio.filter(d => d.blocchi_deboli.length), null, 2)),
      openrouterKey: opts.aiKeys?.openrouterKey,
      geminiKey: opts.aiKeys?.geminiKey,
      opencodeKey: opts.aiKeys?.opencodeKey,
      maxTokens: 2000,
      meta: { clienteId, tipo: 'geo_audit', agentName: 'geo' },
    })
    const { data } = extractJSONChecked(raw)
    raccomandazioni = ((data as Row)?.raccomandazioni as unknown[]) || []
  } catch {
    // Le raccomandazioni AI sono un valore aggiunto, non il cuore dell'audit (che è il
    // punteggio calcolato): se l'AI fallisce, salviamo comunque i punteggi reali.
    raccomandazioni = []
  }

  await q(
    `INSERT INTO geo_audit (
      cliente_id, data_audit, articoli_analizzati, citability_score_medio, citability_coverage,
      articolo_piu_debole_slug, articolo_piu_debole_score, dettaglio, raccomandazioni, llms_txt_pronto,
      generato_da, fonte_generazione
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11, 'agente_auto')`,
    [
      clienteId, new Date().toISOString().split('T')[0], perArticolo.length, scoreMedio, coverageMedia,
      piuDebole?.slug || null, piuDebole?.report.overall ?? null,
      JSON.stringify(dettaglio), JSON.stringify(raccomandazioni), llmsTxtPronto,
      model,
    ],
  )

  return { clienteId, ok: true, articoliAnalizzati: perArticolo.length }
}
