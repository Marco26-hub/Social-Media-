import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { demoContenuti } from '@/lib/demo-data'
import { getPackage } from '@/lib/packages'
import { auditPianoCiclo } from '@/lib/plan-audit'

export const dynamic = 'force-dynamic'

// "Oggi" secondo il fuso del cliente: il ciclo del piano è fatto di giorni, non
// di istanti, e a mezzanotte il confine deve spostarsi con lui, non con UTC.
function oggiNelFuso(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function addGiorni(iso: string, giorni: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + giorni * 86400000).toISOString().slice(0, 10)
}

export async function POST() {
  try {
    const cid = await requireClienteId()

    if (isDemo() || !dbReady()) {
      const oggi = oggiNelFuso('Europe/Rome')
      return NextResponse.json({
        ok: true,
        demo: true,
        ...auditPianoCiclo({
          rows: demoContenuti as unknown as Record<string, unknown>[],
          quota: 0,
          pkg: null,
          oggi,
        }),
      })
    }

    const clientRows = await q(
      'SELECT contenuti_mese, timezone, pacchetto FROM clienti WHERE id = $1 LIMIT 1',
      [cid],
    ) as Record<string, unknown>[]
    if (!clientRows.length) return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 })

    const timezone = String(clientRows[0].timezone || 'Europe/Rome')
    const oggi = oggiNelFuso(timezone)
    // Finestra di lettura larga: il ciclo vero (28 giorni) lo sceglie la libreria
    // dai contenuti reali. Serve guardare anche indietro perché un ciclo può
    // essere partito la settimana scorsa.
    const rows = await q(
      `SELECT id, id_contenuto, data_pubblicazione, canale, formato, status, note,
              hook, tema, caption, cta, funnel_stage, obiettivo, production_notes,
              content_key, campaign_content_key,
              link_media_1, link_media_2, link_media_3, link_media_4, link_media_5,
              link_media_6, link_media_7, link_media_8, link_media_9, link_media_10
         FROM calendario
        WHERE cliente_id = $1
          AND data_pubblicazione >= $2::date
          AND data_pubblicazione <= $3::date
        ORDER BY data_pubblicazione, ora_pubblicazione`,
      [cid, addGiorni(oggi, -35), addGiorni(oggi, 60)],
    ) as Record<string, unknown>[]

    const report = auditPianoCiclo({
      rows,
      quota: Math.max(0, Number(clientRows[0].contenuti_mese) || 0),
      pkg: getPackage(clientRows[0].pacchetto),
      oggi,
    })

    return NextResponse.json({ ok: true, ...report })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Controllo del piano fallito'
    const status = /non autenticato|non autorizzato|cliente/i.test(message) ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
