// The little "me" in the room, built from the memoji: curly black hair, beard, round glasses,
// grey hoodie, brand-orange sneakers. Joints are plain Groups rotated each frame.
import { Group, Mesh, TorusGeometry } from "three";

export const BASE = {
  hipsY: 0.97,
  hipL: 0,
  hipR: 0,
  kneeL: 0,
  kneeR: 0,
  shL: 0.04,
  shR: -0.04,
  shLz: 0,
  shRz: 0,
  elL: -0.12,
  elR: -0.12,
  lean: 0,
  headX: 0,
  headY: 0,
};

const SIT_DESK = { hipsY: 0.57, hipL: -1.5, hipR: -1.5, kneeL: 1.5, kneeR: 1.5 };
const SIT_SOFA = { hipsY: 0.51, hipL: -1.45, hipR: -1.45, kneeL: 1.45, kneeR: 1.45, lean: -0.12 };
const PAD_ARMS = { shL: -0.7, shR: -0.7, shLz: 0.32, shRz: -0.32, elL: -1.2, elR: -1.2 };

export const POSES = {
  stand: { anim: "idle" },
  type: { ...SIT_DESK, shL: -0.95, shR: -0.95, elL: -1.3, elR: -1.3, headX: 0.22, anim: "type" },
  deskGame: { ...SIT_DESK, ...PAD_ARMS, headX: 0.12, anim: "game", prop: "controller" },
  sofaSip: { ...SIT_SOFA, shL: -0.35, shR: -0.5, elL: -0.8, elR: -1.2, anim: "sip", prop: "mug" },
  sofaWatch: { ...SIT_SOFA, shL: -0.35, shR: -0.35, elL: -0.8, elR: -0.8, lean: -0.18, headY: 0.18, anim: "watch" },
  sofaGame: { ...SIT_SOFA, ...PAD_ARMS, lean: -0.05, headY: 0.18, anim: "game", prop: "controller" },
  loungeGame: { hipsY: 0.42, hipL: -1.2, hipR: -1.2, kneeL: 1.05, kneeR: 1.05, ...PAD_ARMS, lean: -0.22, anim: "game", prop: "controller" },
  sofaGlass: { ...SIT_SOFA, shL: -0.35, shR: -0.5, elL: -0.8, elR: -1.2, headY: 0.18, anim: "sip", prop: "glass" },
  loungeWatch: { hipsY: 0.42, hipL: -1.2, hipR: -1.2, kneeL: 1.05, kneeR: 1.05, shL: -0.3, shR: -0.3, elL: -0.8, elR: -0.8, lean: -0.3, anim: "watch" },
  loungeGlass: { hipsY: 0.42, hipL: -1.2, hipR: -1.2, kneeL: 1.05, kneeR: 1.05, shL: -0.3, shR: -0.5, elL: -0.8, elR: -1.2, lean: -0.3, anim: "sip", prop: "glass" },
  lounge: { hipsY: 0.42, hipL: -1.2, hipR: -1.2, kneeL: 1.05, kneeR: 1.05, shL: -0.3, shR: -2.55, elL: -0.8, elR: -0.3, lean: -0.3, anim: "wave" },
  wave: { shR: -2.6, elR: -0.3, anim: "wave" },
  reach: { shR: -2.95, elR: -0.1, anim: "idle" },
  water: { shR: -1.1, elR: -0.4, headX: 0.25, anim: "water" },
  standSip: { shR: -0.5, elR: -1.2, anim: "sip", prop: "mug" },
  drink: { shR: -0.5, elR: -1.2, anim: "sip", prop: "glass" },
  goals: { shR: -2.2, elR: -0.7, headX: -0.18, anim: "write", prop: "pen" },
  music: { shL: -0.2, shR: -0.2, elL: -0.5, elR: -0.5, anim: "groove" },
  dance: { shL: -0.4, shR: -0.4, elL: -1.3, elR: -1.3, anim: "dance" },
  press: { shR: -1.25, elR: -0.25, headX: 0.3, anim: "idle" },
  // shaker held in front of the chest with both hands; only the forearms move
  shake: { shL: -1.15, shR: -1.15, shLz: 0.3, shRz: -0.3, elL: -1.7, elR: -1.7, headX: 0.05, anim: "shake", prop: "shaker" },
};

