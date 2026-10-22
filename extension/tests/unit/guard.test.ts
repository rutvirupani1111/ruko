import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkableHref, LinkWatcher, linkFromEvent } from '../../src/content/guard/links';
import { UpiGuard, upiLinkFromEvent } from '../../src/content/guard/upi';
import { showInterstitial } from '../../src/content/ui/interstitial';
import type { LinkVerdict } from '../../src/shared/messages';

const verdict = (over: Partial<LinkVerdict> = {}): LinkVerdict => ({
  url: 'http://sbi-kyc-update.top/login',
  host: 'sbi-kyc-update.top',
  kind: 'web',
  risk: 88,
  severity: 'critical',
  brand: 'SBI',
  official: false,
  shortener: false,
  reasons: ['Looks like the SBI website but is a different address'],
  ...over,
});

afterEach(() => {
  document.body.innerHTML = '';
  for (const el of document.documentElement.querySelectorAll('[data-ruko]')) el.remove();
  vi.useRealTimers();
});

describe('link tooltips', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a id="fake" href="http://sbi-kyc-update.top/login">offer</a>
      <a id="same" href="/local">same site</a>
      <a id="hash" href="#top">top</a>
      <a id="upi" href="upi://pay?pa=a@ybl">pay</a>`;
  });

  it('only checks external web links and upi links', () => {
    expect(checkableHref(document.querySelector('#fake')!)).toBe('http://sbi-kyc-update.top/login');
    expect(checkableHref(document.querySelector('#same')!)).toBeNull();
    expect(checkableHref(document.querySelector('#hash')!)).toBeNull();
    expect(checkableHref(document.querySelector('#upi')!)).toBe('upi://pay?pa=a@ybl');
  });

  it('finds the link under the pointer', () => {
    const span = document.createElement('span');
    document.querySelector('#fake')!.appendChild(span);
    const event = new MouseEvent('mouseover', { bubbles: true, composed: true });
    let found: HTMLAnchorElement | null = null;
    document.addEventListener('mouseover', (e) => (found = linkFromEvent(e)), { once: true });
    span.dispatchEvent(event);
    expect(found).toBe(document.querySelector('#fake'));
  });

  it('shows the verdict after the hover delay, once per link, and hides on leave', async () => {
    const checkLink = vi.fn(async () => verdict());
    const watcher = new LinkWatcher('en', { checkLink, delayMs: 30 });
    watcher.start();
    const link = document.querySelector('#fake')!;
    link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
    expect(document.querySelector('ruko-tooltip')).toBeNull();
    await vi.waitFor(() => expect(document.querySelector('ruko-tooltip')?.shadowRoot?.textContent).toContain('pretends to be SBI'));
    const tip = document.querySelector('ruko-tooltip')!.shadowRoot!.querySelector('[role="tooltip"]')!;
    expect(tip.getAttribute('data-tone')).toBe('danger');
    expect(tip.textContent).toContain('sbi-kyc-update.top');
    link.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, composed: true }));
    expect(document.querySelector('ruko-tooltip')).toBeNull();
    link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
    await vi.waitFor(() => expect(document.querySelector('ruko-tooltip')).not.toBeNull());
    expect(checkLink).toHaveBeenCalledTimes(1);
    watcher.stop();
  });

  it('cancels when the pointer leaves before the delay', async () => {
    const checkLink = vi.fn(async () => verdict());
    const watcher = new LinkWatcher('en', { checkLink, delayMs: 40 });
    watcher.start();
    const link = document.querySelector('#fake')!;
    link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
    link.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, composed: true }));
    await new Promise((r) => setTimeout(r, 80));
    expect(checkLink).not.toHaveBeenCalled();
    watcher.stop();
  });
});

describe('UPI guard', () => {
  it('stops a upi:// click and explains that it is a payment', async () => {
    document.body.innerHTML = '<a id="pay" href="upi://pay?pa=refund.help@ybl&am=4999&tn=refund">Receive refund</a>';
    const proceed = vi.fn();
    const checkUpi = vi.fn(async () => ({
      request: { payee: 'refund.help@ybl', payeeName: 'Refund Desk', amount: 4999, note: 'refund', risk: 92, reasons: ['A UPI link can only take money from you'] },
      severity: 'critical' as const,
    }));
    const guard = new UpiGuard({ checkUpi, getLocale: () => 'en', proceed });
    guard.start();
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    document.querySelector('#pay')!.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(document.querySelector('ruko-upi-dialog')).not.toBeNull());
    const dialog = document.querySelector('ruko-upi-dialog')!.shadowRoot!.querySelector('[role="alertdialog"]')!;
    expect(dialog.textContent).toContain('This link will make a payment');
    expect(dialog.textContent).toContain('Refund Desk (refund.help@ybl)');
    expect(dialog.textContent).toContain('₹4,999');
    // Untrusted (scripted) clicks cannot approve the payment.
    dialog.querySelector<HTMLButtonElement>('[data-action="continue"]')!.click();
    expect(proceed).not.toHaveBeenCalled();
    dialog.querySelector<HTMLButtonElement>('[data-action="cancel"]')!.click();
    expect(document.querySelector('ruko-upi-dialog')).toBeNull();
    expect(proceed).not.toHaveBeenCalled();
    guard.stop();
  });

  it('ignores ordinary links', () => {
    document.body.innerHTML = '<a id="web" href="https://example.com">site</a>';
    const event = new MouseEvent('click', { bubbles: true, composed: true });
    let found: unknown = 'unset';
    document.addEventListener('click', (e) => (found = upiLinkFromEvent(e)), { once: true });
    document.querySelector('#web')!.dispatchEvent(event);
    expect(found).toBeNull();
  });
});

describe('lookalike interstitial', () => {
  it('names the imitated brand, locks the page and ignores scripted "Continue"', () => {
    document.body.innerHTML = '<form><input id="pass" type="password"></form>';
    const onContinue = vi.fn();
    const onLeave = vi.fn();
    const handle = showInterstitial({
      check: {
        warn: true,
        host: 'sbi-kyc-update.top',
        brand: 'SBI',
        officialDomain: 'onlinesbi.sbi',
        risk: 90,
        severity: 'critical',
        reasons: ['Uses the SBI name on an unrelated website'],
      },
      locale: 'en',
      theme: 'light',
      onLeave,
      onContinue,
    });
    const dialog = handle.shadow.root.querySelector('[role="alertdialog"]')!;
    expect(dialog.querySelector('h1')!.textContent).toBe('This is not the real SBI website');
    expect(dialog.textContent).toContain('sbi-kyc-update.top');
    expect(dialog.textContent).toContain('Uses the SBI name on an unrelated website');
    expect(dialog.textContent).toContain('The real SBI website is onlinesbi.sbi');
    expect(dialog.querySelector('a[data-action="real-site"]')!.getAttribute('href')).toBe('https://onlinesbi.sbi/');
    expect(document.body.inert).toBe(true);
    expect(document.documentElement.style.getPropertyValue('overflow')).toBe('hidden');

    dialog.querySelector<HTMLButtonElement>('[data-action="continue"]')!.click();
    expect(onContinue).not.toHaveBeenCalled();
    expect(handle.shadow.host.isConnected).toBe(true);

    handle.remove();
    expect(document.body.inert).toBe(false);
    expect(document.documentElement.style.getPropertyValue('overflow')).toBe('');
  });

  it('speaks Hindi when asked', () => {
    const handle = showInterstitial({
      check: { warn: true, host: 'hdfcbank-rewards.in', brand: 'HDFC Bank', risk: 80, severity: 'critical', reasons: [] },
      locale: 'hi',
      theme: 'dark',
      onLeave: () => undefined,
      onContinue: () => undefined,
    });
    expect(handle.shadow.root.querySelector('h1')!.textContent).toBe('यह HDFC Bank की असली वेबसाइट नहीं है');
    expect(handle.shadow.host.getAttribute('lang')).toBe('hi');
    expect(handle.shadow.host.getAttribute('data-theme')).toBe('dark');
    handle.remove();
  });
});
