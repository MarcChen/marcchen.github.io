"use client";

import { useEffect, useRef } from "react";
import styles from "@/styles/components/RideScene.module.css";

/**
 * Procedural low-poly landscape with Marc's Paris → Saint-Malo ride drawn as a
 * line across it. three.js is imported lazily so it never blocks first paint.
 * Colours come from the brand tokens and follow the light/dark scheme.
 * Reduced motion: renders one still frame. Off-screen: the loop pauses.
 */

// Shape of the ride's GPX elevation profile (metres, 0–177 m over ~600 km).
const PROFILE = [10, 18, 35, 22, 48, 60, 42, 70, 55, 38, 80, 64, 30, 52, 90, 120, 150, 177, 110, 92, 130, 85, 60, 74, 58, 40, 66, 95, 70, 45, 28, 36, 22, 15];
const RIDE_KM = 600;

function profileAt(t: number) {
  const x = Math.max(0, Math.min(1, t)) * (PROFILE.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = PROFILE[Math.min(i, PROFILE.length - 1)];
  const b = PROFILE[Math.min(i + 1, PROFILE.length - 1)];
  return a + (b - a) * f;
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number) {
  let s = 0, amp = 1, f = 1;
  for (let o = 0; o < 4; o++) { s += amp * noise(x * f, y * f); amp *= 0.5; f *= 2; }
  return s / 1.875;
}

interface RideSceneProps {
  kmLabel: string;
  altLabel: string;
  title: string;
}

export default function RideScene({ kmLabel, altLabel, title }: RideSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const kmRef = useRef<HTMLSpanElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        host.dataset.fallback = "true";
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.prepend(renderer.domElement);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 200);

      const SX = 40, SZ = 26;
      const routeZ = (x: number) => Math.sin(x * 0.17) * 3 + Math.sin(x * 0.05 + 1.2) * 1.8;
      const height = (x: number, z: number) => {
        const base = fbm(x * 0.09 + 3, z * 0.09 + 7) * 5 - 1.1;
        const valley = Math.min(1, Math.abs(z - routeZ(x)) / 4.5);
        const ride = (profileAt((x + SX / 2) / SX) / 177) * 2.1;
        const back = Math.max(0, -(z + 4)) * 0.3 * fbm(x * 0.15, z * 0.15) * 2;
        return base * valley + ride * (1 - valley) + back;
      };

      const geo = new THREE.PlaneGeometry(SX, SZ, 130, 80);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
      geo.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1, metalness: 0 });
      const terrain = new THREE.Mesh(geo, terrainMat);
      scene.add(terrain);
      const wireMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.12 });
      const wire = new THREE.Mesh(geo, wireMat);
      wire.position.y = 0.01;
      scene.add(wire);

      const peakMat = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1 });
      const peak = new THREE.Mesh(new THREE.ConeGeometry(6, 6.6, 9, 4), peakMat);
      peak.position.set(10, 2.2, -13);
      scene.add(peak);
      const capMat = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.8 });
      const cap = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.3, 9, 1), capMat);
      cap.position.set(10, 4.95, -13);
      scene.add(cap);

      const pts: import("three").Vector3[] = [];
      for (let x = -SX / 2 + 1; x <= SX / 2 - 1; x += 0.5) {
        const z = routeZ(x);
        pts.push(new THREE.Vector3(x, height(x, z) + 0.15, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const routeMat = new THREE.MeshBasicMaterial();
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 360, 0.1, 8, false), routeMat));
      const riderMat = new THREE.MeshBasicMaterial();
      const rider = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), riderMat);
      scene.add(rider);
      const ringMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.48, 0.6, 40), ringMat);
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.65);
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xffffff, 1.05);
      sun.position.set(-12, 18, 10);
      scene.add(sun);
      scene.fog = new THREE.Fog(0xffffff, 24, 58);

      const paint = () => {
        const cs = getComputedStyle(document.documentElement);
        const v = (n: string, d: string) => cs.getPropertyValue(n).trim() || d;
        const cream = new THREE.Color(v("--cream", "#FAF5EC"));
        const sand = new THREE.Color(v("--sand", "#E7DBC5"));
        const oat = new THREE.Color(v("--oat", "#F1E8D8"));
        const taupe = new THREE.Color(v("--taupe", "#E4572E"));
        const esp = new THREE.Color(v("--espresso", "#15213B"));
        const metaScheme = document.querySelector('meta[name="color-scheme"]')?.getAttribute("content");
        const dark = metaScheme === "dark" ||
          (metaScheme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        const ground = dark ? esp.clone() : oat.clone();
        (scene.fog as import("three").Fog).color.copy(ground);
        // Surfaces stay in the cream/sand family; the accent only marks the rider.
        terrainMat.color.copy(dark ? esp.clone().lerp(sand, 0.18) : sand.clone().lerp(esp, 0.06));
        wireMat.color.copy(dark ? cream : esp);
        wireMat.opacity = dark ? 0.12 : 0.1;
        peakMat.color.copy(dark ? esp.clone().lerp(sand, 0.4) : sand.clone().lerp(esp, 0.18));
        capMat.color.copy(cream);
        routeMat.color.copy(dark ? cream : esp);
        ringMat.color.copy(taupe);
        riderMat.color.copy(taupe);
        hemi.groundColor.copy(esp);
        host.style.setProperty("--scene-ground", `#${ground.getHexString()}`);
      };
      paint();

      const size = () => {
        const w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        cam.fov = w < 480 ? 48 : 36;
        cam.updateProjectionMatrix();
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(host);

      let mx = 0, my = 0;
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width - 0.5;
        my = (e.clientY - r.top) / r.height - 0.5;
      };
      host.addEventListener("pointermove", onMove);

      let visible = true;
      let raf = 0;
      const t0 = performance.now();
      const frame = (now: number) => {
        const el = Math.max(0, (now - t0) / 1000);
        const still = reduced.matches;
        const t = still ? 0.55 : Math.min(0.999, (el * 0.03) % 1);
        const p = curve.getPointAt(t);
        rider.position.set(p.x, p.y + 0.2, p.z);
        ring.position.set(p.x, p.y + 0.02, p.z);
        const pulse = still ? 0.4 : (el * 1.3) % 1;
        ring.scale.setScalar(1 + pulse * 1.6);
        ringMat.opacity = 0.7 * (1 - pulse);
        if (kmRef.current) kmRef.current.textContent = String(Math.round(t * RIDE_KM));
        if (altRef.current) altRef.current.textContent = String(Math.round(profileAt(t)));
        const ang = still ? 0.4 : 0.4 + Math.sin(el * 0.08) * 0.16 + mx * 0.15;
        cam.position.set(Math.sin(ang) * 16 + mx * 1.5, 12 - my * 1.2, Math.cos(ang) * 28);
        cam.lookAt(1, 0.6, -3);
        renderer.render(scene, cam);
        if (!still && visible) raf = requestAnimationFrame(frame);
      };
      const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
      start();

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      });
      io.observe(host);

      const schemeMq = window.matchMedia("(prefers-color-scheme: dark)");
      const repaint = () => { paint(); start(); };
      schemeMq.addEventListener("change", repaint);
      reduced.addEventListener("change", start);
      const meta = document.querySelector('meta[name="color-scheme"]');
      const mo = new MutationObserver(repaint);
      if (meta) mo.observe(meta, { attributes: true });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        mo.disconnect();
        schemeMq.removeEventListener("change", repaint);
        reduced.removeEventListener("change", start);
        host.removeEventListener("pointermove", onMove);
        scene.traverse((o) => {
          const m = o as import("three").Mesh;
          m.geometry?.dispose?.();
        });
        [terrainMat, wireMat, peakMat, capMat, routeMat, ringMat, riderMat].forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={hostRef} className={styles.scene} role="img" aria-label={title}>
      <div className={styles.hud} aria-hidden="true">
        <span className={styles.hudTitle}>{title}</span>
        <span>
          <span ref={kmRef}>0</span> / {RIDE_KM} {kmLabel}
        </span>
        <span>
          <span ref={altRef}>10</span> {altLabel}
        </span>
      </div>
    </div>
  );
}
