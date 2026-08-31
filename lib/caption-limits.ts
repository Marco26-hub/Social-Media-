// ─────────────────────────────────────────────────────────────────────────
// ACCORCIAMENTO DELLA CAPTION PER I FORMATI VIDEO
//
// Reel, short e story vogliono un testo breve: la caption lunga viene ridotta
// prima della pubblicazione. Il taglio pero era `caption.slice(0, 300)`, cioe
// una forbice sul carattere numero 300 senza guardare dove cade. Su una caption
// da 735 caratteri usciva pubblicato "...Non lasciare che i tuoi contenuti
// restino isol" — parola spezzata, frase monca, e nessun puntino a dire che
// manca qualcosa. Il cliente lo legge cosi.
//
// Qui il taglio cerca, in ordine:
//   1. l'ultima frase chiusa (. ! ? …) dentro il limite;
//   2. altrimenti l'ultimo spazio, con i puntini di sospensione;
// e non lascia mai una parola a meta.
//
// Modulo PURO: nessun DB, nessuna rete.
// ─────────────────────────────────────────────────────────────────────────

// Limite dei formati video. Resta una scelta editoriale (la caption di un reel
// deve essere corta), non un limite della piattaforma.
export const CAPTION_VIDEO_MAX = 300

// Sotto questa frazione del limite, chiudere sull'ultima frase butterebbe via
// troppo testo: meglio l'ultima parola intera piu i puntini.
const FRAZIONE_MINIMA = 0.4

export function accorciaCaption(testo: string, limite = CAPTION_VIDEO_MAX): string {
  const pulito = (testo || '').trim()
  if (pulito.length <= limite) return pulito

  const finestra = pulito.slice(0, limite)

  // 1) Ultima frase chiusa dentro la finestra.
  let taglioFrase = -1
  for (let i = finestra.length - 1; i >= 0; i--) {
    const c = finestra[i]
    if (c === '.' || c === '!' || c === '?' || c === '…') {
      // Un punto dentro un numero o un'abbreviazione ("1.500", "es.") non chiude
      // una frase: deve seguire uno spazio, una virgoletta o la fine del testo.
      const dopo = finestra[i + 1]
      if (dopo === undefined || /[\s"'»)]/.test(dopo)) { taglioFrase = i + 1; break }
    }
  }
  if (taglioFrase >= limite * FRAZIONE_MINIMA) return finestra.slice(0, taglioFrase).trim()

  // 2) Ultima parola intera, con i puntini: si vede che il testo prosegue.
  const ultimoSpazio = finestra.lastIndexOf(' ')
  const base = ultimoSpazio > 0 ? finestra.slice(0, ultimoSpazio) : finestra
  return `${base.replace(/[\s.,;:—-]+$/, '')}…`
}
