import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import { Clapperboard } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { VIDEO_CONSEGNA, VIDEO_ESCLUSO, VIDEO_PACCHETTI, euroVideo } from '@/lib/video-listino'
import { SITE_URL } from '@/lib/site-config'
import { euro } from '@/lib/euro'

// Riprese in azienda: l’anello che mancava. Fino a ieri montavamo il materiale
// che il cliente girava da solo, con i limiti che aveva. Qui la materia prima
// la produciamo noi, con un fotografo e — quando serve — una persona davanti
// alla camera.

const path = '/servizi/video-produzione'
const title = 'Riprese video in azienda con fotografo e volto | SWA'
const description = 'Veniamo da te a girare con fotografo, luci, audio e ottiche, e se serve un volto davanti alla camera. Montaggio e pubblicazione sono già nel piano social.'

export const metadata: Metadata = {
  title,
  description,
  keywords: ['riprese video aziendali', 'video per social', 'fotografo aziendale', 'reel professionali', 'volto per i video', 'produzione video PMI'],
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website' , images: anteprimaOg('/servizi/video-produzione')},
  twitter: { card: 'summary_large_image', title, description },
}

const config = {
  path,
  eyebrow: 'Riprese in azienda',
  title: 'Strumenti professionali, a casa tua.',
  lead: 'Un telefono recente gira benissimo, e non è lì che si perde. La differenza la fanno gli strumenti intorno alla camera: illuminazione controllata, microfoni dedicati, stabilizzazione e ottiche, con qualcuno che sa usarli. Veniamo da te con fotografo, luci e attrezzatura, e giriamo il materiale di settimane in mezza giornata. Se davanti alla camera non ci vuoi stare tu, ci mettiamo un volto: uomo o donna, lo scegli tu.',
  serviceName: 'Riprese video in azienda',
  serviceType: 'Produzione video e fotografica in sede per contenuti social',
  promise: 'Materiale girato bene, pensato per il verticale e tagliato sui formati che pubblichiamo. Le riprese chiudono il cerchio: prima montavamo quello che avevi, ora produciamo anche la materia prima.',
  priceNote: 'Quattro canoni mensili, da 5 a 20 video al mese, distribuiti sulle settimane. Il prezzo comprende lo spostamento nell’area concordata; pedaggi, parcheggi e trasferte fuori area sono esclusi e indicati prima. Allestimenti particolari o più location si quotano dopo il sopralluogo.',
  offerHighlight: 'Settimane di contenuti in mezza giornata',
  primaryCtaLabel: 'Parliamo delle riprese',
  primaryCtaHref: 'https://wa.me/393477196603?text=Ciao%21%20Vorrei%20parlare%20di%20riprese%20video%20in%20azienda%20con%20Social%20Web%20Automation.',
  icon: Clapperboard,
  signals: ['Illuminazione, audio e ottiche professionali', 'Volto maschile o femminile a scelta', 'Girato pensato per il formato verticale'],
  outcomes: [
    { title: 'Strumenti', text: 'Illuminazione controllata, microfoni dedicati, stabilizzazione e ottiche: la dotazione che cambia il risultato a parità di soggetto.' },
    { title: 'Quantità', text: 'Una sessione produce il materiale per settimane: si gira a blocchi, non un video alla volta.' },
    { title: 'Continuità', text: 'Il girato entra nel piano editoriale e viene montato e pubblicato da noi, senza passaggi di mano.' },
  ],
  deliverablesTitle: 'Che cosa succede il giorno delle riprese.',
  deliverablesIntro: 'Non arriviamo a improvvisare. Il piano di quello che si gira esiste prima, perché sappiamo già che cosa andrà pubblicato nelle settimane successive.',
  deliverables: [
    { title: 'Piano di ripresa', text: 'Prima del giorno decidiamo scene, messaggi e formati: si arriva sapendo che cosa serve, e si evita di rigirare.' },
    { title: 'Fotografo e attrezzatura', text: 'Ottiche, luci e microfoni, e soprattutto qualcuno che sa dove metterli. Una troupe leggera che entra e non ti blocca il lavoro.' },
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
    { q: 'Quanto dura una sessione di riprese?', a: 'Mezza giornata basta quasi sempre per il materiale di diverse settimane, perché si gira a blocchi invece che un contenuto alla volta. La giornata intera serve quando ci sono più location, più persone davanti alla camera o prodotti da allestire. La durata la fissiamo nel sopralluogo, prima del preventivo.' },
    { q: 'Devo comparire io nei video?', a: 'No. Puoi comparire tu, può farlo una persona del tuo staff, oppure portiamo noi un volto professionista, uomo o donna. La scelta si fa guardando a chi parla il tuo servizio, non per gusto: un formato senza volto portato avanti con continuità batte un formato parlato abbandonato dopo tre settimane.' },
    { q: 'Devo chiudere l’attività per girare?', a: 'No, e non lo consigliamo: le riprese fatte mentre si lavora sono le più credibili. Nel sopralluogo scegliamo le fasce in cui l’attività è più tranquilla e giriamo a blocchi, senza fermare i clienti. È il motivo per cui il sopralluogo viene prima del preventivo e non dopo.' },
    { q: 'Il montaggio è compreso nel prezzo delle riprese?', a: 'Montaggio, sottotitoli e pubblicazione fanno parte del piano social attivo, non delle riprese. Le riprese producono la materia prima; il piano la trasforma in uscite programmate. Si sommano, non si sostituiscono: senza un piano attivo il girato resta materiale che qualcuno deve montare.' },
    { q: 'Che attrezzatura portate?', a: 'Fotografo, luci, microfoni dedicati, stabilizzazione e ottiche. La differenza in un video aziendale non la fa la risoluzione della fotocamera: la fanno luce controllata, audio pulito e inquadrature stabili, che sono esattamente le tre cose che mancano quando si gira in fretta con quello che c’è.' },
    { q: 'Escono anche le foto o solo i video?', a: 'Dalla stessa sessione escono anche gli scatti fotografici, ed è uno dei motivi per cui conviene: le immagini servono ai post, alle copertine e al sito, e organizzare un secondo giorno con un fotografo costa più della mezza giornata in cui si fa tutto insieme.' },
    { q: 'Quanto costano le riprese?', a: `Ci sono quattro pacchetti, e il canone scende in proporzione man mano che i video aumentano: ${VIDEO_PACCHETTI.map(v => `${v.nome} ${v.video} video a ${euro(v.prezzo)}`).join(', ')}. Sono canoni mensili e si disdicono con il preavviso scritto nel contratto. Un singolo video promozionale su misura parte da 800 € sul mercato italiano: qui si gira a lotto, cinque video per sessione invece di uno alla volta, ed è questa la ragione della differenza. Prezzi IVA esclusa, spostamento nell’area concordata compreso. Allestimenti particolari, più location o un volto professionista si quotano dopo il sopralluogo.` },
    { q: 'I video restano miei?', a: 'Sì, il girato e le foto prodotte sono tuoi. Li usi dove vuoi — social, sito, annunci, presentazioni — anche se un domani cambi fornitore. Quello che paghi è materiale che resta, non un accesso che scade con l’abbonamento.' },
  ],
  related: [
    { href: '/contatti', label: 'Parla con noi' },
    { href: '/servizi/gestione-social-media', label: 'Gestione social' },
    { href: '/pacchetti', label: 'Piani social' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
  ],
  // Era l'unico servizio senza un numero: diceva «su preventivo» mentre il
  // costo per video e' noto e stabile, perche' si gira a lotto.
  tabella: {
    occhiello: 'Pacchetti',
    h2: 'Quanto costa girare, a pacchetto',
    intro:
      VIDEO_CONSEGNA + ' Una sessione produce cinque video: è per questo che il costo per video sta molto sotto quello di un video promozionale su misura, che in Italia parte da 800 €. Canoni mensili, IVA esclusa, spostamento nell’area concordata compreso.' + VIDEO_ESCLUSO,
    caption: 'Pacchetti mensili di produzione video verticale: video consegnati, sessioni di ripresa e canone',
    colonne: ['Pacchetto', 'Prezzo', 'Che cosa ricevi'],
    righe: VIDEO_PACCHETTI.map(p => [
      p.nome,
      euroVideo(p),
      `${p.video} video al mese in ${p.sessioni} ${p.sessioni === 1 ? 'sessione di ripresa' : 'sessioni di ripresa'} · ${p.perChi.toLowerCase()}`,
    ]),
  },
  startingPrice: String(VIDEO_PACCHETTI[0].prezzo),
  priceCadence: '/mese',
} satisfies MarketingDetailConfig

export default function VideoProduzionePage() { return <MarketingDetailPage config={config} /> }
