// Lantern Harbor — pointer: every way a player talks to the game.
// Mouse clicks on the panels, the footer buttons and the big screen buttons,
// the loupe on the right mouse button or Z, and the keyboard shortcuts.
// This file decides what a click means; paint.js draws the buttons where
// this file says they are, so the two can never drift apart.

import {
  LEFT_X,
  PANEL_H,
  PANEL_W,
  PANEL_Y,
  RIGHT_X,
} from './tuning.js';
import {
  awardFind,
  differenceAt,
  finishLevel,
  levelCleared,
  levelOf,
  registerMiss,
  setMessage,
  startGame,
  startLevel,
  useHint,
} from './rules.js';
import { burst, floatText, puff } from './sparks.js';
import {
  isMuted,
  playClick,
  playFind,
  playHint,
  playLevelClear,
  playMiss,
  primeSound,
  setMuted,
} from './sound.js';

// Buttons, by screen. Footer buttons sit in the strip under the panels;
// screen buttons sit in the middle of the overlay cards.
export function buttonRegions(state) {
  const regions = [];
  if (state.screen === 'playing' || state.screen === 'paused') {
    regions.push({ id: 'hint', x: 20, y: 744, w: 170, h: 40 });
    regions.push({ id: 'sound', x: 1010, y: 744, w: 70, h: 40 });
    regions.push({ id: 'pause', x: 1090, y: 744, w: 70, h: 40 });
    regions.push({ id: 'restart', x: 1170, y: 744, w: 90, h: 40 });
  }
  if (state.screen === 'title') {
    regions.push({ id: 'start', x: 490, y: 556, w: 300, h: 64 });
  }
  if (state.screen === 'levelclear') {
    regions.push({ id: 'next', x: 490, y: 556, w: 300, h: 64 });
  }
  if (state.screen === 'complete' || state.screen === 'timeup') {
    regions.push({ id: 'again', x: 490, y: 556, w: 300, h: 64 });
  }
  if (state.screen === 'paused') {
    regions.push({ id: 'resume', x: 490, y: 470, w: 300, h: 60 });
    regions.push({ id: 'restart-level', x: 490, y: 548, w: 300, h: 60 });
  }
  return regions;
}

function regionAt(state, x, y) {
  for (const r of buttonRegions(state)) {
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.id;
  }
  return null;
}

function panelPoint(state, x, y) {
  if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return null;
  if (x >= LEFT_X && x <= LEFT_X + PANEL_W) return { x: x - LEFT_X, y: y - PANEL_Y };
  if (x >= RIGHT_X && x <= RIGHT_X + PANEL_W) return { x: x - RIGHT_X, y: y - PANEL_Y };
  return null;
}

function doHint(state, sparks, now) {
  const found = useHint(state, now);
  if (!found) return;
  playHint();
  setMessage(state, `Hint: ${found.label}`, now, 3);
}

function doFind(state, sparks, diff, point) {
  const points = awardFind(state, diff);
  playFind(state.combo);
  const left = { x: LEFT_X + diff.x, y: PANEL_Y + diff.y };
  const right = { x: RIGHT_X + diff.x, y: PANEL_Y + diff.y };
  burst(sparks, left.x, left.y, '#ffd76a');
  burst(sparks, right.x, right.y, '#ffd76a');
  floatText(sparks, left.x, left.y - 34, `+${points}`, '#ffd76a');
  floatText(sparks, right.x, right.y - 34, `+${points}`, '#ffd76a');
  if (levelCleared(state)) {
    finishLevel(state);
    if (state.screen === 'levelclear' || state.screen === 'complete') playLevelClear();
  }
}

function doMiss(state, sparks, x, y) {
  registerMiss(state);
  playMiss();
  puff(sparks, x, y);
}

// One left click, in canvas coordinates. `now` is seconds on the game clock.
export function handleClick(state, sparks, x, y, now) {
  primeSound();
  const button = regionAt(state, x, y);
  if (button) {
    playClick();
    if (button === 'start') startGame(state);
    if (button === 'next') startLevel(state, state.levelIndex + 1);
    if (button === 'again') startGame(state);
    if (button === 'resume') state.paused = false;
    if (button === 'restart-level') startLevel(state, state.levelIndex);
    if (button === 'restart') startLevel(state, state.levelIndex);
    if (button === 'pause') state.paused = !state.paused;
    if (button === 'sound') setMuted(!isMuted());
    if (button === 'hint') doHint(state, sparks, now);
    return;
  }
  if (state.screen !== 'playing' || state.paused) return;
  const point = panelPoint(state, x, y);
  if (!point) return;
  const diff = differenceAt(state, point.x, point.y);
  if (diff) doFind(state, sparks, diff, point);
  else doMiss(state, sparks, x, y);
}

export function handleKey(state, sparks, key, now, down) {
  if (key === 'z' || key === 'Z') {
    state.loupe = down && state.screen === 'playing' && !state.paused;
    return;
  }
  if (!down) return;
  const k = key.toLowerCase();
  if (k === 'm') {
    setMuted(!isMuted());
    return;
  }
  if (state.screen === 'title' && (k === ' ' || k === 'enter')) {
    primeSound();
    startGame(state);
    return;
  }
  if (state.screen === 'levelclear' && (k === 'n' || k === ' ' || k === 'enter')) {
    startLevel(state, state.levelIndex + 1);
    return;
  }
  if ((state.screen === 'complete' || state.screen === 'timeup') && (k === 'r' || k === ' ' || k === 'enter')) {
    startGame(state);
    return;
  }
  if (state.screen === 'paused' && (k === 'p' || k === 'escape')) {
    state.paused = false;
    return;
  }
  if (state.screen !== 'playing') return;
  if (k === 'p' || k === 'escape') state.paused = true;
  if (k === 'r') startLevel(state, state.levelIndex);
  if (k === 'h') doHint(state, sparks, now);
}

// The loupe follows the cursor. `canvasPoint` is in canvas coordinates.
export function moveLoupe(state, x, y) {
  state.loupeX = x;
  state.loupeY = y;
}

export function levelName(state) {
  return levelOf(state).name;
}
