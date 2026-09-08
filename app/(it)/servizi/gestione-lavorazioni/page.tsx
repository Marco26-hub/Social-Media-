import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import { ClipboardCheck } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { CANONE } from '@/lib/prezzi-ingresso'
import { SITE_URL } from '@/lib/site-config'
import { metodoServizio } from '@/lib/metodo'

// Il metodo che vendiamo alle imprese che lavorano fuori sede: il sito che porta
// la richiesta, l’applicazione con cui la squadra chiude il lavoro sul posto e il
// pannello da cui l’ufficio approva. I testi descrivono solo funzioni che esistono
// nel prodotto: il fact-check contro il codice ha tolto tutto il resto.

const title = 'Sito, lavorazioni e rapportini per imprese di pulizie | SWA'
const description =
  'Il sito che porta le richieste, l’app con cui la squadra chiude il lavoro sul posto e il pannello da cui l’ufficio approva i rapportini firmati.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/servizi/gestione-lavorazioni` },
  openGraph: { title, description, url: `${SITE_URL}/servizi/gestione-lavorazioni`, type: 'website' , images: anteprimaOg('/servizi/gestione-lavorazioni')},
  twitter: { card: 'summary_large_image', title, description },
}

const config: MarketingDetailConfig = {
  path: '/servizi/gestione-lavorazioni',
  eyebrow: 'Rapportini di intervento',
  title: 'Le richieste arrivano dal sito, il lavoro si chiude sul posto.',
  lead:
    'Chi lavora fuori compila il rapporto sul telefono, con la checklist del servizio, le ore, le foto e la firma del cliente, e chi sta in ufficio lo vede arrivare, lo approva oppure lo contesta con un motivo scritto. Il sito che raccoglie le richieste fa parte dello stesso progetto, così sito, applicazione e pannello li segue un fornitore solo, con un referente solo.',
  serviceName: 'Rapportini di intervento',
  serviceType: 'Sito web e applicazione di campo per rapporti di intervento',
  promise:
    'Le richieste arrivano dal modulo del sito alla casella che indichi tu, il rapporto si chiude sul posto con ore, foto e firma, e l’ufficio approva o contesta con un motivo scritto. Non promettiamo risultati commerciali: mettiamo per iscritto che cosa fa il sistema e che cosa non fa.',
  priceNote:
    `Il sistema completo va a preventivo, perché dipende dal numero di operatori e dai modelli di scheda da scrivere per il tuo servizio. Il sito parte da ${CANONE.web} per una landing semplice o un sito base, con proprietà del sito dopo 12 mesi di canone; un sito multilingua come quello di riferimento è un progetto a preventivo. L’assistente telefonico che risponde alle chiamate parte da 199 € al mese con 590 € di avvio. Prezzi IVA esclusa.`,
  offerHighlight: 'Sito, app di campo e pannello ufficio',
  primaryCtaLabel: 'Racconta come lavora la squadra',
  primaryCtaHref: 'https://wa.me/393477196603?text=Ciao%21%20Vorrei%20parlare%20di%20sito%20e%20gestione%20delle%20lavorazioni.',
  icon: ClipboardCheck,
  signals: ['Sistema costruito e collaudato end-to-end', 'Sito, app di campo e pannello dallo stesso fornitore', 'Scriviamo solo le funzioni che esistono davvero'],
  outcomes: [
    { title: 'Il rapporto esce dal cantiere', text: 'L’operatore chiude il lavoro sul telefono: ore, checklist, foto e firma restano dentro il rapporto, invece di essere raccontati a voce la sera in ufficio.' },
    { title: 'L’ufficio vede la giornata', text: 'Nel pannello ci sono i rapporti e le ore di oggi, più il totale di quelli in approvazione e contestati, con i filtri per data, operatore, cliente e stato.' },
    { title: 'Un sistema solo, non tre', text: 'Sito, applicazione della squadra e pannello dell’ufficio sono lo stesso progetto e lo stesso fornitore. Le richieste del sito arrivano via email: non entrano da sole dentro i rapporti.' },
  ],
  deliverablesTitle: 'Dal modulo sul sito al PDF firmato.',
  deliverablesIntro:
    'Tre pezzi che lavorano insieme: il sito che porta la richiesta, l’applicazione che la squadra usa sul posto e il pannello da cui l’ufficio controlla. Qui sotto c’è cosa contiene ciascuno, senza aggiungere nulla che non sia già nel prodotto.',
  deliverables: [
    { title: 'Sito multilingua', text: 'Il sito di riferimento esce in sette lingue, arabo compreso con impaginazione da destra a sinistra, con le pagine legali e i dati strutturati. Un sito così è un progetto a preventivo, non il canone base.' },
    { title: 'Modulo richieste', text: 'Un modulo di contatto per ogni lingua con nome, telefono, località, tipo di proprietà e servizio, più le chiamate dirette su WhatsApp dalle sezioni della pagina.' },
    { title: 'App installabile sul telefono', text: 'L’applicazione si installa dal browser come icona a schermo intero, in verticale, senza passare dagli store: l’operatore entra con le credenziali che gli dai tu.' },
    { title: 'Modelli di scheda', text: 'Le sezioni e le voci della checklist le governa l’ufficio: otto sezioni e, nel modello completo, sessantatré voci che l’operatore trova già pronte da spuntare.' },
    { title: 'Ore e dati intervento', text: 'Cliente, indirizzo, tipologia, data, entrata, uscita e pausa: le ore totali si calcolano da sole e il conto regge anche quando il turno passa la mezzanotte.' },
    { title: 'Foto scattate sul posto', text: 'Fino a dieci foto per rapporto in sei categorie, fra prima, dopo, anomalia e danno già presente, compresse sul telefono prima di partire e con una nota per ciascuna.' },
    { title: 'Anomalie a codice', text: 'Le anomalie si spuntano da un elenco chiuso di dodici voci, più «nessuna anomalia»: oggi è tarato su pulizie e housekeeping, e adattarlo a un altro servizio è una lavorazione a preventivo.' },
    { title: 'Firme e PDF del rapporto', text: 'La firma dell’operatore è obbligatoria, quella del cliente facoltativa: il PDF in A4 raccoglie dati, checklist, anomalie, foto e firme, pronto da scaricare o stampare.' },
    { title: 'Invii con registro', text: 'Il rapporto parte via email al responsabile o sulla chat Telegram aziendale, con il PDF allegato: ogni invio, riuscito o fallito, resta scritto in fondo alla scheda. La condivisione WhatsApp la fa una persona e non viene registrata.' },
    { title: 'Pannello dell’ufficio', text: 'Storico filtrabile, approvazione o contestazione con motivo scritto, archivio foto, anagrafica di clienti e indirizzi, accessi della squadra e dati isolati per azienda.' },
  ],
  process: metodoServizio('gestione-lavorazioni').fasi,
  faq: [
    { q: 'Come fa un operatore a compilare il rapportino direttamente sul posto?', a: 'Apre l’applicazione dal telefono, sceglie il modello di scheda e trova la checklist già pronta: spunta le voci mentre lavora, scrive le ore, allega le foto e firma prima di uscire. Ogni voce spuntata viene scritta subito, e il resto del modulo si salva da solo quattro secondi dopo l’ultima modifica. Il rapporto passa da bozza a completato solo quando cliente, indirizzo, orari e firma dell’operatore ci sono davvero: finché manca qualcosa, l’app avvisa e non chiude.' },
    { q: 'Serve scaricare un’app dallo store?', a: 'No, l’applicazione si installa dal browser del telefono e resta come icona a schermo intero, in verticale, senza passare da App Store o Play Store. L’operatore non si registra da solo: l’account lo crea l’ufficio con una password temporanea, mostrata una volta sola e consegnata a mano. Da quel momento entra con email e password, e la cambia quando vuole dal proprio profilo.' },
    { q: 'Funziona anche se in cantiere non prende la linea?', a: 'Senza rete restano salvati sul telefono i dati dell’intervento, le note e le anomalie, in una bozza legata a quel rapporto, con una fascia gialla che avvisa che sei offline. Le spunte della checklist, le firme e le foto hanno invece bisogno della linea. Il recupero avviene riaprendo lo stesso rapporto sullo stesso telefono e sullo stesso browser: la bozza torna e da lì si completa. Non esiste sincronizzazione fra dispositivi diversi, e finché manca la linea il rapporto non passa a completato.' },
    { q: 'Chi controlla i rapporti prima che vengano usati?', a: 'Il controllo spetta all’ufficio, che dal pannello vede i rapporti completati, li apre uno per uno e decide se approvarli oppure contestarli con un motivo scritto obbligatorio. Il motivo compare in un riquadro rosso dentro la scheda, così l’operatore legge cosa va corretto. Una volta uscito dalla bozza, il rapporto non è più modificabile da chi lo ha scritto. Approvazione e contestazione non fanno partire notifiche automatiche: chi controlla avvisa la squadra come fa di solito.' },
    { q: 'Come si segnala un problema trovato durante l’intervento?', a: 'Dentro il rapporto, spuntando una delle dodici anomalie previste — casa trovata molto sporca, oggetti già rotti, zone non accessibili, tempo insufficiente e così via — dove solo «altro» apre un campo di testo libero. La segnalazione viaggia con il rapporto: finisce nella scheda, nel PDF e nel messaggio che arriva al responsabile, e si può accompagnare con una foto nella categoria «anomalia». Non è una coda di assistenza: l’anomalia non ha priorità, assegnatario o scadenza, e l’unico ritorno formale è la contestazione del rapporto.' },
    { q: 'Il cliente finale riceve il rapporto firmato?', a: 'Non in automatico, perché il sistema manda il PDF all’email del responsabile o alla chat Telegram aziendale, mentre su WhatsApp la condivisione la fa una persona che sceglie il destinatario. Il cliente può firmare sul telefono a fine intervento, ma la firma è facoltativa e resta un tratto sul rapporto, senza identità verificata né marca temporale certificata. Non esiste un’area riservata al cliente: chi vuole mandargli il documento scarica il PDF e lo inoltra.' },
    { q: 'Il sistema pianifica gli interventi e i turni della squadra?', a: 'No, il rapporto nasce quando l’operatore lo apre sul posto e non da un intervento programmato: nel sistema non ci sono calendario, turni, promemoria o notifiche push. Non c’è nemmeno geolocalizzazione o timbratura, e l’ora di entrata viene precompilata con quella del telefono, correggibile a mano. Se ti serve la parte di agenda e i messaggi al cliente, è un altro servizio, con listino proprio.' },
    { q: 'Quanto costa e che cosa serve per partire?', a: `Il sistema completo va a preventivo, perché dipende dal numero di operatori e da quanti modelli di scheda vanno scritti per il tuo servizio. Il sito parte da ${CANONE.web} per una landing semplice o un sito base, con proprietà del sito dopo dodici mesi di canone, e l’assistente telefonico che risponde alle chiamate parte da 199 € al mese più 590 € di avvio, IVA esclusa. Per partire servono l’elenco di clienti e indirizzi, le voci di controllo che usate oggi e la casella o la chat dove far arrivare i rapporti.` },
  ],
  related: [
    { href: '/settori/imprese-di-pulizia', label: 'Imprese di pulizia' },
    { href: '/settori/elettricisti-e-idraulici', label: 'Elettricisti e idraulici' },
    { href: '/servizi/automazione-gestionali', label: 'Automazione e gestionali' },
    { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
  ],
}

export default function Page() {
  return <MarketingDetailPage config={config} />
}
