import { browser } from 'wxt/browser';
import type { InputKind, ScamCategory, Severity, Source } from '@ruko/engine';
import { HISTORY_LIMIT } from '../config';

export type HistorySource = Source | 'context';

/** One check or warning, stored only in this browser (storage.local). */
export interface HistoryEntry {
  /** Stable key: hash of source + sender + text. Re-seeing the same message updates the entry. */
  id: string;
  /** Last time it was seen or checked (ms since epoch). */
  at: number;
  source: HistorySource;
  /** Site where it was seen, e.g. "web.whatsapp.com". */
  host?: string;
  sender?: string;
  kind?: InputKind;
  /** The analysed text, trimmed to TEXT_LIMIT characters. Re-analysed when opened. */
  text: string;
  score: number;
  severity: Severity;
  category: ScamCategory | null;
  /** Localized headline at the time it was recorded (for the list view). */
  headline: string;
  /** True when Ruko showed a warning (badge, banner, interstitial), false for plain checks. */
  warned: boolean;
}

export const HISTORY_KEY = 'history';
export const TEXT_LIMIT = 4000;

const SEVERITIES: readonly Severity[] = ['safe', 'low', 'medium', 'high', 'critical'];

function isEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<HistoryEntry>;
  return (
    typeof v.id === 'string' &&
    typeof v.at === 'number' &&
    typeof v.text === 'string' &&
    typeof v.score === 'number' &&
    typeof v.severity === 'string' &&
    SEVERITIES.includes(v.severity) &&
    typeof v.headline === 'string'
  );
}

export function sanitizeHistory(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isEntry).slice(0, HISTORY_LIMIT);
}

/** Pure helper: puts `entry` first, removes an older copy with the same id, caps the list. */
export function mergeEntry(list: HistoryEntry[], entry: HistoryEntry, limit = HISTORY_LIMIT): HistoryEntry[] {
  const clipped: HistoryEntry = { ...entry, text: entry.text.slice(0, TEXT_LIMIT) };
  const previous = list.find((item) => item.id === entry.id);
  if (previous) clipped.warned = previous.warned || entry.warned;
  return [clipped, ...list.filter((item) => item.id !== entry.id)].slice(0, limit);
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const stored = await browser.storage.local.get(HISTORY_KEY);
  return sanitizeHistory(stored[HISTORY_KEY]);
}

let writeChain: Promise<unknown> = Promise.resolve();

/** Serialised read-modify-write so bursts of detections never lose entries. */
export function addHistory(entry: HistoryEntry): Promise<HistoryEntry[]> {
  const next = writeChain.then(async () => {
    const list = mergeEntry(await getHistory(), entry);
    await browser.storage.local.set({ [HISTORY_KEY]: list });
    return list;
  });
  writeChain = next.catch(() => undefined);
  return next;
}

export async function removeHistory(id: string): Promise<void> {
  const list = await getHistory();
  await browser.storage.local.set({ [HISTORY_KEY]: list.filter((item) => item.id !== id) });
}

export async function clearHistory(): Promise<void> {
  await browser.storage.local.set({ [HISTORY_KEY]: [] });
}

export function watchHistory(listener: (list: HistoryEntry[]) => void): () => void {
  const onChanged = (changes: Record<string, { newValue?: unknown }>, area: string) => {
    if (area !== 'local' || !(HISTORY_KEY in changes)) return;
    listener(sanitizeHistory(changes[HISTORY_KEY]?.newValue));
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}
