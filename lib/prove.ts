// Le prove verificabili: la home e la pagina regali leggono gli stessi numeri.
// Sola lettura: ordinare o rovesciare l'array cambierebbe l'ordine per entrambe le pagine.
export const CASES: ReadonlyArray<{ metric: string; unit: string; title: string; text: string; href: string }> = [
  {
    metric: '24',
    unit: 'contenuti',
    title: 'Caso studio Bowling',
    text: 'Un mese di campagna con 10 Reel, 6 caroselli, 4 Story e 4 post: dal problema del gestore alla CTA commerciale.',
    href: '/servizi/gestione-social-media',
  },
  {
    metric: '3',
    unit: 'progetti',
    title: 'Portfolio web consultabile',
    text: 'SILKinCOM, Studio Legale BCS e Borsieri Car Service mostrano siti reali, non mockup isolati.',
    href: '/servizi/siti-e-commerce',
  },
  {
    metric: '30',
    unit: 'aziende',
    title: 'Pilot ricerca B2B',
    text: 'Analisi fino a 30 aziende con criteri concordati, fonti pubbliche e priorità motivata per ogni prospect.',
    href: '/servizi/ricerca-clienti-b2b',
  },
]
