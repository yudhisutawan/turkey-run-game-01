# Tournament — turkey-run-game-01 (builder notes)

Winner: **Gobble Dash — The Great Turkey Escape** (lane runner, Hermes #2
GobbleDash merged with #1 stealth hide + #7 auto-pursuit).

## Candidates prototyped (in /tmp/turkey-cands, screenshotted in headless Chromium)

| # | Candidate (Hermes) | Genre | Verdict |
|---|---|---|---|
| A | Feather & Fury (#1) | Top-down stealth | 2nd tier. Vision-cone + distraction is deep, but the play shot reads poorly at a glance (cone rendered as a giant triangle in the prototype) and stealth is slow for an "escape" fantasy. |
| B | **GobbleDash (#2)** | **Lane runner** | **WINNER.** Instantly readable: turkey, farmer chasing, knife, oven, hay, HUD all visible in one frame. Lanes + jump + dash + stamina + 3 stages. |
| C | T-R-U-K-E-Y (#4) | Maze survival | 3rd. Clean maze, good depth, but large empty margins and a small turkey; less exciting than B in a shrunk contact sheet. |
| D | Winged Escape (#5) | Vertical climber | 4th. Addictive climb, but the play shot is sparse and the prototype had the same canvas arc-path artefact as A. |
| E | Feathered Phantoms (#8) | Turn-based puzzle | 5th. Clever, but turn-based stillness is the opposite of a chase; darkest/sparsest shot. |
| F/G/H | Pluck & Run (#3), Quick-Peck (#6), Great Gravy Chase (#7) | Platformer / reflex / auto-runner | Evaluated conceptually, not prototyped: #3 physics is hard to read in one shot, #6 reflex prompts are thin, #7 is B with auto-scroll — its pursuit pressure was folded into B instead. |

## Pairwise scoring vs the 5 judge criteria (1 completeness, 2 fun/depth, 3 feel, 4 look, 5 structure)

- B beats A 4–1 (A wins depth only, on stealth tactics; B wins completeness, fun, feel, look).
- B beats C 4–1 (C wins structure-ish depth; B wins the other four).
- B beats D 5–0. B beats E 5–0.
- A beats C 3–2, C beats D 3–2, D beats E 3–2.

## What the winner borrowed

- From #1: haystack hiding (S) — the farmer enters SEARCH mode and loses ground; corn throw (F) distracts him.
- From #7: the farmer is always on screen behind the turkey, with a visible FARMER GAP bar; gap ≤ 0 = caught.
- From #2: 3 lanes, jump, dash with stamina, 3 stages farmyard → porch → kitchen, 1000 m escape.

## Verification (see final report for numbers)

- CDP playtest: title → playing → jump/lane/dash → pause/resume → escaped → restart → caught, zero console exceptions, only local resource requests.
- `main.ts` run twice to two output dirs; byte-identical.
- No `http://` / `https://` absolute URLs in game/ sources.
- Screenshots: 4 × 1280×720 JPEG, each ≤ 256 KiB.
