// Copies the Tesseract.js worker and WebAssembly cores into public/ocr so OCR
// is self-hosted (only the language data comes from jsDelivr, on first use).
// Runs before `vite` and `vite build`. The copied files are gitignored.
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'package.json'));
const out = join(root, 'public', 'ocr');
mkdirSync(out, { recursive: true });

const tesseractDir = dirname(require.resolve('tesseract.js/package.json'));
const coreDir = dirname(require.resolve('tesseract.js-core/package.json', { paths: [tesseractDir] }));

const files = [
  [join(tesseractDir, 'dist', 'worker.min.js'), 'worker.min.js'],
  // LSTM-only cores (Ruko uses OEM 1): plain, SIMD and relaxed-SIMD builds.
  [join(coreDir, 'tesseract-core-lstm.wasm.js'), 'tesseract-core-lstm.wasm.js'],
  [join(coreDir, 'tesseract-core-simd-lstm.wasm.js'), 'tesseract-core-simd-lstm.wasm.js'],
  [join(coreDir, 'tesseract-core-relaxedsimd-lstm.wasm.js'), 'tesseract-core-relaxedsimd-lstm.wasm.js'],
];

let copied = 0;
for (const [from, name] of files) {
  const to = join(out, name);
  if (!existsSync(from)) {
    console.warn(`[ocr-assets] missing ${from}`);
    continue;
  }
  if (existsSync(to) && statSync(to).size === statSync(from).size && statSync(to).mtimeMs >= statSync(from).mtimeMs) continue;
  copyFileSync(from, to);
  copied++;
}
console.log(`[ocr-assets] ${copied ? `copied ${copied} file(s)` : 'up to date'} in public/ocr`);
