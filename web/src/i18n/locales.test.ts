import { describe, expect, it } from 'vitest';
import { baseLocale, formatInr, isLocaleLoaded, loadLocale, pick } from './core';
import { common } from './common';
import gu from './locales/gu';
import mr from './locales/mr';
import { aboutStrings } from '@/features/about/strings';
import { checkStrings } from '@/features/check/strings';
import { helpStrings } from '@/features/help/strings';
import { learnStrings } from '@/features/learn/strings';
import { privacyStrings } from '@/features/privacy/strings';
import { reportStrings } from '@/features/report/strings';
import { simStrings } from '@/features/simulator/strings';
import { notFoundStrings } from '@/features/notfound/NotFoundPage';
import { chromeAiStrings } from '@/components/verdict/ChromeAiTools';

const DICTS = [common, aboutStrings, checkStrings, helpStrings, learnStrings, privacyStrings, reportStrings, simStrings, notFoundStrings, chromeAiStrings];

/** Every leaf path with its kind, so shapes can be compared at runtime too. */
function shape(tree: unknown, prefix = ''): string[] {
  if (typeof tree === 'function') return [`${prefix}:fn${tree.length}`];
  if (typeof tree === 'string') return [`${prefix}:str`];
  if (Array.isArray(tree)) return [`${prefix}:arr${tree.length}`];
  return Object.entries(tree as Record<string, unknown>).flatMap(([k, v]) => shape(v, `${prefix}.${k}`));
}

describe.each([
  ['gu', gu, /[઀-૿]/],
  ['mr', mr, /[ऀ-ॿ]/],
] as const)('%s bundle', (code, bundle, script) => {
  it.each(DICTS.map((d) => [d.id, d] as const))('%s matches the English shape and is written in its own script', (id, dict) => {
    const tree = (bundle as unknown as Record<string, unknown>)[id];
    expect(tree, `${code}.${id}`).toBeTruthy();
    expect(shape(tree).sort()).toEqual(shape(dict.en).sort());
    expect(script.test(JSON.stringify(tree)), `${code}.${id} script`).toBe(true);
  });
});

describe('locale plumbing', () => {
  it('maps Marathi to Hindi and Gujarati to English for engine text', () => {
    expect(baseLocale('en')).toBe('en');
    expect(baseLocale('hi')).toBe('hi');
    expect(baseLocale('mr')).toBe('hi');
    expect(baseLocale('gu')).toBe('en');
  });

  it('falls back to the base language until a bundle loads, then uses it', async () => {
    if (!isLocaleLoaded('gu')) expect(pick(common, 'gu').nav.check).toBe(common.en.nav.check);
    await loadLocale('gu');
    await loadLocale('mr');
    expect(pick(common, 'gu').nav.check).toBe(gu.common.nav.check);
    expect(pick(common, 'mr').nav.check).toBe(mr.common.nav.check);
    expect(pick(common, 'hi')).toBe(common.hi);
  });

  it('keeps Western digits in every language', () => {
    expect(formatInr(25000, 'mr')).toMatch(/25,000/);
    expect(formatInr(25000, 'gu')).toMatch(/25,000/);
  });
});
