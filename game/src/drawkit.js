// Lantern Harbor — drawkit: the small shapes every scene is built from.
// One place for circles, rounded boxes, stars, gradients and text so the
// scene files read like a description of the picture, not canvas plumbing.

export function circle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
}

export function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

export function disc(ctx, x, y, radius, fill) {
  ctx.fillStyle = fill;
  circle(ctx, x, y, radius);
  ctx.fill();
}

export function ring(ctx, x, y, radius, width, stroke) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  circle(ctx, x, y, radius);
  ctx.stroke();
}

export function blob(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ellipse(ctx, x, y, rx, ry);
  ctx.fill();
}

export function roundBox(ctx, x, y, w, h, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

export function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

export function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// A five-pointed star, drawn point-up, for sparkles and starfish.
export function star(ctx, x, y, outer, inner, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

export function skyGradient(ctx, x, y, w, h, top, bottom) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

export function label(ctx, text, x, y, size, fill, align, weight) {
  ctx.fillStyle = fill;
  ctx.font = `${weight || 600} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

export function softShadow(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(6, 20, 30, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
}
