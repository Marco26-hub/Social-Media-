import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicCourses } from '@/lib/ecosystem/catalog'
import { SITE_URL } from '@/lib/site-config'
import { JsonLd } from '@/components/ecosystem/StructuredData'
import { anteprimaOg } from '@/lib/anteprima'

async function courseState(slug: string) {
  try { return { course: (await getPublicCourses()).find(c => c.slug === slug), unavailable: false } }
  catch { return { course: undefined, unavailable: true } }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { course, unavailable } = await courseState(slug)
  if (unavailable) return { title: 'Catalogo corsi non disponibile | SWA Academy', robots: { index: false, follow: true } }
  return course ? { title: `${course.title} | SWA Academy`, description: course.subtitle || course.description,
    alternates: { canonical: `${SITE_URL}/corsi/${course.slug}` },
    openGraph: { title: `${course.title} | SWA Academy`, description: course.subtitle || course.description,
      url: `${SITE_URL}/corsi/${course.slug}`, type: 'website', locale: 'it_IT', images: course.imageUrl ? [course.imageUrl] : anteprimaOg('/corsi') } } : {}
}
export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { course, unavailable } = await courseState(slug)
  if (unavailable) return <main id="main-content" className="swa-detail"><section className="swa-section swa-detail-hero">
    <h1>Il catalogo corsi non è disponibile.</h1><p className="swa-detail-intro">Non possiamo verificare questo percorso. Chiedi disponibilità, programma e condizioni prima di iscriverti: nessun acquisto è avviato da questa pagina.</p>
    <div className="swa-actions"><Link href="/corsi" className="swa-button">Informazioni sui corsi</Link><a href="https://wa.me/393477196603?text=Vorrei%20informazioni%20sui%20corsi%20SWA" className="swa-text-link">Contatta SWA →</a></div>
  </section></main>
  if (!course) notFound()
  return <main id="main-content" className="swa-detail">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Course', name: course.title,
      description: course.description, url: `${SITE_URL}/corsi/${course.slug}`,
      provider: { '@type': 'Organization', name: 'SWA — Social Web Automation', url: SITE_URL } }} />
    <section className="swa-section swa-detail-hero"><Link href="/corsi" className="swa-text-link">Tutti i corsi</Link>
      <p className="swa-kicker">{course.category || 'SWA ACADEMY'}</p><h1>{course.title}</h1><p className="swa-detail-intro">{course.subtitle}</p>
      <p className="swa-course-description">{course.description}</p>
      <div className="swa-actions"><a href={`/academy/corsi/${course.slug}`} className="swa-button">{course.priceCents === 0 ? 'Iscriviti gratis' : 'Acquista e accedi al corso'}</a>
      <strong>{new Intl.NumberFormat('it-IT', { style: 'currency', currency: course.currency }).format(course.priceCents / 100)}</strong></div>
    </section>
    <section className="swa-section"><h2>Il programma.</h2><div className="swa-steps">{course.modules.map((module, index) => <article key={index}>
      <span>{String(index + 1).padStart(2, '0')}</span><h3>{module.title}</h3><ul className="swa-check-list">{module.lessons.map(lesson => <li key={lesson.id}>
        {lesson.isFreePreview ? <a href={`/academy/corsi/${course.slug}/anteprima/${lesson.id}`} className="swa-text-link">{lesson.title} · Anteprima gratuita</a> : <span>{lesson.title}</span>}
        {lesson.durationMin ? <small>{lesson.durationMin} min</small> : null}
      </li>)}</ul></article>)}</div></section>
  </main>
}
