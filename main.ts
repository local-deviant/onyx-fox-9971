// Lantern Harbor — the entrypoint (Node 22, standard library only).
// The game is plain static files under game/; this program hands it in:
// it copies game/ and screenshots/ to the output directory and writes
// /output/dossier.json with the kit's vendored library, exactly as the
// gate rebuilds it. It runs the same way twice and writes the same bytes.
//
//   node main.ts                 hand the game in ($MAKEFUN_OUTPUT_DIR or /output)
//   node main.ts --check         run the eight self-checks, exit 0 or 1
//   node main.ts --serve [--port N]  serve game/ locally for playtesting

import { cpSync, createReadStream, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function gameFiles() {
  const found = [];
  const walk = (dir, rel) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const relPath = rel ? `${rel}/${name}` : name;
      const st = lstatSync(path);
      if (st.isDirectory()) walk(path, relPath);
      else found.push(relPath);
    }
  };
  walk(join(here, 'game'), '');
  return found.sort();
}

function readText(rel) {
  return readFileSync(join(here, rel), 'utf8');
}

function imageDims(file) {
  const buf = readFileSync(file);
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { kind: 'png', w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf.length > 2 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i += 1; continue; }
      const marker = buf[i + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return { kind: 'jpeg', h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      const len = buf.readUInt16BE(i + 2);
      i += 2 + len;
    }
  }
  return null;
}

function checkEntrypoint() {
  return existsSync(join(here, 'main.ts'))
    ? { pass: true, detail: 'main.ts at the repository root' }
    : { pass: false, detail: 'main.ts is missing from the repository root' };
}

function checkLicense() {
  const path = join(here, 'LICENSE');
  if (!existsSync(path)) return { pass: false, detail: 'LICENSE is missing' };
  const first = readFileSync(path, 'utf8').split('\n')[0].trim();
  return first.startsWith('SPDX-License-Identifier: MIT')
    ? { pass: true, detail: 'LICENSE opens with SPDX-License-Identifier: MIT' }
    : { pass: false, detail: `LICENSE opens with "${first}"` };
}

function checkGameStatic() {
  const root = join(here, 'game');
  if (!existsSync(join(root, 'index.html'))) return { pass: false, detail: 'game/index.html is missing' };
  const bad = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const st = lstatSync(path);
      if (st.isSymbolicLink()) bad.push(path);
      else if (st.isDirectory()) walk(path);
      else if (!st.isFile()) bad.push(path);
    }
  };
  walk(root);
  if (bad.length > 0) return { pass: false, detail: `non-file entries under game/: ${bad.join(', ')}` };
  return { pass: true, detail: `${gameFiles().length} files under game/, all plain files` };
}

function checkGameComplete() {
  const sources = gameFiles()
    .filter((f) => f.endsWith('.js') || f.endsWith('.html'))
    .map((f) => readText(join('game', f)))
    .join('\n');
  const needs = [
    ['two panels', /LEFT_X|RIGHT_X/],
    ['differences', /differenceAt|diffsFor/],
    ['found counter', /remaining\(state\)|Found/],
    ['timer', /timeLeft/],
    ['hint', /useHint/],
    ['loupe', /loupe/],
    ['win screen', /levelclear|complete/],
    ['lose screen', /timeup/],
    ['restart', /startLevel|startGame/],
    ['three levels', /Harbor Dawn|Lantern Market|Coral Garden/],
  ];
  const missing = needs.filter(([, re]) => !re.test(sources)).map(([name]) => name);
  return missing.length === 0
    ? { pass: true, detail: 'panels, differences, counter, timer, hint, loupe, win/lose, restart, three levels' }
    : { pass: false, detail: `missing from the sources: ${missing.join(', ')}` };
}

