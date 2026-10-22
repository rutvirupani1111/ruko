import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { analyzeItems, checkLink, checkPage, checkUpi } from '../background/analysis';
import { lookupCommunity } from '../background/community';
import { forgetTab, getTotal, resetTab, setCount } from '../background/counts';
import { createMenus, listenForMenuClicks, relabelMenus } from '../background/menus';
import { openPanel, setPendingCheck } from '../shared/panel';
import { addHistory } from '../shared/history';
import { isRukoRequest, type RukoRequest, type RukoResponseMap } from '../shared/messages';
import { getSettings, saveSettings, watchSettings, withSiteAllowed } from '../shared/settings';
import { siteKey } from '../shared/url';

type Sender = { tab?: { id?: number; windowId?: number; url?: string }; id?: string; url?: string };

async function handle(request: RukoRequest, sender: Sender): Promise<RukoResponseMap[RukoRequest['type']]> {
  switch (request.type) {
    case 'analyze':
      return { results: analyzeItems(request.items, request.locale) };
    case 'check-page':
      return checkPage(request.url, request.locale, request.warnAt);
    case 'check-link':
      return checkLink(request.url, request.locale);
    case 'check-upi':
      return checkUpi(request.uri, request.locale);
    case 'set-count': {
      const tabId = sender.tab?.id;
      if (tabId === undefined) return { total: 0 };
      return { total: await setCount(tabId, request.source, request.count) };
    }
    case 'tab-count':
      return { total: await getTotal(request.tabId) };
    case 'record': {
      const settings = await getSettings();
      if (!settings.keepHistory) return { ok: false };
      await addHistory(request.entry);
      return { ok: true };
    }
    case 'allow-site': {
      const settings = await getSettings();
      await saveSettings(withSiteAllowed(settings, request.host, true));
      return { ok: true };
    }
    case 'leave-site': {
      const tabId = sender.tab?.id;
      if (tabId === undefined) return { ok: false };
      const params = new URLSearchParams({ host: siteKey(request.host) });
      if (request.brand) params.set('brand', request.brand);
      await browser.tabs.update(tabId, { url: browser.runtime.getURL(`/safe.html?${params.toString()}`) });
      return { ok: true };
    }
    case 'open-panel':
      // Handled synchronously in the listener (user gesture); never reached.
      return { opened: 'none' };
    case 'community': {
      const settings = await getSettings();
      return { results: await lookupCommunity(request.queries, settings), enabled: settings.community };
    }
  }
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    let settings = await getSettings();
    if (reason === 'install') {
      const ui = browser.i18n.getUILanguage?.() ?? 'en';
      settings = await saveSettings({ ...settings, locale: ui.toLowerCase().startsWith('hi') ? 'hi' : 'en' });
    }
    await createMenus(settings.locale);
  });

  browser.runtime.onStartup?.addListener(async () => {
    await createMenus((await getSettings()).locale);
  });

  listenForMenuClicks();

  watchSettings((settings) => {
    void relabelMenus(settings.locale);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    // A new document is loading: warnings from the previous page no longer apply.
    if (changeInfo.status === 'loading') void resetTab(tabId);
  });
  browser.tabs.onRemoved.addListener((tabId) => void forgetTab(tabId));

  browser.runtime.onMessage.addListener((message: unknown, sender: Sender, sendResponse: (response: unknown) => void) => {
    if (!isRukoRequest(message)) return false;
    // Only accept messages from this extension's own scripts and pages.
    if (sender.id !== undefined && sender.id !== browser.runtime.id) return false;

    if (message.type === 'open-panel') {
      // Must run before any await to keep the click's user gesture.
      const opening = openPanel({ tabId: sender.tab?.id, windowId: sender.tab?.windowId });
      const storing = message.check ? setPendingCheck(message.check) : Promise.resolve();
      Promise.all([opening, storing]).then(
        ([opened]) => sendResponse({ opened }),
        (error: unknown) => sendResponse({ error: String(error) }),
      );
      return true;
    }

    handle(message, sender).then(sendResponse, (error: unknown) => {
      sendResponse({ error: error instanceof Error ? error.message : String(error) });
    });
    return true;
  });
});
