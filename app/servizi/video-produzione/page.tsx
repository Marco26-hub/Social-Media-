import type { Metadata } from 'next'
import { Clapperboard } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'

// Riprese in azienda: l'anello che mancava. Fino a ieri montavamo il materiale
// che il cliente girava da solo, con i limiti che aveva. Qui la materia prima
// la produciamo noi, con un fotografo e — quando serve — una persona davanti
// alla camera.

const path = '/servizi/video-produzione'
const title = 'Riprese video in azienda con fotografo e volto | SWA'
const description = 'Veniamo da te a girare: fotografo, luci e attrezzatura. Con la possibilità di un volto, uomo o donna, davanti alla camera. Montaggio e pubblicazione sono già nel piano social.'

export const metadata: Metadata = {
  title,
  description,
  keywords: ['riprese video aziendali', 'video per social', 'fotografo aziendale', 'reel professionali', 'volto per i video', 'produzione video PMI'],
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
}

const config = {
  path,
  eyebrow: 'Riprese in azienda',
  title: 'Il girato professionale che ai tuoi video mancava.',
  lead: 'Un video fatto col telefono si riconosce in mezzo secondo, e il tuo lavoro merita di più. Veniamo da te con fotografo, luci e attrezzatura, e giriamo il materiale di settimane in mezza giornata. Se davanti alla camera non ci vuoi stare tu, ci mettiamo un volto: uomo o donna, lo scegli tu.',
  serviceName: 'Riprese video in azienda',
  serviceType: 'Produzione video e fotografica in sede per contenuti social',
  promise: 'Materiale girato bene, pensato per il verticale e tagliato sui formati che pubblichiamo. Le riprese chiudono il cerchio: prima montavamo quello che avevi, ora produciamo anche la materia prima.',
  priceNote: 'Preventivo su misura: dipende da mezza giornata o giornata intera, dalla presenza di un volto e dal numero di location. Definito prima delle riprese, senza sorprese in fattura.',
  offerHighlight: 'Settimane di contenuti in mezza giornata',
  primaryCtaLabel: 'Parliamo delle riprese',
  primaryCtaHref: '/contatti',
  icon: Clapperboard,
  signals: ['Fotografo e attrezzatura inclusi', 'Volto maschile o femminile a scelta', 'Girato pensato per il formato verticale'],
  outcomes: [
    { title: 'Qualità', text: 'Luce, audio e stabilità sono la differenza fra un video che sembra tuo e uno che sembra improvvisato.' },
    { title: 'Quantità', text: 'Una sessione produce il materiale per settimane: si gira a blocchi, non un video alla volta.' },
    { title: 'Continuità', text: 'Il girato entra nel piano editoriale e viene montato e pubblicato da noi, senza passaggi di mano.' },
  ],
  deliverablesTitle: 'Che cosa succede il giorno delle riprese.',
  deliverablesIntro: 'Non arriviamo a improvvisare. Il piano di quello che si gira esiste prima, perché sappiamo già che cosa andrà pubblicato nelle settimane successive.',
  deliverables: [
    { title: 'Piano di ripresa', text: 'Prima del giorno decidiamo scene, messaggi e formati: si arriva sapendo che cosa serve, e si evita di rigirare.' },
    { title: 'Fotografo e attrezzatura', text: 'Camera, ottiche, luci e microfoni. Non è un telefono su un treppiede: è una troupe leggera che entra e non ti blocca il lavoro.' },
    { title: 'Un volto, se lo vuoi', text: 'Puoi comparire tu, può farlo una persona del tuo staff, oppure portiamo noi un volto professionista, uomo o donna.' },
    { title: 'Ambiente e lavorazione', text: 'Il posto, i gesti, i dettagli del mestiere. È il materiale che rende un profilo credibile anche senza parlare.' },
    { title: 'Foto dallo stesso set', text: 'Dalla stessa sessione escono anche gli scatti per post, copertine e sito, senza organizzare un secondo giorno.' },
    { title: 'Consegna e montaggio', text: 'Il girato entra nel piano: montaggio, sottotitoli e pubblicazione sono già compresi nel piano social attivo.' },
  ],
  process: [
    { number: '01', title: 'Sopralluogo', text: 'Guardiamo spazi, luce naturale e orari in cui si può girare senza fermare l’attività.' },
    { number: '02', title: 'Piano di ripresa', text: 'Scene, messaggi e formati decisi prima, in base al piano editoriale dei mesi successivi.' },
    { number: '03', title: 'Giornata di riprese', text: 'Mezza giornata o giornata intera, con fotografo e, se previsto, il volto scelto.' },
    { number: '04', title: 'Montaggio e uscita', text: 'Selezione, montaggio, sottotitoli e pubblicazione dentro il calendario che già gestiamo.' },
  ],
  faq: [
    { q: 'Devo comparire io nei video?', a: 'No. Puoi comparire tu, può farlo qualcuno del tuo staff, oppure portiamo un volto professionista. La scelta fra volto maschile o femminile la fai tu, in base a chi parla ai tuoi clienti.' },
    { q: 'Quanto dura una sessione?', a: 'In genere mezza giornata basta per il materiale di diverse settimane. La giornata intera serve quando ci sono più location, più persone o un volto esterno da far lavorare su più scene.' },
    { q: 'Devo chiudere l’attività per girare?', a: 'No, e non lo consigliamo: le riprese fatte mentre si lavora sono le più credibili. Le fasce orarie si concordano in sopralluogo, per stare fuori dai momenti di punta.' },
    { q: 'Il montaggio è compreso?', a: 'Montaggio e pubblicazione fanno parte del piano social attivo. Le riprese sono la produzione della materia prima: si sommano al piano, non lo sostituiscono.' },
    { q: 'Le foto sono incluse?', a: 'Sì. Dalla stessa sessione escono anche gli scatti utilizzabili per post, copertine e sito, senza organizzare un secondo giorno.' },
    { q: 'Quanto costa?', a: 'Dipende dalla durata, dalla presenza di un volto e dal numero di location. Il preventivo viene definito prima delle riprese, con quello che è compreso scritto per esteso.' },
  ],
  related: [
    { href: '/servizi/gestione-social-media', label: 'Gestione social' },
    { href: '/pacchetti', label: 'Piani social' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
  ],
} satisfies MarketingDetailConfig

export default function VideoProduzionePage() { return <MarketingDetailPage config={config} /> }
