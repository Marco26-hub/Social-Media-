export type LinguaFooter = 'it' | 'en'

export type VoceFooter = { href: string; label: string; hrefLang?: string; lang?: string }

// Le voci del footer, uguali su tutto il sito e speculari fra le due lingue.
//
// Sono dodici perche' sulla griglia del telefono stanno in tre righe da
// quattro senza lasciare celle vuote nell'ultima, e su desktop in due righe da
// sei: aggiungerne o toglierne una spezza l'allineamento. Il recesso resta
// fuori dal conto, occupa la riga intera per conto suo.
//
// L'ordine e' lo stesso nelle due lingue: la voce numero n in italiano porta
// alla gemella inglese numero n. lib/footer-voci.test.ts lo verifica.
export const VOCI_FOOTER: Record<LinguaFooter, VoceFooter[]> = {
  it: [
    { href: '/servizi', label: 'Servizi' },
    { href: '/metodo', label: 'Metodo' },
    { href: '/pacchetti', label: 'Pacchetti' },
    { href: '/blog', label: 'Journal' },
    { href: '/chi-siamo', label: 'Azienda' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contatti', label: 'Contatti' },
    { href: '/en', label: 'English', hrefLang: 'en', lang: 'en' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/termini', label: 'Termini' },
    // Accessibilita e sicurezza vanno raggiunte dal footer di ogni pagina: chi
    // cerca la dichiarazione di accessibilita la cerca li, e chi valuta il
    // fornitore cerca la pagina sicurezza prima di scrivere una email.
    { href: '/accessibilita', label: 'Accessibilità' },
    { href: '/sicurezza', label: 'Sicurezza' },
  ],
  en: [
    { href: '/en/services', label: 'Services' },
    { href: '/en/method', label: 'Method' },
    { href: '/en/pricing', label: 'Packages' },
    { href: '/en/blog', label: 'Journal' },
    { href: '/en/about', label: 'About' },
    { href: '/en/faq', label: 'FAQ' },
    { href: '/en/contact', label: 'Contact' },
    { href: '/', label: 'Italiano', hrefLang: 'it', lang: 'it' },
    { href: '/en/privacy', label: 'Privacy' },
    { href: '/en/terms', label: 'Terms' },
    { href: '/en/accessibility', label: 'Accessibility' },
    { href: '/en/security', label: 'Security' },
  ],
}

export const RECESSO_FOOTER: Record<LinguaFooter, VoceFooter> = {
  it: { href: '/recesso', label: 'Recedere dal contratto qui' },
  en: { href: '/en/withdrawal', label: 'Withdraw from the contract here' },
}
