import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PREF, readPref, writePref } from './storage';

export type ThemePref = 'system' | 'light' | 'dark';

interface ThemeState {
  pref: ThemePref;
  dark: boolean;
  setPref: (pref: ThemePref) => void;
}

const ThemeContext = createContext<ThemeState>({ pref: 'system', dark: false, setPref: () => {} });

const darkQuery = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null);

function readThemePref(): ThemePref {
  const saved = readPref(PREF.theme);
  return saved === 'light' || saved === 'dark' ? saved : 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(readThemePref);
  const [systemDark, setSystemDark] = useState(() => darkQuery()?.matches ?? false);

  useEffect(() => {
    const mq = darkQuery();
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const dark = pref === 'dark' || (pref === 'system' && systemDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    // Keep the browser chrome (address bar, status bar) in step with the page.
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      if (pref === 'system') {
        meta.content = meta.media.includes('dark') ? '#0B1020' : '#FBF8F2';
      } else {
        meta.content = dark ? '#0B1020' : '#FBF8F2';
      }
    });
  }, [dark, pref]);

  const setPref = useCallback((next: ThemePref) => {
    setPrefState(next);
    writePref(PREF.theme, next === 'system' ? null : next);
  }, []);

  const value = useMemo(() => ({ pref, dark, setPref }), [pref, dark, setPref]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  return useContext(ThemeContext);
}
