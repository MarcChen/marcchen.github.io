/**
 * Interactive hobby room, built entirely in code (no model files).
 *
 * Framework-agnostic: pass three.js and three addons in, get a small controller
 * back. Used by the React hero (HobbyRoom.tsx) and by the preview artifact.
 *
 * - Orbit: drag to turn (limited to the open side of the room); click inside,
 *   then scroll to zoom; right-drag to pan. Touch: two fingers turn and zoom,
 *   one finger keeps scrolling the page.
 * - Objects carry `userData.hobby` ids: hover lifts them, click flies the camera
 *   to them (you can orbit around the object) and fires easter eggs.
 */
import type * as THREE_NS from "three";

type Three = typeof THREE_NS;
type V3 = [number, number, number];
type Mat = THREE_NS.Material;
type Obj = THREE_NS.Object3D;

export type HobbyId =
  | "triban" | "scott" | "orbea" | "jersey" | "medals" | "ball" | "tent"
  | "camera" | "instax" | "fuji" | "monitors" | "music" | "speakers" | "mic"
  | "scarlett" | "streamdeck" | "pi" | "prints" | "lamp";

/* Minimal shapes of the addons we use, so callers can pass them from any build. */
interface OrbitLike {
  target: THREE_NS.Vector3;
  enableDamping: boolean;
  dampingFactor: number;
  enableZoom: boolean;
  enablePan: boolean;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  rotateSpeed: number;
  zoomSpeed: number;
  touches: { ONE?: number | null; TWO?: number | null };
  update(): boolean;
  dispose(): void;
  addEventListener(type: string, fn: () => void): void;
}
export interface RoomAddons {
  OrbitControls: new (camera: THREE_NS.Camera, dom: HTMLElement) => OrbitLike;
  RoundedBoxGeometry: new (w: number, h: number, d: number, segments?: number, radius?: number) => THREE_NS.BufferGeometry;
  RoomEnvironment: new () => THREE_NS.Scene;
}

export interface RoomOptions {
  addons: RoomAddons;
  /** URL of the Mount Fuji photo for the frame and the Instax print. */
  fujiUrl?: string;
  dark?: boolean;
  reducedMotion?: boolean;
  onHover?: (id: HobbyId | null, x: number, y: number) => void;
  onSelect?: (id: HobbyId | null) => void;
  onScore?: (made: number, shots: number) => void;
  onSong?: (index: number) => void;
  /** Fires when the view leaves / returns to the default framing. */
  onMoved?: (moved: boolean) => void;
}

export interface RoomController {
  setDark(dark: boolean): void;
  focus(id: HobbyId | null): void;
  reset(): void;
  dispose(): void;
}

export const SONGS = [
  { artist: "凤凰传奇 Phoenix Legend", title: "月亮之上" },
  { artist: "周杰伦 Jay Chou", title: "晴天" },
  { artist: "陈奕迅 Eason Chan", title: "十年" },
  { artist: "王菲 Faye Wong", title: "红豆" },
];

const BIKE_Y = { triban: 0.95, scott: 2.35, orbea: 3.75 } as const;
const BIKE_Z = { triban: -1.75, scott: -1.45, orbea: -1.75 } as const;

/** Camera position + orbit target per object when focused (all on the open side of the room). */
const VIEWS: Record<HobbyId, { pos: V3; look: V3 }> = {
  triban: { pos: [-1.2, 1.35, 1.5], look: [-4.9, 1.05, BIKE_Z.triban] },
  scott: { pos: [-1.2, 2.75, 1.8], look: [-4.9, 2.45, BIKE_Z.scott] },
  orbea: { pos: [-1.2, 4.15, 1.5], look: [-4.9, 3.85, BIKE_Z.orbea] },
  jersey: { pos: [-0.75, 3.25, 1.4], look: [-0.75, 3.25, -4.0] },
  medals: { pos: [1.0, 3.9, 0.4], look: [1.0, 3.95, -4.0] },
  ball: { pos: [1.4, 2.6, 4.6], look: [-1.6, 2.0, -2.0] },
  tent: { pos: [0.4, 2.9, 6.2], look: [-3.0, 0.15, 1.9] },
  camera: { pos: [4.6, 2.1, 5.0], look: [2.9, 1.45, 2.6] },
  instax: { pos: [1.1, 2.0, 4.6], look: [-0.25, 0.75, 2.7] },
  fuji: { pos: [-2.4, 3.45, 1.2], look: [-2.4, 3.45, -4.0] },
  monitors: { pos: [2.4, 3.1, 0.6], look: [2.4, 2.2, -3.5] },
  music: { pos: [3.6, 2.9, 0.0], look: [3.45, 2.2, -3.5] },
  speakers: { pos: [2.6, 3.3, 0.6], look: [2.6, 1.6, -3.5] },
  mic: { pos: [2.2, 2.3, 0.1], look: [1.5, 2.05, -2.8] },
  scarlett: { pos: [2.2, 2.25, -0.9], look: [2.05, 1.62, -2.6] },
  streamdeck: { pos: [3.4, 2.25, -0.9], look: [3.2, 1.62, -2.6] },
  pi: { pos: [4.6, 2.2, -0.9], look: [4.3, 1.68, -2.85] },
  prints: { pos: [2.7, 4.5, 0.4], look: [2.6, 4.35, -3.8] },
  lamp: { pos: [1.9, 2.5, -0.4], look: [1.15, 2.0, -2.65] },
};
const HOME = { pos: [11.0, 7.0, 12.4] as V3, look: [0.4, 2.0, -0.8] as V3 };

