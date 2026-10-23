import type { BundleKey, Dict } from './core';
import type { common } from './common';
import type { aboutStrings } from '@/features/about/strings';
import type { checkStrings } from '@/features/check/strings';
import type { helpStrings } from '@/features/help/strings';
import type { learnStrings } from '@/features/learn/strings';
import type { privacyStrings } from '@/features/privacy/strings';
import type { reportStrings } from '@/features/report/strings';
import type { simStrings } from '@/features/simulator/strings';
import type { notFoundStrings } from '@/features/notfound/NotFoundPage';
import type { chromeAiStrings } from '@/components/verdict/ChromeAiTools';

/** The English tree of a dictionary: every other language must match its shape. */
type Tree<D> = D extends Dict<infer T> ? Dict<T>['en'] : never;

/**
 * Everything a lazily loaded UI language (Gujarati, Marathi) must provide.
 * Type-only imports: the English/Hindi copy is not pulled into the bundles.
 */
export interface LocaleBundle {
  common: Tree<typeof common>;
  about: Tree<typeof aboutStrings>;
  check: Tree<typeof checkStrings>;
  help: Tree<typeof helpStrings>;
  learn: Tree<typeof learnStrings>;
  privacy: Tree<typeof privacyStrings>;
  report: Tree<typeof reportStrings>;
  simulator: Tree<typeof simStrings>;
  notFound: Tree<typeof notFoundStrings>;
  chromeAi: Tree<typeof chromeAiStrings>;
}

/** Compile-time check that every bundle slot is a known dictionary id and vice versa. */
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export const bundleKeysMatch: Exact<keyof LocaleBundle, BundleKey> = true;

/** Core half (shell + checker + help) and pages half, so each can be written and reviewed separately. */
export type CoreBundle = Pick<LocaleBundle, 'common' | 'check' | 'help' | 'chromeAi' | 'notFound'>;
export type PagesBundle = Pick<LocaleBundle, 'about' | 'learn' | 'privacy' | 'report' | 'simulator'>;
