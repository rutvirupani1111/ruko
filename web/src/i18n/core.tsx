import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PREF, writePref } from '@/lib/storage';

export type Locale = 'en' | 'hi';
export const LOCALES: readonly Locale[] = ['en', 'hi'];

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
  en: Shape<T>;
  hi: Shape<T>;
}

/** Declare UI copy for both languages side by side. English is the source of truth for keys. */
export function defineStrings<T extends StringTree>(en: T, hi: Shape<T>): Dict<T> {
  return { en: en as unknown as Shape<T>, hi };
}

interface LocaleState {
  locale: Locale;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleState>({ locale: 'en', setLocale: () => {} });

function initialLocale(): Locale {
  if (typeof document === 'undefined') return 'en';
  return document.documentElement.lang === 'hi' ? 'hi' : 'en';
}

export function LocaleProvider({ children, initial }: { children: ReactNode; initial?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(() => initial ?? initialLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writePref(PREF.locale, next);
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
  return dict[locale];
}

/** BCP 47 tag for Intl and speech APIs. */
export function bcp47(locale: Locale): string {
  return locale === 'hi' ? 'hi-IN' : 'en-IN';
}

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(bcp47(locale), options).format(value);
}

export function formatInr(value: number, locale: Locale): string {
  return new Intl.NumberFormat(bcp47(locale), {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
