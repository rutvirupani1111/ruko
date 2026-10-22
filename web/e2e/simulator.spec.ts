import { expect, test } from './fixtures';

test('a full simulator run ends with a score and a result card', async ({ page }) => {
  await page.goto('/simulator');
  await expect(page.locator('h1')).toHaveText(/spot the scam/i);
  await page.getByTestId('level-1').click();

  const round = page.getByTestId('sim-round');
  await expect(round).toBeVisible();
  const total = Number((await round.textContent())!.match(/of (\d+)/)![1]);
  expect(total).toBeGreaterThanOrEqual(5);

  let correct = 0;
  for (let i = 0; i < total; i++) {
    await expect(round).toHaveText(`${i + 1} of ${total}`);
    await expect(page.getByTestId('sim-phone')).toBeVisible();
    // Alternate answers so both buttons are exercised.
    await page.getByTestId(i % 2 === 0 ? 'answer-scam' : 'answer-safe').click();
    const feedback = page.getByTestId('sim-feedback');
    await expect(feedback).toBeVisible();
    if ((await feedback.getAttribute('data-correct')) === 'true') correct++;
    await page.getByTestId('sim-next').click();
  }

  await expect(page.getByTestId('sim-summary')).toBeVisible();
  await expect(page.getByTestId('sim-final')).toHaveText(`${correct}/${total}`);
  await expect(page.getByTestId('sim-share')).toBeEnabled();

  // The best result is remembered for the level picker.
  await page.reload();
  await expect(page.getByTestId('level-1')).toContainText(`${correct}/${total}`);
});
