import type { LucideIcon } from 'lucide-react'
import { Square, Layers, Film, Clock, Video, Pin, FileText, MessageSquare } from 'lucide-react'

export type PlatformKey = 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'linkedin' | 'youtube_shorts' | 'blog' | 'threads' | 'x'

export type FormatoConfig = {
  id: string
  nome: string
  desc: string
  icon: LucideIcon
  formato: string
  aspectRatio: string
  esempio: string
  goal: string
}

export type PlatformConfig = {
  key: PlatformKey
  nome: string
  emoji: string
  colorBg: string
  colorTxt: string
  gradient: string
  tagline: string
  descrizione: string
  canaleDb: string
  formati: FormatoConfig[]
}

export const PLATFORMS: Record<PlatformKey, PlatformConfig> = {
  instagram: {
    key: 'instagram',
    nome: 'Instagram',
    emoji: '📸',
    colorBg: 'bg-gradient-to-br from-pink-500 to-purple-600',
    colorTxt: 'text-pink-600',
    gradient: 'from-pink-50 via-rose-50 to-purple-50',
    tagline: 'Post, caroselli, reel e story',
    descrizione: 'Crea contenuti per il tuo profilo Instagram. Foto 1:1, caroselli swipe, video verticali 9:16, storie 24h.',
    canaleDb: 'instagram',
    formati: [
      { id: 'IG-POST',  nome: 'Post',     desc: 'Foto quadrata 1:1 con caption + hashtag',     icon: Square, formato: 'post',     aspectRatio: '1:1',   esempio: 'Mostra il prodotto in primo piano',     goal: 'Ispirare e convertire via link in bio' },
      { id: 'IG-CAR',   nome: 'Carosello',desc: '5-7 slide con hook, styling e CTA finale',   icon: Layers, formato: 'carousel', aspectRatio: '1:1',   esempio: '5 modi di abbinare i jeans',            goal: 'Educare e creare swipe con racconto' },
      { id: 'IG-REEL',  nome: 'Reel',     desc: 'Video verticale 9:16 da 15-30 secondi',      icon: Film,   formato: 'reel',     aspectRatio: '9:16', esempio: 'Tutorial styling rapido',               goal: 'Viralità e awareness' },
      { id: 'IG-STORY', nome: 'Story',    desc: 'Story 24h con sticker, link e interazioni',  icon: Clock,  formato: 'story',    aspectRatio: '9:16', esempio: 'Dietro le quinte / novità',              goal: 'Engagement quotidiano e traffico al sito' },
    ],
  },
  facebook: {
    key: 'facebook',
    nome: 'Facebook',
    emoji: '🔵',
    colorBg: 'bg-gradient-to-br from-blue-500 to-blue-700',
    colorTxt: 'text-blue-600',
    gradient: 'from-blue-50 via-sky-50 to-indigo-50',
    tagline: 'Pagina business e community',
    descrizione: 'Pubblica sulla pagina aziendale Facebook. Post landscape 1.91:1, album, video nativi 16:9 e reel.',
    canaleDb: 'facebook',
    formati: [
      { id: 'FB-POST', nome: 'Post',      desc: 'Post landscape 1.91:1 con link diretto',       icon: Square, formato: 'post',     aspectRatio: '1.91:1', esempio: 'Promo settimanale prodotto top',        goal: 'Informare e convertire con link nativo' },
      { id: 'FB-CAR',  nome: 'Carosello', desc: 'Album multi-immagine con didascalie',          icon: Layers, formato: 'carousel', aspectRatio: '1:1',    esempio: 'Collezione completa primavera',          goal: 'Mostrare la collezione completa' },
      { id: 'FB-VID',  nome: 'Video',     desc: 'Video landscape nativo 16:9',                  icon: Video,  formato: 'video',    aspectRatio: '16:9',   esempio: 'Presentazione prodotto dettagliata',    goal: 'Educare e dimostrare il prodotto' },
      { id: 'FB-REEL', nome: 'Reel',      desc: 'Reel verticale cross-post da Instagram',       icon: Film,   formato: 'reel',     aspectRatio: '9:16',   esempio: 'Tutorial breve cross-piattaforma',      goal: 'Cross-post awareness da IG' },
    ],
  },
  tiktok: {
    key: 'tiktok',
    nome: 'TikTok',
    emoji: '🎵',
    colorBg: 'bg-gradient-to-br from-gray-800 to-black',
    colorTxt: 'text-gray-900',
    gradient: 'from-gray-50 via-zinc-50 to-slate-50',
    tagline: 'Video virali e trend',
    descrizione: 'Crea video TikTok 9:16 con audio trending, hashtag virali, hook nei primi 2 secondi per Gen Z.',
    canaleDb: 'tiktok',
    formati: [
      { id: 'TT-VID',  nome: 'Video',     desc: 'Video 9:16 con trending audio, hook 0-2s',     icon: Video,  formato: 'video', aspectRatio: '9:16', esempio: 'POV: hai trovato il capo perfetto',      goal: 'Viralità con audio trending' },
      { id: 'TT-REEL', nome: 'Reel',      desc: 'Script 15-30s con format nativo TikTok',       icon: Film,   formato: 'reel',  aspectRatio: '9:16', esempio: 'GRWM con il nuovo outfit',               goal: 'Intrattenere con script virale' },
    ],
  },
  pinterest: {
    key: 'pinterest',
    nome: 'Pinterest',
    emoji: '📌',
    colorBg: 'bg-gradient-to-br from-red-500 to-red-700',
    colorTxt: 'text-red-600',
    gradient: 'from-red-50 via-rose-50 to-pink-50',
    tagline: 'Pin verticali e idee',
    descrizione: 'Pin verticali 2:3 con descrizione SEO e link prodotto. Ottimizzati per essere trovati su Pinterest search.',
    canaleDb: 'pinterest',
    formati: [
      { id: 'PIN-PIN', nome: 'Pin',       desc: 'Pin verticale 2:3 SEO-optimized + link',       icon: Pin,    formato: 'pin', aspectRatio: '2:3',  esempio: 'Outfit estate sostenibile 3 idee',      goal: 'Traffico organico dal search Pinterest' },
    ],
  },
  linkedin: {
    key: 'linkedin',
    nome: 'LinkedIn',
    emoji: '💼',
    colorBg: 'bg-gradient-to-br from-blue-700 to-blue-900',
    colorTxt: 'text-blue-800',
    gradient: 'from-sky-50 via-blue-50 to-indigo-50',
    tagline: 'B2B e thought leadership',
    descrizione: 'Post professionali e articoli lunghi per pubblico business. Tono autoritativo, insight di settore, zero emoji.',
    canaleDb: 'linkedin',
    formati: [
      { id: 'LI-POST', nome: 'Post',      desc: 'Post B2B con insight di settore, zero emoji',  icon: Square,   formato: 'post',     aspectRatio: '1:1',    esempio: 'Trend fashion 2026: cosa cambia nel B2B', goal: 'Autorevolezza e network professionale' },
      { id: 'LI-ART',  nome: 'Articolo',  desc: 'Articolo long-form thought leadership',         icon: FileText, formato: 'articolo', aspectRatio: '16:9',   esempio: 'Come l\'AI sta cambiando la moda retail', goal: 'Deep expertise e discussione' },
    ],
  },
  youtube_shorts: {
    key: 'youtube_shorts',
    nome: 'YouTube Shorts',
    emoji: '▶️',
    colorBg: 'bg-gradient-to-br from-red-600 to-red-800',
    colorTxt: 'text-red-700',
    gradient: 'from-red-50 via-rose-50 to-orange-50',
    tagline: 'Video corti verticali',
    descrizione: 'Short 9:16 fino a 60 secondi con titolo e descrizione SEO per la search YouTube.',
    canaleDb: 'youtube_shorts',
    formati: [
      { id: 'YT-SHORT', nome: 'Short',    desc: 'Video 9:16 con titolo SEO e tag ottimizzati',   icon: Film,   formato: 'short', aspectRatio: '9:16', esempio: 'Outfit del giorno: 3 idee veloci',        goal: 'Discoverability su YouTube search' },
    ],
  },
  blog: {
    key: 'blog',
    nome: 'Blog',
    emoji: '✍️',
    colorBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    colorTxt: 'text-amber-700',
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    tagline: 'SEO + GEO articoli lunghi',
    descrizione: 'Articoli 800-1200 parole ottimizzati SEO e GEO (citabilità ChatGPT, Perplexity). Con FAQ schema e link prodotti.',
    canaleDb: 'blog',
    formati: [
      { id: 'BLOG-ART', nome: 'Articolo', desc: '800-1200 parole SEO con FAQ e prodotti linkati', icon: FileText, formato: 'articolo', aspectRatio: '16:9', esempio: 'Come abbinare il blazer in lino: guida estate', goal: 'Rank organico + citabilità AI engines' },
    ],
  },
  threads: {
    key: 'threads',
    nome: 'Threads',
    emoji: '🧵',
    colorBg: 'bg-gradient-to-br from-gray-800 to-black',
    colorTxt: 'text-gray-900',
    gradient: 'from-gray-50 via-zinc-50 to-slate-50',
    tagline: 'Conversazioni autentiche',
    descrizione: 'Post conversazionali e foto-first per Threads. Tono casual e diretto, pochi hashtag, foto 1:1 o verticali 9:16. Cross-post naturale da Instagram.',
    canaleDb: 'threads',
    formati: [
      { id: 'TH-POST',  nome: 'Post',  desc: 'Post testuale conversazionale + foto 1:1, tono casual',  icon: MessageSquare, formato: 'post', aspectRatio: '1:1',  esempio: 'Dietro le quinte della tessitura, in modo autentico', goal: 'Conversazione e community organica' },
      { id: 'TH-PHOTO', nome: 'Foto',  desc: 'Foto verticale 9:16 con caption breve e diretta',        icon: Film,          formato: 'reel', aspectRatio: '9:16', esempio: 'Il foulard in movimento sul lago',                  goal: 'Awareness visiva foto-first' },
    ],
  },
  x: {
    key: 'x',
    nome: 'X',
    emoji: '✖️',
    colorBg: 'bg-gradient-to-br from-gray-900 to-black',
    colorTxt: 'text-gray-900',
    gradient: 'from-gray-50 via-zinc-50 to-slate-50',
    tagline: 'Conciso e tempestivo',
    descrizione: 'Post brevi e incisivi (max 280 caratteri) e thread con gancio nel primo tweet. Immagini 16:9 in timeline. Tono diretto, niente hashtag spam.',
    canaleDb: 'x',
    formati: [
      { id: 'X-POST',   nome: 'Post',   desc: 'Tweet conciso max 280 char + immagine 16:9',          icon: MessageSquare, formato: 'post',  aspectRatio: '16:9', esempio: 'Il lusso silenzioso della seta di Como, in una frase', goal: 'Reach e conversazione rapida' },
      { id: 'X-VIDEO',  nome: 'Video',  desc: 'Video breve 16:9 nativo con hook immediato',          icon: Video,         formato: 'video', aspectRatio: '16:9', esempio: 'Clip 15s sulla lavorazione artigianale',             goal: 'Engagement e visualizzazioni' },
    ],
  },
}

export const PLATFORM_LIST = Object.values(PLATFORMS)

export type { LucideIcon }
