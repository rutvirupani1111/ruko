// README screenshots: phone-sized (375x812 @2x) captures of the main flows, plus a
// desktop view, written to docs/screenshots/. Needs a running server:
//   npm run build && npm run preview     (in another terminal)
//   npm run screenshots                  [-- outDir] (SHOTS_SCHEME=dark, SHOTS_LOCALE=hi to vary)
// The community API is mocked, so no API server is needed.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const base = process.env.SHOTS_BASE ?? 'http://localhost:5181';
const outDir = process.argv[2] ?? 'docs/screenshots';
const scheme = process.env.SHOTS_SCHEME ?? 'light';
const locale = process.env.SHOTS_LOCALE ?? 'en';
const suffix = `${scheme === 'light' ? '' : `-${scheme}`}${locale === 'en' ? '' : `-${locale}`}`;
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
async function session(viewport, scale) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: scheme, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript((loc) => localStorage.setItem('ruko.locale', loc), locale);
  await context.route('**/api/**', (route) => route.fulfill({ json: { entries: [] } }));
  const page = await context.newPage();
  page.on('pageerror', (err) => console.error(`[pageerror] ${err.message}`));
  return { context, page };
}
const save = async (page, name, options = {}) => {
  const file = join(outDir, `${name}${suffix}.png`);
  await page.screenshot({ path: file, ...options });
  console.log(file);
};
const scrollTo = (page, selector, offset = 72) =>
  page.evaluate(
    ([sel, off]) => {
      const el = document.querySelector(sel);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off);
    },
    [selector, offset],
  );

// Phone
{
  const { context, page } = await session({ width: 375, height: 812 }, 2);
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await save(page, 'check-phone');
  await page.click('[data-sample="kyc"]');
  await page.getByTestId('verdict-card').waitFor();
  await page.waitForTimeout(500);
  await scrollTo(page, '[data-testid="verdict-card"]');
  await save(page, 'verdict-phone');

  await page.goto(`${base}/simulator`, { waitUntil: 'networkidle' });
  await page.getByTestId('level-1').click();
  await page.getByTestId('answer-scam').click();
  await page.getByTestId('sim-feedback').waitFor();
  await page.waitForTimeout(400);
  await scrollTo(page, '[data-testid="sim-phone"]');
  await save(page, 'simulator-phone');

  await page.goto(`${base}/help`, { waitUntil: 'networkidle' });
  await save(page, 'help-phone');

  await page.goto(`${base}/report`, { waitUntil: 'networkidle' });
  await page.getByTestId('report-value').fill('refund.desk@okaxis');
  await page.getByTestId('report-category').selectOption('upi_collect');
  await scrollTo(page, '[data-testid="report-form"]', 90);
  await save(page, 'report-phone');

  await page.goto(`${base}/privacy`, { waitUntil: 'networkidle' });
  await page.getByTestId('kanon-step-3').click();
  await page.waitForTimeout(300);
  await scrollTo(page, '[data-testid="kanon-diagram"]');
  await save(page, 'privacy-phone');
  await context.close();
}

// Desktop
{
  const { context, page } = await session({ width: 1280, height: 860 }, 1);
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.click('[data-sample="kyc"]');
  await page.getByTestId('verdict-card').waitFor();
  await page.waitForTimeout(500);
  await save(page, 'check-desktop');
  await page.goto(`${base}/privacy`, { waitUntil: 'networkidle' });
  await page.getByTestId('kanon-step-4').click();
  await page.waitForTimeout(300);
  await scrollTo(page, '#kanon-title', 90);
  await save(page, 'privacy-desktop');
  await context.close();
}

await browser.close();
