import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import Link from 'next/link';
import {ArrowRight,ArrowUpRight,Check} from 'lucide-react';
import {getSwaTools,toolSlug,toolHref,contactHref,SWA_URL} from '@/lib/ecosystem/marketplace';
import {ToolIcon} from '@/components/ecosystem/ToolIcon';
import VideoPlayer from '@/components/ecosystem/VideoPlayer';
import {JsonLd} from '@/components/ecosystem/StructuredData';
async function findTool(slug:string){return (await getSwaTools()).find(t=>toolSlug(t.id)===slug);}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const tool=await findTool(slug);if(!tool)return {};
 return {title:tool.copy.name+' — '+tool.copy.summary,description:tool.copy.intro,alternates:{canonical:toolHref(tool.id)},openGraph:{title:tool.copy.name+' | SWA',description:tool.copy.summary,url:toolHref(tool.id)}};
}
export default async function ToolPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(slug==='softi')redirect('/marketplace/mercati-finanziari-analyzer');
 const tool=await findTool(slug);if(!tool)notFound();const c=tool.copy;
 const entry=tool.is_internal?('/tools/workspace/'+tool.id):(tool.cta_href||contactHref('informazioni su '+c.name));
 const primary=tool.is_coming_soon?contactHref('informazioni sul progetto '+c.name):tool.id==='ugc'?'#prova':entry;
 const related=(await getSwaTools()).filter(t=>t.id!==tool.id&&!t.is_coming_soon).sort((a,b)=>Number(b.copy.category===c.category)-Number(a.copy.category===c.category)).slice(0,3);
 const schema={'@context':'https://schema.org','@graph':[
 {'@type':'WebPage',name:c.name+' | SWA',url:SWA_URL+toolHref(tool.id),description:c.intro},
 {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Marketplace SWA',item:SWA_URL+'/marketplace'},{'@type':'ListItem',position:2,name:c.name,item:SWA_URL+toolHref(tool.id)}]},
 ...(!tool.is_coming_soon?[{'@type':'SoftwareApplication',name:c.name,applicationCategory:'BusinessApplication',operatingSystem:'Web',description:c.summary,url:SWA_URL+toolHref(tool.id)}]:[])
 ]};
 return <main id="main-content" className="swa-detail"><JsonLd data={schema}/>
 <section className="swa-section swa-detail-hero"><nav className="swa-breadcrumb" aria-label="Percorso"><Link href="/marketplace">Marketplace</Link><span>/</span><span>{c.name}</span></nav>
 <div className="swa-detail-split"><div><p className="swa-kicker">{c.category} · SWA TOOLS</p><h1>{c.headline}</h1><p className="swa-detail-intro">{c.intro}</p><div className="swa-actions"><a href={primary} className="swa-button">{c.action}<ArrowUpRight size={18}/></a><a href="#come-funziona" className="swa-text-link">Come funziona <ArrowRight size={17}/></a></div></div>
 {tool.id==='ugc'?<div className="swa-detail-reel"><VideoPlayer src="/marketplace-media/odino-reel.mp4" poster="/marketplace-media/odino-reel.jpg" title="Odino presenta UGC Video Creator" vertical/><span className="swa-small">Odino racconta · Episodio 01</span></div>:
 <aside className="swa-detail-panel"><span className="swa-detail-icon"><ToolIcon name={c.icon} size={46}/></span><p className="swa-kicker">UNO STRUMENTO DEL MARKETPLACE SWA</p><h2>{c.name}</h2><p>{c.summary}</p><ul>{c.benefits.map(([t])=><li key={t}><Check size={17}/>{t}</li>)}</ul><span className="swa-panel-status"><span/>{tool.is_coming_soon?'In preparazione':'Scopri il percorso di accesso'}</span></aside>}
 </div></section>
 <section className="swa-audience"><div className="swa-section"><p className="swa-kicker">PENSATO PER</p><p>{c.audience}</p></div></section>
 <section className="swa-section"><div className="swa-section-top"><div><p className="swa-kicker">DAL BISOGNO AL RISULTATO</p><h2>Cosa puoi<br/><em>fare con questo tool.</em></h2></div><p>Un punto di partenza concreto.<br/>Con il controllo sempre nelle tue mani.</p></div><div className="swa-benefits">{c.benefits.map(([t,d],i)=><article key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
 <section id="come-funziona" className="swa-method"><div className="swa-section"><p className="swa-kicker">COME FUNZIONA</p><h2>Tre passi.<br/><em>Una direzione chiara.</em></h2><div className="swa-steps">{c.steps.map(([t,d],i)=><div key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>
 {tool.id==='ugc'?<section id="prova" className="swa-section swa-trial"><div><p className="swa-kicker">DAL REEL AL TUO PRODOTTO</p><h2>Il prossimo esempio<br/><em>può essere il tuo.</em></h2><p>Raccontaci che prodotto vuoi presentare. Il team SWA ti conferma cosa inviare, il contenuto della prova gratuita e i tempi di consegna.</p><a className="swa-button" href={contactHref('richiedere una prova gratuita di UGC Video Creator per il mio prodotto')}>Richiedi la prova su WhatsApp <ArrowUpRight size={18}/></a><p className="swa-small">La richiesta apre una conversazione con SWA. Nessuna generazione viene avviata da questo pulsante.</p></div><aside><p className="swa-kicker">HAI GIÀ UN ACCESSO?</p><h3>Entra nel tuo strumento.</h3><p>Usa il generatore con le condizioni e i crediti previsti dal tuo piano.</p><a className="swa-text-link" href={entry}>Apri UGC Video Creator <ArrowUpRight size={18}/></a></aside></section>:
 <section className="swa-section swa-trial"><div><p className="swa-kicker">ACCESSO ALLO STRUMENTO</p><h2>{tool.is_coming_soon?'Prepariamo il prossimo passo.':'Pronto a iniziare?'}</h2><p>{tool.is_coming_soon?'Il progetto è in preparazione. Raccontaci quali attività vorresti semplificare.':'Apri lo strumento e verifica funzionalità, disponibilità e condizioni del piano prima di procedere.'}</p><a className="swa-button" href={primary}>{c.action}<ArrowUpRight size={18}/></a></div><aside><p className="swa-kicker">IL SUPPORTO SWA</p><h3>Hai un caso particolare?</h3><p>Partiamo dal tuo obiettivo per capire come inserire lo strumento nel tuo lavoro.</p><a className="swa-text-link" href={contactHref('valutare '+c.name+' per la mia attività')}>Confrontati con SWA <ArrowUpRight size={18}/></a></aside></section>}
 <section className="swa-section swa-faq"><div><p className="swa-kicker">DOMANDE UTILI</p><h2>Prima di<br/><em>fare il prossimo passo.</em></h2></div><div>{c.faq.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
 <section className="swa-related swa-section"><div className="swa-section-top"><div><p className="swa-kicker">CONTINUA A ESPLORARE</p><h2>Altri strumenti SWA.</h2></div><Link className="swa-text-link" href="/marketplace#strumenti">Tutto il marketplace <ArrowRight size={17}/></Link></div><div className="swa-tool-grid">{related.map(t=><article className="swa-tool-card" key={t.id}><span className="swa-tool-icon"><ToolIcon name={t.copy.icon}/></span><h3>{t.copy.name}</h3><p>{t.copy.summary}</p><Link href={toolHref(t.id)} prefetch={false} className="swa-text-link">Scopri lo strumento <ArrowRight size={17}/></Link></article>)}</div></section>
 </main>;
}
