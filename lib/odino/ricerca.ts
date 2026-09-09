import { termini } from '@/lib/odino/domande'

// Il motore di ricerca dei percorsi, staccato dai percorsi.
//
// Serviva staccarlo perche' ODINO adesso parla due lingue: gli stessi pesi e le
// stesse regole valgono per l'italiano e per l'inglese, e tenerne due copie
// significherebbe correggerne una sola la prossima volta.
//
// Nessun modello. Si contano le parole, si pesano, e se nessun percorso arriva
// alla soglia ODINO lo dice invece di rispondere a caso.

export type Risposta = {
  /** Il titolo della risposta: risponde alla domanda, non la ripete. */
  titolo: string
  testo: string
  /** Cifre da mostrare in evidenza, già formattate. */
  cifre?: { voce: string; valore: string; nota?: string }[]
  /** Dove andare per approfondire. */
  link?: { href: string; label: string }[]
  /** Domande che nascono da questa risposta. */
  poi?: string[]
}

export type Nodo = {
  id: string
  /** Come la persona formula la domanda, non come la formuleremmo noi. */
  domanda: string
  /** Parole con cui questa domanda si riconosce, se qualcuno scrive invece di cliccare. */
  chiavi: string[]
  risposta: Risposta
}

/** Che cosa si stava dicendo prima di questa domanda. */
export type Contesto = {
  /** Il percorso aperto adesso: le sue continuazioni pesano di piu'. */
  nodoCorrente?: string
  /** Il mestiere gia' dichiarato, se c'e'. */
  settore?: string
}

/**
 * Quanto due parole si somigliano, fermandosi appena diventa inutile saperlo.
 *
 * Serve per i refusi: chi scrive «segretria» o «ristorane» cerca la segretaria
 * e il ristorante. Prima ci arrivava un confronto sui primi caratteri, che pero'
 * faceva combaciare anche «contratto» con «controllo» — cinque lettere in comune
 * e due significati che non si toccano — e «quanto dura il contratto» rispondeva
 * col prezzo dei social.
 */
function vicine(a: string, b: string, massimo: number): boolean {
  if (Math.abs(a.length - b.length) > massimo) return false
  let riga = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const nuova = [i]
    let minimo = i
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1
      nuova[j] = Math.min(riga[j] + 1, nuova[j - 1] + 1, riga[j - 1] + costo)
      minimo = Math.min(minimo, nuova[j])
    }
    if (minimo > massimo) return false
    riga = nuova
  }
  return riga[b.length] <= massimo
}

/** Un refuso, o una parola troncata: «gestion» per «gestionale». */
export function somigliano(cercata: string, chiave: string): boolean {
  if (chiave.startsWith(cercata) && cercata.length >= 4 && chiave.length - cercata.length <= 4) return true
  // Il plurale cambia l'ultima lettera: «siti» e «sito», «bookings» e «booking».
  if (cercata.length >= 4 && cercata.length === chiave.length && cercata.slice(0, -1) === chiave.slice(0, -1)) return true
  if (cercata.length < 6) return false
  return vicine(cercata, chiave, cercata.length >= 8 ? 2 : 1)
}

export type Motore = {
  nodi: Nodo[]
  nodo(id: string): Nodo | undefined
  cerca(testo: string, contesto?: Contesto): Nodo[]
}

