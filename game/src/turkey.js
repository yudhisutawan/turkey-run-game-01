// Gobble Dash — the turkey: drawn from canvas shapes (original art),
// with lane movement, jumping, dashing and hiding in haystacks.
import { LANES, TURKEY_X, TUNING } from './config.js';

export function createTurkey() {
  return {
    lane: 1,          // 0 top, 1 middle, 2 bottom
    yOff: 0,          // jump offset (negative = up)
    vy: 0,
    jumping: false,
    dashing: 0,       // seconds of dash left
    dashCooldown: 0,
    hidden: 0,        // seconds of haystack hiding left
    invulnerable: 0,
    flap: 0,          // leg-flap animation phase
    x: TURKEY_X,
  };
}

export function turkeyY(t) {
  return LANES[t.lane] + t.yOff;
}

export function turkeyJump(t, sounds) {
  if (t.jumping || t.hidden > 0) return;
  t.jumping = true;
  t.vy = TUNING.jumpVelocity;
  sounds.jump();
}

export function turkeyDash(t, state, sounds) {
  if (t.dashCooldown > 0 || state.stamina < TUNING.dashCost || t.hidden > 0) return false;
  state.stamina -= TUNING.dashCost;
  t.dashing = TUNING.dashTime;
  t.dashCooldown = 0.9;
  sounds.dash();
  return true;
}

export function turkeyHide(t, nearHay, sounds) {
  if (!nearHay || t.jumping || t.hidden > 0) return false;
  t.hidden = 2.0;
  sounds.hide();
  return true;
}

export function updateTurkey(t, dt, running) {
  t.flap += dt * (running ? 11 : 2);
  if (t.dashCooldown > 0) t.dashCooldown -= dt;
  if (t.invulnerable > 0) t.invulnerable -= dt;
  if (t.dashing > 0) t.dashing -= dt;
  if (t.hidden > 0) t.hidden -= dt;
  if (t.jumping) {
    t.vy += TUNING.gravity * dt;
    t.yOff += t.vy * dt;
    if (t.yOff >= 0) { t.yOff = 0; t.vy = 0; t.jumping = false; }
  }
}

export function drawTurkey(ctx, t, time) {
  const px = t.x;
  const py = turkeyY(t);
  const blink = t.invulnerable > 0 && Math.floor(time * 12) % 2 === 0;
  ctx.save();
  ctx.translate(px, py);
  if (t.hidden > 0) ctx.globalAlpha = 0.25; // tucked inside the hay
  else if (blink) ctx.globalAlpha = 0.45;
  const bob = Math.sin(t.flap) * 2;
  // Tail fan: five brown feathers.
  ctx.fillStyle = '#8a5a2b';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.5 - 0.15);
    ctx.beginPath(); ctx.ellipse(-18, -24 + bob * 0.3, 9, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#6b4218';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.5 - 0.15);
    ctx.beginPath(); ctx.ellipse(-18, -38 + bob * 0.3, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Body and wing.
  ctx.fillStyle = '#a06a35';
  ctx.beginPath(); ctx.ellipse(0, 0, 32, 23, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c98f4a';
  ctx.beginPath(); ctx.ellipse(2, 6, 21, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath(); ctx.ellipse(-8, -4, 14, 9, -0.5, 0, Math.PI * 2); ctx.fill();
  // Head, beak, wattle, eye.
  ctx.fillStyle = '#7a4a22';
  ctx.beginPath(); ctx.arc(29, -15, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8a13c';
  ctx.beginPath(); ctx.moveTo(39, -16); ctx.lineTo(54, -11); ctx.lineTo(39, -6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d33';
  ctx.beginPath(); ctx.ellipse(35, -3, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(32, -19, 3.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(33, -19, 1.9, 0, Math.PI * 2); ctx.fill();
  // Legs, mid-stride.
  ctx.strokeStyle = '#e8a13c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const f = Math.sin(t.flap) * 7;
  ctx.beginPath(); ctx.moveTo(-10, 18); ctx.lineTo(-14 + f, 32); ctx.moveTo(10, 18); ctx.lineTo(14 - f, 32); ctx.stroke();
  ctx.restore();
}
