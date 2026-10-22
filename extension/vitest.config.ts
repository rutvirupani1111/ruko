import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig({
  // WxtVitest wires the @ruko/engine alias, WXT's auto-imports and a fake `browser`
  // (in-memory storage, runtime, tabs) so extension code runs unchanged in tests.
  plugins: [WxtVitest()],
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
});
