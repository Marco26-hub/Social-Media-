import { SETTORI } from './settori'

// Gli alias servono alla navigazione, senza creare nuove pagine o URL in sitemap.
export const SETTORI_NAV = SETTORI.flatMap(({ slug, nome, sommario }) => {
  const settore = { slug, nome, sommario }
  return slug === 'ristoranti-e-bar'
    ? [settore, {
      slug,
      nome: 'Pizzerie',
      sommario: 'Menu e ordini dal telefono, pagamento al tavolo e numero di ritiro per la pizza al taglio.',
    }]
    : [settore]
})
