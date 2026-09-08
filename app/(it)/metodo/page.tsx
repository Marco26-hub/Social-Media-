import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, ClipboardCheck, Gauge, Search, Workflow } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { METODO_SERVIZI, titoloMetodo } from '@/lib/metodo'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/styles/content-page.module.css'

const title = 'Metodo SWA: le quattro fasi, servizio per servizio | SWA'
const description = 'Il metodo operativo Social Web Automation: analisi, direzione, produzione e miglioramento, e come le quattro fasi si applicano a social, SEO, blog, siti, video, telefono e automazioni.'
const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei capire come applicare il metodo Social Web Automation alla mia azienda.')}`

export const metadata: Metadata = { title, description, alternates:{canonical:`${SITE_URL}/metodo`,languages:{'it-IT':`${SITE_URL}/metodo`,en:`${SITE_URL}/en/method`,'x-default':`${SITE_URL}/metodo`}}, openGraph:{title,description,url:`${SITE_URL}/metodo`, images: anteprimaOg('/metodo'), type: 'website',}, twitter:{title,description} }

const steps = [
  { n:'01', icon:Search, title:'Analisi del punto di partenza', text:'Raccogliamo obiettivi, offerta, pubblico, canali, materiali e dati disponibili. Distinguiamo ciò che serve da ciò che aggiunge solo complessità.', items:['Audit del brand e dei canali','Priorità commerciali','Vincoli e responsabilità'] },
  { n:'02', icon:Workflow, title:'Direzione condivisa', text:'Traduciamo l’analisi in messaggi, rubriche, calendario, pagine e indicatori. Attività incluse e responsabilità vengono approvate prima della produzione.', items:['Piano mensile','Ruoli e scadenze','Criteri di misurazione'] },
  { n:'03', icon:ClipboardCheck, title:'Produzione e approvazione', text:'Copy, visual, video e pagine seguono la stessa direzione. Il controllo umano protegge tono, correttezza e responsabilità editoriale.', items:['Produzione coordinata','Revisioni tracciate','Approvazione prima dell’uscita'] },
  { n:'04', icon:Gauge, title:'Pubblicazione e miglioramento', text:'Programmiamo, misuriamo e leggiamo i risultati utili. Il ciclo successivo parte dalle evidenze, non da impressioni isolate.', items:['Pubblicazione controllata','Report leggibile','Priorità successive'] },
]

const faq = [
  {q:'Il metodo è lo stesso per tutti i servizi?',a:'La struttura sì, i passaggi no. Ogni servizio attraversa le stesse quattro fasi — si analizza il punto di partenza, si concorda la direzione, si produce con approvazione, si misura — ma il contenuto delle fasi cambia: per il social è il calendario editoriale, per la SEO è la mappa degli intenti, per la segretaria telefonica è il collegamento fra numero e agenda. Il metodo di ciascuno dei dieci servizi è scritto qui sotto e per esteso sulla pagina del servizio.'},
  {q:'Dove trovo il metodo di un singolo servizio?',a:'Sulla pagina del servizio, nella sezione «Come funziona, passo per passo». Da questa pagina ogni scheda porta direttamente a quel punto. Le fasi sono le stesse che leggi nella scheda, con il testo completo di ogni passaggio.'},
  {q:'Il metodo richiede un software da imparare?',a:'No. Social Web Automation è un servizio gestito. Il portale semplifica approvazioni e risultati, mentre strategia e attività operative restano a nostro carico.'},
  {q:'Chi approva i contenuti?',a:'Il cliente mantiene il controllo editoriale. I contenuti vengono sottoposti al flusso di approvazione concordato prima della pubblicazione.'},
  {q:'Come vengono scelti i canali?',a:'Partiamo da pubblico, obiettivi, formato dell’offerta e sostenibilità produttiva. Essere presenti ovunque non è automaticamente la scelta migliore.'},
  {q:'Come misurate il lavoro?',a:'Definiamo indicatori coerenti con l’obiettivo: continuità, copertura qualificata, interazioni utili, traffico, lead o azioni sul sito. Le metriche di vanità non sostituiscono i risultati.'},
]

