import { expect, FIXTURES, setSettings, test } from './extension';

test.describe('Gmail fixture', () => {
  test('shows a banner above a suspicious email and keeps the email intact', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://mail.google.com/mail/u/0/#inbox/FMfcgz');
    const body = page.locator('[data-testid="email-body"]');
    const before = await body.innerHTML();
    const banner = page.locator('ruko-banner [role="region"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Ruko checked this email');
    await expect(banner).toContainText('alerts@hdfcbank-rewards.in');
    // The banner sits right above the body.
    expect(await page.locator('ruko-banner + [data-testid="email-body"]').count()).toBe(1);
    expect(await body.innerHTML()).toBe(before);

    const why = banner.locator('button[aria-expanded]');
    await why.click();
    await expect(why).toHaveAttribute('aria-expanded', 'true');
    await expect(banner.locator('.rk-banner__details')).toBeVisible();
  });
});

test.describe('UPI links', () => {
  test('clicking a upi:// link asks first and explains it is a payment', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(`${FIXTURES}/links.html`);
    await page.locator('#upi').click();
    const dialog = page.locator('ruko-upi-dialog [role="alertdialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('This link will make a payment');
    await expect(dialog).toContainText('cashback.reward@ybl');
    await expect(dialog).toContainText('2,500');
    await expect(dialog.locator('[data-action="cancel"]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('ruko-upi-dialog')).toHaveCount(0);
    expect(page.url()).toBe(`${FIXTURES}/links.html`);
  });

  test('can be switched off on the options page', async ({ context, background }) => {
    await setSettings(background, { upiGuard: false });
    const page = await context.newPage();
    await page.goto(`${FIXTURES}/links.html`);
    // With the guard off, Ruko does not intercept; stop the browser from launching an app.
    await page.evaluate(() => document.querySelector('#upi')?.addEventListener('click', (e) => e.preventDefault()));
    await page.locator('#upi').click();
    await page.waitForTimeout(500);
    await expect(page.locator('ruko-upi-dialog')).toHaveCount(0);
  });
});

test.describe('link tooltips everywhere (opt-in)', () => {
  test('appear on any site once enabled', async ({ context, background }) => {
    const page = await context.newPage();
    await page.goto(`${FIXTURES}/links.html`);
    await page.locator('#official').hover();
    await page.waitForTimeout(900);
    await expect(page.locator('ruko-tooltip')).toHaveCount(0);

    await setSettings(background, { linkTooltipsEverywhere: true });
    await page.reload();
    await page.locator('#fake').hover();
    const tip = page.locator('ruko-tooltip [role="tooltip"]');
    await expect(tip).toBeVisible();
    await expect(tip).toContainText('sbi-kyc-update.top');
    await page.locator('h1').hover();
    await expect(page.locator('ruko-tooltip')).toHaveCount(0);
  });
});
