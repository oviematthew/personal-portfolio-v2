// Tiny synthesized soundscapes (no audio files): a football crowd with whistles and cheers,
// and a lo-fi record for the turntable. Everything is generated with the Web Audio API and only
// starts after a click, so nothing plays on page load.

export function createAudio() {
  let ctx = null;
  let master = null;
  let current = null; // { kind, stop }
  let muted = false;

  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.8;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const noiseBuffer = (seconds = 2) => {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  };

  const loopNoise = () => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(3);
    src.loop = true;
    return src;
  };

  // ---- football crowd ------------------------------------------------------
  const crowd = () => {
    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(master);
    out.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);

    const murmur = loopNoise();
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 650;
    band.Q.value = 0.6;
    const murmurGain = ctx.createGain();
    murmurGain.gain.value = 0.09;
    murmur.connect(band).connect(murmurGain).connect(out);

    // slow swell so the crowd breathes
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.13;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain).connect(murmurGain.gain);

    const roar = loopNoise();
    const roarBand = ctx.createBiquadFilter();
    roarBand.type = "bandpass";
    roarBand.frequency.value = 900;
    roarBand.Q.value = 0.8;
    const roarGain = ctx.createGain();
    roarGain.gain.value = 0;
    roar.connect(roarBand).connect(roarGain).connect(out);

    murmur.start();
    roar.start();
    lfo.start();

    const whistle = (blasts = 1) => {
      const t0 = ctx.currentTime + 0.05;
      for (let i = 0; i < blasts; i++) {
        const t = t0 + i * 0.45;
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = 2650;
        const vib = ctx.createOscillator();
        vib.frequency.value = 32;
        const vibGain = ctx.createGain();
        vibGain.gain.value = 70;
        vib.connect(vibGain).connect(o.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.02);
        g.gain.setValueAtTime(0.06, t + (i === blasts - 1 ? 0.55 : 0.25));
        g.gain.linearRampToValueAtTime(0, t + (i === blasts - 1 ? 0.65 : 0.3));
        o.connect(g).connect(out);
        o.start(t);
        vib.start(t);
        o.stop(t + 0.7);
        vib.stop(t + 0.7);
      }
    };

    const cheer = (big = false) => {
      const t = ctx.currentTime;
      roarGain.gain.cancelScheduledValues(t);
      roarGain.gain.setValueAtTime(roarGain.gain.value, t);
      roarGain.gain.linearRampToValueAtTime(big ? 0.32 : 0.14, t + 0.5);
      roarGain.gain.linearRampToValueAtTime(big ? 0.18 : 0.06, t + (big ? 2.5 : 1.4));
      roarGain.gain.linearRampToValueAtTime(0, t + (big ? 5 : 2.6));
      roarBand.frequency.setValueAtTime(800, t);
      roarBand.frequency.linearRampToValueAtTime(big ? 1400 : 1050, t + 0.6);
      roarBand.frequency.linearRampToValueAtTime(850, t + 3);
    };

    whistle(1);
    const ambient = setInterval(() => Math.random() < 0.5 && cheer(false), 6000);

    return {
      kind: "football",
      goal() {
        cheer(true);
      },
      whistle,
      stop() {
        clearInterval(ambient);
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.linearRampToValueAtTime(0, t + 0.6);
        setTimeout(() => {
          [murmur, roar, lfo].forEach((n) => n.stop());
          out.disconnect();
        }, 700);
      },
    };
  };

  // ---- lo-fi record ----------------------------------------------------------
  const record = () => {
    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(master);
    out.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);

    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 1600;
    tone.connect(out);

    // vinyl crackle
    const crackleBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const cd = crackleBuf.getChannelData(0);
    for (let i = 0; i < cd.length; i++) cd[i] = Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.012;
    const crackle = ctx.createBufferSource();
    crackle.buffer = crackleBuf;
    crackle.loop = true;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.35;
    crackle.connect(crackleGain).connect(out);
    crackle.start();

    const bpm = 76;
    const beat = 60 / bpm;
    const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
    // Fmaj7, Em7, Dm7, Cmaj7
    const chords = [
      [53, 57, 60, 64],
      [52, 55, 59, 62],
      [50, 53, 57, 60],
      [48, 52, 55, 59],
    ];

    const pad = (notes, t, dur) => {
      notes.forEach((n, i) => {
        const o = ctx.createOscillator();
        o.type = i === 0 ? "sine" : "triangle";
        o.frequency.value = midi(n + 12);
        o.detune.value = (Math.random() - 0.5) * 12;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.035, t + 0.25);
        g.gain.setValueAtTime(0.035, t + dur - 0.4);
        g.gain.linearRampToValueAtTime(0, t + dur);
        o.connect(g).connect(tone);
        o.start(t);
        o.stop(t + dur + 0.05);
      });
      const b = ctx.createOscillator();
      b.type = "sine";
      b.frequency.value = midi(notes[0] - 12);
      const bg = ctx.createGain();
      bg.gain.setValueAtTime(0, t);
      bg.gain.linearRampToValueAtTime(0.09, t + 0.05);
      bg.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.8);
      b.connect(bg).connect(tone);
      b.start(t);
      b.stop(t + beat * 2);
    };

    const kick = (t) => {
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.3);
    };

    const hatBuf = noiseBuffer(0.1);
    const hat = (t, v = 0.03) => {
      const s = ctx.createBufferSource();
      s.buffer = hatBuf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      s.connect(hp).connect(g).connect(out);
      s.start(t);
      s.stop(t + 0.08);
    };

    let bar = 0;
    let nextBar = ctx.currentTime + 0.1;
    const schedule = () => {
      while (nextBar < ctx.currentTime + 1.2) {
        const t = nextBar;
        pad(chords[bar % chords.length], t, beat * 4);
        for (let b = 0; b < 4; b++) {
          if (b % 2 === 0) kick(t + b * beat + (b === 2 ? beat * 0.25 : 0));
          hat(t + b * beat + beat * 0.5, 0.025);
          hat(t + b * beat, 0.012);
        }
        bar += 1;
        nextBar += beat * 4;
      }
    };
    schedule();
    const timer = setInterval(schedule, 250);

    return {
      kind: "music",
      stop() {
        clearInterval(timer);
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.linearRampToValueAtTime(0, t + 0.8);
        setTimeout(() => {
          crackle.stop();
          out.disconnect();
        }, 900);
      },
    };
  };

  // ---- afrobeats groove for the soundbar -------------------------------------
  // 104 bpm, syncopated kick, rim on 2 and 4, rolling shakers, a 3-3-2 bell, bass and off-beat keys.
  const afro = () => {
    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(master);
    out.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.8);
    const bus = ctx.createBiquadFilter();
    bus.type = "lowpass";
    bus.frequency.value = 5200;
    bus.connect(out);

    const bpm = 104;
    const step = 60 / bpm / 4; // 16th note
    const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
    const noise = noiseBuffer(0.2);

    const kick = (t, v = 0.32) => {
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(48, t + 0.16);
      const g = ctx.createGain();
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + 0.3);
    };
    const hit = (t, freq, q, v, dur) => {
      const s2 = ctx.createBufferSource();
      s2.buffer = noise;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      s2.connect(f).connect(g).connect(bus);
      s2.start(t);
      s2.stop(t + dur + 0.02);
    };
    const tone = (t, freq, type, v, dur, attack = 0.005) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + attack);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + dur + 0.02);
    };

    // Am7, Dm7, G, Cmaj7 (one bar each)
    const chords = [
      [57, 60, 64, 67],
      [50, 57, 60, 65],
      [55, 59, 62, 67],
      [48, 55, 59, 64],
    ];
    const bassLines = [
      [45, null, null, 45, null, null, 52, null, null, null, 45, null, 48, null, 50, null],
      [38, null, null, 38, null, null, 45, null, null, null, 38, null, 41, null, 43, null],
      [43, null, null, 43, null, null, 50, null, null, null, 43, null, 47, null, 50, null],
      [36, null, null, 36, null, null, 43, null, null, null, 36, null, 40, null, 43, null],
    ];
    const KICK = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0];
    const BELL = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0]; // 3-3-2 feel
    const KEYS = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]; // off-beat stabs

    let n = 0;
    let next = ctx.currentTime + 0.1;
    const schedule = () => {
      while (next < ctx.currentTime + 0.4) {
        const i = n % 16;
        const bar = Math.floor(n / 16) % 4;
        const t = next;
        const swing = i % 2 ? step * 0.12 : 0;
        if (KICK[i]) kick(t);
        if (i === 4 || i === 12) hit(t, 1800, 2.5, 0.22, 0.09); // rim
        hit(t + swing, 7500, 1, i % 4 === 2 ? 0.06 : 0.03, 0.04); // shaker
        if (BELL[i]) tone(t, 1250, "triangle", 0.035, 0.12);
        const b = bassLines[bar][i];
        if (b) tone(t, midi(b), "sine", 0.2, step * 2.6, 0.01);
        if (KEYS[i]) chords[bar].forEach((c) => tone(t + swing, midi(c), "triangle", 0.03, step * 1.5));
        if (i === 0 && bar === 0) chords[bar].forEach((c) => tone(t, midi(c + 12), "sine", 0.012, step * 16, 0.4)); // pad swell
        n += 1;
        next += step;
      }
    };
    schedule();
    const timer = setInterval(schedule, 100);
    return {
      kind: "afro",
      stop() {
        clearInterval(timer);
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.linearRampToValueAtTime(0, t + 0.6);
        setTimeout(() => out.disconnect(), 800);
      },
    };
  };

  return {
    play(kind) {
      if (!ensure()) return null;
      if (current?.kind === kind) return current;
      current?.stop();
      current = kind === "football" ? crowd() : kind === "music" ? record() : kind === "afro" ? afro() : null;
      return current;
    },
    stop(kind) {
      if (!current || (kind && current.kind !== kind)) return;
      current.stop();
      current = null;
    },
    goal() {
      if (current?.kind === "football") current.goal();
    },
    whistle(n) {
      if (current?.kind === "football") current.whistle(n);
    },
    get kind() {
      return current?.kind ?? null;
    },
    setMuted(m) {
      muted = m;
      if (master) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.05);
    },
    suspend() {
      if (ctx && ctx.state === "running") ctx.suspend();
    },
    resume() {
      if (ctx && ctx.state === "suspended" && current) ctx.resume();
    },
    dispose() {
      current?.stop();
      current = null;
      setTimeout(() => ctx?.close(), 1000);
    },
  };
}
