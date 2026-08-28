import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, ClipboardCheck, Gauge, Search, Workflow } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { SITE_URL } from '@/lib/site-config'
import styles from '../content-page.module.css'

const title = 'Metodo di Gestione Digitale SWA | Strategia, Produzione e Controllo'
const description = 'Scopri il metodo operativo Social Web Automation: analisi, strategia, produzione, approvazione, pubblicazione e misurazione per PMI e professionisti.'
const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei capire come applicare il metodo Social Web Automation alla mia azienda.')}`

export const metadata: Metadata = { title, description, alternates:{canonical:`${SITE_URL}/metodo`}, openGraph:{title,description,url:`${SITE_URL}/metodo`}, twitter:{title,description} }

const steps = [
  { n:'01', icon:Search, title:'Analisi del punto di partenza', text:'Raccogliamo obiettivi, offerta, pubblico, canali, materiali e dati disponibili. Distinguiamo ciò che serve da ciò che aggiunge solo complessità.', items:['Audit del brand e dei canali','Priorità commerciali','Vincoli e responsabilità'] },
  { n:'02', icon:Workflow, title:'Direzione condivisa', text:'Traduciamo l’analisi in messaggi, rubriche, calendario, pagine e indicatori. Il perimetro viene approvato prima della produzione.', items:['Piano mensile','Ruoli e scadenze','Criteri di misurazione'] },
  { n:'03', icon:ClipboardCheck, title:'Produzione e approvazione', text:'Copy, visual, video e pagine seguono la stessa direzione. Il controllo umano protegge tono, correttezza e responsabilità editoriale.', items:['Produzione coordinata','Revisioni tracciate','Approvazione prima dell’uscita'] },
  { n:'04', icon:Gauge, title:'Pubblicazione e miglioramento', text:'Programmiamo, misuriamo e leggiamo i risultati utili. Il ciclo successivo parte dalle evidenze, non da impressioni isolate.', items:['Pubblicazione controllata','Report leggibile','Priorità successive'] },
]

const faq = [
  {q:'Il metodo richiede un software da imparare?',a:'No. Social Web Automation è un servizio gestito. Il portale semplifica approvazioni e risultati, mentre strategia e attività operative restano a nostro carico.'},
  {q:'Chi approva i contenuti?',a:'Il cliente mantiene il controllo editoriale. I contenuti vengono sottoposti al flusso di approvazione concordato prima della pubblicazione.'},
  {q:'Come vengono scelti i canali?',a:'Partiamo da pubblico, obiettivi, formato dell’offerta e sostenibilità produttiva. Essere presenti ovunque non è automaticamente la scelta migliore.'},
  {q:'Come misurate il lavoro?',a:'Definiamo indicatori coerenti con l’obiettivo: continuità, copertura qualificata, interazioni utili, traffico, lead o azioni sul sito. Le metriche di vanità non sostituiscono i risultati.'},
]

export default function MetodoPage(){
  const jsonLd={'@context':'https://schema.org','@graph':[{'@type':'WebPage',url:`${SITE_URL}/metodo`,name:title,description,inLanguage:'it-IT',isPartOf:{'@id':`${SITE_URL}/#website`}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_URL},{'@type':'ListItem',position:2,name:'Metodo',item:`${SITE_URL}/metodo`}]},{'@type':'FAQPage',mainEntity:faq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))}]}
  return <main id="main-content" className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}} />
    <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
    <PublicHeader ctaHref={wa} ctaLabel="Parliamo del progetto" />
    <section className={styles.hero}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Metodo</span></nav>
      <p className={styles.eyebrow}>Sistema operativo SWA</p><h1>Un metodo chiaro per trasformare obiettivi in attività verificabili.</h1>
      <p className={styles.lead}>Ogni mese segue quattro fasi: analisi, direzione, produzione e miglioramento. Il processo riduce dispersioni, rende esplicite le responsabilità e mantiene il controllo umano sulle decisioni.</p>
      <div className={styles.heroActions}><a href={wa} target="_blank" rel="noopener noreferrer" className={styles.primary}>Applichiamolo al tuo progetto <ArrowRight size={17}/></a><Link href="/pacchetti" className={styles.secondary}>Confronta i pacchetti</Link></div>
    </section>
    <nav className={styles.anchorBand} aria-label="Fasi del metodo">{steps.map(x=><a key={x.n} href={`#fase-${x.n}`}>{x.n} · {x.title.split(' ')[0]}</a>)}</nav>
    <section className={styles.section}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Le quattro fasi</p><h2>Un flusso unico, dall’analisi al report.</h2><p>Ogni fase ha un risultato atteso e prepara quella successiva. Così strategia e produzione non procedono su binari separati.</p></div><div className={styles.stepGrid}>{steps.map(({n,icon:Icon,title:textTitle,text,items})=><article id={`fase-${n}`} key={n}><span><Icon size={17}/> Fase {n}</span><h3>{textTitle}</h3><p>{text}</p><ul>{items.map(i=><li key={i}><Check size={14}/>{i}</li>)}</ul></article>)}</div></section>
    <section className={`${styles.section} ${styles.darkSection}`}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Responsabilità chiare</p><h2>AI, specialisti e cliente lavorano con ruoli distinti.</h2><p>L’automazione accelera il lavoro, ma non sostituisce direzione, verifica o responsabilità.</p></div><div className={styles.roleGrid}><article><h3>Social Web Automation</h3><p>Coordina strategia, produzione, pubblicazione, controllo qualità e report.</p></article><article><h3>Cliente</h3><p>Condivide informazioni corrette, approva e mantiene la responsabilità sulle decisioni aziendali.</p></article><article><h3>Intelligenza artificiale</h3><p>Supporta analisi e produzione entro un processo supervisionato e trasparente.</p></article></div></section>
    <section className={`${styles.section} ${styles.faqLayout}`}><div className={styles.sectionHeading}><p className={styles.eyebrow}>FAQ sul metodo</p><h2>Come funziona nella pratica.</h2></div><div className={styles.faqList}>{faq.map(x=><details key={x.q}><summary>{x.q}<span>+</span></summary><p>{x.a}</p></details>)}</div></section>
    <section className={styles.finalCta}><div><p className={styles.eyebrow}>Prima valutazione</p><h2>Partiamo dal tuo punto di partenza reale.</h2><p>Canali, obiettivi e risorse disponibili determinano il metodo più sostenibile.</p></div><a href={wa} target="_blank" rel="noopener noreferrer">Parliamo del progetto <ArrowRight size={17}/></a></section>
    <PublicFooter/><FloatingNavigation/>
  </main>
}
