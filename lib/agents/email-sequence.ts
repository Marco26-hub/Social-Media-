import { q } from '@/lib/db'
import { callAI, extractJSONChecked } from '@/lib/ai'
import { resolveContentQuality, getQualityTokenBudget } from '@/lib/content-quality'
import { buildEmailSequencePrompt, type EmailSequenceType } from '@/lib/marketing/frameworks'

type Row = Record<string, unknown>

export type EmailSequenceResult = { clienteId: string; sequenzeCreate: number; errori: string[] }
export type AiKeys = { model?: string; openrouterKey?: string; geminiKey?: string; opencodeKey?: string }

// Le due sequenze universalmente utili per un e-commerce fashion (il verticale di
// questo prodotto): welcome (ogni nuovo iscritto) e cart_abandonment (recupero
// vendite). L'agente le crea UNA VOLTA per cliente, non le rigenera ogni run
// (a differenza di content/ads che producono bozze fresche ogni volta) — una
// sequenza email è un asset stabile, non un post del giorno.
const AUTO_TYPES: EmailSequenceType[] = ['welcome', 'cart_abandonment']

function brandBlock(b: Row | null): string {
  if (!b) return 'Brand fashion e-commerce italiano di qualità.'
  return [
    `Nome: ${b.brand_name || b.nome || 'n/d'}`,
    `Settore: ${b.settore || 'moda'}`,
    `Tono di voce: ${b.tono_voce || 'elegante, autentico'}`,
    `Target: ${b.target || 'n/d'}`,
    `Promessa: ${b.promessa_brand || b.descrizione || 'n/d'}`,
    `Parole da evitare: ${b.parole_da_evitare || 'n/d'}`,
  ].join('\n')
}

function prodottiBlock(p: Row[]): string {
  if (!p?.length) return 'Nessun prodotto specifico: parla del brand nel suo insieme.'
  return p.slice(0, 8).map(x => `- ${x.nome_prodotto || x.product_id} (${x.categoria || 'prodotto'})`).join('\n')
}

export async function eseguiEmailSequencePerCliente(
  clienteId: string,
  opts: { aiKeys?: AiKeys } = {},
): Promise<EmailSequenceResult> {
  const [brandRows, cliRows, prodotti, existing] = await Promise.all([
    q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [clienteId]),
    q('SELECT * FROM clienti WHERE id = $1 LIMIT 1', [clienteId]),
    q("SELECT * FROM prodotti WHERE cliente_id = $1 AND prodotto_attivo = 'SI' ORDER BY priorita NULLS LAST, created_at DESC LIMIT 8", [clienteId]),
    q('SELECT DISTINCT tipo FROM email_sequence WHERE cliente_id = $1', [clienteId]),
  ])
  const brand = (brandRows[0] as Row) || null
  // Stesso gate anti-generico degli altri agenti: senza brand niente copy off-brand.
  if (!brand) {
    return { clienteId, sequenzeCreate: 0, errori: ['Brand non configurato: generazione sequenze email saltata.'] }
  }
  const cliente = (cliRows[0] as Row) || {}
  const already = new Set((existing as Row[]).map(r => String(r.tipo)))
  const toCreate = AUTO_TYPES.filter(t => !already.has(t))
  if (!toCreate.length) {
    return { clienteId, sequenzeCreate: 0, errori: [] } // già presenti: non è un errore, è idempotenza
  }

  const quality = resolveContentQuality({ piano: cliente.piano })
  const maxTokens = getQualityTokenBudget(quality)
  const model = opts.aiKeys?.model || 'gemini-2.5-flash'
  const brandStr = brandBlock(brand)
  const prodStr = prodottiBlock(prodotti as Row[])

  const errori: string[] = []
  let sequenzeCreate = 0

  for (const tipo of toCreate) {
    try {
      const raw = await callAI({
        model,
        systemPrompt: 'Sei un email marketing strategist senior. Italiano impeccabile. Rispondi SOLO con JSON valido. Non inventare sconti/codici/prezzi non forniti.',
        userPrompt: buildEmailSequencePrompt({ tipo, brandBlock: brandStr, prodottiBlock: prodStr }),
        openrouterKey: opts.aiKeys?.openrouterKey,
        geminiKey: opts.aiKeys?.geminiKey,
        opencodeKey: opts.aiKeys?.opencodeKey,
        maxTokens,
        meta: { clienteId, tipo: 'email_sequence', agentName: 'email' },
      })
      const { data } = extractJSONChecked(raw)
      const parsed = (data as Row) || {}
      if (!Array.isArray(parsed.emails) || !parsed.emails.length) {
        errori.push(`${tipo}: nessuna email generata dall'AI`)
        continue
      }
      await q(
        `INSERT INTO email_sequence (cliente_id, tipo, contenuto, generato_da, fonte_generazione)
         VALUES ($1, $2, $3::jsonb, $4, 'agente_auto')`,
        [clienteId, tipo, JSON.stringify(parsed), model],
      )
      sequenzeCreate++
    } catch (e) {
      errori.push(`${tipo}: ${(e instanceof Error ? e.message : String(e)).slice(0, 120)}`)
    }
  }

  return { clienteId, sequenzeCreate, errori }
}
