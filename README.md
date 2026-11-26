# Lantern Harbor — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/local-deviant/best-spot-the-difference-game-20261121-0451-ours/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/local-deviant/best-spot-the-difference-game-20261121-0451-ours/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)



A spot-the-difference game for the [best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) bounty on make.fun.

Two near-identical pictures sit side by side. One of them is hiding changes — click a difference on either picture to ring it in gold, with a chime and a burst of sparkles. Wrong clicks cost time and break your combo. Hold **Z** (or the right mouse button) to open the magnifier and study a detail up close.

## How to play

- **Click** a difference on either picture to mark it. Each find is worth 100 points times your combo — finds in a row without a miss raise the combo up to x5.
- **Wrong click**: −3 seconds and the combo breaks.
- **H** or the Hint button: pulses one unfound difference (2 per level, 10 s cooldown, costs 50 points).
- **Z** or hold right-click: the magnifier loupe, 2x zoom under your cursor.
- **P**: pause. **R**: restart the level. **M**: mute. **Space / Enter**: start. **N**: next level after a win.
- Clear all differences before the timer runs out to finish the level.

## Levels

| Level | Scene | Differences | Time |
| --- | --- | --- | --- |
| 1 | Harbor Dawn | 7 | 2:00 |
| 2 | Lantern Market | 8 | 1:40 |
| 3 | Coral Garden | 10 | 1:30 |

25 differences in all. Finishing a level pays a bonus of 10 points per second left plus up to 100 for accuracy.

## Tech

- All art is drawn with Canvas 2D — no external assets, no images, no network.
- All sound is synthesised with WebAudio — no audio files.
- Deterministic: `?seed=N` fixes the decorative scatter, and `?shot=` stages a fixed pose for screenshots, so the same seed always gives the same hunt.
- Screenshot staging: `?shot=cover|title|market|clear` stages a scene and sets `window.__shotReady` when painted.

## Run it

Serve the `game/` folder with any static server and open `index.html`, or:

```sh
node serve.ts
```

Then open http://127.0.0.1:8080.

## Files

- `game/index.html` — page shell and canvas.
- `game/src/boot.js` — boot, animation loop, input wiring, `window.__shotReady`.
- `game/src/tuning.js` — levels, timers, scoring, geometry, palette.
- `game/src/rng.js` — seeded random generator.
- `game/src/drawkit.js` — small canvas shapes every scene shares.
- `game/src/harbor.js` — the Harbor Dawn scene.
- `game/src/market.js` — the Lantern Market scene.
- `game/src/reef.js` — the Coral Garden scene.
- `game/src/diffs.js` — where each hidden difference lives.
- `game/src/rules.js` — game state and rules (find, miss, hint, timer, score).
- `game/src/pointer.js` — mouse, loupe and keyboard input.
- `game/src/paint.js` — panels, markers, HUD, loupe and all screens.
- `game/src/sparks.js` — sparkle bursts and floating score text.
- `game/src/sound.js` — synthesised WebAudio sounds.
- `game/src/stage.js` — `?shot=` staging for screenshots.
- `main.ts` — entrypoint: copies `game/` and `screenshots/` to the output dir and writes `dossier.json`. Run `node main.ts --check` for the eight self-checks.

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Entered on [make.fun](https://make.fun/?ref=njrtxptt&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
