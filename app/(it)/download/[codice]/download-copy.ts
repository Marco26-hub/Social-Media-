import { PREZZI } from '@/lib/prezzi-ingresso'

// Testi fissi della pagina regali, copiati parola per parola dallo spec (§1). Il
// pannello cambia solo occhiello, titolo, sottotitolo e messaggio WhatsApp
// (PageTexts): tutto il resto sta qui, così GiftPage.tsx resta leggibile e i testi
// si rileggono in un posto solo.

// Gli stessi prezzi nella riga sotto le prove e nella risposta sui costi. Vengono da
// PREZZI e non si scrivono a mano; PREZZI.web contiene già «a partire da», quindi
// niente «da» davanti.
export const PUBLIC_PRICES = `gestione social ${PREZZI.presenza}, sito ${PREZZI.web}, IVA esclusa`

export const BRIDGE_TEXT =
  'I regali servono a farti risparmiare tempo. Se il tempo proprio non c’è, scrivici su WhatsApp di cosa ti occupi: prepariamo un contenuto di prova gratuito sul tuo caso. Lo guardi, lo giudichi, poi decidi tu.'

export const BRIDGE_STEPS = [
  { title: 'Scrivi', text: 'Il messaggio è già pronto: aggiungi solo di cosa ti occupi.' },
  { title: 'Ti risponde una persona', text: 'Raccontaci la tua attività, anche con una foto del prodotto.' },
  { title: 'Ricevi la prova', text: 'Se ti convince ne parliamo, con prezzi già pubblici. Se no finisce lì, e i regali restano tuoi.' },
]

export const ABOUT_TEXT =
  'Social Web Automation è la ditta di Marco Dibenedetto, a Cermenate (CO): siti, social e automazioni per PMI e professionisti. Il lavoro lo coordina una persona sola, con specialisti area per area, e nulla esce senza il tuo via libera.'

// La domanda sull'app UGC arriva con la PR 2, insieme all'app.
export const GIFT_FAQ = [
  {
    q: 'Devo lasciare email o registrarmi?',
    a: 'No. Chi ha il link apre e scarica, senza registrazione. Non ti chiediamo nessun dato: il server registra solo i log tecnici descritti nell’informativa privacy.',
  },
  {
    q: 'Da Instagram il file non si scarica: che faccio?',
    a: 'Instagram e Facebook aprono i link in un browser interno che a volte blocca i download. Apri la pagina nel browser del telefono: tocca il menu in alto a destra e scegli di aprirla nel browser. Da lì il file si salva.',
  },
  {
    q: 'Il contenuto di prova è davvero gratis?',
    a: 'Sì: un contenuto sul tuo caso reale, senza carta e senza contratto. Serve a farti giudicare tono, qualità e metodo prima di decidere qualsiasi cosa.',
  },
  {
    q: 'Cosa succede se vi scrivo su WhatsApp?',
    a: 'Ti risponde una persona. Ci dici di cosa ti occupi, prepariamo la prova e te la mandiamo. Nessun messaggio promozionale senza il tuo sì.',
  },
  {
    q: 'Quanto costa se poi volete farlo voi?',
    a: `I prezzi sono pubblici: ${PUBLIC_PRICES}. I dettagli sono nella pagina Pacchetti.`,
  },
  {
    q: 'Posso girare il link a un collega?',
    a: 'Sì, puoi girarlo a chi vuoi.',
  },
]

export const CLOSING_TEXT =
  'Se ti serve una mano a usarli, o preferisci che il lavoro lo facciamo noi, scrivici: il primo contenuto di prova è gratis.'
