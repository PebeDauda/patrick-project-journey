"use client";
import {useEffect,useRef} from "react";
type Point={x:number;y:number};
export default function NeuralSculpture({energy,paused}:{energy:number;paused:boolean}){
 const host=useRef<HTMLDivElement>(null),state=useRef({energy,paused});state.current={energy,paused};
 useEffect(()=>{
  const el=host.current;if(!el)return;const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");if(!ctx)return;el.appendChild(canvas);
  const size=640,image=new Image(),texture=document.createElement("canvas"),signals=document.createElement("canvas");texture.width=texture.height=signals.width=signals.height=size;const tx=texture.getContext("2d")!,sx=signals.getContext("2d")!;
  let alive=true,ready=false,visible=true,frame=0,last=0,time=0,energyNow=0,burst=-10,w=600,h=600,dirty=true,px=.5,py=.5;
  const mq=matchMedia("(prefers-reduced-motion: reduce)");
  const cells:Array<{seed:Point;points:Point[];turn:number;depth:number}>=[],edges:Array<[Point,Point,Point]>=[];
  const rand=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
  function clip(poly:Point[],a:Point,b:Point){const nx=b.x-a.x,ny=b.y-a.y,c=(b.x*b.x+b.y*b.y-a.x*a.x-a.y*a.y)/2;const result:Point[]=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=p.x*nx+p.y*ny-c,dq=q.x*nx+q.y*ny-c;if(dp<=0)result.push(p);if((dp<0)!==(dq<0)){const k=dp/(dp-dq);result.push({x:p.x+(q.x-p.x)*k,y:p.y+(q.y-p.y)*k})}}return result}
  const resize=()=>{w=el.clientWidth||600;h=el.clientHeight||600;const dpr=Math.min(devicePixelRatio,1.5);canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;ctx.setTransform(dpr,0,0,dpr,0,0);dirty=true};const ro=new ResizeObserver(resize);ro.observe(el);resize();
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;dirty=true});io.observe(el);
  const move=(e:PointerEvent)=>{if(mq.matches||state.current.paused)return;const r=el.getBoundingClientRect();px=(e.clientX-r.left)/r.width;py=(e.clientY-r.top)/r.height;dirty=true};
  const fire=(e:PointerEvent)=>{move(e);if(!mq.matches&&!state.current.paused){burst=time;dirty=true}};
  el.addEventListener("pointermove",move);el.addEventListener("pointerdown",fire);
  image.src="/assets/patrickos-brain-clean.webp";image.decode().then(()=>{if(!alive)return;tx.drawImage(image,0,0,size,size);const pixels=tx.getImageData(0,0,size,size).data;const seeds:Point[]=[];for(let i=0;i<300&&seeds.length<34;i++){const x=45+rand(i*2+1)*550,y=45+rand(i*2+2)*550;if(pixels[(Math.floor(y)*size+Math.floor(x))*4+3]>200)seeds.push({x,y})}
   seeds.forEach((seed,i)=>{let points=[{x:0,y:0},{x:size,y:0},{x:size,y:size},{x:0,y:size}];seeds.forEach(other=>{if(other!==seed)points=clip(points,seed,other)});cells.push({seed,points,turn:(rand(i+100)-.5)*.65,depth:rand(i+200)})});
   seeds.forEach((a,i)=>{const nearest=seeds.map((b,j)=>({b,j,d:Math.hypot(a.x-b.x,a.y-b.y)})).filter(v=>v.j>i).sort((a,b)=>a.d-b.d).slice(0,2);nearest.forEach(({b})=>edges.push([a,b,{x:(a.x+b.x)/2+(rand(i+300)-.5)*90,y:(a.y+b.y)/2+(rand(i+400)-.5)*90}]))});ready=true;dirty=true;el.dataset.ready="true";
  }).catch(()=>{el.dataset.fallback="true"});
  const draw=()=>{ctx.clearRect(0,0,w,h);if(!ready)return;const rest=mq.matches||state.current.paused,e=rest?state.current.energy/100:energyNow;const wave=rest?0:Math.max(0,1-(time-burst)/1.5),spread=Math.min(1,e+wave*.42),fit=Math.min(w,h)*.84/size/(1+spread*.95),cx=w*.5,cy=h*.5;
   tx.clearRect(0,0,size,size);tx.drawImage(image,0,0,size,size);sx.clearRect(0,0,size,size);sx.globalCompositeOperation="source-over";sx.lineCap="round";
   edges.forEach(([a,b,c],i)=>{sx.beginPath();sx.moveTo(a.x,a.y);sx.quadraticCurveTo(c.x,c.y,b.x,b.y);sx.strokeStyle="#e2a0ab";sx.globalAlpha=.17;sx.lineWidth=1.2;sx.setLineDash([]);sx.shadowBlur=0;sx.stroke();sx.globalAlpha=.88;sx.strokeStyle="#fff2df";sx.shadowColor="#edb2ba";sx.shadowBlur=13;sx.lineWidth=2.2;sx.setLineDash([20+e*15,260]);sx.lineDashOffset=-time*(65+e*95)+i*35;sx.stroke();const t=(time*(.22+e*.25)+i*.17)%1,x=(1-t)**2*a.x+2*(1-t)*t*c.x+t*t*b.x,y=(1-t)**2*a.y+2*(1-t)*t*c.y+t*t*b.y;sx.beginPath();sx.arc(x,y,2.1+e,0,Math.PI*2);sx.fillStyle="#fff2df";sx.fill()});
   sx.setLineDash([]);sx.globalAlpha=1;sx.shadowBlur=0;sx.globalCompositeOperation="destination-in";sx.drawImage(image,0,0,size,size);sx.globalCompositeOperation="source-over";tx.drawImage(signals,0,0);
   ctx.save();ctx.translate(cx+(rest?0:(px-.5)*14),cy+(rest?0:(py-.5)*10));ctx.scale(fit,fit);
   if(spread<.012){ctx.shadowColor="#d1808a55";ctx.shadowBlur=22;ctx.drawImage(texture,-size/2,-size/2)}else{cells.forEach((cell,i)=>{const dx=cell.seed.x-size/2,dy=cell.seed.y-size/2,factor=spread*(.5+cell.depth*.55),x=dx*(1+factor),y=dy*(1+factor);ctx.save();ctx.translate(x,y);ctx.rotate(cell.turn*spread);ctx.scale(1+cell.depth*spread*.12,1+cell.depth*spread*.12);ctx.beginPath();cell.points.forEach((p,j)=>j?ctx.lineTo(p.x-cell.seed.x,p.y-cell.seed.y):ctx.moveTo(p.x-cell.seed.x,p.y-cell.seed.y));ctx.closePath();ctx.clip();ctx.drawImage(texture,-cell.seed.x,-cell.seed.y);ctx.restore();if(spread>.22&&i%2===0){ctx.beginPath();ctx.moveTo(dx,dy);ctx.quadraticCurveTo(dx+Math.sin(time*4+i)*25,y,x,y);ctx.strokeStyle=`rgba(237,178,186,${spread*.35})`;ctx.lineWidth=1.2;ctx.shadowColor="#edb2ba";ctx.shadowBlur=9;ctx.stroke()}})}
   if(wave>0){ctx.beginPath();ctx.ellipse(0,0,(1-wave)*440,(1-wave)*380,0,0,Math.PI*2);ctx.strokeStyle=`rgba(237,178,186,${wave*.45})`;ctx.lineWidth=1;ctx.stroke()}
   ctx.shadowBlur=0;ctx.restore();el.dataset.state=spread>.2?"unfolded":"whole";
  }
  const tick=(now:number)=>{frame=requestAnimationFrame(tick);if(!visible||document.hidden||now-last<33)return;const dt=last?Math.min((now-last)/1000,.08):0;last=now;const rest=mq.matches||state.current.paused;if(!rest){time+=dt;energyNow+=(state.current.energy/100-energyNow)*.1}else energyNow=state.current.energy/100;if(rest&&!dirty&&el.dataset.energy===String(state.current.energy))return;draw();dirty=false;el.dataset.energy=String(state.current.energy)};frame=requestAnimationFrame(tick);
  return()=>{alive=false;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();el.removeEventListener("pointermove",move);el.removeEventListener("pointerdown",fire);canvas.remove();texture.width=signals.width=0};
 },[]);
 return <div className="sculpture-host neural-fracture" ref={host} aria-hidden="true"><img className="sculpture-fallback" src="/assets/patrickos-brain-clean.webp" alt=""/></div>
}
