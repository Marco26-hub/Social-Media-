'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { MOTORE } from '@/lib/odino/percorsi'
import { MOTORE_EN, settoreCitatoEn } from '@/lib/odino/percorsi.en'
import { settoreCitato } from '@/lib/odino/percorsi'
import { type Nodo } from '@/lib/odino/ricerca'
import { cercaDomande, domandeDelSettore, type Domanda } from '@/lib/odino/domande'
import { ODINO_NOME } from '@/lib/odino/identita'
import { TESTI, WHATSAPP_ODINO } from '@/lib/odino/testi'
import { EVENTO_CONSENSO, leggiConsenso } from '@/lib/cookie-consent'
import { EVENTO_RIQUADRO, chiOccupa, liberaAngolo, mostraMascotte, occupaAngolo } from '@/lib/riquadri'
import styles from './odino.module.css'
import OdinoSaluto, { OdinoGambe } from './OdinoSaluto'
import { useOdinoVignette } from './useOdinoVignette'

const POSE_ODINO = [
  '/images/odino/motion-uniform/odino-01-idle.png',
  '/images/odino/motion-uniform/odino-02-breathe-in.png',
  '/images/odino/motion-uniform/odino-03-breathe-out.png',
  '/images/odino/motion-uniform/odino-04-wave-anticipation.png',
  '/images/odino/motion-uniform/odino-05-wave-high.png',
  '/images/odino/motion-uniform/odino-06-wave-settle.png',
  '/images/odino/motion-uniform/odino-07-listening.png',
  '/images/odino/motion-uniform/odino-08-thinking.png',
  '/images/odino/motion-uniform/odino-09-explaining.png',
  '/images/odino/motion-uniform/odino-10-point-up.png',
  '/images/odino/motion-uniform/odino-11-point-forward-v2.png',
  '/images/odino/motion-uniform/odino-12-invitation.png',
  '/images/odino/motion-uniform/odino-13-celebration-crouch.png',
  '/images/odino/motion-uniform/odino-14-celebration-jump.png',
  '/images/odino/motion-uniform/odino-15-celebration-land.png',
] as const

type NumeroPosa = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15
type PassoPosa = { posa: NumeroPosa | null; durata: number }

// Routine separate e lente: Odino non esegue l'intero catalogo in una volta.
// Il saluto 4-5-6 viene invece costruito sul render originale muovendo solo il
// braccio, come richiesto.
const ROUTINE_POSE: PassoPosa[][] = [
  [
    { posa: null, durata: 6500 },
    { posa: 11, durata: 1700 },
    { posa: 2, durata: 2100 },
    { posa: 3, durata: 2100 },
    { posa: null, durata: 9000 },
  ],
  [
    { posa: null, durata: 8000 },
    { posa: 7, durata: 3300 },
    { posa: null, durata: 1800 },
    { posa: 8, durata: 3600 },
    { posa: null, durata: 10500 },
  ],
  [
    { posa: null, durata: 7500 },
    { posa: 9, durata: 3300 },
    { posa: null, durata: 1800 },
    { posa: 10, durata: 3000 },
    { posa: null, durata: 1800 },
    { posa: 11, durata: 3000 },
    { posa: null, durata: 1800 },
    { posa: 12, durata: 3500 },
    { posa: null, durata: 11000 },
  ],
  [
    { posa: null, durata: 9500 },
    { posa: 13, durata: 1700 },
    { posa: 14, durata: 1150 },
    { posa: 15, durata: 1500 },
    { posa: null, durata: 12500 },
  ],
]

const ROUTINE_SALUTO: PassoPosa[] = [
  { posa: 4, durata: 800 },
  { posa: 5, durata: 3600 },
  { posa: 6, durata: 850 },
  { posa: null, durata: 3500 },
]

