import { SETTORI } from '@/lib/settori'
import { SWA_BLOG_ARTICLES } from '@/lib/swa-blog-content'
import { FAQ_SERVIZI } from '@/lib/servizi-faq'
import { FAQ_GENERALI } from '@/lib/faq-generali'

// Tutte le domande già scritte sul sito, raccolte in un indice.
//
// Il sito contiene circa duecento domande con risposta, scritte e revisionate
// una per una. ODINO ne conosceva quindici, quelle curate a mano nei percorsi:
// tutto il resto era già pronto e inutilizzato. Qui vengono raccolte dalle
// sorgenti — non copiate — quindi correggere una risposta sul sito la corregge
// anche in ODINO, e una domanda nuova entra da sé.

export type Domanda = {
  q: string
  a: string
  /** Da dove viene, per poter linkare la pagina che la spiega per esteso. */
  fonte: { href: string; label: string }
  /** Parole della domanda, normalizzate. Pesano di più: chi chiede «disdetta»
   *  cerca la domanda sulla disdetta, non una risposta che la nomina di sfuggita. */
  termini: string[]
  /** Parole della risposta. Il vocabolario vero sta qui: una domanda è corta,
   *  una risposta contiene i sinonimi che la persona userà davvero. */
  terminiRisposta: string[]
}

