"use client";

// 004 — PatrickOS Brain Boot Portal (isoleret prototype bag ?intro=1).
//
// Fortællingen er ét sammenhængende partikelfelt, der organiserer sig til
// PatrickOS-hjernen. Der vises aldrig små, komplette hjerner:
//
//   0,00–0,45 s  næsten tom papirflade, ganske få blækfragmenter kan anes
//   0,45–1,70 s  tiltrækning: flere fragmenter træder frem fra forskellige
//                dybder og driver i bløde kurver mod hjernens kommende plads
//   1,70–3,15 s  strukturen opstår: volumen og foldninger først, silhuet og
//                detaljer sidst, fordi hver partikel har sit eget vindue
//   3,15–3,85 s  fuldendelse: de sidste partikler lukker huller, assetet
//                toner op UNDER formen, ét roligt pulsslag
//   3,85–4,15 s  den komplette hjerne står helt stille
//   4,15–4,57 s  sømløs overdragelse til heroens hjerne
//
// Målpositionerne og farverne samples fra det eksisterende brain-asset, så den
// samlede partikelform ér PatrickOS-hjernen — ikke en tilnærmelse. Derfor kan
// assetet tone frem under partiklerne uden et synligt skift.
//
// Hele bevægelsen beregnes i vertex-shaderen ud fra faste attributter. Der er
// ingen buffer-upload pr. frame, ét draw call til feltet og ingen ekstra
// renderer eller render-loop: scene, kamera og lifecycle kommer fra den fælles
// motor i `webgl/engine.ts`.
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { mountEngine, prefersReducedMotion } from "./webgl/engine";
import type { Locale } from "./project-journey";

const BRAIN_ASSET = "/assets/patrickos-brain-clean.webp";
const WORDMARK_ASSET = "/assets/patrickos-wordmark.webp";

/** Hjernens bredde i world units. Alt andet måles ud fra den. */
const BRAIN_W = 2.6;
const WORD_W = 1.05;
const FOV = 42;
const TAN_HALF = Math.tan((FOV * Math.PI) / 360);

// Slutfasen er relativ til feltets FAKTISKE sidste landing i stedet for til
// håndindstillede sekundtal. Dermed er "hjernen er komplet, før overdragelsen
// begynder" en strukturel garanti: ændres partikelantal, fordeling eller
// tempo, flytter assetet, pulsen, hvilen og flyvningen med af sig selv.
/** Assetet toner op over dette interval, under partikelformen. */
const T_ASSET_LEAD = 0.85;
/** ... og er først fuldt et øjeblik EFTER sidste partikel er landet. */
const T_ASSET_LAG = 0.1;
/** Resten af bevægelsen dæmpes helt ud her. */
const T_SETTLE = 0.16;
/** Den færdige hjerne står fuldstændig stille, før flyvningen begynder. */
const T_HOLD = 0.3;
/** Sikkerhedsnet: introen må aldrig holde siden længere end dette. */
const MAX_DURATION = 6000;

const labels: Record<Locale, { skip: string }> = {
  da: { skip: "Spring intro over" },
  en: { skip: "Skip intro" },
};

/**
 * Prototypen kører kun bag `?intro=1`, så den aldrig påvirker en normal
 * sidestart. Session-logikken står klar til den dag introen skal være
 * standard, men er bevidst inaktiv indtil da.
 */
export function shouldShowIntro(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("intro") === "1";
}

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Deterministisk generator, så introen ser præcis ens ud ved hver visning. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

type Field = {
  count: number;
  /** Slutposition på hjernens form, i world units. */
  target: Float32Array;
  /** Startposition. x/y er normaliseret til billedfladen, z er world units. */
  start: Float32Array;
  /** Pixelfarven fra assetet, i lineært rum. */
  color: Float32Array;
  /** Akse for buens kontrolpunkt — giver hver partikel sin egen kurve. */
  axis: Float32Array;
  seed: Float32Array;
  scale: Float32Array;
  /** Sekundet hvor partiklen begynder at træde frem. */
  emerge: Float32Array;
  /** Vindue for indtrækket mod målpositionen. */
  gatherFrom: Float32Array;
  gatherTo: Float32Array;
  /** Sekundet hvor den SIDSTE partikel er landet. Slutfasen hænger på det. */
  settleAt: number;
  height: number;
};

