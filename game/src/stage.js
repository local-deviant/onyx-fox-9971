// Lantern Harbor — stage: the screenshot poses.
// `?shot=<name>&seed=<n>` puts the game into a fixed, deterministic pose
// for a screenshot and sets window.__shotReady once it has been painted:
//   cover  — level 1 mid-hunt, three differences already ringed in gold,
//            the counter showing four still to go (the cover shot).
//   title  — the title screen.
//   market — level 2 mid-hunt with the loupe open and two finds ringed.
//   clear  — level 3 cleared, the results card on screen.
// The seed fixes the decorative scatter; the poses fix the clock, so the
// same shot always renders the same frame.

import { LEVELS } from './tuning.js';
import { diffsFor } from './diffs.js';
import { finishLevel, startLevel } from './rules.js';

function readQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    shot: params.get('shot') || '',
    seed: Number(params.get('seed') || '7'),
  };
}

export function applyShot(state) {
  const { shot, seed } = readQuery();
  state.seed = Number.isFinite(seed) && seed > 0 ? seed : 7;
  if (!shot) return false;
  if (shot === 'title') {
    state.screen = 'title';
    return true;
  }
  if (shot === 'cover') {
    startLevel(state, 0);
    const diffs = diffsFor(LEVELS[0].id);
    state.found = new Set(diffs.slice(0, 3).map((d) => d.id));
    state.finds = 3;
    state.totalFound = 3;
    state.score = 450;
    state.combo = 3;
    state.bestCombo = 3;
    state.timeLeft = 67;
    state.elapsed = LEVELS[0].seconds - 67;
    return true;
  }
  if (shot === 'market') {
    startLevel(state, 1);
    const diffs = diffsFor(LEVELS[1].id);
    state.found = new Set(diffs.slice(0, 2).map((d) => d.id));
    state.finds = 2;
    state.totalFound = 9;
    state.score = 1250;
    state.combo = 2;
    state.bestCombo = 3;
    state.timeLeft = 58;
    state.elapsed = LEVELS[1].seconds - 58;
    state.loupe = true;
    state.loupeX = 880;
    state.loupeY = 340;
    return true;
  }
  if (shot === 'clear') {
    startLevel(state, 2);
    const diffs = diffsFor(LEVELS[2].id);
    state.found = new Set(diffs.map((d) => d.id));
    state.finds = 10;
    state.clicks = 10;
    state.totalFound = 25;
    state.score = 3420;
    state.combo = 5;
    state.bestCombo = 5;
    state.timeLeft = 34;
    state.elapsed = LEVELS[2].seconds - 34;
    finishLevel(state);
    return true;
  }
  return false;
}

// The staged clock: screenshots freeze the animation at a fixed moment so
// the frame never depends on when the browser happened to paint it.
export function stagedTime() {
  return 4.2;
}
