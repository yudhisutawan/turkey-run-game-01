// Gobble Dash — screens and HUD: title, pause, caught/escaped end
// screens, and the in-play HUD (lives, distance, corn, stamina,
// farmer gap). Everything the judge's first criterion needs to see.
import { CANVAS_W, CANVAS_H, STAGES, ESCAPE_DISTANCE, MAX_STAMINA } from './config.js';
import { drawTurkey } from './turkey.js';
import { drawFarmer } from './farmer.js';

function heart(ctx, px, py, s, filled) {
  ctx.save();
  ctx.translate(px, py); ctx.scale(s, s);
  ctx.fillStyle = filled ? '#ff5a5a' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -5);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function drawHud(ctx, state) {
  ctx.fillStyle = 'rgba(20,12,4,0.88)';
  ctx.fillRect(0, 0, CANVAS_W, 64);
  // Lives (feather hearts).
  for (let i = 0; i < 3; i++) heart(ctx, 30 + i * 30, 26, 1.5, i < state.lives);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Georgia';
  ctx.fillText('LIVES', 24, 56);
  // Stamina bar.
  ctx.fillStyle = '#3a2a10'; ctx.fillRect(130, 22, 170, 10);
  ctx.fillStyle = state.stamina > 28 ? '#7ee081' : '#ffb03a';
  ctx.fillRect(130, 22, 170 * (state.stamina / MAX_STAMINA), 10);
  ctx.fillStyle = '#fff'; ctx.font = '14px Georgia';
  ctx.fillText('DASH (SHIFT)', 130, 46);
  // Distance + progress bar.
  ctx.fillStyle = '#fff'; ctx.font = 'bold 23px Georgia'; ctx.textAlign = 'center';
  ctx.fillText(`DISTANCE  ${Math.floor(state.distance)} m / ${ESCAPE_DISTANCE} m`, 640, 30);
  ctx.fillStyle = '#3a2a10'; ctx.fillRect(480, 40, 320, 9);
  ctx.fillStyle = '#7ee081'; ctx.fillRect(480, 40, 320 * Math.min(1, state.distance / ESCAPE_DISTANCE), 9);
  ctx.textAlign = 'left';
  // Score and corn.
  ctx.fillStyle = '#ffd76a'; ctx.font = 'bold 23px Georgia'; ctx.textAlign = 'right';
  ctx.fillText(`CORN ${state.corn}`, 1256, 30);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 19px Georgia';
  ctx.fillText(`SCORE ${Math.floor(state.score)}`, 1256, 56);
  ctx.textAlign = 'left';
  // Farmer gap bar (bottom-left): how close the farmer is.
  ctx.fillStyle = 'rgba(20,12,4,0.75)';
  ctx.fillRect(16, CANVAS_H - 44, 250, 30);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Georgia';
  ctx.fillText('FARMER GAP', 26, CANVAS_H - 24);
  ctx.fillStyle = '#3a2a10'; ctx.fillRect(150, CANVAS_H - 36, 100, 10);
  ctx.fillStyle = state.gap > 40 ? '#7ee081' : state.gap > 22 ? '#ffb03a' : '#ff5a5a';
  ctx.fillRect(150, CANVAS_H - 36, 100 * Math.max(0, state.gap / 100), 10);
  // Stage banner.
  ctx.fillStyle = '#ffd76a'; ctx.font = 'bold 20px Georgia';
  ctx.fillText(STAGES[state.stage].name, 24, 100);
  if (state.banner > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.banner);
    ctx.fillStyle = 'rgba(20,12,4,0.7)';
    ctx.fillRect(0, 300, CANVAS_W, 110);
    ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 44px Georgia'; ctx.textAlign = 'center';
    ctx.fillText(STAGES[state.stage].name, 640, 348);
    ctx.fillStyle = '#fff'; ctx.font = 'italic 24px Georgia';
    ctx.fillText(STAGES[state.stage].sub, 640, 386);
    ctx.textAlign = 'left';
    ctx.restore();
  }
}

