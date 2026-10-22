import { expect, openExtensionPage, test } from './extension';

test.describe('extension pages', () => {
  test('popup renders status, quick check and footer actions', async ({ context, extensionId }) => {
    const page = await openExtensionPage(context, extensionId, 'popup.html');
    await expect(page.getByText('Ruko', { exact: false }).first()).toBeVisible();
    await expect(page.locator('[data-testid="site-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-check-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="open-panel"]')).toBeVisible();

    await page.locator('[data-testid="quick-check-input"]').fill('Hi, are we still meeting for lunch tomorrow?');
    await page.locator('[data-testid="quick-check-submit"]').click();
    const result = page.locator('[data-testid="quick-result"] [data-testid="verdict-card"]');
    await expect(result).toBeVisible();
    await expect(result.locator('h2')).not.toBeEmpty();
  });

  test('popup quick check flags a scam', async ({ context, extensionId }) => {
    const page = await openExtensionPage(context, extensionId, 'popup.html');
    await page
      .locator('[data-testid="quick-check-input"]')
      .fill('Your SBI account will be blocked today. Update KYC now at http://sbi-kyc-update.top/login and share the OTP.');
    await page.locator('[data-testid="quick-check-submit"]').click();
    const card = page.locator('[data-testid="quick-result"] [data-testid="verdict-card"]');
    await expect(card).toHaveAttribute('data-severity', /high|critical/);
  });

  test('popup switches to Hindi', async ({ context, extensionId }) => {
    const page = await openExtensionPage(context, extensionId, 'popup.html');
    await page.locator('[data-testid="lang-hi"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
    await expect(page.locator('[data-testid="quick-check-submit"]')).toHaveText('जाँचें');
  });

  test('side panel analyses text with highlighted red flags and keeps history', async ({ context, extensionId }) => {
    const page = await openExtensionPage(context, extensionId, 'sidepanel.html');
    await expect(page.locator('[data-testid="panel-empty"]')).toBeVisible();
    await page
      .locator('[data-testid="panel-input"]')
      .fill('Dear customer your KYC is pending and your account will be blocked today. Update at http://sbi-kyc-update.top now.');
    await page.locator('[data-testid="panel-check"]').click();
    const card = page.locator('[data-testid="panel-result"] [data-testid="verdict-card"]');
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('data-severity', /medium|high|critical/);
    await expect(card.locator('a[href="tel:1930"]')).toHaveCount(1);

    await page.locator('[data-testid="tab-history"]').click();
    await expect(page.locator('[data-testid="history-list"] li')).toHaveCount(1);
    await page.locator('[data-testid="clear-history"]').click();
    await page.locator('[data-testid="confirm-clear-yes"]').click();
    await expect(page.locator('[data-testid="history-empty"]')).toBeVisible();
  });

  test('options page saves settings and shows placeholder support details', async ({ context, extensionId, background }) => {
    const page = await openExtensionPage(context, extensionId, 'options.html');
    await expect(page.locator('h1')).toHaveText('Ruko Shield settings');
    const community = page.locator('[data-testid="toggle-community"]');
    await expect(community).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('[data-testid="support"] [data-testid="placeholder-tag"]').first()).toBeVisible();

    await page.locator('[data-testid="toggle-tooltips"]').click();
    await expect(page.locator('[data-testid="toggle-tooltips"]')).toHaveAttribute('aria-checked', 'true');
    await page.locator('[data-testid="warn-high"]').check();
    await expect
      .poll(() =>
        background.evaluate(async () => {
          const api = (globalThis as unknown as { chrome: { storage: { local: { get(k: string): Promise<Record<string, { linkTooltipsEverywhere?: boolean; warnAt?: string }>> } } } }).chrome;
          const { settings } = await api.storage.local.get('settings');
          return `${settings?.linkTooltipsEverywhere}:${settings?.warnAt}`;
        }),
      )
      .toBe('true:high');

    await page.locator('[data-testid="lang-hi"]').first().click();
    await expect(page.locator('h1')).toHaveText('Ruko Shield सेटिंग्स');
  });
});
