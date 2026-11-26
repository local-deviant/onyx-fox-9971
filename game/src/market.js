// Lantern Harbor — market: the Lantern Market scene, level two.
// A night street market under paper lanterns: stalls, a tea sign, a roof
// cat, a kite and string lights. Same contract as the harbor scene — drawn
// plain for the left panel, with every difference in `mods` for the right.

import { blob, circle, disc, ellipse, label, line, poly, skyGradient } from './drawkit.js';
import { range, rngFor } from './rng.js';

function paperLantern(ctx, x, y, r, color, glow) {
  if (glow) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    disc(ctx, x, y, r + 16, color);
    ctx.restore();
  }
  disc(ctx, x, y, r, color);
  ctx.strokeStyle = 'rgba(34, 48, 58, 0.55)';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.82, r * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y + i * r * 0.45);
    ctx.lineTo(x + r * 0.7, y + i * r * 0.45);
    ctx.stroke();
  }
  ctx.fillStyle = '#f2b234';
  ctx.fillRect(x - 4, y - r - 5, 8, 5);
  ctx.fillRect(x - 4, y + r, 8, 5);
}

function stringLights(ctx, mods, t) {
  // A sagging wire across the top with glowing bulbs.
  ctx.strokeStyle = '#22303a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.quadraticCurveTo(300, 78, 600, 30);
  ctx.stroke();
  for (let i = 0; i <= 12; i += 1) {
    const u = i / 12;
    const x = u * 600;
    const y = 34 + Math.sin(u * Math.PI) * 40 + (u < 0.5 ? u * -4 : 0);
    const flicker = 0.75 + 0.25 * Math.sin(t * 2 + i * 1.7);
    const colors = ['#f2b234', '#e4572e', '#2a9d8f', '#f7ead0'];
    const color = colors[i % 4];
    const dark = mods.has('bulb') && i === 5;
    ctx.save();
    if (!dark) ctx.globalAlpha = flicker;
    disc(ctx, x, y + 12, 7, dark ? '#3a4a54' : color);
    ctx.restore();
    line(ctx, x, y, x, y + 6, '#22303a', 1.5);
  }
}

function moon(ctx, mods) {
  if (mods.has('moon')) {
    disc(ctx, 522, 68, 26, '#f7ead0');
    disc(ctx, 512, 62, 5, '#d8c9a3');
    disc(ctx, 530, 74, 4, '#d8c9a3');
    disc(ctx, 518, 78, 3, '#d8c9a3');
  } else {
    disc(ctx, 522, 68, 26, '#f7ead0');
    disc(ctx, 536, 60, 23, '#1d2f45');
  }
}

function roofCat(ctx, x, y) {
  // A cat sitting on the roof ridge, tail curled around its paws.
  ctx.fillStyle = '#1c2733';
  blob(ctx, x, y, 16, 12, '#1c2733');
  circle(ctx, x - 2, y - 14, 9);
  poly(ctx, [[x - 9, y - 20], [x - 5, y - 28], [x - 2, y - 20]], '#1c2733');
  poly(ctx, [[x + 3, y - 21], [x + 7, y - 28], [x + 10, y - 20]], '#1c2733');
  ctx.strokeStyle = '#1c2733';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x + 14, y + 4, 9, -0.4, 1.8);
  ctx.stroke();
}

function teaStall(ctx, mods, t) {
  // Left stall: striped awning, hanging tea sign, counter with cups.
  const stripes = mods.has('awning') ? 4 : 5;
  for (let i = 0; i < stripes; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#e4572e' : '#f7ead0';
    ctx.fillRect(118 + i * 32, 282, 32, 26);
  }
  ctx.fillStyle = '#22303a';
  ctx.fillRect(118, 306, 164, 6);
  line(ctx, 118, 282, 118, 420, '#5a4632', 5);
  line(ctx, 282, 282, 282, 420, '#5a4632', 5);
  // Hanging sign: a teapot on the left, a cup on the right.
  ctx.fillStyle = '#f7ead0';
  ctx.fillRect(276, 196, 52, 44);
  ctx.strokeStyle = '#22303a';
  ctx.lineWidth = 2;
  ctx.strokeRect(276, 196, 52, 44);
  line(ctx, 302, 196, 302, 184, '#22303a', 2);
  if (mods.has('sign')) {
    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(290, 214, 24, 14);
    ctx.fillRect(314, 218, 5, 6);
  } else {
    ctx.fillStyle = '#e4572e';
    blob(ctx, 302, 218, 11, 9, '#e4572e');
    poly(ctx, [[291, 216], [284, 210], [291, 208]], '#e4572e');
    line(ctx, 302, 208, 302, 204, '#e4572e', 2);
  }
  // Counter and tea cups.
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(118, 420, 164, 60);
  ctx.fillStyle = '#6e4526';
  ctx.fillRect(118, 420, 164, 10);
  for (const [cx, col] of [[150, '#2a9d8f'], [196, '#e4572e'], [242, '#f2b234']]) {
    ctx.fillStyle = col;
    ctx.fillRect(cx, 404, 20, 16);
  }
  // The vendor, apron and all, behind the counter.
  ctx.fillStyle = '#f2c9a0';
  circle(ctx, 200, 372, 16);
  ctx.fillStyle = '#33566b';
  blob(ctx, 200, 404, 26, 22, '#33566b');
  ctx.fillStyle = '#f7ead0';
  ctx.fillRect(184, 392, 32, 30);
  ctx.fillStyle = '#22303a';
  ctx.fillRect(186, 362, 28, 7);
}

