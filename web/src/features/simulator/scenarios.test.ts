import { describe, expect, it } from 'vitest';
import { CATEGORY_ORDER } from '@/data/categories';
import { LEVELS, SCENARIOS, contentText, scenariosForLevel, senderText } from './scenarios';

describe('Spot the scam scenarios', () => {
  it('has at least 18 scenarios: 12+ scams and 6+ genuine', () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(18);
    expect(SCENARIOS.filter((s) => s.isScam).length).toBeGreaterThanOrEqual(12);
    expect(SCENARIOS.filter((s) => !s.isScam).length).toBeGreaterThanOrEqual(6);
  });

  it('covers every channel and many scam categories', () => {
    const channels = new Set(SCENARIOS.map((s) => s.channel));
    expect([...channels].sort()).toEqual(['call', 'email', 'payment', 'sms', 'whatsapp']);
    const categories = new Set(SCENARIOS.filter((s) => s.isScam).map((s) => s.category));
    expect(categories.size).toBeGreaterThanOrEqual(12);
    for (const c of categories) expect(CATEGORY_ORDER).toContain(c);
  });

  it('has unique ids and balanced levels with both kinds in each', () => {
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(SCENARIOS.length);
    for (const level of LEVELS) {
      const list = scenariosForLevel(level);
      expect(list.length).toBeGreaterThanOrEqual(6);
      expect(list.some((s) => s.isScam)).toBe(true);
      expect(list.some((s) => !s.isScam)).toBe(true);
    }
  });

  it('scams name a category; genuine ones do not', () => {
    for (const s of SCENARIOS) {
      if (s.isScam) expect(s.category, s.id).toBeTruthy();
      else expect(s.category, s.id).toBeUndefined();
    }
  });

  for (const locale of ['en', 'hi'] as const) {
    it(`every ${locale} flag phrase appears in its scenario`, () => {
      for (const s of SCENARIOS) {
        const c = s[locale];
        expect(c.flags.length, `${s.id} ${locale} flags`).toBeGreaterThanOrEqual(2);
        expect(c.explain.trim(), s.id).not.toBe('');
        expect(c.tip.trim(), s.id).not.toBe('');
        const content = contentText(s, locale);
        const sender = senderText(s, locale);
        for (const flag of c.flags) {
          if (flag.on === 'pay') {
            expect(s.channel, `${s.id}: pay flag outside a payment`).toBe('payment');
            continue;
          }
          const haystack = flag.on === 'sender' ? sender : content;
          expect(haystack.includes(flag.phrase), `${s.id} [${locale}] missing "${flag.phrase}"`).toBe(true);
          expect(flag.why.trim().length, `${s.id} why`).toBeGreaterThan(10);
        }
      }
    });
  }

  it('channel-specific content is present in both languages', () => {
    for (const s of SCENARIOS) {
      for (const c of [s.en, s.hi]) {
        if (s.channel === 'whatsapp' || s.channel === 'sms') expect(c.messages?.length, s.id).toBeGreaterThan(0);
        if (s.channel === 'email') {
          expect(c.subject, s.id).toBeTruthy();
          expect(c.body?.length, s.id).toBeGreaterThan(0);
          expect(s.sender.email, s.id).toBeTruthy();
        }
        if (s.channel === 'call') expect(c.lines?.length, s.id).toBeGreaterThan(0);
        if (s.channel === 'payment') {
          expect(c.note, s.id).toBeTruthy();
          expect(s.amount, s.id).toBeGreaterThan(0);
          expect(s.sender.vpa, s.id).toContain('@');
        }
      }
    }
  });

  it('Hindi copy is actually Hindi and UI copy has no em dashes', () => {
    for (const s of SCENARIOS) {
      expect(/[ऀ-ॿ]/.test(s.hi.explain), `${s.id} hi explain`).toBe(true);
      const all = JSON.stringify([s.en, s.hi]);
      expect(all.includes('—'), `${s.id} has an em dash`).toBe(false);
    }
  });
});
