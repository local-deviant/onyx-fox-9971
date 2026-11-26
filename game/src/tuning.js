// Lantern Harbor — tuning: every number that shapes the game in one place.
// Levels, timers, scoring, canvas geometry and the shared UI palette live here
// so a balance change never means hunting through the drawing code.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// The two picture panels. Both are the same size; the left one is the original,
// the right one hides every difference. Panel-local coordinates are 600 x 640.
export const PANEL_W = 600;
export const PANEL_H = 640;
export const PANEL_Y = 84;
export const LEFT_X = 20;
export const RIGHT_X = 660;
export const HEADER_H = 72;
export const FOOTER_Y = 736;

// One level: its scene, its hunt and its clock. Later levels hide more and
// give less time, so the hunt tightens as the player improves.
export const LEVELS = [
  {
    id: 'harbor',
    name: 'Harbor Dawn',
    subtitle: 'Fishing boats at first light',
    differences: 7,
    seconds: 120,
    seed: 11,
  },
  {
    id: 'market',
    name: 'Lantern Market',
    subtitle: 'Paper lanterns on a night street',
    differences: 8,
    seconds: 100,
    seed: 23,
  },
  {
    id: 'reef',
    name: 'Coral Garden',
    subtitle: 'A reef asleep under the waves',
    differences: 10,
    seconds: 90,
    seed: 37,
  },
];

// Scoring: a find pays 100 times the combo. The combo climbs one step per
// find in a row (capped at five) and resets on a miss, so careful hunting
// pays and wild clicking does not.
export const FIND_POINTS = 100;
export const COMBO_MAX = 5;
export const MISS_TIME_PENALTY = 3;
export const HINT_POINTS_COST = 50;
export const HINTS_PER_LEVEL = 2;
export const HINT_COOLDOWN_SECONDS = 10;
export const LEVEL_CLEAR_TIME_BONUS = 10;
export const CLICK_RADIUS = 34;

// The loupe (magnifier): hold Z or the right mouse button to look closer.
// It shows the panel under the cursor at twice the size.
export const LOUPE_RADIUS = 110;
export const LOUPE_ZOOM = 2;

// Last-seconds pressure: the timer bar turns red and ticks below this.
export const LOW_TIME_SECONDS = 10;

// Shared UI palette: deep harbor blue frame, warm lantern gold accents,
// parchment panels. Scenes keep their own palettes in their own files.
export const UI = {
  frame: '#0d2436',
  frameEdge: '#1d4258',
  parchment: '#f7ead0',
  parchmentDark: '#e8d3a8',
  ink: '#22303a',
  inkSoft: '#5a6b76',
  gold: '#f2b234',
  goldBright: '#ffd76a',
  coral: '#e4572e',
  teal: '#2a9d8f',
  danger: '#d64541',
  good: '#3d9970',
  panelShadow: 'rgba(6, 20, 30, 0.45)',
};
