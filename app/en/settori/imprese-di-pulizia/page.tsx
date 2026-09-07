import type { Metadata } from 'next'
import SettorePage, { metadataSettore } from '@/components/SettorePage'
import { settoreEnBySlug } from '@/lib/settori.en'

const settore = settoreEnBySlug('imprese-di-pulizia')!

export const metadata: Metadata = metadataSettore(settore, 'en')

export default function Page() {
  return <SettorePage settore={settore} locale="en" />
}
