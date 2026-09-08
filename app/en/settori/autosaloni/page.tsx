import type { Metadata } from 'next'
import SettorePage, { metadataSettore } from '@/components/SettorePage'
import { settoreEnBySlug } from '@/lib/settori.en'

const settore = settoreEnBySlug('autosaloni')!

export const metadata: Metadata = metadataSettore(settore, 'en')

export default function Page() {
  return <SettorePage settore={settore} locale="en" />
}
