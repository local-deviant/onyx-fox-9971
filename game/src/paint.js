// Lantern Harbor — paint: everything the player sees.
// Two panels, the header and footer, the gold rings on found differences,
// the loupe, the sparkles and every screen (title, pause, level clear,
// complete, time up). It reads the state and draws it; it never changes it.

import {
  CANVAS_H,
  CANVAS_W,
  HEADER_H,
  LEFT_X,
  LEVELS,
  LOUPE_RADIUS,
  LOUPE_ZOOM,
  LOW_TIME_SECONDS,
  PANEL_H,
  PANEL_W,
  PANEL_Y,
  RIGHT_X,
  UI,
} from './tuning.js';
import { diffsFor } from './diffs.js';
import { accuracy, levelOf, remaining } from './rules.js';
import { buttonRegions } from './pointer.js';
import { label, line, ring, roundBox, star } from './drawkit.js';
import { drawHarbor } from './harbor.js';
import { drawMarket } from './market.js';
import { drawReef } from './reef.js';
import { drawSparks } from './sparks.js';

const SCENES = { harbor: drawHarbor, market: drawMarket, reef: drawReef };

function allDiffIds(level) {
  return new Set(diffsFor(level.id).map((d) => d.id));
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Gold rings on every difference already found, on both panels, plus the
// pulsing hint ring while a hint is alive.
function drawMarkers(ctx, state, now) {
  const level = levelOf(state);
  for (const d of diffsFor(level.id)) {
    if (!state.found.has(d.id)) continue;
    const pulse = 1 + 0.06 * Math.sin(now * 5);
    ring(ctx, d.x, d.y, 26 * pulse, 5, UI.goldBright);
    ring(ctx, d.x, d.y, 19 * pulse, 2.5, UI.gold);
    star(ctx, d.x, d.y - 26, 7, 3, UI.goldBright);
  }
  if (state.hintPulse && now < state.hintPulse.until) {
    const age = state.hintPulse.until - now;
    const pulse = 1 + 0.25 * Math.sin(now * 9);
    ctx.save();
    ctx.globalAlpha = Math.min(1, age);
    ring(ctx, state.hintPulse.x, state.hintPulse.y, 30 * pulse, 4, UI.teal);
    ring(ctx, state.hintPulse.x, state.hintPulse.y, 22 * pulse, 2, '#ffffff');
    ctx.restore();
  }
}

function drawPanel(ctx, state, panelX, mods, t, now) {
  const level = levelOf(state);
  const drawScene = SCENES[level.id];
  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(panelX, PANEL_Y);
  drawScene(ctx, mods, t, level.seed);
  drawMarkers(ctx, state, now);
  ctx.restore();
  ctx.strokeStyle = UI.frameEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(panelX, PANEL_Y, PANEL_W, PANEL_H);
  // Small corner tag so the two pictures read as a pair.
  roundBox(ctx, panelX + 10, PANEL_Y + 10, 34, 30, 8, 'rgba(13, 36, 54, 0.75)');
  label(ctx, panelX === LEFT_X ? 'A' : 'B', panelX + 27, PANEL_Y + 26, 18, '#f7ead0', 'center', 700);
}

function drawHeader(ctx, state) {
  const level = levelOf(state);
  ctx.fillStyle = UI.frame;
  ctx.fillRect(0, 0, CANVAS_W, HEADER_H);
  label(ctx, 'LANTERN HARBOR', 24, 24, 15, UI.gold, 'left', 700);
  label(ctx, `Level ${state.levelIndex + 1} — ${level.name}`, 24, 50, 19, '#f7ead0', 'left', 700);
  // Timer bar in the middle.
  const barX = 470;
  const barW = 340;
  const frac = Math.max(0, state.timeLeft / level.seconds);
  const low = state.timeLeft <= LOW_TIME_SECONDS && state.screen === 'playing';
  roundBox(ctx, barX, 22, barW, 20, 10, '#0a1a28');
  roundBox(ctx, barX, 22, Math.max(8, barW * frac), 20, 10, low ? UI.danger : UI.gold);
  ctx.font = "700 15px Georgia, 'Times New Roman', serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(13, 36, 54, 0.9)';
  ctx.lineWidth = 4;
  ctx.strokeText(formatTime(state.timeLeft), barX + barW / 2, 32);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(formatTime(state.timeLeft), barX + barW / 2, 32);
  label(ctx, low ? 'HURRY!' : 'TIME', barX + barW / 2, 56, 12, low ? UI.danger : UI.parchmentDark, 'center', 700);
  // Score and combo on the right.
  label(ctx, `SCORE  ${state.score.toLocaleString('en-US')}`, 1256, 26, 20, '#f7ead0', 'right', 700);
  if (state.combo >= 2) {
    roundBox(ctx, 1108, 40, 148, 26, 13, UI.coral);
    label(ctx, `COMBO x${state.combo}`, 1182, 53, 15, '#ffffff', 'center', 700);
  }
}

function drawFooter(ctx, state) {
  const level = levelOf(state);
  ctx.fillStyle = UI.frame;
  ctx.fillRect(0, 736, CANVAS_W, 64);
  const left = `Found ${state.found.size} / ${level.differences}  •  ${remaining(state)} to go`;
  label(ctx, left, 210, 768, 20, '#f7ead0', 'left', 700);
  const hintText = state.hintsLeft > 0
    ? `Hints: ${state.hintsLeft} left  (H) — costs 50`
    : 'No hints left';
  label(ctx, hintText, 520, 758, 14, UI.parchmentDark, 'left', 400);
  label(ctx, 'Hold Z or right-click to magnify', 520, 780, 14, UI.parchmentDark, 'left', 400);
  for (const r of buttonRegions(state)) {
    if (r.id === 'start' || r.id === 'next' || r.id === 'again' || r.id === 'resume' || r.id === 'restart-level') continue;
    const hovered = state.hover === r.id;
    roundBox(ctx, r.x, r.y, r.w, r.h, 9, hovered ? UI.gold : '#1d4258');
    const text = { hint: 'Hint (H)', sound: state.muted ? 'Muted' : 'Sound', pause: state.paused ? 'Resume' : 'Pause', restart: 'Restart' }[r.id];
    label(ctx, text, r.x + r.w / 2, r.y + r.h / 2 + 1, 15, hovered ? UI.ink : '#f7ead0', 'center', 700);
  }
}

// The loupe: a round 2x window onto the panel under the cursor, re-drawing
// that panel's scene and markers through a zoomed transform.
function drawLoupe(ctx, state, t, now) {
  if (!state.loupe) return;
  const { loupeX, loupeY } = state;
  let panelX = null;
  let mods = null;
  if (loupeX >= LEFT_X && loupeX <= LEFT_X + PANEL_W && loupeY >= PANEL_Y && loupeY <= PANEL_Y + PANEL_H) {
    panelX = LEFT_X;
    mods = new Set();
  } else if (loupeX >= RIGHT_X && loupeX <= RIGHT_X + PANEL_W && loupeY >= PANEL_Y && loupeY <= PANEL_Y + PANEL_H) {
    panelX = RIGHT_X;
    mods = allDiffIds(levelOf(state));
  } else {
    return;
  }
  const px = loupeX - panelX;
  const py = loupeY - PANEL_Y;
  const level = levelOf(state);
  const drawScene = SCENES[level.id];
  ctx.save();
  ctx.beginPath();
  ctx.arc(loupeX, loupeY, LOUPE_RADIUS, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#0d2436';
  ctx.fillRect(loupeX - LOUPE_RADIUS, loupeY - LOUPE_RADIUS, LOUPE_RADIUS * 2, LOUPE_RADIUS * 2);
  ctx.translate(loupeX, loupeY);
  ctx.scale(LOUPE_ZOOM, LOUPE_ZOOM);
  ctx.translate(-px, -py);
  drawScene(ctx, mods, t, level.seed);
  drawMarkers(ctx, state, now);
  ctx.restore();
  ring(ctx, loupeX, loupeY, LOUPE_RADIUS, 5, UI.goldBright);
  ring(ctx, loupeX, loupeY, LOUPE_RADIUS - 5, 2, UI.gold);
  line(ctx, loupeX + LOUPE_RADIUS * 0.7, loupeY + LOUPE_RADIUS * 0.7, loupeX + LOUPE_RADIUS + 26, loupeY + LOUPE_RADIUS + 26, UI.goldBright, 6);
}

function card(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(6, 20, 30, 0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
  roundBox(ctx, x, y, w, h, 18, UI.parchment);
  ctx.strokeStyle = UI.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 6, w - 12, h - 12, 14);
  ctx.stroke();
}

function bigButton(ctx, region, text, hovered) {
  roundBox(ctx, region.x, region.y, region.w, region.h, 12, hovered ? UI.goldBright : UI.gold);
  label(ctx, text, region.x + region.w / 2, region.y + region.h / 2 + 1, 22, UI.ink, 'center', 700);
}

function statRow(ctx, x, y, name, value) {
  label(ctx, name, x, y, 18, UI.inkSoft, 'left', 600);
  label(ctx, value, x + 420, y, 18, UI.ink, 'right', 700);
}

function drawTitle(ctx, state, t) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
  ctx.scale(2.14, 2.14);
  ctx.translate(-300, -320);
  drawHarbor(ctx, new Set(), 4.2, LEVELS[0].seed);
  ctx.restore();
  ctx.fillStyle = 'rgba(13, 36, 54, 0.62)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  label(ctx, 'LANTERN HARBOR', 640, 150, 64, UI.goldBright, 'center', 800);
  label(ctx, 'A spot-the-difference hunt in three harbors', 640, 205, 22, '#f7ead0', 'center', 400);
  label(ctx, 'Two pictures sit side by side. One of them is hiding changes.', 640, 280, 19, '#f7ead0', 'center', 400);
  label(ctx, 'Click a difference on either picture to ring it in gold.', 640, 310, 19, '#f7ead0', 'center', 400);
  label(ctx, 'Find them all before the clock runs out. Wrong clicks cost time.', 640, 340, 19, '#f7ead0', 'center', 400);
  label(ctx, 'H — hint    Z / right-click — magnifier    P — pause    M — sound', 640, 400, 17, UI.parchmentDark, 'center', 600);
  label(ctx, 'Level 1  Harbor Dawn — 7 differences — 2:00', 640, 440, 17, '#f7ead0', 'center', 600);
  label(ctx, 'Level 2  Lantern Market — 8 differences — 1:40', 640, 468, 17, '#f7ead0', 'center', 600);
  label(ctx, 'Level 3  Coral Garden — 10 differences — 1:30', 640, 496, 17, '#f7ead0', 'center', 600);
  const region = buttonRegions(state).find((r) => r.id === 'start');
  bigButton(ctx, region, 'START THE HUNT', state.hover === 'start');
  label(ctx, 'All art drawn in code — no downloads, no network', 640, 660, 14, UI.parchmentDark, 'center', 400);
}

function drawPaused(ctx, state) {
  card(ctx, 380, 220, 520, 320);
  label(ctx, 'Paused', 640, 290, 40, UI.ink, 'center', 800);
  label(ctx, 'Take a breath. The clock is waiting.', 640, 335, 17, UI.inkSoft, 'center', 400);
  const regions = buttonRegions(state);
  bigButton(ctx, regions.find((r) => r.id === 'resume'), 'RESUME', state.hover === 'resume');
  bigButton(ctx, regions.find((r) => r.id === 'restart-level'), 'RESTART LEVEL', state.hover === 'restart-level');
}

function drawLevelClear(ctx, state) {
  const level = levelOf(state);
  card(ctx, 380, 170, 520, 430);
  label(ctx, 'Level Clear!', 640, 235, 40, UI.ink, 'center', 800);
  label(ctx, level.name, 640, 275, 20, UI.coral, 'center', 700);
  statRow(ctx, 430, 330, 'Differences found', `${level.differences} / ${level.differences}`);
  statRow(ctx, 430, 362, 'Time left', formatTime(state.timeLeft));
  statRow(ctx, 430, 394, 'Accuracy', `${Math.round(state.levelAccuracy * 100)}%`);
  statRow(ctx, 430, 426, 'Level bonus', `+${state.levelBonus}`);
  statRow(ctx, 430, 458, 'Score', `${state.score.toLocaleString('en-US')}`);
  const region = buttonRegions(state).find((r) => r.id === 'next');
  bigButton(ctx, region, `NEXT — ${LEVELS[state.levelIndex + 1].name.toUpperCase()}`, state.hover === 'next');
}

function drawComplete(ctx, state) {
  card(ctx, 380, 160, 520, 450);
  label(ctx, 'You found them all!', 640, 225, 38, UI.ink, 'center', 800);
  label(ctx, 'Every difference, in every harbor.', 640, 265, 18, UI.inkSoft, 'center', 400);
  statRow(ctx, 430, 320, 'Differences found', `${state.totalFound} / ${state.totalDiffs}`);
  statRow(ctx, 430, 352, 'Best combo', `x${state.bestCombo}`);
  statRow(ctx, 430, 384, 'Accuracy', `${Math.round(accuracy(state) * 100)}%`);
  statRow(ctx, 430, 416, 'Final score', `${state.score.toLocaleString('en-US')}`);
  label(ctx, 'Thanks for playing Lantern Harbor.', 640, 470, 17, UI.inkSoft, 'center', 400);
  const region = buttonRegions(state).find((r) => r.id === 'again');
  bigButton(ctx, region, 'PLAY AGAIN', state.hover === 'again');
}

function drawTimeUp(ctx, state) {
  const level = levelOf(state);
  card(ctx, 380, 200, 520, 380);
  label(ctx, "Time's up!", 640, 270, 40, UI.ink, 'center', 800);
  label(ctx, `${level.name} kept ${remaining(state)} difference${remaining(state) === 1 ? '' : 's'} hidden.`, 640, 315, 18, UI.inkSoft, 'center', 400);
  statRow(ctx, 430, 370, 'Found', `${state.found.size} / ${level.differences}`);
  statRow(ctx, 430, 402, 'Score', `${state.score.toLocaleString('en-US')}`);
  const region = buttonRegions(state).find((r) => r.id === 'again');
  bigButton(ctx, region, 'TRY AGAIN', state.hover === 'again');
}

function drawToast(ctx, state, now) {
  if (!state.message || now >= state.messageUntil) return;
  const text = state.message;
  ctx.font = "600 17px Georgia, 'Times New Roman', serif";
  const w = ctx.measureText(text).width + 36;
  roundBox(ctx, (CANVAS_W - w) / 2, 690, w, 36, 18, 'rgba(13, 36, 54, 0.88)');
  label(ctx, text, CANVAS_W / 2, 709, 17, '#ffd76a', 'center', 600);
}

export function paint(ctx, state, sparks, t, now) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = UI.frame;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  if (state.screen === 'title') {
    drawTitle(ctx, state, t);
    return;
  }
  drawHeader(ctx, state);
  drawPanel(ctx, state, LEFT_X, new Set(), t, now);
  drawPanel(ctx, state, RIGHT_X, allDiffIds(levelOf(state)), t, now);
  drawSparks(ctx, sparks);
  drawFooter(ctx, state);
  drawLoupe(ctx, state, t, now);
  drawToast(ctx, state, now);
  if (state.screen === 'paused') drawPaused(ctx, state);
  if (state.screen === 'levelclear') drawLevelClear(ctx, state);
  if (state.screen === 'complete') drawComplete(ctx, state);
  if (state.screen === 'timeup') drawTimeUp(ctx, state);
}
