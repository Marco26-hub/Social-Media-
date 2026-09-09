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

let salutoMostrato = false

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
  const [mostraSaluto, setMostraSaluto] = useState(false)
  const salutoControllato = useRef(false)
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
  useEffect(() => {
    if (!visibile || aperto) { setMostraSaluto(false); return }
    if (salutoControllato.current) return
    salutoControllato.current = true
    let giaSalutato = salutoMostrato
    try {
      giaSalutato ||= sessionStorage.getItem('swa-odino-saluto') === '1'
      sessionStorage.setItem('swa-odino-saluto', '1')
    } catch { /* Il saluto resta unico anche con lo storage non disponibile. */ }
    salutoMostrato = true
    if (!giaSalutato) setMostraSaluto(true)
  }, [visibile, aperto])
  useEffect(() => {
    if (!visibile) { mostraMascotte(false); return }
    if (aperto) { occupaAngolo('odino'); mostraMascotte(false) }
    else { liberaAngolo('odino'); mostraMascotte(true) }
  }, [visibile, aperto])
  useEffect(() => () => { liberaAngolo('odino'); mostraMascotte(false) }, [])

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

  function inclinaMascotte(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.pointerType === 'touch') return
    const box = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - box.left) / box.width - .5
    const y = (e.clientY - box.top) / box.height - .5
    e.currentTarget.style.setProperty('--odino-rotate-x', `${(-y * 12).toFixed(2)}deg`)
    e.currentTarget.style.setProperty('--odino-rotate-y', `${(x * 16).toFixed(2)}deg`)
  }

  function raddrizzaMascotte(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.setProperty('--odino-rotate-x', '0deg')
    e.currentTarget.style.setProperty('--odino-rotate-y', '0deg')
  }

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
        onPointerMove={inclinaMascotte}
        onPointerLeave={raddrizzaMascotte}
        aria-label={t.apri}
        title={t.apriBreve}
      >
        {/* La mascotte e' un'immagine sola, e un'immagine sola non muove le
            braccia. Qui ne stanno tre copie ritagliate: il corpo senza il
            braccio che saluta e senza le gambe, il braccio da solo che ruota
            sulla spalla, le gambe da sole che oscillano sulle anche. Ogni
            copia mostra solo il suo pezzo, cosi' non si vede niente di doppio.
            Le palpebre sono due rettangoli del colore del visore che scendono
            sugli occhi: il battito. La scatola ha le proporzioni esatte
            dell'immagine (2:3), altrimenti le percentuali dei ritagli
            finirebbero sulla fascia vuota ai lati. */}
        <span className={styles.mascotte} aria-hidden="true">
          <span className={styles.robotLayer}>
            <span className={styles.corpoBox}>
              <span className={`${styles.strato} ${styles.tronco}`}>
                <Image src="/images/odino-mascotte.webp" alt="" fill sizes="112px" priority />
              </span>
              <span className={`${styles.strato} ${styles.gambe}`}>
                <Image src="/images/odino-mascotte.webp" alt="" fill sizes="112px" />
              </span>
              <span className={`${styles.strato} ${styles.braccio}`}>
                <Image src="/images/odino-mascotte.webp" alt="" fill sizes="112px" />
              </span>
              <span className={`${styles.palpebra} ${styles.palpebraSinistra}`} />
              <span className={`${styles.palpebra} ${styles.palpebraDestra}`} />
            </span>
          </span>
        </span>
        {/* Il saluto nasce dalla mano: tre bolle salgono e diventano una sola
            nuvola vettoriale, che resta formata mentre cambiano le frasi. */}
        {mostraSaluto && <span className={styles.saluto} aria-hidden="true">
          <i className={styles.bollaUno} />
          <i className={styles.bollaDue} />
          <i className={styles.bollaTre} />
          <span
            className={styles.nuvola}
            onAnimationEnd={(evento) => {
              if (evento.currentTarget === evento.target) setMostraSaluto(false)
            }}
          >
            <svg viewBox="0 0 220 110" role="presentation" focusable="false">
              <defs>
                <linearGradient id="odino-nuvola-fondo" x1="30" y1="12" x2="184" y2="101" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.58" stopColor="#fffdf7" />
                  <stop offset="1" stopColor="#f8f1df" />
                </linearGradient>
                <linearGradient id="odino-nuvola-bordo" x1="28" y1="12" x2="192" y2="101" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#f1d77d" />
                  <stop offset="0.5" stopColor="#d8aa35" />
                  <stop offset="1" stopColor="#ed785d" />
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
            <span className={styles.scintille} />
            <strong className={styles.presentazione}>{inglese ? "Hi, I'm Odino!" : 'Ciao, sono Odino!'}</strong>
            <strong className={styles.aiuto}>{inglese ? 'Can I help you?' : 'Posso aiutarti?'}</strong>
            <strong className={styles.invito}>{invitoSaluto}</strong>
          </span>
        </span>}
        <span className={styles.stato} aria-hidden="true" />
      </button>
    )
  }

  return (
    <aside className={styles.pannello} role="dialog" aria-modal="false" aria-label={t.pannello} lang={inglese ? 'en' : 'it'}>
      <header className={styles.testa}>
        <span className={styles.avatar} aria-hidden="true">
          <Image src="/images/odino-mascotte.webp" alt="" fill sizes="52px" />
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
