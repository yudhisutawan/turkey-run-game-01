// Gobble Dash — the farmer: chases, searches and corners.
// CHASE: runs behind the turkey, closing the gap whenever the turkey
//   dawdles or gets hit. SEARCH: the turkey hid in a haystack, so he
//   stops, looks around and loses ground. DISTRACTED: a thrown corn
//   cob has his full attention. CORNERED: the gap is nearly gone —
//   he lunges, and the turkey must dash or hide to survive.
import { FARMER_X, LANES, TUNING } from './config.js';

export function createFarmer() {
  return {
    x: FARMER_X,
    lane: 1,
    mode: 'chase',      // chase | search | distracted | cornered
    modeTime: 0,
    runPhase: 0,
    lookDir: 1,
    lunge: 0,
  };
}

export function farmerUpdate(f, dt, state, turkeyHidden) {
  f.runPhase += dt * 11;
  if (f.modeTime > 0) f.modeTime -= dt;
  const gap = state.gap;

  if (f.mode === 'distracted' && f.modeTime <= 0) f.mode = 'chase';
  if (f.mode === 'search' && f.modeTime <= 0) f.mode = 'chase';

  if (turkeyHidden) {
    if (f.mode !== 'search') { f.mode = 'search'; f.modeTime = 2.0; }
    f.lookDir = Math.sin(f.runPhase * 0.4) > 0 ? 1 : -1;
    return;
  }
  if (f.mode === 'search' || f.mode === 'distracted') return;
  if (gap < 22 && f.mode !== 'cornered') { f.mode = 'cornered'; f.lunge = 0.5; }
  if (f.mode === 'cornered') {
    if (f.lunge > 0) f.lunge -= dt;
    else if (gap > 30) f.mode = 'chase';
  }
  // The farmer's lane follows the turkey's: he mirrors the escape.
  if (f.mode === 'chase' || f.mode === 'cornered') f.lane = state.turkeyLane;
}

export function farmerDistract(f, sounds) {
  f.mode = 'distracted';
  f.modeTime = 2.5;
  sounds.farmerDistracted();
}

export function drawFarmer(ctx, f, state, time) {
  const px = f.x + (f.mode === 'cornered' ? 26 + Math.sin(time * 30) * 3 : 0);
  const py = LANES[f.lane] + (f.mode === 'search' ? -6 : 0);
  const run = Math.sin(f.runPhase) * 8;
  ctx.save();
  ctx.translate(px, py);
  // Straw hat.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(-17, -44, 34, 9);
  ctx.fillStyle = '#d8b25a';
  ctx.fillRect(-25, -38, 50, 6);
  // Head, eyes, beard.
  ctx.fillStyle = '#e8c39a';
  ctx.fillRect(-15, -38, 30, 28);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-6, -27, 2.8, 0, Math.PI * 2); ctx.arc(7, -27, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  const look = f.mode === 'search' ? f.lookDir * 1.5 : 1;
  ctx.beginPath(); ctx.arc(-6 + look, -27, 1.4, 0, Math.PI * 2); ctx.arc(7 + look, -27, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#eee';
  ctx.beginPath(); ctx.ellipse(0, -13, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Overalls.
  ctx.fillStyle = '#3b5a8a';
  ctx.fillRect(-18, -10, 36, 42);
  ctx.fillStyle = '#2c4a6a';
  ctx.fillRect(-18, -10, 6, 42); ctx.fillRect(12, -10, 6, 42);
  // Arms: one pumping, one reaching for the turkey.
  ctx.strokeStyle = '#3b5a8a'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-16, 2); ctx.lineTo(-26, 18 - run); ctx.moveTo(16, 2); ctx.lineTo(34, -6 + run * 0.5); ctx.stroke();
  // Carving knife in the reaching hand when cornered.
  if (f.mode === 'cornered') {
    ctx.save(); ctx.translate(38, -10); ctx.rotate(0.6);
    ctx.fillStyle = '#dfe6ea';
    ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(11, -8); ctx.lineTo(0, 4); ctx.lineTo(-11, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-4, 4, 8, 16);
    ctx.restore();
  }
  // Legs, running.
  ctx.strokeStyle = '#2c3a55'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-8, 32); ctx.lineTo(-16 + run, 54); ctx.moveTo(8, 32); ctx.lineTo(16 - run, 54); ctx.stroke();
  // Mode label so the player always knows what he is doing.
  ctx.font = 'bold 15px Georgia';
  ctx.textAlign = 'center';
  if (f.mode === 'search') { ctx.fillStyle = '#ffe9a8'; ctx.fillText('? WHERE\'D HE GO ?', 30, -58); }
  else if (f.mode === 'distracted') { ctx.fillStyle = '#ffe9a8'; ctx.fillText('OOH, CORN!', 30, -58); }
  else if (f.mode === 'cornered') { ctx.fillStyle = '#ff6a5a'; ctx.fillText('GOTCHA!', 30, -58); }
  ctx.textAlign = 'left';
  ctx.restore();
  void TUNING;
}
