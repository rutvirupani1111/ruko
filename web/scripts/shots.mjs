// Visual review helper: screenshots pages at phone and desktop sizes, light and
// dark, against a running server (default http://localhost:5181).
// Usage: node scripts/shots.mjs [outDir] [path ...]
//   SHOT_ACTIONS=sample:kyc  -> click a sample chip before the screenshot
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const base = process.env.SHOT_BASE ?? 'http://localhost:5181';
const [outDir = 'shots', ...paths] = process.argv.slice(2);
const targets = paths.length ? paths : ['/'];
const sizes = (process.env.SHOT_SIZES ?? 'phone,desktop').split(',');
const schemes = (process.env.SHOT_SCHEMES ?? 'light,dark').split(',');
const locale = process.env.SHOT_LOCALE ?? 'en';
const action = process.env.SHOT_ACTION ?? '';
const fullPage = process.env.SHOT_FULL !== '0';
mkdirSync(outDir, { recursive: true });

const viewports = { phone: { width: 375, height: 812 }, desktop: { width: 1280, height: 860 } };
const browser = await chromium.launch();
for (const size of sizes) {
  for (const scheme of schemes) {
    const context = await browser.newContext({
      viewport: viewports[size],
      deviceScaleFactor: size === 'phone' ? 2 : 1,
      colorScheme: scheme,
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    });
    await context.addInitScript((loc) => localStorage.setItem('ruko.locale', loc), locale);
    const page = await context.newPage();
    page.on('pageerror', (err) => console.error(`[pageerror] ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.error(`[console] ${msg.text()}`);
    });
    for (const path of targets) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      if (action.startsWith('sample:')) {
        await page.click(`[data-sample="${action.slice(7)}"]`);
        await page.waitForSelector('[data-testid="verdict-card"]', { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(400);
      } else if (action.startsWith('type:')) {
        await page.fill('[data-testid="check-input"]', action.slice(5));
        await page.waitForTimeout(900);
      } else if (action.startsWith('click:')) {
        await page.click(action.slice(6));
        await page.waitForTimeout(500);
      }
      const name = `${path.replace(/[^a-z0-9]+/gi, '_') || 'home'}-${size}-${scheme}-${locale}${action ? '-' + action.replace(/[^a-z0-9]+/gi, '_').slice(0, 20) : ''}.png`;
      await page.screenshot({ path: join(outDir, name), fullPage });
      console.log(join(outDir, name));
    }
    await context.close();
  }
}
await browser.close();