/**
 * Sampler brain-assetet og fordeler partikler over dets faktiske pigment.
 * Vægtningen følger alfa, så tætheden er hjernens egen tæthed, og hver
 * partikel får målposition, farve, dybde og sit eget tidsvindue.
 *
 * Rækkefølgen er det centrale: partikler dybt inde i formen samler sig først,
 * så volumen og de organiske foldninger anes, mens silhuetten og de lyse
 * detaljer lukker til sidst. Formen dukker derfor aldrig op på én gang.
 */
function buildField(image: HTMLImageElement, wanted: number, compact: boolean): Field | null {
  const gridW = compact ? 210 : 330;
  const gridH = Math.max(2, Math.round((gridW * image.height) / image.width));
  const canvas = document.createElement("canvas");
  canvas.width = gridW;
  canvas.height = gridH;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, gridW, gridH);

  let pixels: Uint8ClampedArray;
  try {
    pixels = context.getImageData(0, 0, gridW, gridH).data;
  } catch {
    return null;
  }

  const alphaAt = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= gridW || y >= gridH) return 0;
    return pixels[(y * gridW + x) * 4 + 3] / 255;
  };

  // Alfa-boksen bestemmer world-skalaen, så hjernen fylder BRAIN_W uanset
  // hvor meget gennemsigtig luft assetet har omkring sig.
  let minX = gridW;
  let maxX = -1;
  let minY = gridH;
  let maxY = -1;
  for (let y = 0; y < gridH; y += 1) {
    for (let x = 0; x < gridW; x += 1) {
      if (alphaAt(x, y) < 0.22) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return null;

  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  const unit = BRAIN_W / boxW;
  const centreX = minX + boxW / 2;
  const centreY = minY + boxH / 2;

  // Første gennemløb: vægt pr. celle, så antallet kan fordeles proportionalt.
  const weights = new Float32Array(gridW * gridH);
  let totalWeight = 0;
  for (let y = 0; y < gridH; y += 1) {
    for (let x = 0; x < gridW; x += 1) {
      const index = (y * gridW + x) * 4;
      const alpha = pixels[index + 3] / 255;
      if (alpha < 0.22) continue;
      const lum =
        (0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2]) / 255;
      // Det mørke blæk vejer en anelse tungere end de lyse gyri, så konturen
      // og furerne får den tæthed, der gør formen læselig.
      const weight = alpha * (0.78 + (1 - lum) * 0.44);
      weights[y * gridW + x] = weight;
      totalWeight += weight;
    }
  }
  if (totalWeight <= 0) return null;

  const random = makeRandom(0x9e3779b9);
  const scaleFactor = wanted / totalWeight;
  const target: number[] = [];
  const start: number[] = [];
  const color: number[] = [];
  const axis: number[] = [];
  const seed: number[] = [];
  const scale: number[] = [];
  const emerge: number[] = [];
  const gatherFrom: number[] = [];
  const gatherTo: number[] = [];
  const tint = new THREE.Color();
  const TAU = Math.PI * 2;
  /** Antal indstrømmende vif. Feltet får retning i stedet for at ligne støv. */
  const WISPS = 7;

  for (let y = 0; y < gridH; y += 1) {
    for (let x = 0; x < gridW; x += 1) {
      const cell = y * gridW + x;
      const weight = weights[cell];
      if (weight <= 0) continue;

      // Forventet antal partikler i cellen; resten afgøres stokastisk, så
      // fordelingen bliver jævn uden at afsløre samplegitteret.
      const expected = weight * scaleFactor;
      let emit = Math.floor(expected);
      if (random() < expected - emit) emit += 1;
      if (emit <= 0) continue;

      const index = cell * 4;
      const r = pixels[index] / 255;
      const g = pixels[index + 1] / 255;
      const b = pixels[index + 2] / 255;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      tint.setRGB(r, g, b, THREE.SRGBColorSpace);

      // `body` er hvor dybt inde i formen cellen ligger: 1 midt i massen,
      // lavt ude ved silhuetten. Den styrer både dybde og rækkefølge.
      let neighbours = 0;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) neighbours += alphaAt(x + dx, y + dy);
      }
      const body = neighbours / 25;
      const highlight = smoothstep(0.62, 1, lum);

      for (let copy = 0; copy < emit; copy += 1) {
        const jitterX = random() - 0.5;
        const jitterY = random() - 0.5;
        const tx = (x + 0.5 + jitterX - centreX) * unit;
        const ty = -(y + 0.5 + jitterY - centreY) * unit;
        // Dybden kommer fra to kilder: massen giver volumen, og lysheden
        // løfter gyri en anelse frem, så foldningerne kan aflæses i rummet.
        const tz = (random() - 0.5) * 0.34 * body + (lum - 0.52) * 0.22;
        target.push(tx, ty, tz);
        color.push(tint.r, tint.g, tint.b);

        // Startfeltet: syv vif, hvert med sin retning og sit dybdebånd.
        const wisp = Math.floor(random() * WISPS);
        const angle = (wisp / WISPS) * TAU + 0.7 + (random() - 0.5) * 1.15;
        const radius = Math.pow(random(), 0.55) * 1.16;
        start.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * (0.7 + random() * 0.52),
          -3 + (wisp / (WISPS - 1)) * 4.6 + (random() - 0.5) * 1.2
        );

        const ax = random() - 0.5;
        const ay = random() - 0.5;
        const az = random() - 0.5;
        const length = Math.hypot(ax, ay, az) || 1;
        axis.push(ax / length, ay / length, az / length);

        const grain = random();
        seed.push(grain);
        // Skæv fordeling: hovedsagelig fint pigment, men enkelte store, bløde
        // fragmenter. Ensartet størrelse er præcis det, der ville læses som
        // tilfældigt støv.
        scale.push(0.4 + Math.pow(random(), 3) * 2.2);

        // Fremkomsten er skæv, så der kun er ganske få fragmenter i fase 1,
        // og bundet til viften, så de træder frem i bølger.
        const wave = Math.min(
          0.62 * Math.pow(random(), 0.62) + 0.38 * (wisp / (WISPS - 1)),
          1
        );
        emerge.push(0.08 + wave * 1.15);

        // Rækkefølgen for indtrækket: massen først, silhuet og lys sidst.
        let order = 0.52 * (1 - body) + 0.3 * random() + 0.18 * highlight;
        // En sidste tolvtedel holdes tilbage og lukker de små manglende
        // områder i fuldendelsesfasen, så der aldrig kommer et snap.
        if (random() < 0.12) order = 0.86 + random() * 0.29;
        order = Math.min(Math.max(order, 0), 1.15);
        const from = 0.5 + order * 1.35;
        gatherFrom.push(from);
        gatherTo.push(from + 1.25 + grain * 0.28);
      }
    }
  }

  const count = seed.length;
  if (!count) return null;

  return {
    count,
    settleAt: gatherTo.reduce((high, value) => (value > high ? value : high), 0),
    target: new Float32Array(target),
    start: new Float32Array(start),
    color: new Float32Array(color),
    axis: new Float32Array(axis),
    seed: new Float32Array(seed),
    scale: new Float32Array(scale),
    emerge: new Float32Array(emerge),
    gatherFrom: new Float32Array(gatherFrom),
    gatherTo: new Float32Array(gatherTo),
    height: (BRAIN_W * boxH) / boxW,
  };
}

