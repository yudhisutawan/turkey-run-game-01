// Gobble Dash — main: game loop, state machine (title / playing /
// paused / ended), spawning, collisions, scoring and the farmer gap.
// The turkey escapes becoming Thanksgiving dinner: outrun the farmer
// across the farmyard, the porch and the kitchen, dodge the oven and
// the carving knife, and reach the woods at 1000 m.
import { CANVAS_W, CANVAS_H, LANES, ESCAPE_DISTANCE, START_LIVES, START_GAP, MAX_STAMINA, STAGES, TUNING, makeRng } from './config.js';
import { createSoundBank } from './audio.js';
import { createInput } from './input.js';
import { createTurkey, turkeyY, turkeyJump, turkeyDash, turkeyHide, updateTurkey, drawTurkey } from './turkey.js';
import { createFarmer, farmerUpdate, farmerDistract, drawFarmer } from './farmer.js';
import { makeObstacle, makeCorn, makeHaystack, updateHazards, drawCorn, drawHaystack, drawObstacle, obstacleHitsTurkey, cornHitsTurkey, turkeyNearHaystack } from './hazards.js';
import { createWorld, drawWorld } from './world.js';
import { drawHud, drawTitle, drawEnd, drawPaused } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '7');
const rng = makeRng(seed);

const sounds = createSoundBank();
const input = createInput(canvas);
const world = createWorld(seed);

function loadBest() {
  try { return Number(window.localStorage.getItem('gobbleDashBest') || 0) || 0; } catch (_e) { return 0; }
}
function saveBest(v) {
  try { window.localStorage.setItem('gobbleDashBest', String(v)); } catch (_e) { /* best score is decoration */ }
}

function createRun() {
  return {
    time: 0,
    distance: 0,
    score: 0,
    corn: 0,
    lives: START_LIVES,
    gap: START_GAP,
    stamina: MAX_STAMINA,
    stage: 0,
    banner: 0,
    throws: 0,
    throwCooldown: 0,
    nextSpawnAt: 260,
    nextCornAt: 140,
    nextHayAt: 420,
    turkey: createTurkey(),
    farmer: createFarmer(),
    obstacles: [],
    corns: [],
    haystacks: [],
    projectiles: [],
    result: null,
  };
}

const G = {
  mode: 'title', // title | playing | paused | ended
  time: 0,
  best: loadBest(),
  run: createRun(),
};

// Test / debug hook (also lets the end screen show live numbers).
window.__gobble = G;

function startRun() {
  G.run = createRun();
  G.mode = 'playing';
  sounds.unlock();
  sounds.click();
}

function endRun(result) {
  const run = G.run;
  run.result = result;
  G.mode = 'ended';
  if (result === 'escaped') sounds.escaped(); else sounds.caught();
  if (run.score > G.best) { G.best = Math.floor(run.score); saveBest(G.best); }
}

function speedOf(run) {
  const base = TUNING.baseSpeed + run.stage * TUNING.speedPerStage + run.distance * TUNING.speedPerMetre;
  return run.turkey.dashing > 0 ? TUNING.dashSpeed : base;
}

function spawnAhead(run) {
  const stage = STAGES[run.stage];
  // One obstacle per spawn so a lane is always open.
  const kinds = ['hay', 'pin'];
  if (stage.knives) kinds.push('knife', 'knife');
  if (stage.ovens) kinds.push('oven');
  const kind = kinds[Math.floor(rng() * kinds.length)];
  const lane = Math.floor(rng() * 3);
  run.obstacles.push(makeObstacle(kind, lane, CANVAS_W + 80, rng));
  run.nextSpawnAt = run.distance + stage.obstacleEvery[0] + rng() * (stage.obstacleEvery[1] - stage.obstacleEvery[0]);
}

function spawnCornLine(run) {
  const lane = Math.floor(rng() * 3);
  const golden = rng() < 0.2;
  for (let i = 0; i < 3; i++) run.corns.push(makeCorn(lane, CANVAS_W + 60 + i * 44, golden && i === 1));
  run.nextCornAt = run.distance + 180 + rng() * 160;
}

function throwCorn(run) {
  if (run.throwCooldown > 0 || run.turkey.hidden > 0) return;
  run.throwCooldown = 1.2;
  run.throws += 1;
  run.projectiles.push({ x: run.turkey.x + 30, y: turkeyY(run.turkey) - 10, vx: -520, vy: -40 });
  sounds.throwCorn();
}

function hurtTurkey(run, why) {
  const t = run.turkey;
  if (t.invulnerable > 0 || t.dashing > 0 || t.hidden > 0) return;
  run.lives -= 1;
  run.gap = Math.max(0, run.gap - TUNING.gapHitPenalty);
  t.invulnerable = TUNING.invulnerableTime;
  sounds.hit();
  if (run.lives <= 0) endRun('caught');
  void why;
}

