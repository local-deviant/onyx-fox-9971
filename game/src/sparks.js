// Lantern Harbor — sparks: the celebration on every find.
// Gold starbursts that fly out from a found difference and the floating
// "+200" that rises and fades, plus the red puff that marks a miss. Pure
// presentation: nothing here changes the score or the state.

import { disc, star } from './drawkit.js';

export function freshSparks() {
  return { bursts: [], floats: [], puffs: [] };
}

export function burst(sparks, x, y, color) {
  const pieces = [];
  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * Math.PI * 2;
    const speed = 60 + (i % 5) * 22;
    pieces.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      life: 0.9,
      size: 4 + (i % 3) * 2,
    });
  }
  sparks.bursts.push({ pieces, color: color || '#ffd76a', age: 0 });
}

export function floatText(sparks, x, y, text, color) {
  sparks.floats.push({ x, y, text, color: color || '#ffd76a', age: 0 });
}

export function puff(sparks, x, y) {
  sparks.puffs.push({ x, y, age: 0 });
}

export function updateSparks(sparks, dt) {
  for (const b of sparks.bursts) {
    b.age += dt;
    for (const p of b.pieces) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 140 * dt;
      p.life -= dt;
    }
  }
  sparks.bursts = sparks.bursts.filter((b) => b.age < 1.1);
  for (const f of sparks.floats) {
    f.age += dt;
    f.y -= 34 * dt;
  }
  sparks.floats = sparks.floats.filter((f) => f.age < 1.2);
  for (const p of sparks.puffs) p.age += dt;
  sparks.puffs = sparks.puffs.filter((p) => p.age < 0.5);
}

export function drawSparks(ctx, sparks) {
  for (const b of sparks.bursts) {
    const fade = Math.max(0, 1 - b.age);
    ctx.save();
    ctx.globalAlpha = fade;
    for (const p of b.pieces) {
      if (p.life <= 0) continue;
      star(ctx, p.x, p.y, p.size, p.size * 0.45, b.color);
    }
    ctx.restore();
  }
  for (const f of sparks.floats) {
    const fade = Math.max(0, 1 - f.age / 1.2);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = f.color;
    ctx.font = "700 26px Georgia, 'Times New Roman', serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(34, 48, 58, 0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
  for (const p of sparks.puffs) {
    const fade = Math.max(0, 1 - p.age / 0.5);
    ctx.save();
    ctx.globalAlpha = fade;
    disc(ctx, p.x, p.y, 10 + p.age * 40, '#d64541');
    ctx.strokeStyle = '#f7ead0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x - 8, p.y - 8);
    ctx.lineTo(p.x + 8, p.y + 8);
    ctx.moveTo(p.x + 8, p.y - 8);
    ctx.lineTo(p.x - 8, p.y + 8);
    ctx.stroke();
    ctx.restore();
  }
}
