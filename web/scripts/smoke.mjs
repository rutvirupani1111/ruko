// Smoke test against a running server (default http://localhost:5181):
// every route renders an h1 without page errors, and the checker produces a
// verdict for a scam sample in English and Hindi. Usage: node scripts/smoke.mjs
import { chromium } from '@playwright/test';

const base = process.env.SMOKE_BASE ?? 'http://localhost:5181';
const routes = ['/', '/check', '/learn', '/learn/kyc_update', '/simulator', '/help', '/report', '/privacy', '/about', '/no-such-page'];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 }, serviceWorkers: 'block' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`));

let failed = 0;
for (const route of routes) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  const h1 = await page.locator('h1').first().textContent({ timeout: 8000 }).catch(() => null);
  const ok = !!h1;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${route.padEnd(20)} ${h1?.trim().slice(0, 60) ?? '(no h1)'}`);
}

for (const locale of ['en', 'hi']) {
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.evaluate((l) => localStorage.setItem('ruko.locale', l), locale);
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-sample="kyc"]');
  const card = page.locator('[data-testid="verdict-card"]');
  await card.waitFor({ timeout: 10000 });
  const severity = await card.getAttribute('data-severity');
  const headline = (await page.locator('[data-testid="verdict-headline"]').textContent())?.trim();
  const marks = await page.locator('[data-testid="highlighted-text"] .hl').count();
  const ok = severity === 'critical' || severity === 'high';
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} check (${locale}) severity=${severity} marks=${marks} "${headline}"`);
}

// Share target pre-fills and cleans the URL.
await page.goto(base + '/check?text=' + encodeURIComponent('Your electricity will be disconnected tonight at 9:30 PM, call officer 9087654321'), {
  waitUntil: 'networkidle',
});
await page.locator('[data-testid="verdict-card"]').waitFor({ timeout: 10000 }).catch(() => failed++);
console.log(`share target url after: ${new URL(page.url()).pathname}${new URL(page.url()).search}`);

if (errors.length) {
  failed += errors.length;
  console.log('page errors:\n' + errors.join('\n'));
}
await browser.close();
console.log(failed ? `\n${failed} problem(s)` : '\nall good');
process.exit(failed ? 1 : 0);
