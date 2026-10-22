import type { Locale } from '../types';
import { en, type MessageKey } from './en';
import { hi } from './hi';

export type { MessageKey } from './en';

/** Look up a localized string and fill {placeholders}. */
export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const table: Record<string, string> = locale === 'hi' ? hi : en;
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
