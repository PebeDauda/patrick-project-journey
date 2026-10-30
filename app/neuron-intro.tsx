"use client";

import {useEffect,useRef,useState} from "react";
import type {Locale} from "./project-journey";

type Neuron={x:number;y:number;color:string;angle:number;speed:number;phase:number};
const ease=(n:number)=>1-Math.pow(1-Math.max(0,Math.min(1,n)),3);

/** Particle targets and colours come from the existing brain's pixels. */
export default function NeuronIntro({locale,onDone}:{locale:Locale;onDone:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const canvas=useRef<HTMLCanvasElement>(null);
  const pointer=useRef<{x:number;y:number}|null>(null);
  const done=useRef(onDone);done.current=onDone;
  const [paused,setPaused]=useState(false);
  const pauseRef=useRef(false);pauseRef.current=paused;
  const [phase,setPhase]=useState(0);
  const [reduced,setReduced]=useState(false);
  const [failed,setFailed]=useState(false);
  const finished=useRef(false);
  function finish(){if(finished.current)return;finished.current=true;try{sessionStorage.setItem("journey-intro-v3","seen")}catch{}done.current()}

  useEffect(()=>{
    const element=dialog.current;if(!element)return;
    const previous=document.activeElement as HTMLElement|null;
    element.showModal();document.documentElement.classList.add("intro-is-open");
    const cover=document.getElementById("intro-cover");cover?.remove();
    return()=>{element.close();document.documentElement.classList.remove("intro-is-open");previous?.focus({preventScroll:true})};
  },[]);

  useEffect(()=>{
    const surface=canvas.current;if(!surface)return;
    const ctx=surface.getContext("2d");if(!ctx){setFailed(true);return;}
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    let reducedMotion=media.matches;
    const change=()=>{reducedMotion=media.matches;setReduced(media.matches)};
    media.addEventListener("change",change);
    let frame=0,elapsed=0,last=0,lastPhase=-1,alive=true;
    let width=1,height=1,dpr=1;
    const image=new Image();image.src="/assets/patrickos-brain-clean.webp";
    const resize=()=>{const rect=surface.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(devicePixelRatio||1,1.5);surface.width=Math.round(width*dpr);surface.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(surface);resize();
    const start=async()=>{
      try{await image.decode()}catch{if(alive)setFailed(true);return}
      if(!alive)return;
      const sample=document.createElement("canvas");sample.width=120;sample.height=120;
      const sampler=sample.getContext("2d");if(!sampler){setFailed(true);return}
      sampler.drawImage(image,0,0,120,120);
      const pixels=sampler.getImageData(0,0,120,120).data;
      const neurons:Neuron[]=[];
      const spacing=width<600?3:2;
      for(let y=0;y<120;y+=spacing)for(let x=0;x<120;x+=spacing){const i=(y*120+x)*4;if(pixels[i+3]<180)continue;const seed=(x*73+y*19)%997;neurons.push({x:x/120-.5,y:y/120-.5,color:`rgb(${pixels[i]},${pixels[i+1]},${pixels[i+2]})`,angle:seed/997*Math.PI*2,speed:.7+(seed%10)/10,phase:seed/997*Math.PI*2})}
      const draw=(time:number)=>{
        if(!alive)return;
        frame=requestAnimationFrame(draw);
        const delta=last?Math.min((time-last)/1000,.05):0;last=time;
        if(document.hidden||pauseRef.current)return;
        if(!reducedMotion)elapsed+=delta;
        const step=reducedMotion?1:elapsed<1?0:elapsed<2.8?1:elapsed<3.8?2:3;
        if(step!==lastPhase){lastPhase=step;setPhase(step)}
        ctx.clearRect(0,0,width,height);
        const scale=Math.min(width*.76,height*.86,700);
        const cx=width/2,cy=height/2;
        const form=ease(elapsed/1.1),burst=ease((elapsed-2.8)/.9),settle=ease((elapsed-3.8)/.8);
        const energy=reducedMotion?0:Math.max(0,Math.min(1,(elapsed-.9)/1.7));
        // Quiet image anchors the particle silhouette; no flash or full-screen flare.
        ctx.globalAlpha=reducedMotion?1:Math.min(.5,form*.5)*(1-burst*.8)+settle*.5;
        ctx.drawImage(image,cx-scale/2,cy-scale/2,scale,scale);ctx.globalAlpha=1;
        const positions:Array<[number,number]>=[];
        for(let i=0;i<neurons.length;i++){
          const neuron=neurons[i];const wave=elapsed*neuron.speed;
          const expansion=burst*(1-settle)*scale*.8*neuron.speed;
          const turbulence=reducedMotion?0:(1-burst)*(2+energy*13);
          const startRadius=(1-form)*scale*.55;
          let x=cx+neuron.x*scale+Math.cos(neuron.angle+wave)*startRadius+Math.cos(neuron.angle)*expansion+Math.sin(wave*3+neuron.phase)*turbulence;
          let y=cy+neuron.y*scale+Math.sin(neuron.angle+wave)*startRadius+Math.sin(neuron.angle)*expansion+Math.cos(wave*2.7+neuron.phase)*turbulence;
          if(pointer.current&&!reducedMotion){const dx=x-pointer.current.x,dy=y-pointer.current.y,distance=Math.hypot(dx,dy);if(distance<110&&distance>1){const strength=(1-distance/110)*24;x+=dx/distance*strength;y+=dy/distance*strength}}
          positions.push([x,y]);
          ctx.fillStyle=i%11===0?"#fff6de":neuron.color;
          ctx.globalAlpha=reducedMotion ? .45 : .65+Math.sin(neuron.phase+wave)*.2;
          ctx.beginPath();ctx.arc(x,y,(i%11===0?1.7:1.05)*Math.max(.75,scale/560),0,Math.PI*2);ctx.fill();
        }
        // Local travelling synapses: only neighbouring sampled brain points connect.
        ctx.globalAlpha=.3;ctx.strokeStyle="#f6b8d3";ctx.lineWidth=.65;
        for(let i=0;i<positions.length;i+=13){const a=positions[i],b=positions[Math.min(i+13,positions.length-1)];const distance=Math.hypot(a[0]-b[0],a[1]-b[1]);if(distance>scale*.12)continue;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();if(!reducedMotion){const t=(elapsed*.65+neurons[i].phase)%1;ctx.globalAlpha=.8;ctx.fillStyle="#fff6de";ctx.beginPath();ctx.arc(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,1.8,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.3}}
        ctx.globalAlpha=1;
        if(reducedMotion){cancelAnimationFrame(frame);frame=0;}
        if(elapsed>4.7)dialog.current?.classList.add("is-leaving");
        if(elapsed>5){cancelAnimationFrame(frame);frame=0;finish()}
      };
      frame=requestAnimationFrame(draw);
    };
    start();
    return()=>{alive=false;cancelAnimationFrame(frame);sizeObserver.disconnect();media.removeEventListener("change",change)};
  },[]);

  const da=locale==="da";
  const phases=da?["En tanke opstår.","Tusind forbindelser vågner.","Idéerne kan ikke stå stille.","Lad os give dem form."]:["A thought emerges.","A thousand connections awaken.","Ideas refuse to stand still.","Let's give them shape."];
  return <dialog className="journey-intro" ref={dialog} aria-labelledby="intro-title" onCancel={event=>{event.preventDefault();finish()}}>
    <div className="intro-top"><span>Patrick’s Project Journey</span><button className="intro-skip" onClick={finish} autoFocus>{da?"Spring over":"Skip intro"}<span aria-hidden="true">↗</span></button></div>
    <div className="intro-canvas-wrap"><canvas ref={canvas} aria-hidden="true" onPointerMove={event=>{const rect=event.currentTarget.getBoundingClientRect();pointer.current={x:event.clientX-rect.left,y:event.clientY-rect.top}}} onPointerLeave={()=>{pointer.current=null}}/>{failed&&<img src="/assets/patrickos-brain-clean.webp" alt=""/>}</div>
    <div className="intro-bottom"><div><h2 id="intro-title">{phases[phase]}</h2><p>{da?"Fra nysgerrighed til noget virkeligt.":"From curiosity to something real."}</p></div><div className="intro-actions">{!reduced&&!failed&&<button onClick={()=>setPaused(value=>!value)} aria-pressed={paused}>{paused?(da?"Fortsæt animation":"Resume animation"):(da?"Pause animation":"Pause animation")}</button>}<button className="intro-enter" onClick={finish}>{da?"Udforsk projekterne":"Explore the projects"}<span aria-hidden="true">→</span></button></div></div>
  </dialog>;
}
