import { test, expect } from 'playwright/test'
import { seoAlternates } from './seo-alternates'
import { TRADUZIONI } from './lingue'
import { SITE_URL } from './site-config'
import { PREZZO_INGRESSO } from './prezzi-ingresso'
import { SALA_DA } from './ristoranti-listino'
import { SEO_SERVICE_COPY } from './seo-service-copy'
import { SERVIZI_EN } from './servizi.en'
import { FAQ_SERVIZI } from './servizi-faq'
import { SWA_BLOG_ARTICLES_EN } from './swa-blog-content.en'
import { groups } from './public-faq'
import { VIDEO_MONTAGGIO, VIDEO_MONTAGGIO_EN } from './video-listino'
import { anteprimaOg } from './anteprima'
import { articoloPerServizio } from './collegamenti'

for (const [it, en] of Object.entries(TRADUZIONI).filter(([it]) => it.startsWith('/servizi/'))) {
  test(`reciprocal alternates use the same mapping for ${it}`, () => {
    const italian = seoAlternates(it)
    const english = seoAlternates(en)
    expect(italian.canonical).toBe(`${SITE_URL}${it}`)
    expect(english.canonical).toBe(`${SITE_URL}${en}`)
    expect(italian.languages).toEqual(english.languages)
    expect(italian.languages).toEqual({ 'it-IT': `${SITE_URL}${it}`, en: `${SITE_URL}${en}`, 'x-default': `${SITE_URL}${it}` })
  })
}

test('untranslated courses do not pretend to have an English equivalent', () => {
  expect(seoAlternates('/corsi')).toEqual({ canonical: `${SITE_URL}/corsi` })
})

test('restaurant entry price follows the approved table-system list', () => {
  expect(PREZZO_INGRESSO['gestionale-ristoranti']).toBe(`da ${SALA_DA} al mese`)
  expect(PREZZO_INGRESSO['gestionale-ristoranti']).not.toContain('39 €')
})

test('service and knowledge FAQ use the same qualified SEO answers', () => {
  for (const text of Object.values(SEO_SERVICE_COPY.it)) expect(FAQ_SERVIZI.some(faq => faq.a === text)).toBe(true)
  const en = SERVIZI_EN.find(service => service.slug === 'seo-geo')!
  for (const text of Object.values(SEO_SERVICE_COPY.en)) expect(en.config.faq.some(faq => faq.a === text)).toBe(true)
  expect(en.config.tabella?.intro).toBe(SEO_SERVICE_COPY.en.rubric)
  expect(SEO_SERVICE_COPY.it.readability).toContain('facoltativo')
  expect(SEO_SERVICE_COPY.en.rubric).toContain('not a Google')
})

test('video editing is included in production, not dependent on a social plan', () => {
  expect(FAQ_SERVIZI.find(faq => faq.q === 'Il montaggio è compreso nel prezzo delle riprese?')?.a).toBe(VIDEO_MONTAGGIO)
  expect(SERVIZI_EN.find(service => service.slug === 'video-production')?.config.faq.find(faq => faq.q === 'Is editing included in the filming price?')?.a).toBe(VIDEO_MONTAGGIO_EN)
})

test('every English Journal article has a relevant detail-service link', () => {
  const translatedDestinations = new Set(Object.values(TRADUZIONI))
  for (const article of SWA_BLOG_ARTICLES_EN) {
    const detailLinks = article.collegamenti?.filter(link => link.href.startsWith('/en/services/') || link.href === '/en/legal-advice') || []
    expect(detailLinks.length, article.slug).toBeGreaterThan(0)
    for (const link of detailLinks) expect(translatedDestinations.has(link.href), `${article.slug}: ${link.href}`).toBe(true)
  }
})

test('shared package FAQ retains two social channels and excludes advertising', () => {
  const answer = groups.flatMap(group => group.items).find(faq => faq.q === 'Quanto costa la gestione social?')!.a
  expect(answer.match(/per 2 social/g)?.length).toBe(2)
  expect(answer).toContain('32 pubblicazioni')
  expect(answer).toContain('48 pubblicazioni')
  expect(answer).toContain('campagne a pagamento su configurazione personalizzata')
  expect(answer).not.toContain('3 social')
})

test('English service pages link back to the matching translated guide', () => {
  for (const [it, en] of Object.entries(TRADUZIONI)) {
    const italian = articoloPerServizio(it)
    if (!italian) continue
    const english = articoloPerServizio(en)
    expect(english?.href).toBe(TRADUZIONI[italian.href])
    expect(english?.label).toBeTruthy()
  }
})

test('courses have a dedicated social preview without availability claims', () => {
  expect(anteprimaOg('/corsi')).toBeTruthy()
  expect(JSON.stringify(anteprimaOg('/corsi'))).toContain('corsi')
})
