import { identifierHash } from '@ruko/engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCommunityCache, lookupCommunity } from '../../src/background/community';
import { communityQueries, fetchRange, findReports, isShowable, parseRange, rangeUrl, splitHash } from '../../src/shared/community';
import { DEFAULT_SETTINGS } from '../../src/shared/settings';
import { fakeVerdict } from './helpers';

const HASH = 'abcde' + 'f'.repeat(59);

describe('k-anonymity helpers', () => {
  it('splits a SHA-256 hex digest into a 5-character prefix and the rest', () => {
    expect(splitHash(HASH)).toEqual({ prefix: 'abcde', suffix: 'f'.repeat(59) });
    expect(() => splitHash('abc')).toThrow();
  });

  it('builds the range URL from the prefix only', () => {
    expect(rangeUrl('https://ruko.example.app/', 'abcde')).toBe('https://ruko.example.app/api/v1/range/abcde');
    expect(() => rangeUrl('https://x', 'ABCDEFG')).toThrow();
  });

  it('validates untrusted responses', () => {
    const entries = parseRange(
      {
        prefix: 'abcde',
        entries: [
          { suffix: 'F'.repeat(59), reports: 4, categories: ['kyc_update', 7], lastReportedAt: '2026-10-01' },
          { suffix: 'zz', reports: 3 },
          { suffix: 'aa', reports: -1 },
          null,
        ],
      },
      'abcde',
    );
    expect(entries).toEqual([{ suffix: 'f'.repeat(59), reports: 4, categories: ['kyc_update'], lastReportedAt: '2026-10-01' }]);
    expect(parseRange({ prefix: 'zzzzz', entries: [] }, 'abcde')).toEqual([]);
    expect(parseRange('garbage', 'abcde')).toEqual([]);
    expect(findReports(entries, 'f'.repeat(59))?.reports).toBe(4);
  });

  it('only shows counts of 3 or more', () => {
    expect(isShowable(2)).toBe(false);
    expect(isShowable(3)).toBe(true);
  });

  it('collects identifiers but never official domains', () => {
    const verdict = fakeVerdict({
      entities: {
        urls: [
          { url: 'https://onlinesbi.sbi', host: 'onlinesbi.sbi', registrableDomain: 'onlinesbi.sbi', tld: 'sbi', risk: 0, reasons: [], official: true },
          { url: 'http://sbi-kyc.top/x', host: 'sbi-kyc.top', registrableDomain: 'sbi-kyc.top', tld: 'top', risk: 80, reasons: [] },
        ],
        upiIds: [{ vpa: 'refund.help@ybl', handle: 'ybl', risk: 70, reasons: [] }],
        upiRequests: [],
        phones: [{ raw: '98111 22233', e164: '+919811122233', risk: 40, reasons: [] }],
        emails: ['kyc@sbi-kyc.top'],
        amounts: [],
      },
    });
    expect(communityQueries(verdict)).toEqual([
      { kind: 'domain', value: 'sbi-kyc.top' },
      { kind: 'upi', value: 'refund.help@ybl' },
      { kind: 'phone', value: '+919811122233' },
      { kind: 'email', value: 'kyc@sbi-kyc.top' },
    ]);
  });

  it('fetches without cookies or referrer', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ prefix: 'abcde', entries: [] }), { status: 200 }));
    await fetchRange('https://ruko.example.app', 'abcde', fetchImpl as unknown as typeof fetch);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://ruko.example.app/api/v1/range/abcde');
    expect(init.credentials).toBe('omit');
    expect(init.referrerPolicy).toBe('no-referrer');
  });
});

describe('lookupCommunity (background)', () => {
  beforeEach(() => clearCommunityCache());

  it('sends nothing at all while lookups are off (the default)', async () => {
    const fetchImpl = vi.fn();
    const results = await lookupCommunity([{ kind: 'upi', value: 'refund.help@ybl' }], { ...DEFAULT_SETTINGS }, fetchImpl as unknown as typeof fetch);
    expect(results).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('sends only a 5-character hash prefix and matches the suffix on the device', async () => {
    const hash = await identifierHash('upi', 'refund.help@ybl');
    const { prefix, suffix } = splitHash(hash);
    const fetchImpl = vi.fn(async (url: string) => {
      expect(url.endsWith(`/api/v1/range/${prefix}`)).toBe(true);
      expect(url).not.toContain(suffix);
      expect(url).not.toContain('refund');
      return new Response(JSON.stringify({ prefix, entries: [{ suffix, reports: 12, categories: ['fake_refund'] }, { suffix: '0'.repeat(59), reports: 50, categories: [] }] }));
    });
    const settings = { ...DEFAULT_SETTINGS, community: true, communityApiUrl: 'https://ruko.example.app' };
    const results = await lookupCommunity([{ kind: 'upi', value: 'refund.help@ybl' }], settings, fetchImpl as unknown as typeof fetch);
    expect(results).toEqual([{ kind: 'upi', value: 'refund.help@ybl', reports: 12, categories: ['fake_refund'], lastReportedAt: undefined }]);
    // Same prefix again: served from cache.
    await lookupCommunity([{ kind: 'upi', value: 'refund.help@ybl' }], settings, fetchImpl as unknown as typeof fetch);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('treats network errors as "no reports"', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('offline');
    });
    const settings = { ...DEFAULT_SETTINGS, community: true, communityApiUrl: 'https://ruko.example.app' };
    expect(await lookupCommunity([{ kind: 'phone', value: '+919811122233' }], settings, fetchImpl as unknown as typeof fetch)).toEqual([]);
  });
});
