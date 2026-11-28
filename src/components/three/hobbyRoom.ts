/**
 * Interactive low-poly hobby room, built entirely in code (no model files).
 *
 * Framework-agnostic: pass the three.js namespace in, get a small controller
 * back. Used by the React hero (HobbyRoom.tsx) and by the preview artifact.
 *
 * Objects carry `userData.hobby` ids. Hover lifts an object and reports its
 * screen position; click focuses the camera on it and fires easter eggs.
 */
import type * as THREE_NS from "three";

type Three = typeof THREE_NS;
type V3 = [number, number, number];

export type HobbyId =
  | "triban" | "scott" | "orbea" | "jersey" | "medals" | "ball" | "tent"
  | "camera" | "instax" | "fuji" | "monitors" | "music" | "speakers" | "mic"
  | "scarlett" | "streamdeck" | "pi" | "prints" | "lamp";

export interface RoomOptions {
  /** Multiply light intensities (Math.PI for three >= r155, 1 for legacy). */
  lightScale?: number;
  /** URL of the Mount Fuji photo for the frame and the Instax print. */
  fujiUrl?: string;
  dark?: boolean;
  reducedMotion?: boolean;
  onHover?: (id: HobbyId | null, x: number, y: number) => void;
  onSelect?: (id: HobbyId | null) => void;
  onScore?: (made: number, shots: number) => void;
  onSong?: (index: number) => void;
}

export interface RoomController {
  setDark(dark: boolean): void;
  focus(id: HobbyId | null): void;
  dispose(): void;
}

export const SONGS = [
  { artist: "凤凰传奇 Phoenix Legend", title: "月亮之上" },
  { artist: "周杰伦 Jay Chou", title: "晴天" },
  { artist: "陈奕迅 Eason Chan", title: "十年" },
  { artist: "王菲 Faye Wong", title: "红豆" },
];

/** Camera position + target per object when focused. */
const VIEWS: Record<HobbyId, { pos: V3; look: V3 }> = {
  triban: { pos: [-0.6, 1.6, 0.6], look: [-4.6, 1.3, -1.6] },
  scott: { pos: [-0.6, 3.0, 0.6], look: [-4.6, 2.75, -1.6] },
  orbea: { pos: [-0.6, 4.4, 0.6], look: [-4.6, 4.2, -1.6] },
  jersey: { pos: [-0.7, 3.3, 2.2], look: [-0.7, 3.3, -3.9] },
  medals: { pos: [0.9, 3.2, 1.0], look: [0.9, 3.1, -3.9] },
  ball: { pos: [-0.6, 3.0, 3.6], look: [-2.6, 2.6, -2.5] },
  tent: { pos: [0.6, 2.3, 6.6], look: [-2.7, 0.7, 1.7] },
  camera: { pos: [1.0, 2.1, 0.5], look: [2.9, 1.45, 2.6] },
  instax: { pos: [1.0, 1.8, 4.6], look: [-0.3, 0.9, 2.7] },
  fuji: { pos: [-2.4, 3.4, 1.6], look: [-2.4, 3.4, -3.9] },
  monitors: { pos: [2.5, 2.9, 1.6], look: [2.5, 2.4, -3.4] },
  music: { pos: [3.4, 2.7, 0.6], look: [3.4, 2.5, -3.4] },
  speakers: { pos: [2.6, 2.3, 1.2], look: [2.6, 1.8, -3.4] },
  mic: { pos: [1.8, 2.3, 0.4], look: [1.2, 2.0, -2.8] },
  scarlett: { pos: [2.0, 2.2, -0.6], look: [2.0, 1.6, -2.6] },
  streamdeck: { pos: [3.2, 2.2, -0.6], look: [3.2, 1.6, -2.6] },
  pi: { pos: [4.4, 2.2, -0.6], look: [4.3, 1.7, -3.0] },
  prints: { pos: [2.6, 4.6, 0.6], look: [2.6, 4.35, -3.6] },
  lamp: { pos: [1.4, 2.6, 0.2], look: [0.9, 2.0, -3.0] },
};
const HOME = { pos: [11.2, 7.4, 12.6] as V3, look: [0.5, 2.0, -0.9] as V3 };

