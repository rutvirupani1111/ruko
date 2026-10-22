/**
 * Playwright fixture: Chromium (Playwright's own build, never the user's Chrome
 * profile) with the built extension loaded into a throwaway profile.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, test as base, expect, type BrowserContext, type Page, type Worker } from '@playwright/test';

export const EXTENSION_PATH = resolve(process.cwd(), '.output/chrome-mv3');
export const FIXTURES = 'http://localhost:5183';
const FIXTURE_DIR = resolve(process.cwd(), 'tests/e2e/fixtures');

/** Hostnames that resolve to the local fixture server instead of the internet. */
export const LOOKALIKE_HOST = 'sbi-kyc-update.top';
export const LOOKALIKE_HOSTS = [LOOKALIKE_HOST, 'hdfcbank-rewards.in', 'onlinesbi-secure.co.in', 'benign-ruko-fixture.test'];

export interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
  background: Worker;
}

export const test = base.extend<ExtensionFixtures>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: true,
      viewport: { width: 1280, height: 800 },
      locale: 'en-IN',
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        `--host-resolver-rules=${LOOKALIKE_HOSTS.map((h) => `MAP ${h} 127.0.0.1`).join(', ')}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-sync',
      ],
    });
    // Nothing in the suite may reach the real internet. WhatsApp Web and Gmail are
    // served from local fixtures through request interception.
    await context.route(/^https?:\/\//, (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || LOOKALIKE_HOSTS.includes(url.hostname)) {
        return route.continue();
      }
      return route.abort('blockedbyclient');
    });
    await context.route('https://web.whatsapp.com/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: await readFile(resolve(FIXTURE_DIR, 'whatsapp.html'), 'utf8') });
    });
    await context.route('https://mail.google.com/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: await readFile(resolve(FIXTURE_DIR, 'gmail.html'), 'utf8') });
    });
    await use(context);
    await context.close();
  },
  background: async ({ context }, use) => {
    let [worker] = context.serviceWorkers();
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await use(worker);
  },
  extensionId: async ({ background }, use) => {
    await use(new URL(background.url()).host);
  },
});

export { expect };

/** Opens an extension page (popup.html, sidepanel.html, options.html) as a tab. */
export async function openExtensionPage(context: BrowserContext, extensionId: string, path: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/${path}`);
  return page;
}

/** Changes settings directly in extension storage, as the options page would. */
export async function setSettings(background: Worker, patch: Record<string, unknown>): Promise<void> {
  await background.evaluate(async (p) => {
    type Area = { get(k: string): Promise<Record<string, unknown>>; set(v: Record<string, unknown>): Promise<void> };
    const api = (globalThis as unknown as { chrome: { storage: { local: Area } } }).chrome;
    const stored = await api.storage.local.get('settings');
    const current = (stored.settings ?? {}) as Record<string, unknown>;
    await api.storage.local.set({ settings: { ...current, ...p } });
  }, patch);
}
