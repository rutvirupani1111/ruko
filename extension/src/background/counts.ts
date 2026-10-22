/**
 * Toolbar badge: number of warnings Ruko is currently showing in a tab, summed over
 * the content scripts that report (WhatsApp badges, Gmail banners, page warning).
 * Kept in storage.session so it survives the MV3 service worker going to sleep.
 */
import { browser } from 'wxt/browser';
import type { CountSource } from '../shared/messages';

export type TabCounts = Partial<Record<CountSource, number>>;
export type AllCounts = Record<string, TabCounts>;

export const COUNTS_KEY = 'tabCounts';
const KEY = COUNTS_KEY;
let chain: Promise<unknown> = Promise.resolve();

async function read(): Promise<AllCounts> {
  try {
    const stored = await browser.storage.session.get(KEY);
    const value = stored[KEY];
    return value && typeof value === 'object' ? (value as AllCounts) : {};
  } catch {
    return {};
  }
}

async function write(all: AllCounts): Promise<void> {
  try {
    await browser.storage.session.set({ [KEY]: all });
  } catch {
    // storage.session unavailable: the badge still updates, it just won't survive a restart.
  }
}

export function totalOf(counts: TabCounts | undefined): number {
  if (!counts) return 0;
  return Object.values(counts).reduce<number>((sum, n) => sum + (typeof n === 'number' && n > 0 ? n : 0), 0);
}

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const next = chain.then(task);
  chain = next.catch(() => undefined);
  return next;
}

async function paint(tabId: number, total: number): Promise<void> {
  try {
    await browser.action.setBadgeText({ tabId, text: total > 0 ? (total > 99 ? '99+' : String(total)) : '' });
    if (total > 0) {
      await browser.action.setBadgeBackgroundColor({ tabId, color: '#E11D48' });
      await browser.action.setBadgeTextColor?.({ tabId, color: '#FFFFFF' });
    }
  } catch {
    // Tab closed in the meantime.
  }
}

export function setCount(tabId: number, source: CountSource, count: number): Promise<number> {
  return serialize(async () => {
    const all = await read();
    const tab = { ...(all[tabId] ?? {}) };
    tab[source] = Math.max(0, Math.min(9999, Math.floor(count) || 0));
    all[tabId] = tab;
    await write(all);
    const total = totalOf(tab);
    await paint(tabId, total);
    return total;
  });
}

export function getTotal(tabId: number): Promise<number> {
  return read().then((all) => totalOf(all[tabId]));
}

export function resetTab(tabId: number): Promise<void> {
  return serialize(async () => {
    const all = await read();
    if (!(tabId in all)) return;
    delete all[tabId];
    await write(all);
    await paint(tabId, 0);
  });
}

export function forgetTab(tabId: number): Promise<void> {
  return serialize(async () => {
    const all = await read();
    if (!(tabId in all)) return;
    delete all[tabId];
    await write(all);
  });
}
