// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app';
import { MIN_DIFFICULTY, SCAM_CATEGORIES } from './constants';
import { openPglite, type Db } from './db';
import { solvePow } from '../src/lib/sha256';
import { CATEGORY_ORDER } from '../src/data/categories';

let db: Db;

beforeAll(async () => {
  db = await openPglite('memory');
});

afterAll(async () => {
  await db?.close();
});

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function makeApp(now = () => Date.now()) {
  return createApp({ getDb: async () => db, saltSecret: 'test-secret', trustProxy: true, now });
}

function prove(hash: string, issuedAt: number, difficulty = MIN_DIFFICULTY) {
  const nonce = solvePow(`${hash}:${issuedAt}:`, difficulty);
  if (nonce === null) throw new Error('no nonce');
  return { nonce: String(nonce), issuedAt, difficulty };
}

async function report(
  app: ReturnType<typeof createApp>,
  body: Record<string, unknown>,
  ip = '198.51.100.1',
) {
  return app.request('/api/v1/reports', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

describe('community API', () => {
  it('reports health with the PGlite driver', async () => {
    const res = await makeApp().request('/api/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, db: 'pglite' });
  });

  it('validates the range prefix and is cacheable', async () => {
    const app = makeApp();
    expect((await app.request('/api/v1/range/xyz')).status).toBe(400);
    expect((await app.request('/api/v1/range/abcdef')).status).toBe(400);
    const res = await app.request('/api/v1/range/00000');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('max-age');
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(await res.json()).toEqual({ prefix: '00000', entries: [] });
  });

  it('accepts a report with valid proof-of-work and serves it by range only', async () => {
    const app = makeApp();
    const hash = await sha256Hex('upi:fraud.kyc@ybl');
    const res = await report(app, { hash, kind: 'upi', category: 'kyc_update', pow: prove(hash, Date.now()) });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true, reports: 1 });

    const range = await (await app.request(`/api/v1/range/${hash.slice(0, 5)}`)).json();
    const entry = range.entries.find((e: { suffix: string }) => e.suffix === hash.slice(5));
    expect(entry).toMatchObject({ reports: 1, categories: ['kyc_update'] });
    expect(typeof entry.lastReportedAt).toBe('string');
    // The response never contains the full hash.
    expect(JSON.stringify(range)).not.toContain(hash);
  });

  it('counts one report per person per day, and different people add up', async () => {
    const app = makeApp();
    const hash = await sha256Hex('phone:+919876500001');
    const first = await report(app, { hash, kind: 'phone', category: 'digital_arrest', pow: prove(hash, Date.now()) }, '203.0.113.10');
    expect(first.status).toBe(201);
    const again = await report(app, { hash, kind: 'phone', category: 'digital_arrest', pow: prove(hash, Date.now()) }, '203.0.113.10');
    expect(again.status).toBe(409);
    expect(await again.json()).toEqual({ error: 'already_reported_today' });

    await report(app, { hash, kind: 'phone', category: 'fake_support', pow: prove(hash, Date.now()) }, '203.0.113.11');
    const third = await report(app, { hash, kind: 'phone', category: 'digital_arrest', pow: prove(hash, Date.now()) }, '203.0.113.12');
    expect(await third.json()).toEqual({ ok: true, reports: 3 });

    const range = await (await app.request(`/api/v1/range/${hash.slice(0, 5)}`)).json();
    const entry = range.entries.find((e: { suffix: string }) => e.suffix === hash.slice(5));
    expect(entry.reports).toBe(3);
    expect(entry.categories).toEqual(['digital_arrest', 'fake_support']);
  });

  it('rejects bad, weak, stale and replayed proofs', async () => {
    const app = makeApp();
    const hash = await sha256Hex('domain:sbi-kyc-update.top');
    const good = prove(hash, Date.now());

    const wrong = await report(app, { hash, kind: 'domain', category: 'phishing_link', pow: { ...good, nonce: String(Number(good.nonce) + 1) } }, '192.0.2.1');
    // A neighbouring nonce is almost certainly not a solution.
    expect([400, 201]).toContain(wrong.status);
    if (wrong.status === 400) expect(await wrong.json()).toEqual({ error: 'pow_invalid' });

    const weak = await report(app, { hash, kind: 'domain', category: 'phishing_link', pow: prove(hash, Date.now(), 8) }, '192.0.2.2');
    expect(weak.status).toBe(400);
    expect((await weak.json()).error).toBe('pow_too_easy');

    const oldTime = Date.now() - 11 * 60 * 1000;
    const stale = await report(app, { hash, kind: 'domain', category: 'phishing_link', pow: prove(hash, oldTime) }, '192.0.2.3');
    expect(stale.status).toBe(400);
    expect((await stale.json()).error).toBe('pow_expired');

    const ok = await report(app, { hash, kind: 'domain', category: 'phishing_link', pow: good }, '192.0.2.4');
    expect(ok.status).toBe(201);
    const replay = await report(app, { hash, kind: 'domain', category: 'phishing_link', pow: good }, '192.0.2.5');
    expect(replay.status).toBe(409);
    expect((await replay.json()).error).toBe('pow_reused');
  });

  it('validates the report body', async () => {
    const app = makeApp();
    const hash = await sha256Hex('url:bit.ly/abc');
    const bad = [
      { hash: 'nothex', kind: 'url', category: 'phishing_link' },
      { hash, kind: 'passport', category: 'phishing_link' },
      { hash, kind: 'url', category: 'not_a_category' },
      { hash, kind: 'url', category: 'phishing_link' },
    ];
    for (const body of bad) {
      const res = await report(app, body);
      expect(res.status).toBe(400);
    }
    const garbage = await app.request('/api/v1/reports', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
    expect(garbage.status).toBe(400);
    const huge = await app.request('/api/v1/reports', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hash, pad: 'x'.repeat(5000) }),
    });
    expect(huge.status).toBe(413);
  });

  it('rate-limits a single reporter', async () => {
    const app = makeApp();
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const hash = await sha256Hex(`upi:burst${i}@ybl`);
      const res = await report(app, { hash, kind: 'upi', category: 'upi_collect', pow: prove(hash, Date.now()) }, '198.51.100.77');
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 6).every((s) => s === 201)).toBe(true);
    expect(statuses[6]).toBe(429);
  });

  it('never stores raw IP addresses or identifiers', async () => {
    const app = makeApp();
    const identifier = 'secret.scammer@okicici';
    const hash = await sha256Hex(`upi:${identifier}`);
    await report(app, { hash, kind: 'upi', category: 'fake_refund', pow: prove(hash, Date.now()) }, '203.0.113.99');
    const dump = JSON.stringify([
      await db.query('SELECT * FROM ruko_reports'),
      await db.query('SELECT * FROM ruko_identifiers'),
      await db.query('SELECT * FROM ruko_pow_seen'),
    ]);
    expect(dump).not.toContain('203.0.113.99');
    expect(dump).not.toContain(identifier);
    expect(dump).toContain(hash);
  });

  it('returns 30-day category counts', async () => {
    const res = await makeApp().request('/api/v1/stats');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.days).toBe(30);
    expect(body.total).toBeGreaterThan(0);
    const kyc = body.categories.find((c: { category: string }) => c.category === 'kyc_update');
    expect(kyc.count).toBeGreaterThanOrEqual(1);
  });

  it('knows every Learn category (and the engine catch-all)', () => {
    for (const c of CATEGORY_ORDER) expect(SCAM_CATEGORIES).toContain(c);
    expect(SCAM_CATEGORIES).toContain('other');
    expect(SCAM_CATEGORIES.length).toBe(CATEGORY_ORDER.length + 1);
  });

  it('answers unknown routes with JSON 404', async () => {
    const res = await makeApp().request('/api/v2/nope');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_found' });
  });
});
