import { describe, expect, it } from 'vitest';
import { APP_STRINGS, ta } from '../../src/shared/i18n/app';
import { format, formatNumber, formatRupees, timeAgo } from '../../src/shared/i18n/format';
import { badgeLabel, CATEGORY_LABELS, INPAGE_STRINGS, SEVERITY_LABELS, ti } from '../../src/shared/i18n/inpage';

const ALL_CATEGORIES = [
  'digital_arrest',
  'kyc_update',
  'upi_collect',
  'qr_receive',
  'fake_refund',
  'job_task',
  'investment',
  'lottery_prize',
  'loan_app',
  'sextortion',
  'otp_theft',
  'fake_support',
  'courier_parcel',
  'utility_disconnect',
  'reward_points',
  'tax_refund',
  'govt_scheme',
  'malicious_app',
  'remote_access',
  'impersonation',
  'romance',
  'sim_swap',
  'phishing_link',
  'lookalike_domain',
  'other',
] as const;

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const DEVANAGARI = /[ऀ-ॿ]/;

describe.each([
  ['in-page strings', INPAGE_STRINGS],
  ['page strings', APP_STRINGS],
] as const)('%s', (_name, table) => {
  const en = table.en as Record<string, string>;
  const hi = table.hi as Record<string, string>;

  it('has the same keys in English and Hindi, none empty', () => {
    expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort());
    for (const [key, value] of Object.entries({ ...en, ...hi })) expect(value.trim(), key).not.toBe('');
  });

  it('uses the same {placeholders} in both languages', () => {
    for (const key of Object.keys(en)) expect(placeholders(hi[key]!), key).toEqual(placeholders(en[key]!));
  });

  it('never uses em dashes in UI copy (brand rule)', () => {
    for (const [key, value] of [...Object.entries(en), ...Object.entries(hi)]) {
      expect(value, key).not.toMatch(/—/);
    }
  });

  it('writes Hindi in Devanagari (only names may stay Latin)', () => {
    // Product and service names, which Hindi speakers also write in Latin script.
    const NAMES = new Set([
      'appName',
      'brandName',
      'sourceWhatsapp',
      'sourceEmail',
      'sourceSms',
      'supportUpi',
      'supportKofi',
      'supportBmc',
      'upiLabel',
      'toggleWhatsapp',
      'toggleGmail',
    ]);
    const latinOnly = Object.entries(hi).filter(([, v]) => !DEVANAGARI.test(v)).map(([k]) => k);
    expect(latinOnly.filter((key) => !NAMES.has(key))).toEqual([]);
  });
});

describe('labels', () => {
  it('covers every scam category and severity in both languages', () => {
    for (const locale of ['en', 'hi'] as const) {
      for (const category of ALL_CATEGORIES) expect(CATEGORY_LABELS[locale][category], `${locale}.${category}`).toBeTruthy();
      for (const severity of ['safe', 'low', 'medium', 'high', 'critical'] as const) expect(SEVERITY_LABELS[locale][severity]).toBeTruthy();
    }
  });

  it('builds badge labels like the spec example', () => {
    expect(badgeLabel('en', 'kyc_update', 'medium')).toBe('Possible KYC scam');
    expect(badgeLabel('en', 'digital_arrest', 'critical')).toBe('Likely digital arrest scam');
    expect(badgeLabel('en', null, 'high')).toBe('Likely scam');
    expect(badgeLabel('hi', 'kyc_update', 'medium')).toBe('KYC धोखा हो सकता है');
    expect(badgeLabel('hi', 'kyc_update', 'high')).toBe('KYC धोखा लगता है');
  });

  it('falls back to English for unknown keys and keeps unknown placeholders visible', () => {
    expect(ti('hi', 'badgeWhy')).toBe('क्यों?');
    expect(ta('en', 'popupWarningsMany', { count: 3 })).toBe('3 warnings on this tab');
    expect(format('Hello {name} {missing}', { name: 'Asha' })).toBe('Hello Asha {missing}');
  });
});

describe('formatting', () => {
  it('formats numbers and rupees the Indian way', () => {
    expect(formatNumber(500000, 'en')).toBe('5,00,000');
    expect(formatRupees(2500, 'en')).toBe('₹2,500');
  });

  it('formats relative time in both languages', () => {
    const now = Date.UTC(2026, 9, 23, 12, 0, 0);
    expect(timeAgo(now - 5 * 60_000, 'en', now)).toMatch(/5 min/);
    expect(timeAgo(now - 2 * 3_600_000, 'hi', now)).toMatch(/2/);
    expect(timeAgo(now - 40 * 86_400_000, 'en', now)).toMatch(/2026/);
  });
});
