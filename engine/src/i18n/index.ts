import type { Locale } from '../types';
import { en, type MessageKey } from './en';
import { HI } from './hi';

export type { MessageKey } from './en';

let hiTable: Record<string, string> | null = null;

/** The Hindi table keyed like `en` (hi.ts stores the values only, in en's key order). Built once. */
export function hiStrings(): Record<string, string> {
  if (!hiTable) {
    hiTable = {};
    const keys = Object.keys(en);
    for (let i = 0; i < keys.length; i++) {
      const v = HI[i];
      if (v !== undefined) hiTable[keys[i] as string] = v;
    }
  }
  return hiTable;
}

/** Look up a localized string and fill {placeholders}. */
export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const table: Record<string, string> = locale === 'hi' ? hiStrings() : en;
  let s = table[key] ?? en[key];
  if (vars) {
    s = s.replace(/\{(\w+)\}/g, (m, name: string) => {
      const v = vars[name];
      return v === undefined ? m : String(v);
    });
  }
  return s;
}

/** Pick the string for a locale from an [en, hi] pair. */
export function pick(locale: Locale, pair: readonly [string, string]): string {
  return locale === 'hi' ? pair[1] : pair[0];
}
