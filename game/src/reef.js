// Lantern Harbor — reef: the Coral Garden scene, level three.
// A reef asleep under the waves: a turtle, a seahorse, a treasure chest,
// a school of fish and a manta ray gliding past. Same contract as the other
// scenes — plain on the left, every difference applied on the right.

import { blob, circle, disc, ellipse, label, line, poly, ring, skyGradient, star } from './drawkit.js';
import { range, rngFor } from './rng.js';

function lightRays(ctx, t) {
  ctx.save();
  ctx.globalAlpha = 0.1 + 0.03 * Math.sin(t * 0.4);
  ctx.fillStyle = '#bfe8d8';
  for (const [x, w] of [[80, 60], [260, 90], [440, 70]]) {
    poly(ctx, [[x, 0], [x + w, 0], [x + w + 60, 420], [x + 60, 420]], '#bfe8d8');
  }
  ctx.restore();
}

function mantaRay(ctx, x, y, t) {
  const flap = Math.sin(t * 1.1) * 6;
  ctx.fillStyle = '#33566b';
  ctx.beginPath();
  ctx.moveTo(x - 70, y - flap);
  ctx.quadraticCurveTo(x - 20, y - 26, x, y - 8);
  ctx.quadraticCurveTo(x + 20, y - 26, x + 70, y - flap);
  ctx.quadraticCurveTo(x + 30, y + 10, x, y + 12);
  ctx.quadraticCurveTo(x - 30, y + 10, x - 70, y - flap);
  ctx.fill();
  line(ctx, x, y + 10, x - 6, y + 46, '#33566b', 3);
}

function littleFish(ctx, x, y, dir, color, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  blob(ctx, 0, 0, 13 * size, 7 * size, color);
  poly(ctx, [[-11 * size, 0], [-19 * size, -7 * size], [-19 * size, 7 * size]], color);
  disc(ctx, 5 * size, -2 * size, 1.6, '#22303a');
  ctx.restore();
}

function turtle(ctx, mods, t) {
  const swim = Math.sin(t * 0.8) * 4;
  ctx.save();
  ctx.translate(300, 300 + swim);
  // Flippers.
  ctx.fillStyle = '#3d9970';
  ellipse(ctx, -52, -14, 22, 9);
  ctx.fill();
  ellipse(ctx, 52, -14, 22, 9);
  ctx.fill();
  ellipse(ctx, -48, 18, 18, 8);
  ctx.fill();
  ellipse(ctx, 48, 18, 18, 8);
  ctx.fill();
  // Shell with five spots; one spot is missing on the right panel.
  blob(ctx, 0, 0, 62, 40, '#2a7a5c');
  blob(ctx, 0, -4, 50, 30, '#3d9970');
  const spots = [[-28, -8], [0, -16], [28, -8], [-14, 12], [16, 12]];
  const shown = mods.has('spots') ? spots.slice(0, 4) : spots;
  for (const [sx, sy] of shown) disc(ctx, sx, sy, 7, '#f2b234');
  // Head and tail.
  circle(ctx, 72, -2, 13);
  ctx.fillStyle = '#3d9970';
  ctx.fill();
  disc(ctx, 78, -5, 2, '#22303a');
  poly(ctx, [[-60, 0], [-76, -6], [-76, 6]], '#3d9970');
  ctx.restore();
}

function seahorse(ctx, x, y, t) {
  const sway = Math.sin(t * 1.3) * 3;
  ctx.save();
  ctx.translate(x + sway, y);
  ctx.strokeStyle = '#e8862e';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.quadraticCurveTo(10, -10, 2, 8);
  ctx.quadraticCurveTo(-4, 22, 6, 30);
  ctx.stroke();
  ctx.fillStyle = '#e8862e';
  circle(ctx, -6, -32, 8);
  ctx.fill();
  poly(ctx, [[-12, -38], [-16, -46], [-8, -40]], '#e8862e');
  disc(ctx, -9, -33, 1.8, '#22303a');
  ctx.strokeStyle = '#e8862e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.lineTo(18, -2);
  ctx.stroke();
  ctx.restore();
}

