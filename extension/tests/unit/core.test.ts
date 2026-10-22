import type { Signal } from '@ruko/engine';
import { describe, expect, it } from 'vitest';
import { cyrb53, textKey } from '../../src/shared/hash';
import { buildSegments } from '../../src/shared/highlight';
import { Lru } from '../../src/shared/lru';
import { isRukoRequest } from '../../src/shared/messages';
import { isPlaceholder, LINKS, SUPPORT, SUPPORT_PLACEHOLDERS } from '../../src/config';

const signal = (id: string, weight: number, spans: Array<[number, number, string]>): Signal => ({
  id,
  category: 'kyc_update',
  weight,
  title: id,
  detail: '',
  spans: spans.map(([start, end, text]) => ({ start, end, text })),
});

describe('hash', () => {
  it('is stable and sensitive to every part', () => {
    expect(cyrb53('ruko')).toBe(cyrb53('ruko'));
    expect(cyrb53('ruko')).not.toBe(cyrb53('Ruko'));
    expect(textKey('en', 'whatsapp', 'A', 'hi')).not.toBe(textKey('hi', 'whatsapp', 'A', 'hi'));
    expect(textKey('a', 'bc')).not.toBe(textKey('ab', 'c'));
  });
});

describe('Lru', () => {
  it('evicts the least recently used entry', () => {
    const lru = new Lru<string, number>(2);
    lru.set('a', 1).set('b', 2);
    expect(lru.get('a')).toBe(1);
    lru.set('c', 3);
    expect(lru.has('b')).toBe(false);
    expect(lru.has('a')).toBe(true);
    expect(lru.size).toBe(2);
    expect(() => new Lru(0)).toThrow();
  });
});

describe('buildSegments (highlighter)', () => {
  const text = 'Your KYC is pending. Account blocked today. Click link';

  it('splits text into marked and plain parts', () => {
    const segments = buildSegments(text, [signal('kyc', 40, [[5, 20, 'KYC is pending.']])]);
    expect(segments.map((s) => s.text).join('')).toBe(text);
    expect(segments.find((s) => s.signalId === 'kyc')?.text).toBe('KYC is pending.');
  });

  it('gives overlaps to the heavier signal and ignores reassuring ones', () => {
    const segments = buildSegments(text, [
      signal('light', 10, [[0, 20, 'Your KYC is pending.']]),
      signal('heavy', 60, [[5, 8, 'KYC']]),
      signal('good', -20, [[21, 28, 'Account']]),
    ]);
    expect(segments.find((s) => s.text === 'KYC')?.signalId).toBe('heavy');
    expect(segments.some((s) => s.signalId === 'good')).toBe(false);
    expect(segments.map((s) => s.text).join('')).toBe(text);
  });

  it('recovers spans whose indices drifted (e.g. after normalisation)', () => {
    const segments = buildSegments(text, [signal('blocked', 30, [[0, 7, 'blocked today']])]);
    expect(segments.find((s) => s.signalId === 'blocked')?.text).toBe('blocked today');
  });

  it('returns nothing for empty text', () => {
    expect(buildSegments('', [])).toEqual([]);
  });
});

describe('messages', () => {
  it('accepts only known request types', () => {
    expect(isRukoRequest({ type: 'analyze', items: [], locale: 'en' })).toBe(true);
    expect(isRukoRequest({ type: 'steal-cookies' })).toBe(false);
    expect(isRukoRequest(null)).toBe(false);
    expect(isRukoRequest('analyze')).toBe(false);
  });
});

describe('config', () => {
  it('marks every support value that is still a placeholder', () => {
    for (const key of Object.keys(SUPPORT_PLACEHOLDERS) as Array<keyof typeof SUPPORT>) {
      expect(isPlaceholder(key)).toBe(SUPPORT[key] === SUPPORT_PLACEHOLDERS[key]);
    }
  });

  it('points emergency actions at the official helplines', () => {
    expect(LINKS.helpline).toBe('tel:1930');
    expect(LINKS.cybercrime).toBe('https://cybercrime.gov.in');
    expect(LINKS.chakshu).toBe('https://sancharsaathi.gov.in/sfc/');
  });
});
