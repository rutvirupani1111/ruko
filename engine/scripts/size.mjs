// Reports the minified + gzipped size of the built engine (budget: 60 KB).
// Run after `npm run build` (npm run size does both).
// `node scripts/size.mjs --modules` also prints bytes per source module.
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUDGET = 60 * 1024;

async function measure(label, contents) {
  const result = await build({
    stdin: { contents, resolveDir: root, loader: 'js' },
    bundle: true,
    minify: true,
    format: 'esm',
    charset: 'utf8',
    write: false,
    treeShaking: true,
    platform: 'neutral',
  });
  const code = result.outputFiles[0].contents;
  const gz = gzipSync(code, { level: 9 }).length;
  console.log(`${label.padEnd(34)} min ${(code.length / 1024).toFixed(1).padStart(6)} KB   min+gzip ${(gz / 1024).toFixed(1).padStart(5)} KB`);
  return gz;
}

if (process.argv.includes('--modules')) {
  const r = await build({
    entryPoints: [resolve(root, 'src/index.ts')],
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
  for (const [file, info] of rows) console.log(String(info.bytesInOutput).padStart(8), file);
  console.log('');
}

const full = await measure('full bundle (export *)', "export * from './dist/index.js';");
await measure('analyze() only', "export { analyze } from './dist/index.js';");
await measure('CATEGORIES only', "export { CATEGORIES } from './dist/index.js';");
await measure('identifierHash only', "export { identifierHash } from './dist/index.js';");

if (full > BUDGET) {
  console.error(`\nFull bundle is ${(full / 1024).toFixed(1)} KB min+gzip, over the ${BUDGET / 1024} KB budget.`);
  process.exit(1);
}
console.log(`\nWithin budget: ${(full / 1024).toFixed(1)} KB of ${BUDGET / 1024} KB.`);
