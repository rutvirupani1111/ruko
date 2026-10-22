/**
 * Vercel Function that serves the Hono community API at /api/*.
 * vercel.json rewrites every /api/... path here; the request keeps its
 * original URL, so the Hono routes (/api/v1/range/:prefix, ...) match.
 * Requires DATABASE_URL (e.g. Neon). Set RUKO_SALT_SECRET to a long random string.
 */
import { createApp } from '../server/app.js';
import { getDb } from '../server/db.js';

const app = createApp({
  getDb: () => getDb(),
  saltSecret: process.env.RUKO_SALT_SECRET,
  // Vercel sets X-Forwarded-For to the real client address.
  trustProxy: true,
  allowedOrigins: process.env.RUKO_ALLOWED_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'vercel',
});

const handle = (request: Request) => app.fetch(request);

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const OPTIONS = handle;
