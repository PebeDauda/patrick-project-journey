"use client";

import {lazy, Suspense, useEffect, useRef, useState} from "react";
import ProcessVisual from "./process-visual";
import {PlayfulWord} from "./playful-type";
import {PortfolioPin,PortraitCard,MagneticLink,spotlightMove,spotlightReset,pointerEffectsAllowed} from "./lively-details";
import {ProjectContext} from "./journey-storyboard";
import type {Locale, Project} from "./project-journey";

export function Arrow({down=false}:{down?:boolean}) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`arrow-icon ${down?"down":""}`}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5"/></svg>;
}

export function useSceneVisibility() {
  const ref=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{const node=ref.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.08});observer.observe(node);return()=>observer.disconnect()},[]);
  return {ref,visible};
}

export function ProjectPreview({project,locale,onSelect}:{project:Project;locale:Locale;onSelect:()=>void}) {
  const {ref,visible}=useSceneVisibility();
  const da=locale==="da";
  const [view,setView]=useState<"website"|"app">("website");
  const zoom=useRef<HTMLDialogElement>(null);
  const hasApp=project.id==="neuro"||project.id==="wobs";
  const isOS=project.id==="patrickos";
  const caption=isOS?(da?"AI-arbejdsrum · struktur":"AI workspace · structure"):view==="app"?(project.id==="neuro"?(da?"Klikbar app-prototype":"Interactive app prototype"):(da?"Syntetisk webdemo":"Synthetic web demo")):(project.id==="portfolio"?(da?"Offentlig hjemmeside":"Public website"):(da?"Hjemmesideudkast":"Website design"));
  function move(event:React.PointerEvent<HTMLDivElement>) {
    if(!pointerEffectsAllowed(event))return;
    const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty("--tilt-x",`${(event.clientY-rect.top-rect.height/2)/rect.height*-5}deg`);event.currentTarget.style.setProperty("--tilt-y",`${(event.clientX-rect.left-rect.width/2)/rect.width*5}deg`);
  }
  return <article className={`project-showcase showcase-${project.id}`} onPointerMove={spotlightMove} onPointerLeave={spotlightReset} onPointerCancel={spotlightReset}>
    <div className="showcase-copy"><div className="showcase-title"><h3>{project.title}</h3><span className="stage-label">{project.status}</span></div><p>{project.summary}</p><ProjectContext id={project.id} locale={locale}/>{project.id==="portfolio"&&<MagneticLink className="portfolio-launch" href="https://patrick-bennett-portfolio.ppbb94.workers.dev/">{da?"Åbn min portfolio":"Open my portfolio"}<Arrow/></MagneticLink>}<button className={`project-read atlas-${project.id}`} onClick={onSelect}>{da?"Se status og næste skridt":"See status and next steps"}<Arrow/></button></div>
    <div className="preview-gradient" data-visible={visible}><div className="showcase-scene" ref={ref} data-visible={visible} data-view={view} onPointerMove={move} onPointerLeave={event=>{event.currentTarget.style.setProperty("--tilt-x","0deg");event.currentTarget.style.setProperty("--tilt-y","0deg")}}>
      {isOS?<div className="workspace-preview"><div className="workspace-heading"><img src="/assets/patrickos-brain-clean.webp" width="90" height="90" alt=""/><strong>PatrickOS</strong><span>{da?"Fra mission til handling":"From mission to action"}</span></div><div className="workspace-lead">Chief of Staff</div><div className="workspace-lines" aria-hidden="true"/><div className="workspace-roles">{["Research Analyst","Business Strategist","Creative Director","AI Engineer","Project Manager"].map(role=><span key={role}>{role}</span>)}</div><p>{da?"Illustration af rollerne i det eksisterende arbejdsrum":"Diagram of roles in the existing workspace"}</p></div>:
      project.id==="portfolio"?<PortfolioPin locale={locale}/>:
      <div className={`device-composition ${project.id==="neuro"?"has-phone":""}`}>
        <div className={`browser-frame ${view==="app"&&project.id==="wobs"?"app-active":""}`}><div className="browser-toolbar"><span/><span/><span/><small>{project.id==="portfolio"?"patrick-bennett-portfolio":project.title.toLowerCase()}</small></div><div className="browser-screen"><img src={`/assets/projects/${project.id}-${view==="app"&&project.id==="wobs"?"app":"web"}.jpg`} alt={da?`${project.title}: faktisk ${view==="app"&&project.id==="wobs"?"demo":"hjemmeside"}`:`${project.title}: actual ${view==="app"&&project.id==="wobs"?"demo":"website"}`} width="1440" height="1000" loading="lazy"/></div></div>
        {project.id==="neuro"&&<div className="phone-frame"><div className="phone-camera"/><img src="/assets/projects/neuro-app.jpg" alt={da?"NEUROs app-prototype på en mobilskærm":"NEURO app prototype on a phone screen"} width="390" height="844" loading="lazy"/></div>}
      </div>}
      <div className="showcase-controls"><span>{caption}</span>{!isOS&&<button className="preview-zoom" onClick={()=>zoom.current?.showModal()}>{da?"Forstør":"Enlarge"}<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" stroke="currentColor" strokeWidth="1.5"/></svg></button>}{hasApp&&<div className="view-switch" aria-label={da?"Vælg visning":"Choose view"}><button aria-pressed={view==="website"} onClick={()=>setView("website")}>{da?"Web":"Website"}</button><button aria-pressed={view==="app"} onClick={()=>setView("app")}>{project.id==="neuro"?"App":"Demo"}</button></div>}</div>
    </div></div>
    {!isOS&&<dialog className="preview-lightbox" ref={zoom} aria-label={`${project.title} · ${caption}`}><div className="lightbox-bar"><span>{project.title} · {caption}</span><button onClick={()=>zoom.current?.close()}>{da?"Luk visning":"Close view"}</button></div><img src={`/assets/projects/${project.id}-${view==="app"?"app":"web"}.jpg`} alt={`${project.title} · ${caption}`}/></dialog>}
  </article>;
}

const processDetails={
  da:["En god idé starter med et spørgsmål. Jeg undersøger mennesket, behovet og det, der står i vejen.","Indsigterne bliver til en retning, man kan se og diskutere. Struktur, skitser og små prototyper gør valgene konkrete.","Jeg bygger i små, afprøvelige skridt med AI som værktøj og menneskelig dømmekraft som styring.","Det skal holde uden for tegnebrættet. Jeg tester forløb, tilgængelighed og de antagelser, løsningen bygger på.","Det, der virker, kan forfines og genbruges. Næste skridt følger erfaringerne fra det faktiske arbejde."],
  en:["A good idea starts with a question. I explore the person, the need and what gets in the way.","Insights become a direction we can see and discuss. Structure, sketches and small prototypes make choices tangible.","I build in small, testable steps, using AI as a tool and human judgment to guide the work.","It needs to hold up beyond the drawing board. I test journeys, accessibility and the assumptions behind the solution.","What works can be refined and reused. The next step follows what the actual work has taught us."]
};
export function ProcessExperience({locale,paused}:{locale:Locale;paused:boolean}) {
  const [active,setActive]=useState(0),[discovery,setDiscovery]=useState(0);
  const {ref,visible}=useSceneVisibility();
  const titles=locale==="da"?["Opdag","Form","Byg","Bevis","Skalér"]:["Discover","Shape","Build","Prove","Scale"];
  const discoveries=locale==="da"?[
   {project:"NEURO",need:"Når et lille skridt føles stort",insight:"Færre valg. Tydeligere retning.",action:"Gør ét næste skridt synligt og afprøv det på en rigtig skærm.",id:"neuro"},
   {project:"WOBS",need:"Når erfaring skal finde retning",insight:"Bekræft fakta før formuleringen.",action:"Forbind kandidatens egne erfaringer med et konkret jobbehov.",id:"wobs"},
   {project:"PatrickOS",need:"Når idéerne trækker i alle retninger",insight:"Giv hver opgave en tydelig ramme.",action:"Del missionen op, saml kontekst og vurder resultatet menneskeligt.",id:"patrickos"}
  ]:[
   {project:"NEURO",need:"When a small step feels big",insight:"Fewer choices. A clearer direction.",action:"Make one next step visible and test it on a real screen.",id:"neuro"},
   {project:"WOBS",need:"When experience needs direction",insight:"Confirm the facts before the wording.",action:"Connect the candidate’s own experience with a concrete job need.",id:"wobs"},
   {project:"PatrickOS",need:"When ideas pull in every direction",insight:"Give each task a clear boundary.",action:"Break down the mission, gather context and review the result with human judgment.",id:"patrickos"}
  ];const insight=discoveries[discovery];
  const kinds=["opdag","form","byg","bevis","skaler"] as const;
  return <section className="process process-experience" id="process"><div className="process-inner"><div className="process-heading"><h2>{locale==="da"?<>Sådan bliver en idé<br/><PlayfulWord text="til noget virkeligt." words={["til noget virkeligt.","til et første forsøg.","til nye muligheder."]}/></>:<>How an idea<br/><PlayfulWord text="becomes real." words={["becomes real.","becomes a first attempt.","opens new possibilities."]}/></>}</h2><p>{locale==="da"?"Fra den første nysgerrighed til noget, der kan mærkes. Vælg et trin og gå tættere på arbejdet.":"From the first spark of curiosity to something tangible. Select a step to explore the work."}</p></div>
    <div className="process-stage" ref={ref} data-visible={visible}><div className="process-description" id="process-description" role="tabpanel" aria-labelledby={`process-step-${active}`} key={active}><span className="process-count">0{active+1} / 05</span><h3>{titles[active]}</h3><p>{processDetails[locale][active]}</p></div>{active===0?<div className="discovery-lab"><div className="discovery-top"><span>01 / {locale==="da"?"FRA BEHOV TIL INDSIGT":"FROM NEED TO INSIGHT"}</span><span className="discovery-signal" aria-hidden="true">✳</span></div><div className="discovery-options" role="group" aria-label={locale==="da"?"Vælg et behov":"Choose a need"}>{discoveries.map((d,i)=><button key={d.id} aria-pressed={discovery===i} onClick={()=>setDiscovery(i)}><span>{d.project}</span>{d.need}<b aria-hidden="true">↗</b></button>)}</div><div className="discovery-result" key={discovery}><span>{locale==="da"?"INDSIGT → NÆSTE FORSØG":"INSIGHT → NEXT EXPERIMENT"}</span><h4>{insight.insight}</h4><p>{insight.action}</p><a href={`#preview-${insight.id}`}>{locale==="da"?"Se det i projektet":"Explore the project"} <Arrow/></a></div></div>:<div className="process-object" aria-hidden="true"><ProcessVisual kind={kinds[active]} paused={paused||!visible} locale={locale}/><div className="object-orbit"/></div>}</div>
    <div className="process-selector" role="tablist" aria-label={locale==="da"?"Arbejdsproces":"Work process"} onKeyDown={event=>{if(!["ArrowRight","ArrowLeft","Home","End"].includes(event.key))return;event.preventDefault();const next=event.key==="Home"?0:event.key==="End"?4:(active+(event.key==="ArrowRight"?1:4))%5;setActive(next);document.getElementById(`process-step-${next}`)?.focus()}}>{titles.map((title,i)=><button id={`process-step-${i}`} key={title} role="tab" aria-selected={active===i} aria-controls="process-description" tabIndex={active===i?0:-1} onClick={()=>setActive(i)}><span>0{i+1}</span>{title}<i/></button>)}</div>
  </div></section>;
}

const neuralPaths=[
 "M120 560 C210 530 210 400 320 410 S410 600 540 560 S650 350 760 370 S850 550 990 500 S1120 400 1240 470",
 "M180 370 C240 260 350 330 400 240 S520 170 620 230 S700 420 820 330 S950 200 1030 300 S1180 300 1230 400",
 "M240 640 C350 640 340 780 450 730 S590 580 660 680 S740 850 850 780 S1030 620 1140 720",
 "M420 130 C460 240 380 330 500 370 S640 490 610 580 S500 720 600 830",
 "M740 110 C690 220 790 220 760 370 S650 480 740 550 S930 550 930 680 S860 810 1000 880",
 "M1050 270 C1020 380 1140 450 1040 510 S850 430 820 570 S740 670 850 780",
 "M160 540 C220 600 320 530 320 410 M540 560 C530 480 410 470 400 370 M760 370 C880 340 900 420 990 500",
 "M450 730 C390 790 410 870 530 900 S680 870 720 960 M850 780 C920 860 1080 810 1170 890",
 "M500 370 C590 310 600 330 620 230 M740 550 C840 620 860 560 930 680",
 "M600 830 C680 790 720 810 850 780 M990 500 C1090 540 1060 650 1140 720",
 "M1030 940 C1110 900 1210 950 1240 1030 S1180 1100 1110 1090",
 "M320 410 C320 510 420 480 450 580 S490 690 540 710"
];
export function NeuralExperience({locale,paused}:{locale:Locale;paused:boolean}) {
  const {ref,visible}=useSceneVisibility();const [pulse,setPulse]=useState(0);
  return <section className="neural-experience" id="vision"><div className="neural-inner" ref={ref} data-visible={visible} data-paused={paused}>
    <div className="neural-copy"><h2>{locale==="da"?<>En idé tænder.<br/>Forbindelserne <PlayfulWord text="følger." words={["følger.","vokser.","forgrener sig."]}/></>:<>An idea sparks.<br/>Connections <PlayfulWord text="follow." words={["follow.","grow.","branch out."]}/></>}</h2><p>{locale==="da"?"Det starter med nysgerrighed. En forbindelse bliver til flere, og noget nyt tager form. Sådan føles det at arbejde på tværs af mennesker, kreativitet og teknologi.":"It starts with curiosity. One connection leads to another, and something new takes shape. That is how it feels to work across people, creativity and technology."}</p><button className="neural-trigger" onClick={()=>setPulse(value=>value+1)}>{locale==="da"?"Send en impuls":"Send an impulse"}<Arrow/></button><span className="neural-caption">{locale==="da"?"En visuel metafor for idéer og forbindelser":"A visual metaphor for ideas and connections"}</span></div>
    <div className="neural-art" key={pulse} data-visible={visible} data-paused={paused}><img className="neural-clean" src="/assets/patrickos-brain-clean.webp" alt="" width="1400" height="1400"/>
      <svg viewBox="0 0 1400 1400" className="neural-network" aria-hidden="true"><defs><mask id="neural-silhouette" mask-type="alpha"><image href="/assets/patrickos-brain-clean.webp" width="1400" height="1400"/></mask><filter id="neural-signal-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter></defs><g mask="url(#neural-silhouette)">{neuralPaths.map((path,i)=><g key={i} style={{"--route-delay":`${i*-.71}s`,"--route-time":`${5.2+(i%3)*1.1}s` } as React.CSSProperties}><path className="neural-wire" d={path}/><path className="neural-pulse neural-pulse-glow" d={path} pathLength="1000" filter="url(#neural-signal-glow)"/><path className="neural-pulse" d={path} pathLength="1000"/></g>)}{[[320,410],[540,560],[760,370],[990,500],[450,730],[850,780],[740,550],[930,680]].map(([x,y],i)=><circle key={i} className="neural-node" cx={x} cy={y} r="5" style={{animationDelay:`${i*-.8}s`}}/>)}</g></svg>
    </div></div></section>;
}

export function AboutPatrick({locale}:{locale:Locale}) {
  const da=locale==="da";
  return <section className="about-patrick" id="about"><div className="about-portrait"><PortraitCard locale={locale}/></div><div className="about-content"><h2>{da?<>Mennesket bag<br/><PlayfulWord text="projekterne." words={["projekterne.","nysgerrigheden.","forbindelserne.","de skæve idéer."]}/></>:<>The person behind<br/><PlayfulWord text="the projects." words={["the projects.","the curiosity.","the connections.","the unexpected ideas."]}/></>}</h2><p className="about-intro">{da?"Jeg hedder Patrick. Jeg forbinder mennesker, idéer og muligheder og kan lide at gøre det abstrakte konkret.":"I'm Patrick. I connect people, ideas and opportunities, and enjoy making the abstract tangible."}</p><p>{da?"Min karriere har bevæget sig gennem salg, rekruttering, retail, natteliv, events og marketing. I dag tager jeg erfaringerne med ind i digital produktudvikling med AI som værktøj.":"My career has moved through sales, recruitment, retail, nightlife, events and marketing. Today, I bring that experience into digital product development, with AI as a tool."}</p><p>{da?"Her samler jeg arbejdet undervejs: det, der er bygget, det, der bliver afprøvet, og de idéer, som stadig skal finde deres form.":"This is where I collect the work as it unfolds: what has been built, what is being tested and ideas still finding their shape."}</p><MagneticLink className="about-link" href="https://patrick-bennett-portfolio.ppbb94.workers.dev/">{da?"Se min erfaring og mine cases":"Explore my experience and selected work"}<Arrow/></MagneticLink></div></section>;
}
