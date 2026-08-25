import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Social Web Automation',
    short_name: 'SWA',
    description: 'Gestione social media, SEO, GEO e siti per PMI e professionisti.',
    start_url: SITE_URL,
    display: 'standalone',
    background_color: '#f7f8f5',
    theme_color: '#0f6b4f',
    lang: 'it-IT',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
