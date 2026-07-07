'use client'

import { useEffect, useRef, useState } from 'react'

// Conta da 0 al valore quando entra in viewport. Rispetta prefers-reduced-motion
// (mostra subito il valore finale).
export default function CountUp({ to, duration = 1400 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to)
      return
    }

    let raf = 0
    const run = () => {
      if (done.current) return
      done.current = true
      let start = 0
      const step = (t: number) => {
        if (!start) start = t
        const p = Math.min(1, (t - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        setVal(Math.round(to * eased))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    if (!('IntersectionObserver' in window)) { run(); return }
    const io = new IntersectionObserver(
      entries => { if (entries[0]?.isIntersecting) { run(); io.disconnect() } },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [to, duration])

  return <span ref={ref}>{val}</span>
}
