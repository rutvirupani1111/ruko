import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { HISTORY_LIMIT } from '../../src/config';
import {
  addHistory,
  clearHistory,
  getHistory,
  mergeEntry,
  removeHistory,
  sanitizeHistory,
  TEXT_LIMIT,
  watchHistory,
  type HistoryEntry,
} from '../../src/shared/history';

const entry = (id: string, over: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id,
  at: 1_700_000_000_000,
  source: 'whatsapp',
  text: `message ${id}`,
  score: 70,
  severity: 'high',
  category: 'kyc_update',
  headline: 'Likely a KYC scam',
  warned: true,
  ...over,
});

describe('history', () => {
  beforeEach(() => fakeBrowser.reset());

  it('keeps the newest first and caps at the last 200', () => {
    let list: HistoryEntry[] = [];
    for (let i = 0; i < HISTORY_LIMIT + 25; i++) list = mergeEntry(list, entry(String(i)));
    expect(HISTORY_LIMIT).toBe(200);
    expect(list).toHaveLength(200);
    expect(list[0]!.id).toBe(String(HISTORY_LIMIT + 24));
    expect(list.at(-1)!.id).toBe('25');
  });

  it('moves a re-seen message to the top instead of duplicating it', () => {
    let list = [entry('a'), entry('b')];
    list = mergeEntry(list, entry('b', { at: 2, warned: false }));
    expect(list.map((e) => e.id)).toEqual(['b', 'a']);
    // Once warned, stays warned.
    expect(list[0]!.warned).toBe(true);
  });

  it('trims very long text', () => {
    const [first] = mergeEntry([], entry('long', { text: 'x'.repeat(TEXT_LIMIT + 500) }));
    expect(first!.text).toHaveLength(TEXT_LIMIT);
  });

  it('drops malformed stored entries', () => {
    expect(sanitizeHistory([entry('ok'), { id: 1 }, null, { ...entry('bad'), severity: 'extreme' }]).map((e) => e.id)).toEqual(['ok']);
    expect(sanitizeHistory('nope')).toEqual([]);
  });

  it('stores in storage.local, serialises bursts, removes and clears', async () => {
    const listener = vi.fn();
    const stop = watchHistory(listener);
    await Promise.all(Array.from({ length: 20 }, (_, i) => addHistory(entry(`burst-${i}`))));
    expect(await getHistory()).toHaveLength(20);
    await removeHistory('burst-3');
    expect((await getHistory()).some((e) => e.id === 'burst-3')).toBe(false);
    await clearHistory();
    expect(await getHistory()).toEqual([]);
    expect(listener).toHaveBeenCalled();
    stop();
  });
});
