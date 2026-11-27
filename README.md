# Gobble Dash — The Great Turkey Escape

[![Competition](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Rank](https://make.fun/badge/turkey-run-game-01/yudhisutawan/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Reward](https://make.fun/badge/turkey-run-game-01/yudhisutawan/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

Gobble Dash is a 3-lane runner where a turkey escapes the farmer across 3 stages — farmyard, porch, and kitchen — over a 1000 m escape. The farmer is always on screen behind the turkey, with a visible FARMER GAP bar: if the gap reaches zero, the turkey is caught.

## How to play

- Switch between the 3 lanes to dodge obstacles, jump over hazards, and dash with a limited stamina meter.
- Hide in a haystack (S) to make the farmer lose ground while he searches.
- Throw corn (F) to distract the farmer and buy distance.
- Survive all 3 stages and cover the full 1000 m to escape.

## Build

The game is static files in `game/`. The entry is built by `main.ts` (stdlib-only), which copies the game into the output directory.
