// Procedural 3D living room with a little "me" who acts out whatever you click.
// No model or image files: everything is primitives plus tiny canvas textures, and static
// furniture is merged into a handful of draw calls, so the scene is cheap on phones.
// Loaded lazily by RoomCanvas.
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  LatheGeometry,
  Group,
  HemisphereLight,
  DirectionalLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Raycaster,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { BASE, POSES, createCharacter } from "./character";
import { createFootball, createGame, createShooter, createStream } from "./screens";
import { createAudio } from "./audio";

const BRAND = 0xf15a24;
// Long room like the real one: desk wall on the left, TV wall on the right, viewed from the open end.
const ROOM = { w: 5.2, d: 8, h: 2.4 };
const LX = -ROOM.w / 2;
const RX = ROOM.w / 2;
const BZ = -ROOM.d / 2;
const AISLE_X = 0.75; // open walkway the character uses

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(w, h, draw, { repeat = false } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

const radial = (rgba) =>
  canvasTexture(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, rgba);
    g.addColorStop(1, rgba.replace(/[\d.]+\)$/, "0)"));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });

const lerpAngle = (a, b, k) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
};
const angleOff = (a, b) => Math.abs(((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI);

export function createRoom(container, { onSelect, onHover, onAudio, onArrive, onReady, reducedMotion = false, isMobile = false } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  const renderer = new WebGLRenderer({ antialias: !isMobile || dpr < 2, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;outline:none";
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "Interactive 3D illustration of Matthew's living room: a desk with three screens, a sofa, a TV, a drink cart and a record player. Click or tap objects to see him use them.",
  );
  container.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(48, 1, 0.1, 80);
  const lookTarget = new Vector3(-0.1, 0.95, -1.0);
  const audio = createAudio();

  // ---- materials & builders ------------------------------------------------
  const matCache = new Map();
  const std = (color, rough = 0.85, metal = 0, extra = {}) => {
    const key = `${color}-${rough}-${metal}-${JSON.stringify(extra)}`;
    if (!matCache.has(key)) matCache.set(key, new MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }));
    return matCache.get(key);
  };
  const glow = (color) => new MeshBasicMaterial({ color, toneMapped: false });
  const screenMat = (tex) => new MeshBasicMaterial({ map: tex, toneMapped: false });
  const box = (parent, w, h, d, mat, x = 0, y = 0, z = 0) => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const rbox = (parent, w, h, d, r, mat, x = 0, y = 0, z = 0) => {
    const rad = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const m = new Mesh(new RoundedBoxGeometry(w, h, d, 2, rad), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const cyl = (parent, rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 16) => {
    const m = new Mesh(new CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const ball = (parent, r, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, seg = 14) => {
    const m = new Mesh(new SphereGeometry(r, seg, Math.max(8, seg - 4)), mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    return m;
  };
  const kit = { std, rbox, cyl, ball, box, brand: BRAND };
  // invisible, generous hit areas for tiny targets (raycasting ignores visibility)
  const hitMat = new MeshBasicMaterial();
  const hitArea = (parent, w, h, d, x = 0, y = 0, z = 0) => {
    const m = box(parent, w, h, d, hitMat, x, y, z);
    m.visible = false;
    return m;
  };

  const root = new Group();
  scene.add(root);

  const blobMat = new MeshBasicMaterial({
    map: radial("rgba(0,0,0,0.5)"),
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const blob = (x, z, w, d) => {
    const m = new Mesh(new PlaneGeometry(w, d), blobMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.02, z);
    m.renderOrder = 2;
    root.add(m);
  };
  const additive = (tex) => new MeshBasicMaterial({ map: tex, transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false });

  const pickables = [];
  const registry = new Map();
  const dynamic = new Set(); // groups that must never be merged into static batches
  const register = (name, group, meta) => {
    group.userData.baseY = group.position.y;
    registry.set(name, { group, meta: { name, ...meta } });
    dynamic.add(group);
    group.traverse((o) => {
      if (o.isMesh) {
        o.userData.owner = name;
        pickables.push(o);
      }
    });
  };

  // ---- shell -----------------------------------------------------------------
  const floorTex = canvasTexture(
    512,
    512,
    (ctx, w, h) => {
      const r = rng(7);
      ctx.fillStyle = "#8b8782";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) {
        const x = i * 64;
        const shade = 122 + Math.floor(r() * 24);
        ctx.fillStyle = `rgb(${shade},${shade - 2},${shade - 7})`;
        ctx.fillRect(x + 1, 0, 62, h);
        for (let g = 0; g < 22; g++) {
          ctx.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.04})`;
          ctx.fillRect(x + 3 + r() * 56, r() * h, 1, 40 + r() * 160);
        }
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(x, 0, 1.5, h);
      }
    },
    { repeat: true },
  );
  floorTex.repeat.set(ROOM.w / 0.55, ROOM.d / 3.2);
  floorTex.anisotropy = 4;

  // base slab sits clearly below the floor plane (coplanar faces z-fight and flicker)
  box(root, ROOM.w + 0.3, 0.14, ROOM.d + 0.3, std(0x1b1a19, 1), 0, -0.09, 0);
  const floor = new Mesh(new PlaneGeometry(ROOM.w, ROOM.d), std(0xffffff, 0.75, 0, { map: floorTex }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.002;
  root.add(floor);

  const wallMat = std(0xbab6ae, 1);
  const trimMat = std(0xe2dfd8, 0.9);
  box(root, ROOM.w + 0.3, ROOM.h, 0.14, wallMat, 0, ROOM.h / 2, BZ - 0.07);
  box(root, 0.14, ROOM.h, ROOM.d + 0.3, wallMat, LX - 0.07, ROOM.h / 2, 0);
  box(root, 0.14, ROOM.h, ROOM.d + 0.3, wallMat, RX + 0.07, ROOM.h / 2, 0);
  box(root, ROOM.w, 0.09, 0.02, trimMat, 0, 0.05, BZ + 0.011);
  box(root, 0.02, 0.09, ROOM.d, trimMat, LX + 0.011, 0.05, 0);
  box(root, 0.02, 0.09, ROOM.d, trimMat, RX - 0.011, 0.05, 0);

  // doorway on the right wall, between the TV and the drink cart
  const DOOR_Z = 1.35;
  const door = new Group();
  door.position.set(RX - 0.012, 1.05, DOOR_Z);
  door.rotation.y = -Math.PI / 2;
  door.add(new Mesh(new PlaneGeometry(0.95, 2.1), glow(0x07070a)));
  box(door, 0.06, 2.16, 0.03, trimMat, -0.5, 0, 0.012);
  box(door, 0.06, 2.16, 0.03, trimMat, 0.5, 0, 0.012);
  box(door, 1.06, 0.06, 0.03, trimMat, 0, 1.08, 0.012);
  root.add(door);

  // spiral ductwork along the left wall, then across the back wall
  const ductTex = canvasTexture(
    64,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#cfd3d8";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) {
        const g = ctx.createLinearGradient(0, y, 0, y + 16);
        g.addColorStop(0, "rgba(255,255,255,0.55)");
        g.addColorStop(0.5, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0.38)");
        ctx.fillStyle = g;
        ctx.fillRect(0, y, w, 16);
      }
    },
    { repeat: true },
  );
  const mkDuct = (len, repeatY) => {
    const t = ductTex.clone();
    t.needsUpdate = true;
    t.repeat.set(1, repeatY);
    return new Mesh(new CylinderGeometry(0.22, 0.22, len, 24, 1), std(0xffffff, 0.4, 0.55, { map: t }));
  };
  const ductY = 2.08;
  const ductX = LX + 0.32;
  const ductZ = BZ + 0.32;
  const leftLen = 7;
  const leftDuct = mkDuct(leftLen, leftLen * 3.2);
  leftDuct.rotation.x = Math.PI / 2;
  leftDuct.position.set(ductX, ductY, ductZ + leftLen / 2);
  root.add(leftDuct);
  const backLen = RX - ductX;
  const backDuct = mkDuct(backLen, backLen * 3.2);
  backDuct.rotation.z = Math.PI / 2;
  backDuct.position.set(ductX + backLen / 2, ductY, ductZ);
  root.add(backDuct);
  ball(root, 0.22, std(0xc4c9cf, 0.4, 0.55), ductX, ductY, ductZ, 1, 1, 1, 18);
  for (const z of [-2.2, 0.4, 2.4]) cyl(root, 0.012, 0.012, 0.2, std(0x222222, 0.6, 0.6), ductX, 2.3, z, 6);

  // curtains: an ivory sheer across the window, framed by sage linen drapes
  const sheerMat = std(0xf1ece2, 1, 0, { side: DoubleSide, transparent: true, opacity: 0.88 });
  const sageMat = std(0x8a9677, 1, 0, { side: DoubleSide });
  const curtain = (width, height, place, curtainMat = sageMat) => {
    const g = new PlaneGeometry(width, height, Math.round(width * 26), 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 15) * 0.05 + Math.sin(x * 37) * 0.012);
    }
    g.computeVertexNormals();
    const m = new Mesh(g, curtainMat);
    m.position.y = height / 2 + 0.06;
    place(m);
    root.add(m);
  };
  const rodMat = std(0x18181a, 0.4, 0.6);
  curtain(2.6, 1.98, (m) => m.position.set(0.3, m.position.y, BZ + 0.08), sheerMat);
  curtain(0.55, 1.98, (m) => m.position.set(0.3 - 1.2, m.position.y, BZ + 0.13));
  curtain(0.55, 1.98, (m) => m.position.set(0.3 + 1.2, m.position.y, BZ + 0.13));
  cyl(root, 0.012, 0.012, 2.9, rodMat, 0.3, 2.07, BZ + 0.09, 8).rotation.z = Math.PI / 2;
  curtain(1.0, 1.98, (m) => {
    m.position.set(LX + 0.09, m.position.y, 0.95);
    m.rotation.y = Math.PI / 2;
  });
  cyl(root, 0.012, 0.012, 1.2, rodMat, LX + 0.09, 2.07, 0.95, 8).rotation.x = Math.PI / 2;

  // sticky notes: the goals board
  const notes = new Group();
  notes.position.set(LX + 0.014, 1.55, 1.78);
  const noteColors = [0xf2e45a, 0xe9dd4f, 0xf5ea6a, 0xf7b267];
  const nr = rng(3);
  for (let i = 0; i < 8; i++) {
    const n = new Mesh(new PlaneGeometry(0.1, 0.1), std(noteColors[i % noteColors.length], 1, 0, { emissive: 0x3a3500, emissiveIntensity: 0.4 }));
    n.rotation.y = Math.PI / 2;
    n.rotation.x = (nr() - 0.5) * 0.15;
    n.position.set(0, (i % 2) * 0.12, (Math.floor(i / 2) - 1.5) * 0.12);
    notes.add(n);
  }
  hitArea(notes, 0.05, 0.4, 0.6, 0, 0.06, 0);
  root.add(notes);
  register("notes", notes, { label: "Working on my goals", station: "goals" });

  // ---- rug (larger) -------------------------------------------------------------
  const rugTex = canvasTexture(384, 512, (ctx, w, h) => {
    ctx.fillStyle = "#c8bca7";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#a39580";
    ctx.lineWidth = 6;
    for (let row = 0; row < 12; row++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 32) {
        const y = 22 + row * 40 + ((x / 32) % 2 === 0 ? 0 : 16);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);
  });
  const rug = new Mesh(new PlaneGeometry(3.5, 4.6), std(0xffffff, 1, 0, { map: rugTex }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(LX + 1.9, 0.008, -0.65);
  root.add(rug);

  // ---- sofa ------------------------------------------------------------------------
  const SOFA_Z = -0.3;
  const sofa = new Group();
  sofa.position.set(LX + 0.5, 0, SOFA_Z);
  sofa.rotation.y = Math.PI / 2;
  const cream = std(0xe3d9c6, 1);
  const rust = std(0xb4571e, 1);
  rbox(sofa, 1.95, 0.26, 0.86, 0.06, cream, 0, 0.32, 0);
  rbox(sofa, 1.95, 0.5, 0.17, 0.06, cream, 0, 0.62, -0.38).rotation.x = -0.1;
  rbox(sofa, 0.16, 0.3, 0.86, 0.05, cream, -0.9, 0.5, 0);
  rbox(sofa, 0.16, 0.3, 0.86, 0.05, cream, 0.9, 0.5, 0);
  for (const [x, z] of [[-0.85, 0.34], [0.85, 0.34], [-0.85, -0.34], [0.85, -0.34]]) cyl(sofa, 0.022, 0.034, 0.2, std(0xc79a60, 0.7), x, 0.1, z, 8);
  rbox(sofa, 0.42, 0.42, 0.14, 0.05, rust, -0.62, 0.66, -0.2).rotation.set(-0.35, 0.25, 0.1);
  rbox(sofa, 0.42, 0.42, 0.14, 0.05, rust, 0.66, 0.66, -0.2).rotation.set(-0.35, -0.3, -0.08);
  blob(LX + 0.5, SOFA_Z, 1.3, 2.4);
  root.add(sofa);
  register("sofa", sofa, { label: "Say hello", href: "/#contact", station: "sofa" });

  // ---- rust lounge chair, clear of the sofa ------------------------------------------
  const TOGO = { x: LX + 1.35, z: -2.3, rot: 0.85 };
  const togo = new Group();
  togo.position.set(TOGO.x, 0, TOGO.z);
  togo.rotation.y = TOGO.rot;
  const boucle = std(0xb85a1f, 1);
  rbox(togo, 0.98, 0.3, 0.9, 0.13, boucle, 0, 0.17, 0);
  rbox(togo, 0.98, 0.5, 0.32, 0.13, boucle, 0, 0.42, -0.34).rotation.x = -0.3;
  rbox(togo, 0.3, 0.32, 0.8, 0.12, boucle, -0.46, 0.3, 0.02);
  blob(TOGO.x, TOGO.z, 1.3, 1.2);
  root.add(togo);
  register("chair", togo, { label: "About me", href: "/#about", station: "lounge" });

  // ---- coffee table ------------------------------------------------------------------
  const TABLE = { x: LX + 1.75, z: SOFA_Z };
  const table = new Group();
  table.position.set(TABLE.x, 0, TABLE.z);
  table.rotation.y = Math.PI / 2;
  const tableWood = std(0x4a3426, 0.7);
  cyl(table, 0.58, 0.58, 0.04, tableWood, 0, 0.46, 0, 32).scale.z = 0.75;
  cyl(table, 0.5, 0.5, 0.03, tableWood, 0, 0.16, 0, 32).scale.z = 0.75;
  for (const [x, z] of [[-0.45, -0.22], [0.45, -0.22], [-0.45, 0.22], [0.45, 0.22]]) cyl(table, 0.012, 0.012, 0.46, std(0x141414, 0.5, 0.4), x, 0.23, z, 6);
  rbox(table, 0.4, 0.07, 0.3, 0.03, std(0x1a1a1c, 1), 0.05, 0.2, 0.02);
  const candle = cyl(table, 0.04, 0.04, 0.07, std(0xe9a24a, 0.5, 0, { emissive: 0xff8a2a, emissiveIntensity: 0.7 }), -0.1, 0.51, 0, 12);
  box(table, 0.14, 0.012, 0.045, std(0x111111, 0.4), 0.18, 0.488, 0.05);
  blob(TABLE.x, TABLE.z, 1.1, 1.5);
  root.add(table);
  register("table", table, { label: "Coffee break", station: "coffee" });

  // ---- accent: travertine drum side table --------------------------------------------
  const accent = new Group();
  accent.position.set(LX + 0.35, 0, 0.98);
  cyl(accent, 0.24, 0.24, 0.5, std(0xd8cdb8, 0.55), 0, 0.25, 0, 28);
  cyl(accent, 0.255, 0.255, 0.025, std(0xc9bda5, 0.5), 0, 0.51, 0, 28);
  ball(accent, 0.1, std(0x151515, 0.25, 0.1), -0.03, 0.68, 0, 1, 1.35, 1, 16);
  cyl(accent, 0.03, 0.045, 0.1, std(0x151515, 0.25, 0.1), -0.03, 0.82, 0, 12);
  for (const [dx, dy, rz] of [[0, 1.02, 0.15], [0.07, 0.98, -0.45], [-0.08, 0.96, 0.6]]) cyl(accent, 0.006, 0.006, 0.34, std(0x8a6a3a, 0.9), dx - 0.03, dy, 0, 5).rotation.z = rz;
  blob(LX + 0.35, 0.98, 0.7, 0.7);
  root.add(accent);
  register("accent", accent, { label: "Accent piece", station: "accent" });

  // ---- tripod floor lamp (walnut legs, oatmeal drum shade) -----------------------------
  const lamp = new Group();
  lamp.position.set(LX + 0.45, 0, -3.15);
  const walnutLeg = std(0x5a3b26, 0.5);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const legPivot = new Group();
    legPivot.position.set(0, 1.3, 0);
    legPivot.rotation.set(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2);
    cyl(legPivot, 0.016, 0.012, 1.34, walnutLeg, 0, -0.67, 0, 8);
    lamp.add(legPivot);
  }
  cyl(lamp, 0.025, 0.025, 0.12, std(0xb08a4a, 0.3, 0.8), 0, 1.34, 0, 10);
  const shadeMat = new MeshStandardMaterial({ color: 0xeadfca, roughness: 1, emissive: 0xffc27a, emissiveIntensity: 1.1, side: DoubleSide });
  const shade = new Mesh(new CylinderGeometry(0.24, 0.27, 0.32, 28, 1, true), shadeMat);
  shade.position.y = 1.52;
  lamp.add(shade);
  blob(LX + 0.45, -3.15, 0.8, 0.8);
  root.add(lamp);
  register("lamp", lamp, { label: "Lights", station: "lamp" });

  // ---- plant ------------------------------------------------------------------------------
  const plant = new Group();
  plant.position.set(LX + 1.4, 0, -3.62);
  cyl(plant, 0.17, 0.12, 0.3, std(0x2a2a2c, 0.8), 0, 0.15, 0, 14);
  const leaves = [];
  const pr = rng(11);
  const leafA = std(0x2f7a43, 0.7);
  const leafB = std(0x276a39, 0.7);
  const leafy = (parent, n, scale, y0, out) => {
    const list = [];
    for (let i = 0; i < n; i++) {
      const pivot = new Group();
      pivot.position.set(0, y0, 0);
      pivot.rotation.y = (i / n) * Math.PI * 2 + pr();
      ball(pivot, 1, i % 3 === 0 ? leafA : leafB, out * scale, 0.42 * scale, 0, 0.11 * scale, 0.42 * scale, 0.02, 8).rotation.z = -0.45 - pr() * 0.3;
      pivot.userData.phase = pr() * 6;
      parent.add(pivot);
      list.push(pivot);
    }
    return list;
  };
  leaves.push(...leafy(plant, 9, 1, 0.3, 0.1));
  blob(LX + 1.4, -3.62, 0.7, 0.7);
  root.add(plant);
  register("plant", plant, { label: "Monstera", station: "plant" });

  // ---- desk: laptop on a stand, monitor, vertical monitor ---------------------------------
  const DESK_Z = 2.4;
  const desk = new Group();
  desk.position.set(LX + 0.4, 0, DESK_Z);
  rbox(desk, 0.78, 0.045, 1.95, 0.015, std(0x2a2523, 0.6), 0, 0.74, 0);
  for (const z of [-0.8, 0.8]) {
    box(desk, 0.06, 0.7, 0.06, std(0x111111, 0.5, 0.5), 0.12, 0.38, z);
    box(desk, 0.65, 0.04, 0.07, std(0x111111, 0.5, 0.5), 0, 0.02, z);
  }
  box(desk, 0.5, 0.012, 0.8, std(0x15171b, 1), 0.1, 0.766, 0.05);
  // mechanical keyboard: case plus individual keycaps, merged into a few meshes so it stays cheap
  const keyboard = new Group();
  rbox(keyboard, 0.16, 0.022, 0.44, 0.008, std(0x1d1d21, 0.5, 0.2), 0.22, 0.778, 0.05);
  const capDark = std(0x2c2d32, 0.55);
  const capLight = std(0xd8d4cc, 0.6);
  const capAccent = std(BRAND, 0.5);
  for (let row = 0; row < 5; row++) {
    const x = 0.165 + row * 0.027;
    if (row === 4) {
      box(keyboard, 0.021, 0.014, 0.16, capLight, x, 0.795, 0.05); // space bar
      for (const z of [-0.14, -0.1, 0.2, 0.24]) box(keyboard, 0.021, 0.014, 0.021, capDark, x, 0.795, z);
      continue;
    }
    for (let col = 0; col < 15; col++) {
      const z = -0.14 + col * 0.0265;
      const accent = (row === 0 && col === 0) || (row === 2 && col === 14);
      const mat = accent ? capAccent : col === 0 || col === 14 ? capLight : capDark;
      box(keyboard, 0.021, 0.014, 0.021, mat, x, 0.795, z);
    }
  }
  {
    const byMat = new Map();
    keyboard.children.slice().forEach((m) => {
      m.updateMatrix();
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(m.matrix);
      for (const n of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(n)) g.deleteAttribute(n);
      g.clearGroups();
      if (!byMat.has(m.material)) byMat.set(m.material, []);
      byMat.get(m.material).push(g);
      keyboard.remove(m);
      m.geometry.dispose();
    });
    byMat.forEach((geos, mat) => keyboard.add(new Mesh(mergeGeometries(geos, false), mat)));
  }
  desk.add(keyboard);

  const codeTex = (w, h, seed, tall) =>
    canvasTexture(
      w,
      h,
      (ctx) => {
        const r = rng(seed);
        ctx.fillStyle = "#0e1420";
        ctx.fillRect(0, 0, w, h);
        const colors = ["#79c0ff", "#ffa657", "#c9d1d9", "#7ee787", "#ff7b72", "#d2a8ff"];
        for (let y = 10; y < h - 6; y += 13) {
          let x = 14 + Math.floor(r() * 4) * 12;
          const n = 1 + Math.floor(r() * 3);
          for (let i = 0; i < n; i++) {
            const len = 14 + Math.floor(r() * (tall ? 60 : 110));
            ctx.fillStyle = colors[Math.floor(r() * colors.length)];
            ctx.globalAlpha = 0.85;
            ctx.fillRect(x, y, len, 5);
            x += len + 8;
          }
        }
        ctx.globalAlpha = 1;
      },
      { repeat: true },
    );

  const sceneTex = canvasTexture(512, 288, (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0, "#1b2a40");
    sky.addColorStop(1, "#c98a52");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w * 0.62, h);
    ctx.fillStyle = "#6b3f2a";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    for (let x = 0; x <= w * 0.62; x += 16) ctx.lineTo(x, h * 0.66 + Math.sin(x * 0.05) * 9);
    ctx.lineTo(w * 0.62, h);
    ctx.lineTo(0, h);
    ctx.fill();
    ctx.fillStyle = "#101419";
    ctx.fillRect(w * 0.62, 0, w * 0.38, h);
    const r = rng(9);
    for (let y = 14; y < h - 10; y += 14) {
      ctx.fillStyle = r() > 0.8 ? "#F15A24" : "#8b95a1";
      ctx.fillRect(w * 0.64, y, 20 + r() * 110, 5);
    }
  });
  const laptopCode = codeTex(320, 200, 5, false);

  const monitor = (w, h, tex, z, bottom) => {
    const g = new Group();
    g.position.set(0.1, bottom + h / 2, z);
    g.rotation.y = Math.PI / 2;
    rbox(g, w, h, 0.03, 0.008, std(0x0c0c0e, 0.4), 0, 0, 0);
    const screen = new Mesh(new PlaneGeometry(w - 0.02, h - 0.02), screenMat(tex));
    screen.position.z = 0.0165;
    g.add(screen);
    box(g, 0.05, h * 0.5, 0.03, std(0x111111, 0.4, 0.6), 0, -h / 2 - 0.02, -0.04);
    desk.add(g);
    return { g, screen };
  };
  const mon = monitor(0.64, 0.38, sceneTex, 0.05, 0.99);
  const vtex = codeTex(256, 880, 21, true);
  vtex.repeat.set(1, 0.5);
  const vert = monitor(0.34, 0.6, vtex, -0.65, 0.84);
  vert.g.rotation.y = Math.PI / 2 - 0.12;

  // laptop on an angled stand
  const laptop = new Group();
  laptop.position.set(0.12, 0.765, 0.78);
  laptop.rotation.y = Math.PI / 2;
  const standMat = std(0xb9bcc2, 0.35, 0.8);
  box(laptop, 0.26, 0.012, 0.22, standMat, 0, 0.005, 0);
  box(laptop, 0.02, 0.2, 0.02, standMat, -0.11, 0.09, -0.08).rotation.x = 0.2;
  box(laptop, 0.02, 0.2, 0.02, standMat, 0.11, 0.09, -0.08).rotation.x = 0.2;
  const tray = new Group();
  tray.position.set(0, 0.1, 0);
  tray.rotation.x = 0.32;
  box(tray, 0.26, 0.012, 0.24, standMat, 0, 0, 0);
  box(tray, 0.32, 0.012, 0.22, std(0xb9bcc2, 0.4, 0.7), 0, 0.012, 0);
  const lid = new Group();
  lid.position.set(0, 0.018, -0.11);
  lid.rotation.x = -0.55;
  box(lid, 0.32, 0.21, 0.01, std(0xb9bcc2, 0.4, 0.7), 0, 0.105, 0);
  const lscreen = new Mesh(new PlaneGeometry(0.3, 0.19), screenMat(laptopCode));
  lscreen.position.set(0, 0.105, 0.006);
  lid.add(lscreen);
  tray.add(lid);
  laptop.add(tray);
  desk.add(laptop);

  box(desk, 0.05, 0.03, 0.55, glow(0xffe2b0), 0.04, 1.42, 0.05); // monitor bar light
  const ringGroup = new Group(); // ring light (streaming)
  ringGroup.position.set(0.08, 1.52, -0.65);
  const ringMat = new MeshBasicMaterial({ color: 0xbdbdbd, toneMapped: false });
  const ring = new Mesh(new TorusGeometry(0.07, 0.014, 8, 24), ringMat);
  ring.rotation.y = Math.PI / 2;
  ringGroup.add(ring);
  cyl(ringGroup, 0.006, 0.006, 0.12, std(0x111111, 0.4, 0.6), 0, -0.1, 0, 6);
  hitArea(ringGroup, 0.25, 0.3, 0.25);
  desk.add(ringGroup);
  blob(LX + 0.4, DESK_Z, 1.1, 2.2);
  root.add(desk);
  register("monitor", mon.g, { label: "Selected work", href: "/#work", station: "code" });
  register("vertical", vert.g, { label: "Skills", href: "/#skills", station: "code" });
  register("laptop", laptop, { label: "Coding", station: "code" });
  register("keyboard", keyboard, { label: "Coding", station: "code" });
  register("ring", ringGroup, { label: "Going live", station: "stream" });

  // a PS5: two curved white panels around a gloss-black core
  const ps5 = (parent, x, y, z, rotY = 0) => {
    const g = new Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    const white = std(0xf4f4f6, 0.45);
    const blackGloss = std(0x121214, 0.25);
    rbox(g, 0.035, 0.39, 0.26, 0.03, white, -0.05, 0, 0).rotation.z = 0.04;
    rbox(g, 0.035, 0.39, 0.26, 0.03, white, 0.05, 0, 0).rotation.z = -0.04;
    rbox(g, 0.07, 0.36, 0.25, 0.012, blackGloss, 0, -0.005, 0);
    box(g, 0.004, 0.3, 0.004, glow(0x5aa9ff), 0, 0, 0.127);
    cyl(g, 0.07, 0.07, 0.012, blackGloss, 0, -0.2, 0, 16);
    parent.add(g);
    return g;
  };

  // filing cabinet (resume) with the PS5 on top (gaming at the desk)
  const cabinet = new Group();
  cabinet.position.set(LX + 0.35, 0, 3.75);
  rbox(cabinet, 0.5, 0.64, 0.5, 0.02, std(0x4e3223, 0.65), 0, 0.32, 0);
  for (const y of [0.45, 0.2]) {
    box(cabinet, 0.01, 0.2, 0.44, std(0x1c1411, 0.7), 0.255, y, 0);
    box(cabinet, 0.02, 0.02, 0.14, std(0x111111, 0.4, 0.6), 0.265, y + 0.06, 0);
  }
  root.add(cabinet);
  blob(LX + 0.35, 3.75, 0.8, 0.8);
  register("cabinet", cabinet, {
    label: "Resume",
    href: "https://drive.google.com/file/d/1PzRW7u4C7Iq51PgM5KTSWs_EIQxsjS54/view",
    external: true,
    openOnClick: true, // the drawer opens the resume directly
    station: "cabinet",
  });
  const deskPs5 = new Group();
  root.add(deskPs5);
  ps5(deskPs5, LX + 0.35, 0.86, 3.75, Math.PI / 2);
  register("ps5desk", deskPs5, { label: "Gaming", station: "deskGame" });

  // office chair
  const CHAIR = { x: LX + 1.25, z: DESK_Z };
  const office = new Group();
  office.position.set(CHAIR.x, 0, CHAIR.z);
  office.rotation.y = -Math.PI / 2;
  const black = std(0x131315, 0.6);
  rbox(office, 0.52, 0.08, 0.5, 0.03, black, 0, 0.5, 0);
  rbox(office, 0.5, 0.66, 0.07, 0.03, black, 0, 0.88, -0.24).rotation.x = -0.1;
  rbox(office, 0.24, 0.14, 0.06, 0.03, black, 0, 1.3, -0.27);
  cyl(office, 0.025, 0.025, 0.36, std(0x222224, 0.4, 0.5), 0, 0.28, 0, 8);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    box(office, 0.3, 0.03, 0.045, black, Math.cos(a) * 0.15, 0.1, Math.sin(a) * 0.15).rotation.y = -a;
    cyl(office, 0.03, 0.03, 0.04, black, Math.cos(a) * 0.3, 0.04, Math.sin(a) * 0.3, 8);
  }
  box(office, 0.07, 0.03, 0.34, black, -0.27, 0.68, 0.02);
  box(office, 0.07, 0.03, 0.34, black, 0.27, 0.68, 0.02);
  blob(CHAIR.x, CHAIR.z, 0.9, 0.9);
  root.add(office);

  // ---- larger TV console with PS5, soundbar and diffuser (right wall) ----------------------
  const CONSOLE_Z = -1.0;
  const consoleBody = new Group();
  consoleBody.position.set(RX - 0.25, 0, CONSOLE_Z);
  consoleBody.rotation.y = -Math.PI / 2; // local +x runs toward the doorway (+z)
  const wood = std(0x6a4125, 0.55);
  const flutedTex = canvasTexture(
    256,
    64,
    (ctx, w, h) => {
      for (let x = 0; x < w; x += 8) {
        const g = ctx.createLinearGradient(x, 0, x + 8, 0);
        g.addColorStop(0, "#5e391f");
        g.addColorStop(0.5, "#8a5734");
        g.addColorStop(1, "#4a2c17");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 8, h);
      }
    },
    { repeat: true },
  );
  flutedTex.repeat.set(4, 1);
  rbox(consoleBody, 2.4, 0.48, 0.46, 0.02, wood, 0, 0.4, 0);
  box(consoleBody, 2.3, 0.42, 0.01, std(0xffffff, 0.55, 0, { map: flutedTex }), 0, 0.4, 0.232); // fluted doors
  rbox(consoleBody, 2.46, 0.04, 0.5, 0.015, std(0x3b2516, 0.45), 0, 0.66, 0);
  for (const x of [-1.1, 1.1]) for (const z of [-0.16, 0.16]) cyl(consoleBody, 0.014, 0.026, 0.2, std(0xb08a4a, 0.3, 0.8), x, 0.1, z, 8).rotation.z = x > 0 ? 0.12 : -0.12;
  box(consoleBody, 2.2, 0.012, 0.32, glow(BRAND), 0, 0.152, 0); // LED underglow
  const underglow = new Mesh(new PlaneGeometry(2.9, 1.2), additive(radial("rgba(241,90,36,0.6)")));
  underglow.rotation.x = -Math.PI / 2;
  underglow.position.set(0, 0.03, 0.1);
  underglow.renderOrder = 3;
  consoleBody.add(underglow);
  const books = new Group();
  books.position.set(-0.55, 0.68, 0);
  [0xd8d2c4, 0x1f2a30, BRAND].forEach((c, i) => box(books, 0.22 - i * 0.02, 0.035, 0.15, std(c, 0.8), 0, 0.02 + i * 0.037, 0));
  consoleBody.add(books);
  blob(RX - 0.4, CONSOLE_Z, 1.0, 2.8);
  root.add(consoleBody);

  // TV faces straight into the room (no slant)
  const tvGroup = new Group();
  tvGroup.position.set(RX - 0.25, 0, CONSOLE_Z);
  tvGroup.rotation.y = -Math.PI / 2;
  const tvInner = new Group();
  tvInner.position.set(0, 1.16, -0.02);
  rbox(tvInner, 1.5, 0.85, 0.04, 0.01, std(0x0a0a0b, 0.3), 0, 0, 0);
  const tvAmbient = canvasTexture(
    1024,
    288,
    (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "#F15A24");
      g.addColorStop(0.25, "#3a1f5c");
      g.addColorStop(0.5, "#0f6a7a");
      g.addColorStop(0.75, "#3a1f5c");
      g.addColorStop(1, "#F15A24");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, w, h);
    },
    { repeat: true },
  );
  tvAmbient.repeat.set(0.5, 1);
  const tvScreen = new Mesh(new PlaneGeometry(1.47, 0.82), screenMat(tvAmbient));
  tvScreen.position.z = 0.022;
  tvInner.add(tvScreen);
  box(tvInner, 0.22, 0.05, 0.14, std(0x0a0a0b, 0.4), 0, -0.45, -0.03);
  tvGroup.add(tvInner);
  root.add(tvGroup);
  register("tv", tvGroup, { label: "Watching football", station: "football" });

  // soundbar: plays an afrobeats groove
  const soundbar = new Group();
  soundbar.position.set(RX - 0.38, 0.715, CONSOLE_Z);
  soundbar.rotation.y = -Math.PI / 2;
  rbox(soundbar, 1.0, 0.065, 0.1, 0.02, std(0x111113, 0.5), 0, 0, 0);
  box(soundbar, 0.94, 0.04, 0.004, std(0x1d1d21, 0.9), 0, 0, 0.051); // grille
  const barLedMat = new MeshBasicMaterial({ color: 0x333338, toneMapped: false });
  box(soundbar, 0.12, 0.006, 0.006, barLedMat, 0, -0.022, 0.054);
  root.add(soundbar);
  register("soundbar", soundbar, { label: "Afrobeats", station: "afro" });

  const tvPs5 = new Group();
  root.add(tvPs5);
  ps5(tvPs5, RX - 0.27, 0.88, CONSOLE_Z + 1.0, -Math.PI / 2);
  register("ps5tv", tvPs5, { label: "Game night", station: "sofaGame" });

  const diffuser = new Group();
  diffuser.position.set(RX - 0.27, 0.68, CONSOLE_Z - 1.0);
  cyl(diffuser, 0.025, 0.075, 0.18, std(0xf0ede6, 0.6), 0, 0.09, 0, 18);
  const diffuserGlow = new MeshBasicMaterial({ color: 0xffb37a, toneMapped: false });
  cyl(diffuser, 0.078, 0.078, 0.012, diffuserGlow, 0, 0.006, 0, 18);
  root.add(diffuser);
  register("diffuser", diffuser, { label: "Fresh air", station: "diffuser" });

  // mist from the diffuser
  const MIST = 26;
  const mistGeo = new BufferGeometry();
  const mistPos = new Float32Array(MIST * 3);
  const mistLife = new Float32Array(MIST).map(() => Math.random());
  mistGeo.setAttribute("position", new BufferAttribute(mistPos, 3));
  const mistMat = new PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0, depthWrite: false, map: radial("rgba(255,255,255,0.9)") });
  const mist = new Points(mistGeo, mistMat);
  mist.position.copy(diffuser.position).add(new Vector3(0, 0.2, 0));
  mist.frustumCulled = false;
  root.add(mist);

  const ambi = new Mesh(new PlaneGeometry(2.8, 1.8), additive(radial("rgba(241,150,90,0.4)")));
  ambi.rotation.y = -Math.PI / 2;
  ambi.position.set(RX - 0.03, 1.15, CONSOLE_Z);
  root.add(ambi);

  // ---- globe floor lamp near the doorway -------------------------------------------------
  const lamp2 = new Group();
  lamp2.position.set(RX - 0.32, 0, CONSOLE_Z + 1.55);
  cyl(lamp2, 0.13, 0.13, 0.02, std(0x18181a, 0.4, 0.6), 0, 0.01, 0, 18);
  cyl(lamp2, 0.01, 0.01, 1.3, std(0x18181a, 0.4, 0.6), 0, 0.66, 0, 8);
  const globeMat = new MeshStandardMaterial({ color: 0xf6efe3, roughness: 0.4, emissive: 0xffd7a3, emissiveIntensity: 0.15 });
  ball(lamp2, 0.17, globeMat, 0, 1.42, 0, 1, 1, 1, 20);
  root.add(lamp2);
  blob(RX - 0.32, CONSOLE_Z + 1.55, 0.5, 0.5);
  register("lamp2", lamp2, { label: "Lamp", station: "lamp2" });

  // ---- shelf with plants, a little lamp and the record player ------------------------------
  const SHELF_Z = DOOR_Z + 1.1;
  const shelf = new Group();
  shelf.position.set(RX - 0.21, 0, SHELF_Z);
  shelf.rotation.y = -Math.PI / 2;
  const shelfFrame = std(0x18181a, 0.45, 0.5);
  const shelfWood = std(0x7a5232, 0.6);
  for (const x of [-0.45, 0.45]) for (const z of [-0.16, 0.16]) box(shelf, 0.025, 1.62, 0.025, shelfFrame, x, 0.81, z);
  [0.06, 0.48, 0.92, 1.36].forEach((y) => box(shelf, 0.94, 0.025, 0.36, shelfWood, 0, y, 0));
  for (let i = 0; i < 10; i++) box(shelf, 0.012, 0.3, 0.3, std([0x111111, BRAND, 0x2d3a4a, 0xd8d2c4][i % 4], 0.8), -0.35 + i * 0.03, 0.22, 0);
  [0xd8d2c4, 0x1f2a30, 0x8a6a3a, 0x2f4a3a].forEach((c, i) => box(shelf, 0.04, 0.24 - i * 0.02, 0.2, std(c, 0.8), -0.38 + i * 0.045, 0.6 - i * 0.01, 0));
  const pot2 = new Group();
  pot2.position.set(0.28, 0.49, 0);
  cyl(pot2, 0.07, 0.055, 0.11, std(0xe9e3d6, 0.6), 0, 0.055, 0, 12);
  leaves.push(...leafy(pot2, 6, 0.42, 0.1, 0.08));
  shelf.add(pot2);
  const miniLampMat = new MeshStandardMaterial({ color: 0xf3e3c8, roughness: 0.6, emissive: 0xffc27a, emissiveIntensity: 0.9 });
  cyl(shelf, 0.02, 0.03, 0.14, std(0xd9cdb6, 0.5), 0.3, 1.44, 0, 10);
  const miniShade = new Mesh(new SphereGeometry(0.09, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), miniLampMat);
  miniShade.position.set(0.3, 1.5, 0);
  shelf.add(miniShade);
  const pot3 = new Group();
  pot3.position.set(-0.25, 1.37, 0);
  cyl(pot3, 0.08, 0.06, 0.12, std(0x2a2a2c, 0.8), 0, 0.06, 0, 12);
  for (let i = 0; i < 7; i++) ball(pot3, 0.03, i % 2 ? leafA : leafB, -0.08 + i * 0.025, 0.06 - i * 0.05, 0.1 + (i % 2) * 0.02, 1, 1, 0.5, 6);
  shelf.add(pot3);
  root.add(shelf);
  blob(RX - 0.21, SHELF_Z, 0.5, 1.1);
  register("shelf", shelf, { label: "Writing", href: "/blog", station: "shelf" });

  // record player on the third shelf
  const record = new Group();
  record.position.set(RX - 0.21, 0.94, SHELF_Z);
  record.rotation.y = -Math.PI / 2;
  rbox(record, 0.42, 0.1, 0.33, 0.012, std(0x5a3b26, 0.5), 0, 0.05, 0);
  const platter = new Group();
  platter.position.set(-0.04, 0.105, 0);
  cyl(platter, 0.14, 0.14, 0.012, std(0x0d0d0f, 0.25), 0, 0, 0, 28);
  cyl(platter, 0.045, 0.045, 0.014, std(BRAND, 0.6), 0, 0.001, 0, 16);
  box(platter, 0.1, 0.002, 0.012, std(0x1c1c20, 0.4), 0.07, 0.008, 0);
  record.add(platter);
  box(record, 0.012, 0.012, 0.22, std(0xc9c9cc, 0.3, 0.8), 0.15, 0.13, 0.02).rotation.y = 0.35;
  root.add(record);
  register("record", record, { label: "Play a record", station: "music" });

  // ---- drink cart and photos above it -------------------------------------------------------
  const CART_Z = SHELF_Z + 1.0;
  const cart = new Group();
  cart.position.set(RX - 0.26, 0, CART_Z);
  cart.rotation.y = -Math.PI / 2;
  const iron = std(0x161618, 0.4, 0.6);
  for (const x of [-0.37, 0.37]) for (const z of [-0.19, 0.19]) box(cart, 0.022, 0.86, 0.022, iron, x, 0.47, z);
  [0.16, 0.5, 0.84].forEach((y) => {
    box(cart, 0.76, 0.015, 0.4, std(0x232326, 0.3, 0.3), 0, y, 0);
    box(cart, 0.76, 0.03, 0.012, iron, 0, y + 0.03, 0.2);
  });
  box(cart, 0.022, 0.022, 0.42, iron, 0.42, 0.88, 0); // handle
  for (const x of [-0.37, 0.37]) for (const z of [-0.19, 0.19]) cyl(cart, 0.025, 0.025, 0.02, iron, x, 0.025, z, 10).rotation.x = Math.PI / 2;
  // realistic bottles: lathe-turned glass profiles, wrap labels, caps and corks
  const glassMat = (color) => std(color, 0.08, 0.15);
  const labelTex = (bg, ink, accent) =>
    canvasTexture(128, 48, (ctx, w, h) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, w, 5);
      ctx.fillRect(0, h - 5, w, 5);
      ctx.fillStyle = ink;
      ctx.fillRect(w * 0.2, 14, w * 0.6, 8);
      ctx.fillRect(w * 0.3, 27, w * 0.4, 4);
      ctx.fillRect(w * 0.35, 35, w * 0.3, 3);
    });
  const profiles = {
    wine: [[0, 0], [0.036, 0], [0.037, 0.01], [0.037, 0.19], [0.033, 0.22], [0.019, 0.25], [0.014, 0.27], [0.014, 0.33], [0.016, 0.335], [0.016, 0.35], [0, 0.35]],
    gin: [[0, 0], [0.042, 0], [0.043, 0.01], [0.043, 0.17], [0.038, 0.195], [0.018, 0.215], [0.016, 0.25], [0, 0.25]],
    tequila: [[0, 0], [0.05, 0], [0.055, 0.03], [0.055, 0.09], [0.045, 0.12], [0.018, 0.14], [0.016, 0.17], [0, 0.17]],
  };
  const latheBottle = (parent, kind, color, label, cap, x, y, z) => {
    const g = new Group();
    g.position.set(x, y, z);
    const pts = profiles[kind].map(([r, h]) => new Vector2(r, h));
    g.add(new Mesh(new LatheGeometry(pts, 18), glassMat(color)));
    const top = pts[pts.length - 2];
    const bodyR = pts[2].x;
    const bodyH = pts[3].y;
    const lbl = new Mesh(new CylinderGeometry(bodyR + 0.002, bodyR + 0.002, bodyH * 0.45, 18, 1, true), std(0xffffff, 0.8, 0, { map: label }));
    lbl.position.y = bodyH * 0.48;
    g.add(lbl);
    cyl(g, top.x + 0.003, top.x + 0.003, kind === "tequila" ? 0.05 : 0.03, cap, 0, top.y + 0.012, 0, 12);
    parent.add(g);
    return g;
  };
  const gold = std(0xc9a24a, 0.3, 0.9);
  const cork = std(0x9a6a3c, 0.8);
  const blackCap = std(0x111111, 0.4);
  const steelCap = std(0xd7dade, 0.2, 0.9);
  // top tier: whiskey (square), gin, tequila, plus a shaker and coupes
  const whiskey = new Group();
  whiskey.position.set(0.24, 0.86, -0.06);
  rbox(whiskey, 0.085, 0.19, 0.06, 0.012, glassMat(0x8a4512), 0, 0.095, 0);
  const wl = new Mesh(new PlaneGeometry(0.06, 0.07), std(0xffffff, 0.8, 0, { map: labelTex("#efe6d2", "#1b1b1b", "#b0262a") }));
  wl.position.set(0, 0.09, 0.0305);
  whiskey.add(wl);
  cyl(whiskey, 0.014, 0.016, 0.05, glassMat(0x8a4512), 0, 0.215, 0, 10);
  cyl(whiskey, 0.018, 0.018, 0.03, blackCap, 0, 0.25, 0, 10);
  cart.add(whiskey);
  latheBottle(cart, "gin", 0x9cc8bd, labelTex("#16324a", "#e8d9a8", "#c9a24a"), steelCap, 0.13, 0.86, 0.09);
  latheBottle(cart, "tequila", 0xe9dfc8, labelTex("#f4efe4", "#2a5a3a", "#c9a24a"), cork, 0.33, 0.86, 0.1);
  latheBottle(cart, "wine", 0x1f3a24, labelTex("#efe9dc", "#4a1520", "#c9a24a"), gold, 0.04, 0.86, -0.08);
  const cartShaker = new Group(); // hidden while it's in my hands
  cyl(cartShaker, 0.033, 0.026, 0.13, steelCap, -0.12, 0.92, 0.06, 14);
  cyl(cartShaker, 0.026, 0.03, 0.04, steelCap, -0.12, 1.005, 0.06, 14);
  cart.add(cartShaker);
  // the glass I pour into, at the front edge of the cart
  const pourGlass = new Group();
  pourGlass.position.set(-0.02, 0.86, 0.15);
  cyl(pourGlass, 0.032, 0.028, 0.1, std(0xffffff, 0.05, 0, { transparent: true, opacity: 0.35 }), 0, 0.05, 0, 14);
  const liquidGeo = new CylinderGeometry(0.027, 0.024, 0.08, 14);
  liquidGeo.translate(0, 0.04, 0); // scale from the bottom so it fills upward
  const pourLiquid = new Mesh(liquidGeo, std(0xc9661f, 0.25));
  pourLiquid.position.y = 0.006;
  pourGlass.add(pourLiquid);
  const pourStream = new Mesh(new CylinderGeometry(0.005, 0.005, 0.22, 6), new MeshBasicMaterial({ color: 0xd97a2b, toneMapped: false }));
  pourStream.position.y = 0.21;
  pourGlass.add(pourStream);
  cart.add(pourGlass);
  const resetPour = () => {
    pourGlass.visible = true;
    pourLiquid.visible = false;
    pourLiquid.scale.y = 0.01;
    pourStream.visible = false;
    cartShaker.visible = true;
  };
  resetPour();
  for (let i = 0; i < 3; i++) {
    const coupe = new Group();
    coupe.position.set(-0.3 + i * 0.07, 0.86, -0.06);
    cyl(coupe, 0.004, 0.012, 0.08, std(0xffffff, 0.05, 0, { transparent: true, opacity: 0.45 }), 0, 0.04, 0, 8);
    const bowl = new Mesh(new SphereGeometry(0.035, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std(0xffffff, 0.05, 0, { transparent: true, opacity: 0.45, side: DoubleSide }));
    bowl.position.y = 0.115;
    bowl.rotation.x = Math.PI;
    coupe.add(bowl);
    cart.add(coupe);
  }
  // middle tier: a wine rack of bottles lying down
  for (let i = 0; i < 4; i++) {
    const b = latheBottle(cart, "wine", i % 2 ? 0x3b1520 : 0x22301f, labelTex("#efe9dc", "#3b1520", "#c9a24a"), gold, -0.27 + i * 0.12, 0.56, -0.17);
    b.rotation.x = Math.PI / 2;
  }
  // bottom tier: ice bucket and a stack of napkins
  cyl(cart, 0.07, 0.06, 0.12, steelCap, 0.18, 0.23, 0, 18);
  box(cart, 0.12, 0.03, 0.12, std(0xe9e2d4, 0.9), -0.18, 0.19, 0);
  root.add(cart);
  blob(RX - 0.26, CART_Z, 0.6, 1.0);
  register("cart", cart, { label: "Drink cart", station: "drinks" });

  const photos = new Group();
  const photo = (w, h, draw, y, z) => {
    const g = new Group();
    g.position.set(RX - 0.02, y, z);
    g.rotation.y = -Math.PI / 2;
    box(g, w + 0.05, h + 0.05, 0.03, std(0x111113, 0.5), 0, 0, 0);
    box(g, w + 0.01, h + 0.01, 0.002, std(0xf2efe8, 0.9), 0, 0, 0.016);
    const img = new Mesh(new PlaneGeometry(w - 0.08, h - 0.08), screenMat(canvasTexture(256, Math.round((256 * h) / w), draw)));
    img.position.z = 0.019;
    g.add(img);
    photos.add(g);
  };
  // the cool one above the cart: a sunset over the water
  photo(
    0.95,
    0.64,
    (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      sky.addColorStop(0, "#2a1f4a");
      sky.addColorStop(0.6, "#e0603a");
      sky.addColorStop(1, "#ffb36b");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.6);
      ctx.fillStyle = "#ffd29a";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.6, h * 0.16, Math.PI, 0);
      ctx.fill();
      const sea = ctx.createLinearGradient(0, h * 0.6, 0, h);
      sea.addColorStop(0, "#9b4a3a");
      sea.addColorStop(1, "#1d1830");
      ctx.fillStyle = sea;
      ctx.fillRect(0, h * 0.6, w, h * 0.4);
      ctx.fillStyle = "rgba(255,210,154,0.6)";
      for (let i = 0; i < 7; i++) ctx.fillRect(w * 0.5 - 30 + i * 3, h * 0.64 + i * 6, 60 - i * 6, 2);
      ctx.fillStyle = "#14101f";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.62);
      ctx.lineTo(w * 0.18, h * 0.5);
      ctx.lineTo(w * 0.3, h * 0.62);
      ctx.fill();
    },
    1.55,
    CART_Z,
  );
  // a smaller print above the shelf
  photo(
    0.4,
    0.5,
    (ctx, w, h) => {
      ctx.fillStyle = "#d9d6cf";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.42, w * 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#F15A24";
      ctx.fillRect(w * 0.2, h * 0.78, w * 0.6, 6);
    },
    1.95,
    SHELF_Z,
  );
  root.add(photos);
  register("photos", photos, { label: "Somewhere warm" });

  // ---- arched mirror, far right ---------------------------------------------------------------
  const mirror = new Group();
  mirror.position.set(RX - 0.1, 0.95, -3.15);
  mirror.rotation.y = -Math.PI / 2;
  rbox(mirror, 0.72, 1.7, 0.05, 0.02, std(0xb08a4a, 0.3, 0.8), 0, 0, 0);
  const mc = new Mesh(new CylinderGeometry(0.36, 0.36, 0.05, 24, 1), std(0xb08a4a, 0.3, 0.8));
  mc.rotation.x = Math.PI / 2;
  mc.position.y = 0.85;
  mirror.add(mc);
  const mirrorFace = new Mesh(
    new PlaneGeometry(0.62, 1.6),
    screenMat(
      canvasTexture(64, 256, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#5b6670");
        g.addColorStop(0.5, "#9aa5ad");
        g.addColorStop(1, "#47525b");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }),
    ),
  );
  mirrorFace.position.z = 0.028;
  mirror.add(mirrorFace);
  root.add(mirror);
  register("mirror", mirror, { label: "Mirror, mirror", station: "mirror" });

  // ---- robot vacuum ---------------------------------------------------------------------------
  const vacuum = new Group();
  cyl(vacuum, 0.17, 0.17, 0.08, std(0x1b1b1d, 0.35, 0.2), 0, 0.045, 0, 24);
  cyl(vacuum, 0.05, 0.05, 0.03, std(0x2a2a2e, 0.3, 0.3), 0, 0.1, -0.04, 14);
  const vacLedMat = new MeshBasicMaterial({ color: 0x46d39a, toneMapped: false });
  box(vacuum, 0.06, 0.006, 0.01, vacLedMat, 0, 0.087, 0.12);
  const brush = new Group();
  brush.position.set(0.12, 0.012, 0.1);
  for (let i = 0; i < 3; i++) box(brush, 0.09, 0.004, 0.008, std(0x777777, 0.8), 0, 0, 0).rotation.y = (i / 3) * Math.PI;
  vacuum.add(brush);
  root.add(vacuum);
  register("vacuum", vacuum, { label: "Cleaning up" });
  const VAC_PATH = [[1.6, 3.5], [0.2, 3.6], [0.1, 1.7], [1.0, 0.7], [0.3, -1.4], [0.4, -3.4], [1.6, -3.5], [1.5, -1.5], [1.6, 1.5]];
  const vac = { i: 0, x: VAC_PATH[0][0], z: VAC_PATH[0][1], rot: 0 };
  vacuum.position.set(vac.x, 0, vac.z);

  // ---- lighting -----------------------------------------------------------------------------
  const hemi = new HemisphereLight(0xdfe6ff, 0x4a3b30, 0.8);
  scene.add(hemi);
  const key = new DirectionalLight(0xfff0dc, 0.8);
  key.position.set(1.5, 5, 7);
  scene.add(key);
  const ceiling = new PointLight(0xffe6c8, 5, 12, 1.4);
  ceiling.position.set(0.1, 2.25, 0.4);
  scene.add(ceiling);
  const lampLight = new PointLight(0xffb36b, 6, 6.5, 2);
  lampLight.position.set(LX + 0.6, 1.5, -3.0);
  scene.add(lampLight);
  const lamp2Light = new PointLight(0xffcf96, 0, 4.5, 2);
  lamp2Light.position.set(RX - 0.6, 1.4, CONSOLE_Z + 1.55);
  scene.add(lamp2Light);
  const deskLight = new PointLight(0xffe0b0, 3.4, 4.5, 2);
  deskLight.position.set(LX + 0.8, 1.5, DESK_Z);
  scene.add(deskLight);
  const tvLight = new PointLight(BRAND, 3.4, 4.2, 2);
  tvLight.position.set(RX - 0.6, 0.35, CONSOLE_Z);
  scene.add(tvLight);
  const candleLight = new PointLight(0xff9a3a, 0.9, 1.6, 2);
  candleLight.position.set(TABLE.x, 0.7, TABLE.z);
  scene.add(candleLight);

  // ---- the little "me" ------------------------------------------------------------------------
  const me = createCharacter(kit);
  root.add(me.person);
  dynamic.add(me.person);
  dynamic.add(mist);

  // ---- merge every static mesh per material: hundreds of draw calls become a few dozen ---------
  const bakeStatic = () => {
    root.updateMatrixWorld(true);
    const buckets = new Map();
    const remove = [];
    root.traverse((o) => {
      if (!o.isMesh || o.material.transparent || o.renderOrder) return;
      for (let p = o; p && p !== root; p = p.parent) if (dynamic.has(p)) return;
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      for (const name of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(name)) g.deleteAttribute(name);
      if (!g.attributes.uv || !g.attributes.normal) return;
      g.clearGroups();
      if (!buckets.has(o.material)) buckets.set(o.material, []);
      buckets.get(o.material).push(g);
      remove.push(o);
    });
    remove.forEach((o) => {
      o.parent.remove(o);
      o.geometry.dispose();
    });
    buckets.forEach((geos, mat) => {
      const merged = mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      if (merged) root.add(new Mesh(merged, mat));
    });
  };
  bakeStatic();

  // world-space centre of every clickable object, so the page can pin hints to them cheaply
  const centers = new Map();
  registry.forEach(({ group }, name) => centers.set(name, new Box3().setFromObject(group).getCenter(new Vector3())));
  const hintV = new Vector3();

  // ---- screens & effects state -------------------------------------------------------------------
  let cheerUntil = 0;
  const football = createFootball({
    onGoal: () => {
      audio.goal();
      cheerUntil = performance.now() + 2600;
    },
  });
  const game = createGame(); // split-screen racer for game night
  const shooter = createShooter(); // main monitor while gaming or streaming
  const stream = createStream(shooter.canvas); // vertical monitor while streaming
  let tvMode = "ambient"; // ambient | football | game
  let deskMode = "scene"; // scene | game | stream
  let misting = false;
  let mistAmount = 0;
  let lampOn = true;
  let lamp2On = false;
  let lightMix = 1;
  let lamp2Mix = 0;
  let musicOn = false;
  let disposed = false;

  const setTv = (mode) => {
    tvMode = mode;
    tvScreen.material.map = mode === "football" ? football.texture : mode === "game" ? game.texture : tvAmbient;
    tvScreen.material.needsUpdate = true;
  };
  const setDesk = (mode) => {
    deskMode = mode;
    mon.screen.material.map = mode === "scene" ? sceneTex : shooter.texture;
    vert.screen.material.map = mode === "stream" ? stream.texture : vtex;
    mon.screen.material.needsUpdate = true;
    vert.screen.material.needsUpdate = true;
  };
  const reportAudio = () => onAudio?.(audio.kind);

  const snacks = new Group();
  snacks.position.set(TABLE.x, 0.48, TABLE.z);
  const snackBowl = new Mesh(new SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std(0xe9e3d6, 0.6));
  snackBowl.position.set(0.05, 0.08, 0.15);
  snacks.add(snackBowl);
  for (let i = 0; i < 9; i++) ball(snacks, 0.022, std(0xe0b14a, 0.8), 0.05 + Math.cos(i) * 0.05, 0.075, 0.15 + Math.sin(i * 2.1) * 0.05, 1, 0.4, 1, 6);
  rbox(snacks, 0.22, 0.012, 0.16, 0.01, std(0xf2efe8, 0.6), 0.02, 0.006, -0.18);
  for (let i = 0; i < 4; i++) ball(snacks, 0.025, std(0x9a4a1c, 0.7), -0.05 + i * 0.045, 0.025, -0.18, 1.4, 0.7, 1, 6); // wings
  snacks.visible = false;
  root.add(snacks);

  // ---- walkers: me, plus two friends for game night -----------------------------------------------
  const RIGHT = Math.PI / 2;
  const LEFT = -Math.PI / 2;
  const walkers = [];
  const makeWalker = (char, x, z, rot, pose) => {
    const w = { char, x, z, rot, moving: false, path: [], finish: null, walkPhase: Math.random() * 6, target: { ...BASE, ...POSES[pose] }, joints: { ...BASE }, tmp: { ...BASE }, isMe: false };
    for (const k of Object.keys(BASE)) if (typeof POSES[pose][k] === "number") w.joints[k] = POSES[pose][k];
    char.person.position.set(x, 0, z);
    char.person.rotation.y = rot;
    char.apply(w.joints);
    walkers.push(w);
    return w;
  };
  const settle = (w, pose) => {
    w.target = { ...BASE, ...POSES[pose] };
    w.char.showProp(POSES[pose].prop ?? null);
    w.actStart = performance.now() / 1000;
    w.stage = null;
    w.char.props.shaker.rotation.set(0, 0, 0);
    if (w.isMe) resetPour();
  };
  // finish = { face, pose, then }
  const walkTo = (w, pts, finish, carry = null) => {
    w.path = pts.filter((p, i) => Math.hypot(p[0] - (i ? pts[i - 1][0] : w.x), p[1] - (i ? pts[i - 1][1] : w.z)) > 0.05);
    w.moving = true;
    w.finish = finish;
    w.carry = carry;
    w.char.showProp(carry);
    if (w.isMe) resetPour();
    w.target = { ...BASE, ...POSES.stand };
  };

  const meW = makeWalker(me, CHAIR.x - 0.05, CHAIR.z, LEFT, "type");
  meW.isMe = true;

  const DOOR_IN = [RX - 0.15, DOOR_Z];
  const DOOR_STEP = [RX - 1.1, DOOR_Z];
  const SOFA_EXIT = [LX + 1.5, 1.0];
  const friendLooks = [
    { skinColor: 0x8a5a3c, hoodieColor: 0xb3261e, pantsColor: 0x2a2d36, shoeColor: 0xf2f2f2, hairStyle: "cap", glasses: false, beard: false },
    { skinColor: 0x3d2619, hoodieColor: 0x4a5a3a, pantsColor: 0x3b3b40, shoeColor: 0x1d1d20, hairStyle: "short", glasses: false, beard: true },
  ];
  const FRIEND_SEATS = [
    { spot: [LX + 0.55, SOFA_Z + 0.42], exit: SOFA_EXIT, face: RIGHT, pose: { game: "sofaGame", football: "sofaWatch", served: "sofaGlass" } },
    { spot: [TOGO.x, TOGO.z], exit: [0.1, TOGO.z], face: TOGO.rot, pose: { game: "loungeGame", football: "loungeWatch", served: "loungeGlass" } },
  ];
  const friends = friendLooks.map((look) => {
    const c = createCharacter(kit, look);
    c.person.visible = false;
    root.add(c.person);
    return makeWalker(c, DOOR_IN[0], DOOR_IN[1], LEFT, "stand");
  });
  let party = null; // null | "game" | "football"
  const timers = [];
  // switch what the friends are doing; if they're still walking in, update where they end up
  const setFriendPose = (key) => {
    friends.forEach((f, i) => {
      const pose = FRIEND_SEATS[i].pose[key];
      if (f.moving && f.finish) f.finish.pose = pose;
      else if (f.char.person.visible) settle(f, pose);
    });
  };
  const callFriends = (mode) => {
    if (party) {
      party = mode;
      setFriendPose(mode);
      return;
    }
    party = mode;
    friends.forEach((f, i) => {
      const s = FRIEND_SEATS[i];
      timers.push(
        setTimeout(() => {
          if (disposed || !party) return;
          f.x = DOOR_IN[0];
          f.z = DOOR_IN[1];
          f.rot = LEFT;
          f.char.person.visible = true;
          walkTo(f, [DOOR_STEP, [AISLE_X, DOOR_Z], [AISLE_X, s.exit[1]], s.exit, s.spot], { face: s.face, pose: s.pose[party] });
        }, 600 + i * 1100),
      );
    });
  };
  const serve = () => {
    snacks.visible = true;
    setFriendPose("served");
  };
  const sendFriendsHome = () => {
    if (!party) return;
    party = null;
    snacks.visible = false;
    friends.forEach((f, i) => {
      if (!f.char.person.visible) return;
      const s = FRIEND_SEATS[i];
      walkTo(f, [s.exit, [AISLE_X, s.exit[1]], [AISLE_X, DOOR_Z], DOOR_STEP, DOOR_IN], {
        face: RIGHT,
        pose: "stand",
        then: () => (f.char.person.visible = false),
      });
    });
  };

  // ---- stations: where I go and what I do there ----------------------------------------------------
  const DESK_SPOT = [CHAIR.x - 0.05, CHAIR.z];
  const DESK_EXIT = [-0.4, CHAIR.z];
  const STATIONS = {
    code: { spot: DESK_SPOT, exit: DESK_EXIT, face: LEFT, pose: "type", desk: "scene" },
    deskGame: { spot: DESK_SPOT, exit: DESK_EXIT, face: LEFT, pose: "deskGame", desk: "game" },
    stream: { spot: DESK_SPOT, exit: DESK_EXIT, face: LEFT, pose: "deskGame", desk: "stream" },
    goals: { spot: [LX + 1.1, 1.78], exit: [-0.4, 1.78], face: LEFT, pose: "goals" },
    cabinet: { spot: [LX + 1.2, 3.7], exit: [LX + 1.2, 3.7], face: LEFT, pose: "wave" },
    accent: { spot: [LX + 1.1, 0.98], exit: [LX + 1.1, 0.98], face: LEFT, pose: "stand" },
    sofa: { spot: [LX + 0.55, SOFA_Z - 0.3], exit: SOFA_EXIT, via: [[LX + 0.55, SOFA_Z + 0.55]], face: RIGHT, pose: "sofaSip" },
    football: { spot: [LX + 0.55, SOFA_Z - 0.3], exit: SOFA_EXIT, via: [[LX + 0.55, SOFA_Z + 0.55]], face: RIGHT, pose: "sofaWatch", tv: "football", sound: "football", party: "football", serve: true },
    sofaGame: { spot: [LX + 0.55, SOFA_Z - 0.3], exit: SOFA_EXIT, via: [[LX + 0.55, SOFA_Z + 0.55]], face: RIGHT, pose: "sofaGame", tv: "game", party: "game" },
    lounge: { spot: [TOGO.x, TOGO.z], exit: [0.1, TOGO.z], face: TOGO.rot, pose: "lounge" },
    coffee: { spot: [TABLE.x + 0.8, TABLE.z], exit: [TABLE.x + 0.8, TABLE.z], face: LEFT, pose: "standSip" },
    lamp: { spot: [LX + 1.05, -3.2], exit: [0.1, -3.2], face: LEFT, pose: "reach", toggle: "lamp" },
    plant: { spot: [LX + 2.05, -3.62], exit: [0.1, -3.62], face: LEFT, pose: "water" },
    diffuser: { spot: [RX - 1.05, CONSOLE_Z - 1.0], exit: [RX - 1.05, CONSOLE_Z - 1.0], face: RIGHT, pose: "press", toggle: "mist" },
    lamp2: { spot: [RX - 1.05, CONSOLE_Z + 1.55], exit: [RX - 1.05, CONSOLE_Z + 1.55], face: RIGHT, pose: "reach", toggle: "lamp2" },
    shelf: { spot: [RX - 1.0, SHELF_Z], exit: [RX - 1.0, SHELF_Z], face: RIGHT, pose: "stand" },
    music: { spot: [RX - 1.0, SHELF_Z], exit: [RX - 1.0, SHELF_Z], face: RIGHT, pose: "music", toggle: "music" },
    afro: { spot: [RX - 1.25, CONSOLE_Z + 0.25], exit: [RX - 1.25, CONSOLE_Z + 0.25], face: RIGHT, pose: "dance", toggle: "afro" },
    drinks: { spot: [RX - 0.85, CART_Z], exit: [RX - 1.0, CART_Z], face: RIGHT, pose: "shake" },
    mirror: { spot: [RX - 1.05, -3.15], exit: [RX - 1.05, -3.15], face: RIGHT, pose: "stand" },
  };
  Object.entries(STATIONS).forEach(([k, st]) => (st.key = k));
  let current = "code";

  const leaveStation = (next) => {
    const cur = STATIONS[current];
    const nxt = STATIONS[next];
    if (cur?.tv && nxt?.tv !== cur.tv) setTv("ambient");
    if (cur?.sound === "football" && nxt?.sound !== "football") audio.stop("football");
    if (cur?.desk && !nxt?.desk) setDesk("scene");
    if (cur?.party && !nxt?.party) sendFriendsHome();
    reportAudio();
  };

  // side effects of an activity (pose is applied by the walker when he gets there)
  const arrive = (st) => {
    if (st.tv) setTv(st.tv);
    if (st.desk) setDesk(st.desk);
    if (st.sound === "football") {
      audio.play("football");
      musicOn = false;
    }
    if (st.toggle === "lamp") lampOn = !lampOn;
    if (st.toggle === "lamp2") lamp2On = !lamp2On;
    if (st.toggle === "mist") misting = !misting;
    if (st.toggle === "afro") {
      if (audio.kind === "afro") audio.stop("afro");
      else {
        audio.play("afro");
        musicOn = false;
      }
    }
    if (st.toggle === "music") {
      if (audio.kind === "music") {
        audio.stop("music");
        musicOn = false;
      } else {
        musicOn = !!audio.play("music");
      }
    }
    reportAudio();
    onArrive?.(st.key);
  };

  // shortest sensible path: straight there if close, otherwise out to the walkway and back in
  const route = (prev, st) => {
    const d = Math.hypot(st.spot[0] - meW.x, st.spot[1] - meW.z);
    if (!meW.moving && d < 1.6) return [st.spot];
    const pts = [];
    if (!meW.moving && prev) pts.push(prev.exit);
    const fromZ = pts.length ? pts[0][1] : meW.z;
    pts.push([AISLE_X, fromZ], [AISLE_X, st.exit[1]], st.exit, ...(st.via ?? []), st.spot);
    return pts;
  };

  const goTo = (key) => {
    const st = STATIONS[key];
    if (!st) return;
    const prev = STATIONS[current];
    leaveStation(key);
    current = key;
    if (st.party) callFriends(st.party);
    const finish = { face: st.face, pose: st.pose, then: () => arrive(st) };
    const dSpot = Math.hypot(st.spot[0] - meW.x, st.spot[1] - meW.z);

    // already sitting or standing right there: just switch what I'm doing
    if (!meW.moving && dSpot < 0.12) {
      meW.rot = st.face;
      settle(meW, st.pose);
      arrive(st);
      if (st.serve) serve();
      return;
    }
    // football with the boys: mix drinks at the cart first, then bring the tray over
    if (st.serve && !snacks.visible) {
      const cartSt = STATIONS.drinks;
      walkTo(meW, route(prev, cartSt), {
        face: cartSt.face,
        pose: "shake",
        then: () =>
          timers.push(
            setTimeout(() => {
              if (disposed || current !== key) return;
              const back = [cartSt.exit, [AISLE_X, cartSt.exit[1]], [AISLE_X, st.exit[1]], st.exit, ...(st.via ?? []), st.spot];
              walkTo(meW, back, { ...finish, then: () => (arrive(st), serve()) }, "tray");
            }, 2200),
          ),
      });
      return;
    }
    walkTo(meW, route(prev, st), finish);
  };

  // ---- hops -------------------------------------------------------------------------------------
  const hops = [];
  const hopStart = (name) => {
    const entry = registry.get(name);
    if (!entry || name === "vacuum") return;
    const idx = hops.findIndex((h) => h.group === entry.group);
    if (idx >= 0) hops.splice(idx, 1);
    hops.push({ group: entry.group, t0: performance.now() });
  };

  // ---- camera ----------------------------------------------------------------------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let width = 1;
  let height = 1;
  const cam = { dist: 10, y: 2.1, fov: 48, offY: 0.1 };
  let intro = reducedMotion ? 1 : 0;
  const introStart = performance.now();

  const resize = () => {
    width = container.clientWidth || 1;
    height = container.clientHeight || 1;
    renderer.setSize(width, height, false);
    const a = width / height;
    camera.aspect = a;
    if (a < 1.25) Object.assign(cam, { fov: 56, dist: 7, y: 3.1, offY: 0.0 }); // phones: a higher viewpoint shows more floor, so the room reads taller
    else if (a < 1.8) Object.assign(cam, { fov: 46, dist: 9.6, y: 2.3, offY: 0.04 });
    else Object.assign(cam, { fov: 34, dist: 8.5, y: 2.0, offY: 0.02 }); // wide, short strip
    // never crop the room's width: pull back until both walls (and the cart and drawer at the
    // front of the room) fit, with a little room for the mouse parallax
    const halfH = Math.atan(Math.tan(MathUtils.degToRad(cam.fov / 2)) * a);
    const fitDist = (a < 1.25 ? 1.6 : 3.7) + (ROOM.w / 2 + 0.15) / Math.tan(halfH) - lookTarget.z;
    cam.dist = Math.max(cam.dist, fitDist);
    camera.fov = cam.fov;
    camera.setViewOffset(width, height, 0, height * cam.offY, width, height);
    camera.updateProjectionMatrix();
  };

  const placeCamera = (now) => {
    if (intro < 1) intro = Math.min(1, (now - introStart) / 1600);
    const e = 1 - Math.pow(1 - intro, 3);
    const dist = cam.dist * (1 + (1 - e) * 0.22);
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    camera.position.set(pointer.x * (camera.aspect < 0.9 ? 1.6 : 0.9), cam.y - pointer.y * 0.3, lookTarget.z + dist);
    camera.lookAt(lookTarget);
  };

  // ---- picking -----------------------------------------------------------------------------------
  const ray = new Raycaster();
  const ndc = new Vector2();
  const pick = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    return hit ? hit.object.userData.owner : null;
  };
  const screenPoint = (name, center = false) => {
    const b = new Box3().setFromObject(registry.get(name).group);
    const p = new Vector3((b.min.x + b.max.x) / 2, center ? (b.min.y + b.max.y) / 2 : b.max.y, (b.min.z + b.max.z) / 2).project(camera);
    return { x: ((p.x + 1) / 2) * width, y: ((1 - p.y) / 2) * height };
  };

  let hovered = null;
  let downAt = null;
  const onMove = (e) => {
    const r = container.getBoundingClientRect();
    if (e.pointerType === "mouse") {
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      const name = pick(e.clientX, e.clientY);
      if (name !== hovered) {
        hovered = name;
        canvas.style.cursor = name ? "pointer" : "default";
        onHover?.(name ? { ...registry.get(name).meta, ...screenPoint(name) } : null);
      }
    } else if (e.pressure > 0) {
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2.4;
    }
  };
  const onDown = (e) => {
    downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const onUp = (e) => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    const quick = performance.now() - downAt.t < 450;
    downAt = null;
    if (moved > 8 || !quick) return;
    const name = pick(e.clientX, e.clientY);
    if (!name) {
      onSelect?.(null);
      return;
    }
    const entry = registry.get(name);
    // opened synchronously inside the click so pop-up blockers allow it
    if (entry.meta.openOnClick) window.open(entry.meta.href, "_blank", "noopener");
    if (!reducedMotion) hopStart(name);
    // tell the page first (it records where to navigate), then start the walk
    onSelect?.({ ...entry.meta, ...screenPoint(name) });
    if (entry.meta.station) goTo(entry.meta.station);
  };
  const onLeave = () => {
    pointer.tx = 0;
    pointer.ty = 0;
    if (hovered) {
      hovered = null;
      canvas.style.cursor = "default";
      onHover?.(null);
    }
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointerleave", onLeave);
  const onWindowMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = container.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom + 220) return;
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  if (!reducedMotion) window.addEventListener("pointermove", onWindowMove, { passive: true });

  // ---- loop -----------------------------------------------------------------------------------------
  let raf = 0;
  let running = false;
  let visible = true;
  let last = 0;
  let prev = performance.now();
  const SPEED = 1.9;
  const BEAT = Math.PI * (76 / 60);

  const stepWalker = (w, dt, t, streaming) => {
    let walking = false;
    if (w.moving) {
      const wp = w.path[0];
      if (wp) {
        const dx = wp[0] - w.x;
        const dz = wp[1] - w.z;
        const dist = Math.hypot(dx, dz);
        const step = SPEED * dt;
        if (dist <= step) {
          w.x = wp[0];
          w.z = wp[1];
          w.path.shift();
        } else {
          w.x += (dx / dist) * step;
          w.z += (dz / dist) * step;
          w.rot = lerpAngle(w.rot, Math.atan2(dx, dz), 1 - Math.exp(-dt * 12));
          walking = true;
        }
      }
      if (!w.path.length) {
        const f = w.finish;
        w.rot = lerpAngle(w.rot, f.face, 1 - Math.exp(-dt * 10));
        if (angleOff(w.rot, f.face) < 0.08) {
          w.rot = f.face;
          w.moving = false;
          settle(w, f.pose);
          f.then?.();
        }
      }
    }
    w.char.person.position.set(w.x, 0, w.z);
    w.char.person.rotation.y = w.rot;

    const tmp = w.tmp;
    const target = w.target;
    Object.assign(tmp, BASE);
    for (const k of Object.keys(BASE)) if (typeof target[k] === "number") tmp[k] = target[k];
    if (walking) {
      w.walkPhase += dt * SPEED * 5.2;
      const s = Math.sin(w.walkPhase);
      Object.assign(tmp, {
        hipL: s * 0.7,
        hipR: -s * 0.7,
        kneeL: Math.max(0, -s) * 0.9,
        kneeR: Math.max(0, s) * 0.9,
        shL: -s * 0.55,
        shR: s * 0.55,
        shLz: 0,
        shRz: 0,
        elL: -0.25,
        elR: -0.25,
        hipsY: 0.97 + Math.abs(Math.cos(w.walkPhase)) * 0.025,
        lean: 0.05,
        headX: 0,
        headY: 0,
      });
      if (w.carry === "tray") Object.assign(tmp, { shL: -0.85, shR: -0.85, elL: -0.75, elR: -0.75, shLz: 0.25, shRz: -0.25 });
    } else if (!reducedMotion && performance.now() < cheerUntil && (target.anim === "watch" || target.anim === "sip")) {
      const j = Math.sin(t * 14 + w.walkPhase);
      Object.assign(tmp, { shL: -2.7 + j * 0.2, shR: -2.7 - j * 0.2, elL: -0.3, elR: -0.3, shLz: 0.25, shRz: -0.25, headX: -0.2, lean: 0.12 });
    } else if (!reducedMotion) {
      const anim = target.anim;
      const ph = w.walkPhase; // per-walker offset so friends don't move in sync
      if (anim === "type") {
        tmp.elL += Math.sin(t * 17) * 0.07;
        tmp.elR += Math.sin(t * 17 + 2) * 0.07;
        tmp.headX += Math.sin(t * 0.9) * 0.05;
      } else if (anim === "game") {
        tmp.elL += Math.sin(t * 11 + ph) * 0.05;
        tmp.elR += Math.sin(t * 13 + 1 + ph) * 0.05;
        tmp.lean += Math.sin(t * 1.7 + ph) * 0.04;
        if (w.isMe && streaming) tmp.headY = Math.max(0, Math.sin(t * 0.5)) * 0.6; // glance at the chat
      } else if (anim === "sip") {
        const p = (t % 4.2) / 4.2;
        const up = MathUtils.smoothstep(p, 0.35, 0.5) * (1 - MathUtils.smoothstep(p, 0.72, 0.88));
        tmp.shR = MathUtils.lerp(target.shR, -0.95, up);
        tmp.elR = MathUtils.lerp(target.elR, -2.35, up);
        tmp.headX = up * -0.12;
      } else if (anim === "watch") {
        tmp.headX = Math.sin(t * 0.7) * 0.03;
      } else if (anim === "wave") {
        tmp.elR = -0.35 + Math.sin(t * 7) * 0.45;
      } else if (anim === "water") {
        tmp.elR = -0.4 + Math.sin(t * 3) * 0.12;
      } else if (anim === "write") {
        tmp.elR += Math.sin(t * 9) * 0.08;
        tmp.shRz = Math.sin(t * 2.2) * 0.12;
      } else if (anim === "shake") {
        // bartender routine: shake, pour into the glass on the cart, then enjoy the drink
        const e = t - (w.actStart ?? t);
        const sh = w.char.props.shaker;
        if (e < 2.8) {
          // short, fast pumps from the forearms only; body and head stay still
          const j = Math.sin(t * 34);
          tmp.elL += j * 0.13;
          tmp.elR += j * 0.13;
          tmp.shL += j * 0.035;
          tmp.shR += j * 0.035;
          sh.rotation.x = 0;
          if (w.isMe) cartShaker.visible = false;
        } else if (e < 5) {
          // right arm out over the glass, tip the shaker, watch it fill
          Object.assign(tmp, { shR: -1.25, elR: -0.35, shRz: -0.08, shL: 0.04, shLz: 0, elL: -0.12, headX: 0.32 });
          sh.rotation.x = MathUtils.smoothstep(e, 2.9, 3.5) * (1 - MathUtils.smoothstep(e, 4.6, 5)) * 2;
          if (w.isMe) {
            const fill = MathUtils.clamp((e - 3.4) / 1.2, 0, 1);
            pourLiquid.visible = fill > 0;
            pourLiquid.scale.y = Math.max(0.01, fill);
            pourStream.visible = e > 3.4 && e < 4.7;
          }
        } else {
          // done: put the shaker back, pick up the drink and sip
          if (w.stage !== "drink") {
            w.stage = "drink";
            w.char.showProp("glass");
            sh.rotation.x = 0;
            if (w.isMe) {
              pourGlass.visible = false;
              cartShaker.visible = true;
            }
          }
          const p = ((e - 5) % 4.2) / 4.2;
          const up = MathUtils.smoothstep(p, 0.35, 0.5) * (1 - MathUtils.smoothstep(p, 0.72, 0.88));
          Object.assign(tmp, { shL: 0.04, shLz: 0, shRz: 0, elL: -0.12, headX: up * -0.12 });
          tmp.shR = MathUtils.lerp(-0.5, -0.95, up);
          tmp.elR = MathUtils.lerp(-1.2, -2.35, up);
        }
      } else if (anim === "dance") {
        // afrobeats bounce: knees on the beat, arms and shoulders rolling
        const beat = t * Math.PI * (104 / 60);
        const b = Math.abs(Math.sin(beat));
        tmp.kneeL = b * 0.35;
        tmp.kneeR = Math.abs(Math.sin(beat + 0.4)) * 0.35;
        tmp.hipL = -b * 0.18;
        tmp.hipR = -Math.abs(Math.sin(beat + 0.4)) * 0.18;
        tmp.hipsY = 0.97 - b * 0.06;
        tmp.shL = -0.5 + Math.sin(beat) * 0.35;
        tmp.shR = -0.5 - Math.sin(beat) * 0.35;
        tmp.shLz = 0.2 + Math.sin(beat * 0.5) * 0.15;
        tmp.shRz = -0.2 + Math.sin(beat * 0.5) * 0.15;
        tmp.lean = Math.sin(beat) * 0.06;
        tmp.headX = b * 0.12;
      } else if (anim === "groove") {
        const b = Math.abs(Math.sin(t * BEAT));
        tmp.headX = b * 0.18 - 0.05;
        tmp.lean = Math.sin(t * BEAT) * 0.04;
        tmp.kneeL = b * 0.12;
        tmp.kneeR = b * 0.12;
      } else {
        tmp.lean += Math.sin(t * 1.4 + ph) * 0.012;
      }
    }
    const k = 1 - Math.exp(-dt * 11);
    for (const key2 of Object.keys(BASE)) w.joints[key2] += (tmp[key2] - w.joints[key2]) * k;
    w.char.apply(w.joints);
  };

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (isMobile && now - last < 22) return;
    last = now;
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    const t = now / 1000;

    // lights
    lightMix += ((lampOn ? 1 : 0) - lightMix) * 0.08;
    lamp2Mix += ((lamp2On ? 1 : 0) - lamp2Mix) * 0.08;
    hemi.intensity = 0.3 + 0.5 * lightMix;
    key.intensity = 0.25 + 0.55 * lightMix;
    ceiling.intensity = 1.2 + 3.8 * lightMix;
    lampLight.intensity = 7 * lightMix;
    shadeMat.emissiveIntensity = 0.15 + 0.95 * lightMix;
    lamp2Light.intensity = 5 * lamp2Mix;
    globeMat.emissiveIntensity = 0.15 + 1.1 * lamp2Mix;
    const streaming = deskMode === "stream";
    deskLight.intensity = (streaming ? 6 : 3.4) + (1 - lightMix) * 1.2;
    deskLight.color.setHex(streaming ? 0xf4f6ff : 0xffe0b0);
    ringMat.color.setHex(streaming ? 0xffffff : 0xbdbdbd);
    tvLight.intensity = 3.4 + (1 - lightMix) * 1.6 + (tvMode !== "ambient" ? 1.5 : 0);

    if (!reducedMotion) {
      candleLight.intensity = 0.8 + Math.sin(t * 9) * 0.12 + Math.sin(t * 23) * 0.06;
      candle.material.emissiveIntensity = 0.7 + Math.sin(t * 9) * 0.15;
      leaves.forEach((p) => (p.rotation.x = Math.sin(t * 0.9 + p.userData.phase) * 0.04));
      vtex.offset.y = (t * 0.02) % 0.5;
      laptopCode.offset.y = (t * 0.015) % 1;
      if (tvMode === "ambient") tvAmbient.offset.x = (t * 0.015) % 0.5;
      if (musicOn) platter.rotation.y += dt * 3.5;
      brush.rotation.y += dt * 14;
    }
    if (tvMode === "football") football.update(dt);
    if (tvMode === "game") game.update(dt);
    barLedMat.color.setHex(audio.kind === "afro" ? (Math.sin(t * Math.PI * (104 / 60) * 2) > 0 ? 0xf15a24 : 0x7a2d12) : 0x333338);
    if (deskMode !== "scene") shooter.update(dt);
    if (deskMode === "stream") stream.update(dt);

    // diffuser mist
    mistAmount += ((misting ? 1 : 0) - mistAmount) * 0.05;
    mistMat.opacity = 0.45 * mistAmount;
    diffuserGlow.color.setHex(misting ? 0x7ad7ff : 0xffb37a);
    if (mistAmount > 0.01) {
      for (let i = 0; i < MIST; i++) {
        mistLife[i] += dt * 0.35;
        if (mistLife[i] > 1) mistLife[i] = 0;
        const l = mistLife[i];
        mistPos[i * 3] = Math.sin(i * 12.9 + l * 3) * 0.05 * l;
        mistPos[i * 3 + 1] = l * 0.6;
        mistPos[i * 3 + 2] = Math.cos(i * 7.3 + l * 2) * 0.05 * l;
      }
      mistGeo.attributes.position.needsUpdate = true;
    }

    // robot vacuum: follows its loop, pauses while the character is close
    if (!reducedMotion) {
      const [tx, tz] = VAC_PATH[vac.i];
      const dx = tx - vac.x;
      const dz = tz - vac.z;
      const d = Math.hypot(dx, dz);
      const near = walkers.some((w) => w.char.person.visible && Math.hypot(w.x - vac.x, w.z - vac.z) < 0.55);
      if (d < 0.05) vac.i = (vac.i + 1) % VAC_PATH.length;
      else if (!near) {
        const want = Math.atan2(dx, dz);
        vac.rot = lerpAngle(vac.rot, want, 1 - Math.exp(-dt * 3));
        if (angleOff(vac.rot, want) < 0.4) {
          vac.x += (dx / d) * 0.32 * dt;
          vac.z += (dz / d) * 0.32 * dt;
        }
      }
      vacuum.position.x = vac.x;
      vacuum.position.z = vac.z;
      vacuum.rotation.y = vac.rot;
      vacLedMat.color.setHex(near ? 0xffc14d : 0x46d39a);
    }

    for (const w of walkers) if (w.char.person.visible) stepWalker(w, dt, t, streaming);

    for (let i = hops.length - 1; i >= 0; i--) {
      const h = hops[i];
      const p = (now - h.t0) / 720;
      if (p >= 1) {
        h.group.position.y = h.group.userData.baseY;
        h.group.scale.set(1, 1, 1);
        hops.splice(i, 1);
      } else {
        const b = Math.abs(Math.sin(p * Math.PI * 2)) * (1 - p) * 0.18;
        h.group.position.y = h.group.userData.baseY + b;
        const s = 1 + Math.sin(p * Math.PI * 4) * 0.025 * (1 - p);
        h.group.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
      }
    }

    placeCamera(now);
    renderer.render(scene, camera);
  };

  const start = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    prev = performance.now();
    raf = requestAnimationFrame(frame);
    audio.resume();
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    audio.suspend();
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(container);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // compile shaders (in parallel where the browser supports it), then show the first frame
  placeCamera(performance.now());
  const ready = () => {
    if (disposed) return;
    renderer.render(scene, camera);
    onReady?.();
    start();
  };
  // never wait on shader compilation for more than ~1.5s; the first frame finishes it either way
  let shown = false;
  const showOnce = () => {
    if (shown) return;
    shown = true;
    ready();
  };
  setTimeout(showOnce, 1500);
  if (renderer.compileAsync) renderer.compileAsync(scene, camera).then(showOnce, showOnce);
  else showOnce();

  return {
    // screen positions of a few objects, so the page can pulse hints on them (e.g. on touch screens)
    hotspots: (names) =>
      names
        .filter((n) => centers.has(n))
        .map((n) => {
          hintV.copy(centers.get(n)).project(camera);
          return { name: n, x: ((hintV.x + 1) / 2) * width, y: ((1 - hintV.y) / 2) * height, on: hintV.z < 1 && Math.abs(hintV.x) < 1.05 && Math.abs(hintV.y) < 1.05 };
        }),
    setMuted: (m) => audio.setMuted(m),
    stopSound: () => {
      audio.stop();
      musicOn = false;
      reportAudio();
    },
    dispose() {
      disposed = true;
      timers.forEach(clearTimeout);
      stop();
      audio.dispose();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onWindowMove);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      scene.traverse((o) => o.geometry?.dispose());
      matCache.forEach((m) => m.dispose());
      renderer.dispose();
      canvas.remove();
    },
  };
}
