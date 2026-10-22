import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  target: 'es2020',
  platform: 'neutral',
  minify: false,
  esbuildOptions(options) {
    // Keep Hindi strings as UTF-8 instead of \uXXXX escapes (about half the size).
    options.charset = 'utf8';
  },
});
