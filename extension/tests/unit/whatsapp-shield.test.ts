import type { Locale, Verdict } from '@ruko/engine';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WhatsAppShield, type WhatsAppDeps } from '../../src/content/whatsapp/shield';
import type { AnalyzeItem } from '../../src/shared/messages';
import { DEFAULT_SETTINGS, type Settings } from '../../src/shared/settings';
import { bubble, fakeVerdict, MEDIUM_VERDICT, SCAM_VERDICT } from './helpers';

function setup(settings: Partial<Settings> = {}, verdictFor?: (text: string) => Verdict) {
  const main = document.createElement('div');
  main.id = 'main';
  document.body.append(main);
  const analyze = vi.fn(async (items: AnalyzeItem[], _locale: Locale) => {
    const out: Record<string, Verdict> = {};
    for (const item of items) {
      out[item.key] = verdictFor
        ? verdictFor(item.text)
        : /kyc/i.test(item.text)
          ? SCAM_VERDICT
          : /task/i.test(item.text)
            ? MEDIUM_VERDICT
            : fakeVerdict();
    }
    return out;
  });
  const deps: WhatsAppDeps & { [K in keyof WhatsAppDeps]: WhatsAppDeps[K] } = {
    analyze,
    record: vi.fn(),
    reportCount: vi.fn(),
    openPanel: vi.fn(),
    community: vi.fn(async () => []),
    dismiss: vi.fn(),
    isDismissed: vi.fn(() => false),
    schedule: (fn) => {
      fn();
      return 0;
    },
  };
  const shield = new WhatsAppShield({ ...DEFAULT_SETTINGS, ...settings }, deps);
  return { main, shield, deps, analyze };
}

const badges = () => [...document.querySelectorAll('ruko-badge')];
const badgeText = (host: Element) => host.shadowRoot?.textContent ?? '';

describe('WhatsAppShield', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('badges incoming scam messages only, after the message, without editing the text', async () => {
    const { main, shield, deps } = setup();
    const scam = bubble(document, { text: 'Dear customer your KYC is expired, update now at http://sbi-kyc.top', sender: '+91 90000 11111' });
    const safe = bubble(document, { text: 'See you at 7 for dinner?', sender: 'Asha' });
    const ownScam = bubble(document, { text: 'Forwarding: your KYC is expired', out: true });
    main.append(scam, safe, ownScam);
    const before = scam.innerHTML.length;

    shield.start();
    await vi.waitFor(() => expect(badges()).toHaveLength(1));

    const host = badges()[0]!;
    expect(host.previousElementSibling?.getAttribute('data-pre-plain-text')).toContain('+91 90000 11111');
    expect(badgeText(host)).toContain('Likely KYC scam');
    expect(badgeText(host)).toContain('Why?');
    // The message text itself is untouched: the badge is a sibling, not inside the text.
    const copyable = scam.querySelector('[data-pre-plain-text]')!;
    expect(copyable.textContent).toBe('Dear customer your KYC is expired, update now at http://sbi-kyc.top');
    expect(scam.innerHTML.length).toBeGreaterThan(before);
    // Outgoing messages are never analysed.
    const analysed = (deps.analyze as ReturnType<typeof vi.fn>).mock.calls.flatMap((c) => c[0] as AnalyzeItem[]);
    expect(analysed.map((i) => i.text)).not.toContain('Forwarding: your KYC is expired');
    expect(analysed.find((i) => i.text.includes('KYC'))?.sender).toBe('+91 90000 11111');
    expect(deps.reportCount).toHaveBeenLastCalledWith(1);
    expect(deps.record).toHaveBeenCalledTimes(1);
    shield.stop();
  });

  it('respects the sensitivity setting', async () => {
    const strict = setup({ warnAt: 'high' });
    strict.main.append(bubble(document, { text: 'Earn 5000 a day with simple task work' }), bubble(document, { text: 'KYC expired, update' }));
    strict.shield.start();
    await vi.waitFor(() => expect(badges()).toHaveLength(1));
    expect(badgeText(badges()[0]!)).toContain('KYC');
    strict.shield.stop();
    document.body.innerHTML = '';

    const relaxed = setup({ warnAt: 'medium' });
    relaxed.main.append(bubble(document, { text: 'Earn 5000 a day with simple task work' }));
    relaxed.shield.start();
    await vi.waitFor(() => expect(badges()).toHaveLength(1));
    expect(badgeText(badges()[0]!)).toContain('Possible task job scam');
    relaxed.shield.stop();
  });

  it('analyses each text once, even when WhatsApp re-renders the bubble', async () => {
    const { main, shield, analyze } = setup();
    main.append(bubble(document, { text: 'KYC pending, click link', sender: 'Bank' }));
    shield.start();
    await vi.waitFor(() => expect(badges()).toHaveLength(1));
    // Re-render: the same message appears as brand-new DOM.
    main.innerHTML = '';
    main.append(bubble(document, { text: 'KYC pending, click link', sender: 'Bank' }));
    shield.scan();
    await vi.waitFor(() => expect(badges()).toHaveLength(1));
    const texts = analyze.mock.calls.flatMap((c) => (c[0] as AnalyzeItem[]).map((i) => i.text));
    expect(texts.filter((t) => t === 'KYC pending, click link')).toHaveLength(1);
    shield.stop();
  });

  it('opens a verdict popover from the badge and closes it with Escape', async () => {
    const { main, shield } = setup();
    main.append(bubble(document, { text: 'Your KYC expired today' }));
    shield.start();
    await vi.waitFor(() => expect(badges()).toHaveLength(1));
    const button = badges()[0]!.shadowRoot!.querySelector('button')!;
    button.click();
    const pop = document.querySelector('ruko-popover');
    expect(pop).not.toBeNull();
    const dialog = pop!.shadowRoot!.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain('Very likely a KYC update scam');
    expect(dialog.textContent).toContain('Asks you to update KYC through a link');
    expect(dialog.querySelector('a[href="tel:1930"]')).not.toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('ruko-popover')).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    shield.stop();
  });

  it('hides a badge for good when the user says it is not a scam', async () => {
    const { main, shield, deps } = setup();
    main.append(bubble(document, { text: 'KYC update required' }));
    shield.start();
    await vi.waitFor(() => expect(badges()).toHaveLength(1));
    badges()[0]!.shadowRoot!.querySelector('button')!.click();
    const hide = [...document.querySelector('ruko-popover')!.shadowRoot!.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Not a scam'),
    )!;
    hide.click();
    expect(badges()).toHaveLength(0);
    expect(deps.dismiss).toHaveBeenCalledTimes(1);
    expect(deps.reportCount).toHaveBeenLastCalledWith(0);
    shield.stop();
  });

  it('removes every badge when stopped', async () => {
    const { main, shield } = setup();
    main.append(bubble(document, { text: 'KYC expired' }), bubble(document, { text: 'KYC blocked today' }));
    shield.start();
    await vi.waitFor(() => expect(badges()).toHaveLength(2));
    shield.stop();
    expect(badges()).toHaveLength(0);
  });

  it('re-renders badges in Hindi when the language changes', async () => {
    const { main, shield } = setup({}, () => ({ ...SCAM_VERDICT }));
    main.append(bubble(document, { text: 'KYC expired' }));
    shield.start();
    await vi.waitFor(() => expect(badges()).toHaveLength(1));
    shield.updateSettings({ ...DEFAULT_SETTINGS, locale: 'hi' });
    await vi.waitFor(() => expect(badgeText(badges()[0]!)).toContain('KYC धोखा लगता है'));
    expect(badges()[0]!.getAttribute('lang')).toBe('hi');
    shield.stop();
  });
});
