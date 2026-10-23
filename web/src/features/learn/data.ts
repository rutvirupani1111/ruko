import type { CategoryInfo, ScamCategory } from '@ruko/engine';
import { baseLocale, type BaseLocale, type Locale } from '@/i18n/core';
import { CATEGORY_ORDER } from '@/data/categories';

export interface LocalizedCategory {
  id: ScamCategory;
  name: string;
  /** The name in the other language (shown small, with its own lang attribute). */
  altName: string;
  altLang: BaseLocale;
  short: string;
  howItWorks: string[];
  redFlags: string[];
  whatToDo: string[];
  severity: CategoryInfo['severity'];
  /** Lower-cased text in both languages, for search. */
  haystack: string;
}

/** Categories from the engine in display order; unknown extras go last, 'other' is left out. */
export function orderedCategories(all: Record<string, CategoryInfo> | undefined): CategoryInfo[] {
  if (!all) return [];
  const known = CATEGORY_ORDER.map((id) => all[id]).filter((c): c is CategoryInfo => !!c);
  const extras = Object.values(all).filter((c) => c && c.id !== 'other' && !CATEGORY_ORDER.includes(c.id as never));
  return [...known, ...extras];
}

export function localize(info: CategoryInfo, locale: Locale): LocalizedCategory {
  // Category text comes from the engine (English and Hindi); Marathi reads Hindi, Gujarati English.
  const hi = baseLocale(locale) === 'hi';
  return {
    id: info.id,
    name: hi ? info.nameHi : info.name,
    altName: hi ? info.name : info.nameHi,
    altLang: hi ? 'en' : 'hi',
    short: hi ? info.shortHi : info.short,
    howItWorks: (hi ? info.howItWorksHi : info.howItWorks) ?? [],
    redFlags: (hi ? info.redFlagsHi : info.redFlags) ?? [],
    whatToDo: (hi ? info.whatToDoHi : info.whatToDo) ?? [],
    severity: info.severity,
    haystack: [
      info.id.replace(/_/g, ' '),
      info.name,
      info.nameHi,
      info.short,
      info.shortHi,
      ...(info.redFlags ?? []),
      ...(info.redFlagsHi ?? []),
      ...(info.howItWorks ?? []),
      ...(info.howItWorksHi ?? []),
    ]
      .join(' \n ')
      .toLowerCase(),
  };
}

/** Every word of the query must appear somewhere (English or Hindi). */
export function matches(category: LocalizedCategory, query: string): boolean {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return words.every((w) => category.haystack.includes(w));
}
