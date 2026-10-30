"use client";
import type {PointerEvent,ReactNode} from "react";
import type {Locale} from "./project-journey";

// Pointer feedback stays on the element: no React renders or background loop.
export function pointerEffectsAllowed(event:PointerEvent<HTMLElement>){return event.pointerType==="mouse"&&matchMedia("(hover: hover) and (pointer: fine)").matches&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!event.currentTarget.closest('[data-motion="paused"]')}
export function spotlightMove(event:PointerEvent<HTMLElement>){if(!pointerEffectsAllowed(event))return;const el=event.currentTarget,r=el.getBoundingClientRect();el.style.setProperty("--spot-x",`${event.clientX-r.left}px`);el.style.setProperty("--spot-y",`${event.clientY-r.top}px`);el.dataset.illuminated="true"}
export function spotlightReset(event:{currentTarget:HTMLElement}){delete event.currentTarget.dataset.illuminated}

export function PortraitCard({locale}:{locale:Locale}){
 const da=locale==="da";
 function move(event:PointerEvent<HTMLAnchorElement>){if(!pointerEffectsAllowed(event))return;const el=event.currentTarget,r=el.getBoundingClientRect(),x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;el.style.setProperty("--portrait-rx",`${(0.5-y)*12}deg`);el.style.setProperty("--portrait-ry",`${(x-0.5)*14}deg`);el.style.setProperty("--portrait-x",`${x*100}%`);el.style.setProperty("--portrait-y",`${y*100}%`);el.dataset.engaged="true"}
 function reset(event:{currentTarget:HTMLElement}){const el=event.currentTarget;delete el.dataset.engaged;el.style.setProperty("--portrait-rx","0deg");el.style.setProperty("--portrait-ry","0deg")}
 return <a className="portrait-perspective" href="https://patrick-bennett-portfolio.ppbb94.workers.dev/" target="_blank" rel="noreferrer" aria-label={da?"Se Patrick Bennetts portfolio (åbner i en ny fane)":"Explore Patrick Bennett’s portfolio (opens in a new tab)"} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset} onBlur={reset}>
 <div className="card portrait-depth-card"><div className="portrait-card-heading"><span>{da?"MENNESKET BAG IDÉERNE":"THE PERSON BEHIND THE IDEAS"}</span><span aria-hidden="true">↗</span></div><figure className="portrait-photo-layer"><img src="/assets/patrick-portrait.webp" alt="Patrick Bennett" width="800" height="1000" loading="lazy"/><span className="portrait-sheen" aria-hidden="true"/></figure><div className="portrait-signature"><strong>Patrick Bennett</strong><span>{da?"Se min portfolio":"Explore my portfolio"}<span aria-hidden="true">↗</span></span></div></div></a>
}
export function MagneticLink({children,className="",href}:{children:ReactNode;className?:string;href:string}){
 function move(event:PointerEvent<HTMLAnchorElement>){if(!pointerEffectsAllowed(event))return;const el=event.currentTarget,r=el.getBoundingClientRect();el.style.setProperty("--magnetic-x",`${Math.max(-7,Math.min(7,(event.clientX-r.left-r.width/2)*.1))}px`);el.style.setProperty("--magnetic-y",`${Math.max(-5,Math.min(5,(event.clientY-r.top-r.height/2)*.12))}px`)}
 function reset(event:{currentTarget:HTMLElement}){event.currentTarget.style.setProperty("--magnetic-x","0px");event.currentTarget.style.setProperty("--magnetic-y","0px")}
 return <a className={`magnetic-link ${className}`} href={href} target="_blank" rel="noreferrer" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset} onBlur={reset}><span className="magnetic-content">{children}</span></a>
}
