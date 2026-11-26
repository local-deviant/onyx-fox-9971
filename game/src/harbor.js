// Lantern Harbor — harbor: the Harbor Dawn scene, level one.
// A fishing harbor at first light: lighthouse, two boats, a dock, crates and
// gulls. Drawn twice per frame — once plain for the left panel, once with
// every difference in `mods` applied for the right panel — in panel-local
// coordinates (600 x 640), with the origin already at the panel's top left.
// `t` is seconds since the level began; staged screenshots pass a fixed `t`.

import { blob, disc, label, line, poly, ring, skyGradient } from './drawkit.js';
import { range, rngFor } from './rng.js';

const SKY_TOP = '#f7c98b';
const SKY_BOTTOM = '#a8c8d8';
const SEA_TOP = '#3f7f8f';
const SEA_BOTTOM = '#1e4a5c';

function gull(ctx, x, y, scale, ink) {
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.4 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11 * scale, y);
  ctx.quadraticCurveTo(x - 5 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 5 * scale, y - 8 * scale, x + 11 * scale, y);
  ctx.stroke();
}

function sun(ctx, x, y, withRays, t) {
  if (withRays) {
    ctx.strokeStyle = 'rgba(242, 178, 52, 0.85)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2 + t * 0.02;
      line(ctx, x + Math.cos(a) * 48, y + Math.sin(a) * 48, x + Math.cos(a) * 64, y + Math.sin(a) * 64, 'rgba(242, 178, 52, 0.85)', 4);
    }
  }
  disc(ctx, x, y, 38, '#f6b73c');
  disc(ctx, x, y, 30, '#ffd76a');
}

function lighthouse(ctx, mods, t) {
  // Rocky point and tower on the left edge.
  poly(ctx, [[28, 330], [150, 330], [168, 300], [10, 300]], '#7a6a58');
  poly(ctx, [[52, 300], [140, 300], [150, 250], [44, 250]], '#8d7c66');
  // Tower: red and white bands.
  ctx.fillStyle = '#e8e2d4';
  ctx.fillRect(78, 128, 56, 172);
  ctx.fillStyle = '#c94f38';
  ctx.fillRect(78, 168, 56, 26);
  ctx.fillRect(78, 228, 56, 26);
  // Lamp room and its slow beam.
  ctx.fillStyle = '#22303a';
  ctx.fillRect(72, 106, 68, 24);
  disc(ctx, 106, 118, 9, '#ffe9a8');
  const beam = 0.35 + 0.12 * Math.sin(t * 0.5);
  ctx.save();
  ctx.globalAlpha = beam;
  poly(ctx, [[140, 118], [300, 92], [300, 144]], 'rgba(255, 233, 168, 0.55)');
  ctx.restore();
  // Three lamp-room windows; the middle one goes dark on the right panel.
  disc(ctx, 96, 152, 5, '#ffe9a8');
  disc(ctx, 106, 182, 5, mods.has('window') ? '#22303a' : '#ffe9a8');
  disc(ctx, 116, 212, 5, '#ffe9a8');
  ctx.fillStyle = '#22303a';
  ctx.fillRect(72, 100, 68, 8);
}

function sailboat(ctx, mods, t) {
  const bob = Math.sin(t * 0.9) * 3;
  ctx.save();
  ctx.translate(0, bob);
  // Mast, sail and flag.
  line(ctx, 178, 330, 178, 252, '#5a4632', 5);
  poly(ctx, [[182, 258], [232, 322], [182, 322]], '#f7ead0');
  poly(ctx, [[174, 262], [146, 320], [174, 320]], '#e4572e');
  // The flag: red on the left panel, teal on the right.
  poly(ctx, [[178, 256], [206, 264], [178, 272]], mods.has('flag') ? '#2a9d8f' : '#e4572e');
  // Hull.
  poly(ctx, [[138, 330], [222, 330], [204, 356], [156, 356]], '#8a5a34');
  ctx.fillStyle = '#6e4526';
  ctx.fillRect(138, 330, 84, 7);
  disc(ctx, 160, 344, 4, '#f2b234');
  disc(ctx, 200, 344, 4, '#f2b234');
  ctx.restore();
}

