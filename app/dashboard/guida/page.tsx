'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown, ChevronRight, Hand, Cpu, AlertTriangle, Info, ShieldCheck,
  ListChecks, Printer, CircleDot, Circle,
} from 'lucide-react'
import { FASI, STATI, STATI_BLOTATO, GUARDIE, TOTALE_PASSI, TOTALE_MANUALI } from '@/lib/guida-catena'

const TONO_STATO: Record<string, string> = {
  neutro: 'bg-gray-100 text-gray-600 border-gray-200',
  attesa: 'bg-amber-50 text-amber-700 border-amber-200',
  ok: 'bg-brand-50 text-brand-700 border-brand-100',
  errore: 'bg-red-50 text-red-700 border-red-200',
}

export default function GuidaPage() {
  // Un solo passo aperto per volta tiene la pagina leggibile; "espandi tutto"
  // resta disponibile per chi vuole leggerla come un documento o stamparla.
  const [aperti, setAperti] = useState<Set<number>>(new Set([1]))
  const [soloManuali, setSoloManuali] = useState(false)
  const [attiva, setAttiva] = useState(FASI[0].id)
  const sezioni = useRef<Record<string, HTMLElement | null>>({})

  const fasiVisibili = useMemo(
    () =>
      FASI.map(f => ({ ...f, passi: soloManuali ? f.passi.filter(p => p.manuale) : f.passi }))
        .filter(f => f.passi.length > 0),
    [soloManuali],
  )

  // Scroll-spy: evidenzia nell'indice la fase che si sta leggendo.
  useEffect(() => {
    const obs = new IntersectionObserver(
      voci => {
        const visibile = voci.filter(v => v.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visibile) setAttiva(visibile.target.id)
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    )
    Object.values(sezioni.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [fasiVisibili])

  function alterna(n: number) {
    setAperti(prec => {
      const succ = new Set(prec)
      if (succ.has(n)) succ.delete(n)
      else succ.add(n)
      return succ
    })
  }

  const tuttiAperti = aperti.size >= TOTALE_PASSI

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Intestazione */}
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase mb-2">Guida operativa</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-balance">
          Dal cliente al post pubblicato
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl leading-relaxed">
          La catena completa del sistema: {FASI.length} fasi, {TOTALE_PASSI} passi. Di questi{' '}
          <strong className="text-gray-900 font-semibold">{TOTALE_MANUALI} richiedono una decisione tua</strong> —
          tutto il resto avviene da solo. Niente raggiunge un social senza passare da quegli {TOTALE_MANUALI} punti.
        </p>
      </header>

      <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-8">
        {/* Indice */}
        <nav className="hidden lg:block">
          <div className="sticky top-6">
            <p className="label mb-3">Indice</p>
            <ol className="space-y-1 mb-6">
              {fasiVisibili.map(fase => (
                <li key={fase.id}>
                  <a
                    href={`#${fase.id}`}
                    className={`flex gap-2.5 items-baseline px-3 py-2 rounded-lg text-sm transition-colors ${
                      attiva === fase.id
                        ? 'bg-brand-50 text-brand-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[11px] font-mono tabular-nums text-gray-400">{fase.n}</span>
                    <span className="min-w-0">{fase.titolo}</span>
                  </a>
                </li>
              ))}
              <li className="pt-1">
                <a href="#riferimento" className={`flex gap-2.5 items-baseline px-3 py-2 rounded-lg text-sm transition-colors ${
                  attiva === 'riferimento' ? 'bg-brand-50 text-brand-800 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                  <span className="text-[11px] font-mono tabular-nums text-gray-400">—</span>
                  <span>Stati e blocchi</span>
                </a>
              </li>
            </ol>

            <div className="space-y-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => setSoloManuali(v => !v)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                  soloManuali
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Hand className="w-3.5 h-3.5 shrink-0" />
                <span className="text-left">Solo i controlli umani</span>
              </button>
              <button
                onClick={() => setAperti(tuttiAperti ? new Set() : new Set(FASI.flatMap(f => f.passi.map(p => p.n))))}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ListChecks className="w-3.5 h-3.5 shrink-0" />
                <span className="text-left">{tuttiAperti ? 'Comprimi tutto' : 'Espandi tutto'}</span>
              </button>
              <button
                onClick={() => {
                  setAperti(new Set(FASI.flatMap(f => f.passi.map(p => p.n))))
                  setSoloManuali(false)
                  setTimeout(() => window.print(), 120)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="text-left">Stampa / PDF</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Corpo */}
        <div className="min-w-0">
          {soloManuali && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <Hand className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                Stai vedendo solo i {TOTALE_MANUALI} passi che richiedono una tua decisione. Tutto il resto del
                sistema avviene senza intervento.
              </p>
            </div>
          )}

          {fasiVisibili.map(fase => (
            <section
              key={fase.id}
              id={fase.id}
              ref={el => { sezioni.current[fase.id] = el }}
              className="mb-12 scroll-mt-6"
            >
              <div className="mb-5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl font-mono tabular-nums text-brand-600/40 font-semibold">{fase.n}</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{fase.titolo}</h2>
                  {fase.dove && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                      {fase.dove}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-gray-600 leading-relaxed max-w-2xl">{fase.sommario}</p>
              </div>

              <ol className="space-y-2">
                {fase.passi.map(passo => {
                  const aperto = aperti.has(passo.n)
                  return (
                    <li key={passo.n} className="card overflow-hidden">
                      <button
                        onClick={() => alterna(passo.n)}
                        aria-expanded={aperto}
                        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50/70 transition-colors"
                      >
                        <span
                          className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg grid place-items-center text-xs font-mono tabular-nums font-semibold ${
                            passo.manuale
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {passo.n}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{passo.titolo}</span>
                            {passo.manuale ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
                                <Hand className="w-3 h-3" /> tu
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200">
                                <Cpu className="w-3 h-3" /> auto
                              </span>
                            )}
                            {passo.facoltativo && (
                              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded border bg-gray-50 text-gray-400 border-gray-200">
                                facoltativo
                              </span>
                            )}
                          </span>
                          <span className="block text-sm text-gray-500 mt-0.5">{passo.sintesi}</span>
                        </span>
                        {aperto
                          ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                          : <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />}
                      </button>

                      {aperto && (
                        <div className="px-4 pb-4 pl-[3.75rem] border-t border-gray-100 pt-4">
                          <div className="space-y-3 max-w-2xl">
                            {passo.paragrafi.map((par, i) => (
                              <p key={i} className="text-sm text-gray-600 leading-relaxed">{par}</p>
                            ))}
                          </div>

                          {passo.nota && (
                            <div
                              className={`mt-4 flex items-start gap-2.5 p-3 rounded-lg border max-w-2xl ${
                                passo.nota.grave
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-blue-50 border-blue-200'
                              }`}
                            >
                              {passo.nota.grave
                                ? <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                : <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                              <p className={`text-sm leading-relaxed ${passo.nota.grave ? 'text-red-900' : 'text-blue-900'}`}>
                                {passo.nota.testo}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {passo.riferimenti.map(rif => (
                              <code
                                key={rif}
                                className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200"
                              >
                                {rif}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}

          {/* Riferimento */}
          <section
            id="riferimento"
            ref={el => { sezioni.current['riferimento'] = el }}
            className="scroll-mt-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-5">Stati e blocchi</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Stato del contenuto</h3>
                <p className="text-sm text-gray-500 mb-4">Dove si trova nel ciclo di vita.</p>
                <ul className="space-y-2">
                  {STATI.map(s => (
                    <li key={s.codice} className="flex items-start gap-2.5">
                      <code className={`shrink-0 text-[11px] font-mono px-1.5 py-0.5 rounded border ${TONO_STATO[s.tono]}`}>
                        {s.codice}
                      </code>
                      <span className="text-sm text-gray-600 leading-snug">{s.cosa}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Stato dell’invio</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Il percorso su Blotato. <strong className="text-gray-700 font-medium">scheduled non significa pubblicato.</strong>
                </p>
                <ul className="space-y-3">
                  {STATI_BLOTATO.map(s => (
                    <li key={s.codice} className="flex items-start gap-2.5">
                      {s.pubblicato === 'Sì'
                        ? <CircleDot className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-1" />
                        : <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-1" />}
                      <span className="min-w-0">
                        <code className="text-[11px] font-mono text-gray-900">{s.codice}</code>
                        <span className="block text-sm text-gray-600 leading-snug">{s.cosa}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <h3 className="font-semibold text-gray-900">Cosa impedisce una pubblicazione sbagliata</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Sette blocchi in serie: ne basta uno per fermare l’invio.</p>
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="pb-2 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Blocco</th>
                      <th className="pb-2 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Cosa ferma</th>
                      <th className="pb-2 font-medium text-gray-400 text-xs uppercase tracking-wide">Chi decide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GUARDIE.map(g => (
                      <tr key={g.nome} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-gray-900 align-top">{g.nome}</td>
                        <td className="py-2.5 pr-4 text-gray-600 align-top">{g.blocca}</td>
                        <td className="py-2.5 text-gray-500 align-top">{g.chi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/dashboard/piano" className="btn-primary">Vai al piano editoriale</Link>
              <Link href="/dashboard/calendario" className="btn-secondary">Apri il calendario</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
