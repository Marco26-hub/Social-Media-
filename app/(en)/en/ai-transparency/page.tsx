import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import LegalPrevalenza from '@/components/LegalPrevalenza'
import { anteprimaOg } from '@/lib/anteprima'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'

const META_TITLE = 'AI transparency — Social Web Automation'
const META_DESCRIPTION =
  'Where we use artificial intelligence, what is labelled as generated, who approves before publication and why your material never trains a model. Art. 50 AI Act.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/en/ai-transparency`,
    languages: {
      'it-IT': `${SITE_URL}/trasparenza-ai`,
      en: `${SITE_URL}/en/ai-transparency`,
      'x-default': `${SITE_URL}/trasparenza-ai`,
    },
  },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/en/ai-transparency`, images: anteprimaOg('/en/ai-transparency'), type: 'website', locale: 'en_US' },
  robots: { index: true, follow: true },
}

export default function AiTransparencyPage() {
  return (
    <LegalShell
      eyebrow="AI transparency · EU Regulation 2024/1689"
      title="AI Transparency Notice"
      currentPath="/en/ai-transparency"
      locale="en"
      altraLinguaHref="/trasparenza-ai"
    >
      <LegalPrevalenza href="/trasparenza-ai" />

      <p>
        {TITOLARE.brand} uses artificial intelligence systems to deliver its services. In line with the
        transparency principle of <strong>EU Regulation 2024/1689 (the AI Act)</strong> — in particular{' '}
        <strong>art. 50</strong> on transparency obligations — we provide the following information.
      </p>

      <h2>1. Where we use AI</h2>
      <ul>
        <li><strong>Content generation</strong>: copy (hooks, captions, hashtags, calls to action), editorial plans, blog articles, campaigns.</li>
        <li><strong>Image and video generation</strong>: graphics, carousels, reels, product images.</li>
        <li><strong>Analysis</strong>: SEO and GEO audits, brand and competitor analysis, content scoring.</li>
      </ul>

      <h2>2. Content generated or manipulated by AI</h2>
      <p>
        Content produced by the platform is <strong>artificially generated or AI-assisted</strong>. Under art. 50
        of the AI Act, when we publish or help publish images, audio or video generated or manipulated by AI that
        could appear authentic, these must be <strong>labelled as artificial</strong>. We help you meet that
        obligation and apply the correct wording where the law or the platforms’ policies require it.
      </p>

      <h2>3. Human oversight</h2>
      <p>
        Every piece of content passes a <strong>human approval</strong> before publication: the AI proposes, a
        person decides. There is no automatic publication without your go-ahead. You remain responsible for
        checking the accuracy and truthfulness of the content.
      </p>

      <h2>4. No training on your data</h2>
      <p>
        The data and materials you upload are used <strong>only to generate the content requested</strong>. We do
        not use them to train AI models, and we select suppliers (Anthropic, Google, OpenRouter) that offer
        contractual guarantees to that effect.
      </p>

      <h2>5. Limits of AI systems</h2>
      <p>
        AI systems can produce errors, inaccuracies or “hallucinations”. They should not be treated as infallible,
        nor as a substitute for professional advice. For legal, tax or medical matters always consult a qualified
        professional.
      </p>

      <h2>6. Risk categories (AI Act)</h2>
      <p>
        The AI Act classifies systems by risk. Our uses (marketing, content generation) fall into the{' '}
        <strong>limited or minimal risk</strong> category, subject mainly to transparency obligations rather than
        the strict requirements for “high risk” systems. The Regulation becomes fully applicable from{' '}
        <strong>2 August 2026</strong>.
      </p>

      <h2>7. Dedicated legal advice</h2>
      <p>
        If you want to check how the AI Act and the GDPR affect your specific business, we offer legal advice with
        the Supreme Court lawyer of {TITOLARE.partnerLegale.split('—')[0].trim()} (€150 / 30 min).
        Contact: <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>.
      </p>
    </LegalShell>
  )
}
