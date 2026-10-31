"use client";
import {useEffect,useState,useRef} from "react";
import type {Locale} from "./project-journey";
function kern(value:string){return value.split(/([øØ])/).map((part,i)=>/[øØ]/.test(part)?<span className="kern-oe" key={i}>{part}</span>:part)}
export function PlayfulWord({text,className="",words}:{text:string;className?:string;words?:string[]}){
 const [index,setIndex]=useState(0);const phrases=words?.length?words:[text];text=phrases[index%phrases.length];
 useEffect(()=>{if(phrases.length<2)return;const timer=setInterval(()=>{const el=host.current;if(!el||document.hidden||matchMedia("(prefers-reduced-motion: reduce)").matches||el.closest("[data-motion]")?.getAttribute("data-motion")==="paused")return;const box=el.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight)setIndex(i=>i+1)},5200);return()=>clearInterval(timer)},[phrases.join("|")]);
 const host=useRef<HTMLSpanElement>(null),replay=useRef<()=>void>(()=>{});const [display,setDisplay]=useState(text),[decoding,setDecoding]=useState(false);
 useEffect(()=>{
  const el=host.current;if(!el)return;let frame=0,started=false,visible=false;const main=el.closest("[data-motion]"),mq=matchMedia("(prefers-reduced-motion: reduce)");
  const stop=()=>{cancelAnimationFrame(frame);setDisplay(text);setDecoding(false)};
  const allowed=()=>!mq.matches&&main?.getAttribute("data-motion")!=="paused"&&!document.hidden;
  const play=()=>{if(!allowed()||!visible)return;cancelAnimationFrame(frame);const start=performance.now();let last=-100;setDecoding(true);
   const tick=(now:number)=>{if(!allowed()||!visible){stop();return}const elapsed=now-start;if(elapsed>=1150){stop();return}if(elapsed-last>=60){last=elapsed;const resolved=Math.max(0,Math.floor((elapsed-240)/850*text.length));setDisplay([...text].map((char,i)=>/\s|[.,!?]/.test(char)||i<resolved?char:String(((i*13+Math.floor(elapsed/60)*7)%3)%2)).join(""))}frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick)};
  replay.current=play;
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!started){started=true;play()}else if(!visible)stop()},{threshold:.25});observer.observe(el);
  const change=()=>{if(!allowed())stop()};const mutation=new MutationObserver(change);if(main)mutation.observe(main,{attributes:true,attributeFilter:["data-motion"]});mq.addEventListener("change",change);document.addEventListener("visibilitychange",change);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();mutation.disconnect();mq.removeEventListener("change",change);document.removeEventListener("visibilitychange",change);replay.current=()=>{}};
 },[text]);
 return <span ref={host} className={`playful-word ${className}`} data-word={text} data-decoding={decoding}><span className="sr-only">{text}</span><span aria-hidden="true" className="decode-phrase"><span className="decode-measure">{kern(text)}</span><span className="decode-result">{kern(decoding?display:text)}</span></span></span>

}
export function OpeningHeadline({locale,paused}:{locale:Locale;paused:boolean}){
 const [index,setIndex]=useState(0),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(true),[focused]=useState(false);const host=useRef<HTMLDivElement>(null);const da=locale==="da",words=da?["mærkes.","prøves.","opleves."]:["be felt.","be tried.","come alive."];
 useEffect(()=>{const mq=matchMedia("(prefers-reduced-motion: reduce)"),update=()=>setReduced(mq.matches);update();mq.addEventListener("change",update);const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting));if(host.current)observer.observe(host.current);return()=>{observer.disconnect();mq.removeEventListener("change",update)}},[]);
 useEffect(()=>{if(paused||reduced||!visible||focused)return;const timer=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%3)},4800);return()=>clearInterval(timer)},[paused,reduced,visible,focused]);
 return <div className="opening-type" ref={host}><div className="type-kicker"><span aria-hidden="true">✳</span>{da?"FRA TANKE TIL NOGET VIRKELIGT":"FROM A THOUGHT TO SOMETHING REAL"}</div><h1><span className="opening-statement">{da?"Idéer skal":"Ideas should"}</span><span className="opening-word-slot"><PlayfulWord key={`${locale}-${index}`} text={words[index]} className="opening-playful"/></span></h1></div>
}
