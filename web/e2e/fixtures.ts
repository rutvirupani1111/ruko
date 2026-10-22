import { test as base, expect, type Page } from '@playwright/test';

export interface ApiMock {
  /** Bodies of every POST /api/v1/reports. */
  reports: Array<Record<string, unknown>>;
  /** Prefixes asked for with GET /api/v1/range/:prefix. */
  ranges: string[];
}

/** Mock the community API: empty ranges, reports accepted with a running count. */
export async function mockApi(page: Page, options: { reportStatus?: number; reportsCount?: number } = {}): Promise<ApiMock> {
  const mock: ApiMock = { reports: [], ranges: [] };
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/v1/range/')) {
      const prefix = url.pathname.split('/').pop() ?? '';
      mock.ranges.push(prefix);
      return route.fulfill({ json: { prefix, entries: [] } });
    }
    if (url.pathname === '/api/v1/reports' && request.method() === 'POST') {
      mock.reports.push(request.postDataJSON() as Record<string, unknown>);
      const status = options.reportStatus ?? 201;
      return route.fulfill({
        status,
        json: status === 201 ? { ok: true, reports: options.reportsCount ?? mock.reports.length } : { error: 'mocked' },
      });
    }
    if (url.pathname === '/api/health') return route.fulfill({ json: { ok: true, db: 'mock' } });
    return route.fulfill({ status: 404, json: { error: 'not_found' } });
  });
  return mock;
}

/** Every test gets a mocked API (automatically) and fails on uncaught page errors. */
export const test = base.extend<{ api: ApiMock }>({
  api: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      const api = await mockApi(page);
      await use(api);
      expect(errors, 'uncaught page errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
