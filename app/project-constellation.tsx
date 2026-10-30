"use client";

// 3D Project Constellation — de fire projektspor som ét sammenhængende system.
//
// Visualiseringen er navigation og fortælling; projektkortene nedenunder er
// information. Scene, renderer og render-loop kommer fra den fælles motor i
// `webgl/engine.ts`, så der kun findes ét WebGL-mønster på siden.
//
// Node-etiketterne er rigtige DOM-knapper, der følger nodernes projicerede
// position. Det giver hover, tastaturfokus og klik uden raycasting — og gør
// visualiseringen brugbar for skærmlæsere og uden mus.
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mountEngine, mixColor, type EngineContext } from "./webgl/engine";
import type { Locale, Project } from "./project-journey";

type Props = {
  projects: Project[];
  activeId: string;
  locale: Locale;
  theme: "light" | "dark";
  onSelect: (id: string) => void;
};

// PatrickOS er systemets midte; de øvrige spor ligger i reel dybde omkring den.
const HUB = "patrickos";
const layout: Record<string, { position: [number, number, number]; tilt: number }> = {
  portfolio: { position: [-2.28, 0.94, 0.7], tilt: 0.44 },
  patrickos: { position: [-0.06, -0.26, -0.8], tilt: -0.16 },
  career: { position: [2.22, 0.6, -1.32], tilt: 0.88 },
  creative: { position: [0.86, -1.46, 1.12], tilt: -0.64 },
};

const labels: Record<Locale, { heading: string; hint: string; open: string }> = {
  da: {
    heading: "Projektkonstellation",
    hint: "Fire spor, ét system. Vælg en node for at åbne sporets kort.",
    open: "Åbn sporet",
  },
  en: {
    heading: "Project constellation",
    hint: "Four tracks, one system. Choose a node to open that track’s card.",
    open: "Open the track",
  },
};

// Partikelfeltet er ét Points-objekt med to adfærd, valgt pr. partikel af
// `aConduit`. Positionen beregnes på GPU'en, så feltet kan være stort uden at
// koste en buffer-upload pr. frame. `uConverge` er scroll-fortællingen: 0 er
// heroens løse idéer, 1 er det samlede system omkring kernen.
const FIELD_VERTEX = `
uniform float uTime;
uniform float uConverge;
uniform vec2 uPointer;
uniform float uSize;
uniform float uDpr;
uniform vec3 uCore;

attribute vec3 aHome;
attribute vec3 aP0;
attribute vec3 aP1;
attribute vec3 aP2;
attribute float aConduit;
attribute float aSeed;
attribute float aScale;

varying float vFade;
varying float vDepth;
varying float vTone;

vec3 bezier(vec3 p0, vec3 p1, vec3 p2, float t) {
  float u = 1.0 - t;
  return u * u * p0 + 2.0 * u * t * p1 + t * t * p2;
}

void main() {
  float seed = aSeed;

  // Sammenhængende drift — hele massen ånder, den flimrer ikke.
  vec3 drift = vec3(
    sin(uTime * 0.21 + seed * 6.2831),
    sin(uTime * 0.17 + seed * 12.566 + 1.7),
    cos(uTime * 0.19 + seed * 9.4248 + 0.6)
  ) * 0.17;

  vec3 field = aHome + drift;
  field.xy += uPointer * (0.06 + seed * 0.1);

  // Trækket mod kernen: feltet samler sig, men kollapser ikke i et punkt.
  vec3 toCore = field - uCore;
  float shell = 0.44 + seed * 0.62;
  field = mix(field, uCore + normalize(toCore + 0.0001) * shell, uConverge * 0.74);

  // Konduit: partiklen løber ud gennem røret fra kernen mod sit spor.
  float travel = fract(seed + uTime * (0.045 + seed * 0.085));
  vec3 conduit = bezier(aP0, aP1, aP2, travel) + drift * 0.1;

  vec3 pos = mix(field, conduit, aConduit);

  // Strømmen toner ind med konvergensen og dæmpes i begge ender af røret.
  float flow = sin(travel * 3.14159) * smoothstep(0.12, 0.62, uConverge);
  float rest = 1.0 - uConverge * 0.3;
  vFade = mix(rest, flow, aConduit);
  vTone = mix(1.0 - clamp(length(toCore) / 3.4, 0.0, 1.0), 1.0, aConduit);

  vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
  vDepth = smoothstep(12.0, 3.2, -viewPosition.z);
  gl_PointSize = (uSize * aScale * uDpr * 40.0) / max(-viewPosition.z, 0.1);
  gl_Position = projectionMatrix * viewPosition;
}
`;

