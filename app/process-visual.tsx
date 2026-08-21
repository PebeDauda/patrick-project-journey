"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type ProcessVisualProps = {
  kind: "opdag" | "form" | "byg" | "bevis" | "skaler";
};

const palette = {
  pink: 0xf28ea2,
  pale: 0xffdce2,
  plum: 0x6f315f,
  acid: 0xd8ff4f,
};

function makeLine(points: THREE.Vector3[], color = palette.pink) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.72 })
  );
}

function makeNode(position: THREE.Vector3, scale = 1) {
  const node = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.09 * scale, 2),
    new THREE.MeshBasicMaterial({ color: palette.pale })
  );
  node.position.copy(position);
  return node;
}

function makeParticles(count: number, spread: number) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radius = spread * (0.45 + Math.random() * 0.55);
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * spread;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = height;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: palette.pink, size: 0.035, transparent: true, opacity: 0.78 })
  );
}

function buildForm(kind: ProcessVisualProps["kind"]) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(kind === "skaler" ? 0.48 : 0.58, 3),
    new THREE.MeshPhysicalMaterial({
      color: palette.plum,
      emissive: palette.pink,
      emissiveIntensity: 0.7,
      roughness: 0.22,
      metalness: 0.32,
      transparent: true,
      opacity: 0.84,
      wireframe: kind === "form",
    })
  );
  group.add(core);

  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(0.84, 0.012, 8, 96),
    new THREE.MeshBasicMaterial({ color: palette.acid, transparent: true, opacity: 0.74 })
  );
  orbit.rotation.x = Math.PI * 0.38;
  orbit.rotation.z = -0.26;
  group.add(orbit);

  if (kind === "opdag" || kind === "form") {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.025, 10, 72),
      new THREE.MeshBasicMaterial({ color: palette.pale, transparent: true, opacity: 0.68 })
    );
    ring.rotation.y = Math.PI * 0.28;
    group.add(ring);
  }

  if (kind === "byg" || kind === "skaler") {
    const nodes: THREE.Vector3[] = [];
    const count = kind === "skaler" ? 9 : 6;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const distance = kind === "skaler" ? 0.92 + (index % 2) * 0.22 : 0.72;
      const point = new THREE.Vector3(Math.cos(angle) * distance, Math.sin(angle * 1.7) * 0.42, Math.sin(angle) * distance);
      nodes.push(point);
      group.add(makeNode(point, kind === "skaler" ? 1.15 : 0.9));
      group.add(makeLine([new THREE.Vector3(0, 0, 0), point], index % 2 ? palette.pink : palette.pale));
    }
    if (kind === "skaler") {
      group.add(makeLine(nodes.slice(0, 5), palette.pink));
    }
  }

  if (kind === "bevis") {
    for (let index = 0; index < 3; index += 1) {
      const measurementRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.7 + index * 0.16, 0.008, 6, 80),
        new THREE.MeshBasicMaterial({ color: index === 1 ? palette.acid : palette.pale, transparent: true, opacity: 0.6 - index * 0.12 })
      );
      measurementRing.rotation.x = Math.PI * (0.25 + index * 0.18);
      measurementRing.rotation.y = index * 0.5;
      group.add(measurementRing);
    }
  }

  group.add(makeParticles(kind === "skaler" ? 70 : 42, kind === "skaler" ? 1.45 : 1.12));
  return group;
}

export default function ProcessVisual({ kind }: ProcessVisualProps) {
  const hostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 3.6);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffdce2, 1.8);
    const key = new THREE.PointLight(palette.pink, 4.2, 5);
    key.position.set(1.2, 1.2, 2);
    scene.add(ambient, key);
    const object = buildForm(kind);
    scene.add(object);

    const resize = () => {
      const width = host.clientWidth || 140;
      const height = host.clientHeight || 140;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let frame = 0;
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      if (!reducedMotion) {
        object.rotation.y = time * 0.00032;
        object.rotation.x = Math.sin(time * 0.00045) * 0.08;
        key.position.x = Math.cos(time * 0.0007) * 1.4;
        key.position.y = Math.sin(time * 0.0008) * 1.2;
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((item) => {
        if (item instanceof THREE.Mesh || item instanceof THREE.Line || item instanceof THREE.Points) {
          item.geometry.dispose();
          const material = item.material;
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind]);

  return <span className="process-visual" ref={hostRef} aria-hidden="true" />;
}
