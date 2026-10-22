import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeVerdict, SCAM_VERDICT } from './helpers';

// The background's own logic (caching, unwrapping, decisions) is tested against a
// controlled engine, so these tests do not depend on rule tuning in ../engine.
vi.mock('@ruko/engine', () => ({
  analyze: vi.fn((text: string) => (/kyc/i.test(text) ? SCAM_VERDICT : fakeVerdict())),
  analyzeUrl: vi.fn((url: string) => {
    const host = new URL(url).hostname;
    return host === 'sbi-kyc-update.top'
      ? { url, host, registrableDomain: host, tld: 'top', risk: 88, reasons: ['Imitates SBI'], impersonates: 'SBI' }
      : host === 'onlinesbi.sbi'
        ? { url, host, registrableDomain: host, tld: 'sbi', risk: 0, reasons: [], official: true }
        : { url, host, registrableDomain: host, tld: 'in', risk: 5, reasons: [] };
  }),
  parseUpiUri: vi.fn((uri: string) =>
    uri.includes('pa=') ? { payee: 'refund.help@ybl', amount: 4999, note: 'refund', risk: 95, reasons: ['Refund via UPI link'] } : null,
  ),
  severityFor: (score: number) => (score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 35 ? 'medium' : score >= 15 ? 'low' : 'safe'),
  identifierHash: vi.fn(async () => '0'.repeat(64)),
}));

const engine = await import('@ruko/engine');
const { analyzeItems, checkLink, checkPage, checkUpi, clearAnalysisCaches } = await import('../../src/background/analysis');

describe('background analysis service', () => {
  beforeEach(() => {
    clearAnalysisCaches();
    vi.mocked(engine.analyze).mockClear();
  });

  it('analyses a batch and returns verdicts by the caller key', () => {
    const results = analyzeItems(
      [
        { key: 'a', text: 'Your KYC expired', source: 'whatsapp', sender: '+91 90000 00000' },
        { key: 'b', text: 'See you at 7', source: 'whatsapp' },
      ],
      'en',
    );
    expect(results.a?.severity).toBe('critical');
    expect(results.b?.severity).toBe('safe');
    expect(engine.analyze).toHaveBeenCalledWith('Your KYC expired', expect.objectContaining({ locale: 'en', source: 'whatsapp', sender: '+91 90000 00000' }));
  });

  it('caches by text so repeated messages are analysed once', () => {
    const item = { key: 'k', text: 'KYC pending', source: 'whatsapp' as const };
    analyzeItems([item], 'en');
    analyzeItems([{ ...item, key: 'other-key' }], 'en');
    expect(engine.analyze).toHaveBeenCalledTimes(1);
    analyzeItems([item], 'hi');
    expect(engine.analyze).toHaveBeenCalledTimes(2);
  });

  it('caps batch size and ignores malformed items', () => {
    const items = Array.from({ length: 80 }, (_, i) => ({ key: String(i), text: `hello ${i}`, source: 'web' as const }));
    const results = analyzeItems([...items, { key: 5 } as never], 'en');
    expect(Object.keys(results)).toHaveLength(50);
  });

  it('decides the interstitial from the page URL', () => {
    expect(checkPage('http://sbi-kyc-update.top/login#x', 'en', 'medium')).toMatchObject({ warn: true, brand: 'SBI', host: 'sbi-kyc-update.top' });
    expect(checkPage('https://onlinesbi.sbi/', 'en', 'low').warn).toBe(false);
    expect(checkPage('chrome://settings', 'en', 'low').warn).toBe(false);
  });

  it('unwraps redirect shims before checking a link', () => {
    const link = checkLink('https://www.google.com/url?q=http://sbi-kyc-update.top/login&source=gmail', 'en');
    expect(link).toMatchObject({ kind: 'web', host: 'sbi-kyc-update.top', brand: 'SBI', severity: 'critical', official: false });
    expect(checkLink('https://onlinesbi.sbi/', 'en')).toMatchObject({ official: true, severity: 'safe' });
    expect(checkLink('mailto:a@b.in', 'en').kind).toBe('other');
  });

  it('parses upi:// links and treats unreadable ones as risky', () => {
    expect(checkLink('upi://pay?pa=refund.help@ybl&am=4999', 'en')).toMatchObject({ kind: 'upi', severity: 'critical' });
    expect(checkUpi('upi://pay?pa=refund.help@ybl', 'en').request?.amount).toBe(4999);
    expect(checkUpi('upi://garbage', 'en')).toEqual({ request: null, severity: 'medium' });
  });
});
