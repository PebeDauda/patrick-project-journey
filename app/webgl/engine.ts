// Fælles WebGL-motor for sidens 3D-visualiseringer.
//
// Formålet er ÉN kilde til scene-, renderer- og animationsopsætning, så nye
// visualiseringer tilføjes som konfiguration (build/update) frem for som endnu
// en selvstændig renderer. Motoren står selv for:
//   - capped devicePixelRatio
//   - resize uden layout shift
//   - pause af render-loopet når værten er ude af viewport eller fanen er skjult
//   - prefers-reduced-motion videregivet til konfigurationen
//   - fuld oprydning af geometri, materialer og context
import * as THREE from "three";

export type EngineContext = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
  reducedMotion: boolean;
};

export type EngineConfig = {
  isPaused?: () => boolean;
  fov?: number;
  distance?: number;
  dprCap?: number;
  antialias?: boolean;
  powerPreference?: WebGLPowerPreference;
  /** Bygger scenens indhold. Kaldes én gang efter mount. */
  build: (ctx: EngineContext) => void;
  /** Kaldes pr. frame med sekunder siden mount. Springes ikke over ved reduced motion — konfigurationen bestemmer selv, hvad der må bevæge sig. */
  update?: (ctx: EngineContext, elapsed: number, delta: number) => void;
  /** Kaldes efter hver resize, hvis visualiseringen skal reagere på formatet. */
  resize?: (ctx: EngineContext) => void;
};

/** Frigiver geometri og materialer i hele træet. */
export function disposeTree(root: THREE.Object3D) {
  root.traverse((item) => {
    const holder = item as Partial<THREE.Mesh>;
    holder.geometry?.dispose();
    const material = holder.material;
    if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
    else material?.dispose();
  });
}

/** Blander to hex-farver — bruges til forbindelser mellem to projektfarver. */
export function mixColor(a: THREE.ColorRepresentation, b: THREE.ColorRepresentation, amount = 0.5) {
  return new THREE.Color(a).lerp(new THREE.Color(b), amount);
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Monterer en visualisering i `host` og returnerer en oprydningsfunktion.
 * Returnerer en no-op, hvis WebGL ikke kan oprettes, så siden aldrig går i sort.
 */
export function mountEngine(host: HTMLElement, config: EngineConfig): () => void {
  const reducedMotion = prefersReducedMotion();
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: config.antialias ?? true,
      powerPreference: config.powerPreference ?? "low-power",
    });
  } catch {
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, config.dprCap ?? 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(config.fov ?? 30, 1, 0.1, 100);
  camera.position.set(0, 0, config.distance ?? 3.6);

  const ctx: EngineContext = { scene, camera, renderer, width: 1, height: 1, reducedMotion };

  const resize = () => {
    ctx.width = host.clientWidth || 140;
    ctx.height = host.clientHeight || 140;
    renderer.setSize(ctx.width, ctx.height, false);
    camera.aspect = ctx.width / ctx.height;
    camera.updateProjectionMatrix();
    config.resize?.(ctx);
  };

  config.build(ctx);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(host);
  resize();

  // Render-loopet kører kun, når visualiseringen faktisk kan ses.
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  let visible = true;
  let running = false;

  const tick = (time: number) => {
    frame = requestAnimationFrame(tick);
    if (config.isPaused?.()) { last=time; return; }
    const delta = last ? Math.min((time - last) / 1000, 0.1) : 0;
    last = time;
    elapsed += delta;
    config.update?.(ctx, elapsed, delta);
    renderer.render(scene, camera);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = 0;
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
  };
  const sync = () => (visible && !document.hidden ? start() : stop());

  const viewObserver = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      sync();
    },
    { rootMargin: "120px" }
  );
  viewObserver.observe(host);
  document.addEventListener("visibilitychange", sync);
  sync();

  return () => {
    stop();
    document.removeEventListener("visibilitychange", sync);
    viewObserver.disconnect();
    sizeObserver.disconnect();
    disposeTree(scene);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
