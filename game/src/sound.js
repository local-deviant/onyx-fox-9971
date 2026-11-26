// Lantern Harbor — sound: every sound the game makes, synthesised live.
// No audio files: a few oscillators and a noise buffer through WebAudio.
// The context is created on the first gesture (browsers demand that), and
// everything stays silent until then. Mute toggles the master gain.

let audio = null;
let master = null;
let muted = false;

function ensure() {
  if (audio) return true;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return false;
    audio = new Ctor();
    master = audio.createGain();
    master.gain.value = 0.5;
    master.connect(audio.destination);
    return true;
  } catch {
    return false;
  }
}

export function primeSound() {
  if (ensure() && audio.state === 'suspended') audio.resume();
}

export function setMuted(value) {
  muted = value;
  if (master) master.gain.value = muted ? 0 : 0.5;
}

export function isMuted() {
  return muted;
}

function tone(freq, at, dur, type, vol) {
  if (!ensure() || muted) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audio.currentTime + at);
  gain.gain.linearRampToValueAtTime(vol || 0.2, audio.currentTime + at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + at + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(audio.currentTime + at);
  osc.stop(audio.currentTime + at + dur + 0.05);
}

function noiseBurst(at, dur, vol) {
  if (!ensure() || muted) return;
  const len = Math.floor(audio.sampleRate * dur);
  const buffer = audio.createBuffer(1, len, audio.sampleRate);
  const data = buffer.getChannelData(0);
  // Deterministic pseudo-noise from a fixed linear sequence, so the game
  // sources never reach for an unseeded random number.
  let s = 22229;
  for (let i = 0; i < len; i += 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    data[i] = (s / 0x40000000 - 1) * (1 - i / len);
  }
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const gain = audio.createGain();
  gain.gain.value = vol || 0.15;
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(audio.currentTime + at);
}

// A find rings a rising pentatonic pluck: higher with the combo, so a hot
// streak literally sounds brighter.
export function playFind(combo) {
  const base = [523.25, 587.33, 659.25, 783.99, 880.0];
  const step = Math.min(Math.max(combo - 1, 0), 4);
  tone(base[step], 0, 0.5, 'triangle', 0.25);
  tone(base[step] * 2, 0.05, 0.4, 'sine', 0.12);
}

export function playMiss() {
  tone(140, 0, 0.25, 'sine', 0.25);
  noiseBurst(0, 0.12, 0.1);
}

export function playClick() {
  tone(660, 0, 0.08, 'sine', 0.1);
}

export function playHint() {
  tone(880, 0, 0.3, 'sine', 0.14);
  tone(1174.66, 0.12, 0.4, 'sine', 0.14);
}

export function playTick() {
  tone(980, 0, 0.06, 'square', 0.06);
}

export function playLevelClear() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => tone(f, i * 0.12, 0.5, 'triangle', 0.22));
}

export function playGameComplete() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
  notes.forEach((f, i) => tone(f, i * 0.13, 0.6, 'triangle', 0.22));
  tone(261.63, 0, 1.2, 'sine', 0.12);
}
