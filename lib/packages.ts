import type { ContentQuality } from '@/lib/content-quality'

// ─────────────────────────────────────────────────────────────────────────
// PACCHETTI COMMERCIALI (source of truth). Il cliente acquista un pacchetto e
// il piano editoriale "del pacchetto" genera ESATTAMENTE i contenuti compresi
// (numero, mix formati, n° social, qualità). La modalità "piano libero" resta
// invariata: lì l'operatore decide tutto a mano.
//
// Aggiorna QUI i pacchetti: prezzo, contenuti/mese, mix, qualità. La pagina
// piano e la generazione backend leggono da qui.
// ─────────────────────────────────────────────────────────────────────────

export type PackageId = 'presenza' | 'crescita'

export type PackageSpec = {
  id: PackageId
  nome: string
  prezzoMese: number
  // ATTENZIONE — due letture diverse, volutamente non allineate:
  //  · commercialmente il sito vende questa quota PER OGNI SOCIAL
  //    (Crescita: 24 a canale su 2 canali = 48 pubblicazioni);
  //  · il generatore la usa invece come TOTALE del periodo, quindi senza una
  //    cartella campagna importata produce 24 contenuti complessivi, non 48.
  // Il raddoppio arriva oggi solo dall'import da cartella, che crea una
  // pubblicazione per ogni gruppo social+contenuto e scavalca questa quota.
  contenutiMese: number
  postCaroselli: number     // quota post + caroselli
  reelBrevi: number         // quota reel / stories / short
  social: number            // n° social coordinati
  quality: ContentQuality   // livello qualità dei contenuti
  articoloBlog: boolean      // include 1 articolo SEO+GEO (generato nella sezione Blog)
  descrizione: string
}

export type PackagePeriod = 'settimanale' | 'mensile'
export type PackagePeriodMix = {
  totale: number
  postCaroselli: number
  reelBrevi: number
  caroselli: number
  postSingoli: number
  stories: number
  reelVideo: number
}

const SETTIMANE_PER_MESE = 4.33
const CAROSELLI_OGNI = 3

export const PACKAGES: Record<PackageId, PackageSpec> = {
  presenza: {
    id: 'presenza',
    nome: 'Presenza',
    prezzoMese: 490,
    contenutiMese: 16,
    postCaroselli: 12,
    reelBrevi: 4,
    social: 2,
    quality: 'medium',
    articoloBlog: false,
    descrizione: '16 contenuti/mese per ogni social (12 post/caroselli + 4 reel o stories), fino a 2 social = 32 pubblicazioni.',
  },
  crescita: {
    id: 'crescita',
    nome: 'Crescita',
    prezzoMese: 990,
    contenutiMese: 24,
    postCaroselli: 18,
    reelBrevi: 6,
    social: 2,
    quality: 'high',
    articoloBlog: true,
    descrizione: '24 contenuti/mese per ogni social (18 post/caroselli + 6 reel o short), fino a 2 social = 48 pubblicazioni, + 1 articolo SEO/GEO.',
  },
}

export const PACKAGE_LIST: PackageSpec[] = [PACKAGES.presenza, PACKAGES.crescita]

// Risolve un id pacchetto (tollerante a maiuscole/spazi). null se non valido.
export function getPackage(id: unknown): PackageSpec | null {
  if (typeof id !== 'string') return null
  const key = id.trim().toLowerCase()
  return (PACKAGES as Record<string, PackageSpec>)[key] ?? null
}

// Unica aritmetica condivisa da UI, fabbisogno media e backend generativo.
// `quotaMensile` permette alla scheda cliente di sovrascrivere il default del
// pacchetto senza creare numeri diversi tra riepilogo e contenuti inseriti.
export function packageContentCount(pkg: PackageSpec, periodo: PackagePeriod, quotaMensile?: number | null): number {
  const mensile = Number.isFinite(quotaMensile) && Number(quotaMensile) > 0
    ? Math.round(Number(quotaMensile))
    : pkg.contenutiMese
  return periodo === 'mensile' ? mensile : Math.ceil(mensile / SETTIMANE_PER_MESE)
}

export function packageMixForPeriod(pkg: PackageSpec, periodo: PackagePeriod, quotaMensile?: number | null): PackagePeriodMix {
  const totale = packageContentCount(pkg, periodo, quotaMensile)
  const reelBrevi = Math.min(totale, Math.round((pkg.reelBrevi / pkg.contenutiMese) * totale))
  const postCaroselli = Math.max(0, totale - reelBrevi)
  const caroselli = Math.floor(postCaroselli / CAROSELLI_OGNI)
  // Una quota stabile dei contenuti brevi diventa Story; il resto Reel/Short.
  // La regola è condivisa con UI, media e prompt: mai più un gruppo ambiguo.
  const stories = reelBrevi > 1 ? Math.max(1, Math.round(reelBrevi / 3)) : 0
  return {
    totale,
    postCaroselli,
    reelBrevi,
    caroselli,
    postSingoli: postCaroselli - caroselli,
    stories,
    reelVideo: reelBrevi - stories,
  }
}
