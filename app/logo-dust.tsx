"use client";
import {useEffect,useRef} from "react";
import type {RefObject} from "react";

// The original PNG supplies both the intact artwork and every particle's RGB.
// No recolouring, blend-mode tint, generated lettering or substitute logo.
export default function LogoDust({elapsed,active,reduced}:{elapsed:RefObject<number>;active:boolean;reduced:boolean}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=host.current,c=canvas.current;if(!el||!c||!active)return;const ctx=c.getContext("2d");if(!ctx)return;
  const image=new Image(),sample=document.createElement("canvas");const sx=sample.getContext("2d",{willReadFrequently:true})!;
  let alive=true,ready=false,frame=0,last=-100,w=0,h=0,lw=0,lh=0,left=0,top=0;
  type Grain={x:number;y:number;r:number;phase:number;depth:number;release:number;color:string};let grains:Grain[]=[];
  const random=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
  const edge=(y:number)=>Math.sin(y*.037)*.025+Math.sin(y*.091+1.3)*.012;
  const prepare=()=>{
   w=el.clientWidth;h=el.clientHeight;if(!w||!h)return;const dpr=Math.min(devicePixelRatio,1.7);c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
   lw=Math.min(w*.88,1500);lh=lw*image.naturalHeight/image.naturalWidth;left=(w-lw)/2;top=(h-lh)/2;
   if(!image.complete||!image.naturalWidth)return;sample.width=Math.ceil(lw);sample.height=Math.ceil(lh);sx.clearRect(0,0,sample.width,sample.height);sx.drawImage(image,0,0,sample.width,sample.height);
   const pixels=sx.getImageData(0,0,sample.width,sample.height).data,step=w<600?1.45:2.3;grains=[];let index=0;
   for(let y=0;y<sample.height;y+=step)for(let x=0;x<sample.width;x+=step){const px=Math.min(sample.width-1,Math.floor(x+step*.5)),py=Math.min(sample.height-1,Math.floor(y+step*.5)),i=(py*sample.width+px)*4;if(pixels[i+3]<120)continue;const seed=index++;grains.push({x:x+step*.5,y:y+step*.5,r:.45+random(seed+1)*.8,phase:random(seed+2)*Math.PI*2,depth:.45+random(seed+3)*.7,release:Math.max(0,(x/lw-edge(y))*1.08),color:`rgba(${pixels[i]},${pixels[i+1]},${pixels[i+2]},${pixels[i+3]/255})`})}
   ready=true;el.dataset.ready="true";el.dataset.particles=String(grains.length);
  };
  const ro=new ResizeObserver(()=>{if(image.naturalWidth)prepare()});ro.observe(el);
  image.src="/assets/neurodevergents.png";image.decode().then(()=>{if(alive)prepare()}).catch(()=>{el.dataset.fallback="true"});
  const draw=(now:number)=>{frame=requestAnimationFrame(draw);if(!ready||document.hidden||now-last<30)return;last=now;
   const ms=reduced?3000:elapsed.current;if(ms<2050)return;ctx!.clearRect(0,0,w,h);
   const fadeIn=reduced?1:Math.min(1,Math.max(0,(ms-2050)/450));ctx!.globalAlpha=fadeIn;
   const dust=reduced?-1:(ms-3650)/1000;
   if(dust<=0){ctx!.drawImage(image,left,top,lw,lh);el.dataset.state="intact";return}
   // An organic erosion front frees real pixels; the un-eroded area stays exact.
   el.dataset.state=dust<1.12?"dissolving":"dust";
   ctx!.save();ctx!.beginPath();for(let y=0;y<=lh+4;y+=4){const front=Math.max(0,Math.min(lw,(dust/1.08+edge(y))*lw));if(y===0)ctx!.moveTo(left+front,top);else ctx!.lineTo(left+front,top+y)}ctx!.lineTo(left+lw,top+lh+4);ctx!.lineTo(left+lw,top);ctx!.closePath();ctx!.clip();ctx!.drawImage(image,left,top,lw,lh);ctx!.restore();
   const endFade=Math.min(1,Math.max(0,(6250-ms)/550));
   for(const grain of grains){const age=dust-grain.release;if(age<0||age>1.9)continue;const life=Math.max(0,1-age/1.9),flow=Math.pow(age,1.23),bend=Math.sin(age*4.2+grain.phase)-Math.sin(grain.phase);const x=left+grain.x+flow*(120+grain.depth*180)+bend*30*age,y=top+grain.y-flow*(65+grain.depth*90)+Math.cos(age*3+grain.phase)*age*55;
    const radius=grain.r*(.9+grain.depth*.25)*Math.max(.18,life);ctx!.globalAlpha=fadeIn*endFade*Math.min(1,life*1.8);ctx!.fillStyle=grain.color;ctx!.beginPath();ctx!.arc(x,y,radius,0,Math.PI*2);ctx!.fill();
   }
   ctx!.globalAlpha=1;
  }
  frame=requestAnimationFrame(draw);
  return()=>{alive=false;cancelAnimationFrame(frame);ro.disconnect();grains=[];sample.width=sample.height=0;delete el.dataset.ready};
 },[active,reduced,elapsed]);
 return <div className="logo-dust" ref={host} role="img" aria-label="NEURODEVERGENTS"><img className="logo-dust-fallback" src="/assets/neurodevergents.png" alt="" width="4899" height="887"/><canvas ref={canvas} aria-hidden="true"/></div>
}