const FIELD_FRAGMENT = `
uniform vec3 uColorCore;
uniform vec3 uColorEdge;
uniform float uOpacity;

varying float vFade;
varying float vDepth;
varying float vTone;

void main() {
  vec2 offset = gl_PointCoord - 0.5;
  float radius = dot(offset, offset);
  if (radius > 0.25) discard;
  float soft = smoothstep(0.25, 0.0, radius);
  vec3 tint = mix(uColorEdge, uColorCore, vTone);
  gl_FragColor = vec4(tint, soft * vFade * vDepth * uOpacity);
}
`;

type NodeEntry = {
  id: string;
  group: THREE.Group;
  core: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  shell: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  ring: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  /** Kun kernen har en vedvarende glød; den markerer motoren i systemet. */
  glow: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> | null;
  home: THREE.Vector3;
  phase: number;
  progress: number;
  /** Hvilerniveau. Sat af rollen i systemet, ikke af fremdriften. */
  base: number;
  intensity: number;
};

type EdgeEntry = {
  a: string;
  b: string;
  line:
    | THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>
    | THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  curve: THREE.QuadraticBezierCurve3;
  baseColor: THREE.Color;
  hub: boolean;
  pulses: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  offsets: number[];
  speed: number;
  weight: number;
  intensity: number;
};

function fallbackPosition(index: number, total: number): [number, number, number] {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  return [Math.cos(angle) * 2.1, Math.sin(angle * 1.6) * 1.1, Math.sin(angle) * 1.4];
}

