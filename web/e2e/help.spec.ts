import { expect, test } from './fixtures';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('the help checklist is saved on the device', async ({ page }) => {
  await page.goto('/help');
  await expect(page.getByTestId('help-call-1930')).toHaveAttribute('href', 'tel:1930');
  await expect(page.getByTestId('help-progress')).toHaveText('0 of 9 done');

  const first = page.locator('[data-step="stop"] [role="checkbox"]');
  const second = page.locator('[data-step="call"] [role="checkbox"]');
  await first.click();
  await second.click();
  await expect(first).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('help-progress')).toHaveText('2 of 9 done');

  await page.reload();
  await expect(page.getByTestId('help-progress')).toHaveText('2 of 9 done');
  await expect(second).toHaveAttribute('aria-checked', 'true');
});

test('the complaint draft is built on the device and can be copied', async ({ page }) => {
  await page.goto('/help');
  const form = page.getByTestId('complaint-form');
  await form.getByLabel('Full name').fill('Asha Verma');
  await form.getByLabel('Type of fraud').selectOption('kyc_update');
  await form.getByLabel('Describe what happened, in your own words').fill('A caller said my SBI KYC had expired and sent a link.');

  const preview = page.getByTestId('complaint-preview');
  await expect(preview).toContainText('Asha Verma');
  await expect(preview).toContainText('A caller said my SBI KYC had expired');

  await page.getByTestId('complaint-copy').click();
  await expect(page.getByTestId('complaint-copy')).toContainText('Copied');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain('Asha Verma');

  // Switching the draft to Hindi rewrites the labels, not the person's words.
  await form.getByText('हिंदी', { exact: true }).click();
  await expect(preview).toContainText('Asha Verma');
  await expect(preview).toHaveText(/[ऀ-ॿ]/);
});