/** Toglie accenti e punteggiatura: «perché» e «perche» devono pesare uguale. */
export function normalizza(testo: string): string {
  return testo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Parole che compaiono ovunque e non distinguono una domanda dall'altra.
const VUOTE = new Set([
  'che', 'cosa', 'come', 'quando', 'dove', 'chi', 'quale', 'quali', 'quanto', 'quanti', 'quante',
  'il', 'lo', 'la', 'le', 'gli', 'un', 'uno', 'una', 'del', 'della', 'dei', 'delle', 'degli',
  'di', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'al', 'alla', 'ai', 'alle', 'nel', 'nella',
  'e', 'o', 'ma', 'se', 'non', 'ci', 'si', 'mi', 'ti', 'vi', 'ne', 'a',
  'essere', 'avere', 'fare', 'puo', 'posso', 'devo', 'serve', 'sono', 'sei', 'ho', 'hai',
  'mio', 'mia', 'miei', 'tuo', 'tua', 'vostro', 'nostra', 'questo', 'questa', 'anche', 'piu',
])

export function termini(testo: string): string[] {
  return normalizza(testo)
    .split(' ')
    .filter(p => p.length > 2 && !VUOTE.has(p))
}

function costruisci(): Domanda[] {
  const out: Domanda[] = []

  for (const s of SETTORI) {
    for (const f of s.faq) {
      out.push({
        q: f.q,
        a: f.a,
        fonte: { href: `/settori/${s.slug}`, label: s.nome },
        // Il nome del settore entra fra i termini: «quanto costa per un dentista»
        // deve trovare la risposta della pagina dentisti, non quella generica.
        termini: [...termini(f.q), ...termini(s.nome), ...termini(s.slug.replace(/-/g, ' '))],
        terminiRisposta: termini(f.a),
      })
    }
  }

  for (const a of SWA_BLOG_ARTICLES) {
    for (const f of a.faq ?? []) {
      out.push({
        q: f.domanda,
        a: f.risposta,
        fonte: { href: `/blog/${a.slug}`, label: a.h1 },
        termini: [...termini(f.domanda), ...termini(a.h1)],
        terminiRisposta: termini(f.risposta),
      })
    }
  }

  for (const f of FAQ_SERVIZI) {
    out.push({ q: f.q, a: f.a, fonte: f.fonte, termini: [...termini(f.q), ...termini(f.fonte.label)], terminiRisposta: termini(f.a) })
  }

  // Oltre alle domande, il sito spiega molto altro: che cosa produciamo per un
  // settore, che risultato porta, come si svolge il ciclo di lavoro, e il corpo
  // degli articoli. Sono duecento blocchi di testo gia' scritti e revisionati,
  // ognuno con un titolo che funziona da domanda. Indicizzarli significa che
  // ODINO sa rispondere anche a chi non fa una delle domande previste.
  for (const s of SETTORI) {
    const blocchi = [
      ...s.cosaFacciamo.map(b => ({ t: b.title, x: b.text })),
      ...s.risultati.map(b => ({ t: b.title, x: b.text })),
      ...s.ciclo.map(b => ({ t: b.title, x: b.text })),
    ]
    for (const b of blocchi) {
      out.push({
        q: b.t,
        a: b.x,
        fonte: { href: `/settori/${s.slug}`, label: s.nome },
        termini: [...termini(b.t), ...termini(s.nome)],
        terminiRisposta: termini(b.x),
      })
    }
  }

  for (const a of SWA_BLOG_ARTICLES) {
    for (const sez of a.sezioni ?? []) {
      const testo = [...(sez.paragrafi ?? []), ...(sez.lista_punti ?? [])].join(' ')
      if (!testo) continue
      out.push({
        q: sez.h2,
        a: testo,
        fonte: { href: `/blog/${a.slug}`, label: a.h1 },
        termini: [...termini(sez.h2), ...termini(a.h1)],
        terminiRisposta: termini(testo),
      })
    }
  }

  for (const f of FAQ_GENERALI) {
    out.push({ q: f.q, a: f.a, fonte: { href: '/faq', label: 'Domande frequenti' }, termini: termini(f.q), terminiRisposta: termini(f.a) })
  }

  return out
}

export const DOMANDE: Domanda[] = costruisci()

/**
 * Cerca per sovrapposizione di termini, non per sottostringa.
 *
 * Il primo tentativo confrontava la frase con delle parole chiave scritte a
 * mano: bastava una parola diversa e ODINO non trovava niente. Qui si contano i
 * termini in comune, ignorando accenti e parole vuote, e si pesano di piu'
 * quelli lunghi — «fatturazione» distingue una domanda, «cosa» no.
 *
 * La soglia esiste apposta: sotto, ODINO dice che non sa. Una risposta vicina
 * ma sbagliata su un contratto costa piu' di una risposta mancata.
 */
/**
 * Quanto e' informativo un termine: raro = pesante.
 *
 * Il primo tentativo contava i termini in comune, e restituiva risposte
 * plausibili ma sbagliate — «posso disdire quando voglio» trovava «Quali
 * aziende seguite?», perche' «voglio» e «quando» compaiono ovunque. Una parola
 * presente in centocinquanta domande su duecento non distingue niente; una
 * presente in tre le distingue tutte. Qui il peso e' calcolato sul corpus, non
 * deciso a mano: e' la stessa idea dell'IDF, senza bisogno di un modello.
 */
const PESO = (() => {
  const conteggio = new Map<string, number>()
  for (const d of DOMANDE) {
    for (const t of new Set([...d.termini, ...d.terminiRisposta])) {
      conteggio.set(t, (conteggio.get(t) ?? 0) + 1)
    }
  }
  const totale = DOMANDE.length
  const peso = new Map<string, number>()
  for (const [t, n] of conteggio) peso.set(t, Math.log(totale / n))
  return peso
})()

function pesoDi(t: string): number {
  // Un termine che il sito non usa mai non aiuta a scegliere, ma non deve
  // nemmeno azzerare la ricerca: vale poco, non zero.
  return PESO.get(t) ?? 0.4
}

export function cercaDomande(testo: string, quante = 4): Domanda[] {
  const cercati = [...new Set(termini(testo))]
  if (!cercati.length) return []

  const pesoTotale = cercati.reduce((a, t) => a + pesoDi(t), 0)
  if (pesoTotale <= 0) return []

  const punteggi = DOMANDE.map(d => {
    const nelTitolo = new Set(d.termini)
    const nellaRisposta = new Set(d.terminiRisposta)
    let p = 0
    for (const t of cercati) {
      const w = pesoDi(t)
      if (nelTitolo.has(t)) p += w * 3
      else if (nellaRisposta.has(t)) p += w
      else if (t.length > 5) {
        const radice = t.slice(0, 5)
        if ([...nelTitolo].some(x => x.startsWith(radice))) p += w * 2
        else if ([...nellaRisposta].some(x => x.startsWith(radice))) p += w * 0.6
      }
    }
    return { d, p }
  })

  // La soglia e' relativa e volutamente alta. Con una soglia bassa la ricerca
  // trovava sempre qualcosa, e quel qualcosa era spesso sbagliato: «cosa succede
  // se sforo i minuti» finiva su una risposta che parlava di tutt'altro. Meglio
  // nessuna risposta e la domanda passata a una persona: e' la regola che il
  // sito chiede all'assistente telefonico che vende, e vale anche qui.
  const minimo = pesoTotale * 1.35
  return punteggi
    .filter(x => x.p >= minimo)
    .sort((a, b) => b.p - a.p)
    .slice(0, quante)
    .map(x => x.d)
}
