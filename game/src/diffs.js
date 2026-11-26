// Lantern Harbor — diffs: where each hidden difference lives.
// One entry per difference: its id (the scene files switch on it), a short
// label for the hint line, and the spot on the panel (panel-local 600 x 640)
// a click must land near. The scenes draw the left panel plain and the
// right panel with every difference applied, so the two pictures only differ
// exactly here.

export const DIFFS = {
  harbor: [
    { id: 'gull', label: 'A gull is missing from the sky', x: 305, y: 92, r: 42 },
    { id: 'sunrays', label: 'The sun has lost its rays', x: 478, y: 88, r: 46 },
    { id: 'flag', label: 'The boat flag changed colour', x: 192, y: 264, r: 26 },
    { id: 'buoy', label: 'An extra buoy floats by the dock', x: 516, y: 556, r: 30 },
    { id: 'crates', label: 'A crate is missing from the stack', x: 98, y: 502, r: 40 },
    { id: 'window', label: 'A lighthouse window went dark', x: 106, y: 182, r: 30 },
    { id: 'fish', label: 'The jumping fish is gone', x: 382, y: 482, r: 32 },
  ],
  market: [
    { id: 'lantern', label: 'A lantern changed colour', x: 148, y: 142, r: 30 },
    { id: 'cat', label: 'The roof cat has vanished', x: 482, y: 160, r: 36 },
    { id: 'sign', label: 'The tea sign shows a different cup', x: 300, y: 218, r: 36 },
    { id: 'moon', label: 'The moon changed its phase', x: 522, y: 68, r: 36 },
    { id: 'awning', label: 'The awning lost a stripe', x: 198, y: 298, r: 42 },
    { id: 'kite', label: 'The kite is gone from the sky', x: 420, y: 88, r: 30 },
    { id: 'fruit', label: 'The fruit basket changed fruit', x: 330, y: 468, r: 36 },
    { id: 'bulb', label: 'A string light has gone out', x: 250, y: 84, r: 26 },
  ],
  reef: [
    { id: 'spots', label: 'The turtle lost a shell spot', x: 300, y: 300, r: 46 },
    { id: 'seahorse', label: 'The seahorse has swum away', x: 500, y: 200, r: 30 },
    { id: 'gems', label: 'The chest gems changed colour', x: 150, y: 540, r: 36 },
    { id: 'school', label: 'A fish is missing from the school', x: 420, y: 150, r: 42 },
    { id: 'arms', label: 'The starfish lost an arm', x: 92, y: 600, r: 30 },
    { id: 'bubbles', label: 'A bubble is missing from the trail', x: 520, y: 420, r: 36 },
    { id: 'coral', label: 'A coral changed colour', x: 200, y: 450, r: 36 },
    { id: 'clownfish', label: 'The clownfish left its anemone', x: 350, y: 520, r: 30 },
    { id: 'shell', label: 'A shell is missing from the sand', x: 480, y: 600, r: 26 },
    { id: 'ray', label: 'The manta ray is gone', x: 250, y: 120, r: 42 },
  ],
};

export function diffsFor(levelId) {
  return DIFFS[levelId];
}

export function diffById(levelId, id) {
  return DIFFS[levelId].find((d) => d.id === id);
}
