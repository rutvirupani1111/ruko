/** Background side of the optional k-anonymity community lookups. */
import { identifierHash } from '@ruko/engine';
import { fetchRange, findReports, splitHash, type RangeEntry } from '../shared/community';
import type { CommunityQuery, CommunityResult } from '../shared/messages';
import type { Settings } from '../shared/settings';

const TTL_MS = 30 * 60 * 1000;
const rangeCache = new Map<string, { at: number; entries: Promise<RangeEntry[]> }>();

function cachedRange(apiUrl: string, prefix: string, fetchImpl: typeof fetch): Promise<RangeEntry[]> {
  const key = `${apiUrl}|${prefix}`;
  const hit = rangeCache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.entries;
  const entries = fetchRange(apiUrl, prefix, fetchImpl).catch(() => {
    rangeCache.delete(key);
    return [] as RangeEntry[];
  });
  rangeCache.set(key, { at: Date.now(), entries });
  if (rangeCache.size > 500) rangeCache.delete(rangeCache.keys().next().value as string);
  return entries;
}

/**
 * Returns reports for each query. Only a 5-hex-character prefix of each SHA-256
 * hash leaves the device; nothing is sent when lookups are off.
 */
export async function lookupCommunity(
  queries: CommunityQuery[],
  settings: Settings,
  fetchImpl: typeof fetch = fetch,
): Promise<CommunityResult[]> {
  if (!settings.community || !settings.communityApiUrl) return [];
  const results: CommunityResult[] = [];
  for (const query of queries.slice(0, 10)) {
    if (!query || typeof query.value !== 'string' || !query.value.trim()) continue;
    try {
      const hash = await identifierHash(query.kind, query.value);
      const { prefix, suffix } = splitHash(hash);
      const entry = findReports(await cachedRange(settings.communityApiUrl, prefix, fetchImpl), suffix);
      if (entry) {
        results.push({
          kind: query.kind,
          value: query.value,
          reports: entry.reports,
          categories: entry.categories,
          lastReportedAt: entry.lastReportedAt,
        });
      }
    } catch {
      // A bad identifier or network error never breaks the warning itself.
    }
  }
  return results;
}

export function clearCommunityCache(): void {
  rangeCache.clear();
}
