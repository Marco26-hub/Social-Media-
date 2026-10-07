'use client';
import {useState} from 'react';import Link from 'next/link';import {Search,ArrowRight} from 'lucide-react';
import type {SwaTool} from '@/lib/ecosystem/marketplace';
import {toolHref} from '@/lib/ecosystem/paths';import {ToolIcon} from './ToolIcon';
const tabs=['Tutti','Marketing & contenuti','Fisco & finanza','Studio & professioni','AI & automazioni'];
export default function Catalog({tools}:{tools:SwaTool[]}){
 const [tab,setTab]=useState('Tutti');const [query,setQuery]=useState('');
 const shown=tools.filter(t=>(tab==='Tutti'||t.copy.category===tab)&&(t.copy.name+' '+t.copy.summary).toLocaleLowerCase('it').includes(query.toLocaleLowerCase('it')));
 return <section id="strumenti" className="swa-section swa-catalog">
 <div className="swa-section-top"><div><p className="swa-kicker">IL MARKETPLACE SWA</p><h2>Il tool giusto.<br/><em>Per il tuo prossimo passo.</em></h2></div><p>Contenuti, numeri, documenti e automazioni.<br/>Scegli da dove vuoi iniziare.</p></div>
 <div className="swa-catalog-controls"><div className="swa-filters" role="group" aria-label="Filtra per categoria">{tabs.map(t=><button key={t} type="button" aria-pressed={tab===t} onClick={()=>setTab(t)}>{t}</button>)}</div>
 <label className="swa-search"><Search size={17} aria-hidden="true"/><input type="search" placeholder="Cerca uno strumento" aria-label="Cerca uno strumento" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
 <p className="swa-result-count" aria-live="polite">{shown.length} strumenti {tab!=='Tutti'?'· '+tab:'da esplorare'}</p>
 <div className="swa-tool-grid">{shown.map((tool,index)=><article key={tool.id} className={'swa-tool-card '+(tool.id==='ugc'?'featured':'')}>
 <div className="swa-card-top"><span className="swa-tool-icon"><ToolIcon name={tool.copy.icon}/></span><span className="swa-tag">{tool.is_coming_soon?'In preparazione':tool.id==='ugc'?'In primo piano':tool.copy.category}</span></div>
 <h3>{tool.copy.name}</h3><p>{tool.copy.summary}</p>
 <div className="swa-card-bottom"><Link href={toolHref(tool.id)} prefetch={false}>{tool.is_coming_soon?'Scopri il progetto':'Scopri lo strumento'} <ArrowRight size={17} aria-hidden="true"/></Link><span className="swa-card-number">{String(index+1).padStart(2,'0')}</span></div></article>)}</div>
 {shown.length===0&&<div className="swa-empty">Nessuno strumento trovato. Prova un’altra parola oppure <button onClick={()=>{setQuery('');setTab('Tutti');}}>mostra tutti gli strumenti</button>.</div>}
 </section>;
}
