import { expect, FIXTURES, LOOKALIKE_HOST, test } from './extension';

// LOOKALIKE_HOST resolves to the local fixture server through --host-resolver-rules,
// so the browser believes it is visiting a real "sbi-kyc-update.top".
const FAKE_SITE = `http://${LOOKALIKE_HOST}:5183/`;

test.describe('lookalike-domain interstitial', () => {
  test('a site imitating a bank gets the full-page warning', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(FAKE_SITE);
    const gate = page.locator('ruko-interstitial [role="alertdialog"]');
    await expect(gate).toBeVisible();
    await expect(gate.locator('h1')).toContainText(/not the real|looks fake/i);
    await expect(gate).toContainText(LOOKALIKE_HOST);
    await expect(gate.locator('[data-action="leave"]')).toBeFocused();
    // The page behind is not reachable while the warning is up.
    expect(await page.evaluate(() => document.body.inert)).toBe(true);
  });

  test('"Continue anyway" is remembered for that site', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(FAKE_SITE);
    const gate = page.locator('ruko-interstitial [role="alertdialog"]');
    await expect(gate).toBeVisible();
    await gate.locator('[data-action="continue"]').click();
    await expect(page.locator('ruko-interstitial')).toHaveCount(0);
    expect(await page.evaluate(() => document.body.inert)).toBe(false);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await expect(page.locator('ruko-interstitial')).toHaveCount(0);
  });

  test('"Leave this site" takes the user to the safe page', async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(FAKE_SITE);
    await page.locator('ruko-interstitial [data-action="leave"]').click();
    await page.waitForURL(`chrome-extension://${extensionId}/safe.html**`);
    await expect(page.locator('[data-testid="left-body"]')).toContainText(LOOKALIKE_HOST);
  });

  test('ordinary pages are left alone', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(`${FIXTURES}/benign.html`);
    await page.waitForTimeout(800);
    await expect(page.locator('ruko-interstitial')).toHaveCount(0);
    const other = await context.newPage();
    await other.goto('http://benign-ruko-fixture.test:5183/benign.html');
    await other.waitForTimeout(800);
    await expect(other.locator('ruko-interstitial')).toHaveCount(0);
  });
});
