import type { Metadata } from 'next'
import { TRADUZIONI } from '@/lib/lingue'
import { SITE_URL } from '@/lib/site-config'

/** HTML e sitemap usano le stesse traduzioni reali, non i ripieghi del menu. */
export function seoAlternates(path: string): NonNullable<Metadata['alternates']> {
  const canonical = `${SITE_URL}${path === '/' ? '' : path}`
  const italianPath = TRADUZIONI[path] ? path : Object.keys(TRADUZIONI).find(it => TRADUZIONI[it] === path)
  if (!italianPath) return { canonical }
  const italianUrl = `${SITE_URL}${italianPath === '/' ? '' : italianPath}`
  return { canonical, languages: {
    'it-IT': italianUrl,
    en: `${SITE_URL}${TRADUZIONI[italianPath]}`,
    'x-default': italianUrl,
  } }
}
