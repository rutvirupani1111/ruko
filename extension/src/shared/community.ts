/**
 * Optional community lookups with k-anonymity (SPEC section 2, "Community API").
 *
 * The full SHA-256 identifier hash is computed on this device. Only its first
 * PREFIX_LENGTH hex characters are sent to the server, which answers with every
 * reported hash sharing that prefix. The match happens here, so the server never
 * learns which link, UPI ID or number was checked.
 */
import type { Verdict } from '@ruko/engine';
import { COMMUNITY_MIN_REPORTS } from '../config';
import type { CommunityQuery } from './messages';

export const PREFIX_LENGTH = 5;

/** Identifiers from a verdict worth asking the community about (never official domains). */
export function communityQueries(verdict: Verdict): CommunityQuery[] {
  const queries: CommunityQuery[] = [];
  for (const u of verdict.entities.urls) if (!u.official) queries.push({ kind: 'domain', value: u.registrableDomain || u.host || u.url });
  for (const u of verdict.entities.upiIds) queries.push({ kind: 'upi', value: u.vpa });
  for (const r of verdict.entities.upiRequests) queries.push({ kind: 'upi', value: r.payee });
  for (const p of verdict.entities.phones) queries.push({ kind: 'phone', value: p.e164 || p.raw });
  for (const e of verdict.entities.emails) queries.push({ kind: 'email', value: e });
  const seen = new Set<string>();
  return queries
    .filter((q) => {
      const key = `${q.kind}:${q.value}`;
      if (!q.value || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

export interface RangeEntry {
  suffix: string;
  reports: number;
  categories: string[];
  lastReportedAt?: string;
}

export interface RangeResponse {
  prefix: string;
  entries: RangeEntry[];
}

export function splitHash(hash: string): { prefix: string; suffix: string } {
  const clean = hash.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(clean)) throw new Error('Expected a SHA-256 hex digest');
  return { prefix: clean.slice(0, PREFIX_LENGTH), suffix: clean.slice(PREFIX_LENGTH) };
}

export function rangeUrl(apiUrl: string, prefix: string): string {
  if (!/^[0-9a-f]{5}$/.test(prefix)) throw new Error('Bad prefix');
  return `${apiUrl.replace(/\/+$/, '')}/api/v1/range/${prefix}`;
}

/** Validates an untrusted server response. Anything malformed becomes "no entries". */
export function parseRange(raw: unknown, prefix: string): RangeEntry[] {
  if (!raw || typeof raw !== 'object') return [];
  const body = raw as Partial<RangeResponse>;
  if (body.prefix !== undefined && String(body.prefix).toLowerCase() !== prefix) return [];
  if (!Array.isArray(body.entries)) return [];
  const out: RangeEntry[] = [];
  for (const item of body.entries.slice(0, 5000)) {
    if (!item || typeof item !== 'object') continue;
    const entry = item as Partial<RangeEntry>;
    if (typeof entry.suffix !== 'string' || !/^[0-9a-f]+$/i.test(entry.suffix)) continue;
    const reports = Number(entry.reports);
    if (!Number.isFinite(reports) || reports < 0) continue;
    out.push({
      suffix: entry.suffix.toLowerCase(),
      reports: Math.floor(reports),
      categories: Array.isArray(entry.categories) ? entry.categories.filter((c): c is string => typeof c === 'string').slice(0, 10) : [],
      lastReportedAt: typeof entry.lastReportedAt === 'string' ? entry.lastReportedAt : undefined,
    });
  }
  return out;
}

export function findReports(entries: RangeEntry[], suffix: string): RangeEntry | null {
  return entries.find((entry) => entry.suffix === suffix) ?? null;
}

/** SPEC: show "reported by N people" only when N >= 3, always as unverified. */
export function isShowable(reports: number): boolean {
  return reports >= COMMUNITY_MIN_REPORTS;
}

export async function fetchRange(
  apiUrl: string,
  prefix: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 4000,
): Promise<RangeEntry[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(rangeUrl(apiUrl, prefix), {
      method: 'GET',
      credentials: 'omit',
      cache: 'default',
      referrerPolicy: 'no-referrer',
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return [];
    return parseRange(await response.json(), prefix);
  } finally {
    clearTimeout(timer);
  }
}
