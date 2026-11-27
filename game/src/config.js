// Gobble Dash — configuration: canvas, lanes, stages, tuning.
// Every number the game balances on lives here, so tuning never
// hides inside the loop or the render code.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const GROUND_Y = 660;
export const LANES = [300, 450, 590];
export const TURKEY_X = 330;
export const FARMER_X = 118;
export const ESCAPE_DISTANCE = 1000;
export const START_LIVES = 3;
export const START_GAP = 100;
export const MAX_STAMINA = 100;

export const STAGES = [
  {
    name: 'STAGE 1 — MUDDY FARMYARD',
    sub: 'Out of the pen, through the mud!',
    sky: ['#f7c873', '#e8a35a', '#b5762e'],
    ground: '#c98f4a',
    obstacleEvery: [620, 900],
    knives: false,
    ovens: false,
  },
  {
    name: 'STAGE 2 — COUNTRY PORCH',
    sub: 'Past the porch, through the pantry door!',
    sky: ['#f2b25a', '#c97b33', '#8a4a1a'],
    ground: '#a06a35',
    obstacleEvery: [520, 780],
    knives: true,
    ovens: false,
  },
  {
    name: 'STAGE 3 — THANKSGIVING KITCHEN',
    sub: 'The oven is hot and the knife is out — RUN!',
    sky: ['#8a3a1a', '#a34a22', '#5a2410'],
    ground: '#6b3a1a',
    obstacleEvery: [430, 640],
    knives: true,
    ovens: true,
  },
];

export const TUNING = {
  baseSpeed: 300,
  speedPerStage: 55,
  speedPerMetre: 0.12,
  dashSpeed: 640,
  dashCost: 28,
  dashTime: 0.45,
  staminaRegen: 16,
  gapDecayPerSecond: 1.6,
  gapHitPenalty: 18,
  gapCornThrow: 16,
  gapHideRecover: 22,
  jumpVelocity: -760,
  gravity: 2300,
  invulnerableTime: 1.4,
  cornScore: 10,
  goldenCornScore: 50,
  metreScore: 1,
  stageBonus: 150,
};

// Deterministic RNG (mulberry32) so screenshot poses and replays
// are stable for a given seed.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
