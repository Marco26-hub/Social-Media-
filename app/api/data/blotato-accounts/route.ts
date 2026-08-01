import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAdmin, requireClienteAccess } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { getBlotatoKey } from '@/lib/blotato-key'
import {
  ACCOUNT_SETTING_PREFIX,
  SUBACCOUNT_SETTING_PREFIX,
  listBlotatoAccounts,
  planDestinations,
  type BlotatoAccount,
  type Destination,
} from '@/lib/blotato-accounts'
import { CANALE_TO_BLOTATO } from '@/lib/publish/blotato-map'

export const dynamic = 'force-dynamic'

// Configurazione delle destinazioni Blotato per cliente.
//
// Perché serve: un solo workspace Blotato contiene gli account social di PIÙ clienti
// (anche gestiti da altri sistemi esterni). Senza una scelta esplicita, "il primo
// account della piattaforma" è un sorteggio: un post di un cliente può finire sul
// profilo di un altro. Qui l'agenzia fissa, canale per canale, su QUALE account
// pubblicare; la scelta vive in settings (chiave `blotato_account_<canale>`).
//
// Questa route NON pubblica e NON tocca il calendario: legge /v2/accounts + settings
// (GET) e salva/cancella la sola riga di settings (PATCH).

// Errore di rete o key non valida verso Blotato: 502 con messaggio azionabile invece
// del 500 generico di apiError. L'utente deve capire che il problema è la key o il
// workspace, non un bug della pagina — e la UI resta in piedi con l'errore a video.
function blotatoUnreachable(e: unknown): NextResponse {
  const msg = e instanceof Error ? e.message : 'errore sconosciuto'
  return NextResponse.json(
    {
      error: `Lettura account Blotato fallita: ${msg.slice(0, 180)}`,
      destinations: [],
      accounts: [],
    },
    { status: 502 },
  )
}

// Etichetta leggibile di un account: è l'unico modo per distinguere a colpo d'occhio
// due account della stessa piattaforma appartenenti a clienti diversi.
function accountLabel(a: BlotatoAccount): string {
  const nome = (a.username || a.name || '').trim()
  return nome ? `${nome} (${a.platform})` : `${a.platform} · ${a.id}`
}

// Canali da configurare: quelli davvero usati dal cliente in calendario, più quelli
// che hanno già una scelta salvata (così una scelta resta visibile e modificabile
// anche se quel canale non è più a calendario). L'ordine segue CANALE_TO_BLOTATO,
// che filtra anche i non pubblicabili (es. 'blog': non è una piattaforma Blotato).
async function canaliDaConfigurare(clienteId: string): Promise<string[]> {
  const usati = await q(
    `SELECT DISTINCT canale FROM calendario WHERE cliente_id = $1 AND canale IS NOT NULL AND canale <> ''`,
    [clienteId],
  )
  const fissati = await q(
    'SELECT chiave FROM settings WHERE cliente_id = $1 AND starts_with(chiave, $2)',
    [clienteId, ACCOUNT_SETTING_PREFIX],
  )

  const visti = new Set<string>()
  for (const r of usati) visti.add(String((r as { canale?: unknown }).canale ?? '').trim().toLowerCase())
  for (const r of fissati) {
    visti.add(String((r as { chiave?: unknown }).chiave ?? '').slice(ACCOUNT_SETTING_PREFIX.length).trim().toLowerCase())
  }

  const canali = Object.keys(CANALE_TO_BLOTATO).filter(c => visti.has(c))
  // Cliente nuovo (calendario vuoto e nessuna scelta): mostriamo comunque tutti i
  // canali pubblicabili, altrimenti la pagina sarebbe vuota e non si potrebbe
  // preconfigurare nulla prima del primo contenuto.
  return canali.length ? canali : Object.keys(CANALE_TO_BLOTATO)
}

