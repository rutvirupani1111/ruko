import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test.describe('privacy and about', () => {
  test('the k-anonymity diagram walks through all four steps', async ({ page }) => {
    await page.goto('/privacy');
    const diagram = page.getByTestId('kanon-diagram');
    await expect(diagram).toBeVisible();

    await page.getByTestId('kanon-step-1').click();
    await expect(diagram).toHaveAttribute('data-step', '0');
    const hash = (await page.getByTestId('kanon-hash').textContent())!.trim();
    expect(hash).toMatch(/^[0-9a-f]{64}$/);

    await page.getByTestId('kanon-step-2').click();
    await expect(page.getByTestId('kanon-prefix')).toHaveText(hash.slice(0, 5));
    await page.getByTestId('kanon-step-4').click();
    await expect(diagram).toHaveAttribute('data-step', '3');
    await expect(diagram).toContainText('Match found on your phone');

    // Try it: the fingerprint is computed on the page, and only 5 characters would be sent.
    await page.getByTestId('try-fingerprint').fill('98765 43210');
    await expect(page.getByTestId('try-prefix')).toHaveText(/^[0-9a-f]{5}$/);
  });

  test('the community lookups switch is remembered', async ({ page }) => {
    await page.goto('/privacy');
    const toggle = page.getByTestId('lookups-toggle');
    await expect(toggle).toBeChecked();
    await toggle.uncheck({ force: true });
    await page.reload();
    await expect(page.getByTestId('lookups-toggle')).not.toBeChecked();
  });

  test('about links to the code and the extension releases, and marks placeholders', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('link', { name: /View the code/ })).toHaveAttribute('href', 'https://github.com/rutvirupani1111/ruko');
    await expect(page.getByRole('link', { name: /Download from GitHub releases/ })).toHaveAttribute(
      'href',
      'https://github.com/rutvirupani1111/ruko/releases',
    );
    const placeholders = page.locator('[data-testid="about-support"] [data-placeholder="true"]');
    expect(await placeholders.count()).toBeGreaterThan(0);
    await expect(placeholders.first()).toContainText('Not set up yet');
    // Placeholders are never links to somewhere fake.
    await expect(page.locator('[data-testid="about-support"] a[href*="YOUR-"]')).toHaveCount(0);
  });
});

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  for (const path of ['/report', '/privacy', '/about']) {
    for (const scheme of ['light', 'dark'] as const) {
      test(`${path} in ${scheme} mode has no serious violations`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
        await page.goto(path);
        await expect(page.locator('h1')).toBeVisible();
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      });
    }
  }
});
