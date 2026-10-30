"use client";
import {lazy,Suspense,useEffect,useState} from "react";
import {OpeningHeadline,PlayfulWord} from "./playful-type";
import {JourneyStoryboard} from "./journey-storyboard";
import ToolsCloud from "./tools-cloud";
import KineticNavigation from "./kinetic-navigation";
import {AboutPatrick,Arrow,NeuralExperience,ProcessExperience,ProjectPreview} from "./journey-experience";
import type {Locale,Project} from "./project-journey";
import snapshot from "../content/projects.json";
const Sculpture=lazy(()=>import("./neural-sculpture"));

export default function JourneyV4({projects}:{projects:Record<Locale,Project[]>;copy?:unknown}) {
 const [locale,setLocale]=useState<Locale>("da"),[paused,setPaused]=useState(false),[energy,setEnergy]=useState(0),[selected,setSelected]=useState("neuro"),[tab,setTab]=useState("now");const da=locale==="da";
 const items=(projects[locale]?.length?projects[locale]:snapshot.filter(p=>p.locale===locale) as Project[]).filter(p=>["neuro","wobs","portfolio","patrickos"].includes(p.id));
 const current=items.find(p=>p.id===selected)??items[0];
 useEffect(()=>{document.documentElement.dataset.theme="dark";document.documentElement.lang=locale},[locale]);
 function choose(id:string){setSelected(id);setTab("now");document.getElementById(`preview-${id}`)?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})}
 return <main className="v4" data-motion={paused?"paused":"running"}>
 <KineticNavigation locale={locale} paused={paused} onLocale={()=>setLocale(value=>value==="da"?"en":"da")} onPause={()=>setPaused(value=>!value)}/>
 <section className="neural-opening" id="top"><div className="opening-title"><OpeningHeadline locale={locale} paused={paused}/><p>{da?"Et levende univers af projekter, mennesker og forbindelser.":"A living universe of projects, people and connections."}</p><a className="opening-enter" href="#projects">{da?"Træd ind i projekterne":"Enter the projects"}<Arrow/></a></div>
 <div className="opening-sculpture"><Suspense fallback={<div className="sculpture-loading"><img src="/assets/patrickos-brain-clean.webp" alt=""/></div>}><Sculpture energy={energy} paused={paused}/></Suspense></div>
 <div className="energy-console"><div><label htmlFor="neural-energy">{da?"Giv nysgerrigheden energi":"Give curiosity energy"}</label><span>{da?"Træk i hjernen for at dreje den":"Drag the brain to rotate it"}</span></div><input id="neural-energy" type="range" min="0" max="100" value={energy} onChange={event=>setEnergy(Number(event.target.value))}/><button onClick={()=>setEnergy(energy>70?0:100)}>{energy>70?(da?"Saml forbindelserne":"Gather connections"):(da?"Slip energien fri":"Release the energy")}<Arrow/></button></div>
 <div className="opening-foot"><span>Patrick Bennett · Project Journey</span><a href="#projects">{da?"Scroll for at udforske":"Scroll to explore"}<Arrow down/></a></div></section>
 <div className="kinetic-ribbon" aria-hidden="true"><div>{[0,1,2,3].map(i=><span key={i}>NEURO <i/> WOBS <i/> PORTFOLIO <i/> PATRICKOS <i/></span>)}</div></div>
 <section className="v4-projects" id="projects"><div className="v4-section-intro"><h2>{da?<>Arbejde i<br/><PlayfulWord text="bevægelse."/></>:<>Work in<br/><PlayfulWord text="motion."/></>}</h2><p>{da?"Fire selvstændige projekter. Se det faktiske design, prøv visningerne og gå tættere på, hvor arbejdet står.":"Four independent projects. Explore the actual designs, try the views and discover where the work stands."}</p></div><nav className="project-jump" aria-label={da?"Vælg projekt":"Choose a project"}>{items.map(p=><button key={p.id} aria-pressed={selected===p.id} onClick={()=>choose(p.id)}><span>{p.title}</span><Arrow/></button>)}</nav>
 <div className="project-gallery">{items.map((project,i)=><div className="project-sheet" id={`preview-${project.id}`} key={project.id} style={{"--sheet":i} as React.CSSProperties}><ProjectPreview project={project} locale={locale} onSelect={()=>{setSelected(project.id);document.getElementById("project-evidence")?.scrollIntoView({behavior:"smooth"})}}/></div>)}</div>
 <div className="project-evidence" id="project-evidence"><div className="evidence-heading"><h3>{current.title}</h3><span>{current.status}</span><select aria-label={da?"Projektstatus for":"Project status for"} value={selected} onChange={event=>setSelected(event.target.value)}>{items.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></div><div className="evidence-tabs" role="group" aria-label={da?"Statusvisning":"Status view"}>{[["now",da?"Bygget indtil nu":"Built so far"],["next",da?"Næste skridt":"Next step"],["destination",da?"Retningen":"The direction"]].map(([key,label])=><button key={key} aria-pressed={tab===key} onClick={()=>setTab(key)}>{label}</button>)}</div><p key={`${selected}-${tab}`}>{current[tab as "now"|"next"|"destination"]}</p><JourneyStoryboard id={selected} locale={locale} tab={tab} onTab={setTab}/><small>{da?"Status gennemgået 30. oktober 2026. Prototyper er ikke lancerede produkter.":"Status reviewed 30 October 2026. Prototypes are not launched products."}</small></div></section>
 <ToolsCloud locale={locale} paused={paused}/>
 <ProcessExperience locale={locale} paused={paused}/>
 <NeuralExperience locale={locale} paused={paused}/>
 <AboutPatrick locale={locale}/>
 <footer className="v4-footer"><div><p>{da?"Nysgerrigheden fortsætter.":"Curiosity continues."}</p><a href="https://patrick-bennett-portfolio.ppbb94.workers.dev/" target="_blank" rel="noreferrer">{da?"Se min portfolio":"Explore my portfolio"}<Arrow/></a></div><a href="#top" className="footer-type"><PlayfulWord text={da?"FORTSÆT":"KEEP GOING"}/><Arrow/></a><div><span>Patrick Bennett · 2026</span><span>{da?"Bygget af arbejdet undervejs.":"Built from the work as it unfolds."}</span></div></footer>
 </main>;
}
