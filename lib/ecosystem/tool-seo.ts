import type { Metadata } from 'next'
import type { SwaTool } from './catalog'

// Descriptions and features come from the same catalog as the visible tool page.
// Do not add prices, ratings or availability claims inferred from a landing page.
export function toolMetadata(tool: SwaTool, url: string): Metadata {
  const title = `${tool.copy.name} | ${tool.copy.category}`
  return {
    title,
    description: tool.copy.summary,
    alternates: { canonical: url },
    // The Marketplace is intentionally protected until the owner approves public sheets.
    robots: { index: false, follow: false },
    openGraph: { title: `${tool.copy.name} | SWA`, description: tool.copy.summary, url, type: 'website', locale: 'it_IT' },
    twitter: { card: 'summary', title: `${tool.copy.name} | SWA`, description: tool.copy.summary },
  }
}

export function toolStructuredData(tool: SwaTool, url: string, marketplaceUrl: string) {
  const c = tool.copy
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${url}#page`, name: `${c.name} | SWA`, url, description: c.intro, inLanguage: 'it-IT',
        audience: { '@type': 'Audience', description: c.audience } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Marketplace SWA', item: marketplaceUrl },
        { '@type': 'ListItem', position: 2, name: c.name, item: url },
      ] },
      ...(!tool.is_coming_soon ? [{ '@type': 'SoftwareApplication', '@id': `${url}#software`, name: c.name,
        applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: c.summary, url,
        featureList: c.benefits.map(([title, detail]) => `${title}: ${detail}`),
      }] : []),
      ...(c.faq.length ? [{ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: c.faq.map(([question, answer]) => ({
        '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer },
      })) }] : []),
    ],
  }
}
