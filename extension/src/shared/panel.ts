/**
 * Opening the side panel (Chrome/Edge `sidePanel`, Firefox `sidebarAction`) and
 * handing it the text to analyse. Browsers only allow opening the panel during a
 * user gesture, so callers must invoke `openPanel` before awaiting anything.
 */
import { browser } from 'wxt/browser';
import type { PendingCheck } from './messages';

export const PENDING_KEY = 'pendingCheck';

interface SidePanelApi {
  open(options: { tabId?: number; windowId?: number }): Promise<void>;
}
interface SidebarActionApi {
  open(): Promise<void>;
}

function sidePanelApi(): SidePanelApi | undefined {
  return (browser as unknown as { sidePanel?: SidePanelApi }).sidePanel;
}

function sidebarApi(): SidebarActionApi | undefined {
  return (browser as unknown as { sidebarAction?: SidebarActionApi }).sidebarAction;
}

export function panelUrl(): string {
  return browser.runtime.getURL('/sidepanel.html');
}

/**
 * Starts opening the panel synchronously (keeps the user gesture) and resolves with
 * how it was shown. Falls back to a normal tab when the browser refuses.
 */
export function openPanel(target: { tabId?: number; windowId?: number }): Promise<'panel' | 'tab'> {
  let attempt: Promise<void> | undefined;
  try {
    const sidePanel = sidePanelApi();
    const sidebar = sidebarApi();
    if (sidePanel?.open && (target.tabId !== undefined || target.windowId !== undefined)) {
      attempt = sidePanel.open(target.tabId !== undefined ? { tabId: target.tabId } : { windowId: target.windowId });
    } else if (sidebar?.open) {
      attempt = sidebar.open();
    }
  } catch {
    attempt = undefined;
  }
  const fallback = async (): Promise<'tab'> => {
    await browser.tabs.create({ url: panelUrl(), active: true });
    return 'tab';
  };
  if (!attempt) return fallback();
  return attempt.then(
    () => 'panel' as const,
    () => fallback(),
  );
}

export async function setPendingCheck(check: Omit<PendingCheck, 'at'>): Promise<void> {
  const value: PendingCheck = { ...check, text: check.text.slice(0, 6000), at: Date.now() };
  try {
    await browser.storage.session.set({ [PENDING_KEY]: value });
  } catch {
    await browser.storage.local.set({ [PENDING_KEY]: value });
  }
}