export async function GET(request: Request) {
  try {
    // Scegliere l'account di pubblicazione è configurazione dell'agenzia (decide dove
    // finiscono i post): admin + accesso a quel cliente, entrambi.
    await requireAdmin()
    const clienteId = new URL(request.url).searchParams.get('cliente_id')?.trim() || ''
    if (!clienteId) return NextResponse.json({ error: 'cliente_id richiesto' }, { status: 400 })
    await requireClienteAccess(clienteId)

    if (isDemo() || !dbReady()) return NextResponse.json({ destinations: [], accounts: [] })

    const key = await getBlotatoKey(clienteId)
    if (!key) {
      return NextResponse.json(
        {
          error: 'API key Blotato non configurata per questo cliente: inseriscila in Impostazioni (blotato_api_key) oppure nella env BLOTATO_API_KEY.',
          destinations: [],
          accounts: [],
        },
        { status: 400 },
      )
    }

    const canali = await canaliDaConfigurare(clienteId)

    let destinations: Destination[]
    let accounts: BlotatoAccount[]
    try {
      destinations = await planDestinations(key, clienteId, canali)
      accounts = await listBlotatoAccounts(key)
    } catch (e) {
      return blotatoUnreachable(e)
    }

    return NextResponse.json({
      destinations,
      // Lista piatta per le tendine della UI: l'utente sceglie fra TUTTI gli account
      // del workspace, non solo quelli che il resolver considera compatibili.
      accounts: accounts.map(a => ({ id: a.id, platform: a.platform, label: accountLabel(a) })),
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin() // stessa autorizzazione della GET
    const body = await request.json() as Record<string, unknown>
    const clienteId = String(body.cliente_id ?? '').trim()
    const canale = String(body.canale ?? '').trim().toLowerCase()
    const accountId = String(body.account_id ?? '').trim()

    if (!clienteId) return NextResponse.json({ error: 'cliente_id richiesto' }, { status: 400 })
    await requireClienteAccess(clienteId)

    // Solo canali realmente pubblicabili: fissare un account per 'blog' o per un
    // canale inventato creerebbe una setting che nessuno leggerà mai.
    const platform = CANALE_TO_BLOTATO[canale]
    if (!platform) {
      return NextResponse.json(
        { error: `Canale '${canale || '(vuoto)'}' non pubblicabile via Blotato. Canali validi: ${Object.keys(CANALE_TO_BLOTATO).join(', ')}` },
        { status: 400 },
      )
    }

    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })

    const chiave = `${ACCOUNT_SETTING_PREFIX}${canale}`

    // account_id vuoto = "torna a non configurato": si cancella la riga invece di
    // salvare una stringa vuota, così getPinnedAccountId non trova nulla di ambiguo.
    // Pagina/bacheca dentro l'account (Facebook Page, board Pinterest, Company Page):
    // un account può contenerne più d'una, e anche lì la scelta non va indovinata.
    const subaccountId = String(body.subaccount_id ?? '').trim()
    const chiaveSub = `${SUBACCOUNT_SETTING_PREFIX}${canale}`

    if (!accountId) {
      // Via l'account, via anche la sua pagina: lasciarla orfana significherebbe
      // riproporla come "fissata" al prossimo account scelto.
      await q('DELETE FROM settings WHERE cliente_id = $1 AND chiave = ANY($2)', [clienteId, [chiave, chiaveSub]])
      return NextResponse.json({ ok: true })
    }

    const key = await getBlotatoKey(clienteId)
    if (!key) {
      return NextResponse.json(
        { error: 'API key Blotato non configurata per questo cliente: impossibile verificare l\'account scelto.' },
        { status: 400 },
      )
    }

    // Verifica contro il workspace REALE: senza questo controllo si potrebbe salvare
    // un id inventato (post che falliscono al primo invio) o l'account di un'altra
    // piattaforma (post sul profilo sbagliato) — proprio ciò che questa pagina evita.
    let accounts: BlotatoAccount[]
    try {
      accounts = await listBlotatoAccounts(key, true)
    } catch (e) {
      return blotatoUnreachable(e)
    }

    const account = accounts.find(a => a.id === accountId)
    if (!account) {
      return NextResponse.json(
        { error: `Account Blotato '${accountId}' non presente nel workspace: ricarica la pagina e riseleziona.` },
        { status: 400 },
      )
    }
    if (account.platform !== platform) {
      return NextResponse.json(
        { error: `L'account scelto è di piattaforma '${account.platform}', ma il canale '${canale}' pubblica su '${platform}'.` },
        { status: 400 },
      )
    }

    await q(
      `INSERT INTO settings (cliente_id, chiave, valore, descrizione)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cliente_id, chiave) DO UPDATE SET valore = EXCLUDED.valore, updated_at = now()`,
      [clienteId, chiave, accountId, `Account Blotato fissato per il canale ${canale} (${accountLabel(account)})`],
    )

    if (subaccountId) {
      // Stessa verifica dell'account: la pagina deve esistere DENTRO l'account scelto,
      // altrimenti si fisserebbe la pagina di un altro profilo.
      const sub = account.subaccounts.find(s => s.id === subaccountId)
      if (!sub) {
        return NextResponse.json(
          { error: `La pagina/bacheca scelta non appartiene all'account ${accountLabel(account)}: ricarica la pagina e riseleziona.` },
          { status: 400 },
        )
      }
      await q(
        `INSERT INTO settings (cliente_id, chiave, valore, descrizione)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (cliente_id, chiave) DO UPDATE SET valore = EXCLUDED.valore, updated_at = now()`,
        [clienteId, chiaveSub, subaccountId, `Pagina/bacheca Blotato fissata per il canale ${canale} (${sub.name || sub.id})`],
      )
    } else {
      await q('DELETE FROM settings WHERE cliente_id = $1 AND chiave = $2', [clienteId, chiaveSub])
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
