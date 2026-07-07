'use client'

import { useEffect } from 'react'

// Rivela in dissolvenza+slide gli elementi con [data-reveal] quando entrano nel
// viewport. Segna <html data-reveal-ready> solo quando JS è attivo: senza JS
// (o con prefers-reduced-motion) tutto resta visibile, niente FOUC.
export default function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    root.setAttribute('data-reveal-ready', '')
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('revealed'))
      return
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            obs.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return null
}
