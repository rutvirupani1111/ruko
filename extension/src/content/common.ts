/** Glue shared by Ruko's content scripts: background calls, counts, dismissals. */
import { browser } from 'wxt/browser';
import type { Locale, Verdict } from '@ruko/engine';
import type { HistoryEntry } from '../shared/history';
import { send, type AnalyzeItem, type CommunityResult, type CountSource, type PendingCheck } from '../shared/messages';
import { communityQueries, isShowable } from '../shared/community';

export async function analyzeInBackground(items: AnalyzeItem[], locale: Locale): Promise<Record<string, Verdict>> {
  const { results } = await send<'analyze'>({ type: 'analyze', items, locale });
  return results;
}

export function recordInBackground(entry: HistoryEntry): void {
  send<'record'>({ type: 'record', entry }).catch(() => undefined);
}

export function openPanelFromPage(check: Omit<PendingCheck, 'at'>): void {
  send<'open-panel'>({ type: 'open-panel', check }).catch(() => undefined);
}

/** Debounced reporter for the toolbar badge. Each content script owns one source. */
export function createCountReporter(source: CountSource, delayMs = 200): (count: number) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let latest = 0;
  let sent = -1;
  return (count: number) => {
    latest = count;
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      if (latest === sent) return;
      sent = latest;
      send<'set-count'>({ type: 'set-count', source, count: latest }).catch(() => undefined);
    }, delayMs);
  };
}

export async function communityForVerdict(verdict: Verdict): Promise<CommunityResult[]> {
  const queries = communityQueries(verdict);
  if (!queries.length) return [];
  const { results } = await send<'community'>({ type: 'community', queries });
  return results.filter((r) => isShowable(r.reports));
}

const DISMISSED_KEY = 'dismissed';
const DISMISSED_LIMIT = 1000;

/** "Not a scam? Hide" choices, remembered on this device. */
export async function loadDismissed(): Promise<{ has(id: string): boolean; add(id: string): void }> {
  let ids: string[] = [];
  try {
    const stored = await browser.storage.local.get(DISMISSED_KEY);
    const raw = stored[DISMISSED_KEY];
    if (Array.isArray(raw)) ids = raw.filter((v): v is string => typeof v === 'string');
  } catch {
    ids = [];
  }
  const set = new Set(ids);
  return {
    has: (id) => set.has(id),
    add: (id) => {
      if (set.has(id)) return;
      set.add(id);
      const list = [...set].slice(-DISMISSED_LIMIT);
      browser.storage.local.set({ [DISMISSED_KEY]: list }).catch(() => undefined);
    },
  };
}
