// Lantern Harbor — boot: the game starts here.
// Wires the canvas to the pointer and keyboard, runs the animation loop,
// ticks the clock and the sparkles, and tells the screenshot harness when
// a staged pose has been painted (window.__shotReady).

import { CANVAS_H, CANVAS_W, LOW_TIME_SECONDS } from './tuning.js';
import { freshState, tick } from './rules.js';
import { freshSparks, updateSparks } from './sparks.js';
import { paint } from './paint.js';
import { applyShot, stagedTime } from './stage.js';
import { buttonRegions, handleClick, handleKey, moveLoupe } from './pointer.js';
import { playTick, primeSound } from './sound.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const state = freshState();
const sparks = freshSparks();
const staged = applyShot(state);
let lastWholeSecond = -1;
let painted = 0;

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_W / rect.width;
  const scaleY = CANVAS_H / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function hoverAt(x, y) {
  for (const r of buttonRegions(state)) {
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.id;
  }
  return null;
}

canvas.addEventListener('mousemove', (event) => {
  const p = canvasPoint(event);
  moveLoupe(state, p.x, p.y);
  state.hover = hoverAt(p.x, p.y);
  canvas.style.cursor = state.hover ? 'pointer' : 'default';
});

canvas.addEventListener('mousedown', (event) => {
  primeSound();
  const p = canvasPoint(event);
  moveLoupe(state, p.x, p.y);
  if (event.button === 2) {
    state.loupe = state.screen === 'playing' && !state.paused;
    return;
  }
  if (event.button === 0) handleClick(state, sparks, p.x, p.y, state.elapsed);
});

window.addEventListener('mouseup', (event) => {
  if (event.button === 2) state.loupe = false;
});

canvas.addEventListener('contextmenu', (event) => event.preventDefault());

window.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key.startsWith('Arrow')) event.preventDefault();
  primeSound();
  handleKey(state, sparks, event.key, state.elapsed, true);
});

window.addEventListener('keyup', (event) => {
  handleKey(state, sparks, event.key, state.elapsed, false);
});

let last = null;
function frame(timestamp) {
  const now = timestamp / 1000;
  const dt = last === null ? 0.016 : Math.min(0.05, now - last);
  last = now;
  const t = staged ? stagedTime() : now;
  const paintNow = staged ? stagedTime() : now;
  if (!staged) tick(state, dt);
  updateSparks(sparks, dt);
  // The low-time tick, once per whole second.
  const whole = Math.ceil(state.timeLeft);
  if (state.screen === 'playing' && !state.paused && state.timeLeft <= LOW_TIME_SECONDS && whole !== lastWholeSecond) {
    lastWholeSecond = whole;
    if (state.timeLeft > 0) playTick();
  }
  paint(ctx, state, sparks, t, paintNow);
  painted += 1;
  if (staged && painted >= 2) window.__shotReady = true;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
