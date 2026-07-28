import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api'],
      },
      // Crawler AI: consentiti esplicitamente per la visibilità su
      // ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews, Bing, Apple.
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Bingbot',
          'Applebot-Extended',
        ],
        allow: '/',
        disallow: ['/dashboard', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