function update(dt) {
  const run = G.run;
  run.time += dt;
  G.time += dt;
  if (run.banner > 0) run.banner -= dt;
  if (run.throwCooldown > 0) run.throwCooldown -= dt;

  const speed = speedOf(run);
  const t = run.turkey;
  updateTurkey(t, dt, true);
  farmerUpdate(run.farmer, dt, { gap: run.gap, turkeyLane: t.lane }, t.hidden > 0);

  // Distance, score and the farmer gap.
  run.distance += (speed * dt) / 14;
  run.score += (speed * dt) / 14 * TUNING.metreScore;
  run.gap -= TUNING.gapDecayPerSecond * dt;
  if (t.dashing > 0) run.gap = Math.min(100, run.gap + 8 * dt);
  if (t.hidden > 0) run.gap = Math.min(100, run.gap + TUNING.gapHideRecover * dt * 0.5);
  if (run.stamina < MAX_STAMINA) run.stamina = Math.min(MAX_STAMINA, run.stamina + TUNING.staminaRegen * dt);
  if (run.gap <= 0) { endRun('caught'); return; }

  // Stage progression: farmyard -> porch -> kitchen -> woods.
  const stageAt = run.distance < 350 ? 0 : run.distance < 700 ? 1 : 2;
  if (stageAt !== run.stage) {
    run.stage = stageAt;
    run.banner = 2.5;
    run.score += TUNING.stageBonus;
    sounds.stageClear();
  }
  if (run.distance >= ESCAPE_DISTANCE) { run.distance = ESCAPE_DISTANCE; endRun('escaped'); return; }

  // Spawning.
  if (run.distance >= run.nextSpawnAt) spawnAhead(run);
  if (run.distance >= run.nextCornAt) spawnCornLine(run);
  if (run.distance >= run.nextHayAt) {
    run.haystacks.push(makeHaystack(Math.floor(rng() * 3), CANVAS_W + 60));
    run.nextHayAt = run.distance + 380 + rng() * 220;
  }

  // Move everything with the world.
  run.obstacles = updateHazards(run.obstacles, dt, speed);
  run.corns = run.corns.filter((c) => { c.x -= speed * dt; return c.x > -40 && !c.taken; });
  run.haystacks = run.haystacks.filter((h) => { h.x -= speed * dt; return h.x > -140; });

  // Thrown corn flies back at the farmer.
  for (const p of run.projectiles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; }
  run.projectiles = run.projectiles.filter((p) => {
    if (p.x <= run.farmer.x + 30 && Math.abs(p.y - LANES[run.farmer.lane]) < 60) {
      farmerDistract(run.farmer, sounds);
      run.gap = Math.min(100, run.gap + TUNING.gapCornThrow);
      return false;
    }
    return p.x > -40;
  });

  // Collisions.
  const ty = turkeyY(t);
  for (const o of run.obstacles) {
    if (!o.passed && o.x < t.x - 40) { o.passed = true; }
    if (obstacleHitsTurkey(o, t.x, ty, t.jumping)) hurtTurkey(run, o.kind);
  }
  for (const c of run.corns) {
    if (!c.taken && cornHitsTurkey(c, t.x, ty)) {
      c.taken = true;
      run.corn += 1;
      run.score += c.golden ? TUNING.goldenCornScore : TUNING.cornScore;
      if (c.golden) sounds.golden(); else sounds.pickup();
    }
  }

  sounds.musicTick(dt, true);
}

function handleInput() {
  const pressed = input.drainPressed();
  const click = input.takeClick();
  if (G.mode === 'title') {
    if (pressed.includes('Enter') || pressed.includes(' ') || click) startRun();
    return;
  }
  if (G.mode === 'ended') {
    if (pressed.includes('r') || pressed.includes('R') || pressed.includes('Enter') || click) startRun();
    return;
  }
  if (G.mode === 'paused') {
    if (pressed.includes('p') || pressed.includes('P') || pressed.includes('Enter')) G.mode = 'playing';
    return;
  }
  // Playing.
  const run = G.run;
  const t = run.turkey;
  for (const k of pressed) {
    if (k === 'ArrowUp' || k === 'w' || k === 'W') { if (t.lane > 0) { t.lane -= 1; run.farmer.lane = t.lane; } }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') {
      const hay = turkeyNearHaystack(run.haystacks, t.x, t.lane);
      if (hay) { if (turkeyHide(t, true, sounds)) hay.used = true; }
      else if (t.lane < 2) { t.lane += 1; run.farmer.lane = t.lane; }
    } else if (k === 'Shift') turkeyDash(t, run, sounds);
    else if (k === 'f' || k === 'F') throwCorn(run);
    else if (k === 'p' || k === 'P') G.mode = 'paused';
    else if (k === 'm' || k === 'M') sounds.toggleMute();
  }
  if (pressed.includes(' ')) turkeyJump(t, sounds);
  if (click) turkeyDash(t, run, sounds);
}

function render(dt) {
  const run = G.run;
  if (G.mode === 'title') { drawTitle(ctx, G.best); return; }
  if (G.mode === 'ended') { drawEnd(ctx, run); return; }
  const speed = G.mode === 'playing' ? speedOf(run) : 0;
  drawWorld(ctx, world, run.stage, dt, speed, run.time);
  for (const h of run.haystacks) drawHaystack(ctx, h);
  for (const c of run.corns) drawCorn(ctx, c, run.time);
  for (const o of run.obstacles) drawObstacle(ctx, o, run.time);
  for (const p of run.projectiles) {
    ctx.fillStyle = '#e8a13c';
    ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill();
  }
  drawFarmer(ctx, run.farmer, { gap: run.gap, turkeyLane: run.turkey.lane }, run.time);
  drawTurkey(ctx, run.turkey, run.time);
  drawHud(ctx, run);
  if (G.mode === 'paused') drawPaused(ctx);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  handleInput();
  if (G.mode === 'playing') update(dt);
  render(dt);
  requestAnimationFrame(frame);
}

if (shot) {
  // Deterministic screenshot pose: one frame, no loop.
  applyShot(G, shot);
  G.run.time = 1.2;
  G.time = 1.2;
  render(0);
} else {
  requestAnimationFrame(frame);
}
