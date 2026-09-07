import { PACCHETTI } from '@/lib/pacchetti'
import { PREZZO_INGRESSO } from '@/lib/prezzi-ingresso'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { SETTORI } from '@/lib/settori'
import { SITE_URL } from '@/lib/site-config'
import { SWA_BLOG_ARTICLES } from '@/lib/swa-blog-content'
import { TITOLARE } from '@/lib/legal-config'

// /llms-full.txt
//
// llms.txt e' l'indice: dice chi siamo e dove stanno le cose. Questo e' il
// corpus, cioe' il contenuto per esteso in un file solo, per i sistemi che lo
// leggono invece di seguire cinquantasei URL. Non e' una copia del sito
// scritta a mano: viene generato dalle stesse sorgenti uniche che alimentano
// le pagine, quindi non puo' divergere. Se cambia un prezzo qui cambia da se'.

export const dynamic = 'force-static'

function sezione(titolo: string, righe: string[]): string {
  return `## ${titolo}\n\n${righe.join('\n')}\n`
}

export function GET() {
  const blocchi: string[] = []

  blocchi.push(`# Social Web Automation — corpus completo

> ${TITOLARE.ragioneSociale}, ${TITOLARE.sedeLegale}. Partita IVA ${TITOLARE.partitaIva}.
> Servizi digitali per PMI e professionisti italiani: gestione social, SEO e GEO,
> blog, siti web ed e-commerce, riprese video, ricerca clienti B2B, assistente
> telefonico AI, agenda e recupero clienti su WhatsApp, gestione delle
> lavorazioni, automazione dei gestionali e consulenza legale su AI Act e GDPR.
> Sito canonico: ${SITE_URL}. Indice sintetico: ${SITE_URL}/llms.txt
> Tutti i prezzi sono IVA esclusa.
`)

  blocchi.push(sezione('Prezzi d’ingresso', [
    ...Object.entries(PREZZO_INGRESSO).map(([id, prezzo]) => `- ${id}: ${prezzo}`),
    '',
    'I servizi indicati come «su preventivo» non hanno un listino pubblico perché il',
    'lavoro dipende dal perimetro. Il preventivo viene scritto prima di cominciare.',
  ]))

  blocchi.push(sezione('Pacchetti social', PACCHETTI.flatMap(p => [
    ``,
    `### ${p.nome} — ${p.prezzo} al mese, ${p.setup.toLowerCase()}`,
    `Per: ${p.eyebrow}. ${p.sottotitolo}`,
    `È adatto se: ${p.idealePer}`,
    ...(p.includeDa ? [`Comprende tutto di ${p.includeDa}, più:`] : []),
    ...p.features.map(f => `- ${f}`),
  ])))

  blocchi.push(sezione('Assistente telefonico e agenda', SEGRETARIA_LISTINO.flatMap(f => [
    ``,
    `### ${f.nome}`,
    ...f.piani.flatMap(p => [
      `- ${p.nome} (${p.perChi}): ${p.canone} € al mese, avvio ${p.avvio}. Compreso: ${p.soglia}. ${p.extra}`,
    ]),
  ])))

  blocchi.push(sezione('Settori seguiti', SETTORI.flatMap(s => [
    ``,
    `### ${s.nome} — ${SITE_URL}/settori/${s.slug}`,
    s.lead,
    `Che cosa promettiamo: ${s.promessa}`,
    `Prezzi: ${s.notaPrezzi}`,
    `Che cosa facciamo:`,
    ...s.cosaFacciamo.map(c => `- ${c.title}: ${c.text}`),
    `Domande frequenti:`,
    ...s.faq.map(f => `- D: ${f.q}\n  R: ${f.a}`),
  ])))

  blocchi.push(sezione('Journal', SWA_BLOG_ARTICLES.flatMap(a => [
    ``,
    `### ${a.h1} — ${SITE_URL}/blog/${a.slug}`,
    `Autore: ${a.autore}. Pubblicato: ${a.data_pubblicazione ?? 'n.d.'}`,
    a.meta_description ?? '',
    ...a.sezioni.flatMap(sz => [`**${sz.h2}**`, ...sz.paragrafi]),
    ...(a.faq.length ? ['Domande frequenti:', ...a.faq.map(f => `- D: ${f.domanda}\n  R: ${f.risposta}`)] : []),
    ...(a.fonti?.length ? ['Fonti:', ...a.fonti.map(f => `- ${f.titolo}: ${f.url}`)] : []),
  ])))

  blocchi.push(sezione('Che cosa non promettiamo', [
    '- Nessuna posizione garantita su Google e nessuna citazione garantita dai sistemi AI.',
    '- Nessun numero garantito di appuntamenti, contatti o vendite.',
    '- Le campagne a pagamento non sono comprese nei pacchetti social: si concordano a parte,',
    '  e il budget pubblicitario resta separato dal canone.',
    '- Le consulenze legali su AI Act e GDPR sono erogate dallo Studio Legale BCS,',
    '  con l’Avv. Vincenzo Sapone, cassazionista. Quanto pubblicato sul sito ha finalità',
    '  informativa e non sostituisce un parere sul caso concreto.',
    '- Nulla viene pubblicato o inviato senza l’approvazione del cliente.',
  ]))

  blocchi.push(sezione('Contatti', [
    `- Email: ${TITOLARE.email}`,
    `- PEC: ${TITOLARE.pec}`,
    `- Telefono e WhatsApp: ${TITOLARE.telefono}`,
    `- Sede: ${TITOLARE.sedeLegale}`,
    `- Partita IVA: ${TITOLARE.partitaIva}`,
  ]))

  return new Response(blocchi.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
