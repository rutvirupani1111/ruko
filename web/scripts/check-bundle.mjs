// Reports gzip sizes of the production build and enforces the performance
// budget: the JavaScript needed for the first page (entry chunk plus its static
// imports) must stay at or below 150 KB gzip. Lazy chunks are listed too.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUDGET = 150 * 1024;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const manifestPath = join(dist, '.vite', 'manifest.json');

if (!existsSync(manifestPath)) {
  console.error('[size] dist/.vite/manifest.json not found. Run `npm run build` first.');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const gz = (file) => gzipSync(readFileSync(join(dist, file)), { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const entryKey = Object.keys(manifest).find((k) => manifest[k].isEntry && k.endsWith('index.html'));
if (!entryKey) {
  console.error('[size] no index.html entry in manifest');
  process.exit(1);
}

// Static import closure of the entry = JS the browser must run for first paint.
const initial = new Set();
const css = new Set();
const visit = (key) => {
  const chunk = manifest[key];
  if (!chunk || initial.has(chunk.file)) return;
  initial.add(chunk.file);
  (chunk.css ?? []).forEach((c) => css.add(c));
  (chunk.imports ?? []).forEach(visit);
};
visit(entryKey);

let initialTotal = 0;
const rows = [];
for (const file of initial) {
  const size = gz(file);
  initialTotal += size;
  rows.push([file, size, 'initial']);
}
let cssTotal = 0;
for (const file of css) cssTotal += gz(file);

// Every other JS chunk is lazy (routes, engine, OCR, QR, share card...).
const assetsDir = join(dist, 'assets');
const lazy = readdirSync(assetsDir)
  .filter((f) => f.endsWith('.js') && !initial.has(`assets/${f}`))
  .map((f) => [`assets/${f}`, gz(`assets/${f}`), 'lazy'])
  .sort((a, b) => b[1] - a[1]);

console.log('\nRuko bundle report (gzip -9)');
console.log('-----------------------------------------------');
for (const [file, size, kind] of [...rows.sort((a, b) => b[1] - a[1]), ...lazy]) {
  console.log(`${kind.padEnd(8)} ${kb(size).padStart(9)}  ${file}`);
}
const sw = join(dist, 'sw.js');
if (existsSync(sw)) console.log(`sw       ${kb(gz('sw.js')).padStart(9)}  sw.js`);
console.log('-----------------------------------------------');
console.log(`Initial JS: ${kb(initialTotal)} (budget ${kb(BUDGET)})`);
console.log(`Initial CSS: ${kb(cssTotal)}`);
const totalSize = (dir) =>
  readdirSync(dir).reduce((sum, f) => {
    const p = join(dir, f);
    return sum + (statSync(p).isDirectory() ? totalSize(p) : statSync(p).size);
  }, 0);
console.log(`dist/ on disk: ${kb(totalSize(dist))}\n`);

if (initialTotal > BUDGET) {
  console.error(`[size] Initial JS ${kb(initialTotal)} exceeds the ${kb(BUDGET)} budget.`);
  process.exit(1);
}
