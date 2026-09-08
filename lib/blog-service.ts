export const BLOG_SERVICE = {
  name: 'Blog SEO + GEO',
  slug: 'blog-seo',
  path: '/servizi/blog-seo',
  // 149 e non 29,90: il mercato italiano 2026 quota 80-250 euro un articolo
  // con ricerca delle parole chiave, e due articoli al mese in abbonamento
  // stanno sugli 80 euro. A 29,90 per dodici articoli il prezzo diceva al
  // lettore che dentro non c'e lavoro: e l'unica riga che nessun cliente
  // chiede di spiegare, perche la conclusione se la fa da solo.
  price: '149.00',
  displayPrice: '€149',
  articlesPerMonth: 12,
  trialDays: 14,
  whatsappMessage: 'Ciao! Vorrei attivare Blog SEO + GEO: 12 articoli al mese.',
  features: [
    '12 articoli SEO + GEO ogni mese',
    'Piano editoriale basato su servizi e ricerche reali',
    'Title, meta description, FAQ e dati strutturati',
    'Controllo umano prima della pubblicazione',
    'Pubblicazione sul blog collegato o consegna per il CMS',
    '14 giorni per valutare il servizio',
  ],
} as const
