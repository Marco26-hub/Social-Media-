import Link from 'next/link';import {ArrowRight,ArrowUpRight,Check,Sparkles} from 'lucide-react';
import {getSwaTools,contactHref} from '@/lib/ecosystem/marketplace';import type {SwaTool} from '@/lib/ecosystem/catalog';import Catalog from './Catalog';import VideoPlayer from './VideoPlayer';
const faqs=[
 ['Che cos’è il marketplace SWA?','È il punto di partenza per conoscere gli strumenti digitali selezionati da SWA. Ogni scheda spiega a cosa serve il tool, a chi è utile e come iniziare.'],
 ['Chi è Odino?','Odino è la mascotte di SWA. Nei video presenta strumenti, idee e applicazioni pratiche: il primo episodio è dedicato ai contenuti UGC, i prossimi esploreranno altri argomenti.'],
 ['Posso usare solo un tool?','Sì. Puoi partire dallo strumento che risponde alla tua esigenza. Se ti serve un percorso più ampio, SWA può affiancarti con strategia, contenuti e automazioni.'],
 ['Gli strumenti sono tutti gratuiti?','No. Ogni strumento ha le proprie condizioni: accesso gratuito, crediti o piani a pagamento. Verifica le condizioni nell’app prima di attivare un acquisto.'],
 ['Chi mi aiuta a scegliere?','Puoi parlare direttamente con SWA. Partiamo dal tuo obiettivo e ti aiutiamo a capire quale strumento o servizio ha senso per la tua attività.']
];
export default async function MarketplacePage(){
 let tools:SwaTool[]=[];let unavailable=false;
 try{tools=await getSwaTools()}catch(error){unavailable=true;console.error('[marketplace] catalogo non disponibile',error)}
 const count=tools.filter(t=>!t.is_coming_soon).length;
 return <main id="main-content" className="swa-marketplace">
 <section className="swa-hero swa-section"><div className="swa-hero-copy"><p className="swa-kicker"><span/> SWA MARKETPLACE · STRUMENTI DIGITALI</p>
 <h1>Meno passaggi.<br/>Più spazio<br/><em>alle tue idee.</em></h1>
 <p className="swa-hero-lead">I tool per creare contenuti, organizzare il lavoro e dare una direzione ai tuoi dati. Tutti da scoprire, con SWA al tuo fianco.</p>
 <div className="swa-actions"><a className="swa-button" href="#strumenti">Trova il tuo strumento <ArrowRight size={18}/></a><a className="swa-text-link" href="#odino">Lasciati guidare da Odino <ArrowUpRight size={17}/></a></div>
 <div className="swa-hero-bottom"><span><strong>{String(count).padStart(2,'0')}</strong> strumenti da esplorare</span><span className="swa-mini-rule"/><span>Un’esigenza concreta.<br/>Un punto da cui partire.</span></div></div>
 <div className="swa-hero-art"><div className="swa-art-grid"/><span className="swa-art-label"><Sparkles size={14}/> PIACERE, SONO ODINO.</span><div className="swa-art-orbit orbit-one"/><div className="swa-art-orbit orbit-two"/>
 <img src="/marketplace-media/odino.webp" width="480" height="853" alt="Odino, la mascotte di SWA" fetchPriority="high" className="swa-odino-image"/>
 <div className="swa-art-note"><span className="swa-status-dot"/><div><strong>Un mondo di tool. Te lo presento io.</strong><span>Idee, esempi e nuovi modi di lavorare.</span></div><ArrowUpRight size={21}/></div><span className="swa-art-caption">TECNOLOGIA + DIREZIONE UMANA</span></div></section>
 <div className="swa-value-strip"><div><span>01</span> Strumenti per esigenze reali</div><div><span>02</span> Applicazioni da esplorare</div><div><span>03</span> Il supporto di SWA</div></div>
 <section id="odino" className="swa-section swa-feature" aria-labelledby="odino-title"><div className="swa-feature-video"><VideoPlayer src="/marketplace-media/odino-reel.mp4" poster="/marketplace-media/odino-reel.jpg" title="Odino presenta UGC Video Creator" vertical/><span className="swa-side-label">ODINO RACCONTA / EPISODIO 01</span></div>
 <div className="swa-feature-copy"><p className="swa-kicker"><span/> ODINO RACCONTA · IL PRIMO EPISODIO</p><h2 id="odino-title">Una foto.<br/><em>Una nuova storia.</em></h2><p>Odino ti porta dentro il mondo degli strumenti SWA, un argomento alla volta. Si comincia dai video UGC: scopri come dare movimento alla foto del tuo prodotto con l’AI.</p>
 <ul className="swa-check-list"><li><Check size={17}/> Parti dalle foto del tuo prodotto</li><li><Check size={17}/> Scegli il messaggio e lo stile</li><li><Check size={17}/> Richiedi un esempio per la tua attività</li></ul>
 <Link className="swa-button" href="/marketplace/ugc">Scopri UGC Video Creator <ArrowUpRight size={18}/></Link>
 <p className="swa-small">Il primo di tanti argomenti. Segui Odino su <a href="https://www.instagram.com/socialwebautomation/">Instagram</a>.</p></div></section>
 {unavailable?<section id="strumenti" className="swa-section"><div className="swa-service-error" role="alert"><strong>Marketplace temporaneamente non collegato.</strong><span>Il catalogo non ha risposto. Riprova tra poco oppure contatta SWA: l’errore è stato registrato.</span></div></section>:<Catalog tools={tools}/>}
 <section className="swa-method"><div className="swa-section"><div className="swa-section-top"><div><p className="swa-kicker">IL METODO SWA</p><h2>Uno strumento serve.<br/><em>Una direzione fa la differenza.</em></h2></div><p>Puoi iniziare in autonomia.<br/>Quando serve, ci siamo anche noi.</p></div>
 <div className="swa-steps">{[['01','Parti dall’obiettivo','Vuoi nuovi contenuti, dati più ordinati o meno attività ripetitive? Cominciamo da qui.'],['02','Scegli e sperimenta','Esplora il tool dedicato e verifica come si adatta al tuo modo di lavorare.'],['03','Costruisci continuità','Collega gli strumenti alla strategia della tua attività, con il supporto del team SWA.']].map(([n,t,d])=><div key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>
 <section className="swa-section swa-faq"><div><p className="swa-kicker">PRIMA DI INIZIARE</p><h2>Facciamo<br/><em>chiarezza.</em></h2><p>Hai un’esigenza particolare?<br/><a className="swa-text-link" href={contactHref('un consiglio sul tool più adatto alla mia attività')}>Parlane con SWA <ArrowUpRight size={16}/></a></p></div><div>{faqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
 <section className="swa-final"><div><p className="swa-kicker">IL PROSSIMO PASSO È IL TUO</p><h2>Da quale idea<br/>vuoi partire?</h2><p>Trova il tuo strumento. Oppure raccontaci cosa vuoi migliorare.</p></div><div className="swa-final-actions"><a className="swa-button light" href="#strumenti">Esplora il marketplace <ArrowRight size={18}/></a><a href={contactHref('capire da quale strumento partire')} className="swa-text-link">Parla con SWA <ArrowUpRight size={18}/></a></div></section>
 </main>;
}
