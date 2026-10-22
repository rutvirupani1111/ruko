import { defineConfig } from '@playwright/test';

/**
 * End-to-end tests load the built Chrome extension (.output/chrome-mv3) into
 * Playwright's own Chromium. Run `npm run test:e2e` (it builds first).
 */
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // One persistent context per test, one at a time: extension service workers and
  // the fixture server are shared resources.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results',
  webServer: {
    command: 'node tests/e2e/server.mjs',
    url: 'http://localhost:5183/index.html',
    reuseExistingServer: false,
    timeout: 20_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
