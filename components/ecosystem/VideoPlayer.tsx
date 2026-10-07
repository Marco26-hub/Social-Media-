'use client';
import { useState,useRef,useEffect } from 'react';
import { Play } from 'lucide-react';
export default function VideoPlayer({src,poster,title,vertical=false}:{src:string;poster:string;title:string;vertical?:boolean}){
 const [playing,setPlaying]=useState(false);const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{if(!playing||!ref.current)return;const video=ref.current;video.play().catch(()=>{});
 const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)video.pause();});observer.observe(video);
 return ()=>observer.disconnect();},[playing]);
 return <div className={vertical?'swa-player vertical':'swa-player'}>{playing?
 <video ref={ref} src={src} controls playsInline preload="none" aria-label={title} onPlay={()=>{document.querySelectorAll('video').forEach(v=>{if(v!==ref.current)v.pause();});}}/>:
 <button type="button" className="swa-play-cover" aria-label={'Riproduci: '+title} onClick={()=>setPlaying(true)}>
 <img src={poster} alt="" width={vertical?540:960} height={vertical?960:540} loading="lazy"/>
 <span className="swa-play-circle"><Play size={24} fill="currentColor" aria-hidden="true"/></span>
 <span className="swa-play-caption">Guarda il Reel di Odino <span>00:26</span></span></button>}</div>;
}
