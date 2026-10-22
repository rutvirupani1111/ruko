import { Hono, type Context } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import {
  IDENTIFIER_KINDS,
  MIN_DIFFICULTY,
  POW_MAX_AGE_MS,
  POW_MAX_FUTURE_MS,
  PREFIX_LENGTH,
  RATE_LIMIT_PER_DAY,
  RATE_LIMIT_PER_MINUTE,
  SCAM_CATEGORIES,
  type Category,
  type Kind,
} from './constants.js';
import { bytesToHex, hmacHex, leadingZeroBits, randomHex, sha256Bytes } from './crypto.js';
import type { Db } from './db.js';

/**
 * Ruko community API.
 *
 * Privacy model:
 * - Lookups are k-anonymous: clients send only the first 5 hex characters of
 *   SHA-256(kind:identifier) and match the rest locally.
 * - Reports carry the full hash (never the identifier), a category and a
 *   proof-of-work. The reporter is only known as HMAC(daily salt, IP), which
 *   rotates every day; raw IPs and identifiers are never stored or logged.
 */

export interface AppOptions {
  getDb: () => Promise<Db>;
  /** Secret used to derive the daily salt. Random per process when unset. */
  saltSecret?: string;
  /** Trust X-Forwarded-For (set behind Vercel or another trusted proxy). */
  trustProxy?: boolean;
  /** Fallback client address (e.g. from the Node socket). */
  getRemoteAddress?: (c: Context) => string | undefined;
  /** Origins allowed to POST reports cross-origin. Same-origin always works. */
  allowedOrigins?: string[];
  now?: () => number;
  version?: string;
}

const HEX64 = /^[0-9a-f]{64}$/;
const HEX5 = /^[0-9a-f]{5}$/;

type ReportBody = {
  hash: string;
  kind: Kind;
  category: Category;
  pow: { nonce: string; issuedAt: number; difficulty: number };
};

function parseReport(body: unknown): ReportBody | string {
  if (!body || typeof body !== 'object') return 'body must be a JSON object';
  const b = body as Record<string, unknown>;
  const hash = typeof b.hash === 'string' ? b.hash.toLowerCase() : '';
  if (!HEX64.test(hash)) return 'hash must be 64 lowercase hex characters (SHA-256)';
  if (typeof b.kind !== 'string' || !(IDENTIFIER_KINDS as readonly string[]).includes(b.kind)) return 'unknown kind';
  if (typeof b.category !== 'string' || !(SCAM_CATEGORIES as readonly string[]).includes(b.category)) return 'unknown category';
  const pow = b.pow as Record<string, unknown> | undefined;
  if (!pow || typeof pow !== 'object') return 'missing pow';
  const nonce = typeof pow.nonce === 'number' ? String(pow.nonce) : pow.nonce;
  if (typeof nonce !== 'string' || !/^[0-9]{1,16}$/.test(nonce)) return 'pow.nonce must be a decimal string';
  if (typeof pow.issuedAt !== 'number' || !Number.isSafeInteger(pow.issuedAt)) return 'pow.issuedAt must be epoch milliseconds';
  if (typeof pow.difficulty !== 'number' || !Number.isInteger(pow.difficulty) || pow.difficulty > 40) return 'pow.difficulty invalid';
  return {
    hash,
    kind: b.kind as Kind,
    category: b.category as Category,
    pow: { nonce, issuedAt: pow.issuedAt, difficulty: pow.difficulty },
  };
}

/** Order a {category: count} map into category ids, most reported first. */
function sortedCategories(map: unknown): string[] {
  if (!map || typeof map !== 'object') return [];
  return Object.entries(map as Record<string, number>)
    .filter(([, n]) => Number(n) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]))
    .map(([k]) => k);
}

const iso = (value: unknown) => new Date(value as string | number | Date).toISOString();