export function createHobbyRoom(T: Three, host: HTMLElement, opts: RoomOptions): RoomController {
  const { OrbitControls, RoundedBoxGeometry, RoomEnvironment } = opts.addons;
  const reduced = !!opts.reducedMotion;
  let dark = !!opts.dark;

  // ─── renderer, scene, camera ───────────────────────────────────
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.prepend(renderer.domElement);

  const scene = new T.Scene();
  const pmrem = new T.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  (scene as unknown as { environmentIntensity: number }).environmentIntensity = 0.45;

  const camera = new T.PerspectiveCamera(32, 1, 0.05, 120);
  camera.position.set(...HOME.pos);
  const disposables: { dispose(): void }[] = [envTex, pmrem];

  // ─── helpers ───────────────────────────────────────────────────
  const mats = new Map<string, THREE_NS.MeshStandardMaterial>();
  const mat = (color: string, extra: Partial<THREE_NS.MeshStandardMaterialParameters> = {}) => {
    const key = color + JSON.stringify(extra);
    let m = mats.get(key);
    if (!m) {
      m = new T.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...extra });
      mats.set(key, m);
      disposables.push(m);
    }
    return m;
  };
  const metal = (color: string, rough = 0.35) => mat(color, { metalness: 0.85, roughness: rough });
  const plastic = (color: string, rough = 0.45) => mat(color, { roughness: rough });
  const M = (c: string | Mat) => (typeof c === "string" ? mat(c) : c);
  const mesh = (geo: THREE_NS.BufferGeometry, m: Mat | Mat[], parent: Obj, p: V3 = [0, 0, 0], shadow = true) => {
    const o = new T.Mesh(geo, m);
    o.position.set(p[0], p[1], p[2]);
    o.castShadow = shadow;
    o.receiveShadow = true;
    parent.add(o);
    disposables.push(geo);
    return o;
  };
  const box = (w: number, h: number, d: number, c: string | Mat, parent: Obj, p: V3 = [0, 0, 0]) => mesh(new T.BoxGeometry(w, h, d), M(c), parent, p);
  const rbox = (w: number, h: number, d: number, r: number, c: string | Mat, parent: Obj, p: V3 = [0, 0, 0]) =>
    mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999), M(c), parent, p);
  const cyl = (rt: number, rb: number, h: number, c: string | Mat, parent: Obj, p: V3 = [0, 0, 0], seg = 24) =>
    mesh(new T.CylinderGeometry(rt, rb, h, seg), M(c), parent, p);
  const disc = (r: number, h: number, c: string | Mat, parent: Obj, p: V3 = [0, 0, 0], seg = 28) => {
    const o = cyl(r, r, h, c, parent, p, seg);
    o.rotation.x = Math.PI / 2;
    return o;
  };
  const sphere = (r: number, c: string | Mat, parent: Obj, p: V3 = [0, 0, 0], seg = 24) => mesh(new T.SphereGeometry(r, seg, Math.max(8, seg * 0.6)), M(c), parent, p);
  const torus = (r: number, t: number, c: string | Mat, parent: Obj, p: V3 = [0, 0, 0], seg = 48, arc = Math.PI * 2) =>
    mesh(new T.TorusGeometry(r, t, 10, seg, arc), M(c), parent, p);
  const UP = new T.Vector3(0, 1, 0);
  const tube = (a: V3, b: V3, r: number, c: string | Mat, parent: Obj, rb = r) => {
    const va = new T.Vector3(...a), vb = new T.Vector3(...b);
    const o = cyl(rb, r, va.distanceTo(vb), c, parent, [0, 0, 0], 14);
    o.position.copy(va).add(vb).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(UP, vb.clone().sub(va).normalize());
    return o;
  };
  const curve = (pts: V3[], r: number, c: string | Mat, parent: Obj, closed = false, seg = 48) =>
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(...p)), closed), seg, r, 10, closed), M(c), parent);
  const group = (parent: Obj, p: V3 = [0, 0, 0], id?: HobbyId) => {
    const g = new T.Group();
    g.position.set(p[0], p[1], p[2]);
    if (id) g.userData.hobby = id;
    parent.add(g);
    return g;
  };
  const srgb = (tex: THREE_NS.Texture) => {
    const t = tex as unknown as { colorSpace?: string };
    if ("colorSpace" in tex) t.colorSpace = (T as unknown as { SRGBColorSpace: string }).SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  };
  const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d")!;
    draw(ctx);
    const tex = srgb(new T.CanvasTexture(cv));
    disposables.push(tex);
    return { tex, ctx, redraw: (fn: (c: CanvasRenderingContext2D) => void) => { fn(ctx); tex.needsUpdate = true; } };
  };
  const decal = (tex: THREE_NS.Texture, w: number, h: number, parent: Obj, p: V3, rot: V3 = [0, 0, 0]) => {
    const m = new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    disposables.push(m);
    const o = mesh(new T.PlaneGeometry(w, h), m, parent, p, false);
    o.rotation.set(...rot);
    return o;
  };
  const textTex = (text: string, color: string, font: string, w = 512, h = 128, bg?: string) =>
    canvasTex(w, h, (c) => {
      c.clearRect(0, 0, w, h);
      if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); }
      c.fillStyle = color; c.font = font; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(text, w / 2, h / 2);
    }).tex;
  const noise = (c: CanvasRenderingContext2D, w: number, h: number, alpha: number, n = 9000) => {
    for (let i = 0; i < n; i++) {
      c.fillStyle = `rgba(0,0,0,${Math.random() * alpha})`;
      c.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
  };

  // ─── room shell: plaster walls, oak floor, window ──────────────
  const room = group(scene);
  const plaster = canvasTex(256, 256, (c) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, 256, 256); noise(c, 256, 256, 0.035, 6000); });
  plaster.tex.wrapS = plaster.tex.wrapT = T.RepeatWrapping;
  plaster.tex.repeat.set(4, 3);
  const plankTex = canvasTex(1024, 1024, (c) => {
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      let x = (r % 2) * -180;
      while (x < 1024) {
        const len = 260 + Math.random() * 240;
        const tone = 165 + Math.random() * 30;
        c.fillStyle = `rgb(${tone + 40},${tone + 6},${tone - 45})`;
        c.fillRect(x, r * 128, len, 128);
        for (let g = 0; g < 14; g++) {
          c.strokeStyle = `rgba(110,70,35,${0.05 + Math.random() * 0.08})`;
          c.lineWidth = 1 + Math.random() * 2;
          c.beginPath();
          const y = r * 128 + Math.random() * 128;
          c.moveTo(x, y);
          c.bezierCurveTo(x + len * 0.3, y + 6, x + len * 0.6, y - 6, x + len, y + 2);
          c.stroke();
        }
        c.fillStyle = "rgba(70,45,25,.55)";
        c.fillRect(x, r * 128, 3, 128);
        x += len;
      }
      c.fillStyle = "rgba(70,45,25,.5)";
      c.fillRect(0, r * 128, 1024, 3);
    }
  });
  plankTex.tex.wrapS = plankTex.tex.wrapT = T.RepeatWrapping;
  plankTex.tex.repeat.set(2.2, 2.2);
  const wallMat = new T.MeshStandardMaterial({ color: "#F1E8D8", map: plaster.tex, roughness: 0.95 });
  const wall2Mat = new T.MeshStandardMaterial({ color: "#EADFCB", map: plaster.tex, roughness: 0.95 });
  const floorMat = new T.MeshStandardMaterial({ color: "#FFFFFF", map: plankTex.tex, roughness: 0.55, metalness: 0 });
  disposables.push(wallMat, wall2Mat, floorMat);
  mesh(new T.BoxGeometry(10.4, 0.3, 8.4), floorMat, room, [0, -0.15, 0], false);
  mesh(new T.BoxGeometry(10.4, 6.4, 0.25), wallMat, room, [0, 3.2, -4.32], false);
  mesh(new T.BoxGeometry(0.25, 6.4, 8.4), wall2Mat, room, [-5.32, 3.2, 0], false);
  rbox(10.4, 0.24, 0.06, 0.02, plastic("#FAF5EC"), room, [0, 0.12, -4.17]);
  rbox(0.06, 0.24, 8.4, 0.02, plastic("#FAF5EC"), room, [-5.17, 0.12, 0]);
  // window on the left wall, front part, with daylight
  const win = group(room, [-5.15, 3.0, 2.6]);
  const frameM = plastic("#FAF5EC", 0.4);
  rbox(0.12, 2.4, 0.12, 0.03, frameM, win, [0, 0, -1.0]);
  rbox(0.12, 2.4, 0.12, 0.03, frameM, win, [0, 0, 1.0]);
  rbox(0.12, 0.12, 2.12, 0.03, frameM, win, [0, 1.2, 0]);
  rbox(0.2, 0.12, 2.3, 0.03, frameM, win, [0.05, -1.2, 0]);
  rbox(0.08, 2.3, 0.06, 0.02, frameM, win, [0, 0, 0]);
  const skyMat = new T.MeshBasicMaterial({ color: "#CFE3F2" });
  disposables.push(skyMat);
  const sky = mesh(new T.PlaneGeometry(2.0, 2.3), skyMat, win, [-0.04, 0, 0], false);
  sky.rotation.y = Math.PI / 2;
  // rug
  const rugTex = canvasTex(512, 512, (c) => {
    const rings: [number, string][] = [[256, "#15213B"], [244, "#C9B79A"], [236, "#EFE5D3"], [150, "#E4D6BE"], [142, "#EFE5D3"]];
    for (const [r, col] of rings) { c.fillStyle = col; c.beginPath(); c.arc(256, 256, r, 0, Math.PI * 2); c.fill(); }
    noise(c, 512, 512, 0.08, 14000);
  });
  const rugMat = new T.MeshStandardMaterial({ map: rugTex.tex, roughness: 1, transparent: true, alphaTest: 0.5 });
  disposables.push(rugMat);
  const rug = mesh(new T.CircleGeometry(1.7, 64), rugMat, room, [-0.6, 0.012, 1.7], false);
  rug.rotation.x = -Math.PI / 2;
  rug.scale.set(1.25, 0.88, 1);

  // ─── bikes (left wall) ─────────────────────────────────────────
  const wheels: Obj[] = [];
  const spinning = new Map<Obj, number>();
  const bikeGroups: Record<string, Obj> = {};
  function bike(id: "triban" | "scott" | "orbea", frame: string, accent: string, brand: string, road: boolean) {
    const U = 1.3; // metres → room units
    const g = group(room, [-4.92, BIKE_Y[id], BIKE_Z[id]], id);
    g.rotation.y = Math.PI / 2;
    bikeGroups[id] = g;
    const P = (x: number, y: number, z = 0): V3 => [x * U, y * U, z * U];
    const fm = mat(frame, { roughness: 0.28, metalness: 0.15, envMapIntensity: 1.2 } as THREE_NS.MeshStandardMaterialParameters);
    const am = mat(accent, { roughness: 0.3, metalness: 0.15 });
    const blk = plastic("#17191F", 0.5);
    const alu = metal("#B9BEC6", 0.3);
    const bb = P(0, 0), rear = P(-0.42, 0.07), front = P(0.6, 0.07);
    const seatTop = P(-0.17, road ? 0.5 : 0.52), headTop = P(0.4, road ? 0.55 : 0.58), headLow = P(0.45, 0.4);
    const r = 0.018 * U;
    tube(bb, seatTop, r * 1.05, fm, g);
    tube(seatTop, headTop, r, fm, g);
    tube(bb, headLow, r * 1.3, accent === frame ? fm : am, g, r * 1.4);
    tube(headLow, headTop, r * 1.45, fm, g, r * 1.6);
    for (const z of [-0.035, 0.035]) {
      tube(bb, [rear[0], rear[1], z * U], r * 0.6, fm, g, r * 0.8);
      tube([seatTop[0], seatTop[1] - 0.03 * U, 0], [rear[0], rear[1], z * U], r * 0.5, fm, g, r * 0.6);
      curve([headLow, [0.5 * U, 0.25 * U, z * 0.7 * U], [front[0] - 0.01 * U, front[1] + 0.02 * U, z * U], [front[0], front[1], z * U]], r * 0.62, fm, g, false, 16);
    }
    // seatpost, saddle
    tube(seatTop, P(-0.22, 0.69), r * 0.75, blk, g);
    const saddle = sphere(1, plastic("#111318", 0.6), g, P(-0.22, 0.715), 20);
    saddle.scale.set(0.15 * U, 0.025 * U, 0.06 * U);
    // stem + drop bars + hoods
    tube(headTop, P(0.42, 0.61), r * 0.9, blk, g);
    tube(P(0.42, 0.61), P(0.52, 0.63), r * 0.8, blk, g);
    curve([P(0.52, 0.63, -0.21), P(0.52, 0.63, 0.21)], r * 0.6, blk, g, false, 6);
    for (const s of [-1, 1]) {
      curve([P(0.52, 0.63, 0.21 * s), P(0.6, 0.62, 0.215 * s), P(0.63, 0.54, 0.22 * s), P(0.58, 0.47, 0.225 * s), P(0.5, 0.48, 0.225 * s)], r * 0.6, blk, g, false, 24);
      rbox(0.07 * U, 0.04 * U, 0.03 * U, 0.01, blk, g, P(0.6, 0.64, 0.215 * s));
    }
    // drivetrain: chainring, cranks, pedals, cassette, chain, derailleur
    const ring = torus(0.1 * U, 0.006 * U, alu, g, P(0, 0, 0.05), 40);
    ring.rotation.z = 0.3;
    disc(0.095 * U, 0.004 * U, metal("#2A2E36", 0.4), g, P(0, 0, 0.05), 32);
    for (const [s, z] of [[1, 0.07], [-1, -0.07]] as const) {
      const arm = tube(P(0, 0, z), P(0.06 * s, -0.16 * s, z), r * 0.7, blk, g);
      arm.castShadow = true;
      rbox(0.09 * U, 0.015 * U, 0.06 * U, 0.008, blk, g, P(0.06 * s, -0.16 * s, z + 0.03 * Math.sign(z)));
    }
    for (let k = 0; k < 6; k++) disc((0.05 - k * 0.006) * U, 0.003 * U, alu, g, P(-0.42, 0.07, 0.03 + k * 0.006), 24);
    curve([P(0, 0.1, 0.05), P(-0.42, 0.12, 0.04), P(-0.47, 0.07, 0.04), P(-0.42, 0.02, 0.04), P(0, -0.1, 0.05), P(0.1, 0, 0.05)], 0.005 * U, metal("#6B7078", 0.5), g, true, 80);
    rbox(0.04 * U, 0.09 * U, 0.02 * U, 0.008, blk, g, P(-0.42, 0.0, 0.06));
    // wheels: tyre (tan wall on gravel), rim, spokes, hub, rotor
    for (const c of [rear, front]) {
      const w = group(g, c);
      const tyreR = road ? 0.335 : 0.345, tyreT = road ? 0.014 : 0.022;
      torus(tyreR * U, tyreT * U, plastic("#141518", 0.85), w, [0, 0, 0], 64);
      if (!road) torus((tyreR - 0.012) * U, tyreT * 0.75 * U, plastic("#BC9566", 0.85), w, [0, 0, 0], 64);
      const rim = torus((road ? 0.29 : 0.312) * U, (road ? 0.03 : 0.012) * U, road ? plastic("#16171B", 0.35) : alu, w, [0, 0, 0], 64);
      rim.scale.z = road ? 0.45 : 1;
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        const side = k % 2 ? 0.025 : -0.025;
        tube([0, 0, side * U], [Math.cos(a) * 0.3 * U, Math.sin(a) * 0.3 * U, 0], 0.0018 * U, metal("#C9CDD3", 0.3), w);
      }
      disc(0.025 * U, 0.1 * U, alu, w, [0, 0, 0], 20);
      disc(0.08 * U, 0.003 * U, metal("#A3A8B0", 0.25), w, [0, 0, -0.045 * U], 32);
      wheels.push(w);
    }
    // brand decal on both sides of the down tube
    const dt = new T.Vector3(...headLow).sub(new T.Vector3(...bb));
    const ang = Math.atan2(dt.y, dt.x);
    const tex = textTex(brand, accent === "#F4F4F2" ? "#2453A6" : "#FFFFFF", "italic 900 92px Archivo, Arial, sans-serif");
    for (const s of [1, -1]) decal(tex, 0.26 * U, 0.06 * U, g, [dt.x * 0.48, dt.y * 0.48, s * (r * 1.32)], [0, s > 0 ? 0 : Math.PI, s > 0 ? ang : -ang]);
    // wall hooks
    const hook = metal("#30343E", 0.4);
    rbox(0.08, 0.08, 0.5, 0.02, hook, room, [-5.12, BIKE_Y[id] + 0.68, BIKE_Z[id] - 0.18]);
    rbox(0.08, 0.08, 0.5, 0.02, hook, room, [-5.12, BIKE_Y[id] + 0.68, BIKE_Z[id] + 0.52]);
  }
  bike("triban", "#C8232C", "#C8232C", "TRIBAN", false);
  bike("scott", "#F4F4F2", "#2453A6", "SCOTT", false);
  bike("orbea", "#F26A1B", "#1A1B20", "ORBEA", true);

  // ─── back wall: Fuji frame, jersey shadow box, medals, hoop, shelf ─
  const glassMat = new T.MeshStandardMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.08, roughness: 0.05, metalness: 0.2 });
  disposables.push(glassMat);
  const fujiFrame = group(room, [-2.4, 3.45, -4.13], "fuji");
  rbox(1.8, 1.3, 0.08, 0.02, plastic("#15213B", 0.4), fujiFrame);
  box(1.58, 1.08, 0.02, "#FAF5EC", fujiFrame, [0, 0, 0.045]);
  const photoMat = new T.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 });
  disposables.push(photoMat);
  mesh(new T.PlaneGeometry(1.42, 0.8), photoMat, fujiFrame, [0, 0.02, 0.058], false);
  mesh(new T.PlaneGeometry(1.7, 1.2), glassMat, fujiFrame, [0, 0, 0.07], false);

  const jersey = group(room, [-0.75, 3.25, -4.13], "jersey");
  rbox(1.9, 2.25, 0.18, 0.03, plastic("#15213B", 0.4), jersey, [0, 0, 0]);
  box(1.72, 2.07, 0.02, plastic("#F3EBDD", 0.9), jersey, [0, 0, 0.08]);
  const jShape = new T.Shape();
  jShape.moveTo(-0.32, -0.46);
  jShape.lineTo(0.32, -0.46);
  jShape.lineTo(0.3, 0.16);
  jShape.quadraticCurveTo(0.17, 0.2, 0.16, 0.42);
  jShape.lineTo(0.085, 0.45);
  jShape.quadraticCurveTo(0, 0.3, -0.085, 0.45);
  jShape.lineTo(-0.16, 0.42);
  jShape.quadraticCurveTo(-0.17, 0.2, -0.3, 0.16);
  jShape.closePath();
  const jerseyTex = canvasTex(512, 720, (c) => {
    c.fillStyle = "#1D428A"; c.fillRect(0, 0, 512, 720);
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`; c.fillRect(Math.random() * 512, Math.random() * 720, 2, 2); }
    c.strokeStyle = "#FFC72C"; c.lineWidth = 18;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(512, 0); c.stroke();
    c.textAlign = "center"; c.fillStyle = "#FFC72C";
    c.font = "900 68px Archivo, Arial, sans-serif"; c.fillText("CURRY", 256, 300);
    c.lineWidth = 8; c.strokeStyle = "#FFFFFF";
    c.font = "900 260px Archivo, Arial, sans-serif"; c.strokeText("30", 256, 560); c.fillText("30", 256, 560);
  });
  jerseyTex.tex.repeat.set(1 / 0.64, 1 / 0.91);
  jerseyTex.tex.offset.set(0.5, 0.505);
  const jm = new T.MeshStandardMaterial({ map: jerseyTex.tex, roughness: 0.75 });
  disposables.push(jm);
  const jGeo = new T.ExtrudeGeometry(jShape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 16 });
  const jMesh = mesh(jGeo, jm, jersey, [0, -0.05, 0.1]);
  jMesh.scale.set(2.2, 2.0, 1);
  // gold trim on neck and arm holes
  const trim = plastic("#FFC72C", 0.5);
  curve([[-0.085 * 2.2, 0.4, 0.15], [0, 0.55 * 0.55, 0.15], [0.085 * 2.2, 0.4, 0.15]], 0.012, trim, jersey, false, 16);
  for (const s of [-1, 1]) curve([[s * 0.16 * 2.2, 0.79, 0.15], [s * 0.17 * 2.2, 0.36, 0.15], [s * 0.3 * 2.2, 0.27, 0.15]], 0.012, trim, jersey, false, 16);
  box(0.5, 0.05, 0.03, metal("#C9CDD2"), jersey, [0, 0.98, 0.12]);
  mesh(new T.PlaneGeometry(1.8, 2.15), glassMat, jersey, [0, 0, 0.1], false);

  const medals = group(room, [1.0, 4.55, -4.13], "medals");
  rbox(0.95, 0.06, 0.08, 0.02, metal("#30343E", 0.4), medals);
  const medalSwing: Obj[] = [];
  const medalFace = canvasTex(256, 256, (c) => {
    const g2 = c.createRadialGradient(110, 100, 10, 128, 128, 128);
    g2.addColorStop(0, "#F3D27A"); g2.addColorStop(1, "#B8862F");
    c.fillStyle = g2; c.beginPath(); c.arc(128, 128, 126, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(90,60,10,.6)"; c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 104, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "rgba(70,45,5,.85)"; c.textAlign = "center"; c.font = "900 40px Archivo, Arial"; c.fillText("HALF", 128, 118); c.font = "800 34px Archivo, Arial"; c.fillText("21.1 K", 128, 162);
  });
  const medalFaceMat = new T.MeshStandardMaterial({ map: medalFace.tex, metalness: 0.7, roughness: 0.35 });
  disposables.push(medalFaceMat);
  [["#E4572E", "#FFFFFF", -0.3, 0.5], ["#15213B", "#E4572E", 0.03, 0.44], ["#2BA7A0", "#15213B", 0.33, 0.52]].forEach(([c1, c2, x, len]) => {
    const m = group(medals, [x as number, 0, 0.06]);
    const ribTex = canvasTex(64, 256, (c) => { c.fillStyle = c1 as string; c.fillRect(0, 0, 64, 256); c.fillStyle = c2 as string; c.fillRect(26, 0, 12, 256); });
    const ribMat = new T.MeshStandardMaterial({ map: ribTex.tex, roughness: 0.8, side: T.DoubleSide });
    disposables.push(ribMat);
    for (const s of [-1, 1]) {
      const rib = mesh(new T.PlaneGeometry(0.07, len as number), ribMat, m, [s * 0.05, -(len as number) / 2, 0]);
      rib.rotation.z = s * 0.12;
    }
    const y = -(len as number) - 0.13;
    const prof = [new T.Vector2(0, -0.012), new T.Vector2(0.15, -0.012), new T.Vector2(0.165, 0), new T.Vector2(0.15, 0.012), new T.Vector2(0, 0.012)];
    const body = mesh(new T.LatheGeometry(prof, 40), metal("#C9A04A", 0.3), m, [0, y, 0]);
    body.rotation.x = Math.PI / 2;
    mesh(new T.CircleGeometry(0.148, 40), medalFaceMat, m, [0, y, 0.0135], false);
    torus(0.025, 0.006, metal("#C9A04A"), m, [0, y + 0.17, 0], 16);
    medalSwing.push(m);
  });

  // mini hoop with a real net
  const hoop = group(room, [-3.55, 4.6, -4.13]);
  rbox(1.25, 0.82, 0.05, 0.02, plastic("#FAFAFA", 0.3), hoop);
  const sq = plastic("#E4572E", 0.4);
  box(0.46, 0.03, 0.056, sq, hoop, [0, 0.02, 0]); box(0.46, 0.03, 0.056, sq, hoop, [0, -0.28, 0]);
  box(0.03, 0.33, 0.056, sq, hoop, [-0.215, -0.13, 0]); box(0.03, 0.33, 0.056, sq, hoop, [0.215, -0.13, 0]);
  box(1.25, 0.03, 0.056, sq, hoop, [0, 0.4, 0]); box(1.25, 0.03, 0.056, sq, hoop, [0, -0.4, 0]);
  const rim = torus(0.24, 0.018, metal("#E4572E", 0.45), hoop, [0, -0.36, 0.3], 40);
  rim.rotation.x = Math.PI / 2;
  rbox(0.12, 0.08, 0.3, 0.02, metal("#E4572E", 0.45), hoop, [0, -0.38, 0.13]);
  const netM = plastic("#FFFFFF", 0.9);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, b = ((k + 1.5) / 12) * Math.PI * 2;
    tube([Math.cos(a) * 0.24, -0.36, 0.3 + Math.sin(a) * 0.24], [Math.cos(b) * 0.15, -0.68, 0.3 + Math.sin(b) * 0.15], 0.004, netM, hoop);
    tube([Math.cos(a) * 0.24, -0.36, 0.3 + Math.sin(a) * 0.24], [Math.cos(a - 1.5 * Math.PI / 6) * 0.15, -0.68, 0.3 + Math.sin(a - 1.5 * Math.PI / 6) * 0.15], 0.004, netM, hoop);
  }
  const rimWorld = new T.Vector3(-3.55, 4.6 - 0.36, -4.13 + 0.3);

  // basketball with real seams
  const ballTex = canvasTex(1024, 512, (c) => {
    c.fillStyle = "#C9612A"; c.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 26000; i++) { c.fillStyle = `rgba(${Math.random() > 0.5 ? "0,0,0" : "255,190,140"},${Math.random() * 0.08})`; c.fillRect(Math.random() * 1024, Math.random() * 512, 2, 2); }
    c.strokeStyle = "#1E140E"; c.lineWidth = 7;
    c.beginPath(); c.moveTo(0, 256); c.lineTo(1024, 256); c.stroke();
    for (const x of [256, 768]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 512); c.stroke(); }
    for (const x0 of [0, 512]) {
      c.beginPath();
      for (let y = 0; y <= 512; y += 4) { const x = x0 + 128 + Math.sin((y / 512) * Math.PI) * 110 * (x0 ? -1 : 1) + (x0 ? 256 : 0); if (y === 0) c.moveTo(x, y); else c.lineTo(x, y); }
      c.stroke();
    }
  });
  const ballMat = new T.MeshStandardMaterial({ map: ballTex.tex, roughness: 0.75 });
  disposables.push(ballMat);
  const ballG = group(room, [0.1, 0.3, 1.0], "ball");
  const ball = mesh(new T.SphereGeometry(0.3, 40, 28), ballMat, ballG);
  const ballHome = ballG.position.clone();

  // shelf with 3D prints
  const prints = group(room, [2.6, 4.2, -4.0], "prints");
  rbox(2.7, 0.07, 0.5, 0.02, mat("#C9A57C", { map: plankTex.tex, roughness: 0.6 }), prints);
  for (const x of [-1.1, 1.1]) rbox(0.05, 0.28, 0.42, 0.01, metal("#30343E", 0.4), prints, [x, -0.16, -0.02]);
  const pla = (c: string) => mat(c, { roughness: 0.55 });
  // Benchy: hull + cabin + chimney
  const hull = new T.Shape();
  hull.moveTo(-0.24, 0); hull.lineTo(0.16, 0); hull.quadraticCurveTo(0.3, 0.02, 0.32, 0.14); hull.lineTo(-0.26, 0.14); hull.closePath();
  const benchy = group(prints, [-0.85, 0.04, 0]);
  const hullMesh = mesh(new T.ExtrudeGeometry(hull, { depth: 0.2, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), pla("#E4572E"), benchy, [0, 0, -0.1]);
  hullMesh.castShadow = true;
  rbox(0.2, 0.16, 0.16, 0.02, pla("#E4572E"), benchy, [-0.06, 0.24, 0]);
  rbox(0.24, 0.03, 0.2, 0.01, pla("#E4572E"), benchy, [-0.06, 0.33, 0]);
  cyl(0.03, 0.035, 0.12, pla("#E4572E"), benchy, [-0.12, 0.4, 0], 16);
  // twisted vase
  const vasePts: THREE_NS.Vector2[] = [];
  for (let i = 0; i <= 16; i++) vasePts.push(new T.Vector2(0.07 + Math.sin((i / 16) * Math.PI) * 0.09 + (i === 0 ? -0.02 : 0), i * 0.03));
  const vaseGeo = new T.LatheGeometry(vasePts, 9);
  const vp = vaseGeo.attributes.position;
  for (let i = 0; i < vp.count; i++) {
    const y = vp.getY(i), a = y * 4, x = vp.getX(i), z = vp.getZ(i);
    vp.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a));
  }
  vaseGeo.computeVertexNormals();
  mesh(vaseGeo, pla("#15213B"), prints, [-0.1, 0.035, 0]);
  // little planet with ring
  sphere(0.15, pla("#2BA7A0"), prints, [0.55, 0.22, 0], 28);
  const pr = torus(0.24, 0.012, pla("#D4A64A"), prints, [0.55, 0.22, 0], 48);
  pr.rotation.x = 1.25;
  // low-poly fox
  const fox = group(prints, [1.0, 0.04, 0]);
  mesh(new T.IcosahedronGeometry(0.1, 0), pla("#F26A1B"), fox, [0, 0.12, 0]).scale.set(1.3, 0.9, 0.8);
  mesh(new T.ConeGeometry(0.07, 0.14, 4), pla("#F26A1B"), fox, [0.15, 0.2, 0]).rotation.z = -1.2;
  for (const s of [-1, 1]) mesh(new T.ConeGeometry(0.025, 0.06, 4), pla("#F26A1B"), fox, [0.13, 0.28, s * 0.03]);
  mesh(new T.ConeGeometry(0.05, 0.2, 5), pla("#FAF5EC"), fox, [-0.18, 0.12, 0]).rotation.z = 1.9;

  // ─── desk setup (back wall, right) ─────────────────────────────
  const desk = group(room, [2.6, 0, -3.2]);
  const oak = mat("#E0C29C", { map: plankTex.tex, roughness: 0.5 });
  rbox(4.3, 0.09, 1.6, 0.03, oak, desk, [0, 1.5, 0]);
  const legM = metal("#1C2233", 0.45);
  for (const sx of [-1.9, 1.9]) {
    rbox(0.08, 1.45, 0.08, 0.02, legM, desk, [sx, 0.73, 0]);
    rbox(0.1, 0.05, 1.3, 0.02, legM, desk, [sx, 0.03, 0]);
  }
  rbox(3.7, 0.08, 0.06, 0.02, legM, desk, [0, 1.36, -0.55]);
  rbox(2.6, 0.01, 0.75, 0.01, plastic("#2A3042", 0.95), desk, [0.1, 1.55, 0.4]);
  // keyboard + mouse
  rbox(1.05, 0.045, 0.34, 0.02, plastic("#2A2E38", 0.4), desk, [0, 1.58, 0.38]);
  for (let rr = 0; rr < 5; rr++) for (let k = 0; k < 14; k++) rbox(0.06, 0.025, 0.055, 0.008, plastic(rr === 4 && k > 3 && k < 10 ? "#E3D6BF" : "#F1E8D8", 0.5), desk, [-0.46 + k * 0.071, 1.61, 0.26 + rr * 0.062]);
  const mouse = sphere(1, plastic("#2A2E38", 0.35), desk, [0.85, 1.58, 0.42], 20);
  mouse.scale.set(0.06, 0.035, 0.1);
  // monitors (BenQ PD2706U + second screen)
  const screenL = canvasTex(1024, 600, (c) => drawKdrama(c));
  const screenR = canvasTex(1024, 600, (c) => drawPlayer(c, 0));
  const monitors = group(desk, [-0.85, 0, -0.32], "monitors");
  const music = group(desk, [0.98, 0, -0.32], "music");
  const screenMats: THREE_NS.MeshBasicMaterial[] = [];
  function monitor(parent: THREE_NS.Group, tex: THREE_NS.Texture, rotY: number, label: string) {
    parent.rotation.y = rotY;
    rbox(1.66, 0.98, 0.05, 0.02, plastic("#1B1E25", 0.35), parent, [0, 2.45, 0]);
    rbox(1.2, 0.6, 0.12, 0.05, plastic("#2A2E38", 0.4), parent, [0, 2.42, -0.07]);
    const sm = new T.MeshBasicMaterial({ map: tex, toneMapped: false });
    screenMats.push(sm);
    disposables.push(sm);
    mesh(new T.PlaneGeometry(1.6, 0.9), sm, parent, [0, 2.47, 0.027], false);
    rbox(0.12, 0.6, 0.06, 0.02, metal("#5A5F68", 0.4), parent, [0, 1.85, -0.12]);
    rbox(0.55, 0.025, 0.32, 0.02, metal("#5A5F68", 0.4), parent, [0, 1.565, -0.05]);
    if (label) decal(textTex(label, "#9AA0A8", "700 40px Arial", 512, 64), 0.36, 0.045, parent, [0, 1.975, 0.027]);
  }
  monitor(monitors, screenL.tex, 0.1, "BenQ PD2706U");
  monitor(music, screenR.tex, -0.1, "");
  // PreSonus Eris 4.5
  const speakers = group(desk, [0, 0, -0.32], "speakers");
  const cones: Obj[] = [];
  for (const sx of [-1.92, 1.92]) {
    const sp = group(speakers, [sx, 1.545, 0]);
    sp.rotation.y = sx < 0 ? 0.28 : -0.28;
    rbox(0.42, 0.64, 0.44, 0.03, plastic("#24272F", 0.55), sp, [0, 0.32, 0]);
    rbox(0.4, 0.62, 0.02, 0.02, plastic("#30343E", 0.5), sp, [0, 0.32, 0.215]);
    const coneProf = [new T.Vector2(0.02, -0.02), new T.Vector2(0.06, 0.0), new T.Vector2(0.13, 0.03), new T.Vector2(0.14, 0.035)];
    const cone = mesh(new T.LatheGeometry(coneProf, 32), plastic("#1B1E25", 0.7), sp, [0, 0.23, 0.215]);
    cone.rotation.x = -Math.PI / 2;
    torus(0.14, 0.012, metal("#7A808A", 0.3), sp, [0, 0.23, 0.225], 40);
    sphere(0.035, metal("#C9CDD2", 0.2), sp, [0, 0.23, 0.215], 16);
    sphere(0.03, metal("#C9CDD2", 0.2), sp, [0, 0.49, 0.222], 16).scale.z = 0.5;
    const led = new T.MeshStandardMaterial({ color: "#1A1F2E", emissive: "#4B8CFF", emissiveIntensity: 1.5 });
    disposables.push(led);
    sphere(0.01, led, sp, [0.14, 0.07, 0.228], 8);
    cones.push(cone);
  }
  // Focusrite Scarlett 2i2
  const scarlett = group(desk, [-0.55, 1.545, 0.6], "scarlett");
  rbox(0.52, 0.12, 0.3, 0.025, metal("#C8232C", 0.35), scarlett, [0, 0.06, 0]);
  const halos: THREE_NS.MeshStandardMaterial[] = [];
  for (const kx of [-0.17, -0.03]) {
    disc(0.025, 0.02, plastic("#1B1E25"), scarlett, [kx, 0.07, 0.152], 20);
    const hm = new T.MeshStandardMaterial({ color: "#2A2E38", emissive: "#3BD16F", emissiveIntensity: 0.8 });
    halos.push(hm);
    disposables.push(hm);
    torus(0.042, 0.006, hm, scarlett, [kx, 0.07, 0.151], 24);
  }
  disc(0.04, 0.03, metal("#2A2E36", 0.3), scarlett, [0.12, 0.07, 0.152], 24);
  disc(0.012, 0.02, metal("#C9CDD2", 0.2), scarlett, [0.21, 0.04, 0.152], 12);
  decal(textTex("Focusrite", "#FFFFFF", "700 60px Arial", 512, 96), 0.16, 0.03, scarlett, [-0.1, 0.121, 0.03], [-Math.PI / 2, 0, 0]);
  // Stream Deck with icon keys
  const deck = group(desk, [0.58, 1.545, 0.62], "streamdeck");
  rbox(0.2, 0.04, 0.14, 0.015, plastic("#1B1E25"), deck, [0, 0.02, -0.03]);
  const deckBody = group(deck, [0, 0.08, 0]);
  deckBody.rotation.x = -0.55;
  rbox(0.48, 0.05, 0.3, 0.02, plastic("#16181D", 0.4), deckBody);
  const keyMats: THREE_NS.MeshStandardMaterial[] = [];
  const keyColors = ["#E4572E", "#2BA7A0", "#D4A64A", "#4B8CFF", "#C8232C", "#F26A1B", "#FAF5EC", "#3BD16F"];
  const glyphs = ["▶", "●", "♪", "✂", "⏸", "★", "◐", "⌂", "✉", "⚙", "◼", "♥", "↺", "☀", "⏭"];
  for (let rr = 0; rr < 3; rr++) for (let k = 0; k < 5; k++) {
    const idx = rr * 5 + k;
    const kt = canvasTex(64, 64, (c) => {
      c.fillStyle = "#0E1014"; c.fillRect(0, 0, 64, 64);
      c.fillStyle = keyColors[idx % keyColors.length]; c.font = "700 36px Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(glyphs[idx], 32, 34);
    });
    const km = new T.MeshStandardMaterial({ map: kt.tex, emissive: "#FFFFFF", emissiveMap: kt.tex, emissiveIntensity: 0.25, roughness: 0.3 });
    keyMats.push(km);
    disposables.push(km);
    rbox(0.075, 0.02, 0.075, 0.01, km, deckBody, [-0.18 + k * 0.09, 0.033, -0.09 + rr * 0.09]).castShadow = false;
  }
  // Shure MV7X on a spring boom arm
  const mic = group(desk, [-1.85, 1.545, -0.55], "mic");
  rbox(0.14, 0.18, 0.14, 0.02, metal("#1C1F26", 0.4), mic, [0, 0.09, 0]);
  const armM = metal("#17191E", 0.4);
  const A1: V3 = [0, 0.18, 0], A2: V3 = [0.25, 1.0, 0.35], A3: V3 = [0.62, 0.82, 1.0];
  for (const off of [-0.025, 0.025]) {
    tube([A1[0] + off, A1[1], A1[2]], [A2[0] + off, A2[1], A2[2]], 0.012, armM, mic);
    tube([A2[0] + off, A2[1], A2[2]], [A3[0] + off, A3[1], A3[2]], 0.011, armM, mic);
  }
  const helix: V3[] = [];
  for (let i = 0; i <= 60; i++) { const tt = i / 60, a = tt * Math.PI * 16; helix.push([0.08 + tt * 0.12 + Math.cos(a) * 0.015, 0.4 + tt * 0.35 + Math.sin(a) * 0.015, 0.1 + tt * 0.15]); }
  curve(helix, 0.004, metal("#8A9099", 0.3), mic, false, 240);
  sphere(0.03, armM, mic, A2, 12);
  const micBody = group(mic, [A3[0] + 0.02, A3[1] - 0.2, A3[2] + 0.05]);
  micBody.rotation.x = -0.35;
  rbox(0.15, 0.3, 0.12, 0.05, plastic("#16181D", 0.35), micBody);
  const grille = canvasTex(128, 128, (c) => { c.fillStyle = "#2B2E36"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#0E1014"; for (let y = 4; y < 128; y += 8) for (let x = 4 + ((y / 8) % 2) * 4; x < 128; x += 8) { c.beginPath(); c.arc(x, y, 2.4, 0, Math.PI * 2); c.fill(); } });
  const grilleMat = new T.MeshStandardMaterial({ map: grille.tex, metalness: 0.6, roughness: 0.4 });
  disposables.push(grilleMat);
  mesh(new T.PlaneGeometry(0.12, 0.16), grilleMat, micBody, [0, 0.05, 0.061], false);
  torus(0.11, 0.012, armM, micBody, [0, -0.04, 0], 24, Math.PI).rotation.y = Math.PI / 2;
  const onAirMat = new T.MeshStandardMaterial({ color: "#20242C", emissive: "#E4572E", emissiveIntensity: 0.2 });
  disposables.push(onAirMat);
  rbox(0.07, 0.012, 0.01, 0.004, onAirMat, micBody, [0, -0.06, 0.062]);
  // Raspberry Pi 5 in its cage
  const pi = group(desk, [1.72, 1.545, 0.32], "pi");
  rbox(0.46, 0.025, 0.32, 0.01, plastic("#2C7A47", 0.5), pi, [0, 0.07, 0]);
  rbox(0.1, 0.012, 0.1, 0.005, plastic("#111214", 0.4), pi, [0.02, 0.09, 0.02]);
  rbox(0.06, 0.01, 0.06, 0.004, plastic("#111214", 0.4), pi, [-0.1, 0.09, -0.05]);
  for (let k = 0; k < 2; k++) rbox(0.07, 0.07, 0.07, 0.008, metal("#C9CDD2", 0.25), pi, [0.19, 0.12, -0.1 + k * 0.09]);
  rbox(0.08, 0.075, 0.08, 0.008, metal("#C9CDD2", 0.25), pi, [0.19, 0.12, 0.1]);
  const fan = group(pi, [-0.04, 0.12, 0.03]);
  rbox(0.14, 0.03, 0.14, 0.01, metal("#2A2E36", 0.35), fan);
  const blades = group(fan, [0, 0.018, 0]);
  for (let k = 0; k < 7; k++) { const bl = rbox(0.055, 0.004, 0.018, 0.002, plastic("#16181D"), blades, [Math.cos((k / 7) * 6.28) * 0.03, 0, Math.sin((k / 7) * 6.28) * 0.03]); bl.rotation.y = -(k / 7) * 6.28; }
  const cageM = metal("#9AA0A8", 0.3);
  for (const cx of [-0.25, 0.25]) for (const cz of [-0.18, 0.18]) cyl(0.012, 0.012, 0.34, cageM, pi, [cx, 0.17, cz], 10);
  for (const cy of [0.005, 0.34]) {
    for (const cz of [-0.18, 0.18]) rbox(0.52, 0.018, 0.018, 0.006, cageM, pi, [0, cy, cz]);
    for (const cx of [-0.25, 0.25]) rbox(0.018, 0.018, 0.38, 0.006, cageM, pi, [cx, cy, 0]);
  }
  for (let k = -2; k <= 2; k++) rbox(0.008, 0.008, 0.36, 0.003, cageM, pi, [k * 0.08, 0.34, 0]);
  const ledMat = new T.MeshStandardMaterial({ color: "#20242C", emissive: "#3BD16F", emissiveIntensity: 1 });
  disposables.push(ledMat);
  sphere(0.01, ledMat, pi, [-0.2, 0.09, 0.14], 8);
  // desk lamp
  const lamp = group(desk, [-1.45, 1.545, 0.5], "lamp");
  cyl(0.15, 0.17, 0.04, metal("#15213B", 0.4), lamp, [0, 0.02, 0], 32);
  const L1: V3 = [0, 0.05, 0], L2: V3 = [0.1, 0.62, -0.18], L3: V3 = [0.46, 0.78, 0.04];
  for (const off of [-0.018, 0.018]) { tube([L1[0], L1[1], L1[2] + off], [L2[0], L2[1], L2[2] + off], 0.01, metal("#15213B", 0.4), lamp); tube([L2[0], L2[1], L2[2] + off], [L3[0], L3[1], L3[2] + off], 0.01, metal("#15213B", 0.4), lamp); }
  sphere(0.03, metal("#E4572E", 0.4), lamp, L2, 16);
  sphere(0.025, metal("#E4572E", 0.4), lamp, L3, 16);
  const shadeGeo = new T.CylinderGeometry(0.05, 0.17, 0.22, 32, 1, true);
  const shade = mesh(shadeGeo, mat("#E4572E", { side: T.DoubleSide, roughness: 0.4 }), lamp, [0.52, 0.66, 0.08]);
  shade.rotation.z = -0.55;
  const bulbMat = new T.MeshStandardMaterial({ color: "#FFF4D6", emissive: "#FFD58A", emissiveIntensity: 0 });
  disposables.push(bulbMat);
  sphere(0.05, bulbMat, lamp, [0.55, 0.6, 0.09], 12).castShadow = false;
  const lampLight = new T.SpotLight("#FFD08A", 0, 6, 0.9, 0.6, 1.6);
  lampLight.position.set(0.55, 0.6, 0.1);
  lampLight.target.position.set(0.9, -0.2, 0.2);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(512, 512);
  lamp.add(lampLight, lampLight.target);
  // ergonomic chair
  const chair = group(room, [2.5, 0, -1.55]);
  chair.rotation.y = 0.25;
  const fabric = plastic("#1E2A44", 0.85);
  rbox(0.78, 0.12, 0.72, 0.06, fabric, chair, [0, 0.98, 0]);
  rbox(0.72, 0.95, 0.09, 0.08, fabric, chair, [0, 1.6, 0.36]).rotation.x = -0.12;
  rbox(0.4, 0.18, 0.08, 0.05, fabric, chair, [0, 2.2, 0.43]).rotation.x = -0.12;
  for (const s of [-1, 1]) { tube([s * 0.36, 0.95, 0.15], [s * 0.38, 1.25, 0.1], 0.02, metal("#30343E"), chair); rbox(0.08, 0.04, 0.32, 0.02, plastic("#1B1E25"), chair, [s * 0.38, 1.27, 0.05]); }
  cyl(0.035, 0.045, 0.75, metal("#8A9099", 0.25), chair, [0, 0.55, 0], 16);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.3;
    tube([0, 0.16, 0], [Math.cos(a) * 0.42, 0.1, Math.sin(a) * 0.42], 0.03, plastic("#1B1E25"), chair);
    sphere(0.05, plastic("#16181D"), chair, [Math.cos(a) * 0.42, 0.05, Math.sin(a) * 0.42], 12);
  }
  // plant in the corner
  const plant = group(room, [4.4, 0, -3.6]);
  cyl(0.28, 0.22, 0.55, mat("#E3D6BF", { roughness: 0.8 }), plant, [0, 0.275, 0], 28);
  cyl(0.26, 0.26, 0.02, "#4A3A2A", plant, [0, 0.54, 0], 28);
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2, h = 0.9 + (k % 3) * 0.35;
    tube([0, 0.55, 0], [Math.cos(a) * 0.35, h, Math.sin(a) * 0.35], 0.012, "#3E6B3A", plant);
    const leaf = sphere(1, mat("#4E8A47", { roughness: 0.6, side: T.DoubleSide }), plant, [Math.cos(a) * 0.45, h + 0.05, Math.sin(a) * 0.45], 14);
    leaf.scale.set(0.2, 0.03, 0.12);
    leaf.rotation.set(0.3, -a, 0.4);
  }

  // ─── floor: tent, tripod + A6600, Instax on a crate ────────────
  const tent = group(room, [-3.1, 0, 1.9], "tent");
  tent.rotation.y = 0.5;
  tent.scale.setScalar(0.82);
  const fly = plastic("#E4572E", 0.75);
  const tentGeo = new T.SphereGeometry(1.15, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const tentMesh = mesh(tentGeo, fly, tent);
  tentMesh.scale.set(1.25, 0.82, 1);
  cyl(1.44, 1.44, 0.08, plastic("#30343E", 0.8), tent, [0, 0.04, 0], 40).scale.set(1, 1, 0.8);
  for (const a of [0.62, -0.62]) {
    const pole = torus(1.16, 0.016, metal("#15213B", 0.4), tent, [0, 0, 0], 48, Math.PI);
    pole.rotation.y = a + Math.PI / 2;
    pole.scale.set(1.25, 0.83, 1);
  }
  const doorShape = new T.Shape();
  doorShape.moveTo(-0.42, 0); doorShape.lineTo(0.42, 0); doorShape.quadraticCurveTo(0.4, 0.62, 0, 0.72); doorShape.quadraticCurveTo(-0.4, 0.62, -0.42, 0);
  const door = mesh(new T.ShapeGeometry(doorShape, 16), mat("#3A2414", { side: T.DoubleSide, roughness: 0.9 }), tent, [0, 0.04, 0.96], false);
  door.rotation.x = -0.35;
  curve([[-0.42, 0.04, 0.97], [-0.38, 0.45, 0.85], [0, 0.72, 0.72], [0.38, 0.45, 0.85], [0.42, 0.04, 0.97]], 0.008, plastic("#FAF5EC"), tent, false, 32);
  const lanternMat = new T.MeshStandardMaterial({ color: "#FFF4D6", emissive: "#FFC56A", emissiveIntensity: 0 });
  disposables.push(lanternMat);
  cyl(0.06, 0.06, 0.14, lanternMat, tent, [0.2, 0.12, 0.6], 16).castShadow = false;
  const lanternLight = new T.PointLight("#FFC56A", 0, 3.5, 2);
  lanternLight.position.set(0.2, 0.45, 0.6);
  tent.add(lanternLight);
  for (const a of [0.5, 1.7, 2.9, 4.2, 5.4]) {
    const px = Math.cos(a) * 1.9, pz = Math.sin(a) * 1.55;
    tube([Math.cos(a) * 1.2, 0.6, Math.sin(a) * 0.95], [px, 0.02, pz], 0.004, plastic("#FAF5EC"), tent);
    cyl(0.012, 0.004, 0.12, metal("#9AA0A8"), tent, [px, 0.05, pz], 6);
  }

  const camG = group(room, [2.9, 0, 2.6], "camera");
  camG.rotation.y = 0.64; // lens looks at the visitor
  const legBlack = metal("#1B1E25", 0.4);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4;
    const foot: V3 = [Math.cos(a) * 0.6, 0.02, Math.sin(a) * 0.6], top: V3 = [Math.cos(a) * 0.07, 1.16, Math.sin(a) * 0.07];
    const mid1: V3 = [foot[0] * 0.66 + top[0] * 0.34, foot[1] * 0.66 + top[1] * 0.34, foot[2] * 0.66 + top[2] * 0.34];
    const mid2: V3 = [foot[0] * 0.33 + top[0] * 0.67, foot[1] * 0.33 + top[1] * 0.67, foot[2] * 0.33 + top[2] * 0.67];
    tube(top, mid2, 0.028, legBlack, camG);
    tube(mid2, mid1, 0.022, legBlack, camG);
    tube(mid1, foot, 0.017, legBlack, camG);
    for (const m of [mid2, mid1]) cyl(0.034, 0.034, 0.05, metal("#E4572E", 0.4), camG, m, 16);
    sphere(0.025, plastic("#111"), camG, foot, 10);
  }
  cyl(0.11, 0.09, 0.08, metal("#2A2E36", 0.35), camG, [0, 1.18, 0], 28);
  cyl(0.025, 0.025, 0.24, metal("#2A2E36", 0.35), camG, [0, 1.3, 0], 16);
  sphere(0.06, metal("#2A2E36", 0.3), camG, [0, 1.45, 0], 20);
  rbox(0.12, 0.025, 0.1, 0.008, metal("#2A2E36", 0.3), camG, [0, 1.515, 0]);
  const body = group(camG, [0, 1.65, 0]);
  rbox(0.4, 0.24, 0.12, 0.03, plastic("#1A1C21", 0.45), body);
  rbox(0.13, 0.28, 0.17, 0.05, plastic("#121317", 0.7), body, [0.15, -0.01, 0.03]);
  rbox(0.11, 0.07, 0.1, 0.02, plastic("#1A1C21", 0.45), body, [-0.12, 0.14, -0.01]);
  disc(0.035, 0.03, metal("#2A2E36", 0.3), body, [0.1, 0.13, 0], 20).rotation.x = 0;
  const lens = group(body, [-0.03, -0.005, 0.06]);
  disc(0.075, 0.06, metal("#22252B", 0.35), lens, [0, 0, 0.03], 32);
  const zoomRing = canvasTex(256, 32, (c) => { c.fillStyle = "#15171B"; c.fillRect(0, 0, 256, 32); c.fillStyle = "#2B2E35"; for (let x = 0; x < 256; x += 6) c.fillRect(x, 0, 3, 32); });
  zoomRing.tex.wrapS = T.RepeatWrapping;
  zoomRing.tex.repeat.set(4, 1);
  const ringMat = new T.MeshStandardMaterial({ map: zoomRing.tex, roughness: 0.8 });
  disposables.push(ringMat);
  disc(0.08, 0.1, ringMat, lens, [0, 0, 0.11], 32);
  disc(0.077, 0.05, metal("#1E2026", 0.3), lens, [0, 0, 0.185], 32);
  const glass = new T.MeshStandardMaterial({ color: "#1A2B45", metalness: 1, roughness: 0.05 });
  disposables.push(glass);
  disc(0.06, 0.005, glass, lens, [0, 0, 0.212], 32);
  rbox(0.22, 0.14, 0.01, 0.01, plastic("#0D0E11", 0.2), body, [-0.03, 0.0, -0.065]);
  decal(textTex("SONY", "#E9E9EC", "700 80px Arial", 256, 96), 0.09, 0.03, body, [-0.04, 0.085, 0.0615]);
  const recMat = new T.MeshStandardMaterial({ color: "#20242C", emissive: "#E02020", emissiveIntensity: 0 });
  disposables.push(recMat);
  sphere(0.012, recMat, body, [0.12, 0.08, -0.065], 8);
  const flash = new T.PointLight("#FFFFFF", 0, 9, 2);
  flash.position.set(-0.03, 0, 0.6);
  body.add(flash);

  const crate = group(room, [-0.25, 0, 2.7]);
  const crateWood = mat("#B98A5A", { map: plankTex.tex, roughness: 0.75 });
  for (const y of [0.1, 0.32, 0.54]) for (const z of [-0.29, 0.29]) rbox(0.84, 0.16, 0.04, 0.01, crateWood, crate, [0, y, z]);
  for (const y of [0.1, 0.32, 0.54]) for (const x of [-0.4, 0.4]) rbox(0.04, 0.16, 0.6, 0.01, crateWood, crate, [x, y, 0]);
  rbox(0.84, 0.04, 0.62, 0.01, crateWood, crate, [0, 0.64, 0]);
  const instax = group(crate, [0, 0.66, 0], "instax");
  instax.rotation.y = 0.55;
  rbox(0.4, 0.44, 0.24, 0.07, plastic("#A9D6E5", 0.55), instax, [0, 0.22, 0]);
  disc(0.12, 0.08, plastic("#F4F4F2", 0.4), instax, [0, 0.2, 0.14], 32);
  disc(0.085, 0.02, plastic("#1B1E25", 0.4), instax, [0, 0.2, 0.18], 32);
  disc(0.05, 0.01, glass, instax, [0, 0.2, 0.192], 28);
  rbox(0.12, 0.07, 0.02, 0.01, plastic("#E8EEF2", 0.2), instax, [0.12, 0.35, 0.125]);
  rbox(0.06, 0.05, 0.02, 0.01, plastic("#1B1E25", 0.2), instax, [-0.12, 0.36, 0.125]);
  decal(textTex("instax", "#FFFFFF", "italic 700 80px Arial", 256, 96), 0.11, 0.035, instax, [-0.1, 0.05, 0.121]);
  const print = group(instax, [0, 0.44, -0.02]);
  rbox(0.22, 0.005, 0.3, 0.003, plastic("#FAF5EC", 0.6), print, [0, 0, 0]);
  const instaxPhotoMat = new T.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6 });
  disposables.push(instaxPhotoMat);
  const ph = mesh(new T.PlaneGeometry(0.18, 0.2), instaxPhotoMat, print, [0, 0.004, -0.03], false);
  ph.rotation.x = -Math.PI / 2;
  print.visible = false;

  if (opts.fujiUrl) {
    new T.TextureLoader().load(opts.fujiUrl, (tx) => {
      srgb(tx);
      photoMat.map = tx; photoMat.needsUpdate = true;
      instaxPhotoMat.map = tx; instaxPhotoMat.needsUpdate = true;
      disposables.push(tx);
    });
  }

  // ─── lights ────────────────────────────────────────────────────
  const hemi = new T.HemisphereLight("#FFF6E6", "#C9A57C", 1.2);
  scene.add(hemi);
  const sun = new T.DirectionalLight("#FFF1DA", 2.6);
  sun.position.set(7, 11, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const windowLight = new T.SpotLight("#DDEBFF", 6, 14, 0.75, 0.8, 1.2);
  windowLight.position.set(-6.5, 4.2, 2.6);
  windowLight.target.position.set(0, 0, 1.5);
  scene.add(windowLight, windowLight.target);

  // ─── screens ───────────────────────────────────────────────────
  function drawKdrama(c: CanvasRenderingContext2D) {
    const W = 1024, H = 600;
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#22325A"); g.addColorStop(1, "#0C1426");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = "#E4572E"; c.beginPath(); c.arc(760, 220, 110, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#0C1426";
    for (let i = 0; i < 14; i++) c.fillRect(30 + i * 72, 260 - (i % 4) * 40, 56, 140 + (i % 4) * 40);
    c.fillRect(0, 380, W, 220);
    c.fillStyle = "#FAF5EC"; c.font = "800 52px Archivo, Arial"; c.fillText("K-DRAMA NIGHT", 48, 470);
    c.font = "500 30px Arial"; c.fillStyle = "#C9CDD2"; c.fillText("Episode 7 · 46:12 / 68:00", 48, 520);
    c.fillStyle = "#30343E"; c.fillRect(48, 556, 928, 10); c.fillStyle = "#E4572E"; c.fillRect(48, 556, 630, 10);
  }
  function drawPlayer(c: CanvasRenderingContext2D, i: number) {
    const s = SONGS[i % SONGS.length];
    c.fillStyle = "#FAF5EC"; c.fillRect(0, 0, 1024, 600);
    c.fillStyle = "#15213B"; c.fillRect(48, 48, 300, 300);
    c.fillStyle = "#E4572E"; c.beginPath(); c.arc(198, 198, 92, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#15213B"; c.beginPath(); c.arc(198, 198, 20, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#15213B"; c.font = "800 64px 'PingFang SC','Noto Sans SC',Arial"; c.fillText(s.title, 392, 160);
    c.font = "600 36px 'PingFang SC','Noto Sans SC',Arial"; c.fillStyle = "#4A5266"; c.fillText(s.artist, 392, 224);
    c.font = "700 28px Arial"; c.fillStyle = "#E4572E"; c.fillText("NOW PLAYING · C-POP", 392, 300);
    for (let b = 0; b < 26; b++) { const h = 20 + ((b * 37 + i * 13) % 100); c.fillStyle = b % 2 ? "#15213B" : "#E4572E"; c.fillRect(48 + b * 36, 540 - h, 20, h); }
  }

  // ─── picking (with invisible hit boxes for thin objects) ───────
  const pickables: Obj[] = [];
  room.traverse((o) => { if (o.userData.hobby) pickables.push(o); });
  const hitMat = new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
  disposables.push(hitMat);
  scene.updateMatrixWorld(true);
  {
    const bbox = new T.Box3(), inv = new T.Matrix4(), size = new T.Vector3(), center = new T.Vector3(), mw = new T.Matrix4();
    for (const g of pickables) {
      if (["jersey", "fuji", "tent", "ball", "monitors", "music"].includes(g.userData.hobby)) continue;
      inv.copy(g.matrixWorld).invert();
      bbox.makeEmpty();
      g.traverse((o) => {
        const m = o as THREE_NS.Mesh;
        if (!m.isMesh || !m.geometry) return;
        m.geometry.computeBoundingBox();
        bbox.union(m.geometry.boundingBox!.clone().applyMatrix4(mw.multiplyMatrices(inv, m.matrixWorld)));
      });
      bbox.getSize(size);
      bbox.getCenter(center);
      const hit = new T.Mesh(new T.BoxGeometry(size.x + 0.04, size.y + 0.04, size.z + 0.04), hitMat);
      hit.position.copy(center);
      g.add(hit);
      disposables.push(hit.geometry);
    }
  }
  const ray = new T.Raycaster();
  const ndc = new T.Vector2();
  let hovered: Obj | null = null;
  const lift = new Map<Obj, number>();
  const hobbyOf = (o: Obj | null): Obj | null => { while (o) { if (o.userData.hobby) return o; o = o.parent; } return null; };
  function pick(clientX: number, clientY: number) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, true)[0];
    return { obj: hit ? hobbyOf(hit.object) : null, x: clientX - r.left, y: clientY - r.top };
  }

  // ─── orbit controls ────────────────────────────────────────────
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...HOME.look);
  controls.enableDamping = !reduced;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.8;
  controls.minDistance = 1.2;
  controls.maxDistance = 22;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = 1.53;
  controls.minAzimuthAngle = -0.12;
  controls.maxAzimuthAngle = 1.62;
  controls.enableZoom = false; // enabled once the visitor clicks into the room (keeps page scroll free)
  controls.touches = { ONE: -1, TWO: 3 /* TOUCH.DOLLY_ROTATE */ };
  renderer.domElement.style.touchAction = "pan-y";
  controls.update();

  let tween: { t: number; fromP: THREE_NS.Vector3; toP: THREE_NS.Vector3; fromT: THREE_NS.Vector3; toT: THREE_NS.Vector3 } | null = null;
  let moved = false;
  function flyTo(pos: V3, look: V3) {
    const toP = new T.Vector3(...pos), toT = new T.Vector3(...look);
    if (reduced) { camera.position.copy(toP); controls.target.copy(toT); controls.update(); return; }
    tween = { t: 0, fromP: camera.position.clone(), toP, fromT: controls.target.clone(), toT };
  }
  function homeView(): { pos: V3; look: V3 } {
    const w = host.clientWidth, h = host.clientHeight;
    const portrait = h > 0 && w / h < 0.95;
    if (!portrait) return HOME;
    const p = new T.Vector3(...HOME.pos).sub(new T.Vector3(...HOME.look)).multiplyScalar(0.8).add(new T.Vector3(...HOME.look));
    return { pos: [p.x, p.y, p.z], look: HOME.look };
  }
  function setMoved(m: boolean) { if (m !== moved) { moved = m; opts.onMoved?.(m); } }
  controls.addEventListener("start", () => { tween = null; setMoved(true); });
  // keep the orbit target inside the room
  controls.addEventListener("change", () => {
    const tg = controls.target;
    tg.set(Math.min(4.6, Math.max(-4.6, tg.x)), Math.min(5.2, Math.max(0.2, tg.y)), Math.min(3.8, Math.max(-3.8, tg.z)));
  });

  // pointer: hover, click-vs-drag, zoom activation
  let downAt: { x: number; y: number } | null = null;
  const onDown = (ev: PointerEvent) => { downAt = { x: ev.clientX, y: ev.clientY }; controls.enableZoom = true; };
  const onMove = (ev: PointerEvent) => {
    if (ev.pointerType !== "mouse" || ev.buttons) return;
    const { obj, x, y } = pick(ev.clientX, ev.clientY);
    if (obj !== hovered) { hovered = obj; renderer.domElement.style.cursor = obj ? "pointer" : "grab"; }
    opts.onHover?.((obj?.userData.hobby as HobbyId) ?? null, x, y);
  };
  const onLeave = () => { hovered = null; controls.enableZoom = false; opts.onHover?.(null, 0, 0); };
  const onUp = (ev: PointerEvent) => {
    if (!downAt) return;
    const d = Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y);
    downAt = null;
    if (d > 6 || ev.button !== 0) return;
    const { obj } = pick(ev.clientX, ev.clientY);
    const id = (obj?.userData.hobby as HobbyId) ?? null;
    if (!id) return;
    easter(id);
    focus(id);
    opts.onSelect?.(id);
  };
  renderer.domElement.style.cursor = "grab";
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerleave", onLeave);
  renderer.domElement.addEventListener("pointerup", onUp);

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
      case "triban": case "scott": case "orbea":
        bikeGroups[id].traverse((o) => { if (wheels.includes(o)) spinning.set(o, 14); });
        break;
      case "medals": medalSwing.forEach((m, i) => (m.userData.swing = 0.5 + i * 0.12)); break;
      case "lamp": lampOn = !lampOn; break;
      case "tent": lanternOn = !lanternOn; break;
      case "camera": flashT = 0; recT = 0; break;
      case "mic": onAirT = 0; break;
      case "instax": printT = 0; print.visible = true; break;
      case "streamdeck": for (let k = 0; k < 15; k++) keyFlash.set(k, Math.random() * 0.6); break;
      case "music": case "speakers":
        song = (song + 1) % SONGS.length;
        screenR.redraw((c) => drawPlayer(c, song));
        opts.onSong?.(song);
        break;
      default: break;
    }
  }

  function focus(id: HobbyId | null) {
    if (!id) { const hv = homeView(); flyTo(hv.pos, hv.look); setMoved(false); return; }
    const v = VIEWS[id];
    flyTo(v.pos, v.look);
    setMoved(true);
  }

  // ─── theme ─────────────────────────────────────────────────────
  function setDark(d: boolean) {
    dark = d;
    wallMat.color.set(d ? "#27324F" : "#F1E8D8");
    wall2Mat.color.set(d ? "#222C47" : "#EADFCB");
    floorMat.color.set(d ? "#6E5A48" : "#FFFFFF");
    skyMat.color.set(d ? "#1B2A4A" : "#CFE3F2");
    rugMat.color.set(d ? "#7C8399" : "#FFFFFF");
    hemi.intensity = d ? 0.35 : 1.2;
    hemi.color.set(d ? "#8A9CD8" : "#FFF6E6");
    sun.intensity = d ? 0.25 : 2.6;
    sun.color.set(d ? "#9FB4FF" : "#FFF1DA");
    windowLight.intensity = d ? 2.5 : 6;
    windowLight.color.set(d ? "#8FA8FF" : "#DDEBFF");
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = d ? 0.12 : 0.45;
    if (d) lampOn = true;
  }
  setDark(dark);

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.95 ? 40 : 32;
    camera.updateProjectionMatrix();
    if (!moved) { const hv = homeView(); camera.position.set(...hv.pos); controls.target.set(...hv.look); controls.update(); }
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // ─── loop ──────────────────────────────────────────────────────
  let raf = 0, visible = true, last = performance.now(), time = 0;
  const tmp = new T.Vector3();
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  function frame(now: number) {
    const raw = Math.max(0, (now - last) / 1000);
    const dt = Math.min(0.05, raw);
    last = Math.max(last, now);
    time += dt;

    if (tween) {
      tween.t = Math.min(1, tween.t + Math.min(0.2, raw) / 1.2);
      const e = ease(tween.t);
      camera.position.lerpVectors(tween.fromP, tween.toP, e);
      controls.target.lerpVectors(tween.fromT, tween.toT, e);
      if (tween.t >= 1) tween = null;
    }
    controls.update();

    for (const o of pickables) {
      const target = o === hovered ? 1 : 0;
      const cur = lift.get(o) ?? 0;
      const nv = cur + (target - cur) * Math.min(1, dt * 10);
      lift.set(o, nv);
      if (o.userData.baseY === undefined) o.userData.baseY = o.position.y;
      if (o !== ballG || !shot) o.position.y = (o.userData.baseY as number) + nv * 0.05;
    }
    spinning.forEach((v, w) => { w.rotation.z -= v * dt; const nv = v * Math.pow(0.35, dt); if (nv < 0.05) spinning.delete(w); else spinning.set(w, nv); });
    medalSwing.forEach((m, i) => {
      const sw = (m.userData.swing as number) || (hovered?.userData.hobby === "medals" ? 0.1 : 0);
      m.rotation.z = Math.sin(time * 3 + i) * sw;
      if (m.userData.swing) m.userData.swing = Math.max(0, (m.userData.swing as number) - dt * 0.25);
    });
    if (shot) {
      shot.t += dt / 1.1;
      const t = Math.min(1, shot.t);
      const to = rimWorld.clone().add(new T.Vector3(shot.miss ? 0.32 : 0, 0.06, shot.miss ? 0.1 : 0));
      if (t < 1) {
        tmp.lerpVectors(shot.from, to, t);
        tmp.y += Math.sin(t * Math.PI) * 2.0;
        ballG.position.copy(tmp);
        ball.rotation.x -= dt * 8;
      } else {
        const t2 = shot.t - 1;
        if (t2 < 0.9) {
          const f = Math.min(1, t2 / 0.9);
          ballG.position.set(to.x + (shot.miss ? f * 0.9 : 0), to.y - f * (to.y - 0.3) + Math.abs(Math.sin(f * Math.PI * 2)) * 0.6 * (1 - f), to.z + f * 1.4);
        } else {
          if (!shot.miss) made++;
          opts.onScore?.(made, shots);
          shot = null;
          ballG.userData.baseY = ballHome.y;
          ballG.position.copy(ballHome);
        }
      }
    }
    lampLight.intensity += ((lampOn ? 14 : 0) - lampLight.intensity) * Math.min(1, dt * 6);
    bulbMat.emissiveIntensity = lampOn ? 2 : 0;
    lanternLight.intensity += ((lanternOn ? 5 : 0) - lanternLight.intensity) * Math.min(1, dt * 6);
    lanternMat.emissiveIntensity = lanternOn ? 2 : 0;
    if (flashT >= 0) { flashT += dt; flash.intensity = flashT < 0.12 ? 30 : 0; if (flashT > 0.2) flashT = -1; }
    if (recT >= 0) { recT += dt; recMat.emissiveIntensity = Math.sin(recT * 8) > 0 ? 2 : 0.1; if (recT > 4) { recT = -1; recMat.emissiveIntensity = 0; } }
    if (onAirT >= 0) { onAirT += dt; onAirMat.emissiveIntensity = 2; if (onAirT > 3) { onAirT = -1; onAirMat.emissiveIntensity = 0.2; } }
    keyMats.forEach((m, i) => {
      const f = keyFlash.get(i);
      if (f !== undefined) { m.emissiveIntensity = f > 0 ? 0.25 : 1.6; const nf = f - dt; if (nf < -0.5) keyFlash.delete(i); else keyFlash.set(i, nf); }
      else m.emissiveIntensity = dark ? 0.6 : 0.25;
    });
    if (printT >= 0) { printT += dt; print.position.y = 0.44 + Math.min(1, printT / 1.2) * 0.22; if (printT > 6) { printT = -1; print.visible = false; print.position.y = 0.44; } }
    ledMat.emissiveIntensity = Math.sin(time * 6) > 0.3 ? 1.5 : 0.2;
    halos.forEach((h, i) => (h.emissiveIntensity = 0.5 + Math.abs(Math.sin(time * (3 + i))) * 1.0));
    if (!reduced) blades.rotation.y += dt * 12;
    const beat = reduced ? 0 : Math.max(0, Math.sin(time * 7.5)) * 0.02;
    cones.forEach((c) => (c.position.z = 0.215 + beat));
    screenMats.forEach((m) => m.color.setScalar(dark ? 1 : 0.92));

    renderer.render(scene, camera);
    const busy = !!tween || !!shot || flashT >= 0 || printT >= 0;
    if (visible && (!reduced || busy)) raf = requestAnimationFrame(frame);
  }
  const start = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); };
  const kick = () => start();
  controls.addEventListener("change", () => { if (reduced) kick(); });
  renderer.domElement.addEventListener("pointerup", kick);
  start();
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
  io.observe(host);

  return {
    setDark: (d) => { setDark(d); kick(); },
    focus: (id) => { focus(id); kick(); },
    reset: () => { focus(null); kick(); },
    dispose: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerup", kick);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