function checkNoNetwork() {
  const hits = [];
  for (const f of gameFiles()) {
    const text = readText(join('game', f));
    const stripped = text.replace(/data:[^'")\s]*/g, '');
    for (const bad of ['fetch(', 'XMLHttpRequest', 'WebSocket', 'http://', 'https://', 'ws://', 'wss://', 'import(']) {
      if (stripped.includes(bad)) hits.push(`${f}: ${bad}`);
    }
  }
  return hits.length === 0
    ? { pass: true, detail: 'no fetch, XHR, WebSocket or remote URL in game sources' }
    : { pass: false, detail: hits.join('; ') };
}

function checkScreenshots() {
  const dir = join(here, 'screenshots');
  if (!existsSync(dir)) return { pass: false, detail: 'screenshots/ is missing' };
  const names = readdirSync(dir).filter((n) => !n.startsWith('.')).sort();
  if (names.length < 3 || names.length > 4) {
    return { pass: false, detail: `${names.length} screenshots, need 3 or 4` };
  }
  const problems = [];
  for (const name of names) {
    const path = join(dir, name);
    const size = statSync(path).size;
    if (size < 20000 || size > 262144) problems.push(`${name}: ${size} bytes`);
    const dims = imageDims(path);
    if (!dims) problems.push(`${name}: not a PNG or JPEG`);
    else if (Math.max(dims.w, dims.h) > 1280 || Math.min(dims.w, dims.h) < 480) {
      problems.push(`${name}: ${dims.w}x${dims.h}, outside the size caps`);
    }
  }
  return problems.length === 0
    ? { pass: true, detail: `${names.length} screenshots, cover is ${names[0]}, all within the caps` }
    : { pass: false, detail: problems.join('; ') };
}

function checkDeterministic() {
  const sources = gameFiles()
    .filter((f) => f.endsWith('.js'))
    .map((f) => readText(join('game', f)))
    .join('\n');
  if (!/mulberry32|rngFor/.test(sources)) return { pass: false, detail: 'no seeded RNG in the game sources' };
  const banned = ['Math.random', 'Date.now'].filter((s) => sources.includes(s));
  if (banned.length > 0) return { pass: false, detail: `unseeded time/random in game sources: ${banned.join(', ')}` };
  return { pass: true, detail: 'seeded RNG only, no unseeded random or clock in game sources' };
}

function checkDossier() {
  const tmp = mkdtempSync(join(tmpdir(), 'lantern-harbor-'));
  try {
    cpSync(join(here, 'game'), join(tmp, 'game'), { recursive: true });
    cpSync(join(here, 'screenshots'), join(tmp, 'screenshots'), { recursive: true });
    const bytes = buildDossier(tmp, DOSSIER_CAPS);
    if (bytes.length > 1500000) return { pass: false, detail: `dossier.json would be ${bytes.length} bytes, over 1.5 MB` };
    return { pass: true, detail: `dossier builds at ${bytes.length} bytes, within the caps` };
  } catch (error) {
    return { pass: false, detail: `buildDossier failed: ${error.message}` };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const CHECKS = [
  ['entrypoint', checkEntrypoint],
  ['license', checkLicense],
  ['game-static', checkGameStatic],
  ['game-complete', checkGameComplete],
  ['no-network', checkNoNetwork],
  ['screenshots', checkScreenshots],
  ['deterministic', checkDeterministic],
  ['dossier', checkDossier],
];

function runChecks() {
  let failed = 0;
  for (const [name, fn] of CHECKS) {
    const result = fn();
    console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${name}: ${result.detail}`);
    if (!result.pass) failed += 1;
  }
  return failed;
}

function handIn() {
  mkdirSync(out, { recursive: true });
  cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  if (existsSync(join(here, 'screenshots'))) {
    cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
  }
  writeFileSync(join(out, 'dossier.json'), buildDossier(out, DOSSIER_CAPS));
  console.log(`handed in to ${out}`);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function serve(port) {
  const root = resolve(join(here, 'game'));
  createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    let pathname = url.pathname;
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = resolve(join(root, normalize(decodeURIComponent(pathname))));
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end('forbidden');
      return;
    }
    try {
      const st = statSync(file);
      if (!st.isFile()) throw new Error('not a file');
      response.writeHead(200, {
        'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
        'content-length': st.size,
        'cache-control': 'no-store',
      });
      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404).end('not found');
    }
  }).listen(port, '127.0.0.1', () => {
    console.log(`Lantern Harbor is on http://127.0.0.1:${port}`);
  });
}

const args = process.argv.slice(2);
if (args.includes('--check')) {
  const failed = runChecks();
  process.exit(failed === 0 ? 0 : 1);
} else if (args.includes('--serve')) {
  const failed = runChecks();
  if (failed > 0) {
    console.error('refusing to serve an entry that fails its checks');
    process.exit(1);
  }
  const portIndex = args.indexOf('--port');
  const port = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
  serve(Number.isInteger(port) && port > 0 && port < 65536 ? port : 8080);
} else {
  const failed = runChecks();
  if (failed > 0) {
    console.error('hand-in refused: fix the failing checks first');
    process.exit(1);
  }
  handIn();
}
