// Lantern Harbor — rng: a small seeded generator for every decoration that
// must look the same on every run. One seed per level (see tuning.js); the
// same seed always scatters the same stars, bubbles and pebbles, so a
// screenshot staged today matches the game a player opens tomorrow.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A fresh generator for one panel paint. Scenes call this at the top of
// their draw function so decorative scatter never drifts between frames.
export function rngFor(seed) {
  return mulberry32(seed);
}

export function range(rng, low, high) {
  return low + rng() * (high - low);
}

export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

export function chance(rng, probability) {
  return rng() < probability;
}

// Shuffle a copy of a list with the seeded generator (Fisher-Yates).
export function shuffle(rng, list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
