import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'

const DEMO_BRAND = {
  id: 'demo-brand',
  cliente_id: 'demo-silkincom',
  brand_name: 'SILKinCOM',
  sito_url: 'https://silkincom.com',
  settore: 'Fashion/Abbigliamento',
  tono_voce: 'elegante',
  target: 'Donna 25-34, Donna 35-44, Professioniste',
  promessa_brand: 'Eleganza accessibile',
  colori_brand: 'Beige, Nero, Bianco, Oro',
  parole_da_usare: '#SEO:eleganza,#SEO:moda,#GEO:stile italiano,#LONGTAIL:abiti eleganti,#BRANDED:silkincom',
  parole_da_evitare: '#EVITA:economico,low cost,#EVITA:fast fashion,cinese',
  emoji_policy: 'Max 2 emoji eleganti per post',
  hashtag_base: '#BRANDED:silkincom, #SETTORE:fashion, #NICCHIA:outfitprimavera',
  cta_base: 'Scopri la collezione',
  note_legali: '',
  disclaimer_text: 'Le immagini sono a scopo illustrativo.',
  gdpr_note: 'Dati trattati secondo Reg. UE 2016/679.',
  privacy_note: 'Informativa completa su /privacy.',
  cookie_policy: 'Cookie tecnici e analytics.',
}

const BRAND_UPDATE_COLUMNS = new Set([
  'brand_name',
  'settore',
  'sito_url',
  'tono_voce',
  'target',
  'promessa_brand',
  'colori_brand',
  'parole_da_usare',
  'parole_da_evitare',
  'emoji_policy',
  'hashtag_base',
  'cta_base',
  'note_legali',
  'disclaimer_text',
  'gdpr_note',
  'privacy_note',
  'cookie_policy',
])

export async function GET() {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) return NextResponse.json(DEMO_BRAND)
    const cid = await requireClienteId()
    const row = await q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [cid])
    return NextResponse.json(row[0] || null)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })
    const cid = await requireClienteId()
    const body = await request.json() as Record<string, unknown>

    // Upsert: insert if not exists, update if exists
    const existing = await q('SELECT id FROM brand WHERE cliente_id = $1 LIMIT 1', [cid])

    if (!existing.length) {
      await q(
        `INSERT INTO brand (cliente_id, brand_name, settore, sito_url, tono_voce, target, promessa_brand,
          colori_brand, parole_da_usare, parole_da_evitare, emoji_policy, hashtag_base, cta_base, note_legali,
          disclaimer_text, gdpr_note, privacy_note, cookie_policy)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          cid,
          body.brand_name || '',
          body.settore || null,
          body.sito_url || null,
          body.tono_voce || null,
          body.target || null,
          body.promessa_brand || null,
          body.colori_brand || null,
          body.parole_da_usare || null,
          body.parole_da_evitare || null,
          body.emoji_policy || null,
          body.hashtag_base || null,
          body.cta_base || null,
          body.note_legali || null,
          body.disclaimer_text || null,
          body.gdpr_note || null,
          body.privacy_note || null,
          body.cookie_policy || null,
        ],
      )
    } else {
      const fields: string[] = []
      const params: unknown[] = []
      for (const [key, val] of Object.entries(body)) {
        if (!BRAND_UPDATE_COLUMNS.has(key)) continue
        params.push(val)
        fields.push(`${key} = $${params.length}`)
      }
      if (!fields.length) return NextResponse.json({ error: 'niente da aggiornare' }, { status: 400 })
      params.push(cid)
      await q(`UPDATE brand SET ${fields.join(', ')} WHERE cliente_id = $${params.length}`, params)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
