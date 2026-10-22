import type { Verdict } from '@ruko/engine';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emailText, readEmail, senderLabel } from '../../src/content/gmail/parse';
import { GmailShield } from '../../src/content/gmail/shield';
import type { AnalyzeItem } from '../../src/shared/messages';
import { DEFAULT_SETTINGS } from '../../src/shared/settings';
import { fakeVerdict, SCAM_VERDICT } from './helpers';

function mountEmail(body: string, sender = 'alerts@hdfcbank-rewards.in', subject = 'Your account will be suspended') {
  document.body.innerHTML = `
    <h2 class="hP">${subject}</h2>
    <div class="adn" data-message-id="m1">
      <h3 class="iw"><span class="gD" email="${sender}" name="HDFC Alerts">HDFC Alerts</span></h3>
      <div class="a3s aiL">${body}</div>
    </div>`;
  return document.querySelector('.a3s')!;
}

describe('Gmail parsing', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('reads subject, sender and body text including hidden link targets', () => {
    const body = mountEmail('<p>Dear customer,</p><p>Update KYC: <a href="http://hdfcbank-rewards.in/kyc">click here</a></p><style>.x{}</style>');
    const email = readEmail(body);
    expect(email.subject).toBe('Your account will be suspended');
    expect(email.senderEmail).toBe('alerts@hdfcbank-rewards.in');
    expect(senderLabel(email)).toBe('HDFC Alerts <alerts@hdfcbank-rewards.in>');
    expect(email.text).toContain('Dear customer,');
    expect(email.text).toContain('(http://hdfcbank-rewards.in/kyc)');
    expect(email.text).not.toContain('.x{}');
  });

  it('caps very long bodies', () => {
    const body = mountEmail(`<p>${'word '.repeat(5000)}</p>`);
    expect(emailText(body, 500).length).toBeLessThanOrEqual(500);
  });
});

describe('GmailShield', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const deps = (verdict: Verdict) => ({
    analyze: vi.fn(async (items: AnalyzeItem[]) => Object.fromEntries(items.map((i) => [i.key, verdict]))),
    record: vi.fn(),
    reportCount: vi.fn(),
    openPanel: vi.fn(),
    community: vi.fn(async () => []),
    dismiss: vi.fn(),
    isDismissed: vi.fn(() => false),
    schedule: (fn: () => void) => fn(),
  });

  it('puts a banner above a suspicious email without touching the email', async () => {
    const body = mountEmail('<p>Your KYC is pending, update now.</p>');
    const before = body.innerHTML;
    const d = deps(SCAM_VERDICT);
    const shield = new GmailShield({ ...DEFAULT_SETTINGS }, d);
    shield.start();
    await vi.waitFor(() => expect(document.querySelector('ruko-banner')).not.toBeNull());
    const host = document.querySelector('ruko-banner')!;
    expect(host.nextElementSibling).toBe(body);
    expect(body.innerHTML).toBe(before);
    const region = host.shadowRoot!.querySelector('[role="region"]')!;
    expect(region.textContent).toContain('Very likely a KYC update scam');
    expect(region.textContent).toContain('HDFC Alerts <alerts@hdfcbank-rewards.in>');
    expect(d.analyze.mock.calls[0]![0][0]).toMatchObject({ source: 'email', sender: 'HDFC Alerts <alerts@hdfcbank-rewards.in>' });

    // "Why?" reveals the details.
    const why = region.querySelector<HTMLButtonElement>('button[aria-expanded]')!;
    expect(region.querySelector('.rk-banner__details')!.hasAttribute('hidden')).toBe(true);
    why.click();
    expect(why.getAttribute('aria-expanded')).toBe('true');
    expect(region.querySelector('.rk-banner__details')!.hasAttribute('hidden')).toBe(false);

    // Dismiss removes it and lowers the count.
    [...region.querySelectorAll('button')].find((b) => b.textContent?.includes('Dismiss'))!.click();
    expect(document.querySelector('ruko-banner')).toBeNull();
    expect(d.dismiss).toHaveBeenCalled();
    expect(d.reportCount).toHaveBeenLastCalledWith(0);
    shield.stop();
  });

  it('stays silent on genuine email', async () => {
    mountEmail('<p>Your order has shipped and will arrive on Friday.</p>', 'orders@amazon.in', 'Shipped');
    const d = deps(fakeVerdict());
    const shield = new GmailShield({ ...DEFAULT_SETTINGS }, d);
    shield.start();
    await vi.waitFor(() => expect(d.analyze).toHaveBeenCalled());
    await Promise.resolve();
    expect(document.querySelector('ruko-banner')).toBeNull();
    shield.stop();
  });
});
