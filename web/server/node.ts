/**
 * Local community API for development and tests: http://localhost:5182
 *   npm run api            persistent PGlite database in .data/pglite
 *   RUKO_DB=memory ...     throwaway in-memory database (used by the e2e suite)
 *   DATABASE_URL=...       use a real Postgres instead
 */
import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { createApp } from './app.js';
import { getDb } from './db.js';

const port = Number(process.env.PORT ?? process.env.RUKO_API_PORT ?? 5182);

const app = createApp({
  getDb: () => getDb(),
  saltSecret: process.env.RUKO_SALT_SECRET,
  trustProxy: process.env.RUKO_TRUST_PROXY === '1',
  getRemoteAddress: (c) => getConnInfo(c).remote.address,
  allowedOrigins: process.env.RUKO_ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean),
  version: 'local',
});

const server = serve({ fetch: app.fetch, port, hostname: 'localhost' }, async (info) => {
  const db = await getDb().catch((err: Error) => {
    console.error(`[ruko-api] database error: ${err.message}`);
    return null;
  });
  console.log(`[ruko-api] listening on http://localhost:${info.port} (${db?.kind ?? 'no database'}${process.env.RUKO_DB === 'memory' ? ', in memory' : ''})`);
});

const shutdown = async () => {
  server.close();
  const db = await getDb().catch(() => null);
  await db?.close().catch(() => undefined);
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