// ODINO, l'assistente del sito.
//
// Non e' collegato a nessun modello di AI ed e' una scelta, non un ripiego: le
// risposte vengono dalle stesse sorgenti che alimentano le pagine, quindi non
// puo' dire un prezzo diverso da quello scritto sul sito nemmeno volendo. Un
// assistente che parla di listini e contratti vale per quello che non puo'
// sbagliare, non per quanto sa conversare.
//
// Chi scrive a mano libera viene indirizzato per parole chiave. Se nessuna
// corrisponde, ODINO lo dice e offre le domande che sa trattare, invece di
// rispondere a caso.

export default function Odino() {
  // La lingua si deduce dal percorso, come altrove nel sito: cosi' ODINO vive
  // in tutte e due le versioni senza che ogni layout debba passargli qualcosa.
  const percorso = usePathname() || '/'
  const inglese = percorso === '/en' || percorso.startsWith('/en/')
  const t = inglese ? TESTI.en : TESTI.it
  const motore = inglese ? MOTORE_EN : MOTORE
  const lingua = inglese ? 'en' as const : 'it' as const
  const riconosci = inglese ? settoreCitatoEn : settoreCitato
  // L'ultima frase accompagna quello che la persona sta guardando. In questo
  // modo il saluto non e' una decorazione uguale ovunque, ma l'inizio utile
  // della conversazione che quella pagina suggerisce.
  const invitoSaluto = inglese
    ? percorso.startsWith('/en/settori')
      ? 'What is your business sector?'
      : percorso.startsWith('/en/pricing')
        ? 'Looking for the right package?'
        : percorso.startsWith('/en/services')
          ? 'What result do you want?'
          : percorso.startsWith('/en/blog')
            ? 'What would you like to explore?'
            : 'Tell me about your business'
    : percorso.startsWith('/settori')
      ? 'Qual è il tuo settore?'
      : percorso.startsWith('/pacchetti')
        ? 'Cerchi il pacchetto giusto?'
        : percorso.startsWith('/servizi')
          ? 'Quale risultato vuoi ottenere?'
          : percorso.startsWith('/blog')
            ? 'Cosa vuoi approfondire?'
            : 'Raccontami la tua attività'

  const [aperto, setAperto] = useState(false)
  const [posa, setPosa] = useState<NumeroPosa | null>(null)
  const [numeroRoutine, setNumeroRoutine] = useState(0)
  const [salutoPronto, setSalutoPronto] = useState(false)
  const [movimentoRidotto, setMovimentoRidotto] = useState(true)
  // Nessun percorso preselezionato: all'apertura ODINO chiede, non propone.
  // Aprirsi con un listino significa vendere prima che qualcuno abbia chiesto
  // qualcosa, ed e' il contrario del tono del sito.
  const [corrente, setCorrente] = useState<Nodo | null>(null)
  const [scritto, setScritto] = useState('')
  const [nonCapito, setNonCapito] = useState<string | null>(null)
  const [settore, setSettore] = useState<{ slug: string; nome: string } | null>(null)
  // Il secondo livello: le duecento domande gia' scritte sul sito. Il percorso
  // curato risponde per primo perche' e' scritto per essere la prima cosa che
  // si legge; queste servono ad approfondire, e mostrano da quale pagina
  // vengono cosi' chi vuole il contesto sa dove andare.
  const [approfondimenti, setApprofondimenti] = useState<Domanda[]>([])
  const [aperta, setAperta] = useState<string | null>(null)
  const corpoRef = useRef<HTMLDivElement>(null)
  const chiudiRef = useRef<HTMLButtonElement>(null)
  // ODINO aspetta che il banner cookie abbia avuto risposta. Sono due pannelli
  // fissi nello stesso angolo, e quello che va risposto per primo e' il banner:
  // sovrapporgli un assistente significa mettere una richiesta commerciale
  // davanti a una scelta che la legge vuole libera.
  const [consensoDato, setConsensoDato] = useState(false)
  // L'angolo in basso a destra ha un padrone alla volta: se c'e' gia il popup
  // della segretaria, ODINO aspetta che chiuda invece di sovrapporsi.
  const [angoloDisponibile, setAngoloDisponibile] = useState(true)

  useEffect(() => {
    let annullato = false
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aggiorna = () => setMovimentoRidotto(media.matches)
    aggiorna()
    media.addEventListener('change', aggiorna)
    // Carica e decodifica tutte le pose del saluto prima di nascondere la base.
    void Promise.all([10, 3, 4, 5].map(async indice => {
      const immagine = new window.Image()
      immagine.src = POSE_ODINO[indice]
      await immagine.decode()
    })).then(() => { if (!annullato) setSalutoPronto(true) }).catch(() => {})
    return () => { annullato = true; media.removeEventListener('change', aggiorna) }
  }, [])

  useEffect(() => {
    const leggi = () => setConsensoDato(leggiConsenso(document.cookie) !== null)
    // «Libero» per ODINO vuol dire anche «occupato da ODINO»: altrimenti, nel
    // momento in cui dichiara di occupare l'angolo, si nasconderebbe da solo.
    const guarda = () => { const chi = chiOccupa(); setAngoloDisponibile(chi === null || chi === 'odino') }
    leggi()
    guarda()
    window.addEventListener(EVENTO_CONSENSO, leggi)
    window.addEventListener(EVENTO_RIQUADRO, guarda)
    return () => {
      window.removeEventListener(EVENTO_CONSENSO, leggi)
      window.removeEventListener(EVENTO_RIQUADRO, guarda)
    }
  }, [])

  // Chiusura da tastiera: un pannello che si apre sopra la pagina deve potersi
  // chiudere senza cercare la X col mouse.
  useEffect(() => {
    if (!aperto) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAperto(false) }
    window.addEventListener('keydown', esc)
    chiudiRef.current?.focus()
    return () => window.removeEventListener('keydown', esc)
  }, [aperto])

  useEffect(() => { corpoRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }, [corrente])

  // Il pannello aperto copre l'angolo: chi ci sta sotto — i pulsanti «torna su»
  // e «indietro» — deve poterlo sapere invece di finire dietro un riquadro alto
  // mezzo schermo. Chiuso, ODINO resta comunque una mascotte alta 116 pixel:
  // l'angolo non e' occupato, ma non e' nemmeno vuoto.
  const visibile = consensoDato && (angoloDisponibile || aperto)
  const { vignetta, saluta: avviaSaluto } = useOdinoVignette({
    enabled: visibile && !aperto, inglese, invito: invitoSaluto,
    pageKey: percorso, reducedMotion: movimentoRidotto, interacted: aperto,
  })
  const mostraSaluto = vignetta?.kind === 'saluto'
  useEffect(() => {
    if (!visibile) { mostraMascotte(false); return }
    if (aperto) { occupaAngolo('odino'); mostraMascotte(false) }
    else { liberaAngolo('odino'); mostraMascotte(true) }
  }, [visibile, aperto])
  useEffect(() => () => { liberaAngolo('odino'); mostraMascotte(false) }, [])

  useEffect(() => {
    if (!visibile || aperto || movimentoRidotto || (mostraSaluto && !salutoPronto)) {
      setPosa(null)
      return
    }

    const sequenza = mostraSaluto
      ? ROUTINE_SALUTO
      : ROUTINE_POSE[numeroRoutine % ROUTINE_POSE.length]
    const timer: number[] = []
    let trascorso = 0
    for (const passo of sequenza) {
      const prossima = passo.posa
      timer.push(window.setTimeout(() => setPosa(prossima), trascorso))
      trascorso += passo.durata
    }
    timer.push(window.setTimeout(() => {
      setPosa(null)
      if (!mostraSaluto) setNumeroRoutine(numero => numero + 1)
    }, trascorso))
    return () => timer.forEach(id => window.clearTimeout(id))
  }, [aperto, mostraSaluto, numeroRoutine, visibile, movimentoRidotto, salutoPronto])

  const seguenti = useMemo(
    () => (corrente?.risposta.poi ?? []).map(id => motore.nodo(id)).filter((n): n is Nodo => Boolean(n)),
    [corrente, motore],
  )

  // Le domande di partenza: le piu' chieste, non tutte. Un elenco lungo si
  // legge come un menu di un centralino, e non aiuta a scegliere.
  const iniziali = useMemo(
    () => t.iniziali.map(id => motore.nodo(id)).filter((n): n is Nodo => Boolean(n)),
    [t, motore],
  )

  // Che cosa ODINO saprebbe rispondere a quello che stai scrivendo, mostrato
  // prima di premere invio. Sono ventitre percorsi: cercarli a ogni tasto costa
  // niente, e vedere la risposta comparire mentre si scrive dice quello che
  // ODINO sa molto meglio di un elenco di domande frequenti.
  const suggeriti = useMemo(() => {
    const testo = scritto.trim()
    if (testo.length < 3) return []
    return motore.cerca(testo, { nodoCorrente: corrente?.id, settore: settore?.slug }).slice(0, 3)
  }, [scritto, motore, corrente, settore])

  function vai(n: Nodo, dalSito: Domanda[] = []) {
    setCorrente(n)
    setNonCapito(null)
    setApprofondimenti(dalSito)
    setAperta(null)
  }

  // Ogni domanda scritta viene registrata con il suo esito: e' l'unico modo in
  // cui ODINO impara. Non impara a rispondere — senza un modello non puo' — ma
  // impara che cosa non sa, e quella lista e' il piano editoriale del sito.
  // Fallisce in silenzio: una statistica non deve rompere una conversazione.
  function registra(domanda: string, trovata: boolean, percorso?: string, fonte?: string) {
    try {
      void fetch('/api/odino/domande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domanda, trovata, percorso, fonte, pagina: window.location.pathname, lingua }),
        keepalive: true,
      }).catch(() => {})
    } catch { /* niente */ }
  }

  function invia(e: React.FormEvent) {
    e.preventDefault()
    const testo = scritto.trim()
    if (!testo) return
    setScritto('')
    const mestiere = riconosci(testo)
    if (mestiere) setSettore(mestiere)
    const dalSito = cercaDomande(testo, 3, lingua)
    // Il contesto: che cosa si stava dicendo un attimo fa. «E quanto costa?»
    // dopo la segretaria telefonica parla della segretaria, non del sito — e'
    // la cosa che chiunque da' per scontata parlando, e che ODINO perdeva.
    const trovati = motore.cerca(testo, { nodoCorrente: corrente?.id, settore: (mestiere ?? settore)?.slug })
    if (trovati.length) {
      const risposteSettore = mestiere && trovati[0].id.startsWith('settore-')
        ? domandeDelSettore(mestiere.slug, 4, lingua)
        : dalSito
      registra(testo, true, trovati[0].id)
      vai(trovati[0], risposteSettore)
      return
    }
    if (dalSito.length) {
      // Nessun percorso curato, ma il sito una risposta ce l'ha: si mostra
      // quella, con la pagina da cui viene.
      setCorrente(null)
      setNonCapito(null)
      setApprofondimenti(dalSito)
      setAperta(dalSito[0].q)
      registra(testo, true, undefined, dalSito[0].fonte.href)
      return
    }
    if (mestiere) {
      const nodoSettore = motore.nodo(`settore-${mestiere.slug}`) ?? motore.nodo('settore')!
      registra(testo, true, 'settore:' + mestiere.slug)
      vai(nodoSettore, domandeDelSettore(mestiere.slug, 4, lingua))
      return
    }
    registra(testo, false)
    setNonCapito(testo)
    setApprofondimenti([])
  }

  const avatarStato = nonCapito ? 'reassuring' : corrente ? 'speaking' : 'signature'

  // Aperto resta aperto: se una persona ha gia' cliccato, il popup non lo scaccia.
  if (!visibile) return null

  if (!aperto) {
    return (
      // Solo la mascotte, senza etichetta: il personaggio si riconosce da se' e
      // una pillola con la scritta somiglia a un banner pubblicitario. Il nome
      // resta come etichetta accessibile, che e' dove serve davvero.
      <button
        type="button"
        className={`${styles.lancio} ${mostraSaluto ? styles.salutoAttivo : ''}`}
        onClick={() => setAperto(true)}
        onPointerEnter={(evento) => {
          if (evento.pointerType !== 'touch') avviaSaluto()
        }}
        onFocus={avviaSaluto}
        aria-label={t.apri}
        title={t.apriBreve}
      >
        {/* Una sola famiglia grafica e una sola immagine completa per volta:
            il dito puntato durante la quiete, gli altri durante i
            gesti. Nessun cambio di scala, ritaglio o arto staccato. */}
        <span className={`${styles.mascotte} ${posa !== null ? styles.gestoAttivo : ''}`} aria-hidden="true">
          <span className={styles.orbita}><i /><i /><i /></span>
          <span className={`${styles.robotLayer} ${posa !== null ? styles.posaAttiva : ''}`}>
            <span className={styles.corpoBox}>
              <OdinoGambe src={POSE_ODINO[10]} className={styles.salutoFluido} attivo={!movimentoRidotto && posa === null && !mostraSaluto} />
            </span>
            {posa !== null && (
              <span
                key={`odino-posa-${posa}`}
                className={`${styles.posaOdino} ${styles.posaEntrata} ${mostraSaluto ? styles.posaSaluto : ''}`}
                data-posa={posa}
              >
                {mostraSaluto && posa === 5 && !movimentoRidotto
                  ? <OdinoSaluto src={POSE_ODINO[4]} className={styles.salutoFluido} />
                  : <Image src={POSE_ODINO[posa - 1]} alt="" fill sizes="112px" unoptimized={mostraSaluto} />}
              </span>
            )}
          </span>
        </span>
        {/* Il saluto nasce dalla mano: tre bolle salgono e diventano una sola
            nuvola vettoriale, che resta formata mentre cambiano le frasi. */}
        {vignetta && <span key={vignetta.id} data-odino-vignetta={vignetta.kind} className={styles.saluto} aria-hidden="true">
          <i className={styles.bollaUno} />
          <i className={styles.bollaDue} />
          <i className={styles.bollaTre} />
          <span className={styles.nuvola}>
            <svg viewBox="0 0 220 110" role="presentation" focusable="false">
              <defs>
                <linearGradient id="odino-nuvola-fondo" x1="30" y1="12" x2="184" y2="101" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.58" stopColor="#fffdf7" />
                  <stop offset="1" stopColor="#edf5ef" />
                </linearGradient>
                <linearGradient id="odino-nuvola-bordo" x1="28" y1="12" x2="192" y2="101" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#f1d77d" />
                  <stop offset="0.62" stopColor="#d8aa35" />
                  <stop offset="1" stopColor="#0f6b4f" />
                </linearGradient>
              </defs>
              <path
                className={styles.nuvolaSagoma}
                d="M42 95C23 95 10 84 10 68c0-15 11-26 27-28 1-16 14-28 30-26C78 3 98 1 112 11c17-8 36 0 43 15 20-4 38 10 38 27 15 4 23 16 19 29-4 13-17 19-32 18-17 4-33 4-47 0-14 6-31 6-45 1-16 5-35 3-46-6Z"
                fill="url(#odino-nuvola-fondo)"
                stroke="url(#odino-nuvola-bordo)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <path className={styles.nuvolaRiflesso} d="M39 42c5-13 17-21 31-20 11-9 28-10 40-3" />
            </svg>
            <strong className={styles.fraseVignetta}>{vignetta.text}</strong>
          </span>
        </span>}
        <span className={styles.stato} aria-hidden="true" />
      </button>
    )
  }

  return (
    <aside className={styles.pannello} role="dialog" aria-modal="false" aria-label={t.pannello} lang={inglese ? 'en' : 'it'}>
      <header className={styles.testa}>
        <span className={`${styles.avatar} ${corrente ? styles.avatarAttivo : ''}`} aria-hidden="true">
          <Image src={`/images/odino/avatar/odino-avatar-${avatarStato}.webp`} alt="" fill sizes="52px" />
        </span>
        <div>
          <strong>{ODINO_NOME}</strong>
          <small>{t.presentazione}</small>
        </div>
        <button ref={chiudiRef} type="button" className={styles.chiudi} onClick={() => setAperto(false)} aria-label={t.chiudi}>
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      <div className={styles.corpo} ref={corpoRef}>
        {nonCapito ? (
          <>
            <h2 className={styles.titolo}>{t.titoloNonSo}</h2>
            <p className={styles.testo}>{t.nonSo(nonCapito)}</p>
            {/* Il passaggio a una persona, con la domanda gia' scritta dentro.
                Prima ODINO diceva «scrivi a una persona» e lasciava il lavoro a
                chi aveva gia' fatto la fatica di formulare la domanda. */}
            <p className={styles.link}>
              <a
                href={`https://wa.me/${WHATSAPP_ODINO}?text=${encodeURIComponent(t.whatsapp(nonCapito))}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.scriviAUnaPersona}
              </a>
            </p>
          </>
        ) : !corrente ? (
          <>
            <h2 className={styles.titolo}>{t.titoloVuoto}</h2>
            <p className={styles.testo}>{t.introVuoto}</p>
            <p className={styles.testo}>{t.introVuoto2}</p>
          </>
        ) : (
          <>
            {settore && (
              <p className={styles.etichetta}>{t.settoreEtichetta(settore.nome)}</p>
            )}
            {settore && (
              <p className={styles.link}>
                <Link href={`${t.settoriBase}/${settore.slug}`}>{t.settoreLink(settore.nome)}</Link>
              </p>
            )}
            <h2 className={styles.titolo}>{corrente.risposta.titolo}</h2>
            <p className={styles.testo}>{corrente.risposta.testo}</p>

            {corrente.risposta.cifre && corrente.risposta.cifre.length > 0 && (
              <div className={styles.cifre}>
                {corrente.risposta.cifre.map(c => (
                  <div className={styles.cifra} key={c.voce}>
                    <b>{c.voce}</b>
                    <span className={styles.valore}>{c.valore}</span>
                    {c.nota && <i>{c.nota}</i>}
                  </div>
                ))}
              </div>
            )}

            {corrente.risposta.link && corrente.risposta.link.length > 0 && (
              <p className={styles.link}>
                {corrente.risposta.link.slice(0, 6).map(l => (
                  <Link key={l.href + l.label} href={l.href}>{l.label}</Link>
                ))}
              </p>
            )}
          </>
        )}

        {approfondimenti.length > 0 && (
          <div className={styles.dalSito}>
            {approfondimenti.map(d => (
              <details
                key={d.fonte.href + d.q}
                open={aperta === d.q}
                onToggle={e => setAperta(e.currentTarget.open ? d.q : null)}
              >
                <summary>{d.q}</summary>
                <p>{d.a}</p>
                <Link href={d.fonte.href}>{inglese ? 'Read more' : 'Approfondisci'}: {d.fonte.label}</Link>
              </details>
            ))}
          </div>
        )}

        <p className={styles.etichetta}>{nonCapito || !corrente ? t.frequenti : t.daQui}</p>
        <ul className={styles.domande}>
          {(nonCapito || !corrente ? iniziali : seguenti).map(n => (
            <li key={n.id}>
              <button type="button" onClick={() => vai(n)}>{n.domanda}</button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.piede}>
        {suggeriti.length > 0 && (
          <ul className={styles.suggerimenti} aria-label={t.suggerite}>
            {suggeriti.map(n => (
              <li key={n.id}>
                <button type="button" onClick={() => { setScritto(''); registra(n.domanda, true, n.id); vai(n) }}>
                  {n.domanda}
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={invia}>
          <label htmlFor="odino-domanda" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            {t.campoEtichetta}
          </label>
          <input
            id="odino-domanda"
            value={scritto}
            onChange={e => setScritto(e.target.value)}
            placeholder={t.campoPlaceholder}
            autoComplete="off"
          />
          <button type="submit" aria-label={t.invia} title={t.invia}>
            <Send size={17} aria-hidden="true" />
          </button>
        </form>
        <p className={styles.nota}>{t.nota}</p>
      </div>
    </aside>
  )
}
