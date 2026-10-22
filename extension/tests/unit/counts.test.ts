import { beforeEach, describe, expect, it, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { forgetTab, getTotal, resetTab, setCount, totalOf } from '../../src/background/counts';

describe('toolbar badge counts', () => {
  beforeEach(() => fakeBrowser.reset());

  it('sums the sources of one tab and paints the badge', async () => {
    const setText = vi.spyOn(browser.action, 'setBadgeText');
    expect(await setCount(7, 'whatsapp', 3)).toBe(3);
    expect(await setCount(7, 'page', 1)).toBe(4);
    expect(await setCount(9, 'gmail', 2)).toBe(2);
    expect(await getTotal(7)).toBe(4);
    expect(setText).toHaveBeenLastCalledWith({ tabId: 9, text: '2' });
    expect(await setCount(7, 'whatsapp', 0)).toBe(1);
  });

  it('clears the badge when a tab loads a new page and forgets closed tabs', async () => {
    const setText = vi.spyOn(browser.action, 'setBadgeText');
    await setCount(3, 'gmail', 5);
    await resetTab(3);
    expect(await getTotal(3)).toBe(0);
    expect(setText).toHaveBeenLastCalledWith({ tabId: 3, text: '' });
    await setCount(4, 'page', 1);
    await forgetTab(4);
    expect(await getTotal(4)).toBe(0);
  });

  it('ignores junk counts', () => {
    expect(totalOf({ whatsapp: -2, gmail: Number.NaN, page: 2 })).toBe(2);
    expect(totalOf(undefined)).toBe(0);
  });
});