// Hele bevægelsen ligger her, så ingen buffer skal uploades pr. frame.
// `uSpread` gør startfeltet viewport-relativt: fragmenterne kommer altid ind
// fra kanten af den synlige flade, uanset format og DPR.
const FIELD_VERTEX = `
uniform float uTime;
uniform vec3 uSpread;
uniform float uProjScale;
uniform float uReveal;
uniform float uAsset;
uniform float uPulse;
uniform float uStill;
uniform vec3 uInk;
uniform vec3 uInkWarm;

attribute vec3 aStart;
attribute vec3 aTarget;
attribute vec3 aColor;
attribute vec3 aAxis;
attribute float aSeed;
attribute float aScale;
attribute float aEmerge;
attribute float aFrom;
attribute float aTo;

varying vec3 vColor;
varying float vAlpha;

float ramp(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

// Divergensfattigt hvirvelfelt. Billigt nok til hver frame og glat nok til at
// bevægelsen læses som blæk i vand frem for som tilfældig støj.
vec3 curl(vec3 p, float t) {
  return vec3(
    sin(p.y * 1.7 + t * 0.55) * cos(p.z * 1.3 - t * 0.41),
    sin(p.z * 1.5 - t * 0.47) * cos(p.x * 1.9 + t * 0.36),
    sin(p.x * 1.6 + t * 0.41) * cos(p.y * 1.4 - t * 0.52)
  );
}

void main() {
  vec3 start = vec3(aStart.xy * uSpread.xy, aStart.z);
  float born = ramp(aEmerge, aEmerge + 0.45, uTime);
  float gather = ramp(aFrom, aTo, uTime);
  // Dobbelt udglatning: blød start, blød landing, ingen synlig opbremsning.
  float ease = gather * gather * (3.0 - 2.0 * gather);

  vec3 span = aTarget - start;
  vec3 perp = normalize(cross(span, aAxis) + vec3(1e-4));
  vec3 control = mix(start, aTarget, 0.42) + perp * length(span) * (0.16 + aSeed * 0.3);
  float inv = 1.0 - ease;
  vec3 pos = inv * inv * start + 2.0 * inv * ease * control + ease * ease * aTarget;

  // Hvirvlen dominerer, mens fragmentet er frit, og forsvinder når det sætter
  // sig. Den færdige form beholder et næsten umærkeligt åndedræt.
  float loose = (1.0 - ease) * (0.55 + aSeed * 0.5);
  pos += curl(pos * 0.55 + aSeed * 3.1, uTime * 0.75) * 0.3 * loose;
  pos += curl(aTarget * 1.4, uTime * 0.35) * 0.012 * ease * (1.0 - uStill);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  // Store, diffuse blækskyer i starten; fint pigment når formen er på plads.
  // Skiftet i størrelse er det, der gør fragmenterne til blæk frem for prikker.
  float diameter = aScale * mix(0.042, 0.0165, ease) * (1.0 + uPulse * 0.06);
  gl_PointSize = clamp(diameter * uProjScale / max(-mv.z, 0.05), 2.0, 72.0);
  gl_Position = projectionMatrix * mv;

  // Fragmenterne er plum/rosa pigment, indtil de finder deres plads i
  // hjernen og overtager assetets egen farve. To pigmenttoner fordelt pr.
  // partikel, så det frie blæk har kulør frem for at blive gråt.
  vec3 pigment = mix(uInk, uInkWarm, aSeed * aSeed);
  vColor = mix(pigment, aColor, ramp(0.18, 0.92, ease));
  // Dybdeskarphed: det fine pigment står tæt og mørkt, mens de store, ufokuserede
  // fragmenter er blege. Det er kontrasten mellem dem, der giver rum.
  float density = mix(1.4, 0.42, clamp((aScale - 0.4) / 2.2, 0.0, 1.0));
  float far = ramp(-9.0, -1.5, mv.z);
  float depth = mix(mix(0.45, 1.0, far), 1.0, ease);
  // Frit blæk er stort, blødt og gennemsigtigt; først når det finder sin plads
  // bliver det tæt. Det er forskellen på en blæksky og løse prikker.
  // Når assetet toner op under formen, træder pigmentet et skridt tilbage og
  // bliver til dybde og kornethed i stedet for at ligge dobbelt.
  vAlpha = born * uReveal * mix(0.22 * density, 1.0, ease) * depth * (1.0 - uAsset * 0.62)
    + uPulse * ease * 0.08;
}
`;

