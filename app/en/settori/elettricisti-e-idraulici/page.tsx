import type { Metadata } from 'next'
import SettorePage, { metadataSettore } from '@/components/SettorePage'
import { settoreEnBySlug } from '@/lib/settori.en'

const settore = settoreEnBySlug('elettricisti-e-idraulici')!

export const metadata: Metadata = metadataSettore(settore, 'en')

export default function Page() {
  return <SettorePage settore={settore} locale="en" />
}
