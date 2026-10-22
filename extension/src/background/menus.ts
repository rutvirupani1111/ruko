/** "Check with Ruko" in the right-click menu, for selected text and links. */
import { browser } from 'wxt/browser';
import type { Locale } from '@ruko/engine';
import { ta } from '../shared/i18n/app';
import { openPanel, setPendingCheck } from '../shared/panel';

export const MENU_ID = 'ruko-check';

export async function createMenus(locale: Locale): Promise<void> {
  try {
    await browser.contextMenus.removeAll();
    browser.contextMenus.create({
      id: MENU_ID,
      title: ta(locale, 'contextMenuCheck'),
      contexts: ['selection', 'link'],
    });
  } catch {
    // Menus are a convenience; never let them break the background.
  }
}

export async function relabelMenus(locale: Locale): Promise<void> {
  try {
    await browser.contextMenus.update(MENU_ID, { title: ta(locale, 'contextMenuCheck') });
  } catch {
    await createMenus(locale);
  }
}

export function listenForMenuClicks(): void {
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== MENU_ID) return;
    const selection = info.selectionText?.trim();
    const link = info.linkUrl?.trim();
    const text = selection || link;
    if (!text) return;
    // Open first: the browser only allows it while the click's user gesture is active.
    void openPanel({ tabId: tab?.id, windowId: tab?.windowId });
    void setPendingCheck({
      text,
      source: 'context',
      kind: selection ? 'auto' : 'url',
      pageUrl: tab?.url,
    });
  });
}
