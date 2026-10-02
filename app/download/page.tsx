import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Download, FileArchive, FileImage, FileText, FileType2 } from 'lucide-react'
import { listDownloads } from '@/lib/downloads'
import styles from './download.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Download | Social Automation',
  description: 'Materiali e file da scaricare di Social Automation.',
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1)
  return `${(bytes / 1024 ** (index + 1)).toLocaleString('it-IT', { maximumFractionDigits: 1 })} ${units[index]}`
}

function fileType(contentType: string, filename: string) {
  const extension = filename.split('.').pop()?.toUpperCase() || 'FILE'
  if (contentType === 'application/pdf' || extension === 'PDF') return { label: 'PDF', Icon: FileText }
  if (contentType.startsWith('image/')) return { label: extension, Icon: FileImage }
  if (/zip|rar|7z|tar/.test(contentType) || /ZIP|RAR|7Z/.test(extension)) return { label: extension, Icon: FileArchive }
  return { label: extension, Icon: FileType2 }
}

export default async function DownloadPage() {
  let items = [] as Awaited<ReturnType<typeof listDownloads>>
  try {
    items = await listDownloads()
  } catch {
    // Se Blob non è ancora configurato, la pagina resta pubblica e ordinata.
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link className={styles.brand} href="/" aria-label="Social Automation, torna alla home">
          <span className={styles.brandMark}><Image src="/brand/swa-logo-official.png" alt="Social Automation" width={118} height={55} priority /></span>
        </Link>

        <section className={styles.hero} aria-labelledby="download-title">
          <div>
            <p className={styles.eyebrow}>Area download</p>
            <h1 id="download-title">Materiali pronti per te.</h1>
            <p className={styles.intro}>Scarica qui documenti, immagini e file condivisi dal team SWA.</p>
          </div>
          <p className={styles.count}>{items.length === 1 ? '1 materiale disponibile' : `${items.length} materiali disponibili`}</p>
        </section>

        {items.length ? (
          <section className={styles.grid} aria-label="Materiali disponibili">
            {items.map(item => {
              const { label, Icon } = fileType(item.contentType, item.originalName)
              return (
                <article className={styles.card} key={item.id}>
                  <div className={styles.cardTop}>
                    <span className={styles.fileIcon}><Icon size={21} aria-hidden="true" /></span>
                    <span className={styles.type}>{label}</span>
                  </div>
                  <h2>{item.title}</h2>
                  {item.description && <p className={styles.description}>{item.description}</p>}
                  {!item.description && <div className={styles.description} />}
                  <div className={styles.meta}><span>{item.originalName}</span><span>·</span><span>{formatFileSize(item.size)}</span></div>
                  <a className={styles.download} href={item.downloadUrl}>
                    <Download size={17} aria-hidden="true" /> Scarica file
                  </a>
                </article>
              )
            })}
          </section>
        ) : (
          <section className={styles.empty}>
            <strong>Nessun materiale disponibile al momento.</strong>
            Torna presto oppure contattaci se aspettavi un file specifico.
          </section>
        )}

        <footer className={styles.footer}>© {new Date().getFullYear()} Social Web Automation</footer>
      </div>
    </main>
  )
}
