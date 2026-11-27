// Gobble Dash — the world: autumn scenery that scrolls past, a
// different backdrop per stage (farmyard, porch, kitchen), plus the
// distant forest the turkey is running toward.
import { CANVAS_W, CANVAS_H, GROUND_Y, LANES, STAGES } from './config.js';

export function createWorld(seed) {
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const clouds = [];
  for (let i = 0; i < 5; i++) clouds.push({ x: rnd() * CANVAS_W, y: 90 + rnd() * 70, w: 90 + rnd() * 70 });
  const trees = [];
  for (let i = 0; i < 9; i++) trees.push({ x: rnd() * CANVAS_W, h: 60 + rnd() * 60 });
  const fences = [];
  for (let i = 0; i < 8; i++) fences.push({ x: i * 180 });
  const leaves = [];
  for (let i = 0; i < 14; i++) leaves.push({ x: rnd() * CANVAS_W, y: rnd() * CANVAS_H, s: 2 + rnd() * 3, v: 20 + rnd() * 30 });
  return { clouds, trees, fences, leaves, scroll: 0 };
}

export function drawWorld(ctx, world, stageIndex, dt, speed, time) {
  const stage = STAGES[stageIndex];
  world.scroll += speed * dt * 0.5;
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  sky.addColorStop(0, stage.sky[0]);
  sky.addColorStop(0.6, stage.sky[1]);
  sky.addColorStop(1, stage.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Sun and clouds.
  ctx.fillStyle = 'rgba(255, 236, 170, 0.95)';
  ctx.beginPath(); ctx.arc(1080, 110, 42, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (const c of world.clouds) {
    const cx = ((c.x - world.scroll * 0.2) % (CANVAS_W + 240) + CANVAS_W + 240) % (CANVAS_W + 240) - 120;
    ctx.beginPath(); ctx.ellipse(cx, c.y, c.w, 24, 0, 0, Math.PI * 2); ctx.fill();
  }

  if (stageIndex === 0) {
    // Barn on the hill, fence line, cornfield stubble.
    ctx.fillStyle = '#7a5a2a';
    ctx.fillRect(1000, 180, 170, 150);
    ctx.fillStyle = '#a34a22';
    ctx.beginPath(); ctx.moveTo(980, 180); ctx.lineTo(1085, 105); ctx.lineTo(1190, 180); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(1052, 250, 66, 80);
    ctx.fillStyle = '#e8c98a'; ctx.font = 'bold 18px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('BARN', 1085, 230); ctx.textAlign = 'left';
    ctx.strokeStyle = '#6b4a22'; ctx.lineWidth = 5;
    for (const f of world.fences) {
      const fx = ((f.x - world.scroll) % (CANVAS_W + 180) + CANVAS_W + 180) % (CANVAS_W + 180) - 90;
      ctx.beginPath(); ctx.moveTo(fx, 620); ctx.lineTo(fx + 170, 620); ctx.moveTo(fx, 640); ctx.lineTo(fx + 170, 640); ctx.stroke();
    }
  } else if (stageIndex === 1) {
    // Porch posts and a pantry door ahead.
    ctx.fillStyle = '#6b4a22';
    for (let i = 0; i < 4; i++) ctx.fillRect(160 + i * 320, 120, 26, 520);
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, 120, CANVAS_W, 22);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(1120, 300, 110, 200);
    ctx.fillStyle = '#ffd76a'; ctx.font = 'bold 16px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('PANTRY', 1175, 290); ctx.textAlign = 'left';
  } else {
    // Kitchen: tiled wall, hanging brass pans, the great window of freedom.
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 16; c++) ctx.fillRect(c * 84, 70 + r * 52, 78, 46);
    for (let i = 0; i < 4; i++) {
      const px = 200 + i * 260;
      ctx.fillStyle = '#8a6a2a'; ctx.fillRect(px - 3, 96, 6, 22);
      ctx.fillStyle = '#c9a13c';
      ctx.beginPath(); ctx.arc(px, 148, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8c96a';
      ctx.beginPath(); ctx.arc(px - 6, 142, 14, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(1140, 130, 110, 150);
    ctx.fillStyle = '#7ee081';
    ctx.fillRect(1150, 140, 90, 130);
    ctx.fillStyle = '#123'; ctx.font = 'bold 15px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('FREEDOM', 1195, 210); ctx.textAlign = 'left';
  }

  // Ground and lane guides.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, LANES[0] + 44, CANVAS_W, 5);
  ctx.fillRect(0, LANES[1] + 44, CANVAS_W, 5);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.setLineDash([26, 22]); ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, LANES[0] + 74); ctx.lineTo(CANVAS_W, LANES[0] + 74);
  ctx.moveTo(0, LANES[1] + 74); ctx.lineTo(CANVAS_W, LANES[1] + 74);
  ctx.stroke();
  ctx.setLineDash([]);

  // Drifting autumn leaves.
  ctx.fillStyle = 'rgba(232,161,60,0.8)';
  for (const l of world.leaves) {
    const lx = ((l.x - world.scroll * 0.7 + time * l.v) % (CANVAS_W + 40) + CANVAS_W + 40) % (CANVAS_W + 40) - 20;
    ctx.beginPath(); ctx.arc(lx, l.y + Math.sin(time + l.x) * 6, l.s, 0, Math.PI * 2); ctx.fill();
  }
}
