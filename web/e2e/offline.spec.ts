import { expect, test } from '@playwright/test';

// This spec needs the real service worker (the others block it to mock the API).
test.use({ serviceWorkers: 'allow' });

test('reloads and checks offline once the service worker is installed', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  // Wait for the service worker to finish precaching and take control of the page.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 15_000 }).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByTestId('offline-badge')).toBeVisible();

  // The engine is precached: checking still works without a network.
  await page.click('[data-sample="kyc"]');
  await expect(page.getByTestId('verdict-card')).toHaveAttribute('data-severity', 'critical');

  // Other pages load from the cache too, including deep links.
  await page.goto('/simulator');
  await expect(page.locator('h1')).toHaveText(/spot the scam/i);
  await page.goto('/learn/digital_arrest');
  await expect(page.getByTestId('category-page')).toBeVisible();
  await context.setOffline(false);
});
