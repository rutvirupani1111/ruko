/**
 * One SQL dialect (Postgres), two drivers: PGlite (in-process Postgres in
 * WebAssembly, a folder under .data/) for local development and tests, and
 * node-postgres for production with DATABASE_URL (e.g. Neon).
 */

export interface Queryable {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
}

export interface Db extends Queryable {
  kind: 'pglite' | 'postgres';
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS ruko_identifiers (
  hash              text PRIMARY KEY CHECK (hash ~ '^[0-9a-f]{64}$'),
  prefix            text NOT NULL CHECK (char_length(prefix) = 5),
  kind              text NOT NULL,
  reports           integer NOT NULL DEFAULT 0,
  categories        jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_reported_at timestamptz NOT NULL DEFAULT now(),
  last_reported_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ruko_identifiers_prefix_idx ON ruko_identifiers (prefix);

CREATE TABLE IF NOT EXISTS ruko_reports (
  id          bigserial PRIMARY KEY,
  hash        text NOT NULL,
  kind        text NOT NULL,
  category    text NOT NULL,
  reporter    text NOT NULL,
  day         date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hash, reporter, day)
);
CREATE INDEX IF NOT EXISTS ruko_reports_created_idx ON ruko_reports (created_at);
CREATE INDEX IF NOT EXISTS ruko_reports_reporter_idx ON ruko_reports (reporter, created_at);

CREATE TABLE IF NOT EXISTS ruko_pow_seen (
  digest      text PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now()
);
`;

/** Open PGlite: a directory for persistence, or 'memory' for tests. */
export async function openPglite(dataDir: string | 'memory' = 'memory'): Promise<Db> {
  // Loaded by name at runtime so production bundles never include PGlite.
  const specifier = '@electric-sql/pglite';
  const { PGlite } = (await import(/* @vite-ignore */ specifier)) as typeof import('@electric-sql/pglite');
  const pg = dataDir === 'memory' ? new PGlite() : new PGlite(dataDir);
  await pg.waitReady;
  await pg.exec(SCHEMA);
  const query = async <T,>(sql: string, params: unknown[] = []) => (await pg.query<T>(sql, params)).rows;
  return {
    kind: 'pglite',
    query,
    async transaction(fn) {
      return pg.transaction(async (tx) => fn({ query: async <T,>(sql: string, params: unknown[] = []) => (await tx.query<T>(sql, params)).rows }));
    },
    close: () => pg.close(),
  };
}

/** Open a pooled node-postgres connection. Serverless-friendly: small pool, short idle timeout. */
export async function openPostgres(connectionString: string): Promise<Db> {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({ connectionString, max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 8_000 });
  await pool.query(SCHEMA);
  return {
    kind: 'postgres',
    async query<T>(sql: string, params: unknown[] = []) {
      return (await pool.query(sql, params)).rows as T[];
    },
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn({
          query: async <T,>(sql: string, params: unknown[] = []) => (await client.query(sql, params)).rows as T[],
        });
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw err;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}

let shared: Promise<Db> | null = null;

/**
 * DATABASE_URL set: Postgres. Otherwise PGlite under RUKO_DATA_DIR (default
 * .data/pglite), or in memory when RUKO_DB=memory. Production must set
 * DATABASE_URL; PGlite is refused there because serverless disks are not durable.
 */
export function getDb(env: Record<string, string | undefined> = process.env): Promise<Db> {
  if (!shared) {
    shared = (async () => {
      if (env.DATABASE_URL) return openPostgres(env.DATABASE_URL);
      if (env.VERCEL || env.NODE_ENV === 'production') {
        throw new Error('DATABASE_URL is not set. Configure a Postgres database (for example Neon) for the community API.');
      }
      return openPglite(env.RUKO_DB === 'memory' ? 'memory' : (env.RUKO_DATA_DIR ?? '.data/pglite'));
    })();
    shared.catch(() => {
      shared = null;
    });
  }
  return shared;
}
