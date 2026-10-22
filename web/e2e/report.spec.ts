import { createHash } from 'node:crypto';
import type { Page } from '@playwright/test';
import { expect, mockApi, test } from './fixtures';

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

/** The kind radios are visually hidden inside their labels: click the label like a person would. */
const chooseKind = (page: Page, kind: 'upi' | 'phone' | 'link') => page.locator('label').filter({ has: page.getByTestId(`report-kind-${kind}`) }).click();

function leadingZeroBits(hex: string): number {
  let bits = 0;
  for (const ch of hex) {
    const nibble = parseInt(ch, 16);
    if (nibble === 0) {
      bits += 4;
      continue;
    }
    return bits + Math.clz32(nibble) - 28;
  }
  return bits;
}

test.describe('report form', () => {
  test('sends only a fingerprint, after a proof-of-work in a worker', async ({ page, api }) => {
    await page.goto('/report');
    await expect(page.locator('h1')).toHaveText('Warn the next person');
    await expect(page.getByTestId('report-not-verified')).toContainText('Community reports, not verified');

    await page.getByTestId('report-value').fill('Fraud.KYC@ybl');
    await expect(page.getByTestId('report-preview')).toContainText('fraud.kyc@ybl');
    await page.getByTestId('report-category').selectOption('kyc_update');
    await page.getByTestId('report-submit').click();

    // The proof-of-work step shows progress while the worker searches.
    const working = page.getByTestId('report-working');
    await expect(working).toBeVisible();
    await expect(page.getByTestId('report-progress')).toBeVisible();

    await expect(page.getByTestId('report-success')).toBeVisible({ timeout: 45_000 });
    expect(api.reports).toHaveLength(1);
    const body = api.reports[0] as { hash: string; kind: string; category: string; pow: { nonce: string; issuedAt: number; difficulty: number } };

    // The UPI ID itself never leaves the page: only its SHA-256 fingerprint.
    expect(JSON.stringify(body).toLowerCase()).not.toContain('fraud.kyc');
    expect(body.hash).toBe(sha256('upi:fraud.kyc@ybl'));
    expect(body).toMatchObject({ kind: 'upi', category: 'kyc_update' });
    expect(body.pow.difficulty).toBe(18);
    expect(leadingZeroBits(sha256(`${body.hash}:${body.pow.issuedAt}:${body.pow.nonce}`))).toBeGreaterThanOrEqual(18);
  });

  test('stops at the proof-of-work step and can be cancelled', async ({ page }) => {
    await page.goto('/report');
    await chooseKind(page, 'phone');
    await page.getByTestId('report-value').fill('98765 43210');
    await expect(page.getByTestId('report-preview')).toContainText('+91 98765 43210');
    await page.getByTestId('report-category').selectOption('digital_arrest');
    await page.getByTestId('report-submit').click();
    await expect(page.getByTestId('report-working')).toHaveAttribute('data-stage', /hashing|working/);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTestId('report-form')).toBeVisible();
    await expect(page.getByTestId('report-value')).toHaveValue('98765 43210');
  });

  test('validates input and refuses official websites', async ({ page }) => {
    await page.goto('/report');
    await page.getByTestId('report-submit').click();
    await expect(page.getByTestId('report-value-error')).toBeVisible();
    await expect(page.getByTestId('report-working')).toHaveCount(0);

    await chooseKind(page, 'link');
    await page.getByTestId('report-value').fill('https://www.onlinesbi.sbi/');
    await page.getByTestId('report-value').blur();
    await expect(page.getByTestId('report-value-error')).toContainText('official website');

    // A page on a big platform is reported as that exact link, never the whole site.
    await page.getByTestId('report-value').fill('https://docs.google.com/forms/d/e/fake-kyc/viewform');
    await expect(page.getByTestId('report-preview')).toContainText('Only this exact link');

    // A UPI ID typed in the wrong box offers to switch.
    await page.getByTestId('report-value').fill('refund.desk@okaxis');
    await page.getByRole('button', { name: 'Report it as a UPI ID' }).click();
    await expect(page.getByTestId('report-kind-upi')).toBeChecked();
    await expect(page.getByTestId('report-preview')).toContainText('refund.desk@okaxis');
  });

  test('explains server answers such as a repeat report', async ({ page }) => {
    await page.unrouteAll();
    await mockApi(page, { reportStatus: 409 });
    await page.goto('/report');
    await page.getByTestId('report-value').fill('lucky.draw@ybl');
    await page.getByTestId('report-category').selectOption('lottery_prize');
    await page.getByTestId('report-submit').click();
    await expect(page.getByTestId('report-error')).toHaveAttribute('data-error', 'duplicate', { timeout: 45_000 });
    await expect(page.getByTestId('report-error')).toContainText('already reported this today');
  });
});
