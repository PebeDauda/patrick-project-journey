"use client";
import {useState} from "react";
import type {Locale} from "./project-journey";
import {PlayfulWord} from "./playful-type";
const tools=[
 {name:"Claude Code",icon:"claude",da:"AI & udvikling",en:"AI & development"},
 {name:"Codex",wordmark:true,da:"AI & udvikling",en:"AI & development"},
 {name:"Impeccable",wordmark:true,da:"Design & kvalitet",en:"Design & quality"},
 {name:"GitHub",icon:"github",da:"Versionsstyring",en:"Version control"},
 {name:"Playwright",icon:"playwright",da:"Browser & test",en:"Browser & testing"},
 {name:"Sanity",icon:"sanity",da:"Indhold",en:"Content"},
 {name:"React",icon:"react",da:"Grænseflader",en:"Interfaces"},
 {name:"TypeScript",icon:"typescript",da:"Kode",en:"Code"},
 {name:"Three.js",icon:"three",da:"Interaktive scener",en:"Interactive scenes"},
 {name:"Cloudflare",icon:"cloudflare",da:"Hosting",en:"Hosting"},
 {name:"Node.js",icon:"node",da:"Udvikling",en:"Development"},
 {name:"Tailwind CSS",icon:"tailwind",da:"Styling",en:"Styling"}
];
export default function ToolsCloud({locale,paused}:{locale:Locale;paused:boolean}){
 const [stopped,setStopped]=useState(false),da=locale==="da";
 return <section className="tools-cloud" id="tools" aria-labelledby="tools-title" data-stopped={paused||stopped}><div className="tools-heading"><div><span className="tools-eyebrow">{da?"MIN DIGITALE VÆRKTØJSKASSE":"MY DIGITAL TOOLKIT"}</span><h2 id="tools-title">{da?"Fra idé til handling.":"From idea to action."}<br/><PlayfulWord text={da?"Med de rigtige værktøjer.":"With the right tools."}/></h2></div><div><p>{da?"AI til sparring. Design til retning. Kode til at bygge og test til at lære. Det er nogle af de værktøjer, jeg bruger i arbejdet med projekterne.":"AI for sparring. Design for direction. Code to build and testing to learn. These are some of the tools I use in my work on the projects."}</p><button className="tools-motion" aria-pressed={stopped} disabled={paused} onClick={()=>setStopped(v=>!v)}>{paused?(da?"Bevægelse sat på pause":"Motion is paused"):stopped?(da?"Start værktøjsrækkerne":"Play the tool rows"):(da?"Pause værktøjsrækkerne":"Pause the tool rows")}<span aria-hidden="true">{paused||stopped?"▷":"Ⅱ"}</span></button></div></div>
 <ul className="sr-only">{tools.map(tool=><li key={tool.name}>{tool.name}: {tool[locale]}</li>)}</ul>
 <div className="tools-rows" aria-hidden="true">{[0,1,2,3].map(row=>{const group=tools.slice(row*3,row*3+3),cells=[group[0],null,group[1],group[2],null,group[0],group[1]];return <div className="tools-row" key={row}><div className="tools-track">{[0,1].map(copy=><div className="tools-group" key={copy} data-copy={copy}>{cells.map((tool,i)=><div className={`card tool-tile ${!tool?"tool-empty":""}`} key={i}>{tool&&<>{tool.icon?<img src={`/assets/tools/${tool.icon}.svg`} width="40" height="40" alt="" loading="lazy"/>:<strong className="tool-wordmark">{tool.name}</strong>}{tool.icon&&<strong>{tool.name}</strong>}<span>{tool[locale]}</span></>}</div>)}</div>)}</div></div>})}</div>
 </section>
}