// `look` lets the same rig become friends: skin, hoodie, hair style ("curly" | "short" | "cap"), etc.
export function createCharacter({ std, rbox, cyl, ball, box, brand }, look = {}) {
  const {
    skinColor = 0x6b4333,
    hoodieColor = 0x5a5e6b,
    pantsColor = 0x4a4d57,
    shoeColor = brand,
    hairStyle = "curly",
    glasses = true,
    beard = true,
  } = look;
  const skin = std(skinColor, 0.65);
  const hair = std(0x0c0c0e, 0.9);
  const hoodie = std(hoodieColor, 0.9);
  const joggers = std(pantsColor, 0.9);
  const shoe = std(shoeColor, 0.6);
  const metal = std(0xbfc3c9, 0.3, 0.8);

  const person = new Group();
  const body = new Group(); // pivot at the hips
  person.add(body);
  person.scale.setScalar(0.92);

  rbox(body, 0.38, 0.52, 0.22, 0.07, hoodie, 0, 0.3, 0);
  box(body, 0.4, 0.05, 0.23, std(0x1f1f24, 0.9), 0, 0.04, 0); // ribbed hem
  // hoodie details: hood bunched behind the neck, kangaroo pocket, drawstrings
  ball(body, 0.14, hoodie, 0, 0.6, -0.11, 1.35, 0.85, 0.75, 14);
  const hoodRim = new Mesh(new TorusGeometry(0.095, 0.03, 8, 20), hoodie);
  hoodRim.position.set(0, 0.57, 0.005);
  hoodRim.rotation.x = Math.PI / 2;
  body.add(hoodRim);
  rbox(body, 0.24, 0.1, 0.02, 0.012, std(hoodieColor - 0x0a0a0a, 0.9), 0, 0.15, 0.115); // pocket
  for (const x of [-0.04, 0.04]) {
    cyl(body, 0.006, 0.006, 0.16, std(brand, 0.6), x, 0.47, 0.118, 6); // drawstrings
    ball(body, 0.011, std(brand, 0.5), x, 0.385, 0.118, 1, 1, 1, 6);
  }

  const head = new Group();
  head.position.set(0, 0.74, 0);
  body.add(head);
  ball(head, 0.13, skin, 0, 0, 0, 1, 1.08, 1, 18);
  ball(head, 0.135, hair, 0, 0.055, -0.012, 1, 0.82, 1.02, 14);
  if (hairStyle === "curly") {
    for (const [x, y, z] of [[-0.1, 0.11, 0], [0.1, 0.11, 0], [0, 0.16, 0], [-0.06, 0.15, -0.07], [0.06, 0.15, -0.07], [-0.12, 0.05, -0.06], [0.12, 0.05, -0.06], [0, 0.1, -0.1], [-0.05, 0.16, 0.05], [0.05, 0.16, 0.05]]) {
      ball(head, 0.045, hair, x, y, z, 1, 1, 1, 8);
    }
  } else if (hairStyle === "cap") {
    const capMat = std(0x111114, 0.7);
    ball(head, 0.142, capMat, 0, 0.06, -0.005, 1, 0.75, 1.02, 14);
    box(head, 0.18, 0.012, 0.11, capMat, 0, 0.07, 0.15);
  }
  if (beard) ball(head, 0.1, hair, 0, -0.07, 0.045, 1, 0.7, 0.9, 12);
  ball(head, 0.022, skin, 0, -0.01, 0.125, 1, 1, 1, 8); // nose
  for (const x of [-0.05, 0.05]) {
    if (glasses) {
      const lens = new Mesh(new TorusGeometry(0.036, 0.004, 6, 18), metal);
      lens.position.set(x, 0.02, 0.122);
      head.add(lens);
    }
    ball(head, 0.01, hair, x, 0.02, 0.123, 1, 1, 0.5, 6); // eyes
  }
  if (glasses) box(head, 0.03, 0.004, 0.004, metal, 0, 0.03, 0.124);

  const arm = (side) => {
    const sh = new Group();
    sh.position.set(side * 0.235, 0.5, 0);
    body.add(sh);
    cyl(sh, 0.055, 0.05, 0.3, hoodie, 0, -0.15, 0, 10);
    const el = new Group();
    el.position.y = -0.3;
    sh.add(el);
    cyl(el, 0.05, 0.045, 0.27, hoodie, 0, -0.135, 0, 10);
    const hand = new Group();
    hand.position.y = -0.285;
    el.add(hand);
    ball(hand, 0.045, skin, 0, 0, 0, 1, 1, 1, 8);
    return { sh, el, hand };
  };
  const leg = (side) => {
    const hip = new Group();
    hip.position.set(side * 0.1, 0, 0);
    body.add(hip);
    cyl(hip, 0.075, 0.065, 0.46, joggers, 0, -0.23, 0, 10);
    const knee = new Group();
    knee.position.y = -0.46;
    hip.add(knee);
    cyl(knee, 0.065, 0.055, 0.46, joggers, 0, -0.23, 0, 10);
    rbox(knee, 0.11, 0.075, 0.26, 0.03, shoe, 0, -0.475, 0.06);
    return { hip, knee };
  };
  const armL = arm(-1);
  const armR = arm(1);
  const legL = leg(-1);
  const legR = leg(1);

  // props, shown per pose
  const mug = new Group();
  mug.position.set(0, -0.04, 0.03);
  cyl(mug, 0.034, 0.03, 0.08, std(0xf3efe6, 0.5), 0, 0, 0, 14);
  box(mug, 0.012, 0.05, 0.01, std(0xf3efe6, 0.5), 0.045, 0, 0);
  cyl(mug, 0.03, 0.03, 0.004, std(0x3a1d0c, 0.4), 0, 0.037, 0, 12);
  armR.hand.add(mug);

  const glass = new Group();
  glass.position.set(0, -0.04, 0.03);
  cyl(glass, 0.03, 0.026, 0.07, std(0xffffff, 0.05, 0, { transparent: true, opacity: 0.35 }), 0, 0, 0, 12);
  cyl(glass, 0.026, 0.024, 0.04, std(0xb5651d, 0.3), 0, -0.012, 0, 12);
  armR.hand.add(glass);

  // gamepad held in front of the chest with both hands: a pad body, two grips, two sticks, a few buttons
  const controller = new Group();
  controller.position.set(0, 0.37, 0.47); // between the hands (arm geometry: hands end ~0.37 up, ~0.47 forward)
  controller.rotation.x = -0.2;
  const padWhite = std(0xf2f2f4, 0.5);
  const padBlack = std(0x141416, 0.5);
  rbox(controller, 0.2, 0.04, 0.1, 0.02, padWhite, 0, 0, 0);
  rbox(controller, 0.05, 0.05, 0.1, 0.02, padWhite, -0.1, -0.015, 0.02);
  rbox(controller, 0.05, 0.05, 0.1, 0.02, padWhite, 0.1, -0.015, 0.02);
  cyl(controller, 0.017, 0.017, 0.02, padBlack, -0.045, 0.028, 0.015, 10);
  cyl(controller, 0.017, 0.017, 0.02, padBlack, 0.045, 0.028, 0.015, 10);
  for (const [x, z, c] of [[0.085, -0.02, 0xf15a24], [0.105, 0, 0x5aa9ff], [0.085, 0.02, 0x7ee787], [0.065, 0, 0xf4d03f]]) {
    cyl(controller, 0.007, 0.007, 0.012, std(c, 0.4), x, 0.026, z, 8);
  }
  body.add(controller);

  const pen = new Group();
  pen.position.set(0, -0.02, 0.02);
  cyl(pen, 0.006, 0.006, 0.13, std(0x111111, 0.5), 0, 0, 0, 6).rotation.x = Math.PI / 2;
  armR.hand.add(pen);

  // cocktail shaker, held up by the shoulder like a bartender
  const shaker = new Group();
  shaker.position.set(-0.05, 0.02, 0.03);
  const steel = std(0xd7dade, 0.18, 0.95);
  cyl(shaker, 0.036, 0.028, 0.15, steel, 0, 0, 0, 16);
  cyl(shaker, 0.028, 0.034, 0.05, steel, 0, 0.1, 0, 16);
  cyl(shaker, 0.012, 0.02, 0.03, steel, 0, 0.14, 0, 12);
  armR.hand.add(shaker);

  // serving tray with drinks and a snack bowl, carried in front with both hands
  const tray = new Group();
  tray.position.set(-0.13, 0.0, 0.08);
  rbox(tray, 0.36, 0.015, 0.24, 0.01, std(0x2b1c12, 0.5), 0, 0, 0);
  for (const [x, z] of [[-0.1, -0.05], [0, 0.05], [0.1, -0.04]]) cyl(tray, 0.028, 0.024, 0.08, std(0xb5651d, 0.2), x, 0.045, z, 10);
  cyl(tray, 0.05, 0.035, 0.04, std(0xe9e3d6, 0.6), 0.12, 0.028, 0.07, 12);
  armR.hand.add(tray);

  const props = { mug, glass, controller, pen, shaker, tray };
  const showProp = (name) => Object.entries(props).forEach(([k, p]) => (p.visible = k === name));
  showProp(null);

  const apply = (j) => {
    body.position.y = j.hipsY;
    body.rotation.x = j.lean;
    legL.hip.rotation.x = j.hipL;
    legR.hip.rotation.x = j.hipR;
    legL.knee.rotation.x = j.kneeL;
    legR.knee.rotation.x = j.kneeR;
    armL.sh.rotation.x = j.shL;
    armR.sh.rotation.x = j.shR;
    armL.sh.rotation.z = j.shLz;
    armR.sh.rotation.z = j.shRz;
    armL.el.rotation.x = j.elL;
    armR.el.rotation.x = j.elR;
    head.rotation.x = j.headX;
    head.rotation.y = j.headY;
  };

  return { person, showProp, apply, props };
}
