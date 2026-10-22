import type { Locale } from '@ruko/engine';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { ta, type AppKey } from '../shared/i18n/app';
import type { Params } from '../shared/i18n/format';
import { ti, type InpageKey } from '../shared/i18n/inpage';

interface I18n {
  locale: Locale;
  t: (key: AppKey, params?: Params) => string;
  ti: (key: InpageKey, params?: Params) => string;
}

const I18nContext = createContext<I18n>({
  locale: 'en',
  t: (key, params) => ta('en', key, params),
  ti: (key, params) => ti('en', key, params),
});

/** Provides strings for the chosen language and keeps <html lang> in sync (screen readers, fonts). */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo<I18n>(
    () => ({
      locale,
      t: (key, params) => ta(locale, key, params),
      ti: (key, params) => ti(locale, key, params),
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
