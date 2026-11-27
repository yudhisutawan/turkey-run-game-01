// Gobble Dash — sound: every effect is synthesised with WebAudio,
// so the game ships no audio files and makes no network request.
export function createSoundBank() {
  let ctx = null;
  let muted = false;
  let musicTimer = 0;

  function ensureContext() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (_e) { ctx = null; }
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const ac = ensureContext();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
      gain.gain.setValueAtTime(vol || 0.12, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.connect(gain); gain.connect(ac.destination);
      osc.start(); osc.stop(ac.currentTime + dur);
    } catch (_e) { /* audio is decoration, never fatal */ }
  }

  function gobble() {
    // A comic two-note gobble: low blip, quick higher blip.
    tone(180, 0.09, 'square', 0.10, 120);
    setTimeout(() => tone(260, 0.08, 'square', 0.09, 170), 90);
  }

  const bank = {
    unlock() { ensureContext(); if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    jump() { tone(320, 0.16, 'sine', 0.12, 640); },
    dash() { tone(220, 0.22, 'sawtooth', 0.07, 880); },
    pickup() { tone(880, 0.09, 'sine', 0.11); setTimeout(() => tone(1320, 0.1, 'sine', 0.10), 70); },
    golden() { tone(660, 0.1, 'triangle', 0.12); setTimeout(() => tone(990, 0.12, 'triangle', 0.12), 80); setTimeout(() => tone(1320, 0.16, 'triangle', 0.12), 160); },
    hit() { tone(140, 0.3, 'sawtooth', 0.16, 60); },
    throwCorn() { tone(500, 0.1, 'sine', 0.09, 900); },
    farmerDistracted() { tone(440, 0.12, 'triangle', 0.09); setTimeout(() => tone(330, 0.14, 'triangle', 0.09), 110); },
    hide() { tone(300, 0.2, 'sine', 0.08, 180); },
    stageClear() { [523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, 0.16, 'triangle', 0.12), i * 110)); },
    caught() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sawtooth', 0.12), i * 160)); },
    escaped() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.13), i * 120)); },
    click() { tone(700, 0.05, 'square', 0.06); },
    // A light banjo-ish pluck that wanders while running; called from the loop.
    musicTick(dt, running) {
      if (!running || muted) return;
      musicTimer -= dt;
      if (musicTimer <= 0) {
        musicTimer = 0.42 + Math.random() * 0.25;
        const notes = [392, 440, 523, 587, 659];
        tone(notes[Math.floor(Math.random() * notes.length)], 0.18, 'triangle', 0.035);
        if (Math.random() < 0.3) gobble();
      }
    },
  };
  return bank;
}
