import { useEffect, useState } from 'react';
import type { Entities } from '@ruko/engine';
import { communityKey, communityLookupsEnabled, lookupIdentifier, reportablesFrom, type CommunityHit } from '@/lib/community';

/**
 * Private community lookups for every identifier in a verdict. Runs only when
 * the API is configured and the user has not switched lookups off. Debounced so
 * typing does not fire a request per keystroke.
 */
export function useCommunity(entities: Entities | null): Map<string, CommunityHit> {
  const [hits, setHits] = useState<Map<string, CommunityHit>>(() => new Map());

  useEffect(() => {
    if (!entities || !communityLookupsEnabled()) {
      setHits(new Map());
      return;
    }
    const items = reportablesFrom(entities).slice(0, 8);
    if (items.length === 0) {
      setHits(new Map());
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const results = await Promise.allSettled(items.map((item) => lookupIdentifier(item.kind, item.value, controller.signal)));
      if (controller.signal.aborted) return;
      const next = new Map<string, CommunityHit>();
      results.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value) next.set(communityKey(items[i]!.kind, items[i]!.value), result.value);
      });
      setHits(next);
    }, 700);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [entities]);

  return hits;
}
