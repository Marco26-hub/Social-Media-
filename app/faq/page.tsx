import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { SITE_URL } from '@/lib/site-config'
import styles from '../content-page.module.css'

const title='Domande Frequenti su Gestione Social, SEO, GEO e Siti | SWA'
const description='Risposte chiare su pacchetti, gestione social, contenuti, approvazioni, SEO, GEO, siti, budget ADS, consulenza AI e condizioni del servizio SWA.'
const wa=`https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Ho una domanda sui servizi Social Automation.')}`
const groups=[
  {title:'Servizio e processo',items:[
    {q:'Social Automation è un software o un servizio?',a:'È un servizio gestito. Il portale rende semplici approvazioni e risultati, ma strategia, produzione e pubblicazione vengono svolte dal team Social Automation.'},
    {q:'Posso approvare i contenuti prima della pubblicazione?',a:'Sì. Il processo prevede controllo e approvazione prima della pubblicazione, con il numero di revisioni indicato nel pacchetto.'},
    {q:'Quali aziende seguite?',a:'Lavoriamo soprattutto con PMI, attività locali e professionisti che vogliono coordinare social, contenuti, sito e visibilità organica.'},
  ]},
  {title:'Pacchetti e costi',items:[
    {q:'Quanto costa la gestione social?',a:'Presenza costa 390 € al mese per 2 social e 16 contenuti. Crescita costa 790 € al mese per 3 social e 24 contenuti, con un articolo SEO + GEO e gestione di una campagna ADS. IVA esclusa.'},
    {q:'Il budget pubblicitario è incluso?',a:'No. Il budget versato alle piattaforme resta separato dal canone ed è concordato in base agli obiettivi.'},
    {q:'Esiste una soluzione personalizzata?',a:'Sì. Più brand, volumi elevati, automazioni, e-commerce, produzione video e integrazioni vengono configurati dopo un’analisi iniziale.'},
  ]},
  {title:'SEO, GEO e tecnologia',items:[
    {q:'SEO e GEO garantiscono il posizionamento?',a:'No. Miglioriamo struttura, qualità, reperibilità e citabilità, ma nessuno può garantire posizioni o citazioni da parte di Google o dei sistemi AI.'},
    {q:'Usate intelligenza artificiale?',a:'Sì, come supporto ad analisi e produzione. Direzione, verifica e responsabilità editoriale restano umane.'},
    {q:'Realizzate anche siti ed e-commerce?',a:'Sì. Progettiamo siti, landing page ed e-commerce mobile-first collegati a contenuti, campagne, analytics e obiettivi commerciali.'},
  ]},
  {title:'Legale e AI compliance',items:[
    {q:'Chi eroga la consulenza legale?',a:'Le consulenze legali vengono svolte dall’Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS, professionista abilitato.'},
    {q:'La consulenza è inclusa nei pacchetti social?',a:'No. La consulenza legale è separata dai servizi di marketing e viene prenotata in base al caso concreto.'},
  ]},
]
export const metadata:Metadata={title,description,alternates:{canonical:`${SITE_URL}/faq`},openGraph:{title,description,url:`${SITE_URL}/faq`},twitter:{title,description}}
export default function FaqPage(){const all=groups.flatMap(g=>g.items);const jsonLd={'@context':'https://schema.org','@graph':[{'@type':'WebPage',url:`${SITE_URL}/faq`,name:title,description,inLanguage:'it-IT'},{'@type':'FAQPage',mainEntity:all.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_URL},{'@type':'ListItem',position:2,name:'FAQ',item:`${SITE_URL}/faq`}]}]};return <main id="main-content" className={styles.page}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/><a className={styles.skipLink} href="#main-content">Vai al contenuto</a><PublicHeader ctaHref={wa} ctaLabel="Fai una domanda"/><section className={styles.hero}><nav className={styles.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>FAQ</span></nav><p className={styles.eyebrow}>Informazioni chiare</p><h1>Domande frequenti, risposte senza ambiguità.</h1><p className={styles.lead}>Costi, attività incluse, approvazioni, SEO, GEO, tecnologia e consulenza legale: qui trovi le risposte utili prima di scegliere.</p></section><nav className={styles.anchorBand}>{groups.map((g,i)=><a key={g.title} href={`#faq-${i}`}>{g.title}</a>)}</nav>{groups.map((g,i)=><section id={`faq-${i}`} key={g.title} className={`${styles.section} ${styles.faqLayout}`}><div className={styles.sectionHeading}><p className={styles.eyebrow}>FAQ {String(i+1).padStart(2,'0')}</p><h2>{g.title}</h2></div><div className={styles.faqList}>{g.items.map(x=><details key={x.q}><summary>{x.q}<span>+</span></summary><p>{x.a}</p></details>)}</div></section>)}<section className={styles.finalCta}><div><p className={styles.eyebrow}>Non hai trovato la risposta?</p><h2>Parliamo del tuo caso concreto.</h2><p>Ti aiutiamo a capire quale perimetro è adatto prima di iniziare.</p></div><a href={wa} target="_blank" rel="noopener noreferrer">Scrivici su WhatsApp <ArrowRight size={17}/></a></section><PublicFooter/><FloatingNavigation/></main>}