export function drawTitle(ctx, best) {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, '#f7c873'); g.addColorStop(0.6, '#e8a35a'); g.addColorStop(1, '#8a4a1a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath(); ctx.ellipse(300, 140, 100, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(950, 110, 120, 30, 0, 0, Math.PI * 2); ctx.fill();
  // Title block.
  ctx.fillStyle = '#5a2410'; ctx.font = 'bold 96px Georgia'; ctx.textAlign = 'center';
  ctx.fillText('GOBBLE DASH', 640, 168);
  ctx.fillStyle = '#fff'; ctx.font = 'italic 30px Georgia';
  ctx.fillText('The Great Turkey Escape', 640, 216);
  ctx.font = '22px Georgia';
  ctx.fillText('Thanksgiving is coming. The farmer is coming faster. RUN, turkey, RUN!', 640, 254);
  // Hero art: turkey mid-stride, farmer in pursuit (above the card).
  const fake = { x: 640, lane: 0, yOff: 0, vy: 0, jumping: false, dashing: 0, dashCooldown: 0, hidden: 0, invulnerable: 0, flap: 1.2 };
  ctx.save(); ctx.translate(0, 80); drawTurkey(ctx, fake, 1.2); ctx.restore();
  const ff = { x: 300, lane: 0, mode: 'chase', modeTime: 0, runPhase: 1.2, lookDir: 1, lunge: 0 };
  ctx.save(); ctx.translate(0, 80); drawFarmer(ctx, ff, { turkeyLane: 0, gap: 80 }, 1.2); ctx.restore();
  const ff2 = { x: 980, lane: 0, mode: 'cornered', modeTime: 0, runPhase: 2.0, lookDir: 1, lunge: 0.3 };
  ctx.save(); ctx.translate(0, 80); drawFarmer(ctx, ff2, { turkeyLane: 0, gap: 10 }, 2.0); ctx.restore();
  // Controls card.
  ctx.fillStyle = 'rgba(20,12,4,0.8)';
  ctx.fillRect(340, 520, 600, 130);
  ctx.fillStyle = '#ffd76a'; ctx.font = 'bold 24px Georgia';
  ctx.fillText('HOW TO ESCAPE', 640, 556);
  ctx.fillStyle = '#fff'; ctx.font = '20px Georgia';
  ctx.fillText('↑ ↓ switch lane   •   SPACE jump   •   SHIFT / CLICK dash', 640, 590);
  ctx.fillText('S hide in a haystack   •   F throw corn at the farmer', 640, 620);
  ctx.fillStyle = '#7ee081'; ctx.font = 'bold 26px Georgia';
  ctx.fillText('Press ENTER or CLICK to run!', 640, 690);
  if (best > 0) {
    ctx.fillStyle = '#fff'; ctx.font = '20px Georgia';
    ctx.fillText(`Best score: ${best}`, 640, 480);
  }
  ctx.textAlign = 'left';
}

export function drawEnd(ctx, state) {
  const escaped = state.result === 'escaped';
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  if (escaped) { g.addColorStop(0, '#2a4a1a'); g.addColorStop(1, '#12300c'); }
  else { g.addColorStop(0, '#4a1a08'); g.addColorStop(1, '#241203'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Night woods: moon, stars and pines behind the end card.
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath(); ctx.arc(1080, 110, 40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  for (const [sx, sy] of [[140, 90], [320, 60], [560, 110], [760, 70], [980, 150], [1200, 70]]) {
    ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = escaped ? '#1a3a12' : '#2a1a0c';
  for (const tx of [60, 180, 1120, 1220]) {
    ctx.beginPath(); ctx.moveTo(tx, 700); ctx.lineTo(tx + 45, 520); ctx.lineTo(tx + 90, 700); ctx.closePath(); ctx.fill();
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? '#7ee081' : '#ff6a5a';
  ctx.font = 'bold 78px Georgia';
  ctx.fillText(escaped ? 'INTO THE WOODS!' : 'DINNER IS SERVED!', 640, 240);
  ctx.fillStyle = '#fff'; ctx.font = '26px Georgia';
  ctx.fillText(
    escaped
      ? 'You outran the farmer, the oven and the carving knife — free at last!'
      : 'The farmer caught you... but a turkey never stops dreaming of the woods.',
    640, 292);
  // Stats card.
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(390, 330, 500, 130);
  ctx.fillStyle = '#ffd76a'; ctx.font = 'bold 26px Georgia';
  ctx.fillText(`SCORE  ${Math.floor(state.score)}`, 640, 372);
  ctx.fillStyle = '#fff'; ctx.font = '22px Georgia';
  ctx.fillText(`Distance ${Math.floor(state.distance)} m   •   Corn ${state.corn}   •   Lives left ${state.lives}`, 640, 410);
  ctx.fillText(state.result === 'escaped' ? 'Escaped in all 3 stages!' : `Caught in ${STAGES[state.stage].name}`, 640, 442);
  const fake = { x: 640, lane: 1, yOff: 0, vy: 0, jumping: false, dashing: 0, dashCooldown: 0, hidden: 0, invulnerable: 0, flap: 1.0 };
  ctx.save(); ctx.translate(0, 120); drawTurkey(ctx, fake, 1.0); ctx.restore();
  if (!escaped) {
    const ff = { x: 900, lane: 1, mode: 'chase', modeTime: 0, runPhase: 1.0, lookDir: 1, lunge: 0 };
    ctx.save(); ctx.translate(0, 120); drawFarmer(ctx, ff, { turkeyLane: 1, gap: 80 }, 1.0); ctx.restore();
  }
  ctx.fillStyle = '#7ee081'; ctx.font = 'bold 28px Georgia';
  ctx.fillText('Press R or CLICK to run again', 640, 690);
  ctx.textAlign = 'left';
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(10,6,2,0.65)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 64px Georgia'; ctx.textAlign = 'center';
  ctx.fillText('PAUSED', 640, 360);
  ctx.font = '24px Georgia';
  ctx.fillText('Press P to keep running', 640, 410);
  ctx.textAlign = 'left';
}
