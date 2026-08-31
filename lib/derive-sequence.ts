import { MEDIA_PER_FORMATO } from '@/lib/media-requirements'

// ─────────────────────────────────────────────────────────────────────────
// SEQUENZA DERIVATA DAI MEDIA GIA ASSEGNATI
//
// Il contratto narrativo pretende che un carosello dichiari le sue slide, un
// Reel le sue 5 scene, una Story i suoi 3 frame. Ha senso quando il contenuto
// nasce dal nulla: la sequenza e il progetto di cosa verra prodotto.
//
// Non ha senso quando le creativita ESISTONO GIA. Con una cartella campagna
// importata, il carosello E quelle cinque immagini in quell'ordine, ognuna con
// il suo testo gia impresso: chiedere all'AI di descriverle e chiederle di
// raccontare una cosa che e gia sul disco, e bocciare il contenuto se non lo fa
// significa fermare un carosello completo per una didascalia interna che
// nessuno pubblichera mai. E successo su quattro caroselli con 5 immagini
// ciascuno, fermi con "servono 5-10 slide narrative (attuali: 0)".
//
// Qui la sequenza si deriva dai media assegnati: un elemento per file, in
// ordine, con il ruolo che quella posizione ha nella struttura del formato. Non
// si inventa copy: si dichiara cio che c'e gia.
//
// Modulo PURO: nessun DB, nessuna rete.
// ─────────────────────────────────────────────────────────────────────────

export type DerivedItem = {
  numero: number
  ruolo: string
  media: string
  // Nota esplicita: questa voce descrive un file gia prodotto, non un progetto.
  origine: 'media_finale'
}

// Ruoli per posizione, dalla struttura documentata di ogni formato.
const RUOLI_CAROSELLO = ['cover', 'problema', 'sviluppo', 'prova', 'payoff', 'approfondimento', 'esempio', 'recap', 'obiezione', 'cta'] as const
const RUOLI_REEL = ['hook', 'tensione', 'prova', 'payoff', 'cta_loop'] as const
const RUOLI_STORY = ['apertura', 'sviluppo', 'risoluzione'] as const

function normalizza(formato: unknown): string {
  const f = String(formato || '').trim().toLowerCase()
  if (f === 'carosello') return 'carousel'
  if (f === 'short' || f === 'video') return 'reel'
  return f
}

function isVideo(url: string): boolean {
  return url.split('?')[0].toLowerCase().endsWith('.mp4')
}

// Ruoli di un carosello: la prima slide e sempre la cover, l'ultima sempre la
// CTA. Le intermedie prendono i ruoli di sviluppo nell'ordine.
function ruoliCarosello(n: number): string[] {
  if (n <= 0) return []
  if (n === 1) return ['cover']
  const centro = RUOLI_CAROSELLO.slice(1, -1)
  const intermedi = Array.from({ length: Math.max(0, n - 2) }, (_, i) => centro[i % centro.length])
  return ['cover', ...intermedi, 'cta']
}

// `media`: gli URL gia assegnati al contenuto, in ordine (link_media_1..10).
// Ritorna [] quando la derivazione non e possibile o non e lecita: il chiamante
// deve lasciare che il cancello narrativo faccia il suo lavoro, non forzare.
export function deriveSequenceFromMedia(formato: unknown, media: string[]): DerivedItem[] {
  const f = normalizza(formato)
  const immagini = (media || []).map(u => String(u || '').trim()).filter(Boolean)
  if (!immagini.length) return []

  if (f === 'carousel') {
    const regola = MEDIA_PER_FORMATO.carousel
    const soloImmagini = immagini.filter(u => !isVideo(u))
    // Sotto il minimo non e un carosello: il cancello deve continuare a dirlo.
    if (soloImmagini.length < (regola.min ?? 3)) return []
    const usate = soloImmagini.slice(0, regola.max ?? 10)
    const ruoli = ruoliCarosello(usate.length)
    return usate.map((url, i) => ({ numero: i + 1, ruolo: ruoli[i], media: url, origine: 'media_finale' }))
  }

  if (f === 'reel') {
    const scene = immagini.filter(u => !isVideo(u))
    // Un Reel gia montato (MP4) non ha scene da dichiarare, e cinque immagini
    // sono la sola forma in cui un Reel-da-foto esiste davvero.
    if (scene.length !== RUOLI_REEL.length) return []
    return scene.map((url, i) => ({ numero: i + 1, ruolo: RUOLI_REEL[i], media: url, origine: 'media_finale' }))
  }

  if (f === 'story') {
    const frame = immagini.filter(u => !isVideo(u))
    if (frame.length !== RUOLI_STORY.length) return []
    return frame.map((url, i) => ({ numero: i + 1, ruolo: RUOLI_STORY[i], media: url, origine: 'media_finale' }))
  }

  return []
}
