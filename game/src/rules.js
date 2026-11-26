// Lantern Harbor — rules: the game state and everything that changes it.
// Screens, finds, misses, hints, the clock, the combo and the score all live
// here. Drawing lives in paint.js; this file only decides what is true.

import {
  CLICK_RADIUS,
  COMBO_MAX,
  FIND_POINTS,
  HINTS_PER_LEVEL,
  HINT_COOLDOWN_SECONDS,
  HINT_POINTS_COST,
  LEVELS,
  LEVEL_CLEAR_TIME_BONUS,
  MISS_TIME_PENALTY,
} from './tuning.js';
import { diffsFor } from './diffs.js';

export function freshState() {
  return {
    screen: 'title',
    levelIndex: 0,
    found: new Set(),
    score: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: LEVELS[0].seconds,
    hintsLeft: HINTS_PER_LEVEL,
    hintCooldown: 0,
    hintPulse: null,
    misses: 0,
    finds: 0,
    clicks: 0,
    loupe: false,
    loupeX: 0,
    loupeY: 0,
    muted: false,
    paused: false,
    levelBonus: 0,
    levelAccuracy: 0,
    totalFound: 0,
    totalDiffs: LEVELS.reduce((n, l) => n + l.differences, 0),
    startedAt: 0,
    elapsed: 0,
    seed: 7,
    message: '',
    messageUntil: 0,
  };
}

export function levelOf(state) {
  return LEVELS[state.levelIndex];
}

export function remaining(state) {
  return levelOf(state).differences - state.found.size;
}

export function accuracy(state) {
  return state.clicks === 0 ? 1 : state.finds / state.clicks;
}

export function startLevel(state, index) {
  const level = LEVELS[index];
  state.levelIndex = index;
  state.found = new Set();
  state.timeLeft = level.seconds;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintCooldown = 0;
  state.hintPulse = null;
  state.combo = 0;
  state.misses = 0;
  state.finds = 0;
  state.clicks = 0;
  state.loupe = false;
  state.screen = 'playing';
  state.paused = false;
  state.elapsed = 0;
  state.message = '';
}

export function startGame(state) {
  state.score = 0;
  state.bestCombo = 0;
  state.totalFound = 0;
  startLevel(state, 0);
}

// The nearest unfound difference to a panel-local point, if the click is
// close enough to count. Either panel may be clicked; the point is mirrored.
export function differenceAt(state, x, y) {
  const level = levelOf(state);
  let best = null;
  let bestDist = CLICK_RADIUS;
  for (const d of diffsFor(level.id)) {
    if (state.found.has(d.id)) continue;
    const dist = Math.hypot(d.x - x, d.y - y);
    if (dist <= bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}

export function awardFind(state, diff) {
  state.found.add(diff.id);
  state.finds += 1;
  state.clicks += 1;
  state.totalFound += 1;
  state.combo = Math.min(state.combo + 1, COMBO_MAX);
  if (state.combo > state.bestCombo) state.bestCombo = state.combo;
  const points = FIND_POINTS * state.combo;
  state.score += points;
  return points;
}

export function registerMiss(state) {
  state.misses += 1;
  state.clicks += 1;
  state.combo = 0;
  state.timeLeft = Math.max(0, state.timeLeft - MISS_TIME_PENALTY);
}

export function useHint(state, now) {
  if (state.hintsLeft <= 0 || state.hintCooldown > 0) return null;
  const level = levelOf(state);
  const unfound = diffsFor(level.id).filter((d) => !state.found.has(d.id));
  if (unfound.length === 0) return null;
  const pick = unfound[Math.floor(unfound.length / 2)];
  state.hintsLeft -= 1;
  state.hintCooldown = HINT_COOLDOWN_SECONDS;
  state.score = Math.max(0, state.score - HINT_POINTS_COST);
  state.hintPulse = { id: pick.id, x: pick.x, y: pick.y, until: now + 2.2 };
  return pick;
}

export function levelCleared(state) {
  return state.found.size >= levelOf(state).differences;
}

export function finishLevel(state) {
  state.levelAccuracy = accuracy(state);
  state.levelBonus = Math.round(state.timeLeft) * LEVEL_CLEAR_TIME_BONUS
    + Math.round(state.levelAccuracy * 100);
  state.score += state.levelBonus;
  if (state.levelIndex + 1 < LEVELS.length) {
    state.screen = 'levelclear';
  } else {
    state.screen = 'complete';
  }
}

export function tick(state, dt) {
  if (state.screen !== 'playing' || state.paused) return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.hintCooldown > 0) state.hintCooldown = Math.max(0, state.hintCooldown - dt);
  if (state.timeLeft <= 0) {
    state.screen = 'timeup';
    state.combo = 0;
  }
}

export function setMessage(state, text, now, seconds) {
  state.message = text;
  state.messageUntil = now + seconds;
}
