import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-utils'
import { isDownloadStorageConfigured } from '@/lib/downloads'
import DownloadAdmin from './DownloadAdmin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gestisci download | Social Automation',
  robots: { index: false, follow: false, noarchive: true },
}

export default async function AdminDownloadPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/login?callbackUrl=/admin/download')
  }

  return <DownloadAdmin storageReady={isDownloadStorageConfigured()} />
}