export default function ProjectConstellation({ projects, activeId, locale, theme, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hoverRef = useRef("");
  const activeRef = useRef(activeId);
  const themeRef = useRef(theme);
  const pointerRef = useRef({ x: 0, y: 0 });

  activeRef.current = activeId;
  themeRef.current = theme;

  // Kun geometri-relevante felter må genstarte scenen — sprogskift må ikke.
  const signature = useMemo(
    () => projects.map((project) => `${project.id}:${project.accent}:${project.progress}`).join("|"),
    [projects]
  );
  const shape = useMemo(
    () => projects.map((project) => ({ id: project.id, accent: project.accent, progress: project.progress })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature]
  );

  useEffect(() => {
    const canvasHost = canvasRef.current;
    const host = hostRef.current;
    if (!canvasHost || !host || !shape.length) return;

    const compact = window.matchMedia("(max-width: 700px)").matches;
    // Feltet farves af kernens og det svageste spors accent — ikke af nye farver.
    const hubAccent = shape.find((project) => project.id === HUB)?.accent ?? "#c94779";
    const rimAccent = shape[shape.length - 1]?.accent ?? "#873467";
    const nodes: NodeEntry[] = [];
    const edges: EdgeEntry[] = [];
    const system = new THREE.Group();
    const projected = new THREE.Vector3();
    const ink = new THREE.Color(0x2c0d32);
    let field: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null;
    let converge = 0;
    let lastTheme = "";

    // Deterministisk støj: feltet ser ens ud ved hver indlæsning.
    const noise = (index: number, salt: number) => {
      const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    // I lys tilstand trækkes forbindelsesfarverne mod blæk, ellers forsvinder
    // de pastelblandede spor i det lyse papir. Kaldes kun ved temaskift.
    const applyTheme = (dark: boolean) => {
      edges.forEach((edge) => {
        const tone = edge.baseColor.clone();
        if (!dark) tone.lerp(ink, edge.hub ? 0.4 : 0.3);
        edge.line.material.color.copy(tone);
        edge.pulses.material.color.copy(tone);
      });
      if (!field) return;
      const hub = new THREE.Color(hubAccent);
      const rim = new THREE.Color(rimAccent);
      field.material.uniforms.uColorCore.value.copy(dark ? hub : hub.clone().lerp(ink, 0.42));
      field.material.uniforms.uColorEdge.value.copy(dark ? rim : rim.clone().lerp(ink, 0.5));
      field.material.uniforms.uOpacity.value = dark ? 0.78 : 0.62;
    };

    const dispose = mountEngine(canvasHost, {
      fov: compact ? 40 : 34,
      distance: compact ? 7.6 : 6.5,
      dprCap: compact ? 1.6 : 1.9,
      build: (ctx: EngineContext) => {
        ctx.scene.add(system);
        ctx.scene.add(new THREE.AmbientLight(0xffffff, 1.35));
        const key = new THREE.PointLight(0xffdce2, 26, 18);
        key.position.set(2.4, 2.6, 4.2);
        const fill = new THREE.PointLight(0xd8ff4f, 12, 16);
        fill.position.set(-3.2, -1.8, 2.6);
        ctx.scene.add(key, fill);

        // Noder: en tæt kerne, en teknisk wireframe-skal og en måle-ring.
        shape.forEach((project, index) => {
          const spot = layout[project.id]?.position ?? fallbackPosition(index, shape.length);
          const tilt = layout[project.id]?.tilt ?? index * 0.5;
          const color = new THREE.Color(project.accent);
          const weight = project.progress / 100;
          // Rollen i systemet bestemmer størrelse og hvilelys; fremdriften
          // finjusterer kun indenfor rollen. Ellers ville Portfolios høje
          // procenttal gøre den til systemets tyngdepunkt.
          const core = project.id === HUB;
          const rank = core ? 1 : 0.55;
          const radius = 0.15 + rank * 0.26 + weight * 0.05;
          const base = core ? 0.72 : 0.3 + weight * 0.12;

          const group = new THREE.Group();
          group.position.set(spot[0], spot[1], spot[2]);

          const kernel = new THREE.Mesh(
            new THREE.IcosahedronGeometry(radius * 0.62, 2),
            new THREE.MeshPhysicalMaterial({
              color,
              emissive: color,
              emissiveIntensity: 0.5,
              roughness: 0.3,
              metalness: 0.34,
              transparent: true,
              opacity: 0.9,
            })
          );

          const shell = new THREE.LineSegments(
            new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(radius, 1)),
            new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 })
          );

          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius * 1.75, 0.005, 6, 72),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 })
          );
          ring.rotation.set(Math.PI * 0.42, tilt, tilt * 0.6);

          // Kerneglød: én additiv skal om PatrickOS, så motoren aldrig kan
          // forveksles med et af de spor, der hænger på den.
          const glow = core
            ? new THREE.Mesh(
                new THREE.IcosahedronGeometry(radius * 2.1, 3),
                new THREE.MeshBasicMaterial({
                  color,
                  transparent: true,
                  opacity: 0.12,
                  side: THREE.BackSide,
                  blending: THREE.AdditiveBlending,
                  depthWrite: false,
                })
              )
            : null;

          group.add(kernel, shell, ring);
          if (glow) group.add(glow);
          system.add(group);
          nodes.push({
            id: project.id,
            group,
            core: kernel,
            shell,
            ring,
            glow,
            home: group.position.clone(),
            phase: index * 1.7,
            progress: weight,
            base,
            intensity: base,
          });
        });

        // Forbindelser: buede linjer, tungest ind mod kernen i PatrickOS.
        for (let i = 0; i < nodes.length; i += 1) {
          for (let j = i + 1; j < nodes.length; j += 1) {
            const from = nodes[i];
            const to = nodes[j];
            const anchor = from.id === HUB || to.id === HUB;
            const middle = from.home.clone().add(to.home).multiplyScalar(0.5);
            middle.add(middle.clone().normalize().multiplyScalar(from.home.distanceTo(to.home) * 0.16));
            const curve = new THREE.QuadraticBezierCurve3(from.home.clone(), middle, to.home.clone());
            const baseColor = mixColor(shape[i].accent, shape[j].accent, 0.5);

            // Rygraden ind mod kernen tegnes som rør, så den har reel tykkelse
            // og kan aflæses; de øvrige spor forbliver tynde linjer.
            const line = anchor
              ? new THREE.Mesh(
                  new THREE.TubeGeometry(curve, 44, 0.0088, 6, false),
                  new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.5 })
                )
              : new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),
                  new THREE.LineBasicMaterial({ color: baseColor, transparent: true, opacity: 0.16 })
                );

            // Puls-partikler: fremdriften i de to spor styrer tempoet.
            const count = anchor ? 4 : 2;
            const pulseGeometry = new THREE.BufferGeometry();
            pulseGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
            const pulses = new THREE.Points(
              pulseGeometry,
              new THREE.PointsMaterial({
                color: baseColor,
                size: anchor ? 0.075 : 0.04,
                transparent: true,
                opacity: 0.6,
              })
            );

            system.add(line, pulses);
            edges.push({
              a: from.id,
              b: to.id,
              line,
              curve,
              baseColor,
              hub: anchor,
              pulses,
              offsets: Array.from({ length: count }, (_, index) => index / count),
              speed: 0.055 + ((from.progress + to.progress) / 2) * 0.16,
              weight: anchor ? 1.15 : 0.42,
              intensity: anchor ? 0.78 : 0.3,
            });
          }
        }

        // Systemportalens felt: én partikelmasse, to adfærd. Hovedparten
        // driver frit i rummet og trækkes mod kernen, mens en tredjedel løber
        // ud gennem hub-rørene mod de tre spor. Ét Points-objekt, ét draw call.
        const count = compact ? 460 : 1500;
        const conduits = edges.filter((edge) => edge.hub).map((edge) => edge.curve);
        const core = nodes.find((node) => node.id === HUB)?.home ?? new THREE.Vector3();

        const positions = new Float32Array(count * 3);
        const home = new Float32Array(count * 3);
        const p0 = new Float32Array(count * 3);
        const p1 = new Float32Array(count * 3);
        const p2 = new Float32Array(count * 3);
        const conduitFlag = new Float32Array(count);
        const seeds = new Float32Array(count);
        const scales = new Float32Array(count);

        for (let index = 0; index < count; index += 1) {
          // Fladtrykt skal omkring hele grafen — bred nok til at læses som rum.
          const angle = noise(index, 1) * Math.PI * 2;
          const lift = Math.acos(2 * noise(index, 2) - 1);
          const radius = 1.35 + Math.pow(noise(index, 3), 0.7) * 3.0;
          const x = Math.sin(lift) * Math.cos(angle) * radius;
          const y = Math.cos(lift) * radius * 0.52;
          const z = Math.sin(lift) * Math.sin(angle) * radius * 0.78 - 0.5;
          home.set([x, y, z], index * 3);
          positions.set([x, y, z], index * 3);

          // Hver tredje partikel bindes til et rør, fordelt jævnt på de tre spor.
          const curve = index % 3 === 0 ? conduits[(index / 3) % conduits.length] : null;
          conduitFlag[index] = curve ? 1 : 0;
          const a = curve ? curve.v0 : core;
          const b = curve ? curve.v1 : core;
          const c = curve ? curve.v2 : core;
          p0.set([a.x, a.y, a.z], index * 3);
          p1.set([b.x, b.y, b.z], index * 3);
          p2.set([c.x, c.y, c.z], index * 3);

          seeds[index] = noise(index, 4);
          scales[index] = 0.55 + noise(index, 5) * 1.05;
        }

        const fieldGeometry = new THREE.BufferGeometry();
        fieldGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        fieldGeometry.setAttribute("aHome", new THREE.BufferAttribute(home, 3));
        fieldGeometry.setAttribute("aP0", new THREE.BufferAttribute(p0, 3));
        fieldGeometry.setAttribute("aP1", new THREE.BufferAttribute(p1, 3));
        fieldGeometry.setAttribute("aP2", new THREE.BufferAttribute(p2, 3));
        fieldGeometry.setAttribute("aConduit", new THREE.BufferAttribute(conduitFlag, 1));
        fieldGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
        fieldGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
        // Feltet fylder altid rammen; frustum culling må ikke gætte på det.
        fieldGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8);

        field = new THREE.Points(
          fieldGeometry,
          new THREE.ShaderMaterial({
            vertexShader: FIELD_VERTEX,
            fragmentShader: FIELD_FRAGMENT,
            transparent: true,
            depthWrite: false,
            uniforms: {
              uTime: { value: 0 },
              uConverge: { value: 0 },
              uPointer: { value: new THREE.Vector2() },
              uSize: { value: compact ? 0.26 : 0.32 },
              uDpr: { value: ctx.renderer.getPixelRatio() },
              uCore: { value: core.clone() },
              uColorCore: { value: new THREE.Color(0xf28ea2) },
              uColorEdge: { value: new THREE.Color(0xc94779) },
              uOpacity: { value: 0.7 },
            },
          })
        );
        system.add(field);
      },
      update: (ctx, elapsed, delta) => {
        const still = ctx.reducedMotion;
        const dark = themeRef.current === "dark";
        const glow = dark ? 1.2 : 1.02;
        const hovered = hoverRef.current;
        const active = activeRef.current;
        if (themeRef.current !== lastTheme) {
          lastTheme = themeRef.current;
          applyTheme(dark);
        }

        // Scroll-fortællingen: feltet er spredt, når sektionen kommer ind, og
        // samlet omkring kernen, når den står midt i skærmen. Uafhængigt af hover.
        const box = host.getBoundingClientRect();
        const viewport = window.innerHeight || 1;
        const distance = Math.abs(box.top + box.height / 2 - viewport / 2);
        const centred = 1 - Math.min(distance / (viewport * 0.7 + box.height * 0.5), 1);
        const wanted = still ? 0.85 : centred * centred * (3 - 2 * centred);
        converge += (wanted - converge) * (still ? 1 : Math.min(delta * 2.2, 1));

        const reach = still || compact ? 0 : 1;
        if (field) {
          field.material.uniforms.uTime.value = still ? 0 : elapsed;
          field.material.uniforms.uConverge.value = converge;
          field.material.uniforms.uPointer.value.set(
            pointerRef.current.x * reach,
            pointerRef.current.y * reach
          );
        }

        if (!still) {
          system.rotation.y = Math.sin(elapsed * 0.12) * 0.17;
          system.rotation.x = Math.sin(elapsed * 0.083) * 0.075;
        }

        // Parallax: kameraet flytter sig, ikke motivet — dybden forbliver ægte.
        const targetX = pointerRef.current.x * 0.9 * reach;
        const targetY = pointerRef.current.y * 0.55 * reach;
        ctx.camera.position.x += (targetX - ctx.camera.position.x) * Math.min(delta * 2.4, 1);
        ctx.camera.position.y += (targetY - ctx.camera.position.y) * Math.min(delta * 2.4, 1);
        ctx.camera.lookAt(0, 0, 0);

        nodes.forEach((node) => {
          // Det åbne spor får et tillæg — aldrig en fast værdi, der kan
          // overhale kernens hvileniveau.
          const target =
            node.id === hovered
              ? 1
              : hovered
                ? node.id === HUB
                  ? 0.36
                  : 0.12
                : node.base + (node.id === active ? 0.14 : 0);
          node.intensity += (target - node.intensity) * (still ? 1 : Math.min(delta * 5, 1));

          if (!still) {
            node.group.position.y = node.home.y + Math.sin(elapsed * 0.55 + node.phase) * 0.07;
            node.group.position.x = node.home.x + Math.cos(elapsed * 0.37 + node.phase) * 0.045;
            node.ring.rotation.z += delta * (0.1 + node.progress * 0.34);
            node.core.rotation.y = elapsed * 0.24 + node.phase;
          }

          const lift = 1 + node.intensity * 0.16;
          node.group.scale.setScalar(lift);
          node.core.material.emissiveIntensity = 0.22 + node.intensity * 1.55;
          node.core.material.opacity = Math.min((0.55 + node.intensity * 0.42) * glow, 1);
          node.shell.material.opacity = Math.min((0.2 + node.intensity * 0.62) * glow, 1);
          node.ring.material.opacity = Math.min((0.1 + node.intensity * 0.52) * glow, 1);
          if (node.glow) {
            node.glow.scale.setScalar(still ? 1 : 1 + Math.sin(elapsed * 0.7) * 0.06);
            node.glow.material.opacity = Math.min(
              (0.09 + node.intensity * 0.14 + converge * 0.1) * (dark ? 1.5 : 1.1),
              0.46
            );
          }

          // Etiketten følger nodens projicerede position — ingen separat layout.
          const label = labelRefs.current[node.id];
          if (label) {
            projected.copy(node.group.position).applyMatrix4(system.matrixWorld).project(ctx.camera);
            const x = (projected.x * 0.5 + 0.5) * ctx.width;
            const y = (-projected.y * 0.5 + 0.5) * ctx.height;
            label.style.transform = `translate3d(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%), 0)`;
            label.style.setProperty("--node-depth", (1 - Math.min(Math.max(projected.z, 0), 1)).toFixed(3));
            label.style.setProperty("--node-lit", node.intensity.toFixed(3));
          }
        });

        edges.forEach((edge) => {
          const touched = edge.a === hovered || edge.b === hovered;
          const anchored = edge.a === active || edge.b === active;
          const target = touched
            ? 1
            : hovered
              ? 0.08
              : (edge.hub ? 0.78 : 0.3) + (anchored ? 0.12 : 0);
          edge.intensity += (target - edge.intensity) * (still ? 1 : Math.min(delta * 5, 1));
          edge.line.material.opacity = Math.min(
            (0.1 + edge.intensity * 0.55 + (edge.hub ? converge * 0.12 : 0)) * edge.weight * glow + 0.04,
            1
          );

          const attribute = edge.pulses.geometry.getAttribute("position") as THREE.BufferAttribute;
          edge.offsets.forEach((offset, index) => {
            const next = still ? offset : (offset + delta * edge.speed) % 1;
            edge.offsets[index] = next;
            const point = edge.curve.getPointAt(next);
            attribute.setXYZ(index, point.x, point.y, point.z);
          });
          attribute.needsUpdate = true;
          edge.pulses.material.opacity = still
            ? 0
            : Math.min(edge.intensity * (edge.hub ? 1.05 : 0.68) * glow, 1);
        });
      },
    });

    // Cursor-parallax læses på værten, så den kun reagerer omkring visualiseringen.
    const move = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - box.left) / box.width - 0.5) * 2;
      pointerRef.current.y = -((event.clientY - box.top) / box.height - 0.5) * 2;
    };
    const reset = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", reset);

    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", reset);
      dispose();
      system.clear();
    };
  }, [shape]);

  const text = labels[locale];

  return (
    <div className="constellation" ref={hostRef}>
      <div className="constellation-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="constellation-nodes" role="group" aria-label={text.heading}>
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            ref={(element) => {
              labelRefs.current[project.id] = element;
            }}
            className={`constellation-node${activeId === project.id ? " current" : ""}`}
            style={{ "--accent": project.accent } as React.CSSProperties}
            aria-current={activeId === project.id}
            title={`${text.open}: ${project.title}`}
            onPointerEnter={() => {
              hoverRef.current = project.id;
            }}
            onPointerLeave={() => {
              if (hoverRef.current === project.id) hoverRef.current = "";
            }}
            onFocus={() => {
              hoverRef.current = project.id;
            }}
            onBlur={() => {
              if (hoverRef.current === project.id) hoverRef.current = "";
            }}
            onClick={() => onSelect(project.id)}
          >
            <span className="constellation-index">{project.index}</span>
            <span className="constellation-name">{project.title}</span>
            <span className="constellation-value">{project.progress}%</span>
          </button>
        ))}
      </div>
      <p className="constellation-hint">{text.hint}</p>
    </div>
  );
}
