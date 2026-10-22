import { defineConfig } from 'tsup';

export default defineConfig({
  // `@ruko/engine` and the `@ruko/engine/categories` subpath (the encyclopedia).
  entry: { index: 'src/index.ts', categories: 'src/categories.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // Both entries share one copy of the encyclopedia in a chunk.
  splitting: true,
  target: 'es2020',
  platform: 'neutral',
  minify: false,
  esbuildOptions(options) {
    // Keep Hindi strings as UTF-8 instead of \uXXXX escapes (about half the size).
    options.charset = 'utf8';
  },
});
