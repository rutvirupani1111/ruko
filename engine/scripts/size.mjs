// Reports the minified + gzipped size of the built engine, per import.
// Run after `npm run build` (npm run size does both).
// `node scripts/size.mjs --modules` also prints minified bytes per source module
// for the analyze() bundle.
//
// Budgets (min+gzip): analyze() <= 70 KB, identifierHash <= 5 KB.
// The full bundle (`export *`) is reported too; it includes the scam
// encyclopedia (CATEGORIES), which apps should load from
// `@ruko/engine/categories` on the pages that need it.
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KB = 1024;
const BUDGETS = [
  ['analyze() only', 70 * KB],
  ['identifierHash only', 5 * KB],
];

async function bundle(contents, metafile = false) {
  return build({
    stdin: { contents, resolveDir: root, loader: 'js' },
    bundle: true,
    minify: true,
    format: 'esm',
    charset: 'utf8',
    write: false,
    treeShaking: true,
    platform: 'neutral',
    metafile,
  });
}

const sizes = new Map();
async function measure(label, contents) {
  const result = await bundle(contents);
  const code = result.outputFiles[0].contents;
  const gz = gzipSync(code, { level: 9 }).length;
  sizes.set(label, gz);
  console.log(`${label.padEnd(34)} min ${(code.length / KB).toFixed(1).padStart(6)} KB   min+gzip ${(gz / KB).toFixed(1).padStart(5)} KB`);
  return gz;
}

if (process.argv.includes('--modules')) {
  // Source-level breakdown of the analyze() bundle.
  const r = await build({
    stdin: { contents: "export { analyze } from './src/index.ts';", resolveDir: root, loader: 'ts' },
    bundle: true,
    minify: true,
    format: 'esm',
    charset: 'utf8',
    write: false,
    metafile: true,
    platform: 'neutral',
  });
  const out = Object.values(r.metafile.outputs)[0];
  const rows = Object.entries(out.inputs).sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput);
  console.log('analyze() bundle, minified bytes per source module:');
  for (const [file, info] of rows) if (info.bytesInOutput > 0) console.log(String(info.bytesInOutput).padStart(8), file);
  console.log('');
}

await measure('full bundle (export *)', "export * from './dist/index.js';");
await measure('analyze() only', "export { analyze } from './dist/index.js';");
await measure('analyzeUrl() only', "export { analyzeUrl } from './dist/index.js';");
await measure('identifierHash only', "export { identifierHash } from './dist/index.js';");
await measure('@ruko/engine/categories', "export * from './dist/categories.js';");

let failed = false;
console.log('');
for (const [label, budget] of BUDGETS) {
  const gz = sizes.get(label);
  const ok = gz <= budget;
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'OVER'} ${label}: ${(gz / KB).toFixed(1)} KB of ${budget / KB} KB`);
}
if (failed) process.exit(1);