function rightStall(ctx, t) {
  // Right stall: indigo awning, silk scarves, a basket of oranges.
  ctx.fillStyle = '#33566b';
  poly(ctx, [[330, 300], [560, 300], [548, 330], [342, 330]], '#33566b');
  ctx.fillStyle = '#f2b234';
  for (let x = 336; x < 556; x += 24) {
    poly(ctx, [[x, 300], [x + 12, 300], [x + 6, 330]], '#f2b234');
  }
  line(ctx, 334, 300, 334, 430, '#5a4632', 5);
  line(ctx, 556, 300, 556, 430, '#5a4632', 5);
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(334, 430, 222, 56);
  // Silk scarves swaying on the rail.
  const sway = Math.sin(t * 1.2) * 3;
  for (const [sx, col] of [[360, '#e4572e'], [410, '#2a9d8f'], [460, '#f2b234'], [510, '#c94f38']]) {
    ctx.fillStyle = col;
    ctx.fillRect(sx + sway, 336, 26, 66);
  }
}

export function drawMarket(ctx, mods, t, seed) {
  const rng = rngFor(seed);
  skyGradient(ctx, 0, 0, 600, 640, '#141c33', '#2c3a5e');
  // Stars.
  for (let i = 0; i < 26; i += 1) {
    disc(ctx, range(rng, 8, 592), range(rng, 6, 170), range(rng, 1, 2.4), 'rgba(247, 234, 208, 0.8)');
  }
  moon(ctx, mods);
  // The kite, high on the left, only on the left panel.
  if (!mods.has('kite')) {
    const sway = Math.sin(t * 0.8) * 6;
    ctx.save();
    ctx.translate(420 + sway, 88);
    ctx.rotate(0.35);
    poly(ctx, [[0, -22], [16, 0], [0, 22], [-16, 0]], '#e4572e');
    poly(ctx, [[0, -22], [16, 0], [0, 0], [-16, 0]], '#f2b234');
    line(ctx, 0, 22, -6, 52, '#f7ead0', 1.5);
    disc(ctx, -3, 34, 3, '#2a9d8f');
    disc(ctx, -6, 46, 3, '#f2b234');
    ctx.restore();
  }
  stringLights(ctx, mods, t);
  // Rooftops with tiles and the cat.
  ctx.fillStyle = '#22303a';
  poly(ctx, [[0, 240], [180, 180], [360, 240], [360, 260], [0, 260]], '#22303a');
  poly(ctx, [[380, 220], [520, 168], [600, 210], [600, 260], [380, 260]], '#2c3a4e');
  ctx.fillStyle = '#c94f38';
  for (let x = 8; x < 350; x += 24) ctx.fillRect(x, 238, 18, 6);
  for (let x = 388; x < 596; x += 24) ctx.fillRect(x, 218, 18, 6);
  if (!mods.has('cat')) roofCat(ctx, 482, 168);
  // Windows glowing warm on both buildings.
  for (const [wx, wy] of [[80, 300], [150, 300], [430, 290], [520, 290]]) {
    ctx.fillStyle = '#ffd76a';
    ctx.fillRect(wx, wy, 22, 30);
    ctx.strokeStyle = '#22303a';
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, wy, 22, 30);
    line(ctx, wx + 11, wy, wx + 11, wy + 30, '#22303a', 2);
  }
  // Paper lanterns: the one at (148, 142) changes colour on the right.
  paperLantern(ctx, 148, 142, 22, mods.has('lantern') ? '#f2b234' : '#e4572e', true);
  paperLantern(ctx, 88, 200, 16, '#f2b234', true);
  paperLantern(ctx, 560, 160, 18, '#e4572e', true);
  paperLantern(ctx, 372, 130, 14, '#2a9d8f', true);
  paperLantern(ctx, 250, 96, 12, '#f7ead0', true);
  teaStall(ctx, mods, t);
  rightStall(ctx, t);
  // Cobblestone street.
  ctx.fillStyle = '#3a3f4d';
  ctx.fillRect(0, 486, 600, 154);
  ctx.strokeStyle = 'rgba(247, 234, 208, 0.16)';
  ctx.lineWidth = 1.5;
  for (let y = 500; y < 640; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }
  for (let i = 0; i < 20; i += 1) {
    const x = range(rng, 10, 590);
    const y = range(rng, 500, 630);
    ellipse(ctx, x, y, range(rng, 12, 22), 8);
    ctx.stroke();
  }
  // The fruit basket on the street: apples left, oranges right.
  ctx.fillStyle = '#8a5a34';
  ellipse(ctx, 330, 492, 42, 14);
  ctx.fill();
  const fruitColor = mods.has('fruit') ? '#e8862e' : '#c94f38';
  for (const [fx, fy] of [[306, 472], [326, 464], [346, 472], [316, 480], [338, 480]]) {
    disc(ctx, fx, fy, 10, fruitColor);
    line(ctx, fx, fy - 10, fx + 3, fy - 15, '#3d9970', 2);
  }
  // A child with a lantern, watching the stalls.
  ctx.fillStyle = '#f2c9a0';
  circle(ctx, 470, 540, 13);
  ctx.fillStyle = '#e4572e';
  blob(ctx, 470, 568, 20, 24, '#e4572e');
  line(ctx, 470, 592, 462, 622, '#22303a', 5);
  line(ctx, 470, 592, 480, 622, '#22303a', 5);
  paperLantern(ctx, 500, 552, 10, '#f2b234', false);
  label(ctx, 'LANTERN MARKET', 300, 622, 15, 'rgba(247, 234, 208, 0.85)', 'center', 700);
}