export function createApp(options: AppOptions) {
  const now = options.now ?? (() => Date.now());
  const secret = options.saltSecret || randomHex(32);
  const saltCache = new Map<string, string>();

  async function reporterId(c: Context): Promise<{ reporter: string; day: string }> {
    const day = new Date(now()).toISOString().slice(0, 10);
    let salt = saltCache.get(day);
    if (!salt) {
      salt = await hmacHex(secret, `ruko-daily-salt:${day}`);
      saltCache.clear();
      saltCache.set(day, salt);
    }
    let ip: string | undefined;
    if (options.trustProxy) {
      ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip')?.trim();
    }
    ip ||= options.getRemoteAddress?.(c) || 'unknown';
    // Only this keyed, daily-rotating digest is stored. The IP itself is not.
    const reporter = (await hmacHex(salt, ip)).slice(0, 32);
    return { reporter, day };
  }

  const app = new Hono();

  app.use('/api/*', async (c, next) => {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Referrer-Policy', 'no-referrer');
  });

  // Public, read-only endpoints may be called from anywhere (the browser extension too).
  app.use('/api/v1/range/*', cors({ origin: '*', allowMethods: ['GET', 'OPTIONS'], maxAge: 86400 }));
  app.use('/api/v1/stats', cors({ origin: '*', allowMethods: ['GET', 'OPTIONS'], maxAge: 86400 }));
  app.use('/api/health', cors({ origin: '*', allowMethods: ['GET', 'OPTIONS'] }));
  if (options.allowedOrigins?.length) {
    app.use(
      '/api/v1/reports',
      cors({ origin: options.allowedOrigins, allowMethods: ['POST', 'OPTIONS'], allowHeaders: ['content-type'], maxAge: 86400 }),
    );
  }

  app.get('/api/health', async (c) => {
    try {
      const db = await options.getDb();
      await db.query('SELECT 1');
      c.header('Cache-Control', 'no-store');
      return c.json({ ok: true, db: db.kind, version: options.version ?? 'dev', time: new Date(now()).toISOString() });
    } catch (err) {
      return c.json({ ok: false, error: 'database_unavailable', message: (err as Error).message }, 503);
    }
  });

  app.get('/api/v1/range/:prefix', async (c) => {
    const prefix = c.req.param('prefix').toLowerCase();
    if (!HEX5.test(prefix)) return c.json({ error: 'invalid_prefix', message: 'prefix must be 5 hex characters' }, 400);
    const db = await options.getDb();
    const rows = await db.query<{ suffix: string; reports: number; categories: unknown; last_reported_at: unknown }>(
      `SELECT substr(hash, ${PREFIX_LENGTH + 1}) AS suffix, reports, categories, last_reported_at
         FROM ruko_identifiers WHERE prefix = $1 ORDER BY reports DESC, hash ASC LIMIT 2000`,
      [prefix],
    );
    c.header('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600');
    return c.json({
      prefix,
      entries: rows.map((r) => ({
        suffix: r.suffix,
        reports: Number(r.reports),
        categories: sortedCategories(r.categories),
        lastReportedAt: iso(r.last_reported_at),
      })),
    });
  });

  app.get('/api/v1/stats', async (c) => {
    const db = await options.getDb();
    const since = new Date(now() - 30 * 24 * 60 * 60 * 1000);
    const rows = await db.query<{ category: string; count: number }>(
      `SELECT category, count(*)::int AS count FROM ruko_reports WHERE created_at >= $1 GROUP BY category ORDER BY count DESC, category ASC`,
      [since.toISOString()],
    );
    const categories = rows.map((r) => ({ category: r.category, count: Number(r.count) }));
    c.header('Cache-Control', 'public, max-age=600, s-maxage=600');
    return c.json({ since: since.toISOString(), days: 30, total: categories.reduce((n, r) => n + r.count, 0), categories });
  });

  app.post('/api/v1/reports', bodyLimit({ maxSize: 2048, onError: (c) => c.json({ error: 'too_large' }, 413) }), async (c) => {
    c.header('Cache-Control', 'no-store');
    const raw = await c.req.json().catch(() => null);
    const parsed = parseReport(raw);
    if (typeof parsed === 'string') return c.json({ error: 'invalid_report', message: parsed }, 400);
    const { hash, kind, category, pow } = parsed;

    // Proof-of-work: SHA-256(`${hash}:${issuedAt}:${nonce}`) must start with `difficulty` zero bits.
    if (pow.difficulty < MIN_DIFFICULTY) return c.json({ error: 'pow_too_easy', minimum: MIN_DIFFICULTY }, 400);
    const age = now() - pow.issuedAt;
    if (age > POW_MAX_AGE_MS || age < -POW_MAX_FUTURE_MS) return c.json({ error: 'pow_expired' }, 400);
    const digest = await sha256Bytes(`${hash}:${pow.issuedAt}:${pow.nonce}`);
    if (leadingZeroBits(digest) < pow.difficulty) return c.json({ error: 'pow_invalid' }, 400);

    const { reporter, day } = await reporterId(c);
    const db = await options.getDb();

    const result = await db.transaction(async (tx) => {
      // A proof can be used once.
      const fresh = await tx.query('INSERT INTO ruko_pow_seen (digest) VALUES ($1) ON CONFLICT DO NOTHING RETURNING digest', [bytesToHex(digest)]);
      if (fresh.length === 0) return { status: 409 as const, body: { error: 'pow_reused' } };

      const [counts] = await tx.query<{ day: number; minute: number }>(
        `SELECT count(*) FILTER (WHERE created_at >= $2)::int AS day,
                count(*) FILTER (WHERE created_at >= $3)::int AS minute
           FROM ruko_reports WHERE reporter = $1 AND created_at >= $2`,
        [reporter, new Date(now() - 24 * 3600 * 1000).toISOString(), new Date(now() - 60 * 1000).toISOString()],
      );
      if ((counts?.day ?? 0) >= RATE_LIMIT_PER_DAY || (counts?.minute ?? 0) >= RATE_LIMIT_PER_MINUTE) {
        return { status: 429 as const, body: { error: 'rate_limited' } };
      }

      const inserted = await tx.query(
        `INSERT INTO ruko_reports (hash, kind, category, reporter, day, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (hash, reporter, day) DO NOTHING RETURNING id`,
        [hash, kind, category, reporter, day, new Date(now()).toISOString()],
      );
      if (inserted.length === 0) return { status: 409 as const, body: { error: 'already_reported_today' } };

      const [agg] = await tx.query<{ reports: number }>(
        `INSERT INTO ruko_identifiers (hash, prefix, kind, reports, categories, first_reported_at, last_reported_at)
         VALUES ($1, $2, $3, 1, jsonb_build_object($4::text, 1), $5, $5)
         ON CONFLICT (hash) DO UPDATE SET
           reports = ruko_identifiers.reports + 1,
           categories = jsonb_set(ruko_identifiers.categories, ARRAY[$4::text],
             to_jsonb(COALESCE((ruko_identifiers.categories ->> $4::text)::int, 0) + 1)),
           last_reported_at = EXCLUDED.last_reported_at
         RETURNING reports`,
        [hash, hash.slice(0, PREFIX_LENGTH), kind, category, new Date(now()).toISOString()],
      );
      return { status: 201 as const, body: { ok: true, reports: Number(agg?.reports ?? 1) } };
    });

    // Housekeeping: forget used proofs once they could no longer be replayed anyway.
    if (Math.random() < 0.05) {
      void db.query('DELETE FROM ruko_pow_seen WHERE created_at < $1', [new Date(now() - 2 * POW_MAX_AGE_MS).toISOString()]).catch(() => undefined);
    }

    return c.json(result.body, result.status);
  });

  app.notFound((c) => c.json({ error: 'not_found' }, 404));
  app.onError((err, c) => {
    console.error('[ruko-api]', err.message);
    return c.json({ error: 'server_error' }, 500);
  });

  return app;
}
