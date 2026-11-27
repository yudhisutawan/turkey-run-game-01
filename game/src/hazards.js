// Gobble Dash — hazards and pickups: hay bales to jump, rolling pins,
// falling carving knives, oven blasts, and the corn that scores.
// Every obstacle is drawn from canvas shapes (original art).
import { LANES, GROUND_Y } from './config.js';

export function makeObstacle(kind, lane, x, rng) {
  return {
    kind, lane, x,
    w: kind === 'hay' ? 74 : kind === 'pin' ? 66 : kind === 'oven' ? 92 : 46,
    h: kind === 'hay' ? 62 : kind === 'pin' ? 30 : kind === 'oven' ? 88 : 60,
    passed: false,
    telegraph: kind === 'knife' ? 0.55 : 0,
    fall: kind === 'knife' ? -260 : 0,
    seed: rng ? rng() : 0.5,
  };
}

export function makeCorn(lane, x, golden) {
  return { lane, x, golden: !!golden, taken: false, bob: Math.random() * 6 };
}

export function makeHaystack(lane, x) {
  return { lane, x, w: 110, h: 84, used: false };
}

export function updateHazards(list, dt, speed) {
  for (const o of list) {
    o.x -= speed * dt;
    if (o.kind === 'knife') {
      if (o.telegraph > 0) o.telegraph -= dt;
      else if (o.fall < 0) o.fall += 900 * dt;
    }
  }
  return list.filter((o) => o.x > -160);
}

export function drawCorn(ctx, c, time) {
  const py = LANES[c.lane] - 6 + Math.sin(time * 3 + c.bob) * 4;
  ctx.save();
  ctx.translate(c.x, py);
  ctx.fillStyle = c.golden ? '#ffd94a' : '#e8a13c';
  if (c.golden) {
    ctx.shadowColor = '#ffd94a'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('★', 0, 5); ctx.textAlign = 'left';
  } else {
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, 6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c97b2e';
    ctx.beginPath(); ctx.arc(-3, -3, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawHaystack(ctx, h) {
  ctx.save();
  ctx.translate(h.x, LANES[h.lane] + 34);
  ctx.fillStyle = '#8a6a2a';
  ctx.beginPath(); ctx.ellipse(0, 0, 58, 40, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d8b25a';
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath(); ctx.arc(i * 15, -18 - Math.abs(i) * -4, 16, Math.PI, 0); ctx.fill();
  }
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Georgia'; ctx.textAlign = 'center';
  ctx.fillText('HIDE — press S', 0, 8); ctx.textAlign = 'left';
  ctx.restore();
}

export function drawObstacle(ctx, o, time) {
  const ground = LANES[o.lane] + 34;
  ctx.save();
  if (o.kind === 'hay') {
    ctx.translate(o.x, ground);
    ctx.fillStyle = '#8a6a2a';
    ctx.beginPath(); ctx.arc(0, 0, 36, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d8b25a';
    ctx.font = 'bold 15px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('HAY', 0, -6); ctx.textAlign = 'left';
    ctx.fillStyle = '#6b4a1a';
    ctx.fillRect(-36, -2, 72, 4);
  } else if (o.kind === 'pin') {
    ctx.translate(o.x, ground - 12 + Math.sin(time * 6 + o.seed * 9) * 3);
    ctx.rotate(Math.sin(time * 4 + o.seed * 9) * 0.25);
    ctx.fillStyle = '#c98f5a';
    ctx.fillRect(-33, -9, 66, 18);
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.arc(-38, 0, 7, 0, Math.PI * 2); ctx.arc(38, 0, 7, 0, Math.PI * 2); ctx.fill();
  } else if (o.kind === 'oven') {
    ctx.translate(o.x, ground - 44);
    ctx.fillStyle = '#5b5f66';
    ctx.fillRect(-46, -44, 92, 88);
    ctx.fillStyle = '#2b2e33';
    ctx.fillRect(-36, -32, 72, 48);
    const flick = 0.7 + Math.sin(time * 11 + o.seed * 8) * 0.3;
    ctx.fillStyle = `rgba(255, ${Math.floor(110 + 60 * flick)}, 47, ${flick})`;
    ctx.beginPath();
    ctx.moveTo(-30, 16);
    ctx.quadraticCurveTo(-14, -16, 0, 16);
    ctx.quadraticCurveTo(14, -16, 30, 16);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffcf5a';
    ctx.beginPath(); ctx.arc(0, -6, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff6a3a'; ctx.font = 'bold 13px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('OVEN!', 0, -52); ctx.textAlign = 'left';
  } else if (o.kind === 'knife') {
    if (o.telegraph > 0) {
      // Warning shadow on the lane before the knife drops.
      ctx.fillStyle = 'rgba(255,60,40,0.35)';
      ctx.beginPath(); ctx.ellipse(o.x, ground, 30, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff5a4a'; ctx.font = 'bold 14px Georgia'; ctx.textAlign = 'center';
      ctx.fillText('!', o.x, ground - 16); ctx.textAlign = 'left';
    } else {
      ctx.translate(o.x, ground + o.fall - 30);
      ctx.rotate(0.35);
      ctx.fillStyle = '#dfe6ea';
      ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(16, -12); ctx.lineTo(0, 8); ctx.lineTo(-16, -12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-6, 8, 12, 26);
      ctx.fillStyle = '#ff5a4a'; ctx.font = 'bold 12px Georgia'; ctx.textAlign = 'center';
      ctx.fillText('KNIFE', 0, -48); ctx.textAlign = 'left';
    }
  }
  ctx.restore();
}

export function obstacleHitsTurkey(o, tx, ty, jumping) {
  const top = LANES[o.lane] + 34 - o.h;
  const bottom = LANES[o.lane] + 34;
  const cy = ty + 10;
  const inX = Math.abs(o.x - tx) < (o.w / 2 + 24);
  const inY = cy > top && cy < bottom;
  if (o.kind === 'knife') {
    if (o.telegraph > 0) return false;
    const ky = bottom + o.fall - 30;
    return inX && Math.abs(ky - cy) < 46;
  }
  if (jumping && o.kind !== 'oven') return false; // jumped clean over it
  return inX && inY;
}

export function cornHitsTurkey(c, tx, ty) {
  return Math.abs(c.x - tx) < 34 && Math.abs(LANES[c.lane] - ty) < 44;
}

export function turkeyNearHaystack(haystacks, tx, lane) {
  return haystacks.find((h) => h.lane === lane && Math.abs(h.x - tx) < 90 && !h.used);
}
