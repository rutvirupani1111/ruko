/** Page-side helpers to reach the side panel and the active tab. */
import { browser } from 'wxt/browser';
import type { PendingCheck } from '../shared/messages';
import { openPanel, setPendingCheck } from '../shared/panel';

export interface ActiveTab {
  id?: number;
  windowId?: number;
  url?: string;
}

/**
 * The tab the popup is about: the active tab of its window. `popup.html?tab=<id>` pins a
 * specific tab instead, which lets automated tests and the store screenshots open the
 * popup as a page while still describing a real website tab.
 */
export async function getActiveTab(): Promise<ActiveTab | null> {
  try {
    const pinned = Number(new URLSearchParams(location.search).get('tab'));
    if (Number.isInteger(pinned) && pinned > 0) {
      const tab = await browser.tabs.get(pinned);
      return { id: tab.id, windowId: tab.windowId, url: tab.url };
    }
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    return tab ? { id: tab.id, windowId: tab.windowId, url: tab.url } : null;
  } catch {
    return null;
  }
}

/**
 * Opens the side panel for `tab` and optionally hands it text to analyse. Call it
 * straight from a click handler: the panel must open while the click is "active".
 */
export function openSidePanelWith(tab: ActiveTab | null, check?: Omit<PendingCheck, 'at'>): Promise<'panel' | 'tab'> {
  const opening = openPanel({ tabId: tab?.id, windowId: tab?.windowId });
  if (check) void setPendingCheck(check);
  return opening;
}

export function openOptions(): void {
  void browser.runtime.openOptionsPage();
}
