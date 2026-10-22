import type { UrlFinding } from '@ruko/engine';
import { describe, expect, it } from 'vitest';
import { decidePage, tooltipTone } from '../../src/shared/lookalike';
import type { LinkVerdict } from '../../src/shared/messages';
import { displayUrl, hostOf, isGmailHost, isHttpUrl, isUpiHref, isWhatsAppHost, siteKey, unwrapRedirect } from '../../src/shared/url';

const finding = (over: Partial<UrlFinding>): UrlFinding => ({
  url: 'http://sbi-kyc-update.top/login',
  host: 'sbi-kyc-update.top',
  registrableDomain: 'sbi-kyc-update.top',
  tld: 'top',
  risk: 0,
  reasons: [],
  ...over,
});

describe('url helpers', () => {
  it('unwraps Gmail, Facebook and Outlook redirect shims', () => {
    expect(unwrapRedirect('https://www.google.com/url?q=http://sbi-kyc-update.top/login&sa=D&source=gmail')).toBe('http://sbi-kyc-update.top/login');
    expect(unwrapRedirect('https://l.facebook.com/l.php?u=https%3A%2F%2Fbit.ly%2Fabc&h=AT0')).toBe('https://bit.ly/abc');
    expect(unwrapRedirect('https://eur01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fhdfc-reward.in%2F&data=x')).toBe('https://hdfc-reward.in/');
    expect(unwrapRedirect('https://www.google.com/search?q=sbi')).toBe('https://www.google.com/search?q=sbi');
    expect(unwrapRedirect('https://www.google.com/url?q=javascript:alert(1)')).toBe('https://www.google.com/url?q=javascript:alert(1)');
  });

  it('recognises hosts and schemes', () => {
    expect(siteKey('WWW.Example.COM.')).toBe('example.com');
    expect(hostOf('https://Web.WhatsApp.com/')).toBe('web.whatsapp.com');
    expect(hostOf('nonsense')).toBe('');
    expect(isWhatsAppHost('web.whatsapp.com')).toBe(true);
    expect(isGmailHost('mail.google.com')).toBe(true);
    expect(isGmailHost('google.com')).toBe(false);
    expect(isUpiHref(' UPI://pay?pa=a@ybl')).toBe(true);
    expect(isUpiHref('https://upi.example')).toBe(false);
    expect(isHttpUrl('https://x.in')).toBe(true);
    expect(isHttpUrl('ftp://x.in')).toBe(false);
  });

  it('shortens long URLs without hiding the host', () => {
    const shown = displayUrl(`https://sbi-kyc-update.top/${'a'.repeat(200)}`, 40);
    expect(shown.startsWith('sbi-kyc-update.top/')).toBe(true);
    expect(shown.length).toBe(40);
  });
});

describe('decidePage (lookalike interstitial)', () => {
  it('warns when the engine names an imitated brand on a risky, unofficial host', () => {
    const check = decidePage(finding({ impersonates: 'SBI', risk: 85, reasons: ['Looks like sbi.co.in'] }), 'critical', 'medium');
    expect(check).toMatchObject({ warn: true, brand: 'SBI', host: 'sbi-kyc-update.top', severity: 'critical' });
    expect(check.reasons).toEqual(['Looks like sbi.co.in']);
  });

  it('never warns on official domains or when no brand is imitated', () => {
    expect(decidePage(finding({ impersonates: 'SBI', risk: 90, official: true }), 'critical', 'low').warn).toBe(false);
    expect(decidePage(finding({ risk: 95 }), 'critical', 'low').warn).toBe(false);
    expect(decidePage(finding({ impersonates: '  ', risk: 95 }), 'critical', 'low').warn).toBe(false);
  });

  it('only blocks when the domain itself is the fake, not a brand word in a path', () => {
    const pathOnly = finding({ impersonates: 'SBI', risk: 75, impersonationKind: 'path' });
    expect(decidePage(pathOnly, 'high', 'low').warn).toBe(false);
    for (const kind of ['homoglyph', 'typo', 'tld_swap', 'brand_in_domain', 'subdomain', 'free_hosting', 'userinfo'] as const) {
      expect(decidePage(finding({ impersonates: 'SBI', risk: 80, impersonationKind: kind }), 'critical', 'medium').warn, kind).toBe(true);
    }
  });

  it('offers the real site only when it is a plain domain', () => {
    const real = decidePage(finding({ impersonates: 'SBI', risk: 85, officialDomain: 'OnlineSBI.sbi' }), 'critical', 'medium');
    expect(real.officialDomain).toBe('onlinesbi.sbi');
    const bogus = decidePage(finding({ impersonates: 'SBI', risk: 85, officialDomain: 'javascript:alert(1)' }), 'critical', 'medium');
    expect(bogus.officialDomain).toBeUndefined();
    const quiet = decidePage(finding({ impersonates: 'SBI', risk: 20, officialDomain: 'onlinesbi.sbi' }), 'low', 'medium');
    expect(quiet.officialDomain).toBeUndefined();
  });

  it('follows the sensitivity setting', () => {
    const f = finding({ impersonates: 'HDFC Bank', risk: 55 });
    expect(decidePage(f, 'medium', 'low').warn).toBe(true);
    expect(decidePage(f, 'medium', 'medium').warn).toBe(true);
    expect(decidePage(f, 'medium', 'high').warn).toBe(false);
  });
});

describe('tooltipTone', () => {
  const link = (over: Partial<LinkVerdict>): LinkVerdict => ({
    url: 'https://x.in',
    host: 'x.in',
    kind: 'web',
    risk: 0,
    severity: 'safe',
    official: false,
    shortener: false,
    reasons: [],
    ...over,
  });
  it('maps link verdicts to tones', () => {
    expect(tooltipTone(link({ kind: 'upi' }))).toBe('upi');
    expect(tooltipTone(link({ official: true, brand: 'SBI' }))).toBe('official');
    expect(tooltipTone(link({ severity: 'critical', risk: 90 }))).toBe('danger');
    expect(tooltipTone(link({ brand: 'SBI', risk: 40, severity: 'medium' }))).toBe('danger');
    expect(tooltipTone(link({ shortener: true, risk: 20, severity: 'low' }))).toBe('caution');
    expect(tooltipTone(link({}))).toBe('safe');
    expect(tooltipTone(link({ knownGood: true, risk: 0 }))).toBe('safe');
    expect(tooltipTone(link({ download: true, risk: 40, severity: 'medium', official: true }))).toBe('danger');
  });
});
