// Gobble Dash — screenshot poses: deterministic staged scenes used
// with ?shot=start|play|kitchen|end&seed=N. Each pose is a real frame
// of the game's own render code (title, play, kitchen, end screen),
// with fixed numbers so the same query always renders the same shot.
import { makeRng } from './config.js';
import { makeObstacle, makeCorn, makeHaystack } from './hazards.js';

export function applyShot(G, shot) {
  const rng = makeRng(20261127);
  if (shot === 'start') {
    G.mode = 'title';
    return;
  }
  if (shot === 'end') {
    G.mode = 'ended';
    G.run.result = 'escaped';
    G.run.distance = 1000;
    G.run.score = 1520;
    G.run.corn = 41;
    G.run.lives = 2;
    G.run.stage = 2;
    return;
  }
  // Play poses: a mid-run frame with the farmer chasing, hazards
  // ahead and corn on the ground.
  G.mode = 'playing';
  const run = G.run;
  if (shot === 'kitchen') {
    run.stage = 2;
    run.distance = 812;
    run.score = 1180;
    run.corn = 34;
    run.lives = 2;
    run.stamina = 64;
    run.gap = 54;
    run.banner = 0;
    run.turkey.lane = 1;
    run.turkey.jumping = true;
    run.turkey.yOff = -70;
    run.turkey.vy = -200;
    run.farmer.lane = 1;
    run.farmer.mode = 'chase';
    run.obstacles = [
      makeObstacle('oven', 0, 1080, rng),
      makeObstacle('knife', 2, 880, rng),
      makeObstacle('hay', 1, 720, rng),
      makeObstacle('pin', 0, 560, rng),
    ];
    run.obstacles[1].telegraph = 0.4;
    run.corns = [
      makeCorn(2, 620, false), makeCorn(2, 660, false), makeCorn(2, 700, false),
      makeCorn(0, 980, true),
    ];
    run.haystacks = [makeHaystack(2, 480)];
  } else {
    // Farmyard play pose.
    run.stage = 0;
    run.distance = 612;
    run.score = 940;
    run.corn = 27;
    run.lives = 3;
    run.stamina = 72;
    run.gap = 68;
    run.banner = 0;
    run.turkey.lane = 1;
    run.turkey.jumping = true;
    run.turkey.yOff = -46;
    run.turkey.vy = -320;
    run.farmer.lane = 1;
    run.farmer.mode = 'chase';
    run.obstacles = [
      makeObstacle('hay', 1, 760, rng),
      makeObstacle('pin', 2, 980, rng),
      makeObstacle('hay', 0, 1120, rng),
    ];
    run.corns = [
      makeCorn(0, 560, false), makeCorn(0, 600, false), makeCorn(0, 640, false),
      makeCorn(2, 900, false), makeCorn(2, 940, true),
    ];
    run.haystacks = [makeHaystack(0, 420)];
  }
  run.time = 1.2;
}