function trawler(ctx, t) {
  const bob = Math.sin(t * 0.7 + 1.2) * 3;
  ctx.save();
  ctx.translate(0, bob);
  poly(ctx, [[372, 428], [512, 428], [488, 462], [396, 462]], '#33566b');
  ctx.fillStyle = '#22303a';
  ctx.fillRect(372, 428, 140, 8);
  // Cabin and nets.
  ctx.fillStyle = '#f7ead0';
  ctx.fillRect(408, 392, 64, 36);
  ctx.fillStyle = '#2a9d8f';
  ctx.fillRect(420, 402, 14, 14);
  ctx.fillRect(444, 402, 14, 14);
  line(ctx, 452, 392, 452, 352, '#5a4632', 4);
  line(ctx, 452, 352, 500, 428, '#8d7c66', 2);
  ctx.strokeStyle = '#d8c9a3';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(458, 360);
  ctx.lineTo(498, 424);
  ctx.lineTo(470, 424);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function dockAndCrates(ctx, mods, t) {
  // Wooden pier from the right edge.
  ctx.fillStyle = '#6e5138';
  ctx.fillRect(500, 496, 100, 14);
  ctx.fillStyle = '#7d5f42';
  for (let x = 504; x < 596; x += 18) ctx.fillRect(x, 496, 13, 14);
  ctx.fillStyle = '#5a4632';
  ctx.fillRect(516, 510, 8, 34);
  ctx.fillRect(576, 510, 8, 34);
  // A coil of rope on the pier.
  ring(ctx, 548, 500, 9, 3, '#d8c9a3');
  // Crates stacked on the shore, bottom left. The top crate is missing
  // on the right panel.
  ctx.fillStyle = '#b98a4a';
  ctx.fillRect(56, 522, 40, 40);
  ctx.fillRect(100, 522, 40, 40);
  ctx.strokeStyle = '#7d5f42';
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 522, 40, 40);
  ctx.strokeRect(100, 522, 40, 40);
  line(ctx, 56, 522, 96, 562, '#7d5f42', 2);
  line(ctx, 100, 522, 140, 562, '#7d5f42', 2);
  if (!mods.has('crates')) {
    ctx.fillStyle = '#c99a58';
    ctx.fillRect(78, 482, 40, 40);
    ctx.strokeStyle = '#7d5f42';
    ctx.strokeRect(78, 482, 40, 40);
    line(ctx, 78, 482, 118, 522, '#7d5f42', 2);
  }
  // The extra buoy floats by the dock only on the right panel.
  if (mods.has('buoy')) {
    const bob = Math.sin(t * 1.1 + 0.6) * 2;
    ctx.save();
    ctx.translate(516, 556 + bob);
    disc(ctx, 0, 0, 15, '#e4572e');
    ctx.fillStyle = '#f7ead0';
    ctx.fillRect(-15, -4, 30, 8);
    disc(ctx, 0, -12, 4, '#22303a');
    ctx.restore();
  }
  // The jumping fish arcs out of the water only on the left panel.
  if (!mods.has('fish')) {
    const hop = Math.sin(t * 1.4) * 6;
    ctx.save();
    ctx.translate(382, 478 + hop);
    ctx.rotate(-0.5);
    blob(ctx, 0, 0, 20, 8, '#7fb3c8');
    poly(ctx, [[-18, 0], [-30, -9], [-30, 9]], '#7fb3c8');
    disc(ctx, 10, -2, 2, '#22303a');
    ctx.restore();
    ctx.strokeStyle = 'rgba(247, 234, 208, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(382, 500, 16, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
}

export function drawHarbor(ctx, mods, t, seed) {
  const rng = rngFor(seed);
  // Dawn sky and sea.
  skyGradient(ctx, 0, 0, 600, 300, SKY_TOP, SKY_BOTTOM);
  skyGradient(ctx, 0, 300, 600, 340, SEA_TOP, SEA_BOTTOM);
  // Fading stars and drifting clouds.
  for (let i = 0; i < 14; i += 1) {
    const x = range(rng, 10, 590);
    const y = range(rng, 8, 150);
    disc(ctx, x, y, range(rng, 1, 2.2), 'rgba(255, 247, 220, 0.75)');
  }
  for (let i = 0; i < 3; i += 1) {
    const x = range(rng, 40, 520);
    const y = range(rng, 40, 150);
    blob(ctx, x, y, 46, 13, 'rgba(247, 234, 208, 0.55)');
    blob(ctx, x + 28, y + 6, 34, 10, 'rgba(247, 234, 208, 0.45)');
  }
  sun(ctx, 478, 88, !mods.has('sunrays'), t);
  // Gulls: three on the left, the middle one missing on the right.
  gull(ctx, 250, 70, 1, '#22303a');
  if (!mods.has('gull')) gull(ctx, 305, 92, 1, '#22303a');
  gull(ctx, 360, 60, 0.85, '#22303a');
  // Distant headland.
  poly(ctx, [[0, 300], [120, 262], [260, 300]], '#5b7d8c');
  lighthouse(ctx, mods, t);
  // Water lines and reflections.
  ctx.strokeStyle = 'rgba(247, 234, 208, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i += 1) {
    const y = 330 + i * 30;
    const x = range(rng, 30, 420);
    const w = range(rng, 40, 120);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  }
  sailboat(ctx, mods, t);
  trawler(ctx, t);
  // Buoys bobbing in the channel.
  for (const [bx, by] of [[300, 540], [430, 580], [250, 600]]) {
    const bob = Math.sin(t + bx) * 2;
    disc(ctx, bx, by + bob, 9, '#e4572e');
    ctx.fillStyle = '#f7ead0';
    ctx.fillRect(bx - 9, by + bob - 3, 18, 6);
  }
  dockAndCrates(ctx, mods, t);
  // Shore pebbles at the bottom edge.
  for (let i = 0; i < 12; i += 1) {
    disc(ctx, range(rng, 10, 590), range(rng, 622, 636), range(rng, 2, 5), '#8d7c66');
  }
  // A quiet caption baked into the scene, like a postcard.
  label(ctx, 'HARBOR DAWN', 300, 616, 15, 'rgba(247, 234, 208, 0.85)', 'center', 700);
}
