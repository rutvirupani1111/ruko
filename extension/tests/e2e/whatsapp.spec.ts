import { expect, test } from './extension';

const SCAMS = ['msg-kyc', 'msg-job', 'msg-arrest', 'msg-upi'];
const GENUINE = ['msg-genuine-1', 'msg-genuine-2', 'msg-genuine-3'];

test.describe('WhatsApp Web fixture', () => {
  test('badges scam messages only and never changes the message text', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://web.whatsapp.com/');
    const textBefore = await page.locator('[data-testid="msg-kyc"] .selectable-text').textContent();

    for (const id of SCAMS) {
      await expect(page.locator(`[data-testid="${id}"] ruko-badge`), `${id} should get a badge`).toHaveCount(1);
    }
    for (const id of GENUINE) {
      await expect(page.locator(`[data-testid="${id}"] ruko-badge`), `${id} must stay clean`).toHaveCount(0);
    }
    // The user's own outgoing message is never analysed, even though it quotes a scam.
    await expect(page.locator('[data-testid="msg-out"] ruko-badge')).toHaveCount(0);

    const kycBadge = page.locator('[data-testid="msg-kyc"] ruko-badge button');
    await expect(kycBadge).toContainText('KYC');
    await expect(kycBadge).toContainText('Why?');
    expect(await page.locator('[data-testid="msg-kyc"] .selectable-text').textContent()).toBe(textBefore);
  });

  test('"Why?" opens the verdict popover with emergency actions', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://web.whatsapp.com/');
    const badge = page.locator('[data-testid="msg-arrest"] ruko-badge button');
    await badge.click();
    const dialog = page.locator('ruko-popover [role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('h2')).not.toBeEmpty();
    await expect(dialog.locator('a[href="tel:1930"]')).toHaveCount(1);
    await expect(dialog).toContainText('Checked on your device');
    await page.keyboard.press('Escape');
    await expect(page.locator('ruko-popover')).toHaveCount(0);
    await expect(badge).toBeFocused();
  });

  test('hovering a link shows the link safety tooltip', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://web.whatsapp.com/');
    // Let the badges finish rendering first: they shift the layout under the pointer.
    await expect(page.locator('ruko-badge')).toHaveCount(SCAMS.length);
    await page.locator('[data-testid="msg-genuine-3"] a').hover();
    const tip = page.locator('ruko-tooltip [role="tooltip"]');
    await expect(tip).toBeVisible();
    await expect(tip).toContainText('irctc.co.in');
    await page.locator('[data-testid="msg-kyc"] a').hover();
    await expect(tip).toContainText('sbi-kyc-update.top');
    await expect(tip).toHaveAttribute('data-tone', /danger|caution/);
  });

  test('the popup shows the site, its warning count, and switches Ruko off for that site', async ({ context, background, extensionId }) => {
    const chat = await context.newPage();
    await chat.goto('https://web.whatsapp.com/');
    await expect(chat.locator('ruko-badge')).toHaveCount(SCAMS.length);
    const tabId = await background.evaluate(async () => {
      const api = (globalThis as unknown as { chrome: { tabs: { query(q: object): Promise<Array<{ id?: number }>> } } }).chrome;
      return (await api.tabs.query({ url: 'https://web.whatsapp.com/*' }))[0]?.id ?? 0;
    });
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html?tab=${tabId}`);
    await expect(popup.locator('[data-testid="site-card"]')).toContainText('web.whatsapp.com');
    await expect(popup.locator('[data-testid="tab-count"]')).toHaveText(`${SCAMS.length} warnings on this tab`);
    const toggle = popup.locator('[data-testid="site-toggle"]');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(chat.locator('ruko-badge')).toHaveCount(0);
    await toggle.click();
    await expect(chat.locator('ruko-badge')).toHaveCount(SCAMS.length);
  });

  test('the toolbar badge counts warnings on the tab', async ({ context, background }) => {
    const page = await context.newPage();
    await page.goto('https://web.whatsapp.com/');
    await expect(page.locator('ruko-badge')).toHaveCount(SCAMS.length);
    const tabId = await background.evaluate(async () => {
      const api = (globalThis as unknown as { chrome: { tabs: { query(q: object): Promise<Array<{ id?: number; url?: string }>> } } }).chrome;
      const tabs = await api.tabs.query({});
      return tabs.find((t) => t.url?.startsWith('https://web.whatsapp.com'))?.id ?? -1;
    });
    await expect
      .poll(() =>
        background.evaluate(
          (id) =>
            (globalThis as unknown as { chrome: { action: { getBadgeText(d: { tabId: number }): Promise<string> } } }).chrome.action.getBadgeText({
              tabId: id,
            }),
          tabId,
        ),
      )
      .toBe(String(SCAMS.length));
  });
});
