import { NextResponse } from 'next/server'
import { callAI, extractJSONChecked } from '@/lib/ai'
import { requireAuth } from '@/lib/auth-utils'
import { getClientGenerationContext, brandField } from '@/lib/client-context'
import {
  organizationSchema, websiteSchema, articleSchema, productSchema,
  faqPageSchema, howToSchema, breadcrumbSchema, localBusinessSchema,
  validateSchema, renderJsonLdHtml, type JsonLd, type FaqItem,
} from '@/lib/seo/schema-jsonld'

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

// Base URL del sito cliente (per canonical/publisher). Preferisce sito_url del brand,
// poi blog_domain del cliente. Niente URL inventato: se manca, i campi url si omettono.
function siteBase(brand: Row | null, cliente: Row | null): string {
  const raw = (brand?.sito_url as string) || (cliente?.blog_domain as string) || ''
  if (!raw) return ''
  return /^https?:\/\//.test(raw) ? raw.replace(/\/+$/, '') : `https://${raw.replace(/\/+$/, '')}`
}

// Estrae FAQ (domanda+risposta) da un testo libero con l'AI, SOLO se non sono già
// fornite. Anti-invenzione: le risposte devono derivare dal contenuto dato.
async function extractFaqFromContent(content: string, keys: Row): Promise<FaqItem[]> {
  const raw = await callAI({
    model: (keys.model as string) || 'gemini-2.5-flash',
    systemPrompt: 'Sei un SEO specialist. Estrai FAQ reali dal contenuto fornito, senza inventare. Rispondi SOLO con JSON array valido.',
    userPrompt: `Dal contenuto qui sotto estrai 3-6 coppie domanda/risposta utili per una FAQPage. Le risposte devono essere fondate SOLO sul contenuto (niente invenzioni), 30-55 parole, dirette e citabili.\n\nCONTENUTO:\n${content.slice(0, 6000)}\n\nJSON array: [{"domanda":"","risposta":""}]`,
    openrouterKey: keys.openrouterKey as string | undefined,
    geminiKey: keys.geminiKey as string | undefined,
    opencodeKey: keys.opencodeKey as string | undefined,
    agnesKey: keys.agnesKey as string | undefined,
    maxTokens: 1600,
    meta: { tipo: 'schema_faq', agentName: 'seo' },
  })
  try {
    const { data } = extractJSONChecked(raw)
    return Array.isArray(data) ? (data as FaqItem[]) : []
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const {
      cliente_id, tipo, url, image, headline, description, date_published, keywords,
      product_id, faq, steps, items, content, model, openrouter_key, gemini_key, opencode_key, agnes_key,
    } = body
    const tipoNorm = String(tipo || 'auto').toLowerCase()

    const ctx = await getClientGenerationContext(cliente_id)
    const brand = ctx.brand
    const cliente = ctx.cliente
    const base = siteBase(brand, cliente)
    const nomeBrand = brand ? brandField(brand, 'brand_name', brandField(brand, 'nome', 'Brand')) : 'Brand'
    const logo = (brand?.logo_url as string) || (brand?.logo as string) || ''
    const keys = { model, openrouterKey: openrouter_key, geminiKey: gemini_key, opencodeKey: opencode_key, agnesKey: agnes_key }

    const warnings: string[] = []
    const schemas: JsonLd[] = []

    const pushIf = (s: JsonLd | null) => { if (s) schemas.push(s) }

    // Organization/WebSite/LocalBusiness derivano dai dati brand (deterministici).
    const orgSchema = () => organizationSchema({
      name: nomeBrand,
      url: base || undefined,
      logo: logo || undefined,
      description: brand ? brandField(brand, 'promessa_brand', brandField(brand, 'descrizione', '')) : '',
      sameAs: Array.isArray(brand?.social_urls) ? (brand!.social_urls as string[]) : undefined,
      email: (brand?.email as string) || undefined,
      telephone: (brand?.telefono as string) || undefined,
    })

    switch (tipoNorm) {
      case 'organization':
        pushIf(orgSchema())
        break
      case 'website':
        pushIf(websiteSchema({ name: nomeBrand, url: base || (typeof url === 'string' ? url : ''), searchUrlTemplate: base ? `${base}/search?q={search_term_string}` : undefined }))
        break
      case 'localbusiness':
        pushIf(localBusinessSchema({
          name: nomeBrand,
          url: base || undefined,
          image: logo || undefined,
          telephone: (brand?.telefono as string) || undefined,
          streetAddress: (brand?.indirizzo as string) || undefined,
          city: (brand?.citta as string) || undefined,
          postalCode: (brand?.cap as string) || undefined,
          country: 'IT',
        }))
        break
      case 'product': {
        let prod: Row | undefined = product_id
          ? (ctx.prodotti as Row[]).find(p => p.product_id === product_id || p.id === product_id)
          : undefined
        if (product_id && !prod) warnings.push(`product_id "${product_id}" non trovato nel catalogo del cliente.`)
        prod = prod || (body.product as Row) || {}
        pushIf(productSchema({
          name: (prod.nome_prodotto as string) || (body.name as string) || 'Prodotto',
          description: (prod.descrizione as string) || description,
          image: (prod.link_media_1 as string) || image,
          url: (prod.link_prodotto as string) || url || undefined,
          brandName: nomeBrand,
          sku: (prod.product_id as string) || (prod.sku as string) || undefined,
          price: (prod.prezzo as string) || (body.price as string) || undefined,
          currency: (body.currency as string) || 'EUR',
          availability: 'InStock',
        }))
        break
      }
      case 'faq': {
        let faqItems: FaqItem[] = Array.isArray(faq) ? faq : []
        if (!faqItems.length && typeof content === 'string' && content.trim()) {
          faqItems = await extractFaqFromContent(content, keys)
          if (!faqItems.length) warnings.push('Nessuna FAQ estratta dal contenuto (AI vuota o contenuto insufficiente).')
        }
        const s = faqPageSchema(faqItems)
        if (!s) warnings.push('FAQPage non generata: fornisci "faq" [{domanda,risposta}] o "content".')
        pushIf(s)
        break
      }
      case 'howto': {
        const s = howToSchema({ name: (headline as string) || 'Guida', description, steps: Array.isArray(steps) ? steps : [], totalTime: body.total_time })
        if (!s) warnings.push('HowTo non generato: fornisci "steps" [{name,text}].')
        pushIf(s)
        break
      }
      case 'breadcrumb': {
        const s = breadcrumbSchema(Array.isArray(items) ? items : [])
        if (!s) warnings.push('BreadcrumbList non generato: fornisci "items" [{name,url}].')
        pushIf(s)
        break
      }
      case 'article':
      case 'auto':
      default: {
        // Articolo/blog: BlogPosting + (FAQPage se disponibile) + Organization publisher.
        pushIf(articleSchema({
          headline: (headline as string) || 'Articolo',
          description,
          url: url || undefined,
          image: image || undefined,
          authorName: nomeBrand,
          publisherName: nomeBrand,
          publisherLogo: logo || undefined,
          datePublished: (date_published as string) || undefined,
          keywords: Array.isArray(keywords) ? keywords : undefined,
        }))
        let faqItems: FaqItem[] = Array.isArray(faq) ? faq : []
        if (!faqItems.length && typeof content === 'string' && content.trim()) {
          faqItems = await extractFaqFromContent(content, keys)
        }
        pushIf(faqPageSchema(faqItems))
        pushIf(orgSchema())
        break
      }
    }

    if (!schemas.length) {
      return NextResponse.json({ error: 'Nessuno schema generato', warnings }, { status: 400 })
    }

    const validation = schemas.map(validateSchema)
    for (const v of validation) {
      if (!v.ok) warnings.push(`${v.type}: campi mancanti per rich result → ${v.missing.join(', ')}.`)
    }

    return NextResponse.json({
      ok: true,
      count: schemas.length,
      jsonld: schemas.length === 1 ? schemas[0] : schemas,
      html: renderJsonLdHtml(schemas.length === 1 ? schemas[0] : schemas),
      validation,
      ...(warnings.length ? { warnings } : {}),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore generazione schema'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
