import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PREF, writePref } from '@/lib/storage';

export type Locale = 'en' | 'hi' | 'gu' | 'mr';
export const LOCALES: readonly Locale[] = ['en', 'hi', 'gu', 'mr'];

/** Languages the engine, scenarios and long-form content are written in. */
export type BaseLocale = 'en' | 'hi';
/** Locales whose UI strings live in a lazily loaded bundle (src/i18n/locales). */
export type BundledLocale = Exclude<Locale, BaseLocale>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * The language detailed, engine-written text is shown in. The engine speaks
 * English and Hindi only: Marathi readers get Hindi (same Devanagari script,
 * widely read), Gujarati readers get English.
 */
export function baseLocale(locale: Locale): BaseLocale {
  return locale === 'hi' || locale === 'mr' ? 'hi' : 'en';
}

/** Keys of the per-locale bundles; each `defineStrings` call names its slot. */
export type BundleKey =
  | 'common'
  | 'about'
  | 'check'
  | 'help'
  | 'learn'
  | 'privacy'
  | 'report'
  | 'simulator'
  | 'notFound'
  | 'chromeAi';

type LoadedBundle = Partial<Record<BundleKey, unknown>>;
const bundles: Partial<Record<BundledLocale, LoadedBundle>> = {};
const pending: Partial<Record<BundledLocale, Promise<void>>> = {};

/** Fetch a Gujarati or Marathi string bundle (code-split; cached by the service worker). */
export function loadLocale(locale: Locale): Promise<void> {
  if (locale === 'en' || locale === 'hi' || bundles[locale]) return Promise.resolve();
  if (!pending[locale]) {
    const load = locale === 'gu' ? import('./locales/gu') : import('./locales/mr');
    pending[locale] = load.then(
      (mod) => {
        bundles[locale] = mod.default as unknown as LoadedBundle;
      },
      (error: unknown) => {
        delete pending[locale];
        throw error;
      },
    );
  }
  return pending[locale];
}

export function isLocaleLoaded(locale: Locale): boolean {
  return locale === 'en' || locale === 'hi' || !!bundles[locale];
}

type Leaf = string | ((...args: never[]) => string);
export interface StringTree {
  readonly [key: string]: Leaf | StringTree | readonly string[];
}

/** Same keys as the English tree; Hindi must provide every one of them (checked by the compiler). */
export type Shape<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly string[]
      ? readonly string[]
      : T[K] extends (...args: infer A) => string
        ? (...args: A) => string
        : Shape<T[K]>;
};

export interface Dict<T> {
  /** Slot in the Gujarati/Marathi bundles (src/i18n/locales). */
  id: BundleKey;
  en: Shape<T>;
  hi: Shape<T>;
}

/**
 * Declare UI copy for English and Hindi side by side. English is the source of
 * truth for keys; Gujarati and Marathi provide the same shape in their lazily
 * loaded bundles under `id` (checked by the compiler in src/i18n/bundle.ts).
 */
export function defineStrings<T extends StringTree>(id: BundleKey, en: T, hi: Shape<T>): Dict<T> {
  return { id, en: en as unknown as Shape<T>, hi };
}

/** Strings for any locale. Gujarati/Marathi fall back to their base language until the bundle is loaded. */
export function pick<T>(dict: Dict<T>, locale: Locale): Shape<T> {
  if (locale === 'en' || locale === 'hi') return dict[locale];
  const tree = bundles[locale]?.[dict.id] as Shape<T> | undefined;
  return tree ?? dict[baseLocale(locale)];
}

interface LocaleState {
  locale: Locale;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleState>({ locale: 'en', setLocale: () => {} });

function initialLocale(): Locale {
  if (typeof document === 'undefined') return 'en';
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : 'en';
}

export function LocaleProvider({ children, initial }: { children: ReactNode; initial?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(() => initial ?? initialLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    writePref(PREF.locale, next);
    // Switch once the bundle is here, so the page never flashes the fallback language.
    // Offline with an uncached bundle: switch anyway and show the base language.
    void loadLocale(next)
      .catch(() => undefined)
      .then(() => setLocaleState(next));
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleState {
  return useContext(LocaleContext);
}

/** Pick the current language's strings from a dictionary. */
export function useT<T>(dict: Dict<T>): Shape<T> {
  const { locale } = useLocale();
  return pick(dict, locale);
}

/** BCP 47 tag for Intl and speech APIs. */
export function bcp47(locale: Locale): string {
  return `${locale}-IN`;
}

/** Native name of each language, written in its own script. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી',
  mr: 'मराठी',
};

/**
 * Intl formatter that keeps Western digits in every language (Marathi defaults
 * to Devanagari digits, which would not match 1930 and the rest of the copy).
 */
export function numberFormat(locale: Locale, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  return new Intl.NumberFormat(bcp47(locale), { numberingSystem: 'latn', ...options });
}

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return numberFormat(locale, options).format(value);
}

export function formatInr(value: number, locale: Locale): string {
  return numberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
