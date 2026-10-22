import { expect, test } from './fixtures';

test.describe('check flow', () => {
  test('the KYC sample gets a critical verdict with highlighted red flags', async ({ page, api }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await page.click('[data-sample="kyc"]');

    const card = page.getByTestId('verdict-card');
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('data-severity', 'critical');
    await expect(page.getByTestId('verdict-headline')).not.toBeEmpty();
    await expect(page.getByTestId('risk-meter')).toBeVisible();

    // The signature highlighter marks the red-flag phrases in the person's own text.
    const marks = page.locator('[data-testid="highlighted-text"] .hl');
    await expect(marks.first()).toBeVisible();
    expect(await marks.count()).toBeGreaterThan(1);

    // The big official actions (Call 1930 first) are offered for a dangerous message.
    await expect(card.locator('a[href="tel:1930"]').first()).toBeVisible();

    // Community lookups only ever send a 5-character prefix.
    await expect.poll(() => api.ranges.length, { timeout: 5000 }).toBeGreaterThan(0);
    for (const prefix of api.ranges) expect(prefix).toMatch(/^[0-9a-f]{5}$/);
  });

  test('typing a genuine-looking message does not raise the alarm', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('check-input').fill('Hi Ma, reached the hostel safely. Will call you after dinner.');
    const card = page.getByTestId('verdict-card');
    await expect(card).toBeVisible();
    await expect(card).not.toHaveAttribute('data-severity', /critical|high/);
  });

  test('"Report this" hands the IDs over to the report form', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-sample="kyc"]');
    await expect(page.getByTestId('verdict-card')).toHaveAttribute('data-severity', 'critical');
    await page.getByRole('button', { name: 'Report this' }).click();
    await expect(page).toHaveURL(/\/report$/);
    await expect(page.getByTestId('report-handoff')).toBeVisible();
    await expect(page.getByTestId('report-preview')).toBeVisible();
    await expect(page.getByTestId('report-category')).not.toHaveValue('');
  });
});

test('switching to Hindi translates the app and is remembered', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  // The closed mobile menu holds a second switch; roles only match the visible one.
  const hindi = page.getByRole('button', { name: 'हिंदी' });
  await hindi.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await expect(page).toHaveTitle(/मैसेज/);
  await expect(hindi).toHaveAttribute('aria-pressed', 'true');

  // The checker answers in Hindi too.
  await page.click('[data-sample="kyc"]');
  await expect(page.getByTestId('verdict-card')).toHaveAttribute('data-severity', 'critical');
  await expect(page.getByTestId('verdict-headline')).toHaveText(/[ऀ-ॿ]/);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await page.goto('/privacy');
  await expect(page.locator('h1')).toHaveText(/आपके मैसेज/);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText(/without seeing them/);
});