const FIELD_FRAGMENT = `
uniform float uOpacity;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 offset = gl_PointCoord - 0.5;
  // Blød kuppel med nul hældning ved kanten: ingen synlig rand, ingen
  // firkantede sprites og ingen hårde prikker — heller ikke ved 2–3 px.
  float dome = 1.0 - dot(offset, offset) * 4.0;
  if (dome <= 0.0) discard;
  float soft = dome * dome * (3.0 - 2.0 * dome);
  gl_FragColor = vec4(vColor, soft * vAlpha * uOpacity);
}
`;

export default function BrainBoot({ locale, onDone }: { locale: Locale; onDone: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);
  const finished = useRef(false);
  /** Hjernens faktiske bredde på skærmen i CSS-px. Sat af kamerafittet. */
  const brainPx = useRef(0);
  /** Tidspunktet for overdragelsen, så navnet kan trække sig ud af den. */
  const handedAt = useRef(0);
  // `onDone` er en inline-funktion hos forælderen og får ny identitet ved hver
  // render. Uden denne ref ville `handOff` — og dermed hele monterings-
  // effekten — blive genskabt midt i introen og rive motoren ned og op igen.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Overdragelsen: overlayet skaleres og flyttes, så hjernen lander præcist
  // oven på heroens hjerne, mens det toner ud. Ét objekt, ingen sideskift.
  // Skalaen kommer fra kamerafittets målte bredde, ikke fra et gættet forhold.
  const handOff = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    handedAt.current = performance.now();
    document.getElementById("intro-cover")?.remove();
    const host = hostRef.current;
    const target = document.querySelector(".brain-main");
    if (host && target) {
      const box = target.getBoundingClientRect();
      const centreX = box.left + box.width / 2 - window.innerWidth / 2;
      const centreY = box.top + box.height / 2 - window.innerHeight / 2;
      const width = brainPx.current || window.innerHeight * 0.39;
      host.style.setProperty("--boot-x", `${centreX.toFixed(1)}px`);
      host.style.setProperty("--boot-y", `${centreY.toFixed(1)}px`);
      host.style.setProperty("--boot-scale", `${(box.width / width).toFixed(3)}`);
    }
    setLeaving(true);
    window.setTimeout(() => onDoneRef.current(), 420);
  }, []);

  useEffect(() => {
    const canvasHost = canvasRef.current;
    if (!canvasHost) return;

    // Reduced motion: én statisk, færdig hjerne. Ingen samling, ingen puls.
    if (prefersReducedMotion()) {
      const still = document.createElement("img");
      still.src = BRAIN_ASSET;
      still.alt = "";
      still.className = "brain-boot-still";
      canvasHost.appendChild(still);
      const timer = window.setTimeout(handOff, 1400);
      return () => {
        window.clearTimeout(timer);
        still.remove();
      };
    }

    let stopped = false;
    let dispose: (() => void) | null = null;
    let brainTexture: THREE.Texture | null = null;
    let wordTexture: THREE.Texture | null = null;
    const safety = window.setTimeout(handOff, MAX_DURATION);

    const run = (image: HTMLImageElement) => {
      const compact = window.matchMedia("(max-width: 700px)").matches;
      // Antallet er valgt efter hvor tæt formen skal kunne læses; begge
      // størrelser fortæller den samme historie.
      const field = buildField(image, compact ? 14000 : 26000, compact);
      if (!field) {
        handOff();
        return;
      }

      // Slutfasen bygges på feltets egen sidste landing, ikke på faste tal.
      // Rækkefølgen er dermed garanteret: sidste partikel lander → assetet er
      // fuldt → al bevægelse er dæmpet ud → hjernen står stille → flyvning.
      const settleAt = field.settleAt;
      const assetFull = settleAt + T_ASSET_LAG;
      const assetIn = assetFull - T_ASSET_LEAD;
      const stillAt = assetFull + T_SETTLE;
      const handoffAt = stillAt + T_HOLD;
      const pulseIn = settleAt - 0.28;
      const wordIn = settleAt - 0.48;
      const wordFull = assetFull + 0.1;

      brainTexture = new THREE.Texture(image);
      brainTexture.colorSpace = THREE.SRGBColorSpace;
      brainTexture.needsUpdate = true;

      let wordReady = false;
      wordTexture = new THREE.TextureLoader().load(
        WORDMARK_ASSET,
        (loaded) => {
          loaded.colorSpace = THREE.SRGBColorSpace;
          wordReady = true;
        },
        undefined,
        () => {
          wordReady = false;
        }
      );

      // Motivets bounds: hjernen om centrum plus navnet under den. Højden
      // holdes symmetrisk, så hjernen bliver stående i midten og
      // overdragelsen til heroen ikke får et positionsspring.
      const wordHeight = WORD_W * 0.267;
      const wordY = -field.height / 2 - 0.3 - wordHeight / 2;
      const motifHalfW = Math.max(BRAIN_W, WORD_W) / 2;
      const motifHalfH = Math.max(field.height / 2, Math.abs(wordY) + wordHeight / 2);

      const system = new THREE.Group();
      const uniforms = {
        uTime: { value: 0 },
        uSpread: { value: new THREE.Vector3(2, 2, 1) },
        uProjScale: { value: 1000 },
        uReveal: { value: 0 },
        uAsset: { value: 0 },
        uPulse: { value: 0 },
        uStill: { value: 0 },
        uInk: { value: new THREE.Color("#5b1440") },
        uInkWarm: { value: new THREE.Color("#c9376f") },
        uOpacity: { value: 0.95 },
      };
      let released = false;
      let lastTheme = "";
      let brain: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      let word: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

      dispose = mountEngine(canvasHost, {
        fov: FOV,
        distance: 6,
        dprCap: compact ? 1.6 : 2,
        build: (ctx) => {
          ctx.scene.add(system);

          // Assetet ligger bag feltet og toner først op, når strukturen
          // allerede er genkendelig. depthTest er slået fra, så render-
          // rækkefølgen alene bestemmer lagene.
          brain = new THREE.Mesh(
            new THREE.PlaneGeometry(BRAIN_W, field.height),
            new THREE.MeshBasicMaterial({
              map: brainTexture,
              transparent: true,
              opacity: 0,
              depthWrite: false,
              depthTest: false,
            })
          );
          brain.renderOrder = 0;
          system.add(brain);

          word = new THREE.Mesh(
            new THREE.PlaneGeometry(WORD_W, wordHeight),
            new THREE.MeshBasicMaterial({
              map: wordTexture ?? undefined,
              transparent: true,
              opacity: 0,
              depthWrite: false,
              depthTest: false,
            })
          );
          word.position.set(0, wordY, 0);
          word.renderOrder = 1;
          system.add(word);

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", new THREE.BufferAttribute(field.target.slice(), 3));
          geometry.setAttribute("aTarget", new THREE.BufferAttribute(field.target, 3));
          geometry.setAttribute("aStart", new THREE.BufferAttribute(field.start, 3));
          geometry.setAttribute("aColor", new THREE.BufferAttribute(field.color, 3));
          geometry.setAttribute("aAxis", new THREE.BufferAttribute(field.axis, 3));
          geometry.setAttribute("aSeed", new THREE.BufferAttribute(field.seed, 1));
          geometry.setAttribute("aScale", new THREE.BufferAttribute(field.scale, 1));
          geometry.setAttribute("aEmerge", new THREE.BufferAttribute(field.emerge, 1));
          geometry.setAttribute("aFrom", new THREE.BufferAttribute(field.gatherFrom, 1));
          geometry.setAttribute("aTo", new THREE.BufferAttribute(field.gatherTo, 1));
          // Feltet fylder hele fladen i starten; frustum culling må ikke gætte.
          geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 14);

          const points = new THREE.Points(
            geometry,
            new THREE.ShaderMaterial({
              vertexShader: FIELD_VERTEX,
              fragmentShader: FIELD_FRAGMENT,
              transparent: true,
              depthWrite: false,
              depthTest: false,
              uniforms,
            })
          );
          points.renderOrder = 2;
          points.frustumCulled = false;
          system.add(points);
        },
        // Kamerafittet: den mest begrænsende dimension bestemmer afstanden, så
        // motivet passer i både bredt og højt format uden koordinatlapper.
        resize: (ctx) => {
          const tight = ctx.width < 700;
          const aspect = Math.max(ctx.camera.aspect, 0.01);
          const halfW = motifHalfW * (tight ? 1.06 : 1.2);
          const halfH = motifHalfH * (tight ? 1.06 : 1.22);
          const distance = Math.max(halfH / TAN_HALF, halfW / (TAN_HALF * aspect));
          ctx.camera.position.z = distance;

          const dpr = ctx.renderer.getPixelRatio();
          // gl_PointSize måles i drawing-buffer-pixels, så DPR gør kun
          // partiklerne skarpere — den flytter ikke noget.
          uniforms.uProjScale.value = (ctx.height * dpr) / (2 * TAN_HALF);
          const visibleHalfH = TAN_HALF * distance;
          uniforms.uSpread.value.set(visibleHalfH * aspect * 1.12, visibleHalfH * 1.12, 1);
          brainPx.current = (BRAIN_W * ctx.height) / (2 * TAN_HALF * distance);
        },
        update: (ctx, elapsed) => {
          if (!brain || !word) return;

          const dark = document.documentElement.dataset.theme === "dark";
          const theme = dark ? "dark" : "light";
          if (theme !== lastTheme) {
            lastTheme = theme;
            // Mørk tilstand er en bevidst udgave: pigmentet er rosa, så det
            // kan ses på den mørke flade i stedet for bare at være dæmpet.
            uniforms.uInk.value.set(dark ? "#a8477a" : "#5b1440");
            uniforms.uInkWarm.value.set(dark ? "#f6b3cb" : "#c9376f");
            uniforms.uOpacity.value = dark ? 1 : 0.95;
          }

          uniforms.uTime.value = elapsed;
          // Fladen er næsten tom i fase 1 og åbner sig først for alvor, når
          // tiltrækningen er i gang.
          uniforms.uReveal.value =
            0.3 * smoothstep(0, 0.42, elapsed) + 0.7 * smoothstep(0.42, 1.45, elapsed);
          const asset = smoothstep(assetIn, assetFull, elapsed);
          uniforms.uAsset.value = asset;
          // Ét roligt pulsslag, som er helt ude, inden hvilen begynder.
          const pulse = Math.sin(smoothstep(pulseIn, stillAt, elapsed) * Math.PI);
          uniforms.uPulse.value = pulse;
          // Det sidste åndedræt i formen dæmpes ud, så hvilen er reelt stille.
          uniforms.uStill.value = smoothstep(assetFull, stillAt, elapsed);

          brain.material.opacity = asset * 0.96;
          // Navnet trækker sig ud i det øjeblik overdragelsen begynder. Ellers
          // ville det skalere ind over heroens egen wordmark-orbit og stå
          // dobbelt et kort øjeblik.
          const handing = handedAt.current ? (performance.now() - handedAt.current) / 1000 : 0;
          word.material.opacity = wordReady
            ? smoothstep(wordIn, wordFull, elapsed) * 0.72 * (1 - smoothstep(0, 0.16, handing))
            : 0;

          // Systemet vugger svagt, mens formen bygges, så dybden kan aflæses,
          // og står helt stille inden overdragelsen.
          const swing = 1 - smoothstep(1.6, assetFull, elapsed);
          system.rotation.y = Math.sin(elapsed * 0.42) * 0.15 * swing;
          system.rotation.x = Math.sin(elapsed * 0.31 + 1.1) * 0.07 * swing;
          system.scale.setScalar(1 + pulse * 0.015);

          if (!released && elapsed >= handoffAt) {
            released = true;
            handOff();
          }
        },
      });

      // Ingen WebGL: gå direkte til heroen uden overlay eller tom skærm.
      if (!canvasHost.querySelector("canvas")) handOff();
    };

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!stopped) run(image);
    };
    // Assetet kan ikke hentes: gå direkte til heroen.
    image.onerror = () => {
      if (!stopped) handOff();
    };
    image.src = BRAIN_ASSET;

    return () => {
      stopped = true;
      window.clearTimeout(safety);
      image.onload = null;
      image.onerror = null;
      dispose?.();
      brainTexture?.dispose();
      wordTexture?.dispose();
    };
  }, [handOff]);

  return (
    <div className={`brain-boot${leaving ? " leaving" : ""}`} ref={hostRef} role="presentation">
      <div className="brain-boot-canvas" ref={canvasRef} aria-hidden="true" />
      <button type="button" className="brain-boot-skip" onClick={handOff}>
        {labels[locale].skip}
      </button>
    </div>
  );
}
