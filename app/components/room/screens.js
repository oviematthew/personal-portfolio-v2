// Animated canvas "broadcasts" for the TV and desk monitor: a Man United match and a racing game.
// Each redraws at ~20fps into a small canvas only while it is actually on screen.
import { CanvasTexture, SRGBColorSpace } from "three";

const mk = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return { c, ctx: c.getContext("2d"), t };
};

// ---------------------------------------------------------------------------------------------
// Football: Manchester United (red) attacking right, #7 Ronaldo finishes the moves.
// ---------------------------------------------------------------------------------------------
export function createFootball({ onGoal } = {}) {
  const W = 512;
  const H = 288;
  const { ctx, t: texture } = mk(W, H);
  const P = { x0: 18, y0: 34, x1: W - 18, y1: H - 14 };
  const midY = (P.y0 + P.y1) / 2;

  const home = [
    [60, midY], [120, midY - 70], [120, midY - 25], [120, midY + 25], [120, midY + 70],
    [220, midY - 55], [220, midY], [220, midY + 55], [320, midY - 80], [330, midY + 75], [340, midY],
  ];
  const away = [
    [452, midY], [400, midY - 70], [400, midY - 25], [400, midY + 25], [400, midY + 70],
    [320, midY - 40], [320, midY + 40], [290, midY], [230, midY - 90], [230, midY + 90], [200, midY],
  ];
  const nums = [1, 2, 5, 6, 23, 8, 16, 18, 11, 10, 7]; // last one is #7
  const red = home.map(([x, y], i) => ({ x, y, hx: x, hy: y, n: nums[i] }));
  const blue = away.map(([x, y]) => ({ x, y, hx: x, hy: y }));
  const ball = { x: 300, y: midY, vx: 0, vy: 0, owner: 6 };
  let passTimer = 1.2;
  let score = [0, 0];
  let clock = 63 * 60 + 12;
  let flash = 0;
  let acc = 0;

  const kickoff = () => {
    red.forEach((p) => ((p.x = p.hx), (p.y = p.hy)));
    blue.forEach((p) => ((p.x = p.hx), (p.y = p.hy)));
    Object.assign(ball, { x: 220, y: midY, vx: 0, vy: 0, owner: 6 });
    passTimer = 1.4;
  };

  const step = (dt) => {
    clock += dt * 6;
    if (flash > 0) {
      flash -= dt;
      if (flash <= 0) kickoff();
      return;
    }
    // team shape drifts with the ball
    const shift = (ball.x - W / 2) * 0.35;
    red.forEach((p, i) => {
      const tx = i === 0 ? p.hx : p.hx + shift + Math.sin(clock * 0.03 + i) * 8;
      const ty = p.hy + (ball.y - midY) * 0.25;
      p.x += (tx - p.x) * dt * 1.6;
      p.y += (ty - p.y) * dt * 1.6;
    });
    blue.forEach((p, i) => {
      const chase = i === 7 || i === 5 ? 0.9 : 0.2;
      const tx = (i === 0 ? p.hx : p.hx + shift * 0.6) * (1 - chase) + ball.x * chase;
      const ty = p.hy * (1 - chase) + ball.y * chase;
      p.x += (tx - p.x) * dt * 1.4;
      p.y += (ty - p.y) * dt * 1.4;
    });

    if (ball.owner != null) {
      const o = red[ball.owner];
      o.x += 22 * dt; // carry it forward
      ball.x = o.x + 6;
      ball.y = o.y + 2;
      passTimer -= dt;
      if (passTimer <= 0) {
        if (ball.owner === 10 && o.x > 360) {
          // Ronaldo shoots
          const ty = midY + (Math.random() - 0.5) * 30;
          const dx = P.x1 - ball.x;
          const dy = ty - ball.y;
          const d = Math.hypot(dx, dy);
          ball.vx = (dx / d) * 260;
          ball.vy = (dy / d) * 260;
          ball.owner = null;
        } else {
          // pass forward, mostly towards #7
          const ahead = red.map((p, i) => [p, i]).filter(([p, i]) => i !== ball.owner && i !== 0 && p.x > o.x - 20);
          const pick = Math.random() < 0.45 || !ahead.length ? 10 : ahead[Math.floor(Math.random() * ahead.length)][1];
          const tp = red[pick];
          const d = Math.hypot(tp.x - ball.x, tp.y - ball.y) || 1;
          ball.vx = ((tp.x - ball.x) / d) * 200;
          ball.vy = ((tp.y - ball.y) / d) * 200;
          ball.target = pick;
          ball.owner = null;
        }
        passTimer = 0.9 + Math.random() * 1.1;
      }
    } else {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.target != null) {
        const tp = red[ball.target];
        if (Math.hypot(tp.x - ball.x, tp.y - ball.y) < 9) {
          ball.owner = ball.target;
          ball.target = null;
        }
      }
      if (ball.x >= P.x1 - 2 && Math.abs(ball.y - midY) < 26) {
        score[0] += 1;
        flash = 3;
        onGoal?.();
      } else if (ball.x > P.x1 + 10 || ball.x < P.x0 || ball.y < P.y0 || ball.y > P.y1) {
        kickoff();
      }
    }
  };

  const dot = (x, y, fill, num) => {
    ctx.beginPath();
    ctx.arc(x, y, num === 7 ? 6.5 : 5.5, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.stroke();
    if (num === 7) {
      ctx.fillStyle = "#fff";
      ctx.font = "700 8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("7", x, y + 3);
    }
  };

  const draw = () => {
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? "#2f7d36" : "#358a3c";
      ctx.fillRect(i * (W / 10), 0, W / 10, H);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 2;
    ctx.strokeRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0);
    ctx.beginPath();
    ctx.moveTo(W / 2, P.y0);
    ctx.lineTo(W / 2, P.y1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2, midY, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(P.x0, midY - 55, 55, 110);
    ctx.strokeRect(P.x1 - 55, midY - 55, 55, 110);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(P.x0 - 6, midY - 22, 6, 44);
    ctx.fillRect(P.x1, midY - 22, 6, 44);

    blue.forEach((p) => dot(p.x, p.y, "#6cabdd"));
    red.forEach((p) => dot(p.x, p.y, "#da291c", p.n));
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // score bug
    ctx.fillStyle = "rgba(10,10,12,0.85)";
    ctx.fillRect(12, 8, 168, 22);
    ctx.fillStyle = "#da291c";
    ctx.fillRect(12, 8, 6, 22);
    ctx.fillStyle = "#fff";
    ctx.font = "700 13px sans-serif";
    ctx.textAlign = "left";
    const m = Math.floor(clock / 60);
    const s = Math.floor(clock % 60).toString().padStart(2, "0");
    ctx.fillText(`MUN  ${score[0]} - ${score[1]}  MCI`, 24, 24);
    ctx.fillStyle = "#cfcfcf";
    ctx.fillText(`${m}:${s}`, 134, 24);

    if (flash > 0) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "800 54px sans-serif";
      ctx.fillText("GOAL!", W / 2, H / 2);
      ctx.fillStyle = "#da291c";
      ctx.fillRect(W / 2 - 110, H / 2 + 16, 220, 30);
      ctx.fillStyle = "#fff";
      ctx.font = "700 17px sans-serif";
      ctx.fillText(`RONALDO 7  ${Math.floor(clock / 60)}'`, W / 2, H / 2 + 37);
    }
  };

  draw();
  return {
    texture,
    update(dt) {
      acc += dt;
      if (acc < 0.05) return;
      step(acc);
      acc = 0;
      draw();
      texture.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Racing game, split-screen for game night (four players, one TV).
// ---------------------------------------------------------------------------------------------
export function createGame() {
  const W = 512;
  const H = 288;
  const { ctx, t: texture } = mk(W, H);
  let time = 0;
  let acc = 0;
  const CARS = ["#F15A24", "#3fa9f5", "#7ee787", "#ffd166"];

  // one racer viewport drawn in 512x288 space; the caller scales it into a quadrant
  const racer = (phase, car) => {
    const horizon = H * 0.48;
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#1a0f3a");
    sky.addColorStop(1, "#c4386b");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizon);
    ctx.fillStyle = "#ffb347";
    ctx.beginPath();
    ctx.arc(W / 2, horizon, 50, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#12091f";
    ctx.fillRect(0, horizon, W, H - horizon);
    ctx.strokeStyle = "rgba(241,90,36,0.75)";
    ctx.lineWidth = 2;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(W / 2 + i * 6, horizon);
      ctx.lineTo(W / 2 + i * 80, H);
      ctx.stroke();
    }
    const off = (time * 1.6 + phase) % 1;
    for (let i = 0; i < 8; i++) {
      const p = (i + off) / 8;
      const y = horizon + Math.pow(p, 2.2) * (H - horizon);
      ctx.globalAlpha = p;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const cx = W / 2 + Math.sin(time * 1.3 + phase * 6) * 50;
    ctx.fillStyle = car;
    ctx.beginPath();
    ctx.moveTo(cx - 60, H - 20);
    ctx.lineTo(cx - 46, H - 56);
    ctx.lineTo(cx + 46, H - 56);
    ctx.lineTo(cx + 60, H - 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0d0d10";
    ctx.fillRect(cx - 36, H - 52, 72, 14);
  };

  const draw = () => {
    for (let q = 0; q < 4; q++) {
      const qx = (q % 2) * (W / 2);
      const qy = Math.floor(q / 2) * (H / 2);
      ctx.save();
      ctx.beginPath();
      ctx.rect(qx, qy, W / 2, H / 2);
      ctx.clip();
      ctx.translate(qx, qy);
      ctx.scale(0.5, 0.5);
      racer(q * 0.27, CARS[q]);
      ctx.restore();
      ctx.fillStyle = CARS[q];
      ctx.font = "800 15px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`P${q + 1}`, qx + 10, qy + 22);
      ctx.fillStyle = "#fff";
      ctx.font = "700 12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${["1st", "3rd", "2nd", "4th"][(q + Math.floor(time / 6)) % 4]}`, qx + W / 2 - 10, qy + 22);
    }
    ctx.fillStyle = "#0b0b0d";
    ctx.fillRect(W / 2 - 2, 0, 4, H);
    ctx.fillRect(0, H / 2 - 2, W, 4);
  };

  draw();
  return {
    texture,
    update(dt) {
      time += dt;
      acc += dt;
      if (acc < 0.05) return;
      acc = 0;
      draw();
      texture.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------------------------
// First-person shooter on the main monitor (generic military shooter, no real branding).
// ---------------------------------------------------------------------------------------------
export function createShooter() {
  const W = 512;
  const H = 288;
  const { c: canvas, ctx, t: texture } = mk(W, H);
  let time = 0;
  let acc = 0;
  let flash = 0;
  let kills = 0;
  let ammo = 30;
  const enemies = [
    { x: 140, y: 150, s: 1, v: 18 },
    { x: 380, y: 140, s: 0.8, v: -14 },
    { x: 260, y: 160, s: 1.2, v: 10 },
  ];
  const feed = [];

  const draw = () => {
    // sky and ruined skyline
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, "#4a5560");
    sky.addColorStop(1, "#a89a80");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#3a3d40";
    [[0, 70, 90], [80, 95, 60], [150, 60, 110], [270, 85, 70], [350, 50, 90], [440, 80, 72]].forEach(([x, y, w]) => ctx.fillRect(x, y, w, H * 0.6 - y));
    ctx.fillStyle = "#6b5f4c";
    ctx.fillRect(0, H * 0.58, W, H);
    ctx.fillStyle = "#5a4f3f";
    ctx.fillRect(40, H * 0.5, 120, 34); // cover
    ctx.fillRect(330, H * 0.52, 140, 30);
    // enemies
    enemies.forEach((e) => {
      ctx.fillStyle = "#2a2c2a";
      ctx.fillRect(e.x - 6 * e.s, e.y - 30 * e.s, 12 * e.s, 30 * e.s);
      ctx.beginPath();
      ctx.arc(e.x, e.y - 36 * e.s, 6 * e.s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e5484d";
      ctx.fillRect(e.x - 10, e.y - 52 * e.s, 20, 3);
    });
    // weapon
    const kick = flash > 0 ? 8 : 0;
    ctx.fillStyle = "#1c1d1f";
    ctx.beginPath();
    ctx.moveTo(W * 0.62, H);
    ctx.lineTo(W * 0.7 - kick, H * 0.66 + kick);
    ctx.lineTo(W * 0.8 - kick, H * 0.64 + kick);
    ctx.lineTo(W * 0.92, H);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2d2f33";
    ctx.fillRect(W * 0.7 - kick, H * 0.6 + kick, 46, 12);
    if (flash > 0) {
      ctx.fillStyle = "rgba(255,200,90,0.9)";
      ctx.beginPath();
      ctx.arc(W * 0.69 - kick, H * 0.61 + kick, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    // crosshair
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    [[-14, 0, -5, 0], [5, 0, 14, 0], [0, -14, 0, -5], [0, 5, 0, 14]].forEach(([a, b, c2, d]) => {
      ctx.beginPath();
      ctx.moveTo(W / 2 + a, H / 2 + b);
      ctx.lineTo(W / 2 + c2, H / 2 + d);
      ctx.stroke();
    });
    // HUD: minimap, ammo, health, kill feed
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.arc(46, 46, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#F15A24";
    ctx.beginPath();
    ctx.arc(46, 46, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e5484d";
    enemies.forEach((e) => ctx.fillRect(46 + (e.x - W / 2) / 12, 30 + (e.y - 150) / 6, 4, 4));
    ctx.fillStyle = "#fff";
    ctx.font = "800 22px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${ammo}`, W - 60, H - 18);
    ctx.font = "600 13px sans-serif";
    ctx.fillStyle = "#c9c9c9";
    ctx.fillText("/ 90", W - 18, H - 18);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(16, H - 28, 120, 10);
    ctx.fillStyle = "#7ee787";
    ctx.fillRect(16, H - 28, 96, 10);
    ctx.font = "700 12px sans-serif";
    feed.forEach((line, i) => {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(W - 170, 12 + i * 20, 158, 17);
      ctx.fillStyle = "#fff";
      ctx.fillText(line, W - 164, 25 + i * 20);
    });
  };

  const step = (dt) => {
    time += dt;
    flash = Math.max(0, flash - dt);
    enemies.forEach((e) => {
      e.x += e.v * dt;
      if (e.x < 60 || e.x > 460) e.v *= -1;
    });
    if (Math.random() < dt * 2.2) {
      flash = 0.06;
      ammo = ammo > 1 ? ammo - 1 : 30;
    }
    if (Math.random() < dt * 0.35) {
      kills += 1;
      feed.unshift(`ovie  >  enemy_${(kills * 37) % 99}`);
      if (feed.length > 3) feed.pop();
    }
  };

  draw();
  return {
    texture,
    canvas,
    update(dt) {
      acc += dt;
      if (acc < 0.05) return;
      step(acc);
      acc = 0;
      draw();
      texture.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Streaming dashboard on the vertical monitor: live preview, viewer count, chat, alerts.
// ---------------------------------------------------------------------------------------------
export function createStream(previewCanvas) {
  const W = 256;
  const H = 448;
  const { ctx, t: texture } = mk(W, H);
  let time = 0;
  let acc = 0;
  const users = [["kofi_plays", "#F15A24"], ["ada.dev", "#9fd3ff"], ["tunde7", "#7ee787"], ["mira", "#ffd166"], ["j_codes", "#d2a8ff"], ["sam_red", "#ff7b72"]];
  const lines = ["W stream", "that flick was clean", "ranked grind", "lets goooo", "gg", "ovie cooking fr", "what sens?", "hi from lagos", "clip that", "SIUUU"];
  const chat = [];
  let alert = 0;

  const draw = () => {
    ctx.fillStyle = "#0e0e10";
    ctx.fillRect(0, 0, W, H);
    // header
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, W, 34);
    ctx.fillStyle = "#e5252a";
    ctx.fillRect(10, 9, 44, 16);
    ctx.fillStyle = "#fff";
    ctx.font = "800 11px sans-serif";
    ctx.fillText("LIVE", 18, 21);
    ctx.font = "600 11px sans-serif";
    ctx.fillStyle = "#cfcfcf";
    ctx.fillText(`${(1.2 + Math.sin(time * 0.2) * 0.08).toFixed(1)}k watching`, 62, 21);
    // preview of the game
    if (previewCanvas) ctx.drawImage(previewCanvas, 8, 42, W - 16, (W - 16) * (288 / 512));
    const py = 42 + (W - 16) * (288 / 512);
    ctx.fillStyle = "#fff";
    ctx.font = "700 12px sans-serif";
    ctx.fillText("ranked grind, chill vibes", 10, py + 20);
    ctx.fillStyle = "#F15A24";
    ctx.font = "600 10px sans-serif";
    ctx.fillText("Shooter  ·  English", 10, py + 36);
    // follower alert
    if (alert > 0) {
      ctx.fillStyle = "rgba(241,90,36,0.92)";
      ctx.fillRect(8, py + 46, W - 16, 26);
      ctx.fillStyle = "#fff";
      ctx.font = "800 11px sans-serif";
      ctx.fillText("New follower!  Thanks for the love", 16, py + 63);
    }
    // chat
    const cy = py + 82;
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, cy, W, H - cy);
    ctx.font = "600 11px sans-serif";
    chat.slice(-12).forEach((m, i) => {
      const y = cy + 18 + i * 17;
      if (y > H - 6) return;
      ctx.fillStyle = m[1];
      ctx.fillText(m[0], 10, y);
      ctx.fillStyle = "#d4d4d8";
      ctx.fillText(m[2], 14 + ctx.measureText(m[0]).width, y);
    });
  };

  draw();
  return {
    texture,
    update(dt) {
      time += dt;
      alert = Math.max(0, alert - dt);
      acc += dt;
      if (acc < 0.08) return;
      if (Math.random() < acc * 1.6) {
        const u = users[Math.floor(Math.random() * users.length)];
        chat.push([u[0], u[1], ": " + lines[Math.floor(Math.random() * lines.length)]]);
        if (chat.length > 30) chat.shift();
      }
      if (Math.random() < acc * 0.08) alert = 2.5;
      acc = 0;
      draw();
      texture.needsUpdate = true;
    },
  };
}