function treasureChest(ctx, mods, t) {
  ctx.save();
  ctx.translate(150, 540);
  ctx.fillStyle = '#6e4526';
  ctx.fillRect(-42, -8, 84, 44);
  ctx.fillStyle = '#8a5a34';
  ctx.beginPath();
  ctx.ellipse(0, -8, 42, 20, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#f2b234';
  ctx.fillRect(-6, -8, 12, 44);
  ctx.fillRect(-42, 8, 84, 6);
  // Gems spilling out: red on the left, blue on the right.
  const gem = mods.has('gems') ? '#4a90d9' : '#e4572e';
  for (const [gx, gy, gr] of [[-26, -14, 6], [-8, -18, 7], [12, -14, 6], [28, -10, 5]]) {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(0.6);
    ctx.fillStyle = gem;
    ctx.fillRect(-gr, -gr, gr * 2, gr * 2);
    ctx.restore();
  }
  ctx.restore();
}

function anemone(ctx, mods, t) {
  // Waving tentacles; the clownfish hides among them only on the left.
  ctx.save();
  ctx.translate(350, 520);
  for (let i = -4; i <= 4; i += 1) {
    const sway = Math.sin(t * 1.5 + i) * 5;
    ctx.strokeStyle = '#c96a9b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(i * 7, 0);
    ctx.quadraticCurveTo(i * 7 + sway, -18, i * 7 + sway * 1.4, -30);
    ctx.stroke();
    disc(ctx, i * 7 + sway * 1.4, -30, 3, '#f7ead0');
  }
  if (!mods.has('clownfish')) {
    ctx.fillStyle = '#e8862e';
    blob(ctx, 4, -14, 13, 7, '#e8862e');
    poly(ctx, [[-8, -14], [-15, -20], [-15, -8]], '#e8862e');
    ctx.fillStyle = '#f7ead0';
    ctx.fillRect(-2, -20, 4, 12);
    disc(ctx, 12, -16, 1.6, '#22303a');
  }
  ctx.restore();
}

export function drawReef(ctx, mods, t, seed) {
  const rng = rngFor(seed);
  skyGradient(ctx, 0, 0, 600, 560, '#2a7a8c', '#14425e');
  skyGradient(ctx, 0, 540, 600, 100, '#d8c9a3', '#b89a6a');
  lightRays(ctx, t);
  // The manta ray glides past only on the left panel.
  if (!mods.has('ray')) mantaRay(ctx, 250, 120, t);
  // The school: five fish on the left, four on the right.
  const school = [[392, 138], [414, 152], [436, 140], [404, 168], [448, 164]];
  const shown = mods.has('school') ? school.slice(0, 4) : school;
  for (const [fx, fy] of shown) littleFish(ctx, fx, fy, 1, '#f2b234', 1);
  littleFish(ctx, 120, 180, 1, '#7fb3c8', 1.2);
  littleFish(ctx, 540, 260, -1, '#e4572e', 0.9);
  turtle(ctx, mods, t);
  if (!mods.has('seahorse')) seahorse(ctx, 500, 200, t);
  // Branching corals along the sand.
  const coralSpots = [
    [60, 520, '#e4572e'],
    [200, 450, mods.has('coral') ? '#8a6fd9' : '#e88aa0'],
    [270, 540, '#f2b234'],
    [440, 500, '#2a9d8f'],
    [560, 540, '#e4572e'],
  ];
  for (const [cx, cy, col] of coralSpots) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 40);
    ctx.quadraticCurveTo(cx - 14, cy, cx - 8, cy - 34);
    ctx.moveTo(cx, cy + 40);
    ctx.quadraticCurveTo(cx + 6, cy - 6, cx + 16, cy - 44);
    ctx.moveTo(cx, cy + 40);
    ctx.quadraticCurveTo(cx + 18, cy + 10, cx + 26, cy - 18);
    ctx.stroke();
    disc(ctx, cx - 8, cy - 34, 6, col);
    disc(ctx, cx + 16, cy - 44, 6, col);
    disc(ctx, cx + 26, cy - 18, 5, col);
  }
  // Bubble trails rising from the sand.
  for (let i = 0; i < 8; i += 1) {
    const bx = 520 + Math.sin(i * 2.1) * 8;
    const by = 452 - i * 12 - ((t * 14 + i * 30) % 60);
    ring(ctx, bx, by, 3 + (i % 3), 1.5, 'rgba(247, 234, 208, 0.7)');
  }
  // The sixth bubble is missing on the right panel: paint over it.
  if (mods.has('bubbles')) {
    disc(ctx, 520 + Math.sin(5 * 2.1) * 8, 452 - 5 * 12 - ((t * 14 + 5 * 30) % 60), 6, '#14425e');
  }
  anemone(ctx, mods, t);
  treasureChest(ctx, mods, t);
  // Starfish on the sand: five arms left, four right.
  ctx.save();
  ctx.translate(92, 600);
  ctx.rotate(mods.has('arms') ? 0.2 : 0);
  star(ctx, 0, 0, 22, 9, '#e8862e');
  if (mods.has('arms')) {
    // Paint one arm away with sand colour.
    poly(ctx, [[0, 0], [20, -8], [30, -2], [20, 8]], '#b89a6a');
  }
  ctx.restore();
  // A shell on the sand, only on the left panel.
  if (!mods.has('shell')) {
    ctx.save();
    ctx.translate(480, 600);
    ctx.fillStyle = '#f7ead0';
    ctx.beginPath();
    ctx.arc(0, 0, 14, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#d8a0a0';
    ctx.lineWidth = 1.6;
    for (let i = -2; i <= 2; i += 1) line(ctx, i * 4, -2, i * 5, -12, '#d8a0a0', 1.6);
    ctx.restore();
  }
  // Pebbles and shells scattered on the sand.
  for (let i = 0; i < 16; i += 1) {
    disc(ctx, range(rng, 10, 590), range(rng, 560, 634), range(rng, 2, 5), '#8d7c66');
  }
  label(ctx, 'CORAL GARDEN', 300, 622, 15, 'rgba(34, 48, 58, 0.8)', 'center', 700);
}
