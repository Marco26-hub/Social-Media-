import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const marketingUpdated = new Date('2026-07-29T00:00:00.000Z')
  const legalUpdated = new Date('2026-07-28T00:00:00.000Z')

  return [
    {
      url: SITE_URL,
      lastModified: marketingUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/servizi`,
      lastModified: marketingUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/chi-siamo`,
      lastModified: marketingUpdated,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/consulenza`,
      lastModified: marketingUpdated,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${SITE_URL}/privacy`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cookie-policy`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/termini`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/trasparenza-ai`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.4 },
  ]
}