export default function MetodoPage(){
  const jsonLd={'@context':'https://schema.org','@graph':[
    {'@type':'WebPage',url:`${SITE_URL}/metodo`,name:title,description,inLanguage:'it-IT',isPartOf:{'@id':`${SITE_URL}/#website`}},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_URL},{'@type':'ListItem',position:2,name:'Metodo',item:`${SITE_URL}/metodo`}]},
    // Le quattro fasi generali come sequenza ordinata, non come paragrafo.
    {'@type':'HowTo','@id':`${SITE_URL}/metodo#howto`,name:'Il metodo operativo Social Web Automation, fase per fase',description,inLanguage:'it-IT',step:steps.map((s,i)=>({'@type':'HowToStep',position:i+1,name:s.title,text:s.text,url:`${SITE_URL}/metodo#fase-${s.n}`}))},
    // I dieci metodi di servizio: qui l'elenco con i rimandi, il HowTo di
    // ciascuno sta sulla pagina del servizio, dove il testo e' visibile.
    {'@type':'ItemList','@id':`${SITE_URL}/metodo#metodi-servizio`,name:'Il metodo applicato a ogni servizio Social Web Automation',itemListOrder:'https://schema.org/ItemListOrderAscending',numberOfItems:METODO_SERVIZI.length,itemListElement:METODO_SERVIZI.map((s,i)=>({'@type':'ListItem',position:i+1,name:titoloMetodo(s.slug),url:`${SITE_URL}${s.href}#metodo`}))},
    {'@type':'FAQPage',mainEntity:faq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))},
  ]}
  return <main id="main-content" className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}} />
    <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
    <PublicHeader ctaHref={wa} ctaLabel="Parliamo del progetto" />
    <section className={styles.hero}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Metodo</span></nav>
      <p className={styles.eyebrow}>Sistema operativo SWA</p><h1>Un metodo chiaro per trasformare obiettivi in attività verificabili.</h1>
      <p className={styles.lead}>Ogni mese segue quattro fasi: analisi, direzione, produzione e miglioramento. Le stesse quattro valgono per tutti e dieci i servizi, dai social alla segretaria telefonica: cambia che cosa si produce, non come si decide, si approva e si misura.</p>
      <div className={styles.heroActions}><a href={wa} target="_blank" rel="noopener noreferrer" className={styles.primary}>Applichiamolo al tuo progetto <ArrowRight size={17}/></a><Link href="#metodi-servizio" className={styles.secondary}>Il metodo servizio per servizio</Link></div>
    </section>
    <nav className={styles.anchorBand} aria-label="Fasi del metodo">{steps.map(x=><a key={x.n} href={`#fase-${x.n}`}>{x.n} · {x.title.split(' ')[0]}</a>)}<a href="#metodi-servizio">Metodo per servizio</a></nav>
    <section className={styles.section}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Le quattro fasi</p><h2>Un flusso unico, dall’analisi al report.</h2><p>Ogni fase ha un risultato atteso e prepara quella successiva. Così strategia e produzione non procedono su binari separati.</p></div><div className={styles.stepGrid}>{steps.map(({n,icon:Icon,title:textTitle,text,items})=><article id={`fase-${n}`} key={n}><span><Icon size={17}/> Fase {n}</span><h3>{textTitle}</h3><p>{text}</p><ul>{items.map(i=><li key={i}><Check size={14}/>{i}</li>)}</ul></article>)}</div></section>
    <section id="metodi-servizio" className={styles.section}>
      <div className={styles.sectionHeading}><p className={styles.eyebrow}>Il metodo, servizio per servizio</p><h2>Le stesse quattro fasi, dieci lavori diversi.</h2><p>Un piano editoriale e un collegamento fra gestionali non si costruiscono allo stesso modo, ma seguono lo stesso ciclo. Qui trovi i passaggi di ciascun servizio e che cosa esce alla fine; il testo completo di ogni fase è sulla pagina del servizio.</p></div>
      <div className={styles.methodMap}>{METODO_SERVIZI.map(({slug,href,label,icon:Icon,consegna,fasi})=>
        <article key={slug} id={`metodo-${slug}`}>
          <span><Icon size={16}/> Come funziona</span>
          <h3>{label}</h3>
          <p><strong>Che cosa esce:</strong> {consegna}</p>
          <ol>{fasi.map(f=><li key={f.number}><b>{f.number}</b><span>{f.title}</span></li>)}</ol>
          <Link href={`${href}#metodo`}>Metodo completo di {label} <ArrowRight size={15}/></Link>
        </article>
      )}</div>
    </section>
    <section className={`${styles.section} ${styles.darkSection}`}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Responsabilità chiare</p><h2>AI, specialisti e cliente lavorano con ruoli distinti.</h2><p>L’automazione accelera il lavoro, ma non sostituisce direzione, verifica o responsabilità.</p></div><div className={styles.roleGrid}><article><h3>Social Web Automation</h3><p>Coordina strategia, produzione, pubblicazione, controllo qualità e report.</p></article><article><h3>Cliente</h3><p>Condivide informazioni corrette, approva e mantiene la responsabilità sulle decisioni aziendali.</p></article><article><h3>Intelligenza artificiale</h3><p>Supporta analisi e produzione entro un processo supervisionato e trasparente.</p></article></div></section>
    <section className={`${styles.section} ${styles.faqLayout}`}><div className={styles.sectionHeading}><p className={styles.eyebrow}>FAQ sul metodo</p><h2>Come funziona nella pratica.</h2></div><div className={styles.faqList}>{faq.map(x=><details key={x.q}><summary>{x.q}<span>+</span></summary><p>{x.a}</p></details>)}</div></section>
    <section className={styles.finalCta}><div><p className={styles.eyebrow}>Prima valutazione</p><h2>Partiamo dal tuo punto di partenza reale.</h2><p>Canali, obiettivi e risorse disponibili determinano il metodo più sostenibile.</p></div><a href={wa} target="_blank" rel="noopener noreferrer">Parliamo del progetto <ArrowRight size={17}/></a></section>
    <PublicFooter/><FloatingNavigation/>
  </main>
}