export function motore(NODI: Nodo[]): Motore {
  // Le chiavi e la prosa non valgono uguale, ed e' la correzione piu'
  // importante fatta a questa ricerca.
  //
  // Le chiavi sono scritte a mano: dicono di che cosa parla il percorso. Le
  // parole della domanda e del titolo ci finiscono dentro per caso — «fate»,
  // «tutto», «mesi», «funziona». Mettendole nello stesso insieme, e pesandole
  // con l'IDF su una ventina di nodi, una parola qualunque che capita in un
  // titolo solo sembrava distintiva quanto «disdetta»: «fate sconti» finiva su
  // «farsi trovare» per la parola «fate», «chi approva i post» sul prezzo dei
  // social per la parola «post». Rispondere alla domanda sbagliata con
  // sicurezza e' peggio che dire «questa non la so».
  //
  // Ora la prosa puo' solo rafforzare un percorso che le chiavi hanno gia'
  // scelto. Da sola non ne apre nessuno.
  //
  // Una chiave di piu' parole vale come frase: «quanto costa» spezzato dava a
  // «quanto» il potere di aprire da solo il percorso dei social.
  const CHIAVI = new Map<string, Set<string>>(
    NODI.map(n => [n.id, new Set(n.chiavi.filter(k => termini(k).length === 1).flatMap(k => termini(k)))]),
  )

  const FRASI = new Map<string, string[][]>(
    NODI.map(n => [n.id, n.chiavi.map(k => termini(k)).filter(parti => parti.length > 1)]),
  )

  const PROSA = new Map<string, Set<string>>(
    NODI.map(n => {
      const chiavi = CHIAVI.get(n.id)!
      const dalleFrasi = new Set(FRASI.get(n.id)!.flat())
      return [n.id, new Set([...termini(n.domanda), ...termini(n.risposta.titolo)]
        .filter(t => !chiavi.has(t) && !dalleFrasi.has(t)))]
    }),
  )

  /**
   * Peso di un termine fra i percorsi: «costa» compare in quasi tutti e non
   * sceglie niente, «disdetta» compare in uno e sceglie da solo. Senza questo,
   * «quanto costa il blog» finiva sul percorso social perche' arrivava prima
   * nell'elenco: un pareggio risolto dall'ordine di scrittura, non dal senso.
   */
  const PESO = (() => {
    const conta = new Map<string, number>()
    for (const n of NODI) {
      const suoi = new Set([...CHIAVI.get(n.id)!, ...FRASI.get(n.id)!.flat(), ...PROSA.get(n.id)!])
      for (const t of suoi) conta.set(t, (conta.get(t) ?? 0) + 1)
    }
    const peso = new Map<string, number>()
    for (const [t, c] of conta) peso.set(t, Math.log(NODI.length / c) + 0.3)
    return peso
  })()

  function nodo(id: string): Nodo | undefined {
    return NODI.find(n => n.id === id)
  }

  function cerca(testo: string, contesto?: Contesto): Nodo[] {
    const cercati = [...new Set(termini(testo))]
    if (!cercati.length) return []
    // La prima parola piena di una domanda e' quasi sempre l'intento: in «chi
    // approva i post» il verbo dice che si chiede dell'approvazione, e «post»
    // e' solo l'oggetto. Senza questo peso i due percorsi pareggiavano e
    // vinceva quello scritto prima nel file.
    const primaParola = cercati[0]
    // Le continuazioni del percorso aperto adesso. «E quanto costa?» dopo la
    // segretaria telefonica parla della segretaria, non del sito: e' la cosa
    // che chiunque dia per scontata parlando, e che ODINO prima perdeva.
    const seguenti = new Set(contesto?.nodoCorrente ? (nodo(contesto.nodoCorrente)?.risposta.poi ?? []) : [])

    const punteggi = NODI.map(n => {
      const chiavi = CHIAVI.get(n.id)!
      const prosa = PROSA.get(n.id)!
      let p = 0
      // Un percorso si apre solo se almeno una parola cade sulle sue chiavi.
      // Senza questa condizione bastava una parola qualunque del titolo.
      let ancorato = false
      for (const parti of FRASI.get(n.id)!) {
        if (parti.every(parte => cercati.includes(parte))) {
          p += parti.reduce((somma, parte) => somma + (PESO.get(parte) ?? 1.2), 0) * 2.5
          ancorato = true
        }
      }
      for (const t of cercati) {
        const w = PESO.get(t) ?? 1.2
        if (chiavi.has(t)) { p += w * 3 * (t === primaParola ? 1.35 : 1); ancorato = true }
        else if ([...chiavi].some(x => somigliano(t, x))) { p += w * 2; ancorato = true }
        else if (prosa.has(t)) p += w
      }
      // Il contesto sposta un pareggio, non apre un percorso: senza ancora
      // resta zero, altrimenti una domanda fuori tema finirebbe sul seguito
      // della precedente solo perche' veniva dopo.
      if (ancorato && seguenti.has(n.id)) p *= 1.2
      return { n, p: ancorato ? p : 0 }
    })
    return punteggi.filter(x => x.p >= 2.4).sort((a, b) => b.p - a.p).map(x => x.n)
  }

  return { nodi: NODI, nodo, cerca }
}

/**
 * Il mestiere nominato nella frase, se c'e'. «Ho una gelateria» non contiene
 * nessuna parola del listino, ma dice la cosa piu' utile di tutte: chi sei. I
 * nomi non sono scritti a mano, vengono dai settori — quindi un settore nuovo
 * viene riconosciuto senza toccare ODINO.
 */
export function riconosciSettore(
  testo: string,
  settori: { slug: string; nome: string; sinonimi?: string[] }[],
): { slug: string; nome: string } | undefined {
  const cercati = termini(testo)
  if (!cercati.length) return undefined
  for (const s of settori) {
    const suoi = [...termini(s.nome), ...termini(s.slug.replace(/-/g, ' ')), ...termini((s.sinonimi ?? []).join(' '))]
      .filter(p => p.length > 4 && !['servizi', 'locali', 'services'].includes(p))
    // «gelaterie» deve riconoscere anche «gelateria»: si confronta la radice.
    if (suoi.some(p => cercati.some(c => c.slice(0, 5) === p.slice(0, 5)))) {
      return { slug: s.slug, nome: s.nome }
    }
  }
  return undefined
}
