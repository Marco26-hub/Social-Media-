// Il profilo Instagram di Social Web Automation in un posto solo: lo usano il
// footer di tutto il sito, la pagina dei regali e la sua 404, e un indirizzo
// scritto più volte prima o poi diverge.

export const INSTAGRAM_HANDLE = '@socialwebautomation'

// L'indirizzo si legge a ogni chiamata e non in una costante di modulo, così il
// test può cambiare la variabile fra una chiamata e l'altra. Il nome
// `process.env.NEXT_PUBLIC_INSTAGRAM_URL` va scritto per intero: Next.js lo
// sostituisce nel bundle solo in questa forma, non con `process.env[nome]` né
// passando da una copia dell'oggetto. Una variabile vuota o fatta di soli
// spazi vale come assente e si ripiega sul profilo ufficiale.
export function instagramUrl(): string {
  return process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || 'https://www.instagram.com/socialwebautomation/'
}
