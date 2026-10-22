import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

const root = fileURLToPath(new URL('.', import.meta.url));
const rukoRoot = resolve(root, '..');
const engineEntry = resolve(rukoRoot, 'engine/src/index.ts');

// Ruko Shield: Manifest V3 for every target (Chrome, Edge, Firefox).
export default defineConfig({
  srcDir: 'src',
  publicDir: 'src/public',
  modules: ['@wxt-dev/module-react'],
  manifestVersion: 3,
  // The engine is consumed from source (see ruko/SPEC.md). WXT mirrors this
  // alias into .wxt/tsconfig.json `paths`, Vite and Vitest.
  alias: {
    '@ruko/engine': engineEntry,
  },
  vite: () => ({
    plugins: [tailwindcss()],
    server: { fs: { allow: [rukoRoot] } },
    build: {
      // Readable output makes store review (and Firefox source review) easier.
      sourcemap: false,
      chunkSizeWarningLimit: 900,
    },
  }),
  manifest: ({ browser }) => {
    const isFirefox = browser === 'firefox';
    return {
      name: '__MSG_extName__',
      short_name: '__MSG_extShortName__',
      description: '__MSG_extDescription__',
      default_locale: 'en',
      // storage: settings, history, per-site choices. contextMenus: "Check with Ruko".
      // sidePanel is added by WXT for Chromium targets because of the sidepanel entrypoint.
      permissions: ['storage', 'contextMenus'],
      // Needed to show the lookalike interstitial, link tooltips and UPI confirmation on
      // any website, and to read the current tab's address for the popup's site toggle.
      host_permissions: ['http://*/*', 'https://*/*'],
      action: {
        default_title: '__MSG_actionTitle__',
      },
      ...(isFirefox
        ? {
            browser_specific_settings: {
              gecko: {
                // Permanent once uploaded to AMO. Review before the first submission.
                id: 'ruko-shield@ruko-extension',
                strict_min_version: '140.0',
                data_collection_permissions: { required: ['none'] },
              },
            },
          }
        : {
            minimum_chrome_version: '116',
          }),
    };
  },
  zip: {
    artifactTemplate: 'ruko-shield-{{version}}-{{browser}}.zip',
    sourcesTemplate: 'ruko-shield-{{version}}-sources.zip',
    // The extension builds against ../engine, so the reviewable source archive
    // has to contain both folders.
    sourcesRoot: rukoRoot,
    includeSources: ['SPEC.md', 'engine/**', 'extension/**'],
    // Include extension/.npmrc (legacy-peer-deps) so reviewers can `npm ci` as-is.
    dotSources: true,
    excludeSources: [
      'web/**',
      '**/node_modules/**',
      '**/.output/**',
      '**/.wxt/**',
      '**/.git/**',
      '**/.vscode/**',
      '**/.idea/**',
      '**/.env*',
      '**/.DS_Store',
      '**/dist/**',
      'extension/test-results/**',
      'extension/playwright-report/**',
      'extension/store/screenshots/**',
    ],
  },
});
