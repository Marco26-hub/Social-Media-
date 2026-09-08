import type { Metadata } from 'next'
import SettorePage, { metadataSettore } from '@/components/SettorePage'
import { settoreBySlug } from '@/lib/settori'

const settore = settoreBySlug('fisioterapia-osteopatia')!

export const metadata: Metadata = metadataSettore(settore)

export default function Page() {
  return <SettorePage settore={settore} />
}
