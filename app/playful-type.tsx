"use client";
import {useEffect,useState,useRef} from "react";
import type {Locale} from "./project-journey";
export function PlayfulWord({text,className=""}:{text:string;className?:string}){
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
 let offset=0;
 return <span ref={host} className={`playful-word ${className}`} data-word={text} data-decoding={decoding} onPointerEnter={event=>{if(event.pointerType==="mouse")replay.current()}}><span className="sr-only">{text}</span><span aria-hidden="true">{text.split(" ").map((word,w)=>{const start=offset;offset+=word.length+1;return <span className="playful-token" key={`${word}-${w}`}><span className="decode-word-size">{word}</span><span className="decode-word-output">{display.slice(start,start+word.length)}</span>{w<text.split(" ").length-1?" ":""}</span>})}</span></span>
}
export function OpeningHeadline({locale,paused}:{locale:Locale;paused:boolean}){
 const [index,setIndex]=useState(0),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(true),[focused,setFocused]=useState(false);const host=useRef<HTMLDivElement>(null);const da=locale==="da",words=da?["mærkes.","prøves.","opleves."]:["be felt.","be tried.","come alive."];
 useEffect(()=>{const mq=matchMedia("(prefers-reduced-motion: reduce)"),update=()=>setReduced(mq.matches);update();mq.addEventListener("change",update);const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting));if(host.current)observer.observe(host.current);return()=>{observer.disconnect();mq.removeEventListener("change",update)}},[]);
 useEffect(()=>{if(paused||reduced||!visible||focused)return;const timer=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%3)},4800);return()=>clearInterval(timer)},[paused,reduced,visible,focused]);
 return <div className="opening-type" ref={host}><div className="type-kicker"><span aria-hidden="true">✳</span>{da?"FRA TANKE TIL NOGET VIRKELIGT":"FROM A THOUGHT TO SOMETHING REAL"}</div><h1><span className="opening-statement">{da?"Idéer skal":"Ideas should"}</span><span className="opening-word-slot"><PlayfulWord key={`${locale}-${index}`} text={words[index]} className="opening-playful"/></span></h1><button className="type-replay" onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onClick={()=>setIndex(i=>(i+1)%3)}>{da?"Leg med ordene":"Play with the words"}<span aria-hidden="true">↻</span></button></div>
}