export function createHobbyRoom(T: Three, host: HTMLElement, opts: RoomOptions = {}): RoomController {
  const L = opts.lightScale ?? 1;
  const reduced = !!opts.reducedMotion;
  let dark = !!opts.dark;

  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.touchAction = "pan-y";
  host.prepend(renderer.domElement);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, 0.1, 120);
  const disposables: { dispose(): void }[] = [];

  // ─── material + geometry helpers ───────────────────────────────
  const mats = new Map<string, THREE_NS.MeshStandardMaterial>();
  const mat = (color: string, extra: Partial<THREE_NS.MeshStandardMaterialParameters> = {}) => {
    const key = color + JSON.stringify(extra);
    let m = mats.get(key);
    if (!m) {
      m = new T.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, flatShading: true, ...extra });
      mats.set(key, m);
      disposables.push(m);
    }
    return m;
  };
  const mesh = (geo: THREE_NS.BufferGeometry, m: THREE_NS.Material, parent: THREE_NS.Object3D, p: V3 = [0, 0, 0], shadow = true) => {
    const o = new T.Mesh(geo, m);
    o.position.set(p[0], p[1], p[2]);
    o.castShadow = shadow;
    o.receiveShadow = true;
    parent.add(o);
    disposables.push(geo);
    return o;
  };
  const box = (w: number, h: number, d: number, color: string | THREE_NS.Material, parent: THREE_NS.Object3D, p: V3 = [0, 0, 0]) =>
    mesh(new T.BoxGeometry(w, h, d), typeof color === "string" ? mat(color) : color, parent, p);
  const cyl = (rt: number, rb: number, h: number, color: string | THREE_NS.Material, parent: THREE_NS.Object3D, p: V3 = [0, 0, 0], seg = 14) =>
    mesh(new T.CylinderGeometry(rt, rb, h, seg), typeof color === "string" ? mat(color) : color, parent, p);
  const up = new T.Vector3(0, 1, 0);
  const tube = (a: V3, b: V3, r: number, color: string | THREE_NS.Material, parent: THREE_NS.Object3D) => {
    const va = new T.Vector3(...a), vb = new T.Vector3(...b);
    const len = va.distanceTo(vb);
    const o = cyl(r, r, len, color, parent, [0, 0, 0], 8);
    o.position.copy(va).add(vb).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(up, vb.clone().sub(va).normalize());
    return o;
  };
  const group = (parent: THREE_NS.Object3D, p: V3 = [0, 0, 0], id?: HobbyId) => {
    const g = new T.Group();
    g.position.set(p[0], p[1], p[2]);
    if (id) g.userData.hobby = id;
    parent.add(g);
    return g;
  };
  const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    draw(cv.getContext("2d")!);
    const tex = new T.CanvasTexture(cv);
    const t = tex as unknown as { colorSpace?: string; encoding?: number };
    if ("colorSpace" in tex) t.colorSpace = (T as unknown as { SRGBColorSpace: string }).SRGBColorSpace;
    disposables.push(tex);
    return { tex, cv, redraw: () => { draw(cv.getContext("2d")!); tex.needsUpdate = true; } };
  };

  // ─── room shell ────────────────────────────────────────────────
  const room = group(scene);
  const wallMat = new T.MeshStandardMaterial({ color: "#F1E8D8", roughness: 0.95, flatShading: true });
  const wall2Mat = new T.MeshStandardMaterial({ color: "#E9DFCC", roughness: 0.95, flatShading: true });
  const floorMat = new T.MeshStandardMaterial({ color: "#C9A57C", roughness: 0.85, flatShading: true });
  disposables.push(wallMat, wall2Mat, floorMat);
  const floor = mesh(new T.BoxGeometry(10.4, 0.3, 8.4), floorMat, room, [0, -0.15, 0], false);
  floor.receiveShadow = true;
  for (let i = -4; i <= 4; i++) box(0.02, 0.005, 8.4, "#B8916A", room, [i * 1.15, 0.003, 0]);
  mesh(new T.BoxGeometry(10.4, 6.4, 0.25), wallMat, room, [0, 3.2, -4.32], false);
  mesh(new T.BoxGeometry(0.25, 6.4, 8.4), wall2Mat, room, [-5.32, 3.2, 0], false);
  box(10.4, 0.22, 0.08, "#E3D6BF", room, [0, 0.11, -4.17]);
  box(0.08, 0.22, 8.4, "#E3D6BF", room, [-5.17, 0.11, 0]);
  // rug
  mesh(new T.CylinderGeometry(2.2, 2.2, 0.03, 28), mat("#15213B", { roughness: 1 }), room, [-1.2, 0.02, 1.4], false).scale.set(1.25, 1, 0.85);
  mesh(new T.CylinderGeometry(1.85, 1.85, 0.035, 28), mat("#E4572E", { roughness: 1 }), room, [-1.2, 0.025, 1.4], false).scale.set(1.25, 1, 0.85);
  mesh(new T.CylinderGeometry(1.6, 1.6, 0.04, 28), mat("#F1E8D8", { roughness: 1 }), room, [-1.2, 0.03, 1.4], false).scale.set(1.25, 1, 0.85);

  // ─── bikes (left wall) ─────────────────────────────────────────
  const wheels: THREE_NS.Object3D[] = [];
  const spinning = new Map<THREE_NS.Object3D, number>();
  function bike(id: HobbyId, frame: string, accent: string, tire: string, wall: string, y: number, road = false) {
    const g = group(room, [-5.0, y, -1.6], id);
    g.rotation.y = Math.PI / 2;
    const s = 0.62;
    const P = (x: number, yy: number): V3 => [x * s, yy * s, 0];
    const fm = mat(frame, { roughness: 0.4, metalness: 0.25 });
    const am = mat(accent, { roughness: 0.4, metalness: 0.25 });
    const bb = P(0, 0), seat = P(-0.35, 1.05), head = P(0.82, 1.0), headLow = P(0.9, 0.72), rear = P(-1.05, 0), front = P(1.08, 0);
    tube(bb, seat, 0.035, fm, g);
    tube(seat, head, 0.032, fm, g);
    tube(bb, headLow, 0.04, am, g);
    tube(bb, rear, 0.025, fm, g);
    tube(seat, rear, 0.022, fm, g);
    tube(headLow, head, 0.04, fm, g);
    tube(headLow, front, 0.026, fm, g);
    // wheels
    for (const c of [rear, front]) {
      const w = group(g, c);
      mesh(new T.TorusGeometry(0.66 * s * 1.5, road ? 0.04 : 0.065, 6, 28), mat(tire, { roughness: 0.9 }), w);
      if (!road) mesh(new T.TorusGeometry(0.62 * s * 1.5, 0.03, 4, 28), mat("#C8A27A", { roughness: 0.9 }), w);
      mesh(new T.TorusGeometry(0.57 * s * 1.5, 0.02, 4, 28), mat("#222631", { metalness: 0.6, roughness: 0.4 }), w);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        tube([0, 0, 0], [Math.cos(a) * 0.56 * s * 1.5, Math.sin(a) * 0.56 * s * 1.5, 0], 0.006, "#9AA0A8", w);
      }
      cyl(0.05, 0.05, 0.12, "#2A2E38", w, [0, 0, 0]).rotation.x = Math.PI / 2;
      wheels.push(w);
    }
    // saddle, bars, crank
    box(0.36, 0.06, 0.12, "#1B1E25", g, [seat[0] - 0.05, seat[1] + 0.12, 0]);
    tube(seat, [seat[0] - 0.02, seat[1] + 0.1, 0], 0.02, "#2A2E38", g);
    tube(head, [head[0] + 0.05, head[1] + 0.12, 0], 0.025, "#2A2E38", g);
    const bar = mesh(new T.TorusGeometry(0.11, 0.02, 6, 12, Math.PI * 1.2), mat("#1B1E25"), g, [head[0] + 0.14, head[1] + 0.05, 0]);
    bar.rotation.z = -Math.PI / 2;
    cyl(0.1, 0.1, 0.04, "#30343E", g, [bb[0], bb[1], 0.05]).rotation.x = Math.PI / 2;
    // wall hooks + name plate
    box(0.1, 0.1, 0.5, "#30343E", room, [-5.12, y + 0.72, -1.6 - 0.7]);
    box(0.1, 0.1, 0.5, "#30343E", room, [-5.12, y + 0.72, -1.6 + 0.55]);
    box(0.02, 0.18, 0.9, wall, room, [-5.17, y - 0.62, -1.6]);
    return g;
  }
  bike("triban", "#C8232C", "#9E1B22", "#1C1C1C", "#C8232C", 1.25);
  bike("scott", "#F4F4F2", "#2453A6", "#1C1C1C", "#2453A6", 2.75);
  bike("orbea", "#F26A1B", "#1E1E22", "#151515", "#F26A1B", 4.25, true);

  // ─── back wall: Fuji frame, jersey, medals, hoop, shelf ────────
  const fujiFrame = group(room, [-2.4, 3.45, -4.12], "fuji");
  box(1.75, 1.25, 0.08, "#15213B", fujiFrame);
  box(1.55, 1.05, 0.02, "#FAF5EC", fujiFrame, [0, 0, 0.045]);
  const photoMat = new T.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6 });
  disposables.push(photoMat);
  mesh(new T.PlaneGeometry(1.4, 0.79), photoMat, fujiFrame, [0, 0.03, 0.06], false);
  if (opts.fujiUrl) {
    new T.TextureLoader().load(opts.fujiUrl, (tx) => {
      const t = tx as unknown as { colorSpace?: string };
      if ("colorSpace" in tx) t.colorSpace = (T as unknown as { SRGBColorSpace: string }).SRGBColorSpace;
      photoMat.map = tx;
      photoMat.needsUpdate = true;
      instaxPhotoMat.map = tx;
      instaxPhotoMat.needsUpdate = true;
      disposables.push(tx);
    });
  }

  const jersey = group(room, [-0.7, 3.3, -4.1], "jersey");
  box(1.7, 2.0, 0.1, "#FAF5EC", jersey, [0, 0, -0.02]);
  box(1.84, 2.14, 0.06, "#15213B", jersey, [0, 0, -0.06]);
  const jerseyTex = canvasTex(256, 300, (c) => {
    c.fillStyle = "#1D428A"; c.fillRect(0, 0, 256, 300);
    c.fillStyle = "#FFC72C"; c.fillRect(0, 0, 256, 10);
    c.textAlign = "center"; c.fillStyle = "#FFC72C";
    c.font = "900 34px Archivo, Arial, sans-serif"; c.fillText("CURRY", 128, 78);
    c.font = "900 140px Archivo, Arial, sans-serif"; c.fillText("30", 128, 220);
    c.strokeStyle = "#FFFFFF"; c.lineWidth = 3; c.strokeText("30", 128, 220);
  });
  const jm = new T.MeshStandardMaterial({ map: jerseyTex.tex, roughness: 0.8 });
  const jSide = mat("#1D428A", { roughness: 0.8 });
  disposables.push(jm);
  mesh(new T.BoxGeometry(0.9, 1.25, 0.06), [jSide, jSide, jSide, jSide, jm, jSide] as unknown as THREE_NS.Material, jersey, [0, -0.1, 0.06]);
  for (const sx of [-1, 1]) {
    const sl = box(0.32, 0.32, 0.06, "#1D428A", jersey, [sx * 0.55, 0.38, 0.06]);
    sl.rotation.z = sx * -0.5;
    box(0.33, 0.05, 0.065, "#FFC72C", jersey, [sx * 0.63, 0.25, 0.06]).rotation.z = sx * -0.5;
  }
  box(0.36, 0.05, 0.07, "#FFC72C", jersey, [0, 0.5, 0.08]);

  const medals = group(room, [0.9, 3.85, -4.12], "medals");
  box(0.9, 0.06, 0.08, "#30343E", medals);
  const medalSwing: THREE_NS.Object3D[] = [];
  [["#E4572E", "#D4A64A", -0.28], ["#15213B", "#C9CDD2", 0.05], ["#2BA7A0", "#D4A64A", 0.32]].forEach(([ribbon, metal, x]) => {
    const m = group(medals, [x as number, 0, 0.06]);
    tube([-0.07, 0, 0], [0, -0.55, 0], 0.025, ribbon as string, m);
    tube([0.07, 0, 0], [0, -0.55, 0], 0.025, ribbon as string, m);
    const disc = cyl(0.16, 0.16, 0.03, mat(metal as string, { metalness: 0.75, roughness: 0.3 }), m, [0, -0.72, 0], 18);
    disc.rotation.x = Math.PI / 2;
    medalSwing.push(m);
  });
  const medalTex = canvasTex(128, 128, (c) => {
    c.fillStyle = "#D4A64A"; c.beginPath(); c.arc(64, 64, 62, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#15213B"; c.textAlign = "center"; c.font = "900 22px Archivo, Arial"; c.fillText("HALF", 64, 58); c.font = "800 20px Archivo, Arial"; c.fillText("21.1K", 64, 84);
  });
  const mfm = new T.MeshBasicMaterial({ map: medalTex.tex, transparent: true });
  disposables.push(mfm);
  mesh(new T.CircleGeometry(0.15, 18), mfm, medalSwing[0], [0, -0.72, 0.017], false);

  // mini hoop
  const hoop = group(room, [-3.6, 4.55, -4.12]);
  box(1.2, 0.8, 0.06, "#FAF5EC", hoop);
  box(0.5, 0.36, 0.065, "#E4572E", hoop, [0, -0.12, 0.005]);
  box(0.44, 0.3, 0.07, "#FAF5EC", hoop, [0, -0.12, 0.01]);
  const rim = mesh(new T.TorusGeometry(0.24, 0.025, 6, 20), mat("#E4572E", { metalness: 0.4 }), hoop, [0, -0.36, 0.3]);
  rim.rotation.x = Math.PI / 2;
  const net = mesh(new T.CylinderGeometry(0.24, 0.15, 0.32, 10, 1, true), new T.MeshStandardMaterial({ color: "#FAF5EC", wireframe: true }), hoop, [0, -0.53, 0.3], false);
  disposables.push(net.material as THREE_NS.Material);
  box(0.06, 0.06, 0.3, "#30343E", hoop, [0, -0.36, 0.14]);
  const rimWorld = new T.Vector3(-3.6, 4.55 - 0.36, -4.12 + 0.3);

  // basketball
  const ballTex = canvasTex(256, 128, (c) => {
    c.fillStyle = "#D9692B"; c.fillRect(0, 0, 256, 128);
    c.strokeStyle = "#2A1A10"; c.lineWidth = 4;
    c.beginPath(); c.moveTo(0, 64); c.lineTo(256, 64); c.stroke();
    for (const x of [64, 192]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 128); c.stroke(); }
    c.beginPath(); c.ellipse(128, 64, 40, 64, 0, 0, Math.PI * 2); c.stroke();
  });
  const ballMat = new T.MeshStandardMaterial({ map: ballTex.tex, roughness: 0.7 });
  disposables.push(ballMat);
  const ballG = group(room, [0.1, 0.3, 0.9], "ball");
  const ball = mesh(new T.SphereGeometry(0.3, 18, 12), ballMat, ballG);
  const ballHome = ballG.position.clone();

  // shelf with 3D prints
  const prints = group(room, [2.6, 4.2, -4.0], "prints");
  box(2.6, 0.08, 0.5, "#B8916A", prints);
  box(0.06, 0.25, 0.4, "#30343E", prints, [-1.1, -0.15, 0]);
  box(0.06, 0.25, 0.4, "#30343E", prints, [1.1, -0.15, 0]);
  // benchy-ish boat
  const benchy = group(prints, [-0.75, 0.18, 0.05]);
  box(0.46, 0.14, 0.22, "#E4572E", benchy, [0, 0, 0]);
  box(0.2, 0.16, 0.18, "#E4572E", benchy, [-0.04, 0.15, 0]);
  cyl(0.03, 0.03, 0.14, "#E4572E", benchy, [-0.04, 0.3, 0]);
  // twisted vase (lathe)
  const pts: THREE_NS.Vector2[] = [];
  for (let i = 0; i <= 10; i++) pts.push(new T.Vector2(0.09 + Math.sin(i / 10 * Math.PI) * 0.08, i * 0.05));
  mesh(new T.LatheGeometry(pts, 7), mat("#15213B", { roughness: 0.5 }), prints, [0, 0.04, 0.05]);
  // low-poly bust / planet
  mesh(new T.IcosahedronGeometry(0.17, 0), mat("#2BA7A0", { roughness: 0.6 }), prints, [0.7, 0.22, 0.05]);
  mesh(new T.TorusGeometry(0.25, 0.015, 4, 18), mat("#D4A64A"), prints, [0.7, 0.22, 0.05]).rotation.x = 1.2;

  // ─── desk setup (back wall, right) ─────────────────────────────
  const desk = group(room, [2.6, 0, -3.2]);
  box(4.2, 0.1, 1.6, "#D8BE9A", desk, [0, 1.5, 0]);
  for (const sx of [-1.95, 1.95]) for (const sz of [-0.65, 0.65]) box(0.08, 1.5, 0.08, "#15213B", desk, [sx, 0.75, sz]);
  // keyboard + mouse
  box(1.1, 0.04, 0.36, "#2A2E38", desk, [0, 1.57, 0.4]);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 13; k++) box(0.065, 0.02, 0.06, "#E3D6BF", desk, [-0.48 + k * 0.08, 1.6, 0.27 + r * 0.075]);
  box(0.14, 0.05, 0.22, "#2A2E38", desk, [0.85, 1.58, 0.45]);
  // monitors
  const screenL = canvasTex(512, 300, (c) => drawKdrama(c));
  const screenR = canvasTex(512, 300, (c) => drawPlayer(c, 0));
  const monitors = group(desk, [-0.85, 0, -0.35], "monitors");
  const music = group(desk, [0.95, 0, -0.35], "music");
  const screenMats: THREE_NS.MeshBasicMaterial[] = [];
  function monitor(parent: THREE_NS.Object3D, tex: THREE_NS.Texture, rotY: number, label: string) {
    parent.rotation.y = rotY;
    box(1.62, 0.98, 0.06, "#1B1E25", parent, [0, 2.45, 0]);
    const sm = new T.MeshBasicMaterial({ map: tex });
    screenMats.push(sm);
    disposables.push(sm);
    mesh(new T.PlaneGeometry(1.54, 0.9), sm, parent, [0, 2.46, 0.032], false);
    box(0.1, 0.55, 0.08, "#2A2E38", parent, [0, 1.8, -0.05]);
    box(0.5, 0.03, 0.3, "#2A2E38", parent, [0, 1.56, 0]);
    const badge = canvasTex(128, 24, (c) => { c.fillStyle = "#1B1E25"; c.fillRect(0, 0, 128, 24); c.fillStyle = "#9AA0A8"; c.font = "700 14px Arial"; c.textAlign = "center"; c.fillText(label, 64, 17); });
    const bm = new T.MeshBasicMaterial({ map: badge.tex });
    disposables.push(bm);
    mesh(new T.PlaneGeometry(0.32, 0.06), bm, parent, [0, 1.98, 0.032], false);
  }
  monitor(monitors, screenL.tex, 0.12, "BenQ PD2706U");
  monitor(music, screenR.tex, -0.12, "");
  // speakers (PreSonus Eris 4.5)
  const speakers = group(desk, [0, 0, -0.3], "speakers");
  const cones: THREE_NS.Object3D[] = [];
  for (const sx of [-1.85, 1.85]) {
    const sp = group(speakers, [sx, 1.55, 0]);
    sp.rotation.y = sx < 0 ? 0.25 : -0.25;
    box(0.4, 0.62, 0.42, "#2A2E38", sp, [0, 0.31, 0]);
    const woof = cyl(0.13, 0.13, 0.03, "#15213B", sp, [0, 0.22, 0.215], 18);
    woof.rotation.x = Math.PI / 2;
    cyl(0.145, 0.145, 0.02, mat("#5A8FD8", { metalness: 0.5 }), sp, [0, 0.22, 0.208], 18).rotation.x = Math.PI / 2;
    cyl(0.05, 0.05, 0.03, "#C9CDD2", sp, [0, 0.48, 0.215], 12).rotation.x = Math.PI / 2;
    cones.push(woof);
  }
  // Scarlett 2i2
  const scarlett = group(desk, [-0.55, 1.55, 0.6], "scarlett");
  box(0.5, 0.12, 0.28, mat("#C8232C", { metalness: 0.5, roughness: 0.35 }), scarlett, [0, 0.06, 0]);
  const halos: THREE_NS.MeshStandardMaterial[] = [];
  for (const kx of [-0.13, 0.03]) {
    const hm = new T.MeshStandardMaterial({ color: "#2A2E38", emissive: "#3BD16F", emissiveIntensity: 0.6 });
    halos.push(hm);
    disposables.push(hm);
    cyl(0.055, 0.055, 0.02, hm, scarlett, [kx, 0.07, 0.141], 14).rotation.x = Math.PI / 2;
  }
  cyl(0.07, 0.07, 0.03, "#1B1E25", scarlett, [0.17, 0.07, 0.141], 14).rotation.x = Math.PI / 2;
  // Stream Deck
  const deck = group(desk, [0.55, 1.55, 0.62], "streamdeck");
  const deckBody = box(0.46, 0.06, 0.3, "#1B1E25", deck, [0, 0.05, 0]);
  deckBody.rotation.x = -0.35;
  const keyMats: THREE_NS.MeshStandardMaterial[] = [];
  const keyColors = ["#E4572E", "#2BA7A0", "#D4A64A", "#5A8FD8", "#C8232C", "#F26A1B", "#FAF5EC", "#3BD16F"];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) {
    const km = new T.MeshStandardMaterial({ color: "#20242C", emissive: keyColors[(r * 5 + k) % keyColors.length], emissiveIntensity: 0.15 });
    keyMats.push(km);
    disposables.push(km);
    const key = box(0.07, 0.025, 0.07, km, deckBody, [-0.17 + k * 0.085, 0.04, -0.085 + r * 0.085]);
    key.castShadow = false;
  }
  // mic on boom arm (Shure MV7X)
  const mic = group(desk, [-1.75, 1.55, -0.55], "mic");
  box(0.16, 0.12, 0.16, "#2A2E38", mic, [0, 0.06, 0]);
  tube([0, 0.1, 0], [0.25, 0.95, 0.35], 0.025, "#1B1E25", mic);
  tube([0.25, 0.95, 0.35], [0.55, 0.85, 0.95], 0.022, "#1B1E25", mic);
  const micBody = group(mic, [0.6, 0.7, 1.0]);
  micBody.rotation.x = -0.5;
  cyl(0.075, 0.075, 0.42, "#1B1E25", micBody, [0, 0, 0], 12);
  cyl(0.08, 0.08, 0.12, mat("#2A2E38", { roughness: 1 }), micBody, [0, 0.2, 0], 12);
  const onAirMat = new T.MeshStandardMaterial({ color: "#20242C", emissive: "#E4572E", emissiveIntensity: 0.2 });
  disposables.push(onAirMat);
  box(0.06, 0.06, 0.02, onAirMat, micBody, [0, 0.02, 0.078]);
  // Raspberry Pi in its cage
  const pi = group(desk, [1.7, 1.55, 0.35], "pi");
  box(0.42, 0.04, 0.3, "#2F8F4E", pi, [0, 0.12, 0]);
  box(0.1, 0.06, 0.1, "#C9CDD2", pi, [0.08, 0.17, 0]);
  box(0.12, 0.08, 0.06, "#C9CDD2", pi, [-0.13, 0.16, 0.08]);
  for (const cx of [-0.23, 0.23]) for (const cz of [-0.17, 0.17]) cyl(0.012, 0.012, 0.32, "#9AA0A8", pi, [cx, 0.16, cz], 6);
  for (const cy of [0.01, 0.32]) {
    box(0.48, 0.015, 0.015, "#9AA0A8", pi, [0, cy, -0.17]); box(0.48, 0.015, 0.015, "#9AA0A8", pi, [0, cy, 0.17]);
    box(0.015, 0.015, 0.36, "#9AA0A8", pi, [-0.23, cy, 0]); box(0.015, 0.015, 0.36, "#9AA0A8", pi, [0.23, cy, 0]);
  }
  const ledMat = new T.MeshStandardMaterial({ color: "#20242C", emissive: "#3BD16F", emissiveIntensity: 1 });
  disposables.push(ledMat);
  box(0.03, 0.03, 0.03, ledMat, pi, [0.17, 0.16, 0.13]);
  // desk lamp
  const lamp = group(desk, [-1.45, 1.55, 0.55], "lamp");
  cyl(0.16, 0.18, 0.05, "#15213B", lamp, [0, 0.025, 0]);
  tube([0, 0.04, 0], [0.12, 0.6, -0.15], 0.02, "#15213B", lamp);
  tube([0.12, 0.6, -0.15], [0.45, 0.75, 0.05], 0.02, "#15213B", lamp);
  const shade = cyl(0.04, 0.16, 0.22, mat("#E4572E", { side: T.DoubleSide }), lamp, [0.5, 0.68, 0.08], 12);
  shade.rotation.z = -0.6;
  const bulbMat = new T.MeshStandardMaterial({ color: "#FFF4D6", emissive: "#FFD58A", emissiveIntensity: 0 });
  disposables.push(bulbMat);
  mesh(new T.SphereGeometry(0.05, 8, 6), bulbMat, lamp, [0.55, 0.6, 0.1], false);
  const lampLight = new T.PointLight("#FFD58A", 0, 6, 1.6);
  lampLight.position.set(0.55, 0.55, 0.12);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(512, 512);
  lamp.add(lampLight);
  // chair
  const chair = group(room, [2.4, 0, -1.6]);
  cyl(0.35, 0.35, 0.08, "#15213B", chair, [0, 0.95, 0], 16);
  box(0.66, 0.8, 0.08, "#15213B", chair, [0, 1.4, 0.36]);
  cyl(0.04, 0.04, 0.9, "#30343E", chair, [0, 0.47, 0], 8);
  for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; tube([0, 0.06, 0], [Math.cos(a) * 0.4, 0.04, Math.sin(a) * 0.4], 0.025, "#30343E", chair); }

  // ─── floor: tent, tripod + A6600, Instax on a crate ────────────
  const tent = group(room, [-2.7, 0, 1.7], "tent");
  tent.rotation.y = 0.5;
  const tentGeo = new T.SphereGeometry(1.15, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const tentMesh = mesh(tentGeo, mat("#E4572E", { roughness: 0.85 }), tent);
  tentMesh.scale.set(1.25, 0.85, 1);
  for (const a of [0.6, -0.6]) {
    const pole = mesh(new T.TorusGeometry(1.15, 0.018, 4, 18, Math.PI), mat("#15213B"), tent);
    pole.rotation.y = a + Math.PI / 2; pole.scale.set(1.25, 0.86, 1);
  }
  const door = mesh(new T.CircleGeometry(0.42, 3), mat("#3A2414", { side: T.DoubleSide }), tent, [0, 0.4, 1.0], false);
  door.rotation.z = Math.PI / 2;
  const lanternMat = new T.MeshStandardMaterial({ color: "#FFF4D6", emissive: "#FFC56A", emissiveIntensity: 0 });
  disposables.push(lanternMat);
  mesh(new T.CylinderGeometry(0.07, 0.07, 0.16, 8), lanternMat, tent, [0.2, 0.08, 0.6], false);
  const lanternLight = new T.PointLight("#FFC56A", 0, 3, 2);
  lanternLight.position.set(0.2, 0.4, 0.6);
  tent.add(lanternLight);
  // tiny pegs
  for (const a of [0.4, 1.6, 2.8, 4.2, 5.4]) cyl(0.015, 0.005, 0.12, "#9AA0A8", tent, [Math.cos(a) * 1.5, 0.05, Math.sin(a) * 1.2], 5);

  const camG = group(room, [2.9, 0, 2.6], "camera");
  camG.rotation.y = -2.4;
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; tube([Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55], [0, 1.25, 0], 0.025, "#1B1E25", camG); }
  cyl(0.06, 0.06, 0.12, "#30343E", camG, [0, 1.3, 0], 10);
  box(0.06, 0.04, 0.05, "#E4572E", camG, [0, 1.22, 0.06]);
  const body = group(camG, [0, 1.48, 0]);
  box(0.42, 0.26, 0.16, "#1B1E25", body);
  box(0.12, 0.3, 0.17, "#1B1E25", body, [0.16, 0.0, 0.01]);
  cyl(0.085, 0.09, 0.26, "#2A2E38", body, [-0.04, 0, 0.2], 14).rotation.x = Math.PI / 2;
  cyl(0.07, 0.07, 0.02, mat("#3A6EA5", { metalness: 0.8, roughness: 0.15 }), body, [-0.04, 0, 0.335], 14).rotation.x = Math.PI / 2;
  box(0.2, 0.13, 0.01, "#2A2E38", body, [-0.04, 0.02, -0.085]);
  const recMat = new T.MeshStandardMaterial({ color: "#20242C", emissive: "#E02020", emissiveIntensity: 0 });
  disposables.push(recMat);
  box(0.03, 0.03, 0.02, recMat, body, [0.12, 0.1, -0.085]);
  const flash = new T.PointLight("#FFFFFF", 0, 8, 2);
  flash.position.set(-0.04, 0, 0.5);
  body.add(flash);

  const crate = group(room, [-0.3, 0, 2.7]);
  box(0.8, 0.7, 0.6, "#B8916A", crate, [0, 0.35, 0]);
  for (const y of [0.15, 0.55]) box(0.82, 0.06, 0.62, "#A07A52", crate, [0, y, 0]);
  const instax = group(crate, [0, 0.7, 0], "instax");
  instax.rotation.y = 0.4;
  box(0.4, 0.42, 0.24, mat("#A9D6E5", { roughness: 0.6 }), instax, [0, 0.21, 0]);
  cyl(0.1, 0.1, 0.06, "#F4F4F2", instax, [0, 0.2, 0.14], 16).rotation.x = Math.PI / 2;
  cyl(0.06, 0.06, 0.02, mat("#1B1E25", { metalness: 0.6, roughness: 0.2 }), instax, [0, 0.2, 0.175], 14).rotation.x = Math.PI / 2;
  box(0.08, 0.06, 0.02, "#F4F4F2", instax, [0.12, 0.34, 0.125]);
  const print = group(instax, [0, 0.42, 0]);
  box(0.28, 0.005, 0.34, "#FAF5EC", print, [0, 0, 0]);
  const instaxPhotoMat = new T.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7 });
  disposables.push(instaxPhotoMat);
  const ph = mesh(new T.PlaneGeometry(0.22, 0.22), instaxPhotoMat, print, [0, 0.004, -0.03], false);
  ph.rotation.x = -Math.PI / 2;
  print.visible = false;

  // ─── lights ────────────────────────────────────────────────────
  const hemi = new T.HemisphereLight("#FFF6E6", "#C9A57C", 0.75 * L);
  scene.add(hemi);
  const sun = new T.DirectionalLight("#FFF1DA", 1.1 * L);
  sun.position.set(7, 11, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const fill = new T.DirectionalLight("#E8EEFF", 0.25 * L);
  fill.position.set(-6, 5, 9);
  scene.add(fill);

  // ─── screens ───────────────────────────────────────────────────
  function drawKdrama(c: CanvasRenderingContext2D) {
    const g = c.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, "#1C2A4A"); g.addColorStop(1, "#0C1426");
    c.fillStyle = g; c.fillRect(0, 0, 512, 300);
    c.fillStyle = "#E4572E"; c.beginPath(); c.arc(380, 120, 60, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#0C1426";
    c.fillRect(0, 190, 512, 110);
    for (let i = 0; i < 9; i++) c.fillRect(20 + i * 55, 150 - (i % 3) * 25, 40, 60 + (i % 3) * 25);
    c.fillStyle = "#FAF5EC"; c.font = "800 26px Archivo, Arial"; c.fillText("K-DRAMA NIGHT", 24, 240);
    c.font = "500 16px Arial"; c.fillStyle = "#C9CDD2"; c.fillText("Episode 7 · 46:12 / 68:00", 24, 266);
    c.fillStyle = "#30343E"; c.fillRect(24, 280, 464, 5); c.fillStyle = "#E4572E"; c.fillRect(24, 280, 316, 5);
  }
  function drawPlayer(c: CanvasRenderingContext2D, i: number) {
    const s = SONGS[i % SONGS.length];
    c.fillStyle = "#FAF5EC"; c.fillRect(0, 0, 512, 300);
    c.fillStyle = "#15213B"; c.fillRect(24, 24, 150, 150);
    c.fillStyle = "#E4572E"; c.beginPath(); c.arc(99, 99, 46, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#15213B"; c.beginPath(); c.arc(99, 99, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#15213B"; c.font = "800 30px 'PingFang SC','Noto Sans SC',Arial"; c.fillText(s.title, 196, 80);
    c.font = "600 18px 'PingFang SC','Noto Sans SC',Arial"; c.fillStyle = "#4A5266"; c.fillText(s.artist, 196, 112);
    c.font = "700 14px Arial"; c.fillStyle = "#E4572E"; c.fillText("NOW PLAYING · C-POP", 196, 150);
    for (let b = 0; b < 26; b++) { const h = 10 + ((b * 37 + i * 13) % 50); c.fillStyle = b % 2 ? "#15213B" : "#E4572E"; c.fillRect(24 + b * 18, 260 - h, 10, h); }
  }

  // ─── interaction ───────────────────────────────────────────────
  const pickables: THREE_NS.Object3D[] = [];
  room.traverse((o) => { if (o.userData.hobby) pickables.push(o); });
  // Invisible hit boxes so thin objects (spoked wheels, ribbons, arms) are easy to hover.
  const hitMat = new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
  disposables.push(hitMat);
  scene.updateMatrixWorld(true);
  const tmpBox = new T.Box3(), inv = new T.Matrix4(), size = new T.Vector3(), center = new T.Vector3();
  for (const g of pickables) {
    if (!["triban", "scott", "orbea", "medals", "mic", "lamp", "pi", "instax", "camera", "streamdeck", "scarlett"].includes(g.userData.hobby)) continue;
    inv.copy(g.matrixWorld).invert();
    tmpBox.makeEmpty();
    g.traverse((o) => {
      const m = o as THREE_NS.Mesh;
      if (!m.isMesh || !m.geometry) return;
      m.geometry.computeBoundingBox();
      const bb = m.geometry.boundingBox!.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv, m.matrixWorld));
      tmpBox.union(bb);
    });
    tmpBox.getSize(size);
    tmpBox.getCenter(center);
    const hit = new T.Mesh(new T.BoxGeometry(size.x + 0.05, size.y + 0.05, size.z + 0.05), hitMat);
    hit.position.copy(center);
    hit.castShadow = false;
    hit.renderOrder = -1;
    g.add(hit);
    disposables.push(hit.geometry);
  }
  const ray = new T.Raycaster();
  const ndc = new T.Vector2();
  let hovered: THREE_NS.Object3D | null = null;
  let focusId: HobbyId | null = null;
  const lift = new Map<THREE_NS.Object3D, number>();

  function hobbyOf(o: THREE_NS.Object3D | null): THREE_NS.Object3D | null {
    while (o) { if (o.userData.hobby) return o; o = o.parent; }
    return null;
  }
  function pick(ev: PointerEvent) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, true)[0];
    return { obj: hit ? hobbyOf(hit.object) : null, x: ev.clientX - r.left, y: ev.clientY - r.top };
  }
  const onMove = (ev: PointerEvent) => {
    if (ev.pointerType !== "mouse") return;
    const { obj, x, y } = pick(ev);
    if (obj !== hovered) {
      hovered = obj;
      renderer.domElement.style.cursor = obj ? "pointer" : "";
    }
    opts.onHover?.((obj?.userData.hobby as HobbyId) ?? null, x, y);
    const r = renderer.domElement.getBoundingClientRect();
    parallax.set((ev.clientX - r.left) / r.width - 0.5, (ev.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { hovered = null; opts.onHover?.(null, 0, 0); parallax.set(0, 0); };
  const onClick = (ev: PointerEvent) => {
    const { obj } = pick(ev);
    const id = (obj?.userData.hobby as HobbyId) ?? null;
    if (!id) return;
    easter(id);
    focus(id);
    opts.onSelect?.(id);
  };
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerleave", onLeave);
  renderer.domElement.addEventListener("click", onClick as EventListener);

  // ─── easter eggs ───────────────────────────────────────────────
  let shots = 0, made = 0, song = 0;
  let shot: { t: number; from: THREE_NS.Vector3; miss: boolean } | null = null;
  let flashT = -1, recT = -1, onAirT = -1, printT = -1;
  const keyFlash = new Map<number, number>();
  let lampOn = false, lanternOn = false;
  function easter(id: HobbyId) {
    switch (id) {
      case "ball":
        if (!shot) { shots++; shot = { t: 0, from: ballG.position.clone(), miss: shots % 4 === 0 }; }
        break;
      case "triban": case "scott": case "orbea": {
        const g = room.children.find((c) => c.userData.hobby === id);
        g?.traverse((o) => { if (wheels.includes(o)) spinning.set(o, 14); });
        break;
      }
      case "medals": medalSwing.forEach((m, i) => m.userData.swing = 0.5 + i * 0.12); break;
      case "lamp": lampOn = !lampOn; break;
      case "tent": lanternOn = !lanternOn; break;
      case "camera": flashT = 0; recT = 0; break;
      case "mic": onAirT = 0; break;
      case "instax": printT = 0; print.visible = true; break;
      case "streamdeck": for (let k = 0; k < 15; k++) keyFlash.set(k, Math.random() * 0.6); break;
      case "music": case "speakers":
        song = (song + 1) % SONGS.length; drawPlayer(screenR.cv.getContext("2d")!, song); screenR.tex.needsUpdate = true; opts.onSong?.(song);
        break;
      default: break;
    }
  }

  // ─── camera + theme ────────────────────────────────────────────
  const camPos = new T.Vector3(...HOME.pos), camLook = new T.Vector3(...HOME.look);
  const goalPos = camPos.clone(), goalLook = camLook.clone();
  const parallax = new T.Vector2();
  let homeScale = 1;
  function focus(id: HobbyId | null) {
    focusId = id;
    const v = id ? VIEWS[id] : HOME;
    goalPos.set(...v.pos);
    goalLook.set(...v.look);
    // On tall (portrait) cards, come closer so the room fills the frame.
    if (!id) goalPos.sub(goalLook).multiplyScalar(homeScale).add(goalLook);
    if (reduced) { camPos.copy(goalPos); camLook.copy(goalLook); }
  }
  function setDark(d: boolean) {
    dark = d;
    wallMat.color.set(d ? "#1A2440" : "#F1E8D8");
    wall2Mat.color.set(d ? "#16203A" : "#E9DFCC");
    floorMat.color.set(d ? "#5A4632" : "#C9A57C");
    hemi.intensity = (d ? 0.34 : 0.75) * L;
    sun.intensity = (d ? 0.12 : 1.1) * L;
    fill.intensity = (d ? 0.26 : 0.25) * L;
    hemi.color.set(d ? "#7A8BC4" : "#FFF6E6");
    if (d && !lampOn) lampOn = true;
  }
  setDark(dark);
  resize();

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const portrait = w / h < 0.95;
    camera.fov = portrait ? 40 : 32;
    homeScale = portrait ? 0.78 : 1;
    camera.updateProjectionMatrix();
    if (!focusId) { focus(null); camPos.copy(goalPos); }
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // ─── loop ──────────────────────────────────────────────────────
  let raf = 0, visible = true, last = performance.now(), time = 0;
  const tmp = new T.Vector3();
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    const k = reduced ? 1 : 1 - Math.pow(0.0015, dt);
    camPos.lerp(goalPos, k);
    camLook.lerp(goalLook, k);
    const px = focusId || reduced ? 0 : parallax.x * 0.9, py = focusId || reduced ? 0 : parallax.y * 0.5;
    camera.position.set(camPos.x + px, camPos.y - py, camPos.z - px * 0.4);
    camera.lookAt(camLook);

    // hover lift
    for (const o of pickables) {
      const target = o === hovered ? 1 : 0;
      const cur = lift.get(o) ?? 0;
      const nv = cur + (target - cur) * Math.min(1, dt * 10);
      lift.set(o, nv);
      if (o.userData.baseY === undefined) o.userData.baseY = o.position.y;
      if (o !== ballG || !shot) o.position.y = o.userData.baseY + nv * 0.06;
    }
    // wheels
    spinning.forEach((v, w) => { w.rotation.z -= v * dt; const nv = v * Math.pow(0.35, dt); if (nv < 0.05) spinning.delete(w); else spinning.set(w, nv); });
    // medals swing
    medalSwing.forEach((m, i) => {
      const sw = (m.userData.swing as number) || (hovered?.userData.hobby === "medals" ? 0.12 : 0);
      m.rotation.z = Math.sin(time * 3 + i) * sw;
      if (m.userData.swing) m.userData.swing = Math.max(0, m.userData.swing - dt * 0.25);
    });
    // basketball shot
    if (shot) {
      shot.t += dt / 1.1;
      const t = Math.min(1, shot.t);
      const to = rimWorld.clone().add(new T.Vector3(shot.miss ? 0.32 : 0, 0.05, shot.miss ? 0.1 : 0));
      if (t < 1) {
        tmp.lerpVectors(shot.from, to, t);
        tmp.y += Math.sin(t * Math.PI) * 2.0;
        ballG.position.copy(tmp);
        ball.rotation.x -= dt * 8;
      } else {
        const t2 = shot.t - 1;
        if (t2 < 0.9) {
          // fall through net (or bounce off rim) back to the floor
          const fall = Math.min(1, t2 / 0.9);
          ballG.position.set(to.x + (shot.miss ? fall * 0.9 : 0), to.y - fall * (to.y - 0.3) + Math.abs(Math.sin(fall * Math.PI * 2)) * 0.6 * (1 - fall), to.z + fall * 1.2);
        } else {
          if (!shot.miss) made++;
          opts.onScore?.(made, shots);
          shot = null;
          ballG.userData.baseY = ballHome.y;
          ballG.position.copy(ballHome);
        }
      }
    }
    // lamp, lantern, camera flash, rec, on-air, keys, instax print
    lampLight.intensity += ((lampOn ? 2.2 * L : 0) - lampLight.intensity) * Math.min(1, dt * 6);
    bulbMat.emissiveIntensity = lampOn ? 1.4 : 0;
    lanternLight.intensity += ((lanternOn ? 1.6 * L : 0) - lanternLight.intensity) * Math.min(1, dt * 6);
    lanternMat.emissiveIntensity = lanternOn ? 1.5 : 0;
    if (flashT >= 0) { flashT += dt; flash.intensity = flashT < 0.12 ? 6 * L : 0; if (flashT > 0.2) flashT = -1; }
    if (recT >= 0) { recT += dt; recMat.emissiveIntensity = Math.sin(recT * 8) > 0 ? 1.2 : 0.1; if (recT > 4) { recT = -1; recMat.emissiveIntensity = 0; } }
    if (onAirT >= 0) { onAirT += dt; onAirMat.emissiveIntensity = 1.4; if (onAirT > 3) { onAirT = -1; onAirMat.emissiveIntensity = 0.2; } }
    keyMats.forEach((m, i) => {
      const f = keyFlash.get(i);
      if (f !== undefined) { const v = f > 0 ? 0.15 : 1.4; m.emissiveIntensity = v; const nf = f - dt; if (nf < -0.5) keyFlash.delete(i); else keyFlash.set(i, nf); }
      else m.emissiveIntensity = dark ? 0.35 : 0.15;
    });
    if (printT >= 0) { printT += dt; print.position.y = 0.42 + Math.min(1, printT / 1.2) * 0.26; if (printT > 6) { printT = -1; print.visible = false; print.position.y = 0.42; } }
    ledMat.emissiveIntensity = Math.sin(time * 6) > 0.3 ? 1.2 : 0.2;
    halos.forEach((h, i) => (h.emissiveIntensity = 0.4 + Math.abs(Math.sin(time * (3 + i))) * 0.8));
    // speaker cones pulse with the "music"
    const beat = reduced ? 0 : Math.max(0, Math.sin(time * 7.5)) * 0.04;
    cones.forEach((c) => (c.position.z = 0.215 + beat));
    screenMats.forEach((m) => m.color.setScalar(dark ? 1.15 : 1));

    renderer.render(scene, camera);
    if (visible && !reduced) raf = requestAnimationFrame(frame);
  }
  const start = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); };
  // In reduced motion, render on demand (after interactions) instead of looping.
  const kick = () => { if (reduced) { requestAnimationFrame(frame); setTimeout(() => requestAnimationFrame(frame), 50); } };
  renderer.domElement.addEventListener("click", kick);
  renderer.domElement.addEventListener("pointermove", kick);
  start();
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
  io.observe(host);

  return {
    setDark: (d) => { setDark(d); kick(); if (!reduced && visible) start(); },
    focus: (id) => { focus(id); kick(); },
    dispose: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.domElement.removeEventListener("click", onClick as EventListener);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
